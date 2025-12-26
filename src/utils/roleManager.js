/**
 * Dynamic Role Management System
 * Makes it easy to add new roles without modifying core files
 *
 * HOW TO ADD A NEW ROLE:
 * 1. Add role configuration to ROLE_REGISTRY below
 * 2. Create dashboard component (optional)
 * 3. Add user credentials to AuthContext USER_DATABASE
 *
 * That's it! No other files need modification.
 */

import { PERMISSIONS } from '../contexts/RBACConfig';

/**
 * ROLE REGISTRY
 * Central place to define all roles in the system
 * Adding a new role is as simple as adding an entry here
 */
export const ROLE_REGISTRY = {
  patient: {
    id: 'patient',
    name: 'Patient',
    nameAr: 'مريض',
    description: 'Elderly patient receiving care',
    level: 1,
    color: '#3B82F6', // Blue
    icon: 'user',
    dashboardPath: '/patient',
    dashboardComponent: 'PatientDashboard',
    permissions: [
      // Data Access
      PERMISSIONS.VIEW_OWN_DATA.id,
      PERMISSIONS.VIEW_HEALTH_METRICS.id,
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.VIEW_OWN_APPOINTMENTS.id,
      PERMISSIONS.VIEW_FINANCIAL_DATA.id,

      // Data Modification
      PERMISSIONS.EDIT_OWN_PROFILE.id,
      PERMISSIONS.MANAGE_OWN_MEDICATIONS.id,

      // Feature Access
      PERMISSIONS.BOOK_APPOINTMENTS.id,
      PERMISSIONS.CANCEL_APPOINTMENTS.id,
      PERMISSIONS.REQUEST_EQUIPMENT.id,
      PERMISSIONS.VIEW_ALERTS.id,

      // Financial
      PERMISSIONS.PROCESS_PAYMENTS.id,
      PERMISSIONS.VIEW_BILLING.id
    ],
    routes: ['/patient/*'],
    allowedFeatures: [
      'dashboard.view',
      'medications.view',
      'medications.add',
      'appointments.view',
      'appointments.book',
      'equipment.request',
      'equipment.marketplace',
      'alerts.view'
    ]
  },

  doctor: {
    id: 'doctor',
    name: 'Doctor',
    nameAr: 'طبيب',
    description: 'Medical professional providing care',
    level: 3,
    color: '#10B981', // Green
    icon: 'stethoscope',
    dashboardPath: '/doctor',
    dashboardComponent: 'DoctorDashboard',
    permissions: [
      // Data Access
      PERMISSIONS.VIEW_ALL_PATIENTS.id,
      PERMISSIONS.VIEW_MEDICAL_RECORDS.id,
      PERMISSIONS.VIEW_HEALTH_METRICS.id,
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.VIEW_FINANCIAL_DATA.id,

      // Data Modification
      PERMISSIONS.EDIT_OWN_PROFILE.id,
      PERMISSIONS.EDIT_PATIENT_DATA.id,

      // Clinical Operations
      PERMISSIONS.ADD_CLINICAL_NOTES.id,
      PERMISSIONS.VIEW_CLINICAL_NOTES.id,
      PERMISSIONS.EDIT_CLINICAL_NOTES.id,
      PERMISSIONS.PRESCRIBE_MEDICATIONS.id,
      PERMISSIONS.MODIFY_PRESCRIPTIONS.id,
      PERMISSIONS.ORDER_TESTS.id,
      PERMISSIONS.VIEW_TEST_RESULTS.id,

      // Appointments
      PERMISSIONS.VIEW_OWN_APPOINTMENTS.id,
      PERMISSIONS.MANAGE_ALL_APPOINTMENTS.id,
      PERMISSIONS.BOOK_APPOINTMENTS.id,
      PERMISSIONS.CANCEL_APPOINTMENTS.id,

      // Financial
      PERMISSIONS.GENERATE_INVOICES.id,
      PERMISSIONS.VIEW_BILLING.id,

      // Charity Centre
      PERMISSIONS.VIEW_MARKETPLACE.id,
      PERMISSIONS.MAKE_DONATIONS.id,
      PERMISSIONS.VIEW_DONATION_HISTORY.id,
      PERMISSIONS.PROCESS_PAYMENTS.id
    ],
    routes: ['/doctor/*'],
    allowedFeatures: [
      'dashboard.view',
      'medications.view',
      'medications.prescribe',
      'appointments.view',
      'appointments.manage',
      'clinical.notes.add',
      'clinical.notes.view',
      'equipment.marketplace',
      'equipment.donate'
    ]
  },

  family: {
    id: 'family',
    name: 'Family Member',
    nameAr: 'فرد من العائلة',
    description: 'Family member monitoring patient care',
    level: 2,
    color: '#F59E0B', // Amber
    icon: 'users',
    dashboardPath: '/family',
    dashboardComponent: 'FamilyDashboard',
    permissions: [
      // Data Access (limited)
      PERMISSIONS.VIEW_ASSIGNED_PATIENTS.id,
      PERMISSIONS.VIEW_HEALTH_METRICS.id,
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.VIEW_OWN_APPOINTMENTS.id,

      // Data Modification
      PERMISSIONS.EDIT_OWN_PROFILE.id,

      // Care Management
      PERMISSIONS.VIEW_CARE_TASKS.id,
      PERMISSIONS.CREATE_CARE_TASKS.id,
      PERMISSIONS.COMPLETE_CARE_TASKS.id,
      PERMISSIONS.DELETE_CARE_TASKS.id,

      // Alerts
      PERMISSIONS.VIEW_ALERTS.id,
      PERMISSIONS.RESPOND_TO_ALERTS.id,

      // Limited Clinical
      PERMISSIONS.VIEW_CLINICAL_NOTES.id,
      PERMISSIONS.VIEW_TEST_RESULTS.id,

      // Charity Centre
      PERMISSIONS.VIEW_MARKETPLACE.id,
      PERMISSIONS.MAKE_DONATIONS.id,
      PERMISSIONS.VIEW_DONATION_HISTORY.id,
      PERMISSIONS.PROCESS_PAYMENTS.id
    ],
    routes: ['/family/*'],
    allowedFeatures: [
      'dashboard.view',
      'tasks.view',
      'tasks.create',
      'tasks.complete',
      'alerts.view',
      'alerts.respond',
      'equipment.marketplace',
      'equipment.donate'
    ]
  },

  admin: {
    id: 'admin',
    name: 'Administrator',
    nameAr: 'مسؤول',
    description: 'System administrator with full access',
    level: 5,
    color: '#EF4444', // Red
    icon: 'shield',
    dashboardPath: '/admin',
    dashboardComponent: 'AdminDashboard',
    permissions: Object.keys(PERMISSIONS).map(key => PERMISSIONS[key].id),
    routes: ['*'],
    allowedFeatures: ['*']
  },

  /**
   * EXAMPLE: How to add a new "Nurse" role
   * Uncomment the block below to add nurse role
   */
  /*
  nurse: {
    id: 'nurse',
    name: 'Nurse',
    nameAr: 'ممرضة',
    description: 'Nursing staff providing patient care',
    level: 2,
    color: '#8B5CF6', // Purple
    icon: 'heart-pulse',
    dashboardPath: '/nurse',
    dashboardComponent: 'NurseDashboard',
    permissions: [
      // Data Access
      PERMISSIONS.VIEW_ASSIGNED_PATIENTS.id,
      PERMISSIONS.VIEW_MEDICAL_RECORDS.id,
      PERMISSIONS.VIEW_HEALTH_METRICS.id,
      PERMISSIONS.VIEW_MEDICATIONS.id,

      // Data Modification
      PERMISSIONS.EDIT_OWN_PROFILE.id,
      PERMISSIONS.EDIT_PATIENT_DATA.id,

      // Clinical Operations (limited)
      PERMISSIONS.ADD_CLINICAL_NOTES.id,
      PERMISSIONS.VIEW_CLINICAL_NOTES.id,
      PERMISSIONS.VIEW_TEST_RESULTS.id,

      // Medications (can administer, not prescribe)
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.MANAGE_OWN_MEDICATIONS.id, // For tracking doses given

      // Appointments
      PERMISSIONS.VIEW_OWN_APPOINTMENTS.id,
      PERMISSIONS.BOOK_APPOINTMENTS.id,

      // Alerts
      PERMISSIONS.VIEW_ALERTS.id,
      PERMISSIONS.RESPOND_TO_ALERTS.id,
      PERMISSIONS.CREATE_ALERTS.id
    ],
    routes: ['/nurse/*'],
    allowedFeatures: [
      'dashboard.view',
      'medications.view',
      'appointments.view',
      'clinical.notes.add',
      'clinical.notes.view',
      'alerts.view',
      'alerts.respond'
    ]
  },
  */

  /**
   * EXAMPLE: How to add a new "Pharmacist" role
   */
  /*
  pharmacist: {
    id: 'pharmacist',
    name: 'Pharmacist',
    nameAr: 'صيدلي',
    description: 'Pharmacy staff managing medications',
    level: 2,
    color: '#14B8A6', // Teal
    icon: 'pill',
    dashboardPath: '/pharmacist',
    dashboardComponent: 'PharmacistDashboard',
    permissions: [
      // Medication Focus
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.VIEW_MEDICAL_RECORDS.id, // To check prescriptions
      PERMISSIONS.MODIFY_PRESCRIPTIONS.id, // Can adjust dosages
      PERMISSIONS.VIEW_ASSIGNED_PATIENTS.id,

      // Data Modification
      PERMISSIONS.EDIT_OWN_PROFILE.id,

      // Financial
      PERMISSIONS.VIEW_BILLING.id,
      PERMISSIONS.PROCESS_PAYMENTS.id,
      PERMISSIONS.GENERATE_INVOICES.id
    ],
    routes: ['/pharmacist/*'],
    allowedFeatures: [
      'dashboard.view',
      'medications.view',
      'medications.prescribe'
    ]
  },
  */
};

