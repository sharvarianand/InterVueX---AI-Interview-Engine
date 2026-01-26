import { Link } from 'react-router-dom';
import { useEffect, useState } from 'react';

// Product Icon Component
export const ProductIcon = ({ size = 24, className = "" }) => (
  <img
    src="/logo.png"
    alt="InterVueX Logo"
    width={size}
    height={size}
    className={className}
    style={{ objectFit: 'contain' }}
  />
);


// Other SVG Icons
const Icons = {
  brain: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
      <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
      <path d="M15 13a4.5 4.5 0 0 1-3-4 4.5 4.5 0 0 1-3 4" />
    </svg>
  ),
  rocket: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z" />
      <path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z" />
    </svg>
  ),
  target: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <circle cx="12" cy="12" r="6" />
      <circle cx="12" cy="12" r="2" />
    </svg>
  ),
  chart: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  video: (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  ),
  arrow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
};

// Floating geometric shapes
// Floating Brand Icon Component
function FloatingBrandIcon() {
  return (
    <div className="floating-brand-icon">
      <img
        src="/logo.png"
        alt="InterVueX"
        className="brand-float-animation"
      />
    </div>
  );
}

// Floating Shapes Component
function FloatingShapes() {
  return (
    <div className="floating-shapes">
      {[...Array(6)].map((_, i) => (
        <div
          key={i}
          className={`shape shape-${i + 1}`}
          style={{
            animationDelay: `${i * 0.5}s`,
          }}
        />
      ))}
    </div>
  );
}


