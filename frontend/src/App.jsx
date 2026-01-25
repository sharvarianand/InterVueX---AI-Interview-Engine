import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ClerkProvider, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import LandingPage from './pages/LandingPage';
import ClerkAuthPage from './pages/auth/ClerkAuthPage';
import RoleSelectPage from './pages/auth/RoleSelectPage';
import StudentDashboard from './pages/student/StudentDashboard';
import StudentInterview from './pages/student/StudentInterview';
import StudentReport from './pages/student/StudentReport';
import StudentReports from './pages/student/StudentReports';
import StudentProgress from './pages/student/StudentProgress';
import InterviewerDashboard from './pages/interviewer/InterviewerDashboard';
import InterviewerSession from './pages/interviewer/InterviewerSession';
import InterviewerReport from './pages/interviewer/InterviewerReport';
import InterviewerCandidates from './pages/interviewer/InterviewerCandidates';
import InterviewerAnalytics from './pages/interviewer/InterviewerAnalytics';
import AboutPage from './pages/info/AboutPage';
import PricingPage from './pages/info/PricingPage';
import ContactPage from './pages/info/ContactPage';
import './App.css';

// Protected Route Component
function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated, isLoading } = useAuth();

  // Wait for auth state to load
  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p>Loading...</p>
      </div>
    );
  }

  // Not authenticated - redirect to auth
  if (!isAuthenticated) {
    return <Navigate to="/auth" replace />;
  }

  // If a specific role is required for this route
  if (role) {
    // User doesn't have a role yet - redirect to role selection
    if (!user?.role) {
      return <Navigate to="/select-role" replace />;
    }
    // User has a different role - redirect to their correct dashboard
    if (user.role !== role) {
      return <Navigate to={`/dashboard/${user.role}`} replace />;
    }
  }

  return children;
}

// Auth handler to redirect signed-in users
function AuthRedirectHandler() {
  const { user: clerkUser, isLoaded } = useUser();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoaded && clerkUser && isAuthenticated) {
      // User is signed in via Clerk
      if (user?.role) {
        navigate(`/dashboard/${user.role}`, { replace: true });
      } else {
        navigate('/select-role', { replace: true });
      }
    }
  }, [isLoaded, clerkUser, isAuthenticated, user, navigate]);

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

      <Route path="/select-role" element={
        <ProtectedRoute>
          <RoleSelectPage />
        </ProtectedRoute>
      } />

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

      {/* Interviewer Routes */}
      <Route path="/dashboard/interviewer" element={
        <ProtectedRoute role="interviewer">
          <InterviewerDashboard />
        </ProtectedRoute>
      } />
      <Route path="/session/:sessionId?" element={
        <ProtectedRoute role="interviewer">
          <InterviewerSession />
        </ProtectedRoute>
      } />
      <Route path="/evaluation/:reportId" element={
        <ProtectedRoute role="interviewer">
          <InterviewerReport />
        </ProtectedRoute>
      } />
      <Route path="/candidates" element={
        <ProtectedRoute role="interviewer">
          <InterviewerCandidates />
        </ProtectedRoute>
      } />
      <Route path="/analytics" element={
        <ProtectedRoute role="interviewer">
          <InterviewerAnalytics />
        </ProtectedRoute>
      } />

      {/* Fallback - must be last */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <ClerkProvider
        publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}
        afterSignInUrl="/auth"
        afterSignUpUrl="/auth"
      >
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </ClerkProvider>
    </BrowserRouter>
  );
}

export default App;
