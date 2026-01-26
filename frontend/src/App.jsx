import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';
import { useAuth } from '@clerk/clerk-react';
import LoadingScreen from './components/common/LoadingScreen';

// Lazy load pages for better performance
const LandingPage = lazy(() => import('./pages/LandingPage'));
const DashboardPage = lazy(() => import('./pages/DashboardPage'));
const InterviewSetupPage = lazy(() => import('./pages/InterviewSetupPage'));
const LiveInterviewPage = lazy(() => import('./pages/LiveInterviewPage'));
const ReportsPage = lazy(() => import('./pages/ReportsPage'));
const ProgressPage = lazy(() => import('./pages/ProgressPage'));
const TechStackPage = lazy(() => import('./pages/TechStackPage'));
const SettingsPage = lazy(() => import('./pages/SettingsPage'));

/**
 * Component to handle public routes.
 * If user is signed in, they are redirected to dashboard.
 */
const PublicRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen />;
  if (isSignedIn) return <Navigate to="/dashboard" replace />;

  return children;
};

/**
 * Component to handle protected routes.
 * If user is not signed in, they are redirected to landing page.
 */
const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded } = useAuth();

  if (!isLoaded) return <LoadingScreen />;
  if (!isSignedIn) return <Navigate to="/" replace />;

  return children;
};

function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {/* Public Routes - Redirects to dashboard if logged in */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <LandingPage />
            </PublicRoute>
          }
        />

        {/* Dashboard Routes - Protected */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard/:tab"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />

        {/* Interview Routes - Protected */}
        <Route
          path="/interview/setup"
          element={
            <ProtectedRoute>
              <InterviewSetupPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/interview/live"
          element={
            <ProtectedRoute>
              <LiveInterviewPage />
            </ProtectedRoute>
          }
        />

        {/* Analysis Routes - Protected */}
        <Route
          path="/reports"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reports/:id"
          element={
            <ProtectedRoute>
              <ReportsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/progress"
          element={
            <ProtectedRoute>
              <ProgressPage />
            </ProtectedRoute>
          }
        />

        {/* Tech Stack Evaluation - Protected */}
        <Route
          path="/techstack-evaluation"
          element={
            <ProtectedRoute>
              <TechStackPage />
            </ProtectedRoute>
          }
        />

        {/* Settings - Protected */}
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <SettingsPage />
            </ProtectedRoute>
          }
        />

        {/* Catch all - redirect to landing or dashboard based on auth */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}

export default App;
