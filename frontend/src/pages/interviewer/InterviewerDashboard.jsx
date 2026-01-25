import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function InterviewerDashboard() {
    const { user } = useAuth();
    const navigate = useNavigate();

    const stats = [
        { icon: '👥', value: '45', label: 'Candidates Evaluated', color: 'orange' },
        { icon: '📋', value: '12', label: 'Pending Reviews', color: 'blue' },
        { icon: '✅', value: '38', label: 'Completed This Month', color: 'green' },
    ];

    const recentCandidates = [
        { id: '1', name: 'Alice Johnson', project: 'E-commerce Platform', score: 85, status: 'Ready' },
        { id: '2', name: 'Bob Smith', project: 'Chat Application', score: 72, status: 'Borderline' },
        { id: '3', name: 'Carol Davis', project: 'ML Dashboard', score: 91, status: 'Ready' },
        { id: '4', name: 'David Lee', project: 'Social Media App', score: 58, status: 'Needs Work' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Ready': return { bg: 'rgba(16, 185, 129, 0.1)', text: 'var(--color-success)' };
            case 'Borderline': return { bg: 'rgba(245, 158, 11, 0.1)', text: 'var(--color-warning)' };
            default: return { bg: 'rgba(239, 68, 68, 0.1)', text: 'var(--color-error)' };
        }
    };

    return (
        <DashboardLayout role="interviewer">
            {/* Header */}
            <div className="page-header">
                <h1 className="page-title">Interviewer Dashboard</h1>
                <p className="page-subtitle">Evaluate candidates with AI-powered insights</p>
            </div>

            {/* Stats */}
            <div className="stats-grid">
                {stats.map((stat, i) => (
                    <div key={i} className="stat-card">
                        <div className={`stat-icon ${stat.color}`}>
                            {stat.icon}
                        </div>
                        <div>
                            <div className="stat-value">{stat.value}</div>
                            <div className="stat-label">{stat.label}</div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <h2 style={{ marginBottom: '1.5rem' }}>Quick Actions</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
                <div
                    className="interview-card"
                    onClick={() => navigate('/session')}
                >
                    <div className="interview-card-icon">
                        📝
                    </div>
                    <h3>Create Evaluation</h3>
                    <p>Start a new candidate evaluation session</p>
                    <button className="btn btn-primary">
                        Start Now →
                    </button>
                </div>

                <div
                    className="interview-card"
                    onClick={() => navigate('/candidates')}
                >
                    <div className="interview-card-icon" style={{ background: 'var(--gradient-primary)' }}>
                        📊
                    </div>
                    <h3>Compare Candidates</h3>
                    <p>View and compare multiple candidate reports</p>
                    <button className="btn btn-navy">
                        View All →
                    </button>
                </div>
            </div>

            {/* Recent Candidates */}
            <h2 style={{ marginBottom: '1.5rem' }}>Recent Evaluations</h2>
            <div className="card">
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ borderBottom: '2px solid var(--color-gray-200)' }}>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Candidate</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Project</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Score</th>
                            <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Status</th>
                            <th style={{ textAlign: 'right', padding: '1rem' }}></th>
                        </tr>
                    </thead>
                    <tbody>
                        {recentCandidates.map((candidate) => (
                            <tr key={candidate.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                                <td style={{ padding: '1rem' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: 'var(--color-light-blue)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            fontWeight: '600',
                                            color: 'var(--color-navy)',
                                        }}>
                                            {candidate.name[0]}
                                        </div>
                                        <span style={{ fontWeight: '500' }}>{candidate.name}</span>
                                    </div>
                                </td>
                                <td style={{ padding: '1rem', color: 'var(--color-gray-500)' }}>{candidate.project}</td>
                                <td style={{ padding: '1rem', fontWeight: '600' }}>{candidate.score}%</td>
                                <td style={{ padding: '1rem' }}>
                                    <span style={{
                                        background: getStatusColor(candidate.status).bg,
                                        color: getStatusColor(candidate.status).text,
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '999px',
                                        fontWeight: '600',
                                        fontSize: '0.875rem',
                                    }}>
                                        {candidate.status}
                                    </span>
                                </td>
                                <td style={{ padding: '1rem', textAlign: 'right' }}>
                                    <Link to={`/evaluation/${candidate.id}`} className="btn btn-sm btn-secondary">
                                        View Report
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </DashboardLayout>
    );
}
