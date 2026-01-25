import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { useAuth } from '../../context/AuthContext';
import { reportAPI } from '../../services/api';

export default function StudentReport() {
    const { reportId } = useParams();
    const { user } = useAuth();

    const [report, setReport] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReport = async () => {
            if (reportId === 'demo') {
                setReport({
                    sessionId: 'demo',
                    date: new Date().toLocaleDateString(),
                    type: 'Technical Interview',
                    overallScore: 78,
                    verdict: 'Ready',
                    skills: [
                        { name: 'Technical Knowledge', score: 82, feedback: 'Strong understanding of core concepts' },
                        { name: 'Problem Solving', score: 75, feedback: 'Good approach, could improve on edge cases' },
                        { name: 'Communication', score: 85, feedback: 'Clear and articulate explanations' },
                        { name: 'System Design', score: 70, feedback: 'Basic understanding, needs more depth' },
                    ],
                    reasoningDepth: 72,
                    confidenceIndex: 80,
                    improvements: [
                        'Practice more system design problems',
                        'Work on explaining trade-offs more clearly',
                        'Study database optimization techniques',
                    ],
                    strengths: ['Clear communication', 'Strong fundamentals', 'Good project understanding'],
                    weaknesses: ['System design at scale', 'Edge case handling'],
                });
                setLoading(false);
                return;
            }

            try {
                const data = await reportAPI.get(reportId);
                // Map backend response to frontend structure if necessary
                setReport({
                    sessionId: data.session_id,
                    date: new Date(data.created_at || Date.now()).toLocaleDateString(),
                    type: data.mode === 'viva' ? 'Project Viva' : 'Technical Interview',
                    overallScore: data.overall_score,
                    verdict: data.verdict,
                    skills: data.skill_scores.map(s => ({
                        name: s.skill,
                        score: s.score,
                        feedback: s.feedback
                    })),
                    reasoningDepth: data.reasoning_depth_index * 10 || data.reasoning_depth_index, // Adjust scale if needed
                    confidenceIndex: data.confidence_index * 10 || data.confidence_index,
                    improvements: data.improvement_roadmap,
                    strengths: data.strengths,
                    weaknesses: data.weaknesses,
                });
            } catch (err) {
                console.error('Failed to fetch report:', err);
                setError('Failed to load report. Please try again later.');
            } finally {
                setLoading(false);
            }
        };

        fetchReport();
    }, [reportId]);

    if (loading) {
        return (
            <DashboardLayout role={user?.role || 'student'}>
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
                    <div className="loader">Loading report...</div>
                </div>
            </DashboardLayout>
        );
    }

    if (error || !report) {
        return (
            <DashboardLayout role={user?.role || 'student'}>
                <div style={{ textAlign: 'center', padding: '3rem' }}>
                    <h3>Error</h3>
                    <p>{error || 'Report not found.'}</p>
                    <Link to="/dashboard/student" className="btn btn-primary">Return to Dashboard</Link>
                </div>
            </DashboardLayout>
        );
    }

    const getVerdictColor = (verdict) => {
        switch (verdict) {
            case 'Ready': return 'var(--color-success)';
            case 'Borderline': return 'var(--color-warning)';
            default: return 'var(--color-error)';
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    return (
        <DashboardLayout role={user?.role || 'student'}>
            {/* Back Button */}
            <Link
                to={`/dashboard/${user?.role || 'student'}`}
                className="btn btn-secondary"
                style={{ marginBottom: '1.5rem' }}
            >
                ← Back to Dashboard
            </Link>

            {/* Report Header */}
            <div className="report-header">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Interview Report</h1>
                        <p style={{ color: 'var(--color-light-blue)' }}>
                            {report.type} • {report.date}
                        </p>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div className="score-circle">
                            <div className="score-value">{report.overallScore}</div>
                            <div className="score-label">Overall</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.5rem',
                                fontWeight: '700',
                                color: getVerdictColor(report.verdict),
                                background: 'rgba(255,255,255,0.1)',
                                padding: '0.5rem 1.5rem',
                                borderRadius: '999px',
                            }}>
                                {report.verdict}
                            </div>
                            <div style={{ color: 'var(--color-light-blue)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                Verdict
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Skills Grid */}
            <h2 style={{ marginBottom: '1.5rem' }}>Skill Breakdown</h2>
            <div className="skills-grid">
                {report.skills.map((skill, i) => (
                    <div key={i} className="skill-card">
                        <div className="skill-header">
                            <h4>{skill.name}</h4>
                            <span className="skill-score" style={{ color: getScoreColor(skill.score) }}>
                                {skill.score}%
                            </span>
                        </div>
                        <div className="progress-bar" style={{ marginBottom: '0.75rem' }}>
                            <div
                                className="progress-fill"
                                style={{
                                    width: `${skill.score}%`,
                                    background: getScoreColor(skill.score),
                                }}
                            />
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--color-gray-500)', margin: 0 }}>
                            {skill.feedback}
                        </p>
                    </div>
                ))}
            </div>

            {/* Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                {/* Reasoning Depth */}
                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>🧠 Reasoning Depth Index</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: 'var(--color-navy)'
                        }}>
                            {report.reasoningDepth}%
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${report.reasoningDepth}%` }} />
                            </div>
                        </div>
                    </div>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                        Measures how deeply you explain your reasoning and consider alternatives
                    </p>
                </div>

                {/* Confidence Index */}
                <div className="card">
                    <h4 style={{ marginBottom: '1rem' }}>💪 Confidence Index</h4>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{
                            fontSize: '2.5rem',
                            fontWeight: '700',
                            color: 'var(--color-navy)'
                        }}>
                            {report.confidenceIndex}%
                        </div>
                        <div style={{ flex: 1 }}>
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${report.confidenceIndex}%` }} />
                            </div>
                        </div>
                    </div>
                    <p style={{ marginTop: '0.75rem', fontSize: '0.875rem', color: 'var(--color-gray-500)' }}>
                        Measures how confidently you present your answers
                    </p>
                </div>
            </div>

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card">
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>✓ Strengths</h4>
                    <ul style={{ listStyle: 'none' }}>
                        {report.strengths.map((item, i) => (
                            <li key={i} style={{
                                padding: '0.75rem',
                                background: 'rgba(16, 185, 129, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '0.5rem',
                            }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="card">
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>⚠ Areas to Improve</h4>
                    <ul style={{ listStyle: 'none' }}>
                        {report.weaknesses.map((item, i) => (
                            <li key={i} style={{
                                padding: '0.75rem',
                                background: 'rgba(245, 158, 11, 0.1)',
                                borderRadius: 'var(--radius-md)',
                                marginBottom: '0.5rem',
                            }}>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Improvement Roadmap */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>🗺️ Improvement Roadmap</h4>
                <ol style={{ paddingLeft: '1.5rem' }}>
                    {report.improvements.map((item, i) => (
                        <li key={i} style={{
                            padding: '0.75rem 0',
                            borderBottom: i < report.improvements.length - 1 ? '1px solid var(--color-gray-100)' : 'none',
                            color: 'var(--color-gray-600)',
                        }}>
                            {item}
                        </li>
                    ))}
                </ol>
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: '3rem' }}>
                <Link to="/interview" className="btn btn-primary btn-lg">
                    Practice Again 🚀
                </Link>
            </div>
        </DashboardLayout>
    );
}
