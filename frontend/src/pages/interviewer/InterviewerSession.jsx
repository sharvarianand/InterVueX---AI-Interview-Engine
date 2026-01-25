import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

// SVG Icons
const Icons = {
    mic: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
    ),
    camera: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m22 8-6 4 6 4V8Z" />
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
    ),
    eye: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
            <circle cx="12" cy="12" r="3" />
        </svg>
    ),
    alert: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
            <path d="M12 9v4" />
            <path d="M12 17h.01" />
        </svg>
    ),
    check: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="20 6 9 17 4 12" />
        </svg>
    ),
    send: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m22 2-7 20-4-9-9-4Z" />
            <path d="M22 2 11 13" />
        </svg>
    ),
    skip: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5 4 15 12 5 20 5 4" />
            <line x1="19" x2="19" y1="5" y2="19" />
        </svg>
    ),
    refresh: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
            <path d="M3 3v5h5" />
            <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
            <path d="M16 16h5v5" />
        </svg>
    ),
    brain: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 5a3 3 0 1 0-5.997.125 4 4 0 0 0-2.526 5.77 4 4 0 0 0 .556 6.588A4 4 0 1 0 12 18Z" />
            <path d="M12 5a3 3 0 1 1 5.997.125 4 4 0 0 1 2.526 5.77 4 4 0 0 1-.556 6.588A4 4 0 1 1 12 18Z" />
        </svg>
    ),
};

