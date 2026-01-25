import DashboardLayout from '../../components/layout/DashboardLayout';

export default function StudentProgress() {
    const weeklyData = [
        { week: 'Week 1', score: 62 },
        { week: 'Week 2', score: 68 },
        { week: 'Week 3', score: 71 },
        { week: 'Week 4', score: 75 },
        { week: 'Week 5', score: 78 },
    ];

    const skillProgress = [
        { skill: 'Technical Knowledge', current: 82, previous: 70, change: 12 },
        { skill: 'Problem Solving', current: 75, previous: 68, change: 7 },
        { skill: 'Communication', current: 85, previous: 80, change: 5 },
        { skill: 'System Design', current: 70, previous: 55, change: 15 },
        { skill: 'Behavioral', current: 88, previous: 82, change: 6 },
    ];

    const achievements = [
        { icon: '🎯', title: '5 Interviews Completed', date: 'Jan 20, 2026' },
        { icon: '📈', title: 'Score Improved 15%', date: 'Jan 18, 2026' },
        { icon: '⭐', title: 'First "Ready" Verdict', date: 'Jan 15, 2026' },
        { icon: '🔥', title: '3-Day Streak', date: 'Jan 12, 2026' },
    ];

    const maxScore = Math.max(...weeklyData.map(d => d.score));

    return (
        <DashboardLayout role="student">
            <div className="page-header">
                <h1 className="page-title">My Progress</h1>
                <p className="page-subtitle">Track your improvement over time</p>
            </div>

            {/* Summary Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon orange">📊</div>
                    <div>
                        <div className="stat-value">78%</div>
                        <div className="stat-label">Current Average</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon green">📈</div>
                    <div>
                        <div className="stat-value">+16%</div>
                        <div className="stat-label">Improvement</div>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon blue">🎯</div>
                    <div>
                        <div className="stat-value">12</div>
                        <div className="stat-label">Total Sessions</div>
                    </div>
                </div>
            </div>

            {/* Progress Chart */}
            <div className="card" style={{ marginBottom: '2rem' }}>
                <h3 style={{ marginBottom: '1.5rem' }}>Score Trend</h3>
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem', height: '200px' }}>
                    {weeklyData.map((data, i) => (
                        <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                            <div style={{
                                width: '100%',
                                maxWidth: '60px',
                                height: `${(data.score / maxScore) * 150}px`,
                                background: 'var(--gradient-accent)',
                                borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
                                display: 'flex',
                                alignItems: 'flex-start',
                                justifyContent: 'center',
                                paddingTop: '0.5rem',
                                color: 'white',
                                fontWeight: '600',
                                fontSize: '0.875rem',
                            }}>
                                {data.score}%
                            </div>
                            <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>
                                {data.week}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Skill Progress */}
            <h2 style={{ marginBottom: '1.5rem' }}>Skill Breakdown</h2>
            <div className="card" style={{ marginBottom: '2rem' }}>
                {skillProgress.map((skill, i) => (
                    <div key={i} style={{
                        padding: '1rem 0',
                        borderBottom: i < skillProgress.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                            <span style={{ fontWeight: '600' }}>{skill.skill}</span>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                <span style={{
                                    color: skill.change > 0 ? 'var(--color-success)' : 'var(--color-error)',
                                    fontSize: '0.875rem',
                                    fontWeight: '600',
                                }}>
                                    {skill.change > 0 ? '+' : ''}{skill.change}%
                                </span>
                                <span style={{ fontWeight: '700', color: 'var(--color-navy)' }}>{skill.current}%</span>
                            </div>
                        </div>
                        <div className="progress-bar" style={{ height: '10px' }}>
                            <div
                                className="progress-fill"
                                style={{ width: `${skill.current}%` }}
                            />
                        </div>
                    </div>
                ))}
            </div>

            {/* Achievements */}
            <h2 style={{ marginBottom: '1.5rem' }}>Achievements</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1rem' }}>
                {achievements.map((achievement, i) => (
                    <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            width: '50px',
                            height: '50px',
                            borderRadius: '50%',
                            background: 'rgba(232, 106, 51, 0.1)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                        }}>
                            {achievement.icon}
                        </div>
                        <div>
                            <div style={{ fontWeight: '600' }}>{achievement.title}</div>
                            <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-500)' }}>{achievement.date}</div>
                        </div>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
