import { useState } from 'react';
import { Link } from 'react-router-dom';
import DashboardLayout from '../../components/layout/DashboardLayout';

export default function InterviewerCandidates() {
    const [viewMode, setViewMode] = useState('list'); // list, compare
    const [selectedCandidates, setSelectedCandidates] = useState([]);

    const candidates = [
        { id: '1', name: 'Alice Johnson', email: 'alice@example.com', project: 'E-commerce Platform', score: 85, status: 'Ready', date: 'Jan 25, 2026' },
        { id: '2', name: 'Bob Smith', email: 'bob@example.com', project: 'Chat Application', score: 72, status: 'Borderline', date: 'Jan 24, 2026' },
        { id: '3', name: 'Carol Davis', email: 'carol@example.com', project: 'ML Dashboard', score: 91, status: 'Ready', date: 'Jan 23, 2026' },
        { id: '4', name: 'David Lee', email: 'david@example.com', project: 'Social Media App', score: 58, status: 'Needs Work', date: 'Jan 22, 2026' },
        { id: '5', name: 'Eva Martinez', email: 'eva@example.com', project: 'Task Manager', score: 79, status: 'Borderline', date: 'Jan 21, 2026' },
        { id: '6', name: 'Frank Wilson', email: 'frank@example.com', project: 'Weather App', score: 88, status: 'Ready', date: 'Jan 20, 2026' },
    ];

    const getStatusStyle = (status) => {
        switch (status) {
            case 'Ready': return { bg: 'rgba(16, 185, 129, 0.1)', color: 'var(--color-success)' };
            case 'Borderline': return { bg: 'rgba(245, 158, 11, 0.1)', color: 'var(--color-warning)' };
            default: return { bg: 'rgba(239, 68, 68, 0.1)', color: 'var(--color-error)' };
        }
    };

    const toggleCandidate = (id) => {
        setSelectedCandidates(prev =>
            prev.includes(id) ? prev.filter(c => c !== id) : [...prev, id]
        );
    };

    const selectedData = candidates.filter(c => selectedCandidates.includes(c.id));

    return (
        <DashboardLayout role="interviewer">
            <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                    <h1 className="page-title">Candidates</h1>
                    <p className="page-subtitle">View and compare all evaluated candidates</p>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                        className={`btn ${viewMode === 'list' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('list')}
                    >
                        List View
                    </button>
                    <button
                        className={`btn ${viewMode === 'compare' ? 'btn-primary' : 'btn-secondary'}`}
                        onClick={() => setViewMode('compare')}
                        disabled={selectedCandidates.length < 2}
                    >
                        Compare ({selectedCandidates.length})
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="card" style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <select className="input" style={{ width: 'auto', minWidth: '150px' }}>
                    <option value="">All Status</option>
                    <option value="ready">Ready</option>
                    <option value="borderline">Borderline</option>
                    <option value="needs_work">Needs Work</option>
                </select>
                <input
                    type="text"
                    className="input"
                    placeholder="Search by name..."
                    style={{ width: 'auto', minWidth: '200px' }}
                />
                <div style={{ marginLeft: 'auto', color: 'var(--color-gray-500)' }}>
                    {candidates.length} candidates
                </div>
            </div>

            {viewMode === 'list' ? (
                /* List View */
                <div className="card">
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead>
                            <tr style={{ borderBottom: '2px solid var(--color-gray-200)' }}>
                                <th style={{ textAlign: 'left', padding: '1rem', width: '40px' }}>
                                    <input type="checkbox" style={{ width: '18px', height: '18px' }} />
                                </th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Candidate</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Project</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Score</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Status</th>
                                <th style={{ textAlign: 'left', padding: '1rem', color: 'var(--color-gray-500)', fontWeight: '600' }}>Date</th>
                                <th style={{ textAlign: 'right', padding: '1rem' }}></th>
                            </tr>
                        </thead>
                        <tbody>
                            {candidates.map((candidate) => (
                                <tr key={candidate.id} style={{ borderBottom: '1px solid var(--color-gray-100)' }}>
                                    <td style={{ padding: '1rem' }}>
                                        <input
                                            type="checkbox"
                                            checked={selectedCandidates.includes(candidate.id)}
                                            onChange={() => toggleCandidate(candidate.id)}
                                            style={{ width: '18px', height: '18px' }}
                                        />
                                    </td>
                                    <td style={{ padding: '1rem' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            <div style={{
                                                width: '40px',
                                                height: '40px',
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
                                            <div>
                                                <div style={{ fontWeight: '500' }}>{candidate.name}</div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--color-gray-400)' }}>{candidate.email}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--color-gray-600)' }}>{candidate.project}</td>
                                    <td style={{ padding: '1rem', fontWeight: '600' }}>{candidate.score}%</td>
                                    <td style={{ padding: '1rem' }}>
                                        <span style={{
                                            padding: '0.25rem 0.75rem',
                                            borderRadius: '999px',
                                            fontWeight: '600',
                                            fontSize: '0.875rem',
                                            ...getStatusStyle(candidate.status),
                                        }}>
                                            {candidate.status}
                                        </span>
                                    </td>
                                    <td style={{ padding: '1rem', color: 'var(--color-gray-500)' }}>{candidate.date}</td>
                                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                                        <Link to={`/evaluation/${candidate.id}`} className="btn btn-sm btn-secondary">
                                            View
                                        </Link>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ) : (
                /* Compare View */
                <div>
                    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${selectedData.length}, 1fr)`, gap: '1.5rem' }}>
                        {selectedData.map((candidate) => (
                            <div key={candidate.id} className="card">
                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{
                                        width: '80px',
                                        height: '80px',
                                        borderRadius: '50%',
                                        background: 'var(--color-light-blue)',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '2rem',
                                        fontWeight: '600',
                                        color: 'var(--color-navy)',
                                        margin: '0 auto 1rem',
                                    }}>
                                        {candidate.name[0]}
                                    </div>
                                    <h3>{candidate.name}</h3>
                                    <p style={{ margin: '0.25rem 0', color: 'var(--color-gray-500)' }}>{candidate.project}</p>
                                </div>

                                <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
                                    <div style={{ fontSize: '3rem', fontWeight: '700', color: 'var(--color-navy)' }}>
                                        {candidate.score}%
                                    </div>
                                    <span style={{
                                        padding: '0.5rem 1rem',
                                        borderRadius: '999px',
                                        fontWeight: '600',
                                        ...getStatusStyle(candidate.status),
                                    }}>
                                        {candidate.status}
                                    </span>
                                </div>

                                <Link to={`/evaluation/${candidate.id}`} className="btn btn-primary w-full">
                                    View Full Report
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
