import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

// Product Icon Component
export const ProductIcon = ({ size = 24, className = "" }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    <rect x="3" y="3" width="18" height="18" rx="4" />
    <path d="M9 12l2 2 4-4" />
  </svg>
);

// Icons
const Icons = {
  dashboard: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  ),
  interview: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m22 8-6 4 6 4V8Z" />
      <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
    </svg>
  ),
  reports: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14,2 14,8 20,8" />
      <line x1="16" x2="8" y1="13" y2="13" />
      <line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  ),
  progress: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 3v18h18" />
      <path d="m19 9-5 5-4-4-3 3" />
    </svg>
  ),
  candidates: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  analytics: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 21H4.6c-.56 0-.84 0-1.054-.109a1 1 0 0 1-.437-.437C3 20.24 3 19.96 3 19.4V3" />
      <path d="m7 14 4-4 4 4 6-6" />
    </svg>
  ),
  logout: (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" x2="9" y1="12" y2="12" />
    </svg>
  ),
};

export default function DashboardLayout({ children, role }) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const studentNavItems = [
    { path: '/dashboard/student', label: 'Dashboard', icon: Icons.dashboard },
    { path: '/interview', label: 'Start Interview', icon: Icons.interview },
    { path: '/reports', label: 'Reports', icon: Icons.reports },
    { path: '/progress', label: 'Progress', icon: Icons.progress },
  ];

  const interviewerNavItems = [
    { path: '/dashboard/interviewer', label: 'Dashboard', icon: Icons.dashboard },
    { path: '/session', label: 'New Evaluation', icon: Icons.interview },
    { path: '/candidates', label: 'Candidates', icon: Icons.candidates },
    { path: '/analytics', label: 'Analytics', icon: Icons.analytics },
  ];

  const navItems = role === 'student' ? studentNavItems : interviewerNavItems;

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <Link to="/" className="sidebar-logo">
            <ProductIcon size={22} className="sidebar-logo-icon" />
            <span>InterVueX</span>
          </Link>
        </div>

        <nav className="sidebar-nav">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name || 'User'}</span>
              <span className="user-role">{role}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            {Icons.logout}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {children}
      </main>

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
          background: #fafafa;
        }

        /* Sidebar */
        .sidebar {
          width: 260px;
          background: #000;
          color: #fff;
          display: flex;
          flex-direction: column;
          position: fixed;
          top: 0;
          left: 0;
          bottom: 0;
          z-index: 50;
        }

        .sidebar-header {
          padding: 1.5rem;
          border-bottom: 1px solid #171717;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          font-size: 1.25rem;
          font-weight: 800;
          color: #fff;
          text-decoration: none;
          letter-spacing: -0.5px;
        }

        .sidebar-logo-icon { color: #fff; }

        .sidebar-nav {
          flex: 1;
          padding: 1.5rem 0;
          overflow-y: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          padding: 0.875rem 1.5rem;
          color: #737373;
          text-decoration: none;
          font-size: 0.875rem;
          font-weight: 500;
          transition: all 0.15s ease;
          border-left: 3px solid transparent;
        }

        .nav-item i, .nav-item svg { flex-shrink: 0; }

        .nav-item:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.03);
        }

        .nav-item.active {
          color: #fff;
          background: rgba(255, 255, 255, 0.05);
          border-left-color: #fff;
        }

        .sidebar-footer {
          padding: 1rem 1.5rem;
          border-top: 1px solid #171717;
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .user-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .user-avatar {
          width: 36px;
          height: 36px;
          background: #262626;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 600;
          font-size: 0.875rem;
          border: 1px solid #333;
        }

        .user-details {
          display: flex;
          flex-direction: column;
        }

        .user-name {
          font-size: 0.875rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          max-width: 120px;
        }

        .user-role {
          font-size: 0.75rem;
          color: #525252;
          text-transform: capitalize;
        }

        .logout-btn {
          background: none;
          border: none;
          color: #525252;
          cursor: pointer;
          padding: 0.5rem;
          border-radius: 6px;
          transition: all 0.15s;
        }

        .logout-btn:hover {
          color: #fff;
          background: rgba(255, 255, 255, 0.1);
        }

        /* Main Content */
        .main-content {
          flex: 1;
          margin-left: 260px;
          padding: 2.5rem;
          min-height: 100vh;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .sidebar { width: 80px; }
          .sidebar-logo span, .nav-item span, .user-details { display: none; }
          .nav-item { padding: 1.25rem; justify-content: center; }
          .user-info { justify-content: center; }
          .main-content { margin-left: 80px; padding: 1.5rem; }
          .sidebar-header { padding: 1.5rem 0; display: flex; justify-content: center; }
        }
      `}</style>
    </div>
  );
}
