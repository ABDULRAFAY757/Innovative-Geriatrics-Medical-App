import { createContext, useContext, useState, useEffect } from 'react';
import {
  ROLE_PERMISSIONS,
  PERMISSIONS,
  roleHasPermission,
  getRolePermissions,
  canAccessFeature as checkFeatureAccess
} from './RBACConfig';

const AuthContext = createContext();

/**
 * Attribute-Based Access Control (ABAC) Rules
 * More fine-grained access based on attributes like time, location, resource ownership
 */
const ABAC_RULES = {
  // Patient can only access their own data
  canAccessPatientData: (user, patientId) => {
    if (user.role === 'patient') return user.id === patientId;
    if (user.role === 'doctor') return true; // Doctors can access all patients
    if (user.role === 'family') {
      // Family can only access their assigned patients
      return user.assignedPatients?.includes(patientId);
    }
    if (user.role === 'admin') return true;
    return false;
  },

  // Doctor can only modify appointments they're assigned to
  canModifyAppointment: (user, appointment) => {
    if (!appointment) return false;
    if (user.role === 'doctor') return appointment.doctor_id === user.id;
    if (user.role === 'patient') return appointment.patient_id === user.id;
    if (user.role === 'admin') return true;
    return false;
  },

  // Family can only manage tasks for their assigned patients
  canManageCareTask: (user, task) => {
    if (!task) return false;
    if (user.role === 'family') {
      return user.assignedPatients?.includes(task.patient_id);
    }
    if (user.role === 'admin') return true;
    return false;
  },

  // Time-based access (e.g., doctors can only prescribe during work hours)
  canPrescribeMedication: (user) => {
    if (!roleHasPermission(user.role, PERMISSIONS.PRESCRIBE_MEDICATIONS.id)) {
      return false;
    }
    // For demo, we allow all times. In production, check:
    // const hour = new Date().getHours();
    // return hour >= 8 && hour < 20; // 8 AM to 8 PM
    return true;
  },

  // Resource ownership check
  canDeleteResource: (user, resource) => {
    if (!resource) return false;
    if (user.role === 'admin') return true;
    return resource.created_by === user.id;
  },

  // Can modify clinical notes
  canModifyClinicalNote: (user, note) => {
    if (!note) return false;
    if (user.role === 'admin') return true;
    if (user.role === 'doctor') {
      // Doctors can only modify their own notes
      return note.doctor_id === user.id;
    }
    return false;
  },

  // Can view patient medication list
  canViewPatientMedications: (user, patientId) => {
    if (user.role === 'patient') return user.id === patientId;
    if (user.role === 'doctor') return roleHasPermission(user.role, PERMISSIONS.VIEW_MEDICATIONS.id);
    if (user.role === 'family') {
      return user.assignedPatients?.includes(patientId) &&
             roleHasPermission(user.role, PERMISSIONS.VIEW_MEDICATIONS.id);
    }
    return false;
  },

  // Can book appointment for patient
  canBookAppointmentFor: (user, patientId) => {
    if (user.role === 'patient') return user.id === patientId;
    if (user.role === 'doctor') return roleHasPermission(user.role, PERMISSIONS.BOOK_APPOINTMENTS.id);
    return false;
  }
};

/**
 * Mock user database
 */
