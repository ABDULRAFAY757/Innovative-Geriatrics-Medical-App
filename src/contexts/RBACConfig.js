/**
 * Comprehensive Role-Based Access Control (RBAC) Configuration
 * Defines granular permissions and access rights for each role
 */

/**
 * Permission Categories
 */
export const PERMISSION_CATEGORIES = {
  // Data Access Permissions
  DATA_ACCESS: 'data_access',
  // Data Modification Permissions
  DATA_MODIFICATION: 'data_modification',
  // Feature Access Permissions
  FEATURE_ACCESS: 'feature_access',
  // Administrative Permissions
  ADMIN: 'admin',
  // Clinical Permissions
  CLINICAL: 'clinical',
  // Financial Permissions
  FINANCIAL: 'financial'
};

/**
 * Granular Permissions Matrix
 * Each permission has: id, name, category, description
 */
export const PERMISSIONS = {
  // ========== DATA ACCESS ==========
  VIEW_OWN_DATA: {
    id: 'view_own_data',
    name: 'View Own Data',
    category: PERMISSION_CATEGORIES.DATA_ACCESS,
    description: 'Can view their own personal data'
  },
  VIEW_ASSIGNED_PATIENTS: {
    id: 'view_assigned_patients',
    name: 'View Assigned Patients',
    category: PERMISSION_CATEGORIES.DATA_ACCESS,
    description: 'Can view data of assigned patients only'
  },
  VIEW_ALL_PATIENTS: {
    id: 'view_all_patients',
    name: 'View All Patients',
    category: PERMISSION_CATEGORIES.DATA_ACCESS,
    description: 'Can view all patient records'
  },
  VIEW_MEDICAL_RECORDS: {
    id: 'view_medical_records',
    name: 'View Medical Records',
    category: PERMISSION_CATEGORIES.DATA_ACCESS,
    description: 'Can access detailed medical records'
  },
  VIEW_HEALTH_METRICS: {
    id: 'view_health_metrics',
    name: 'View Health Metrics',
    category: PERMISSION_CATEGORIES.DATA_ACCESS,
    description: 'Can view health metrics and vitals'
  },
  VIEW_FINANCIAL_DATA: {
    id: 'view_financial_data',
    name: 'View Financial Data',
    category: PERMISSION_CATEGORIES.DATA_ACCESS,
    description: 'Can view billing and payment information'
  },

  // ========== DATA MODIFICATION ==========
  EDIT_OWN_PROFILE: {
    id: 'edit_own_profile',
    name: 'Edit Own Profile',
    category: PERMISSION_CATEGORIES.DATA_MODIFICATION,
    description: 'Can update their own profile information'
  },
  EDIT_PATIENT_DATA: {
    id: 'edit_patient_data',
    name: 'Edit Patient Data',
    category: PERMISSION_CATEGORIES.DATA_MODIFICATION,
    description: 'Can modify patient information'
  },
  DELETE_RECORDS: {
    id: 'delete_records',
    name: 'Delete Records',
    category: PERMISSION_CATEGORIES.DATA_MODIFICATION,
    description: 'Can delete data records'
  },

  // ========== MEDICATION MANAGEMENT ==========
  VIEW_MEDICATIONS: {
    id: 'view_medications',
    name: 'View Medications',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can view medication lists'
  },
  MANAGE_OWN_MEDICATIONS: {
    id: 'manage_own_medications',
    name: 'Manage Own Medications',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can track and manage own medications'
  },
  PRESCRIBE_MEDICATIONS: {
    id: 'prescribe_medications',
    name: 'Prescribe Medications',
    category: PERMISSION_CATEGORIES.CLINICAL,
    description: 'Can write and manage prescriptions'
  },
  MODIFY_PRESCRIPTIONS: {
    id: 'modify_prescriptions',
    name: 'Modify Prescriptions',
    category: PERMISSION_CATEGORIES.CLINICAL,
    description: 'Can edit existing prescriptions'
  },

  // ========== APPOINTMENT MANAGEMENT ==========
  VIEW_OWN_APPOINTMENTS: {
    id: 'view_own_appointments',
    name: 'View Own Appointments',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can view their own appointments'
  },
  BOOK_APPOINTMENTS: {
    id: 'book_appointments',
    name: 'Book Appointments',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can schedule new appointments'
  },
  MANAGE_ALL_APPOINTMENTS: {
    id: 'manage_all_appointments',
    name: 'Manage All Appointments',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can view and modify all appointments'
  },
  CANCEL_APPOINTMENTS: {
    id: 'cancel_appointments',
    name: 'Cancel Appointments',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can cancel appointments'
  },

  // ========== CLINICAL OPERATIONS ==========
  ADD_CLINICAL_NOTES: {
    id: 'add_clinical_notes',
    name: 'Add Clinical Notes',
    category: PERMISSION_CATEGORIES.CLINICAL,
    description: 'Can add clinical documentation'
  },
  VIEW_CLINICAL_NOTES: {
    id: 'view_clinical_notes',
    name: 'View Clinical Notes',
    category: PERMISSION_CATEGORIES.CLINICAL,
    description: 'Can read clinical notes'
  },
  EDIT_CLINICAL_NOTES: {
    id: 'edit_clinical_notes',
    name: 'Edit Clinical Notes',
    category: PERMISSION_CATEGORIES.CLINICAL,
    description: 'Can modify clinical notes'
  },
  ORDER_TESTS: {
    id: 'order_tests',
    name: 'Order Tests',
    category: PERMISSION_CATEGORIES.CLINICAL,
    description: 'Can order laboratory tests'
  },
  VIEW_TEST_RESULTS: {
    id: 'view_test_results',
    name: 'View Test Results',
    category: PERMISSION_CATEGORIES.CLINICAL,
    description: 'Can access test results'
  },

  // ========== CARE TASKS ==========
  VIEW_CARE_TASKS: {
    id: 'view_care_tasks',
    name: 'View Care Tasks',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can view care task lists'
  },
  CREATE_CARE_TASKS: {
    id: 'create_care_tasks',
    name: 'Create Care Tasks',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can create new care tasks'
  },
  COMPLETE_CARE_TASKS: {
    id: 'complete_care_tasks',
    name: 'Complete Care Tasks',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can mark tasks as completed'
  },
  DELETE_CARE_TASKS: {
    id: 'delete_care_tasks',
    name: 'Delete Care Tasks',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can remove care tasks'
  },

  // ========== ALERTS & NOTIFICATIONS ==========
  VIEW_ALERTS: {
    id: 'view_alerts',
    name: 'View Alerts',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can view system alerts'
  },
  RESPOND_TO_ALERTS: {
    id: 'respond_to_alerts',
    name: 'Respond to Alerts',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can take action on alerts'
  },
  CREATE_ALERTS: {
    id: 'create_alerts',
    name: 'Create Alerts',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can generate system alerts'
  },

  // ========== EQUIPMENT & DONATIONS ==========
  REQUEST_EQUIPMENT: {
    id: 'request_equipment',
    name: 'Request Equipment',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can request medical equipment'
  },
  VIEW_MARKETPLACE: {
    id: 'view_marketplace',
    name: 'View Marketplace',
    category: PERMISSION_CATEGORIES.FEATURE_ACCESS,
    description: 'Can browse equipment marketplace'
  },
  MAKE_DONATIONS: {
    id: 'make_donations',
    name: 'Make Donations',
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: 'Can make financial donations'
  },
  VIEW_DONATION_HISTORY: {
    id: 'view_donation_history',
    name: 'View Donation History',
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: 'Can view donation records'
  },
  APPROVE_REQUESTS: {
    id: 'approve_requests',
    name: 'Approve Requests',
    category: PERMISSION_CATEGORIES.ADMIN,
    description: 'Can approve equipment requests'
  },

  // ========== FINANCIAL OPERATIONS ==========
  PROCESS_PAYMENTS: {
    id: 'process_payments',
    name: 'Process Payments',
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: 'Can process payment transactions'
  },
  VIEW_BILLING: {
    id: 'view_billing',
    name: 'View Billing',
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: 'Can view billing information'
  },
  GENERATE_INVOICES: {
    id: 'generate_invoices',
    name: 'Generate Invoices',
    category: PERMISSION_CATEGORIES.FINANCIAL,
    description: 'Can create invoices'
  },

  // ========== SYSTEM ADMINISTRATION ==========
  MANAGE_USERS: {
    id: 'manage_users',
    name: 'Manage Users',
    category: PERMISSION_CATEGORIES.ADMIN,
    description: 'Can create, edit, delete users'
  },
  MANAGE_ROLES: {
    id: 'manage_roles',
    name: 'Manage Roles',
    category: PERMISSION_CATEGORIES.ADMIN,
    description: 'Can assign and modify user roles'
  },
  VIEW_AUDIT_LOGS: {
    id: 'view_audit_logs',
    name: 'View Audit Logs',
    category: PERMISSION_CATEGORIES.ADMIN,
    description: 'Can access system audit trails'
  },
  SYSTEM_CONFIGURATION: {
    id: 'system_configuration',
    name: 'System Configuration',
    category: PERMISSION_CATEGORIES.ADMIN,
    description: 'Can modify system settings'
  },
  EXPORT_DATA: {
    id: 'export_data',
    name: 'Export Data',
    category: PERMISSION_CATEGORIES.ADMIN,
    description: 'Can export system data'
  }
};

