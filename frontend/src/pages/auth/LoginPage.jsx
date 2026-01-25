import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSignIn, useUser } from '@clerk/clerk-react';

// SVG Icons
const Icons = {
  email: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  ),
  lock: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="18" height="11" x="3" y="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  google: (
    <svg width="20" height="20" viewBox="0 0 24 24">
      <path fill="#737373" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#525252" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#404040" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
      <path fill="#262626" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  ),
  github: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
    </svg>
  ),
  sparkles: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z" />
    </svg>
  ),
  arrow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const { login, loginWithClerk } = useAuth();
  const { signIn, isLoaded: signInLoaded } = useSignIn();
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    if (userLoaded && clerkUser) {
      loginWithClerk(clerkUser);
      // Only navigate if we are on the auth page and not already logged in
      navigate('/select-role');
    }
  }, [clerkUser, userLoaded, loginWithClerk, navigate]);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await login(email, password);
      navigate('/select-role');
    } catch (error) {
      console.error('Login failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    { text: 'Project-aware questioning' },
    { text: 'Adaptive AI interviewer' },
    { text: 'Eye tracking proctoring' },
    { text: 'Voice + Text input' },
  ];

  return (
    <div className="auth-page">
      {/* Left Side - Branding */}
      <div className="auth-left">
        <div className="auth-left-content">
          {/* Logo */}
          <Link to="/" className={`auth-logo ${isVisible ? 'animate-fadeIn' : ''}`}>
            InterVueX
          </Link>

          <h2 className={`auth-tagline ${isVisible ? 'animate-fadeInUp' : ''}`}>
            AI-powered interview<br />preparation platform
          </h2>

          {/* Feature List */}
          <div className="auth-features">
            {features.map((item, i) => (
              <div
                key={i}
                className={`auth-feature ${isVisible ? `animate-slideIn stagger-${i + 1}` : ''}`}
              >
                <span className="feature-check">✓</span>
                <span>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Decorative grid */}
          <div className="grid-pattern" />
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="auth-right">
        <form className={`auth-form ${isVisible ? 'animate-scaleIn' : ''}`} onSubmit={handleSubmit}>
          <div className="form-header">
            <h2>Welcome back</h2>
            <p>Sign in to continue your interview journey</p>
          </div>

          {/* Social Login */}
          <div className="social-buttons">
            <button
              type="button"
              className="btn-social"
              onClick={() => signIn.authenticateWithRedirect({
                strategy: "oauth_google",
                redirectUrl: "/auth",
                redirectUrlComplete: "/select-role"
              })}
            >
              {Icons.google}
              <span>Google</span>
            </button>
            <button
              type="button"
              className="btn-social"
              onClick={() => signIn.authenticateWithRedirect({
                strategy: "oauth_github",
                redirectUrl: "/auth",
                redirectUrlComplete: "/select-role"
              })}
            >
              {Icons.github}
              <span>GitHub</span>
            </button>
          </div>

          <div className="divider">
            <span>or continue with email</span>
          </div>

          {/* Email Field */}
          <div className="form-group">
            <label className="label">Email</label>
            <div className="input-wrapper">
              <span className="input-icon">{Icons.email}</span>
              <input
                type="email"
                className="input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password Field */}
          <div className="form-group">
            <div className="label-row">
              <label className="label">Password</label>
              <a href="#" className="forgot-link">Forgot?</a>
            </div>
            <div className="input-wrapper">
              <span className="input-icon">{Icons.lock}</span>
              <input
                type="password"
                className="input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className={`btn-submit ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <span className="spinner" />
            ) : (
              <>
                Sign In
                {Icons.arrow}
              </>
            )}
          </button>
          {/* Demo Button */}
          <button
            type="button"
            className="btn-demo"
            onClick={() => {
              setEmail('demo@intervuex.ai');
              setPassword('demo123');
            }}
          >
            {Icons.sparkles}
            Try Demo Account
          </button>

          {/* Sign Up Link */}
          <p className="signup-link">
            Don't have an account? <a href="#">Sign up</a>
          </p>
        </form>
      </div>

      <style>{`
        .auth-page {
          min-height: 100vh;
          display: flex;
          background: #fff;
        }

        /* Left Side */
        .auth-left {
          flex: 1;
          background: #000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }

        .auth-left-content {
          position: relative;
          z-index: 10;
          max-width: 400px;
        }

        .auth-logo {
          font-size: 2rem;
          font-weight: 800;
          color: #fff;
          text-decoration: none;
          display: block;
          margin-bottom: 2rem;
          letter-spacing: -1px;
        }

        .auth-tagline {
          color: #fff;
          font-size: 2.5rem;
          font-weight: 700;
          line-height: 1.2;
          margin-bottom: 3rem;
          letter-spacing: -1px;
        }

        .auth-features {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .auth-feature {
          display: flex;
          align-items: center;
          gap: 1rem;
          color: #737373;
          font-size: 0.875rem;
          opacity: 0;
        }

        .feature-check {
          color: #fff;
          font-weight: 600;
        }

        /* Grid Pattern */
        .grid-pattern {
          position: absolute;
          inset: 0;
          background-image: 
            linear-gradient(rgba(255,255,255,0.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,0.03) 1px, transparent 1px);
          background-size: 50px 50px;
          pointer-events: none;
        }

        /* Right Side */
        .auth-right {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          background: #fff;
        }

        .auth-form {
          width: 100%;
          max-width: 380px;
        }

        .form-header {
          margin-bottom: 2rem;
        }

        .form-header h2 {
          font-size: 1.5rem;
          color: #000;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .form-header p {
          color: #737373;
          margin: 0;
          font-size: 0.875rem;
        }

        /* Social Buttons */
        .social-buttons {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .btn-social {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          background: #fff;
          color: #000;
          font-weight: 500;
          font-size: 0.875rem;
          cursor: pointer;
          transition: all 0.2s;
        }

        .btn-social:hover {
          border-color: #000;
          background: #fafafa;
        }

        /* Divider */
        .divider {
          display: flex;
          align-items: center;
          gap: 1rem;
          margin: 1.5rem 0;
          color: #a3a3a3;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .divider::before,
        .divider::after {
          content: '';
          flex: 1;
          height: 1px;
          background: #e5e5e5;
        }

        /* Form Groups */
        .form-group {
          margin-bottom: 1.25rem;
        }

        .label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          color: #000;
          margin-bottom: 0.5rem;
        }

        .label-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .forgot-link {
          font-size: 0.875rem;
          color: #737373;
          text-decoration: none;
        }

        .forgot-link:hover {
          color: #000;
        }

        .input-wrapper {
          position: relative;
        }

        .input-icon {
          position: absolute;
          left: 1rem;
          top: 50%;
          transform: translateY(-50%);
          color: #a3a3a3;
        }

        .input {
          width: 100%;
          padding: 0.75rem 1rem 0.75rem 3rem;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          font-size: 0.875rem;
          color: #000;
          background: #fff;
          transition: all 0.2s;
        }

        .input:focus {
          outline: none;
          border-color: #000;
        }

        .input::placeholder {
          color: #a3a3a3;
        }

        /* Submit Button */
        .btn-submit {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: #000;
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.5rem;
        }

        .btn-submit:hover {
          background: #262626;
        }

        .btn-submit.loading {
          pointer-events: none;
        }

        .spinner {
          width: 18px;
          height: 18px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: rotate 0.8s linear infinite;
        }

        @keyframes rotate {
          to { transform: rotate(360deg); }
        }

        /* Demo Button */
        .btn-demo {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.875rem;
          background: #fafafa;
          color: #000;
          border: 1px solid #e5e5e5;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 0.75rem;
        }

        .btn-demo:hover {
          border-color: #000;
        }


        /* Sign Up Link */
        .signup-link {
          text-align: center;
          margin-top: 2rem;
          color: #737373;
          font-size: 0.875rem;
        }

        .signup-link a {
          color: #000;
          font-weight: 600;
          text-decoration: none;
        }

        .signup-link a:hover {
          text-decoration: underline;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .auth-page {
            flex-direction: column;
          }

          .auth-left {
            min-height: 35vh;
            padding: 2rem;
          }

          .auth-tagline {
            font-size: 1.75rem;
          }

          .auth-features {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}
