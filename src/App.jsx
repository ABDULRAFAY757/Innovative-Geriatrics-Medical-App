import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppProvider, useApp } from './contexts/AppContext';
import { ToastContainer } from './components/shared/ToastNotification';

// Auth Components (not lazy - needed immediately)
import ModernLogin from './components/Auth/ModernLogin';
import ProtectedRoute from './components/Auth/ProtectedRoute';

// Layout (not lazy - needed immediately)
import Header from './components/Layout/Header';

// Lazy-loaded Dashboards for better performance
const PatientDashboard = lazy(() => import('./components/Dashboards/PatientDashboard'));
const FamilyDashboard = lazy(() => import('./components/Dashboards/FamilyDashboard'));
const DoctorDashboard = lazy(() => import('./components/Dashboards/DoctorDashboard'));

// Lazy-loaded Common Pages
const Profile = lazy(() => import('./components/Pages/Profile'));
const Settings = lazy(() => import('./components/Pages/Settings'));
const Help = lazy(() => import('./components/Pages/Help'));

// Lazy-loaded Patient Pages
const PatientMedications = lazy(() => import('./components/Pages/PatientMedications'));
const PatientAppointments = lazy(() => import('./components/Pages/PatientAppointments'));
const PatientRecords = lazy(() => import('./components/Pages/PatientRecords'));

// Lazy-loaded Doctor Pages
const DoctorPatients = lazy(() => import('./components/Pages/DoctorPatients'));
const DoctorAppointments = lazy(() => import('./components/Pages/DoctorAppointments'));
const DoctorMedicalRecords = lazy(() => import('./components/Pages/DoctorMedicalRecords'));

// Lazy-loaded Family Pages
const FamilyCareTasks = lazy(() => import('./components/Pages/FamilyCareTasks'));
const FamilyAlerts = lazy(() => import('./components/Pages/FamilyAlerts'));

// Lazy-loaded Equipment Assistance Center
const EquipmentAssistance = lazy(() => import('./components/Pages/EquipmentAssistance'));

/**
 * Loading Fallback Component for Lazy-loaded Routes
 */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-50">
    <div className="text-center">
      <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
      <p className="text-lg font-semibold text-gray-700">Loading...</p>
    </div>
  </div>
);

/**
 * Dashboard Layout Wrapper with Header and Toast Notifications
 */
const DashboardLayout = ({ children }) => {
  const { user, logout } = useAuth();
  const { notifications, removeNotification } = useApp();

  return (
    <div className="min-h-screen bg-gray-50">
      <Header user={user} onLogout={logout} />
      <main className="min-h-[calc(100vh-64px)]">
        <Suspense fallback={<PageLoader />}>
          {children}
        </Suspense>
      </main>
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
                <Route path="equipment" element={<EquipmentAssistance user={user} />} />
                <Route path="records" element={<PatientRecords user={user} />} />
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
                <Route path="records" element={<DoctorMedicalRecords user={user} />} />
                <Route path="equipment" element={<EquipmentAssistance user={user} />} />
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
                <Route path="equipment" element={<EquipmentAssistance user={user} />} />
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
