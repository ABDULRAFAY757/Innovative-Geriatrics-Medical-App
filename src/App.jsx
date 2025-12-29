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
const FamilyAppointments = lazy(() => import('./components/Pages/FamilyAppointments'));

// Lazy-loaded Equipment Assistance Center
const EquipmentAssistance = lazy(() => import('./components/Pages/EquipmentAssistance'));

/**
 * Loading Fallback Component for Lazy-loaded Routes - POC Branded
 */
const PageLoader = () => (
  <div className="min-h-[calc(100vh-64px)] flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30">
    <div className="text-center animate-fadeIn">
      {/* Branded Loading Animation */}
      <div className="relative w-20 h-20 mx-auto mb-6">
        <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
        <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-2 border-4 border-purple-400 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
      </div>
      <p className="text-lg font-semibold text-gray-700">Loading Content...</p>
      <div className="flex items-center justify-center gap-1 mt-3">
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
      </div>
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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="text-center animate-fadeIn">
          {/* App Logo/Brand */}
          <div className="mb-8">
            <div className="w-24 h-24 mx-auto bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl shadow-xl shadow-blue-500/30 flex items-center justify-center mb-4 animate-float">
              <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold gradient-text">Innovative Geriatrics</h1>
            <p className="text-gray-500 text-sm mt-1">Medical Care Platform</p>
          </div>

          {/* Loading Animation */}
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute inset-0 border-4 border-blue-200 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>

          <p className="text-lg font-medium text-gray-600">Initializing Application...</p>

          {/* Progress Indicator */}
          <div className="w-48 h-1.5 bg-gray-200 rounded-full mx-auto mt-4 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-blue-500 to-purple-500 rounded-full animate-progress" style={{ width: '70%' }}></div>
          </div>
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
                <Route path="appointments" element={<FamilyAppointments user={user} />} />
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
