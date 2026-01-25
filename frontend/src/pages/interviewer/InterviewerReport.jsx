import { useParams, Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function InterviewerReport() {
    const { reportId } = useParams();

    // Mock report data for interviewer view
    const report = {
        sessionId: reportId,
        date: 'January 25, 2026',
        candidate: {
            name: 'Alice Johnson',
            email: 'alice@example.com',
            project: 'E-commerce Platform',
            githubUrl: 'https://github.com/alice/ecommerce',
        },
        type: 'Technical Interview',
        overallScore: 85,
        verdict: 'Ready',
        recommendation: 'Hire',
        skills: [
            { name: 'Technical Knowledge', score: 88, feedback: 'Excellent understanding of system architecture' },
            { name: 'Problem Solving', score: 82, feedback: 'Strong analytical skills, considers edge cases' },
            { name: 'Communication', score: 90, feedback: 'Very clear and articulate explanations' },
            { name: 'System Design', score: 80, feedback: 'Good scalability awareness' },
        ],
        projectUnderstanding: 88,
        reasoningDepth: 85,
        confidenceIndex: 82,
        behavioralConsistency: 90,
        strengths: [
            'Clear communication and articulation',
            'Strong technical fundamentals',
            'Deep understanding of their own project',
            'Good awareness of trade-offs',
        ],
        weaknesses: [
            'Could improve on database optimization',
            'Limited experience with high-scale systems',
        ],
        notes: 'Candidate demonstrated strong technical skills and excellent communication. Highly recommended for mid-level engineering positions.',
    };

    const getRecommendationStyle = (rec) => {
        switch (rec) {
            case 'Hire': return { bg: 'var(--color-success)', text: 'white' };
            case 'Borderline': return { bg: 'var(--color-warning)', text: 'white' };
            default: return { bg: 'var(--color-error)', text: 'white' };
        }
    };

    const getScoreColor = (score) => {
        if (score >= 80) return 'var(--color-success)';
        if (score >= 60) return 'var(--color-warning)';
        return 'var(--color-error)';
    };

    return (
        <DashboardLayout role="interviewer">
            {/* Back Button */}
            <Link
                to="/dashboard/interviewer"
                className="btn btn-secondary"
                style={{ marginBottom: '1.5rem' }}
            >
                ← Back to Dashboard
            </Link>

            {/* Report Header */}
            <div className="report-header">
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '2rem' }}>
                    <div>
                        <h1 style={{ color: 'white', marginBottom: '0.5rem' }}>Evaluation Report</h1>
                        <p style={{ color: 'var(--color-light-blue)', marginBottom: '1rem' }}>
                            {report.type} • {report.date}
                        </p>

                        {/* Candidate Info */}
                        <div style={{
                            background: 'rgba(255,255,255,0.1)',
                            padding: '1rem',
                            borderRadius: 'var(--radius-lg)',
                            display: 'inline-block',
                        }}>
                            <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>{report.candidate.name}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-light-blue)' }}>{report.candidate.email}</div>
                            <div style={{ fontSize: '0.875rem', color: 'var(--color-light-blue)', marginTop: '0.5rem' }}>
                                📁 {report.candidate.project}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
                        <div className="score-circle">
                            <div className="score-value">{report.overallScore}</div>
                            <div className="score-label">Overall</div>
                        </div>
                        <div style={{ textAlign: 'center' }}>
                            <div style={{
                                fontSize: '1.25rem',
                                fontWeight: '700',
                                background: getRecommendationStyle(report.recommendation).bg,
                                color: getRecommendationStyle(report.recommendation).text,
                                padding: '0.75rem 2rem',
                                borderRadius: 'var(--radius-lg)',
                            }}>
                                {report.recommendation}
                            </div>
                            <div style={{ color: 'var(--color-light-blue)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
                                Recommendation
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Key Metrics */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
                {[
                    { label: 'Project Understanding', value: report.projectUnderstanding, icon: '📁' },
                    { label: 'Reasoning Depth', value: report.reasoningDepth, icon: '🧠' },
                    { label: 'Confidence Index', value: report.confidenceIndex, icon: '💪' },
                    { label: 'Behavioral Consistency', value: report.behavioralConsistency, icon: '🎯' },
                ].map((metric, i) => (
                    <div key={i} className="card" style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{metric.icon}</div>
                        <div style={{ fontSize: '2rem', fontWeight: '700', color: getScoreColor(metric.value) }}>
                            {metric.value}%
                        </div>
                        <div style={{ color: 'var(--color-gray-500)', fontSize: '0.875rem' }}>{metric.label}</div>
                    </div>
                ))}
            </div>

            {/* Skills Grid */}
            <h2 style={{ marginBottom: '1.5rem' }}>Skill Assessment</h2>
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

            {/* Strengths & Weaknesses */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '2rem' }}>
                <div className="card">
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-success)' }}>✓ Key Strengths</h4>
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
                    <h4 style={{ marginBottom: '1rem', color: 'var(--color-warning)' }}>⚠ Areas of Concern</h4>
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

            {/* Interviewer Notes */}
            <div className="card" style={{ marginTop: '2rem' }}>
                <h4 style={{ marginBottom: '1rem' }}>📝 Evaluation Notes</h4>
                <p style={{ color: 'var(--color-gray-600)', lineHeight: '1.8' }}>
                    {report.notes}
                </p>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                <button className="btn btn-primary btn-lg">
                    📧 Share Report
                </button>
                <button className="btn btn-navy btn-lg">
                    📄 Export PDF
                </button>
                <button className="btn btn-secondary btn-lg">
                    📊 Compare with Others
                </button>
            </div>
        </DashboardLayout>
    );
}
