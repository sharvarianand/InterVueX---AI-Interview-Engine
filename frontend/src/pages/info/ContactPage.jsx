import { Link } from 'react-router-dom';
import { ProductIcon } from '../LandingPage';
import { useState } from 'react';

export default function ContactPage() {
    const [status, setStatus] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = new FormData(e.target);
        const data = Object.fromEntries(formData);

        // Construct mailto link as a simple way to send to the specific email
        const subject = encodeURIComponent(`${data.subject}: Message from ${data.name}`);
        const body = encodeURIComponent(`Name: ${data.name}\nEmail: ${data.email}\n\nMessage:\n${data.message}`);
        const mailtoUrl = `mailto:sharvaribhondekar23@gmail.com?subject=${subject}&body=${body}`;

        window.location.href = mailtoUrl;
        setStatus('Redirecting to your email client...');
        setTimeout(() => setStatus(''), 5000);
    };

    return (
        <div className="info-page">
            <nav className="info-nav">
                <Link to="/" className="info-logo">
                    <ProductIcon size={24} />
                    <span>InterVueX</span>
                </Link>
                <div className="info-nav-links">
                    <Link to="/about">About</Link>
                    <Link to="/pricing">Pricing</Link>
                    <Link to="/auth" className="btn-auth">Sign In</Link>
                </div>
            </nav>

            <main className="info-content">
                <div className="contact-layout">
                    <section className="contact-info">
                        <h1 className="info-title">Talk to us</h1>
                        <p className="info-subtitle">Have questions about our AI engine or institutional partnerships? We're here to help.</p>

                        <div className="contact-methods">
                            <div className="method">
                                <span className="method-label">Email</span>
                                <span className="method-value">sharvaribhondekar23@gmail.com</span>
                            </div>
                            <div className="method">
                                <span className="method-label">Headquarters</span>
                                <span className="method-value">AI Innovation Hub<br />Silicon Valley, CA</span>
                            </div>
                        </div>
                    </section>

                    <section className="contact-form-section">
                        <form className="contact-form" onSubmit={handleSubmit}>
                            <div className="form-row">
                                <div className="form-group">
                                    <label>Full Name</label>
                                    <input name="name" type="text" placeholder="John Doe" required />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input name="email" type="email" placeholder="john@example.com" required />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Subject</label>
                                <select name="subject" required>
                                    <option>General Inquiry</option>
                                    <option>Institutional Demo</option>
                                    <option>Billings & Plans</option>
                                    <option>Technical Support</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Message</label>
                                <textarea name="message" rows="5" placeholder="How can we help you?" required></textarea>
                            </div>
                            <button type="submit" className="submit-btn">
                                Send Message
                            </button>
                            {status && <p className="status-msg">{status}</p>}
                        </form>
                    </section>
                </div>
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
          max-width: 1200px;
          margin: 0 auto;
          padding: 6rem 2rem;
        }

        .contact-layout {
          display: grid;
          grid-template-columns: 1fr 1.5fr;
          gap: 6rem;
          align-items: center;
        }

        .info-title {
          font-size: 4rem;
          font-weight: 900;
          letter-spacing: -2px;
          margin-bottom: 1.5rem;
        }

        .info-subtitle {
          font-size: 1.125rem;
          color: #737373;
          line-height: 1.6;
          margin-bottom: 3rem;
        }

        .contact-methods {
          display: flex;
          flex-direction: column;
          gap: 2.5rem;
        }

        .method-label {
          display: block;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.1em;
          color: #404040;
          margin-bottom: 0.5rem;
          font-weight: 700;
        }

        .method-value {
          font-size: 1.125rem;
          color: #fff;
        }

        .contact-form-section {
          background: #0a0a0a;
          border: 1px solid #171717;
          padding: 3rem;
          border-radius: 24px;
        }

        .contact-form {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .form-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .form-group label {
          font-size: 0.875rem;
          color: #737373;
        }

        .form-group input, 
        .form-group select, 
        .form-group textarea {
          background: #000;
          border: 1px solid #171717;
          border-radius: 8px;
          padding: 0.875rem;
          color: #fff;
          font-family: inherit;
        }

        .form-group input:focus, 
        .form-group select:focus, 
        .form-group textarea:focus {
          outline: none;
          border-color: #404040;
        }

        .submit-btn {
          background: #fff;
          color: #000;
          border: none;
          padding: 1rem;
          border-radius: 8px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          margin-top: 1rem;
        }

        .submit-btn:hover {
          background: #e5e5e5;
        }

        .status-msg {
          font-size: 0.875rem;
          color: #a3a3a3;
          text-align: center;
          margin-top: 1rem;
        }

        @media (max-width: 900px) {
          .contact-layout {
            grid-template-columns: 1fr;
            gap: 4rem;
          }
        }
      `}</style>
        </div>
    );
}