/**
 * Helper Functions for Dynamic Role Management
 */

/**
 * Get all registered roles
 */
export const getAllRoles = () => {
  return Object.values(ROLE_REGISTRY);
};

/**
 * Get role by ID
 */
export const getRoleById = (roleId) => {
  return ROLE_REGISTRY[roleId] || null;
};

/**
 * Get role permissions
 */
export const getRolePermissions = (roleId) => {
  const role = getRoleById(roleId);
  return role ? role.permissions : [];
};

/**
 * Check if role has permission
 */
export const roleHasPermission = (roleId, permissionId) => {
  const permissions = getRolePermissions(roleId);
  return permissions.includes(permissionId);
};

/**
 * Check if role can access route
 */
export const canAccessRoute = (roleId, route) => {
  const role = getRoleById(roleId);
  if (!role) return false;

  if (role.routes.includes('*')) return true;

  return role.routes.some(allowedRoute => {
    if (allowedRoute.endsWith('/*')) {
      const basePath = allowedRoute.slice(0, -2);
      return route.startsWith(basePath);
    }
    return route === allowedRoute;
  });
};

/**
 * Check if role can access feature
 */
export const canAccessFeature = (roleId, featureId) => {
  const role = getRoleById(roleId);
  if (!role) return false;

  if (role.allowedFeatures.includes('*')) return true;

  return role.allowedFeatures.includes(featureId);
};

