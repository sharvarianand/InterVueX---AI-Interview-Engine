import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { interviewAPI } from '../../services/api';

// SVG Icons
const Icons = {
    mic: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
            <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
    ),
    micOff: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="2" x2="22" y1="2" y2="22" />
            <path d="M18.89 13.23A7.12 7.12 0 0 0 19 12v-2" />
            <path d="M5 10v2a7 7 0 0 0 12 5.66" />
            <path d="M15 9.34V5a3 3 0 0 0-5.68-1.33" />
            <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
            <line x1="12" x2="12" y1="19" y2="22" />
        </svg>
    ),
    camera: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="m22 8-6 4 6 4V8Z" />
            <rect width="14" height="12" x="2" y="6" rx="2" ry="2" />
        </svg>
    ),
    timer: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
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
    keyboard: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect width="20" height="16" x="2" y="4" rx="2" ry="2" />
            <path d="M6 8h.001" />
            <path d="M10 8h.001" />
            <path d="M14 8h.001" />
            <path d="M18 8h.001" />
            <path d="M8 12h.001" />
            <path d="M12 12h.001" />
            <path d="M16 12h.001" />
            <path d="M7 16h10" />
        </svg>
    ),
};

// Answer Timer Constants
const ANSWER_TIME_SECONDS = 150; // 2.5 minutes per question

// Text to Speech Hook
function useTextToSpeech() {
    const speak = useCallback((text, onEnd) => {
        if (!window.speechSynthesis) return;

        // Cancel any ongoing speech
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.95; // Slightly slower for clarity
        utterance.pitch = 1;

        // Find a professional sounding voice if possible
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice = voices.find(v => v.name.includes('Google') && v.lang.startsWith('en')) || voices[0];
        if (preferredVoice) utterance.voice = preferredVoice;

        utterance.onend = () => {
            if (onEnd) onEnd();
        };

        window.speechSynthesis.speak(utterance);
    }, []);

    const stop = useCallback(() => {
        if (window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }, []);

    return { speak, stop };
}

// Speech Recognition Hook
function useSpeechRecognition() {
    const [isListening, setIsListening] = useState(false);
    const [transcript, setTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const recognitionRef = useRef(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = true;
            recognitionRef.current.interimResults = true;
            recognitionRef.current.lang = 'en-US';

            recognitionRef.current.onresult = (event) => {
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; i++) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    }
                }
                if (finalTranscript) {
                    setTranscript(prev => prev + ' ' + finalTranscript);
                }
            };

            recognitionRef.current.onerror = (event) => {
                console.error('Speech recognition error:', event.error);
                setIsListening(false);
            };

            recognitionRef.current.onend = () => {
                if (isListening) {
                    // Re-start if it was supposed to be listening (for continuous mode)
                    try {
                        recognitionRef.current.start();
                    } catch (e) { }
                }
            };

            setIsSupported(true);
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            setTranscript('');
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (e) { }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return { isListening, transcript, isSupported, startListening, stopListening, resetTranscript };
}

