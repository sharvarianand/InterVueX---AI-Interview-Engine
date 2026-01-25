import { Link } from 'react-router-dom';
import { ProductIcon } from '../LandingPage';

export default function PricingPage() {
    const plans = [
        {
            name: 'Free',
            price: '$0',
            period: 'forever',
            features: [
                '2 Mock Interviews / month',
                'Basic Feedback',
                'Project Analysis (1 repo)',
                'Standard Questioning'
            ],
            btnText: 'Current Plan',
            btnClass: 'btn-outline-white'
        },
        {
            name: 'Pro',
            price: '$19',
            period: 'per month',
            features: [
                'Unlimited Mock Interviews',
                'Detailed Deep-Dive Reports',
                'Full Project Viva Prep',
                'Advanced Eye Tracking Insights',
                'Voice Interaction Mode'
            ],
            btnText: 'Start Free Trial',
            btnClass: 'btn-white highlight'
        },
        {
            name: 'Campus',
            price: 'Custom',
            period: 'for institutions',
            features: [
                'Bulk Candidate Evaluations',
                'Interviewer Dashboard',
                'Detailed Analytics Export',
                'Anti-Cheat Audit Logs',
                'Priority AI Reasoning'
            ],
            btnText: 'Contact Sales',
            btnClass: 'btn-outline-white'
        }
    ];

    return (
        <div className="info-page">
            <nav className="info-nav">
                <Link to="/" className="info-logo">
                    <ProductIcon size={24} />
                    <span>InterVueX</span>
                </Link>
                <div className="info-nav-links">
                    <Link to="/about">About</Link>
                    <Link to="/contact">Contact</Link>
                    <Link to="/auth" className="btn-auth">Sign In</Link>
                </div>
            </nav>

            <main className="info-content">
                <section className="info-hero">
                    <h1 className="info-title">Simple Pricing</h1>
                    <p className="info-subtitle">Choose the plan that fits your preparation needs.</p>
                </section>

                <section className="pricing-grid">
                    {plans.map((plan, i) => (
                        <div key={i} className={`pricing-card ${plan.highlight ? 'popular' : ''}`}>
                            <div className="plan-header">
                                <h3>{plan.name}</h3>
                                <div className="plan-price">
                                    <span className="amount">{plan.price}</span>
                                    <span className="period">{plan.period}</span>
                                </div>
                            </div>
                            <ul className="plan-features">
                                {plan.features.map((feature, f) => (
                                    <li key={f}>
                                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                                            <polyline points="20 6 9 17 4 12" />
                                        </svg>
                                        {feature}
                                    </li>
                                ))}
                            </ul>
                            <Link to="/auth" className={`plan-btn ${plan.btnClass}`}>
                                {plan.btnText}
                            </Link>
                        </div>
                    ))}
                </section>
            </main>

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
          max-width: 1100px;
          margin: 0 auto;
          padding: 6rem 2rem;
        }

        .info-hero {
          text-align: center;
          margin-bottom: 5rem;
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
        }

        .pricing-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 2rem;
        }

        .pricing-card {
          background: #0a0a0a;
          border: 1px solid #171717;
          border-radius: 24px;
          padding: 2.5rem;
          display: flex;
          flex-direction: column;
          transition: all 0.3s ease;
        }

        .pricing-card:hover {
          border-color: #404040;
          transform: translateY(-8px);
        }

        .plan-header h3 {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: #737373;
        }

        .plan-price {
          display: flex;
          flex-direction: column;
          margin-bottom: 2.5rem;
        }

        .plan-price .amount {
          font-size: 3rem;
          font-weight: 800;
          color: #fff;
        }

        .plan-price .period {
          font-size: 0.875rem;
          color: #404040;
        }

        .plan-features {
          list-style: none;
          padding: 0;
          margin: 0 0 3rem 0;
          flex: 1;
        }

        .plan-features li {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.75rem 0;
          color: #a3a3a3;
          font-size: 0.9375rem;
        }

        .plan-features li svg {
          color: #fff;
        }

        .plan-btn {
          width: 100%;
          text-align: center;
          padding: 1rem;
          border-radius: 12px;
          text-decoration: none;
          font-weight: 700;
          transition: all 0.2s;
        }

        .btn-white {
          background: #fff;
          color: #000;
        }

        .btn-white:hover {
          background: #e5e5e5;
        }

        .btn-outline-white {
          border: 1px solid #404040;
          color: #fff;
        }

        .btn-outline-white:hover {
          border-color: #fff;
        }

        @media (max-width: 900px) {
          .pricing-grid {
            grid-template-columns: 1fr;
            max-width: 400px;
            margin: 0 auto;
          }
        }
      `}</style>
        </div>
    );
}