export default function LandingPage() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: Icons.brain,
      title: 'AI-Powered Analysis',
      description: 'Composable AI blocks that adapt to your responses and project context',
    },
    {
      icon: Icons.target,
      title: 'Project-Aware',
      description: 'Analyzes your GitHub repos and live deployments for targeted questions',
    },
    {
      icon: Icons.chart,
      title: 'Deep Insights',
      description: 'Reasoning depth index, confidence tracking, and improvement roadmaps',
    },
    {
      icon: Icons.video,
      title: 'Anti-Cheat Proctoring',
      description: 'Eye tracking and behavioral analysis to ensure authentic evaluations',
    },
  ];

  const stats = [
    { value: '10K+', label: 'Students Prepared' },
    { value: '95%', label: 'Success Rate' },
    { value: '500+', label: 'Companies Trust Us' },
    { value: '24/7', label: 'AI Availability' },
  ];

  return (
    <div className="landing-page">
      {/* Hero Section */}
      <section className="hero-section">
        <FloatingShapes />
        <FloatingBrandIcon />

        <nav className="hero-nav">
          <div className="nav-logo">
            <ProductIcon size={28} className="logo-icon" />
            <span>InterVueX</span>
          </div>
          <div className="nav-links">
            <a href="#features">Features</a>
            <a href="#personas">For You</a>
            <Link to="/auth" className="btn btn-outline">Sign In</Link>
          </div>
        </nav>

        <div className="hero-content">
          {/* Main Brand Title in Middle */}
          <div className={`brand-central ${isVisible ? 'animate-scaleIn' : ''}`}>
            <ProductIcon size={80} className="central-icon" />
            <h1 className="central-title">InterVueX</h1>
          </div>

          {/* Subtitle */}
          <p className={`hero-subtitle ${isVisible ? 'animate-fadeInUp stagger-2' : ''}`}>
            The next generation of AI-powered interview evaluations.
            <br />
            Project-Aware. Multi-Modal. Objective.
          </p>

          {/* CTA Buttons */}
          <div className={`hero-buttons ${isVisible ? 'animate-fadeInUp stagger-3' : ''}`}>
            <Link to="/auth" className="btn btn-white btn-lg">
              Get Started Free
              {Icons.arrow}
            </Link>
          </div>

          {/* Feature Pills */}
          <div className={`feature-pills ${isVisible ? 'animate-fadeIn stagger-4' : ''}`}>
            {['Project-Aware', 'Eye Tracking', 'Voice + Text', 'Real-Time Feedback'].map((feature, i) => (
              <span key={i} className="pill">
                ✓ {feature}
              </span>
            ))}
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="scroll-indicator animate-bounce">
          <div className="scroll-line" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid-landing">
            {stats.map((stat, i) => (
              <div key={i} className="stat-item">
                <div className="stat-value">{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FEATURES</span>
            <h2>Why Choose InterVueX?</h2>
            <p>Cutting-edge AI technology meets proven interview preparation methodology</p>
          </div>

          <div className="features-grid">
            {features.map((feature, i) => (
              <div key={i} className={`feature-card stagger-${i + 1}`}>
                <div className="feature-icon">
                  {feature.icon}
                </div>
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="personas" className="personas-section">
        <div className="container">
          <div className="section-header">
            <span className="section-badge">FOR STUDENTS</span>
            <h2>Master Your Interview Game</h2>
            <p>The powerful AI engine tailored for your career success</p>
          </div>

          <div className="personas-grid" style={{ gridTemplateColumns: '1fr', maxWidth: '600px', margin: '0 auto' }}>
            <div className="persona-card">
              <div className="persona-icon">🎓</div>
              <h3>Start Your Journey</h3>
              <p>Practice interviews, defend your projects, and get detailed feedback to improve</p>
              <Link to="/auth" className="btn btn-black">
                Start Practicing Now →
              </Link>
            </div>
          </div>
        </div>
      </section>


      {/* Footer */}
      <footer className="landing-footer">
        <div className="container">
          <div className="footer-content">
            <div className="footer-brand">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <ProductIcon size={24} />
                <h3 style={{ margin: 0 }}>InterVueX</h3>
              </div>
              <p>AI-Powered Interview Excellence</p>
            </div>
            <div className="footer-links">
              <a href="#features">Features</a>
              <Link to="/about">About</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/contact">Contact</Link>
            </div>
          </div>
          <div className="footer-bottom">
            <p>© 2026 InterVueX. Built with precision for better interviews.</p>
          </div>
        </div>
      </footer>

      <style>{`
        .landing-page {
          overflow-x: hidden;
          background: #000;
          color: #fff;
        }

        /* Hero Section */
        .hero-section {
          min-height: 100vh;
          background: #000;
          position: relative;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        }

        .floating-shapes {
          position: absolute;
          inset: 0;
          overflow: hidden;
          pointer-events: none;
        }

        .shape {
          position: absolute;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 50%;
          animation: float 20s ease-in-out infinite;
        }

        .shape-1 { width: 400px; height: 400px; top: -100px; right: -100px; }
        .shape-2 { width: 300px; height: 300px; bottom: 10%; left: -50px; }
        .shape-3 { width: 200px; height: 200px; top: 40%; right: 10%; }

        /* Navigation */
        .hero-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 3rem;
          position: relative;
          z-index: 10;
        }

        .nav-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.5rem;
          font-weight: 800;
          letter-spacing: -0.5px;
        }

        .logo-icon { color: #fff; }

        .nav-links {
          display: flex;
          align-items: center;
          gap: 2rem;
        }

        .nav-links a {
          color: #a3a3a3;
          text-decoration: none;
          font-size: 0.875rem;
          transition: color 0.2s;
        }

        .nav-links a:hover { color: #fff; }

        .btn-outline {
          border: 1px solid #404040;
          padding: 0.5rem 1.25rem;
          border-radius: var(--radius-full);
          text-decoration: none;
          color: #fff;
        }

        .hero-content {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          text-align: center;
          padding: 2rem;
          max-width: 900px;
          margin: 0 auto;
          position: relative;
          z-index: 10;
        }

        /* Central Brand */
        .brand-central {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 1.5rem;
          margin-bottom: 2rem;
          margin-top: -10vh;
        }

        .central-icon {
          color: #fff;
          filter: drop-shadow(0 0 20px rgba(255,255,255,0.2));
        }

        .central-title {
          font-size: 6rem;
          font-weight: 900;
          color: #fff;
          letter-spacing: -4px;
          margin: 0;
          line-height: 1;
        }

        .hero-subtitle {
          font-size: 1.25rem;
          color: #737373;
          max-width: 600px;
          margin-bottom: 3rem;
          line-height: 1.6;
        }

        .hero-buttons {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
          flex-wrap: wrap;
        }

        .btn-white {
          background: #fff;
          color: #000;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          transition: all 0.2s;
          text-decoration: none;
          border: none;
        }

        .btn-white:hover {
          background: #e5e5e5;
          transform: translateY(-2px);
        }

        .btn-outline-white {
          background: transparent;
          color: #fff;
          border: 1.5px solid #fff;
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          padding: 1rem 2rem;
          font-weight: 700;
          border-radius: var(--radius-full);
          transition: all 0.2s;
          text-decoration: none;
        }

        .btn-outline-white:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translateY(-2px);
        }

        .feature-pills {
          display: flex;
          gap: 1rem;
          justify-content: center;
          flex-wrap: wrap;
          margin-top: 4rem;
        }

        .pill {
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 0.6rem 1.2rem;
          border-radius: 999px;
          font-size: 0.8rem;
          color: #737373;
          font-weight: 500;
        }

        .scroll-indicator {
          position: absolute;
          bottom: 3rem;
          left: 50%;
          transform: translateX(-50%);
        }

        .scroll-line {
          width: 1.5px;
          height: 80px;
          background: linear-gradient(180deg, #fff 0%, transparent 100%);
        }

        /* Stats Section */
        .stats-section {
          background: #000;
          padding: 5rem 0;
          border-top: 1px solid #171717;
          border-bottom: 1px solid #171717;
        }

        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 2rem;
        }

        .stats-grid-landing {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 3rem;
          text-align: center;
        }

        .stat-item .stat-value {
          font-size: 3.5rem;
          font-weight: 800;
          color: #fff;
          letter-spacing: -2px;
          margin-bottom: 0.5rem;
        }

        .stat-item .stat-label {
          color: #525252;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }

        /* Features Section */
        .features-section { padding: 8rem 0; background: #000; }
        .section-header { text-align: center; margin-bottom: 5rem; }
        .section-badge {
          display: inline-block;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #737373;
          padding: 0.5rem 1.25rem;
          border-radius: 999px;
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.2em;
          margin-bottom: 1.5rem;
        }

        .section-header h2 { font-size: 3rem; margin-bottom: 1rem; color: #fff; letter-spacing: -1px; }
        .section-header p { color: #525252; font-size: 1.1rem; }

        .features-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 2rem;
        }

        .feature-card {
          background: #050505;
          border: 1px solid #171717;
          padding: 3rem 2rem;
          border-radius: var(--radius-2xl);
          transition: all 0.3s ease;
          text-align: center;
        }

        .feature-card:hover { border-color: #404040; transform: translateY(-8px); background: #080808; }
        .feature-icon {
          width: 56px;
          height: 56px;
          background: #111;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          margin: 0 auto 2rem;
          border: 1px solid #222;
        }

        .feature-card h3 { color: #fff; margin-bottom: 1rem; font-size: 1.25rem; }
        .feature-card p { color: #525252; font-size: 0.9rem; line-height: 1.7; }

        /* Personas Section */
        .personas-section { padding: 8rem 0; background: #050505; }
        .personas-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 2rem; max-width: 1000px; margin: 0 auto; }
        .persona-card {
          background: #fff;
          color: #000;
          padding: 4rem 3rem;
          border-radius: var(--radius-2xl);
          transition: all 0.3s ease;
          text-align: center;
        }

        .persona-card.inverted { background: #000; color: #fff; border: 1px solid #171717; }
        .persona-icon { font-size: 3rem; margin-bottom: 1.5rem; }
        .persona-card h3 { margin-bottom: 1rem; font-size: 2rem; letter-spacing: -1px; }
        .persona-card p { color: #525252; margin-bottom: 2rem; font-size: 1rem; }
        .persona-card.inverted p { color: #737373; }

        .btn-black { 
          background: #000; color: #fff; padding: 1rem 2rem; 
          border-radius: var(--radius-lg); font-weight: 700; text-decoration: none; 
          display: inline-block; transition: all 0.2s;
        }
        .btn-black:hover { background: #222; transform: scale(1.05); }

        .btn-white-on-black { 
          background: #fff; color: #000; padding: 1rem 2rem; 
          border-radius: var(--radius-lg); font-weight: 700; text-decoration: none; 
          display: inline-block; transition: all 0.2s;
        }
        .btn-white-on-black:hover { background: #e5e5e5; transform: scale(1.05); }

        /* Footer */
        .landing-footer { background: #000; color: #525252; padding: 6rem 0 3rem; border-top: 1px solid #171717; }
        .footer-content { display: flex; justify-content: space-between; align-items: center; padding-bottom: 3rem; border-bottom: 1px solid #171717; margin-bottom: 3rem; }
        .footer-brand h3 { color: #fff; font-size: 1.5rem; letter-spacing: -0.5px; }
        .footer-links { display: flex; gap: 3rem; }
        .footer-links a { color: #525252; text-decoration: none; font-size: 0.9rem; font-weight: 500; transition: color 0.2s; }
        .footer-links a:hover { color: #fff; }
        .footer-bottom p { color: #222; font-size: 0.8rem; font-weight: 600; }

        @media (max-width: 768px) {
          .hero-nav { padding: 1.5rem; }
          .nav-links { display: none; }
          .central-title { font-size: 4rem; letter-spacing: -2px; }
          .stats-grid-landing { grid-template-columns: repeat(2, 1fr); gap: 2rem; }
          .personas-grid { grid-template-columns: 1fr; }
          .central-icon { width: 60px; height: 60px; }
        }
      `}</style>
    </div>
  );
}