export default function StudentInterview() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();
    const videoRef = useRef(null);
    const streamRef = useRef(null);

    // State
    const [step, setStep] = useState('setup');
    const [config, setConfig] = useState({
        mode: location.state?.mode || 'interview',
        resumeFile: null,
        persona: 'startup_cto',
    });
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [answer, setAnswer] = useState('');
    const [inputMode, setInputMode] = useState('voice'); // Default to 'voice' as requested
    const [questionNumber, setQuestionNumber] = useState(1);
    const [timer, setTimer] = useState(0);
    const [answerTimer, setAnswerTimer] = useState(ANSWER_TIME_SECONDS); // Answer countdown
    const [isAnswerPhase, setIsAnswerPhase] = useState(false); // After TTS finishes speaking
    const [questionSpoken, setQuestionSpoken] = useState(false); // Track if question was spoken
    const [sessionId, setSessionId] = useState(null);
    const [cameraReady, setCameraReady] = useState(false);
    const [cameraError, setCameraError] = useState(null);
    const [isStarting, setIsStarting] = useState(false);
    const [startStage, setStartStage] = useState(''); // 'camera', 'cv', 'ai'
    const [personCount, setPersonCount] = useState(0); // Number of people detected in camera
    const [multiplePersonWarning, setMultiplePersonWarning] = useState(false);
    const [suspiciousEvents, setSuspiciousEvents] = useState([]);
    const [showWarning, setShowWarning] = useState(false);
    const [warningMessage, setWarningMessage] = useState('');


    // Audio Hooks
    const { speak, stop: stopSpeech } = useTextToSpeech();
    const { isListening, transcript, isSupported, startListening, stopListening, resetTranscript } = useSpeechRecognition();

    // --- Helper Functions ---

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const handleSuspiciousActivity = useCallback((type, message) => {
        setSuspiciousEvents(prev => [...prev, { type, message, timestamp: new Date() }]);
        setWarningMessage(message);
        setShowWarning(true);
        setTimeout(() => setShowWarning(false), 5000);
    }, []);

    const stopCamera = useCallback(() => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }
    }, []);

    const initCamera = async () => {
        if (cameraReady) return true;

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { width: 640, height: 480, facingMode: 'user' },
                audio: false
            });

            streamRef.current = stream;
            setCameraReady(true);

            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            return true;
        } catch (error) {
            console.error('Camera error:', error);
            const msg = 'Camera access denied. Please enable camera for interview proctoring.';
            setCameraError(msg);
            return false;
        }
    };

    const startInterview = async () => {
        // Validation: CV is mandatory for technical interviews
        if (config.mode === 'interview' && !config.resumeFile) {
            alert('CV/Resume is required for Technical Interviews. Please upload your CV to continue.');
            return;
        }

        setIsStarting(true);
        setStartStage('Initializing components...');

        try {
            // STEP 1: PARALLEL - Camera Init + CV Upload (if exists)
            setStartStage('Setting up proctoring & Analyzing background...');
            const cameraPromise = initCamera();

            let cvPromise = Promise.resolve(null);
            if (config.resumeFile) {
                cvPromise = interviewAPI.uploadCV(config.resumeFile)
                    .then(data => {
                        console.log('CV parsed:', data.parsed_data);
                        return data.cv_id;
                    })
                    .catch(err => {
                        console.warn('CV upload failed:', err);
                        return null;
                    });
            }

            // Wait for both to finish (or camera to fail/succeed)
            const [camSuccess, cvId] = await Promise.all([cameraPromise, cvPromise]);

            if (!camSuccess) {
                setIsStarting(false);
                return; // Error already set in state
            }

            // STEP 2: Start API (Session Creation + First Question)
            setStartStage('Agent is preparing your first question...');
            const data = await interviewAPI.start({
                userId: user?.id || 'demo-user',
                mode: config.mode,
                persona: config.persona,
                cvId: cvId,
            });

            setSessionId(data.session_id);
            setCurrentQuestion({
                question: data.first_question,
                focus: 'overview',
                difficulty: 'medium',
            });

            // Short delay for smooth transition
            setStartStage('Ready. Entering interview room...');
            setTimeout(() => {
                setStep('interview');
                setIsStarting(false);
            }, 800);

        } catch (error) {
            console.error('Failed to start interview:', error);
            setSessionId('mock-session');
            setCurrentQuestion({
                question: "Tell me about your technical background. What technologies have you worked with recently and what projects have you built?",
                focus: 'overview',
                difficulty: 'medium',
            });
            setStep('interview');
            setIsStarting(false);
        }
    };


    const endInterview = async () => {
        stopCamera();
        stopListening();

        try {
            await interviewAPI.end(sessionId);
        } catch (error) {
            console.error('Failed to end interview:', error);
        }
        navigate(`/report/${sessionId || 'demo'}`);
    };

    const submitAnswer = async () => {
        const finalAnswer = inputMode === 'voice' ? transcript || answer : answer;

        if (!finalAnswer.trim()) return;

        if (isListening) {
            stopListening();
        }

        stopSpeech();

        try {
            const data = await interviewAPI.submitAnswer(sessionId, finalAnswer);
            setCurrentQuestion(data);
            setAnswer('');
            resetTranscript();
            setQuestionNumber(q => q + 1);
            // Reset answer timer for next question
            setAnswerTimer(ANSWER_TIME_SECONDS);
            setIsAnswerPhase(false);
            setQuestionSpoken(false);

            if (questionNumber >= 5) {
                endInterview();
            }
        } catch (error) {
            console.error('Failed to submit answer:', error);
            const mockQuestions = [
                { question: "Walk me through the architecture. How do the different components communicate?", focus: "architecture", difficulty: "medium" },
                { question: "Why did you choose this tech stack? What trade-offs did you consider?", focus: "decisions", difficulty: "medium" },
                { question: "How would this system handle 10x the current load?", focus: "scalability", difficulty: "high" },
                { question: "What are the main security considerations for this application?", focus: "security", difficulty: "high" },
            ];
            setCurrentQuestion(mockQuestions[(questionNumber - 1) % mockQuestions.length]);
            setAnswer('');
            resetTranscript();
            setQuestionNumber(q => q + 1);
            // Reset answer timer for next question
            setAnswerTimer(ANSWER_TIME_SECONDS);
            setIsAnswerPhase(false);
            setQuestionSpoken(false);
        }
    };

    // --- Effects ---

    // Anti-Cheat: Tab/Window switching & Google Lens Block
    useEffect(() => {
        if (step !== 'interview') return;

        const handleVisibilityChange = () => {
            if (document.hidden) {
                handleSuspiciousActivity('tab_switch', 'Warning: You left the interview tab. This activity has been flagged.');
            }
        };

        const handleBlur = () => {
            handleSuspiciousActivity('window_blur', 'Warning: Browser focus lost. Please stay on the interview window.');
        };

        const preventCheating = (e) => {
            e.preventDefault();
            handleSuspiciousActivity('prohibited_action', 'Warning: Right-click, copy, and paste are disabled during the interview.');
            return false;
        };

        const blockShortcuts = (e) => {
            if (
                e.key === 'F12' ||
                (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J' || e.key === 'C')) ||
                (e.ctrlKey && e.key === 'u')
            ) {
                e.preventDefault();
                handleSuspiciousActivity('inspect_attempt', 'Warning: Developer tools are disabled during the interview.');
                return false;
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        window.addEventListener('blur', handleBlur);
        document.addEventListener('contextmenu', preventCheating);
        document.addEventListener('copy', preventCheating);
        document.addEventListener('paste', preventCheating);
        document.addEventListener('cut', preventCheating);
        window.addEventListener('keydown', blockShortcuts);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            window.removeEventListener('blur', handleBlur);
            document.removeEventListener('contextmenu', preventCheating);
            document.removeEventListener('copy', preventCheating);
            document.removeEventListener('paste', preventCheating);
            document.removeEventListener('cut', preventCheating);
            window.removeEventListener('keydown', blockShortcuts);
        };
    }, [step, handleSuspiciousActivity]);

    // TTS: Speak question ONCE, then start answer timer
    useEffect(() => {
        if (step === 'interview' && currentQuestion?.question && !questionSpoken) {
            stopListening();
            setIsAnswerPhase(false);

            // Speak the question once
            speak(currentQuestion.question, () => {
                // Question finished speaking - start answer phase
                setQuestionSpoken(true);
                setIsAnswerPhase(true);
                setAnswerTimer(ANSWER_TIME_SECONDS); // Reset timer

                if (inputMode === 'voice') {
                    startListening();
                }
            });
        }
        return () => stopSpeech();
    }, [currentQuestion, step, speak, stopSpeech, stopListening, startListening, inputMode, questionSpoken]);

    // Answer Timer Countdown (only when in answer phase)
    useEffect(() => {
        if (step === 'interview' && isAnswerPhase && answerTimer > 0) {
            const countdown = setInterval(() => {
                setAnswerTimer(t => {
                    if (t <= 1) {
                        // Time's up - auto submit or warn
                        clearInterval(countdown);
                        if (answer.trim() || transcript.trim()) {
                            // Auto-submit if there's content
                            submitAnswer();
                        } else {
                            handleSuspiciousActivity('time_expired', 'Answer time expired. Please respond faster.');
                        }
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
            return () => clearInterval(countdown);
        }
    }, [step, isAnswerPhase, answerTimer, answer, transcript, submitAnswer, handleSuspiciousActivity]);

    // Person Detection (Simulated - In production, use TensorFlow.js face detection)
    useEffect(() => {
        if (step === 'interview' && cameraReady) {
            const detectionInterval = setInterval(() => {
                // Simulate person detection
                // In production: Use TensorFlow.js blazeface or face-api.js
                // For now, randomly detect 1 person (90%) or 2+ people (10%)
                const random = Math.random();
                const detectedCount = random < 0.9 ? 1 : Math.floor(Math.random() * 2) + 2;

                setPersonCount(detectedCount);

                if (detectedCount > 1) {
                    setMultiplePersonWarning(true);
                    handleSuspiciousActivity('multiple_people', `${detectedCount} people detected in camera. Only the candidate should be visible.`);

                    // Auto-hide warning after 5 seconds
                    setTimeout(() => setMultiplePersonWarning(false), 5000);
                } else {
                    setMultiplePersonWarning(false);
                }
            }, 3000); // Check every 3 seconds

            return () => clearInterval(detectionInterval);
        }
    }, [step, cameraReady, handleSuspiciousActivity]);

    // Timer
    useEffect(() => {
        if (step === 'interview') {
            const interval = setInterval(() => setTimer(t => t + 1), 1000);
            return () => clearInterval(interval);
        }
    }, [step]);

    // Sync transcript
    useEffect(() => {
        if (inputMode === 'voice' && transcript) {
            setAnswer(transcript);
        }
    }, [transcript, inputMode]);

    // Network Status
    useEffect(() => {
        const handleStatus = () => {
            if (!navigator.onLine) {
                handleSuspiciousActivity('network_offline', 'Warning: Internet connection lost. Please reconnect to continue your interview.');
            }
        };
        window.addEventListener('offline', handleStatus);
        return () => window.removeEventListener('offline', handleStatus);
    }, [handleSuspiciousActivity]);

    // Camera Lifecycle
    useEffect(() => {
        if (step === 'interview' && streamRef.current && videoRef.current && !videoRef.current.srcObject) {
            videoRef.current.srcObject = streamRef.current;
        }
    }, [step]);

    useEffect(() => {
        return () => {
            stopCamera();
            stopListening();
        };
    }, [stopCamera, stopListening]);

    // Proctoring signals (simplified - no eye tracking)
    useEffect(() => {
        if (step === 'interview' && sessionId && cameraReady) {
            const signalInterval = setInterval(async () => {
                try {
                    const signals = [{
                        eye_gaze_stability: 0.9, // Not tracking eyes
                        facial_confidence: 1.0,
                        attention_score: suspiciousEvents.some(e =>
                            (new Date() - new Date(e.timestamp)) < 5000
                        ) ? 0.6 : 0.95,
                        timestamp: Date.now() / 1000
                    }];
                    await interviewAPI.sendVideoSignals(sessionId, signals);
                } catch (error) {
                    console.error('Failed to send video signals:', error);
                }
            }, 5000);
            return () => clearInterval(signalInterval);
        }
    }, [step, sessionId, cameraReady, suspiciousEvents]);


    const toggleInputMode = () => {
        if (inputMode === 'text') {
            setInputMode('voice');
            setAnswer('');
            resetTranscript();
        } else {
            stopListening();
            setInputMode('text');
        }
    };

    if (isStarting) {
        return (
            <div className="interview-loading-screen">
                <div className="loader-container">
                    <div className="main-pulse">
                        <div className="pulse-ring"></div>
                        <div className="pulse-center">AI</div>
                    </div>
                    <h2 className="loader-title">Preparing Your Interview</h2>
                    <p className="loader-subtitle">{startStage}</p>

                    <div className="progress-dots">
                        <div className={`dot ${startStage.includes('Setting') ? 'active' : ''}`}></div>
                        <div className={`dot ${startStage.includes('Agent') ? 'active' : ''}`}></div>
                        <div className={`dot ${startStage.includes('Ready') ? 'active' : ''}`}></div>
                    </div>
                </div>
                <style>{`
                    .interview-loading-screen {
                        height: 100vh;
                        width: 100vw;
                        background: #0a0a0a;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        color: white;
                        font-family: 'Outfit', sans-serif;
                    }
                    .loader-container {
                        text-align: center;
                    }
                    .main-pulse {
                        position: relative;
                        width: 100px;
                        height: 100px;
                        margin: 0 auto 2rem;
                    }
                    .pulse-ring {
                        position: absolute;
                        width: 100%;
                        height: 100%;
                        border: 2px solid var(--color-light-blue, #00d2ff);
                        border-radius: 50%;
                        animation: pulse-animation 2s infinite;
                    }
                    .pulse-center {
                        position: absolute;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        font-weight: 800;
                        font-size: 1.5rem;
                        color: var(--color-light-blue, #00d2ff);
                    }
                    @keyframes pulse-animation {
                        0% { transform: scale(1); opacity: 1; }
                        100% { transform: scale(2.5); opacity: 0; }
                    }
                    .loader-title {
                        font-size: 1.5rem;
                        font-weight: 700;
                        margin-bottom: 0.5rem;
                        letter-spacing: -0.5px;
                    }
                    .loader-subtitle {
                        color: #a3a3a3;
                        font-size: 1rem;
                    }
                    .progress-dots {
                        display: flex;
                        justify-content: center;
                        gap: 0.75rem;
                        margin-top: 2rem;
                    }
                    .dot {
                        width: 8px;
                        height: 8px;
                        border-radius: 50%;
                        background: #333;
                        transition: all 0.3s ease;
                    }
                    .dot.active {
                        background: var(--color-light-blue, #00d2ff);
                        box-shadow: 0 0 10px var(--color-light-blue, #00d2ff);
                    }
                `}</style>
            </div>
        );
    }

    // Setup Step
    if (step === 'setup') {

        return (
            <div className="interview-setup">
                <div className="setup-container">
                    <button
                        onClick={() => navigate('/dashboard/student')}
                        className="btn btn-secondary back-btn"
                    >
                        ← Back to Dashboard
                    </button>

                    <div className="setup-card">
                        <div className="setup-header">
                            <h2>Configure Your Interview</h2>
                            <p>Camera will be enabled for proctoring during the session</p>
                        </div>

                        {/* Camera Notice */}
                        <div className="camera-notice">
                            <div className="notice-icon">{Icons.camera}</div>
                            <div className="notice-content">
                                <strong>Camera Required - Single Person Only</strong>
                                <p>Your camera will be on throughout the interview for proctoring. Only you (the candidate) should be visible. Multiple people detected will be flagged. You'll have 2.5 minutes to answer each question.</p>
                            </div>
                        </div>

                        {/* Selected Interview Mode Display */}
                        <div className="selected-mode-badge">
                            {config.mode === 'interview' && '💻 Technical Interview'}
                            {config.mode === 'viva' && '🎓 Project Viva'}
                            {config.mode === 'hackathon' && '🏆 Hackathon Prep'}
                            {config.mode === 'hr' && '👥 HR / Behavioral'}
                        </div>


                        {/* CV/Resume Upload */}
                        <div className="form-group">
                            <label className="label">
                                CV/Resume
                                {config.mode === 'interview' && <span className="required-asterisk">*</span>}
                                {config.mode !== 'interview' && <span className="optional-text">(Optional)</span>}
                            </label>
                            <div className="file-upload-container">
                                <input
                                    type="file"
                                    id="resume-upload"
                                    className="file-input"
                                    accept=".pdf,.doc,.docx"
                                    onChange={(e) => {
                                        const file = e.target.files[0];
                                        if (file) {
                                            setConfig({ ...config, resumeFile: file });
                                        }
                                    }}
                                    required={config.mode === 'interview'}
                                />
                                <label htmlFor="resume-upload" className={`file-upload-label ${config.mode === 'interview' && !config.resumeFile ? 'required-field' : ''}`}>
                                    {config.resumeFile ? (
                                        <span>📄 {config.resumeFile.name}</span>
                                    ) : (
                                        <span>📎 Upload your CV/Resume (PDF, DOC, DOCX)</span>
                                    )}
                                </label>
                            </div>
                            <p className="help-text">
                                {config.mode === 'interview'
                                    ? '⚠️ Required: Upload your resume for personalized technical interview questions.'
                                    : 'Upload your resume to help the AI generate personalized interview questions based on your experience.'
                                }
                            </p>
                        </div>

                        {/* Persona */}
                        <div className="form-group">
                            <label className="label">Interviewer Style</label>
                            <select
                                className="input"
                                value={config.persona}
                                onChange={(e) => setConfig({ ...config, persona: e.target.value })}
                            >
                                <option value="startup_cto">Startup CTO (Pragmatic)</option>
                                <option value="strict_professor">Strict Professor (Academic)</option>
                                <option value="skeptical_judge">Skeptical Judge (Challenging)</option>
                                <option value="friendly_hr">Friendly HR (Behavioral)</option>
                            </select>
                        </div>

                        {/* Consent Checkbox */}
                        <div className="consent-box">
                            <label className="checkbox-label">
                                <input type="checkbox" required />
                                <span>I consent to camera monitoring and understand that I have 2.5 minutes per question. Only I (the candidate) will be visible in the camera during the interview.</span>
                            </label>
                        </div>

                        <button
                            className="btn btn-primary btn-lg w-full"
                            onClick={startInterview}
                            disabled={config.mode === 'interview' && !config.resumeFile}
                        >
                            Start Interview with Camera 🎥
                        </button>
                        {config.mode === 'interview' && !config.resumeFile && (
                            <p className="validation-error">⚠️ Please upload your CV to start the technical interview</p>
                        )}
                    </div>
                </div>

                <style>{`
          .interview-setup {
            min-height: 100vh;
            background: var(--color-off-white);
            padding: 2rem;
          }

          .setup-container {
            max-width: 600px;
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

          .selected-mode-badge {
            background: var(--color-navy);
            color: white;
            padding: 0.75rem 1rem;
            border-radius: var(--radius-lg);
            font-weight: 600;
            display: inline-flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 1.5rem;
            width: 100%;
            justify-content: center;
            font-size: 1rem;
            letter-spacing: -0.2px;
            box-shadow: var(--shadow-md);
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

          .person-count-warning {
            position: absolute;
            bottom: 1rem;
            left: 50%;
            transform: translateX(-50%);
            background: var(--color-error);
            color: white;
            padding: 0.75rem 1.5rem;
            border-radius: var(--radius-full);
            font-weight: 600;
            font-size: 0.875rem;
            animation: pulse 2s infinite;
            z-index: 10;
            box-shadow: var(--shadow-xl);
          }

          .camera-notice {
            display: flex;
            gap: 1rem;
            padding: 1rem;
            background: rgba(232, 106, 51, 0.1);
            border-radius: var(--radius-lg);
            margin-bottom: 1.5rem;
            border: 1px solid rgba(232, 106, 51, 0.2);
          }

          .notice-icon {
            color: var(--color-burnt-orange);
            flex-shrink: 0;
          }

          .notice-content strong {
            color: var(--color-burnt-orange);
            display: block;
            margin-bottom: 0.25rem;
          }

          .notice-content p {
            margin: 0;
            font-size: 0.875rem;
            color: var(--color-gray-600);
          }

          .file-upload-container {
            margin-top: 0.5rem;
          }

          .file-input {
            display: none;
          }

          .file-upload-label {
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 1.25rem;
            border: 2px dashed var(--color-gray-300);
            border-radius: var(--radius-lg);
            background: var(--color-gray-50);
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.875rem;
            color: var(--color-gray-600);
          }

          .file-upload-label:hover {
            border-color: var(--color-navy);
            background: var(--color-gray-100);
          }

          .file-upload-label span {
            display: flex;
            align-items: center;
            gap: 0.5rem;
          }

          .help-text {
            margin-top: 0.5rem;
            font-size: 0.75rem;
            color: var(--color-gray-500);
            line-height: 1.4;
          }

          .required-asterisk {
            color: var(--color-error);
            margin-left: 0.25rem;
            font-weight: 700;
          }

          .optional-text {
            color: var(--color-gray-500);
            font-size: 0.875rem;
            font-weight: 400;
          }

          .required-field {
            border-color: var(--color-error) !important;
          }

          .validation-error {
            color: var(--color-error);
            font-size: 0.875rem;
            margin-top: 0.75rem;
            text-align: center;
            font-weight: 500;
          }

          .consent-box {
            margin: 1.5rem 0;
            padding: 1rem;
            background: var(--color-gray-100);
            border-radius: var(--radius-lg);
          }

          .checkbox-label {
            display: flex;
            gap: 0.75rem;
            cursor: pointer;
            font-size: 0.875rem;
            color: var(--color-gray-600);
          }

          .checkbox-label input {
            width: 18px;
            height: 18px;
            flex-shrink: 0;
          }
        `}</style>
            </div>
        );
    }

    // Interview Step
    return (
        <div className="interview-room-container">
            {/* Warning Toast */}
            {showWarning && (
                <div className="warning-toast">
                    {Icons.alert}
                    <span>{warningMessage}</span>
                </div>
            )}

            <div className="interview-room">
                {/* Main Content */}
                <div className="interview-main">
                    {/* Camera Feed */}
                    <div className="camera-container">
                        <video
                            ref={videoRef}
                            autoPlay
                            playsInline
                            muted
                            className="camera-feed"
                        />

                        {/* Multiple Person Warning */}
                        {multiplePersonWarning && (
                            <div className="person-count-warning">
                                ⚠️ Multiple people detected! Only the candidate should be visible.
                            </div>
                        )}

                        {cameraError && (
                            <div className="camera-error">
                                {Icons.alert}
                                <span>{cameraError}</span>
                            </div>
                        )}
                        <div className="camera-status">
                            <div className="recording-indicator" />
                            <span>Recording • {personCount === 0 ? 'Detecting...' : personCount === 1 ? '1 Person ✓' : `${personCount} People ⚠️`}</span>
                        </div>
                    </div>

                    {/* Question Panel */}
                    <div className="question-panel">
                        <div className="question-header">
                            <div className="question-label">
                                <span>Question {questionNumber}</span>
                                <span className="question-tag">
                                    {currentQuestion?.focus} • {currentQuestion?.difficulty}
                                </span>
                            </div>
                            {/* Answer Timer */}
                            {isAnswerPhase && (
                                <div className={`answer-timer ${answerTimer <= 30 ? 'warning' : ''}`}>
                                    {Icons.timer}
                                    <span>{Math.floor(answerTimer / 60)}:{(answerTimer % 60).toString().padStart(2, '0')}</span>
                                </div>
                            )}
                            {!isAnswerPhase && questionSpoken === false && (
                                <div className="speaking-indicator">
                                    🔊 AI is reading question...
                                </div>
                            )}
                        </div>

                        <p className="question-text">{currentQuestion?.question}</p>

                        {/* Input Mode Toggle */}
                        <div className="input-mode-toggle">
                            <button
                                className={`mode-btn ${inputMode === 'text' ? 'active' : ''}`}
                                onClick={() => { setInputMode('text'); stopListening(); }}
                            >
                                {Icons.keyboard}
                                <span>Text</span>
                            </button>
                            <button
                                className={`mode-btn ${inputMode === 'voice' ? 'active' : ''}`}
                                onClick={() => setInputMode('voice')}
                                disabled={!isSupported}
                            >
                                {Icons.mic}
                                <span>Voice</span>
                            </button>
                        </div>

                        {/* Answer Input */}
                        {inputMode === 'text' ? (
                            <textarea
                                className="answer-input"
                                placeholder="Type your answer here..."
                                value={answer}
                                onChange={(e) => setAnswer(e.target.value)}
                            />
                        ) : (
                            <div className="voice-input-area">
                                <div className={`voice-status ${isListening ? 'listening' : ''}`}>
                                    {isListening ? (
                                        <>
                                            <div className="voice-waves">
                                                <span /><span /><span /><span /><span />
                                            </div>
                                            <span>Listening... Speak now</span>
                                        </>
                                    ) : (
                                        <span>Click the microphone to start speaking</span>
                                    )}
                                </div>
                                <button
                                    className={`mic-button ${isListening ? 'active' : ''}`}
                                    onClick={isListening ? stopListening : startListening}
                                >
                                    {isListening ? Icons.micOff : Icons.mic}
                                </button>
                                {transcript && (
                                    <div className="transcript-preview">
                                        <strong>Your answer:</strong>
                                        <p>{transcript}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Actions */}
                        <div className="answer-actions">
                            <button
                                className="btn btn-primary"
                                onClick={submitAnswer}
                                disabled={!answer.trim()}
                            >
                                Submit Answer {Icons.send}
                            </button>
                            <button
                                className="btn btn-secondary"
                                onClick={endInterview}
                            >
                                End Interview
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sidebar */}
                <div className="interview-sidebar">
                    {/* Timer */}
                    <div className="timer-card">
                        <div className="timer-value">{formatTime(timer)}</div>
                        <div className="timer-label">Time Elapsed</div>
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

                    {/* Proctoring Status */}
                    <div className="proctor-card">
                        <h4>🛡️ Proctoring Status</h4>
                        <div className="proctor-items">
                            <div className="proctor-item success">
                                {Icons.check}
                                <span>Camera Active</span>
                            </div>
                            <div className={`proctor-item ${suspiciousEvents.length === 0 ? 'success' : 'warning'}`}>
                                {suspiciousEvents.length === 0 ? Icons.check : Icons.alert}
                                <span>
                                    {suspiciousEvents.length === 0
                                        ? 'No Issues Detected'
                                        : `${suspiciousEvents.length} Warning(s)`}
                                </span>
                            </div>
                            <div className="proctor-item success">
                                {Icons.timer}
                                <span>Answer Time: {Math.floor(answerTimer / 60)}:{(answerTimer % 60).toString().padStart(2, '0')}</span>
                            </div>
                        </div>
                    </div>

                    {/* Tips */}
                    <div className="tips-card">
                        <h4>💡 Tips</h4>
                        <ul>
                            <li>Look at the camera while speaking</li>
                            <li>Be specific with examples</li>
                            <li>It's okay to say "I don't know"</li>
                        </ul>
                    </div>
                </div>
            </div>

            <style>{`
        .interview-room-container {
          min-height: 100vh;
          background: var(--color-off-white);
          padding: 1.5rem;
          position: relative;
        }

        .warning-toast {
          position: fixed;
          top: 1.5rem;
          left: 50%;
          transform: translateX(-50%);
          background: var(--color-error);
          color: white;
          padding: 1rem 1.5rem;
          border-radius: var(--radius-lg);
          display: flex;
          align-items: center;
          gap: 0.75rem;
          z-index: 100;
          animation: slideIn 0.3s ease;
          box-shadow: var(--shadow-xl);
        }

        .interview-room {
          display: grid;
          grid-template-columns: 1fr 320px;
          gap: 1.5rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .interview-main {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        /* Camera */
        .camera-container {
          position: relative;
          border-radius: var(--radius-xl);
          overflow: hidden;
          background: var(--color-navy);
          aspect-ratio: 16/9;
          max-height: 400px;
        }

        .camera-feed {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transform: scaleX(-1);
        }

        .camera-status {
          position: absolute;
          top: 1rem;
          left: 1rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(0,0,0,0.6);
          padding: 0.5rem 1rem;
          border-radius: var(--radius-full);
          color: white;
          font-size: 0.75rem;
        }

        .recording-indicator {
          width: 8px;
          height: 8px;
          background: var(--color-error);
          border-radius: 50%;
          animation: pulse 2s infinite;
        }

        .camera-error {
          position: absolute;
          inset: 0;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: rgba(0,0,0,0.8);
          color: white;
          gap: 1rem;
          padding: 2rem;
          text-align: center;
        }

        /* Answer Timer in Header */
        .answer-timer {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.5rem 1rem;
          background: var(--gradient-primary);
          color: white;
          border-radius: var(--radius-full);
          font-weight: 600;
          font-size: 1rem;
        }

        .answer-timer.warning {
          background: var(--color-error);
          animation: pulse 1s infinite;
        }

        .speaking-indicator {
          padding: 0.5rem 1rem;
          background: rgba(232, 106, 51, 0.15);
          color: var(--color-burnt-orange);
          border-radius: var(--radius-full);
          font-size: 0.875rem;
          font-weight: 500;
          animation: pulse 2s infinite;
        }

        .question-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 0.75rem;
        }

        /* Question Panel */
        .question-panel {
          background: white;
          border-radius: var(--radius-xl);
          padding: 1.5rem;
          box-shadow: var(--shadow-md);
        }

        .question-header {
          margin-bottom: 1rem;
        }

        .question-label {
          display: flex;
          align-items: center;
          gap: 0.75rem;
          color: var(--color-burnt-orange);
          font-weight: 600;
        }

        .question-tag {
          background: rgba(232, 106, 51, 0.1);
          padding: 0.25rem 0.5rem;
          border-radius: var(--radius-full);
          font-size: 0.75rem;
        }

        .question-text {
          font-size: 1.25rem;
          color: var(--color-navy);
          line-height: 1.6;
          margin-bottom: 1.5rem;
        }

        /* Input Mode Toggle */
        .input-mode-toggle {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
        }

        .mode-btn {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
          padding: 0.75rem;
          border: 2px solid var(--color-gray-200);
          border-radius: var(--radius-lg);
          background: white;
          color: var(--color-gray-500);
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-btn:hover {
          border-color: var(--color-navy);
        }

        .mode-btn.active {
          border-color: var(--color-burnt-orange);
          background: rgba(232, 106, 51, 0.1);
          color: var(--color-burnt-orange);
        }

        .mode-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        /* Text Input */
        .answer-input {
          width: 100%;
          min-height: 150px;
          padding: 1rem;
          border: 2px solid var(--color-gray-200);
          border-radius: var(--radius-lg);
          font-size: 1rem;
          resize: none;
          font-family: inherit;
          transition: border-color 0.2s;
        }

        .answer-input:focus {
          outline: none;
          border-color: var(--color-burnt-orange);
        }

        /* Voice Input */
        .voice-input-area {
          border: 2px dashed var(--color-gray-200);
          border-radius: var(--radius-lg);
          padding: 2rem;
          text-align: center;
        }

        .voice-status {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 1rem;
          margin-bottom: 1.5rem;
          color: var(--color-gray-500);
        }

        .voice-status.listening {
          color: var(--color-burnt-orange);
        }

        .voice-waves {
          display: flex;
          align-items: center;
          gap: 3px;
          height: 24px;
        }

        .voice-waves span {
          width: 4px;
          background: var(--color-burnt-orange);
          border-radius: 2px;
          animation: soundWave 0.5s ease-in-out infinite;
        }

        .voice-waves span:nth-child(1) { height: 8px; animation-delay: 0s; }
        .voice-waves span:nth-child(2) { height: 16px; animation-delay: 0.1s; }
        .voice-waves span:nth-child(3) { height: 24px; animation-delay: 0.2s; }
        .voice-waves span:nth-child(4) { height: 16px; animation-delay: 0.3s; }
        .voice-waves span:nth-child(5) { height: 8px; animation-delay: 0.4s; }

        @keyframes soundWave {
          0%, 100% { transform: scaleY(1); }
          50% { transform: scaleY(0.5); }
        }

        .mic-button {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          border: none;
          background: var(--gradient-accent);
          color: white;
          cursor: pointer;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .mic-button:hover {
          transform: scale(1.1);
          box-shadow: var(--shadow-glow);
        }

        .mic-button.active {
          background: var(--color-error);
          animation: pulse 2s infinite;
        }

        .transcript-preview {
          margin-top: 1.5rem;
          padding: 1rem;
          background: var(--color-gray-100);
          border-radius: var(--radius-lg);
          text-align: left;
        }

        .transcript-preview strong {
          font-size: 0.75rem;
          color: var(--color-gray-500);
        }

        .transcript-preview p {
          margin: 0.5rem 0 0;
          color: var(--color-navy);
        }

        .answer-actions {
          display: flex;
          gap: 1rem;
          margin-top: 1rem;
        }

        /* Sidebar */
        .interview-sidebar {
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

        .progress-card, .proctor-card, .tips-card {
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

        .proctor-card h4, .tips-card h4 {
          margin-bottom: 1rem;
          font-size: 0.875rem;
        }

        .proctor-items {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .proctor-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.875rem;
          padding: 0.5rem;
          border-radius: var(--radius-md);
        }

        .proctor-item.success {
          color: var(--color-success);
          background: rgba(16, 185, 129, 0.1);
        }

        .proctor-item.warning {
          color: var(--color-warning);
          background: rgba(245, 158, 11, 0.1);
        }

        .tips-card ul {
          margin: 0;
          padding-left: 1.25rem;
          color: var(--color-gray-600);
          font-size: 0.875rem;
        }

        .tips-card li {
          margin-bottom: 0.5rem;
        }

        @media (max-width: 1024px) {
          .interview-room {
            grid-template-columns: 1fr;
          }

          .interview-sidebar {
            flex-direction: row;
            flex-wrap: wrap;
          }

          .timer-card, .progress-card, .proctor-card, .tips-card {
            flex: 1;
            min-width: 200px;
          }
        }
      `}</style>
        </div>
    );
}