// Candidate Monitoring Card
function CandidateMonitor({ suspiciousEvents }) {
    return (
        <div className="monitor-card">
            <h4>🛡️ Candidate Monitoring</h4>
            <div className="monitor-stats">
                <div className="monitor-stat">
                    <span className="stat-label">Eye Contact</span>
                    <div className="stat-bar">
                        <div className="stat-fill good" style={{ width: '85%' }} />
                    </div>
                    <span className="stat-value">85%</span>
                </div>
                <div className="monitor-stat">
                    <span className="stat-label">Focus Level</span>
                    <div className="stat-bar">
                        <div className="stat-fill good" style={{ width: '92%' }} />
                    </div>
                    <span className="stat-value">92%</span>
                </div>
                <div className="monitor-stat">
                    <span className="stat-label">Confidence</span>
                    <div className="stat-bar">
                        <div className="stat-fill medium" style={{ width: '78%' }} />
                    </div>
                    <span className="stat-value">78%</span>
                </div>
            </div>
            {suspiciousEvents.length > 0 && (
                <div className="monitor-alerts">
                    <h5>⚠️ Behavioral Flags ({suspiciousEvents.length})</h5>
                    {suspiciousEvents.slice(-3).map((event, i) => (
                        <div key={i} className="alert-item">
                            {event.message}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default function InterviewerSession() {
    const navigate = useNavigate();
    const videoRef = useRef(null);

    const [step, setStep] = useState('setup'); // setup, session
    const [config, setConfig] = useState({
        candidateName: '',
        candidateEmail: '',
        githubUrl: '',
        deploymentUrl: '',
        evaluationType: 'interview',
        strictness: 'neutral',
    });
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [candidateAnswer, setCandidateAnswer] = useState('');
    const [questionNumber, setQuestionNumber] = useState(1);
    const [sessionId, setSessionId] = useState(null);
    const [projectContext, setProjectContext] = useState(null);
    const [suggestedFollowUps, setSuggestedFollowUps] = useState([]);
    const [timer, setTimer] = useState(0);
    const [suspiciousEvents] = useState([]);
    const [isRecording, setIsRecording] = useState(false);

    // Timer effect
    useEffect(() => {
        if (step === 'session') {
            const interval = setInterval(() => setTimer(t => t + 1), 1000);
            return () => clearInterval(interval);
        }
    }, [step]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const mockQuestions = [
        { question: "Tell me about this project. What problem does it solve?", focus: "overview", difficulty: "low" },
        { question: "Walk me through the architecture. How do components communicate?", focus: "architecture", difficulty: "medium" },
        { question: "Why this tech stack? What alternatives did you consider?", focus: "decisions", difficulty: "medium" },
        { question: "How would this scale to 10x users?", focus: "scalability", difficulty: "high" },
        { question: "What are the security vulnerabilities?", focus: "security", difficulty: "high" },
    ];

    const generateFollowUps = () => {
        const followUps = [
            "Can you elaborate on that?",
            "What trade-offs did you consider?",
            "How would you approach it differently now?",
            "What's the worst-case scenario?",
            "Walk me through the implementation details",
            "How did you handle edge cases?",
        ];
        return followUps.sort(() => Math.random() - 0.5).slice(0, 3);
    };

    const startSession = async () => {
        try {
            const response = await fetch('http://localhost:8000/api/v1/interview/start', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    mode: config.evaluationType,
                    persona: config.strictness === 'strict' ? 'strict_professor' :
                        config.strictness === 'friendly' ? 'friendly_hr' : 'startup_cto',
                    github_url: config.githubUrl || null,
                    deployment_url: config.deploymentUrl || null,
                }),
            });
            const data = await response.json();
            setSessionId(data.session_id);
            setProjectContext({ summary: data.project_summary || 'Project analyzed successfully' });
            setCurrentQuestion({
                question: data.first_question,
                focus: 'overview',
                difficulty: 'medium',
            });
            setSuggestedFollowUps(generateFollowUps());
            setStep('session');
        } catch (error) {
            console.error('Failed to start session:', error);
            setSessionId('mock-session');
            setProjectContext({ summary: 'Project analyzed successfully' });
            setCurrentQuestion(mockQuestions[0]);
            setSuggestedFollowUps(generateFollowUps());
            setStep('session');
        }
    };

    const nextQuestion = async () => {
        if (questionNumber >= 5) {
            endSession();
            return;
        }

        try {
            const response = await fetch(`http://localhost:8000/api/v1/interview/${sessionId}/answer`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ answer: candidateAnswer }),
            });
            const data = await response.json();
            setCurrentQuestion(data);
        } catch (error) {
            setCurrentQuestion(mockQuestions[questionNumber % mockQuestions.length]);
        }

        setCandidateAnswer('');
        setQuestionNumber(q => q + 1);
        setSuggestedFollowUps(generateFollowUps());
    };

    const regenerateQuestion = async () => {
        try {
            const response = await fetch(`http://localhost:8000/api/v1/interview/${sessionId}/regenerate`, {
                method: 'POST',
            });
            const data = await response.json();
            setCurrentQuestion(data);
        } catch (error) {
            const randomQ = mockQuestions[Math.floor(Math.random() * mockQuestions.length)];
            setCurrentQuestion(randomQ);
        }
        setSuggestedFollowUps(generateFollowUps());
    };

    const askFollowUp = (followUp) => {
        setCurrentQuestion({
            question: followUp,
            focus: currentQuestion?.focus || 'follow-up',
            difficulty: 'medium',
        });
        setCandidateAnswer('');
    };

    const skipQuestion = () => {
        nextQuestion();
    };

    const endSession = async () => {
        try {
            await fetch(`http://localhost:8000/api/v1/interview/${sessionId}/end`, {
                method: 'POST',
            });
        } catch (error) {
            console.error('Failed to end session:', error);
        }
        navigate(`/evaluation/${sessionId || 'demo'}`);
    };

    // Setup Step
    if (step === 'setup') {
        return (
            <div className="session-setup">
                <div className="setup-container">
                    <button
                        onClick={() => navigate('/dashboard/interviewer')}
                        className="btn btn-secondary back-btn"
                    >
                        ← Back to Dashboard
                    </button>

                    <div className="setup-card">
                        <div className="setup-header">
                            <h2>Create New Evaluation</h2>
                            <p>Set up the evaluation session for your candidate</p>
                        </div>

                        {/* Candidate Info */}
                        <div className="section-title">
                            <span className="section-icon">👤</span>
                            <span>Candidate Information</span>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="label">Name</label>
                                <input
                                    type="text"
                                    className="input"
                                    placeholder="Candidate name"
                                    value={config.candidateName}
                                    onChange={(e) => setConfig({ ...config, candidateName: e.target.value })}
                                />
                            </div>
                            <div className="form-group">
                                <label className="label">Email</label>
                                <input
                                    type="email"
                                    className="input"
                                    placeholder="candidate@email.com"
                                    value={config.candidateEmail}
                                    onChange={(e) => setConfig({ ...config, candidateEmail: e.target.value })}
                                />
                            </div>
                        </div>

                        {/* Project Info */}
                        <div className="section-title">
                            <span className="section-icon">📁</span>
                            <span>Project Details</span>
                        </div>
                        <div className="form-group">
                            <label className="label">GitHub Repository URL</label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://github.com/username/project"
                                value={config.githubUrl}
                                onChange={(e) => setConfig({ ...config, githubUrl: e.target.value })}
                            />
                        </div>

                        <div className="form-group">
                            <label className="label">Live Deployment URL</label>
                            <input
                                type="url"
                                className="input"
                                placeholder="https://project.vercel.app"
                                value={config.deploymentUrl}
                                onChange={(e) => setConfig({ ...config, deploymentUrl: e.target.value })}
                            />
                        </div>

                        {/* Evaluation Settings */}
                        <div className="section-title">
                            <span className="section-icon">⚙️</span>
                            <span>Evaluation Settings</span>
                        </div>
                        <div className="form-row">
                            <div className="form-group">
                                <label className="label">Evaluation Type</label>
                                <select
                                    className="input"
                                    value={config.evaluationType}
                                    onChange={(e) => setConfig({ ...config, evaluationType: e.target.value })}
                                >
                                    <option value="interview">Technical Interview</option>
                                    <option value="viva">Project Viva</option>
                                    <option value="hackathon">Hackathon Jury</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label className="label">Evaluation Strictness</label>
                                <select
                                    className="input"
                                    value={config.strictness}
                                    onChange={(e) => setConfig({ ...config, strictness: e.target.value })}
                                >
                                    <option value="friendly">Friendly</option>
                                    <option value="neutral">Neutral</option>
                                    <option value="strict">Strict</option>
                                </select>
                            </div>
                        </div>

                        {/* Camera Notice */}
                        <div className="camera-notice">
                            <div className="notice-icon">{Icons.eye}</div>
                            <div className="notice-content">
                                <strong>Proctoring Enabled</strong>
                                <p>Candidate's camera will be monitored for eye tracking and behavioral analysis. You'll see real-time indicators.</p>
                            </div>
                        </div>

                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={startSession}
                        >
                            Start Evaluation 🎯
                        </button>
                    </div>
                </div>

                <style>{`
          .session-setup {
            min-height: 100vh;
            background: var(--color-off-white);
            padding: 2rem;
          }

          .setup-container {
            max-width: 700px;
            margin: 0 auto;
          }

          .back-btn {
            margin-bottom: 2rem;
          }

          .setup-card {
            background: white;
            border-radius: var(--radius-2xl);
            padding: 2rem;
            box-shadow: var(--shadow-lg);
          }

          .setup-header {
            text-align: center;
            margin-bottom: 2rem;
          }

          .setup-header h2 {
            margin-bottom: 0.5rem;
          }

          .setup-header p {
            color: var(--color-gray-500);
            margin: 0;
          }

          .section-title {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            font-weight: 600;
            color: var(--color-navy);
            margin: 1.5rem 0 1rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid var(--color-gray-100);
          }

          .section-icon {
            font-size: 1.25rem;
          }

          .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 1rem;
          }

          .camera-notice {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(30, 42, 94, 0.05);
            border-radius: var(--radius-lg);
            margin: 1.5rem 0;
            border: 1px solid rgba(30, 42, 94, 0.1);
          }

          .notice-icon {
            color: var(--color-navy);
            flex-shrink: 0;
          }

          .notice-content strong {
            color: var(--color-navy);
            display: block;
            margin-bottom: 0.25rem;
          }

          .notice-content p {
            margin: 0;
            font-size: 0.875rem;
            color: var(--color-gray-600);
          }

          @media (max-width: 600px) {
            .form-row {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
            </div>
        );
    }

    // Session Step
    return (
        <div className="session-room-container">
            <div className="session-room">
                {/* Main Content */}
                <div className="session-main">
                    {/* Video & Project Context Row */}
                    <div className="top-row">
                        {/* Candidate Video */}
                        <div className="candidate-video">
                            <div className="video-placeholder">
                                <div className="video-icon">{Icons.camera}</div>
                                <span>Candidate Camera Feed</span>
                                <span className="video-note">(Live during actual session)</span>
                            </div>
                            <div className="video-overlay">
                                <div className="recording-badge">
                                    <div className="recording-dot" />
                                    LIVE
                                </div>
                            </div>
                        </div>

                        {/* Project Context */}
                        <div className="project-context">
                            <h4>📁 Project Context</h4>
                            <p>{projectContext?.summary}</p>
                            <div className="context-links">
                                {config.githubUrl && (
                                    <a href={config.githubUrl} target="_blank" rel="noopener noreferrer" className="context-link">
                                        GitHub →
                                    </a>
                                )}
                                {config.deploymentUrl && (
                                    <a href={config.deploymentUrl} target="_blank" rel="noopener noreferrer" className="context-link">
                                        Live Demo →
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Question Panel */}
                    <div className="question-panel">
                        <div className="question-header">
                            <div className="question-info">
                                <span className="question-number">Question {questionNumber}</span>
                                <span className="question-tag">{currentQuestion?.focus} • {currentQuestion?.difficulty}</span>
                            </div>
                            <div className="question-actions">
                                <button className="icon-btn" onClick={regenerateQuestion} title="Regenerate Question">
                                    {Icons.refresh}
                                </button>
                                <button className="icon-btn" onClick={skipQuestion} title="Skip Question">
                                    {Icons.skip}
                                </button>
                            </div>
                        </div>

                        <p className="question-text">{currentQuestion?.question}</p>

                        {/* AI Badge */}
                        <div className="ai-badge">
                            {Icons.brain}
                            <span>AI Generated Question</span>
                        </div>

                        {/* Candidate Response */}
                        <div className="response-section">
                            <label className="label">Candidate's Response</label>
                            <textarea
                                className="answer-input"
                                placeholder="Record or type the candidate's answer..."
                                value={candidateAnswer}
                                onChange={(e) => setCandidateAnswer(e.target.value)}
                            />
                        </div>

                        {/* Actions */}
                        <div className="panel-actions">
                            <button
                                className="btn btn-primary"
                                onClick={nextQuestion}
                            >
                                Next Question {Icons.send}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={endSession}
                            >
                                End Evaluation
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="session-sidebar">
                    {/* Timer */}
                    <div className="timer-card">
                        <div className="timer-value">{formatTime(timer)}</div>
                        <div className="timer-label">Session Time</div>
                    </div>

                    {/* Progress */}
                    <div className="progress-card">
                        <div className="progress-header">
                            <span>Progress</span>
                            <span>{questionNumber}/5</span>
                        </div>
                        <div className="progress-bar">
                            <div
                                className="progress-fill"
                                style={{ width: `${(questionNumber / 5) * 100}%` }}
                            />
                        </div>
                    </div>

                    {/* Candidate Monitor */}
                    <CandidateMonitor suspiciousEvents={suspiciousEvents} />

                    {/* AI Suggested Follow-ups */}
                    <div className="followups-card">
                        <h4>🤖 AI Follow-ups</h4>
                        <div className="followup-buttons">
                            {suggestedFollowUps.map((followUp, i) => (
                                <button
                                    key={i}
                                    className="followup-btn"
                                    onClick={() => askFollowUp(followUp)}
                                >
                                    {followUp}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Candidate Info */}
                    <div className="candidate-card">
                        <h4>👤 Candidate</h4>
                        <p className="candidate-name">{config.candidateName || 'Anonymous'}</p>
                        <p className="candidate-email">{config.candidateEmail || 'No email'}</p>
                    </div>
                </div>
            </div>

            <style>{`
        .session-room-container {
          min-height: 100vh;
          background: var(--color-off-white);
          padding: 1.5rem;
        }

        .session-room {
          display: grid;
          grid-template-columns: 1fr 340px;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .session-main {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Top Row */
        .top-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .candidate-video {
          position: relative;
          background: var(--color-navy);
          border-radius: var(--radius-xl);
          aspect-ratio: 4/3;
          overflow: hidden;
        }

        .video-placeholder {
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          color: var(--color-light-blue);
          gap: 0.5rem;
        }

        .video-icon {
          opacity: 0.5;
        }

        .video-note {
          font-size: 0.75rem;
          opacity: 0.7;
        }

        .video-overlay {
          position: absolute;
          top: 1rem;
          left: 1rem;
        }

        .recording-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(239, 68, 68, 0.9);
          color: white;
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          font-weight: 600;
        }

        .recording-dot {
          width: 8px;
          height: 8px;
          background: white;
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .project-context {
          background: var(--color-light-blue);
          border-radius: var(--radius-xl);
          padding: 1.5rem;
        }

        .project-context h4 {
          margin-bottom: 0.75rem;
        }

        .project-context p {
          color: var(--color-navy);
          margin-bottom: 1rem;
        }

        .context-links {
          display: flex;
          gap: 1rem;
        }

        .context-link {
          color: var(--color-burnt-orange);
          font-weight: 600;
          font-size: 0.875rem;
        }

        /* Question Panel */
        .question-panel {
          background: white;
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .question-info {
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .question-number {
          font-weight: 600;
          color: var(--color-burnt-orange);
        }

        .question-tag {
          background: rgba(232, 106, 51, 0.1);
          color: var(--color-burnt-orange);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
        }

        .question-actions {
          display: flex;
          gap: 0.5rem;
        }

        .icon-btn {
          width: 40px;
          height: 40px;
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-gray-200);
          background: white;
          color: var(--color-gray-500);
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s;
        }

        .icon-btn:hover {
          border-color: var(--color-burnt-orange);
          color: var(--color-burnt-orange);
        }

        .question-text {
          font-size: 1.375rem;
          color: var(--color-navy);
          line-height: 1.5;
          margin-bottom: 1rem;
        }

        .ai-badge {
          display: inline-flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(30, 42, 94, 0.05);
          color: var(--color-navy);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
          margin-bottom: 1.5rem;
        }

        .response-section {
          margin-bottom: 1.5rem;
        }

        .answer-input {
          width: 100%;
          min-height: 120px;
          padding: 1rem;
          border: 2px solid var(--color-gray-200);
          border-radius: var(--radius-lg);
          font-size: 1rem;
          resize: none;
          font-family: inherit;
        }

        .answer-input:focus {
          outline: none;
          border-color: var(--color-burnt-orange);
        }

        .panel-actions {
          display: flex;
          gap: 1rem;
        }

        /* Sidebar */
        .session-sidebar {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timer-card {
          background: var(--gradient-primary);
          color: white;
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          text-align: center;
        }

        .timer-value {
          font-size: 2.5rem;
          font-weight: 700;
        }

        .timer-label {
          color: var(--color-light-blue);
          font-size: 0.875rem;
        }

        .progress-card, .followups-card, .candidate-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: 1.25rem;
          box-shadow: var(--shadow-md);
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.5rem;
          font-weight: 600;
        }

        .progress-bar {
          height: 8px;
          background: var(--color-gray-200);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--gradient-accent);
          border-radius: var(--radius-full);
          transition: width 0.3s ease;
        }

        /* Monitor Card */
        .monitor-card {
          background: white;
          border-radius: var(--radius-xl);
          padding: 1.25rem;
          box-shadow: var(--shadow-md);
        }

        .monitor-card h4 {
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .monitor-stats {
          display: flex;
          flex-direction: column;
          gap: 0.75rem;
        }

        .monitor-stat {
          display: grid;
          grid-template-columns: 80px 1fr 40px;
          align-items: center;
          gap: 0.5rem;
        }

        .stat-label {
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        .stat-bar {
          height: 6px;
          background: var(--color-gray-200);
          border-radius: var(--radius-full);
          overflow: hidden;
        }

        .stat-fill {
          height: 100%;
          border-radius: var(--radius-full);
        }

        .stat-fill.good {
          background: var(--color-success);
        }

        .stat-fill.medium {
          background: var(--color-warning);
        }

        .stat-fill.low {
          background: var(--color-error);
        }

        .stat-value {
          font-size: 0.75rem;
          font-weight: 600;
          text-align: right;
        }

        .monitor-alerts {
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid var(--color-gray-100);
        }

        .monitor-alerts h5 {
          font-size: 0.75rem;
          color: var(--color-warning);
          margin-bottom: 0.5rem;
        }

        .alert-item {
          font-size: 0.75rem;
          color: var(--color-gray-600);
          padding: 0.5rem;
          background: rgba(245, 158, 11, 0.1);
          border-radius: var(--radius-sm);
          margin-top: 0.25rem;
        }

        /* Follow-ups */
        .followups-card h4, .candidate-card h4 {
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .followup-buttons {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .followup-btn {
          padding: 0.75rem;
          border: 1px solid var(--color-gray-200);
          border-radius: var(--radius-md);
          background: white;
          color: var(--color-gray-600);
          font-size: 0.875rem;
          text-align: left;
          cursor: pointer;
          transition: all 0.2s;
        }

        .followup-btn:hover {
          border-color: var(--color-burnt-orange);
          color: var(--color-burnt-orange);
          background: rgba(232, 106, 51, 0.05);
        }

        .candidate-name {
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .candidate-email {
          font-size: 0.875rem;
          color: var(--color-gray-500);
          margin: 0;
        }

        @media (max-width: 1024px) {
          .session-room {
            grid-template-columns: 1fr;
          }

          .top-row {
            grid-template-columns: 1fr;
          }

          .session-sidebar {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .timer-card, .progress-card, .monitor-card, .followups-card, .candidate-card {
            flex: 1;
            min-width: 200px;
          }
        }
      `}</style>
        </div>
    );
}