/**
 * Role Definitions with Assigned Permissions
 * Each role has a specific set of permissions
 */
export const ROLE_PERMISSIONS = {
  patient: {
    name: 'Patient',
    description: 'Elderly patient receiving care',
    level: 1,
    permissions: [
      // Data Access
      PERMISSIONS.VIEW_OWN_DATA.id,
      PERMISSIONS.VIEW_HEALTH_METRICS.id,
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.VIEW_OWN_APPOINTMENTS.id,
      PERMISSIONS.VIEW_FINANCIAL_DATA.id, // Own billing only

      // Data Modification
      PERMISSIONS.EDIT_OWN_PROFILE.id,
      PERMISSIONS.MANAGE_OWN_MEDICATIONS.id,

      // Feature Access
      PERMISSIONS.BOOK_APPOINTMENTS.id,
      PERMISSIONS.CANCEL_APPOINTMENTS.id, // Own only
      PERMISSIONS.REQUEST_EQUIPMENT.id,
      PERMISSIONS.VIEW_ALERTS.id,

      // Financial
      PERMISSIONS.PROCESS_PAYMENTS.id, // For equipment requests
      PERMISSIONS.VIEW_BILLING.id
    ],
    routes: ['/patient/*'],
    dashboards: ['patient']
  },

  doctor: {
    name: 'Doctor',
    description: 'Medical professional providing care',
    level: 3,
    permissions: [
      // Data Access
      PERMISSIONS.VIEW_ALL_PATIENTS.id,
      PERMISSIONS.VIEW_MEDICAL_RECORDS.id,
      PERMISSIONS.VIEW_HEALTH_METRICS.id,
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.VIEW_FINANCIAL_DATA.id, // Patient billing

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

      // Charity Centre (Donations)
      PERMISSIONS.VIEW_MARKETPLACE.id,
      PERMISSIONS.MAKE_DONATIONS.id,
      PERMISSIONS.VIEW_DONATION_HISTORY.id,
      PERMISSIONS.PROCESS_PAYMENTS.id
    ],
    routes: ['/doctor/*'],
    dashboards: ['doctor']
  },

  family: {
    name: 'Family Member',
    description: 'Family member monitoring patient care',
    level: 2,
    permissions: [
      // Data Access (limited to assigned patients)
      PERMISSIONS.VIEW_ASSIGNED_PATIENTS.id,
      PERMISSIONS.VIEW_HEALTH_METRICS.id,
      PERMISSIONS.VIEW_MEDICATIONS.id,
      PERMISSIONS.VIEW_OWN_APPOINTMENTS.id, // Assigned patient appointments

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

      // Limited Clinical Access
      PERMISSIONS.VIEW_CLINICAL_NOTES.id,
      PERMISSIONS.VIEW_TEST_RESULTS.id,

      // Charity Centre (Donations)
      PERMISSIONS.VIEW_MARKETPLACE.id,
      PERMISSIONS.MAKE_DONATIONS.id,
      PERMISSIONS.VIEW_DONATION_HISTORY.id,
      PERMISSIONS.PROCESS_PAYMENTS.id
    ],
    routes: ['/family/*'],
    dashboards: ['family']
  },

  admin: {
    name: 'Administrator',
    description: 'System administrator with full access',
    level: 5,
    permissions: Object.keys(PERMISSIONS).map(key => PERMISSIONS[key].id),
    routes: ['*'],
    dashboards: ['patient', 'doctor', 'family', 'admin']
  }
};