const USER_DATABASE = {
  // Patients
  'patient1@elderly.sa': {
    id: '1',
    email: 'patient1@elderly.sa',
    password: 'patient123', // In production: hash with bcrypt
    role: 'patient',
    name: 'أحمد محمد',
    nameEn: 'Ahmed Mohammed',
    verified: true,
    twoFactorEnabled: false,
    lastLogin: null,
    createdAt: '2024-01-15T10:00:00Z'
  },
  'patient2@elderly.sa': {
    id: '2',
    email: 'patient2@elderly.sa',
    password: 'patient123',
    role: 'patient',
    name: 'فاطمة علي',
    nameEn: 'Fatima Ali',
    verified: true,
    twoFactorEnabled: false
  },

  // Doctors
  // Doctors (matching mockData.js doctors)
  'lama@innovativegeriatrics.com': {
    id: '1',
    email: 'lama@innovativegeriatrics.com',
    password: 'Lama@123',
    role: 'doctor',
    name: 'د. لمى الغريني',
    nameEn: 'Dr. Lama Algaraini',
    specialty: 'Geriatrics',
    hospital: 'King Saud Medical City',
    verified: true,
    twoFactorEnabled: false
  },
  'mohamed.hassan@hospital.com': {
    id: '2',
    email: 'mohamed.hassan@hospital.com',
    password: 'Mohamed@123',
    role: 'doctor',
    name: 'د. محمد حسن',
    nameEn: 'Dr. Mohamed Hassan',
    specialty: 'Internal Medicine',
    hospital: 'Riyadh Medical Complex',
    verified: true,
    twoFactorEnabled: false
  },
  'aisha.alsaud@hospital.com': {
    id: '3',
    email: 'aisha.alsaud@hospital.com',
    password: 'Aisha@123',
    role: 'doctor',
    name: 'د. عائشة آل سعود',
    nameEn: 'Dr. Aisha Al-Saud',
    specialty: 'Cardiology',
    hospital: 'King Faisal Specialist Hospital',
    verified: true,
    twoFactorEnabled: false
  },

  // Family Members
  'family1@gmail.com': {
    id: 'f1',
    email: 'family1@gmail.com',
    password: 'family123',
    role: 'family',
    name: 'خالد محمد',
    nameEn: 'Khalid Mohammed',
    relationship: 'Son',
    assignedPatients: ['1'], // Can access patient with id '1'
    verified: true,
    twoFactorEnabled: false
  },
  'family2@gmail.com': {
    id: 'f2',
    email: 'family2@gmail.com',
    password: 'family123',
    role: 'family',
    name: 'نورة عبدالله',
    nameEn: 'Noura Abdullah',
    relationship: 'Daughter',
    assignedPatients: ['2'],
    verified: true,
    twoFactorEnabled: false
  },

  // Admin
  'admin@elderly.sa': {
    id: 'admin1',
    email: 'admin@elderly.sa',
    password: 'admin123',
    role: 'admin',
    name: 'System Administrator',
    nameEn: 'System Administrator',
    verified: true,
    twoFactorEnabled: true
  }
};

