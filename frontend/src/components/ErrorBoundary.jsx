import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            const isNetworkError = !navigator.onLine || this.state.error?.message?.includes('failed to load script');

            return (
                <div className="error-boundary">
                    <div className="error-card">
                        <div className="error-icon">⚠️</div>
                        <h2>{isNetworkError ? 'Connection Issue' : 'Something went wrong'}</h2>
                        <p>
                            {isNetworkError
                                ? 'We are having trouble connecting to our authentication service. Please check your internet connection and try again.'
                                : 'An unexpected error occurred. Please try refreshing the page.'}
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="btn-primary"
                        >
                            Reload Page
                        </button>
                    </div>
                    <style>{`
            .error-boundary {
              min-height: 100vh;
              display: flex;
              align-items: center;
              justify-content: center;
              background: #f9fafb;
              padding: 2rem;
              font-family: system-ui, -apple-system, sans-serif;
            }
            .error-card {
              max-width: 400px;
              width: 100%;
              background: white;
              padding: 2.5rem;
              border-radius: 20px;
              box-shadow: 0 10px 25px rgba(0,0,0,0.05);
              text-align: center;
            }
            .error-icon {
              font-size: 3rem;
              margin-bottom: 1.5rem;
            }
            .error-card h2 {
              margin: 0 0 1rem;
              color: #111827;
              font-size: 1.5rem;
              font-weight: 700;
            }
            .error-card p {
              color: #6b7280;
              line-height: 1.6;
              margin-bottom: 2rem;
            }
            .btn-primary {
              background: #000;
              color: #fff;
              padding: 0.75rem 1.5rem;
              border-radius: 10px;
              border: none;
              font-weight: 600;
              cursor: pointer;
              transition: transform 0.2s;
            }
            .btn-primary:active {
              transform: scale(0.98);
            }
          `}</style>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