/**
 * Feature Access Matrix
 * Maps features to required permissions
 */
export const FEATURE_PERMISSIONS = {
  // Dashboard Features
  'dashboard.view': {
    patient: true,
    doctor: true,
    family: true,
    admin: true
  },

  // Medication Features
  'medications.view': {
    required: [PERMISSIONS.VIEW_MEDICATIONS.id]
  },
  'medications.add': {
    required: [PERMISSIONS.MANAGE_OWN_MEDICATIONS.id]
  },
  'medications.prescribe': {
    required: [PERMISSIONS.PRESCRIBE_MEDICATIONS.id]
  },

  // Appointment Features
  'appointments.view': {
    required: [PERMISSIONS.VIEW_OWN_APPOINTMENTS.id]
  },
  'appointments.book': {
    required: [PERMISSIONS.BOOK_APPOINTMENTS.id]
  },
  'appointments.manage': {
    required: [PERMISSIONS.MANAGE_ALL_APPOINTMENTS.id]
  },

  // Clinical Features
  'clinical.notes.add': {
    required: [PERMISSIONS.ADD_CLINICAL_NOTES.id]
  },
  'clinical.notes.view': {
    required: [PERMISSIONS.VIEW_CLINICAL_NOTES.id]
  },

  // Equipment Features
  'equipment.request': {
    required: [PERMISSIONS.REQUEST_EQUIPMENT.id]
  },
  'equipment.marketplace': {
    required: [PERMISSIONS.VIEW_MARKETPLACE.id]
  },
  'equipment.donate': {
    required: [PERMISSIONS.MAKE_DONATIONS.id]
  },

  // Care Tasks
  'tasks.view': {
    required: [PERMISSIONS.VIEW_CARE_TASKS.id]
  },
  'tasks.create': {
    required: [PERMISSIONS.CREATE_CARE_TASKS.id]
  },
  'tasks.complete': {
    required: [PERMISSIONS.COMPLETE_CARE_TASKS.id]
  },

  // Alerts
  'alerts.view': {
    required: [PERMISSIONS.VIEW_ALERTS.id]
  },
  'alerts.respond': {
    required: [PERMISSIONS.RESPOND_TO_ALERTS.id]
  }
};