/**
 * Authentication Provider with Enhanced RBAC & ABAC
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sessionTimeout, setSessionTimeout] = useState(null);

  // Session timeout duration (30 minutes)
  const SESSION_DURATION = 30 * 60 * 1000;

  useEffect(() => {
    // Check for existing session on mount
    const savedSession = localStorage.getItem('auth_session');
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession);
        const now = Date.now();

        // Check if session is still valid
        if (session.expiresAt > now) {
          setUser(session.user);
          startSessionTimeout(session.expiresAt - now);
        } else {
          // Session expired
          logout();
        }
      } catch (error) {
        console.error('Error loading session:', error);
        logout();
      }
    }
    setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startSessionTimeout = (duration) => {
    if (sessionTimeout) clearTimeout(sessionTimeout);

    const timeout = setTimeout(() => {
      logout();
      alert('Your session has expired. Please login again.');
    }, duration);

    setSessionTimeout(timeout);
  };

  /**
   * Login function with validation
   */
  const login = async (email, password, rememberMe = false) => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 500));

      const userRecord = USER_DATABASE[email];

      if (!userRecord) {
        throw new Error('Invalid email or password');
      }

      // In production: use bcrypt.compare(password, userRecord.passwordHash)
      if (userRecord.password !== password) {
        throw new Error('Invalid email or password');
      }

      if (!userRecord.verified) {
        throw new Error('Please verify your email address before logging in');
      }

      // Create user session (remove sensitive data)
      const { password: _password, ...userData } = userRecord;
      void _password; // Mark as intentionally unused

      const expiresAt = Date.now() + SESSION_DURATION;
      const session = {
        user: userData,
        expiresAt,
        createdAt: Date.now()
      };

      // Save session
      if (rememberMe) {
        localStorage.setItem('auth_session', JSON.stringify(session));
      } else {
        sessionStorage.setItem('auth_session', JSON.stringify(session));
      }

      setUser(userData);
      startSessionTimeout(SESSION_DURATION);

      // Update last login
      userRecord.lastLogin = new Date().toISOString();

      return { success: true, user: userData };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: error.message };
    }
  };

  /**
   * Logout function
   */
  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_session');
    sessionStorage.removeItem('auth_session');
    if (sessionTimeout) clearTimeout(sessionTimeout);
  };

  /**
   * Register new user
   */
  const register = async (userData) => {
    try {
      // Check if email already exists
      if (USER_DATABASE[userData.email]) {
        throw new Error('Email already registered');
      }

      // Create new user (In production: hash password, send verification email)
      const newUser = {
        id: `user_${Date.now()}`,
        ...userData,
        verified: false, // Require email verification
        twoFactorEnabled: false,
        createdAt: new Date().toISOString()
      };

      USER_DATABASE[userData.email] = newUser;

      return {
        success: true,
        message: 'Registration successful! Please check your email to verify your account.'
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  /**
   * Enhanced RBAC: Check if user has specific permission by ID
   */
  const hasPermission = (permissionId) => {
    if (!user) return false;
    return roleHasPermission(user.role, permissionId);
  };

  /**
   * Enhanced RBAC: Check if user can access specific route
   */
  const canAccessRoute = (route) => {
    if (!user) return false;
    const roleConfig = ROLE_PERMISSIONS[user.role];

    if (!roleConfig) return false;
    if (roleConfig.routes?.includes('*')) return true;

    return roleConfig.routes?.some(allowedRoute => {
      if (allowedRoute.endsWith('/*')) {
        const basePath = allowedRoute.slice(0, -2);
        return route.startsWith(basePath);
      }
      return route === allowedRoute;
    });
  };

  /**
   * Enhanced RBAC: Check if user can access feature
   */
  const canAccessFeature = (featureId) => {
    if (!user) return false;
    return checkFeatureAccess(user, featureId);
  };

  /**
   * ABAC: Context-aware permission checking
   */
  const checkAbacRule = (ruleName, ...args) => {
    if (!user) return false;
    const rule = ABAC_RULES[ruleName];
    if (!rule) return false;
    return rule(user, ...args);
  };

  /**
   * Refresh session
   */
  const refreshSession = () => {
    if (!user) return;

    const expiresAt = Date.now() + SESSION_DURATION;
    const session = {
      user,
      expiresAt,
      createdAt: Date.now()
    };

    const storage = localStorage.getItem('auth_session') ? localStorage : sessionStorage;
    storage.setItem('auth_session', JSON.stringify(session));

    startSessionTimeout(SESSION_DURATION);
  };

  /**
   * Get user role permissions list
   */
  const getPermissions = () => {
    if (!user) return [];
    return getRolePermissions(user.role);
  };

  /**
   * Get user role configuration
   */
  const getRoleConfig = () => {
    if (!user) return null;
    return ROLE_PERMISSIONS[user.role];
  };

  const value = {
    // State
    user,
    loading,
    isAuthenticated: !!user,

    // Authentication methods
    login,
    logout,
    register,

    // Enhanced RBAC methods
    hasPermission,
    canAccessRoute,
    canAccessFeature,
    getPermissions,
    getRoleConfig,

    // ABAC methods
    checkAbacRule,

    // Session management
    refreshSession,

    // Utility
    getUserRole: () => user?.role,
    getUserId: () => user?.id,
    getUserName: () => user?.nameEn || user?.name,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

/**
 * Custom hook to use auth context
 */
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export default AuthContext;
