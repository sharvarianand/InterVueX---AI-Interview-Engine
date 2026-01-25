import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function StudentReports() {
    const reports = [
        { id: '1', type: 'Technical Interview', date: 'Jan 25, 2026', score: 82, verdict: 'Ready' },
        { id: '2', type: 'Project Viva', date: 'Jan 23, 2026', score: 75, verdict: 'Borderline' },
        { id: '3', type: 'Hackathon Prep', date: 'Jan 20, 2026', score: 88, verdict: 'Ready' },
        { id: '4', type: 'Technical Interview', date: 'Jan 18, 2026', score: 65, verdict: 'Needs Work' },
        { id: '5', type: 'HR / Behavioral', date: 'Jan 15, 2026', score: 90, verdict: 'Ready' },
    ];

    const getVerdictStyle = (verdict) => {
        switch (verdict) {
            case 'Ready': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' };
            case 'Borderline': return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' };
            default: return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' };
        }
    };

    return (
        <DashboardLayout role="student">
            <div className="page-header">
                <h1 className="page-title">My Reports</h1>
                <p className="page-subtitle">View all your past interview reports and feedback</p>
            </div>

            {/* Filter Bar */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                <select className="input" style={{ width: 'auto', minWidth: '180px' }}>
                    <option value="">All Types</option>
                    <option value="interview">Technical Interview</option>
                    <option value="viva">Project Viva</option>
                    <option value="hackathon">Hackathon Prep</option>
                    <option value="hr">HR / Behavioral</option>
                </select>
                <select className="input" style={{ width: 'auto', minWidth: '150px' }}>
                    <option value="">All Time</option>
                    <option value="week">This Week</option>
                    <option value="month">This Month</option>
                    <option value="year">This Year</option>
                </select>
                <div style={{ marginLeft: 'auto', color: 'var(--color-gray-500)' }}>
                    {reports.length} reports found
                </div>
            </div>

            {/* Reports Grid */}
            <div style={{ display: 'grid', gap: '1rem' }}>
                {reports.map((report) => (
                    <div key={report.id} className="card" style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '1rem',
                    }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
                            <div style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: 'var(--radius-lg)',
                                background: 'var(--gradient-accent)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '1.5rem',
                                color: 'white',
                            }}>
                                {report.type.includes('Technical') ? '💻' :
                                    report.type.includes('Viva') ? '🎓' :
                                        report.type.includes('Hackathon') ? '🏆' : '👥'}
                            </div>
                            <div>
                                <h3 style={{ marginBottom: '0.25rem' }}>{report.type}</h3>
                                <p style={{ margin: 0, color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>
                                    {report.date}
                                </p>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                            <div style={{ textAlign: 'center' }}>
                                <div style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--color-navy)' }}>
                                    {report.score}%
                                </div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>Score</div>
                            </div>
                            <span style={{
                                padding: '0.5rem 1rem',
                                borderRadius: '999px',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                                ...getVerdictStyle(report.verdict),
                            }}>
                                {report.verdict}
                            </span>
                            <Link to={`/report/${report.id}`} className="btn btn-primary">
                                View Details
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
