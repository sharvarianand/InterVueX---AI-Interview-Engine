import DashboardLayout from '../../components/layout/DashboardLayout';

export default function InterviewerAnalytics() {
    const monthlyData = [
        { month: 'Sep', evaluations: 8 },
        { month: 'Oct', evaluations: 12 },
        { month: 'Nov', evaluations: 15 },
        { month: 'Dec', evaluations: 10 },
        { month: 'Jan', evaluations: 18 },
    ];

    const statusBreakdown = [
        { status: 'Ready', count: 24, percentage: 53, color: 'var(--color-success)' },
        { status: 'Borderline', count: 14, percentage: 31, color: 'var(--color-warning)' },
        { status: 'Needs Work', count: 7, percentage: 16, color: 'var(--color-error)' },
    ];

    const topSkillGaps = [
        { skill: 'System Design', avgScore: 58 },
        { skill: 'Database Optimization', avgScore: 62 },
        { skill: 'Security Awareness', avgScore: 65 },
        { skill: 'Scalability', avgScore: 68 },
    ];

    const recentActivity = [
        { action: 'Evaluated Alice Johnson', time: '2 hours ago', type: 'evaluation' },
        { action: 'Compared 3 candidates', time: '5 hours ago', type: 'compare' },
        { action: 'Exported report for Bob', time: 'Yesterday', type: 'export' },
        { action: 'Created evaluation session', time: 'Yesterday', type: 'create' },
    ];

    const maxEvaluations = Math.max(...monthlyData.map(d => d.evaluations));

    return (
        <DashboardLayout role="interviewer">
            <div className="page-header">
                <h1 className="page-title">Analytics</h1>
                <p className="page-subtitle">Insights from your evaluations</p>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orange">📊</div>
                    <div>
                        <div className="stat-value">45</div>
                        <div className="stat-label">Total Evaluations</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">✅</div>
                    <div>
                        <div className="stat-value">53%</div>
                        <div className="stat-label">Ready Rate</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">⏱️</div>
                    <div>
                        <div className="stat-value">24m</div>
                        <div className="stat-label">Avg. Session Time</div>
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Evaluations Over Time */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Evaluations Over Time</h3>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '180px' }}>
                        {monthlyData.map((data, i) => (
                            <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                                <div style={{
                                    width: '100%',
                                    maxWidth: '50px',
                                    height: `${(data.evaluations / maxEvaluations) * 140}px`,
                                    background: 'var(--gradient-primary)',
                                    borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                    display: 'flex',
                                    alignItems: 'flex-start',
                                    justifyContent: 'center',
                                    paddingTop: '0.5rem',
                                    color: 'white',
                                    fontWeight: '600',
                                    fontSize: '0.875rem',
                                }}>
                                    {data.evaluations}
                                </div>
                                <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                                    {data.month}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Status Distribution */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Verdict Distribution</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {statusBreakdown.map((item, i) => (
                            <div key={i}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                                    <span style={{ fontWeight: '500' }}>{item.status}</span>
                                    <span style={{ color: 'var(--color-gray-500)' }}>{item.count} ({item.percentage}%)</span>
                                </div>
                                <div className="progress-bar" style={{ height: '12px' }}>
                                    <div style={{
                                        width: `${item.percentage}%`,
                                        height: '100%',
                                        background: item.color,
                                        borderRadius: 'var(--radius-full)',
                                    }} />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                {/* Common Skill Gaps */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Common Skill Gaps</h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', marginBottom: '1rem' }}>
                        Areas where candidates typically score lowest
                    </p>
                    {topSkillGaps.map((skill, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            padding: '0.75rem 0',
                            borderBottom: i < topSkillGaps.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                        }}>
                            <span>{skill.skill}</span>
                            <span style={{
                                fontWeight: '600',
                                color: skill.avgScore < 65 ? 'var(--color-error)' : 'var(--color-warning)',
                            }}>
                                {skill.avgScore}% avg
                            </span>
                        </div>
                    ))}
                </div>

                {/* Recent Activity */}
                <div className="card">
                    <h3 style={{ marginBottom: '1.5rem' }}>Recent Activity</h3>
                    {recentActivity.map((activity, i) => (
                        <div key={i} style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: '1rem',
                            padding: '0.75rem 0',
                            borderBottom: i < recentActivity.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                        }}>
                            <div style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                background: 'rgba(232, 106, 51, 0.1)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}>
                                {activity.type === 'evaluation' ? '📝' :
                                    activity.type === 'compare' ? '⚖️' :
                                        activity.type === 'export' ? '📄' : '➕'}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={{ fontWeight: '500' }}>{activity.action}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>{activity.time}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </DashboardLayout>
    );
}