/**
 * Helper function to check if a role has a specific permission
 */
export const roleHasPermission = (role, permissionId) => {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return false;
  return roleConfig.permissions.includes(permissionId);
};

/**
 * Helper function to get all permissions for a role
 */
export const getRolePermissions = (role) => {
  const roleConfig = ROLE_PERMISSIONS[role];
  if (!roleConfig) return [];
  return roleConfig.permissions.map(permId => {
    // Find the permission object
    return Object.values(PERMISSIONS).find(p => p.id === permId);
  }).filter(Boolean);
};

/**
 * Helper function to check if user can access a feature
 */
export const canAccessFeature = (user, featureId) => {
  const feature = FEATURE_PERMISSIONS[featureId];
  if (!feature) return false;

  // Check role-based access
  if (feature[user.role] !== undefined) {
    return feature[user.role];
  }

  // Check permission-based access
  if (feature.required) {
    const roleConfig = ROLE_PERMISSIONS[user.role];
    if (!roleConfig) return false;

    return feature.required.every(permId =>
      roleConfig.permissions.includes(permId)
    );
  }

  return false;
};

export default {
  PERMISSIONS,
  ROLE_PERMISSIONS,
  FEATURE_PERMISSIONS,
  roleHasPermission,
  getRolePermissions,
  canAccessFeature
};
