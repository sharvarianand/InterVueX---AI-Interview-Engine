import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ClerkAuthPage from './pages/auth/ClerkAuthPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentInterview from './pages/student/StudentInterview';
import StudentReport from './pages/student/StudentReport';
import StudentReports from './pages/student/StudentReports';
import StudentProgress from './pages/student/StudentProgress';
import AboutPage from './pages/info/AboutPage';
import PricingPage from './pages/info/PricingPage';
import ContactPage from './pages/info/ContactPage';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';


// Protected Route Component
function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Wait for auth state to load completely
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-black text-white">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
          <p className="text-sm font-medium tracking-widest uppercase opacity-50">Synchronizing Auth...</p>
        </div>
      </div>
    );
  }

  // Not authenticated - redirect to auth but save where we were
  if (!isAuthenticated) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Role validation
  if (role && user?.role !== role) {
    // If they have no role yet, they shouldn't even be here, but just in case
    if (!user?.role) {
      return <Navigate to="/auth" state={{ from: location }} replace />;
    }
    // If they have the wrong role, send them to their dashboard
    return <Navigate to={`/dashboard/${user.role}`} replace />;
  }

  return children;
}

// Auth handler to redirect signed-in users back to their intended destination
function AuthRedirectHandler() {
  const { isLoaded, user: clerkUser } = useUser();
  const { isAuthenticated, user, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Only redirect if everything is fully loaded and authenticated
    if (isLoaded && clerkUser && isAuthenticated && user && !isLoading) {
      // Check if we have a destination to return to
      const from = location.state?.from?.pathname || '/dashboard/student';
      navigate(from, { replace: true });
    }
  }, [isLoaded, clerkUser, isAuthenticated, user, isLoading, navigate, location]);

  return <ClerkAuthPage />;
}


function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/about" element={<AboutPage />} />
      <Route path="/pricing" element={<PricingPage />} />
      <Route path="/contact" element={<ContactPage />} />

      {/* Auth Routes - handle all Clerk redirects */}
      <Route path="/auth/*" element={<AuthRedirectHandler />} />
      <Route path="/sso-callback" element={<AuthRedirectHandler />} />

      {/* Student Routes */}
      <Route path="/dashboard/student" element={
        <ProtectedRoute role="student">
          <StudentDashboard />
        </ProtectedRoute>
      } />
      <Route path="/interview/:sessionId?" element={
        <ProtectedRoute role="student">
          <StudentInterview />
        </ProtectedRoute>
      } />
      <Route path="/report/:reportId" element={
        <ProtectedRoute>
          <StudentReport />
        </ProtectedRoute>
      } />
      <Route path="/reports" element={
        <ProtectedRoute role="student">
          <StudentReports />
        </ProtectedRoute>
      } />
      <Route path="/progress" element={
        <ProtectedRoute role="student">
          <StudentProgress />
        </ProtectedRoute>
      } />


      {/* Fallback - must be last */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <ClerkProvider
          publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
          fallbackRedirectUrl="/auth"
        >

          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </ClerkProvider>
      </BrowserRouter>
    </ErrorBoundary>
  );

}

export default App;
