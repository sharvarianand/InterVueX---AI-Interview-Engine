import { SignIn, useUser } from '@clerk/clerk-react';
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ClerkAuthPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
    const { user, isAuthenticated } = useAuth();

    useEffect(() => {
        // Wait for both Clerk and AuthContext to be ready
        if (clerkLoaded && clerkUser && isAuthenticated && user) {
            // User is signed in - redirect appropriately
            if (user.role) {
                navigate(`/dashboard/${user.role}`, { replace: true });
            } else {
                navigate('/select-role', { replace: true });
            }
        }
    }, [clerkLoaded, clerkUser, isAuthenticated, user, navigate]);

    // If user is already authenticated, show loading while redirecting
    if (clerkLoaded && clerkUser) {
        return (
            <div className="clerk-auth-page">
                <div className="loading-spinner">
                    <div className="spinner"></div>
                    <p>Signing you in...</p>
                </div>
                <style>{`
                    .clerk-auth-page {
                        min-height: 100vh;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        background: #fafafa;
                    }
                    .loading-spinner {
                        text-align: center;
                    }
                    .spinner {
                        width: 40px;
                        height: 40px;
                        border: 3px solid #e5e5e5;
                        border-top-color: #000;
                        border-radius: 50%;
                        animation: spin 0.8s linear infinite;
                        margin: 0 auto 1rem;
                    }
                    @keyframes spin {
                        to { transform: rotate(360deg); }
                    }
                    .loading-spinner p {
                        color: #737373;
                        font-size: 0.875rem;
                    }
                `}</style>
            </div>
        );
    }

    return (
        <div className="clerk-auth-page">
            <SignIn
                routing="path"
                path="/auth"
                signUpUrl="/auth"
                afterSignInUrl="/select-role"
                afterSignUpUrl="/select-role"
                appearance={{
                    elements: {
                        rootBox: "mx-auto",
                        card: "shadow-none"
                    }
                }}
            />

            <style>{`
        .clerk-auth-page {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #fafafa;
          padding: 2rem;
        }
      `}</style>
        </div>
    );
}
