import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function RoleSelectPage() {
  const [selectedRole, setSelectedRole] = useState(null);
  const { selectRole, user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isAuthenticated && user?.role) {
      navigate(`/dashboard/${user.role}`, { replace: true });
    }
  }, [user, isAuthenticated, navigate]);

  const roles = [
    {
      id: 'student',
      emoji: '🎓',
      title: 'Student',
      description: 'Practice interviews, defend projects, and track your improvement',
      features: ['AI mock interviews', 'Project vivas', 'Performance reports', 'Progress tracking'],
    },
    {
      id: 'interviewer',
      emoji: '👔',
      title: 'Interviewer',
      description: 'Evaluate candidates with AI-assisted insights and objective scoring',
      features: ['Candidate evaluations', 'AI suggestions', 'Compare candidates', 'Analytics'],
    },
  ];

  const handleContinue = async () => {
    if (selectedRole) {
      await selectRole(selectedRole);
      navigate(`/dashboard/${selectedRole}`);
    }
  };

  return (
    <div className="role-page">
      <div className="role-container">
        <div className="role-header">
          <h1>Choose Your Role</h1>
          <p>Select how you want to use InterVueX today</p>
        </div>

        <div className="role-grid">
          {roles.map((role) => (
            <div
              key={role.id}
              className={`role-card ${selectedRole === role.id ? 'selected' : ''}`}
              onClick={() => setSelectedRole(role.id)}
            >
              <div className="role-check">
                {selectedRole === role.id && '✓'}
              </div>
              <div className="role-emoji">{role.emoji}</div>
              <h3>{role.title}</h3>
              <p className="role-description">{role.description}</p>
              <ul className="role-features">
                {role.features.map((feature, i) => (
                  <li key={i}>{feature}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <button
          className={`continue-btn ${selectedRole ? 'active' : ''}`}
          onClick={handleContinue}
          disabled={!selectedRole}
        >
          Continue as {selectedRole ? roles.find(r => r.id === selectedRole)?.title : '...'}
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M5 12h14" />
            <path d="m12 5 7 7-7 7" />
          </svg>
        </button>
      </div>

      <style>{`
        .role-page {
          min-height: 100vh;
          background: #fafafa;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2rem;
        }

        .role-container {
          max-width: 700px;
          width: 100%;
        }

        .role-header {
          text-align: center;
          margin-bottom: 2.5rem;
        }

        .role-header h1 {
          font-size: 2rem;
          font-weight: 700;
          color: #000;
          margin-bottom: 0.5rem;
          letter-spacing: -0.5px;
        }

        .role-header p {
          color: #737373;
          font-size: 0.9375rem;
          margin: 0;
        }

        .role-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1.5rem;
          margin-bottom: 2rem;
        }

        .role-card {
          background: #fff;
          border: 2px solid #e5e5e5;
          border-radius: 16px;
          padding: 2rem;
          cursor: pointer;
          transition: all 0.2s;
          position: relative;
        }

        .role-card:hover {
          border-color: #a3a3a3;
        }

        .role-card.selected {
          border-color: #000;
        }

        .role-check {
          position: absolute;
          top: 1.25rem;
          right: 1.25rem;
          width: 24px;
          height: 24px;
          border: 2px solid #e5e5e5;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          transition: all 0.2s;
        }

        .role-card.selected .role-check {
          background: #000;
          border-color: #000;
          color: #fff;
        }

        .role-emoji {
          font-size: 2.5rem;
          margin-bottom: 1rem;
        }

        .role-card h3 {
          font-size: 1.25rem;
          font-weight: 700;
          color: #000;
          margin-bottom: 0.5rem;
        }

        .role-description {
          font-size: 0.875rem;
          color: #737373;
          margin-bottom: 1.25rem;
          line-height: 1.5;
        }

        .role-features {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        .role-features li {
          font-size: 0.8125rem;
          color: #525252;
          padding: 0.5rem 0;
          border-bottom: 1px solid #f5f5f5;
        }

        .role-features li:last-child {
          border-bottom: none;
        }

        .role-features li::before {
          content: '✓ ';
          color: #a3a3a3;
          margin-right: 0.5rem;
        }

        .continue-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 1rem;
          background: #e5e5e5;
          color: #a3a3a3;
          border: none;
          border-radius: 12px;
          font-size: 1rem;
          font-weight: 600;
          cursor: not-allowed;
          transition: all 0.2s;
        }

        .continue-btn.active {
          background: #000;
          color: #fff;
          cursor: pointer;
        }

        .continue-btn.active:hover {
          background: #262626;
        }

        @media (max-width: 600px) {
          .role-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
