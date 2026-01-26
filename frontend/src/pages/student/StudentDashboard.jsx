import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useState, useEffect } from 'react';
import { reportAPI } from '../../services/api';

// SVG Icons
const Icons = {
  arrow: (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  ),
};

export default function StudentDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);
  const [reports, setReports] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsVisible(true);

    const fetchReports = async () => {
      if (user?.id) {
        try {
          const data = await reportAPI.getAll(user.id);
          setReports(data || []);
        } catch (error) {
          console.error('Failed to fetch reports:', error);
        } finally {
          setIsLoading(false);
        }
      }
    };

    fetchReports();
  }, [user]);

  // Calculate dynamic stats
  const avgScore = reports.length > 0
    ? Math.round(reports.reduce((acc, r) => acc + (r.overall_score || 0), 0) / reports.length)
    : 0;

  const stats = [
    { value: reports.length.toString(), label: 'Interviews', sublabel: reports.length > 0 ? 'Total sessions' : 'Start your first!' },
    { value: `${avgScore}%`, label: 'Avg Score', sublabel: reports.length > 0 ? 'Overall performance' : 'No data yet' },
    { value: reports.length > 0 ? 'Ready' : '-', label: 'Latest Status', sublabel: reports[0]?.verdict || 'No verdict yet' },
  ];

  const interviewTypes = [
    {
      emoji: '💻',
      title: 'Technical Interview',
      description: 'Coding, system design, problem-solving',
      mode: 'interview',
    },
    {
      emoji: '🎓',
      title: 'Project Viva',
      description: 'Defend your project architecture',
      mode: 'viva',
    },
    {
      emoji: '🏆',
      title: 'Hackathon Prep',
      description: 'Innovation-focused jury questions',
      mode: 'hackathon',
    },
    {
      emoji: '👥',
      title: 'HR / Behavioral',
      description: 'Communication & cultural fit',
      mode: 'hr',
    },
  ];

  const recentSessions = reports.slice(0, 3).map(r => ({
    id: r.session_id,
    type: r.mode === 'viva' ? 'Project Viva' : r.mode === 'hackathon' ? 'Hackathon Prep' : 'Technical Interview',
    date: new Date(r.created_at || Date.now()).toLocaleDateString(),
    score: Math.round(r.overall_score || 0)
  }));


  return (
    <DashboardLayout role="student">
      {/* Header */}
      <div className={`page-header ${isVisible ? 'animate-fadeIn' : ''}`}>
        <div>
          <h1 className="page-title">
            Welcome back, {user?.name || 'there'} 👋
          </h1>
          <p className="page-subtitle">Ready to ace your next interview?</p>
        </div>
        <Link to="/interview" className="btn-primary">
          Quick Start
          {Icons.arrow}
        </Link>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`stat-card ${isVisible ? `animate-fadeInUp stagger-${i + 1}` : ''}`}
          >
            <div className="stat-value">{stat.value}</div>
            <div className="stat-label">{stat.label}</div>
            <div className="stat-sublabel">{stat.sublabel}</div>
          </div>
        ))}
      </div>

      {/* Interview Types */}
      <div className="section-header">
        <h2>Start New Interview</h2>
      </div>

      <div className="interview-grid">
        {interviewTypes.map((type, i) => (
          <div
            key={i}
            className={`interview-card ${isVisible ? `animate-scaleIn stagger-${i + 1}` : ''}`}
            onClick={() => navigate('/interview', { state: { mode: type.mode } })}
          >
            <div className="interview-emoji">{type.emoji}</div>
            <div className="interview-content">
              <h3>{type.title}</h3>
              <p>{type.description}</p>
            </div>
            <div className="interview-arrow">{Icons.arrow}</div>
          </div>
        ))}
      </div>

      {/* Recent Sessions */}
      <div className="section-header" style={{ marginTop: '2.5rem' }}>
        <h2>Recent Sessions</h2>
        <Link to="/reports" className="view-all">View All →</Link>
      </div>

      <div className={`sessions-card ${isVisible ? 'animate-fadeInUp' : ''}`}>
        {recentSessions.map((session, i) => (
          <div key={session.id} className="session-item">
            <div className="session-info">
              <div className="session-type">{session.type}</div>
              <div className="session-date">{session.date}</div>
            </div>
            <div className="session-score">
              <span className={session.score >= 80 ? 'high' : session.score >= 70 ? 'medium' : 'low'}>
                {session.score}%
              </span>
            </div>
            <Link to={`/report/${session.id}`} className="session-link">
              View →
            </Link>
          </div>
        ))}
      </div>

      <style>{`
        .page-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 2rem;
          flex-wrap: wrap;
          gap: 1rem;
        }

        .page-title {
          font-size: 1.5rem;
          font-weight: 700;
          color: #000;
          margin-bottom: 0.25rem;
        }

        .page-subtitle {
          color: #737373;
          margin: 0;
          font-size: 0.875rem;
        }

        .btn-primary {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: #000;
          color: #fff;
          padding: 0.75rem 1.25rem;
          border-radius: 8px;
          font-weight: 600;
          font-size: 0.875rem;
          text-decoration: none;
          transition: all 0.2s;
        }

        .btn-primary:hover {
          background: #262626;
        }

        /* Stats */
        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 1rem;
          margin-bottom: 2.5rem;
        }

        .stat-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 1.5rem;
          opacity: 0;
        }

        .stat-value {
          font-size: 2rem;
          font-weight: 800;
          color: #000;
          letter-spacing: -1px;
        }

        .stat-label {
          font-size: 0.875rem;
          color: #525252;
          margin-top: 0.25rem;
        }

        .stat-sublabel {
          font-size: 0.75rem;
          color: #a3a3a3;
          margin-top: 0.5rem;
        }

        /* Section Header */
        .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .section-header h2 {
          font-size: 1rem;
          font-weight: 600;
          color: #000;
          margin: 0;
        }

        .view-all {
          font-size: 0.875rem;
          color: #737373;
          text-decoration: none;
        }

        .view-all:hover {
          color: #000;
        }

        /* Interview Grid */
        .interview-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .interview-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          padding: 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          cursor: pointer;
          transition: all 0.2s;
          opacity: 0;
        }

        .interview-card:hover {
          border-color: #000;
        }

        .interview-emoji {
          font-size: 2rem;
          width: 56px;
          height: 56px;
          background: #fafafa;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .interview-content {
          flex: 1;
        }

        .interview-content h3 {
          font-size: 0.9375rem;
          font-weight: 600;
          color: #000;
          margin-bottom: 0.25rem;
        }

        .interview-content p {
          font-size: 0.8125rem;
          color: #737373;
          margin: 0;
        }

        .interview-arrow {
          color: #a3a3a3;
          transition: transform 0.2s;
        }

        .interview-card:hover .interview-arrow {
          transform: translateX(4px);
          color: #000;
        }

        /* Sessions */
        .sessions-card {
          background: #fff;
          border: 1px solid #e5e5e5;
          border-radius: 12px;
          overflow: hidden;
        }

        .session-item {
          display: flex;
          align-items: center;
          padding: 1rem 1.25rem;
          border-bottom: 1px solid #f5f5f5;
        }

        .session-item:last-child {
          border-bottom: none;
        }

        .session-info {
          flex: 1;
        }

        .session-type {
          font-weight: 500;
          color: #000;
          font-size: 0.875rem;
        }

        .session-date {
          font-size: 0.75rem;
          color: #a3a3a3;
        }

        .session-score span {
          padding: 0.375rem 0.75rem;
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .session-score .high {
          background: #f5f5f5;
          color: #000;
        }

        .session-score .medium {
          background: #fafafa;
          color: #525252;
        }

        .session-score .low {
          background: #fafafa;
          color: #737373;
        }

        .session-link {
          margin-left: 1rem;
          font-size: 0.8125rem;
          color: #737373;
          text-decoration: none;
        }

        .session-link:hover {
          color: #000;
        }

        /* Responsive */
        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }

          .interview-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </DashboardLayout>
  );
}
