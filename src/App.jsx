import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { ToastContainer } from './components/shared/ToastNotification';

// Auth Components
import ModernLogin from './components/Auth/ModernLogin';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout
import Header from './components/Layout/Header';

// Dashboards
import PatientDashboard from './components/Dashboards/PatientDashboard';
import FamilyDashboard from './components/Dashboards/FamilyDashboard';
import DoctorDashboard from './components/Dashboards/DoctorDashboard';
import DonorDashboard from './components/Dashboards/DonorDashboard';

// Common Pages
import Profile from './components/Pages/Profile';
import Settings from './components/Pages/Settings';
import Help from './components/Pages/Help';

// Patient Pages
import PatientMedications from './components/Pages/PatientMedications';
import PatientAppointments from './components/Pages/PatientAppointments';
import PatientEquipment from './components/Pages/PatientEquipment';

// Doctor Pages
import DoctorPatients from './components/Pages/DoctorPatients';
import DoctorAppointments from './components/Pages/DoctorAppointments';

// Family Pages
import FamilyCareTasks from './components/Pages/FamilyCareTasks';
import FamilyAlerts from './components/Pages/FamilyAlerts';

// Donor Pages
import DonorMarketplace from './components/Pages/DonorMarketplace';
import DonorDonations from './components/Pages/DonorDonations';

/**
 * Dashboard Layout Wrapper with Header and Toast Notifications
 */
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, removeNotification } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />
      <main className="min-h-[calc(100vh-64px)]">{children}</main>
      <ToastContainer notifications={notifications} onClose={removeNotification} />
    </div>
  );
};

/**
 * Main App Routes with Authentication & Authorization
 */
function AppRoutes() {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-6"></div>
          <p className="text-xl font-semibold text-gray-700">Loading Application...</p>
          <p className="text-sm text-gray-500 mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Route - Login */}
      <Route
        path="/login"
        element={user ? <Navigate to={`/${user.role}`} replace /> : <ModernLogin />}
      />

      {/* Root Redirect */}
      <Route
        path="/"
        element={
          user ? (
            <Navigate to={`/${user.role}`} replace />
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      {/* Patient Routes - RBAC Protected */}
      <Route
        path="/patient/*"
        element={
          <ProtectedRoute requiredRole="patient">
            <DashboardLayout>
              <Routes>
                <Route index element={<PatientDashboard user={user} />} />
                <Route path="medications" element={<PatientMedications user={user} />} />
                <Route path="appointments" element={<PatientAppointments user={user} />} />
                <Route path="equipment" element={<PatientEquipment user={user} />} />
                <Route path="profile" element={<Profile user={user} />} />
                <Route path="settings" element={<Settings user={user} />} />
                <Route path="help" element={<Help user={user} />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Doctor Routes - RBAC Protected */}
      <Route
        path="/doctor/*"
        element={
          <ProtectedRoute requiredRole="doctor">
            <DashboardLayout>
              <Routes>
                <Route index element={<DoctorDashboard user={user} />} />
                <Route path="patients" element={<DoctorPatients user={user} />} />
                <Route path="appointments" element={<DoctorAppointments user={user} />} />
                <Route path="profile" element={<Profile user={user} />} />
                <Route path="settings" element={<Settings user={user} />} />
                <Route path="help" element={<Help user={user} />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Family Routes - RBAC Protected */}
      <Route
        path="/family/*"
        element={
          <ProtectedRoute requiredRole="family">
            <DashboardLayout>
              <Routes>
                <Route index element={<FamilyDashboard user={user} />} />
                <Route path="care-tasks" element={<FamilyCareTasks user={user} />} />
                <Route path="alerts" element={<FamilyAlerts user={user} />} />
                <Route path="profile" element={<Profile user={user} />} />
                <Route path="settings" element={<Settings user={user} />} />
                <Route path="help" element={<Help user={user} />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Donor Routes - RBAC Protected */}
      <Route
        path="/donor/*"
        element={
          <ProtectedRoute requiredRole="donor">
            <DashboardLayout>
              <Routes>
                <Route index element={<DonorDashboard user={user} />} />
                <Route path="marketplace" element={<DonorMarketplace user={user} />} />
                <Route path="donations" element={<DonorDonations user={user} />} />
                <Route path="profile" element={<Profile user={user} />} />
                <Route path="settings" element={<Settings user={user} />} />
                <Route path="help" element={<Help user={user} />} />
              </Routes>
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Catch-all Route */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

/**
 * Main App Component with Context Providers
 */
function App() {
  return (
    <Router>
      <LanguageProvider>
        <AuthProvider>
          <AppProvider>
            <AppRoutes />
          </AppProvider>
        </AuthProvider>
      </LanguageProvider>
    </Router>
  );
}

export default App;
