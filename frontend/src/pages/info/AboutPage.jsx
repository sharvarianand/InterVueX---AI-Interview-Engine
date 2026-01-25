import { Link } from 'react-router-dom';
import { ProductIcon } from '../LandingPage';

export default function AboutPage() {
    return (
        <div className="info-page">
            <nav className="info-nav">
                <Link to="/" className="info-logo">
                    <ProductIcon size={24} />
                    <span>InterVueX</span>
                </Link>
                <div className="info-nav-links">
                    <Link to="/pricing">Pricing</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/auth" className="btn-auth">Sign In</Link>
                </div>
            </nav>

            <main className="info-content">
                <section className="info-hero">
                    <h1 className="info-title">About InterVueX</h1>
                    <p className="info-subtitle">We are redefining the interview experience through artificial intelligence and behavioral science.</p>
                </section>

                <section className="info-section">
                    <div className="info-grid">
                        <div className="info-text-block">
                            <h2>Our Mission</h2>
                            <p>To provide every student and job seeker with a world-class, objective, and realistic interview preparation environment. We believe that talent should never be held back by lack of preparation or bias.</p>
                        </div>
                        <div className="info-text-block">
                            <h2>Our Vision</h2>
                            <p>A world where the hiring process is transparent, efficient, and truly reflective of a candidate's potential and reasoning capabilities.</p>
                        </div>
                    </div>
                </section>

                <section className="info-section glass">
                    <h2>The Technology</h2>
                    <p>InterVueX combines project-aware LLMs with real-time proctoring technology. Our system doesn't just ask questions; it understands the context of your work, analyzes your eye movement for focus, and provides multimodal feedback on your performance.</p>
                </section>
            </main>

            <footer className="info-footer">
                <p>© 2026 InterVueX. All rights reserved.</p>
            </footer>

            <style>{`
        .info-page {
          min-height: 100vh;
          background: #000;
          color: #fff;
          font-family: 'Inter', sans-serif;
        }

        .info-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          border-bottom: 1px solid #171717;
        }

        .info-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: #fff;
          text-decoration: none;
          font-weight: 800;
          font-size: 1.25rem;
        }

        .info-nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .info-nav-links a {
          color: #a3a3a3;
          text-decoration: none;
          font-size: 0.875rem;
        }

        .btn-auth {
          background: #fff;
          color: #000 !important;
          padding: 0.5rem 1.25rem;
          border-radius: 999px;
          font-weight: 600;
        }

        .info-content {
          max-width: 1000px;
          margin: 0 auto;
          padding: 6rem 2rem;
        }

        .info-hero {
          text-align: center;
          margin-bottom: 6rem;
        }

        .info-title {
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: 1.5rem;
        }

        .info-subtitle {
          font-size: 1.25rem;
          color: #737373;
          max-width: 600px;
          margin: 0 auto;
        }

        .info-section {
          margin-bottom: 6rem;
        }

        .info-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 4rem;
        }

        .info-text-block h2 {
          margin-bottom: 1.5rem;
          font-size: 1.75rem;
        }

        .info-text-block p {
          color: #a3a3a3;
          line-height: 1.6;
        }

        .glass {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid #171717;
          padding: 3rem;
          border-radius: 24px;
        }

        .glass h2 {
          margin-top: 0;
        }

        .info-footer {
          text-align: center;
          padding: 4rem;
          color: #404040;
          border-top: 1px solid #171717;
        }

        @media (max-width: 768px) {
          .info-nav { padding: 1rem 1.5rem; }
          .info-nav-links { display: none; }
          .info-title { font-size: 2.5rem; }
          .info-grid { grid-template-columns: 1fr; gap: 2rem; }
        }
      `}</style>
        </div>
    );
}