/**
 * Get roles by level (for hierarchy)
 */
export const getRolesByLevel = (minLevel, maxLevel = 5) => {
  return getAllRoles().filter(role =>
    role.level >= minLevel && role.level <= maxLevel
  );
};

/**
 * Check if user role can access resource owned by another role
 */
export const canAccessResourceByRole = (userRoleId, resourceOwnerRoleId) => {
  const userRole = getRoleById(userRoleId);
  const resourceOwnerRole = getRoleById(resourceOwnerRoleId);

  if (!userRole || !resourceOwnerRole) return false;

  // Higher level roles can access lower level role resources
  return userRole.level >= resourceOwnerRole.level;
};

/**
 * Generate routes dynamically from role registry
 */
export const generateRoleRoutes = () => {
  const routes = [];

  getAllRoles().forEach(role => {
    if (role.dashboardPath && role.dashboardComponent) {
      routes.push({
        path: role.dashboardPath,
        component: role.dashboardComponent,
        requiredRole: role.id,
        requiredLevel: role.level
      });
    }
  });

  return routes;
};

/**
 * Get role statistics (useful for admin dashboards)
 */
export const getRoleStatistics = () => {
  const roles = getAllRoles();

  return {
    totalRoles: roles.length,
    byLevel: roles.reduce((acc, role) => {
      acc[role.level] = (acc[role.level] || 0) + 1;
      return acc;
    }, {}),
    permissionCounts: roles.map(role => ({
      roleId: role.id,
      roleName: role.name,
      permissionCount: role.permissions.length
    }))
  };
};

/**
 * Validate role configuration
 */
export const validateRoleConfig = (roleConfig) => {
  const errors = [];

  if (!roleConfig.id) errors.push('Role ID is required');
  if (!roleConfig.name) errors.push('Role name is required');
  if (!roleConfig.level || roleConfig.level < 1) errors.push('Valid level is required');
  if (!roleConfig.permissions || !Array.isArray(roleConfig.permissions)) {
    errors.push('Permissions array is required');
  }
  if (!roleConfig.routes || !Array.isArray(roleConfig.routes)) {
    errors.push('Routes array is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * FUTURE: Dynamic role registration from database
 * This function would load roles from a backend API
 */
export const loadRolesFromAPI = async () => {
  // In production, this would fetch from backend:
  // const response = await fetch('/api/roles');
  // const roles = await response.json();
  // return roles;

  // For now, return static registry
  return getAllRoles();
};

/**
 * FUTURE: Save new role to database
 */
export const saveNewRole = async (roleConfig) => {
  const validation = validateRoleConfig(roleConfig);

  if (!validation.valid) {
    throw new Error(`Invalid role configuration: ${validation.errors.join(', ')}`);
  }

  // In production, this would POST to backend:
  // const response = await fetch('/api/roles', {
  //   method: 'POST',
  //   body: JSON.stringify(roleConfig)
  // });
  // return response.json();

  console.log('New role would be saved:', roleConfig);
  return roleConfig;
};

export default {
  ROLE_REGISTRY,
  getAllRoles,
  getRoleById,
  getRolePermissions,
  roleHasPermission,
  canAccessRoute,
  canAccessFeature,
  getRolesByLevel,
  canAccessResourceByRole,
  generateRoleRoutes,
  getRoleStatistics,
  validateRoleConfig,
  loadRolesFromAPI,
  saveNewRole
};
