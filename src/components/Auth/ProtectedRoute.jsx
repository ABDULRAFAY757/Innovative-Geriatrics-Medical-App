import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { Shield, AlertTriangle } from 'lucide-react';

/**
 * Protected Route Component with RBAC & ABAC
 * Protects routes based on authentication and authorization
 */
const ProtectedRoute = ({
  children,
  requiredRole,
  requiredPermission,
  checkAbac,
  redirectTo = '/login'
}) => {
  const { user, loading, canAccessRoute, hasPermission, checkAbacRule } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to={redirectTo} state={{ from: location }} replace />;
  }

  // Check role-based access
  if (requiredRole && user.role !== requiredRole) {
    return (
      <UnauthorizedAccess
        message={`This page requires ${requiredRole} role. You are logged in as ${user.role}.`}
      />
    );
  }

  // Check specific permission
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return (
      <UnauthorizedAccess
        message={`You don't have permission to access this page.`}
      />
    );
  }

  // Check route access
  if (!canAccessRoute(location.pathname)) {
    return (
      <UnauthorizedAccess
        message={`Your role (${user.role}) cannot access this page.`}
      />
    );
  }

  // Check ABAC rule if provided
  if (checkAbac && !checkAbacRule(checkAbac.rule, checkAbac.args)) {
    return (
      <UnauthorizedAccess
        message={`Access denied based on current context and attributes.`}
      />
    );
  }

  // Render children if all checks pass
  return <>{children}</>;
};

/**
 * Unauthorized Access Component
 */
const UnauthorizedAccess = ({ message }) => {
  const { logout, user } = useAuth();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50 p-6">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8 text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <Shield className="w-10 h-10 text-red-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">Access Denied</h1>

        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 text-left">
          <div className="flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-800">{message}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-lg p-4 mb-6 text-left">
          <p className="text-xs text-gray-500 mb-2">Current Session</p>
          <p className="text-sm font-medium text-gray-900">Role: {user?.role || 'Unknown'}</p>
          <p className="text-sm text-gray-600">User: {user?.nameEn || user?.name || 'Unknown'}</p>
        </div>

        <div className="space-y-3">
          <button
            onClick={() => window.history.back()}
            className="w-full py-3 bg-gray-600 text-white font-semibold rounded-lg hover:bg-gray-700 transition-colors"
          >
            Go Back
          </button>

          <button
            onClick={() => {
              logout();
              window.location.href = '/login';
            }}
            className="w-full py-3 bg-white border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-colors"
          >
            Login with Different Account
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If you believe this is an error, please contact your administrator.
        </p>
      </div>
    </div>
  );
};

export default ProtectedRoute;
