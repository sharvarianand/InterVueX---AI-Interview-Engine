import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Mic,
    MicOff,
    Video,
    VideoOff,
    Clock,
    ChevronRight,
    AlertTriangle,
    CheckCircle2,
    Maximize,
    Volume2,
    Send,
    Brain,
    User,
    MessageSquare,
    Flag,
    Pause,
    Sparkles,
    Download,
    FileText,
    X
} from 'lucide-react';
import { useStore, useMemoryStore } from '../store/useStore';
import { useInterview } from '../hooks/useInterview';
import { reportsAPI } from '../services/api';
import { speechService } from '../services/speechService';
import MiniAISphere from '../components/common/MiniAISphere';

const TOTAL_QUESTIONS = 5; // Fixed 5 questions

export default function LiveInterviewPage() {
    const navigate = useNavigate();
    const {
        setupData,
        setInterviewStatus,
        addAnswer,
        addReport,
        proctoring,
        setProctoringState,
        addViolation
    } = useStore();
    const { addToHistory } = useMemoryStore();
    const { startInterview, getNextQuestion, submitAnswer, endInterview, currentSession } = useInterview();

    // Interview state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [currentQuestion, setCurrentQuestion] = useState(null);
    const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes per question
    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState(null);
    const [userResponse, setUserResponse] = useState('');
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [violations, setViolations] = useState([]);
    const [showCompletionPopup, setShowCompletionPopup] = useState(false);
    const [generatedReport, setGeneratedReport] = useState(null);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [faceDetected, setFaceDetected] = useState(false);
    const [faceCount, setFaceCount] = useState(0);
    const [postureScore, setPostureScore] = useState(null);
    const [speakingStyle, setSpeakingStyle] = useState(null);

    // Feedback state
    const [rating, setRating] = useState(0);
    const [hoverRating, setHoverRating] = useState(0);
    const [feedback, setFeedback] = useState('');

    // Camera/Mic state
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const videoRef = useRef(null);
    const streamRef = useRef(null);
    const mediaRecorderRef = useRef(null);
    const audioChunksRef = useRef([]);
    const faceDetectionIntervalRef = useRef(null);
    const sessionIdRef = useRef(null);

    const progress = ((currentQuestionIndex + 1) / TOTAL_QUESTIONS) * 100;
    const interviewStarted = useRef(false);

    // Initialize camera and face detection
    useEffect(() => {
        const initCamera = async () => {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { facingMode: 'user' },
                    audio: true
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }

                // Start face detection
                startFaceDetection();
            } catch (error) {
                console.error('Camera access error:', error);
                addViolation({ type: 'camera_error', message: 'Camera access denied' });
            }
        };

        initCamera();

        return () => {
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (faceDetectionIntervalRef.current) {
                clearInterval(faceDetectionIntervalRef.current);
            }
        };
    }, []);

    // Auto fullscreen on interview start and initialize session
    useEffect(() => {
        const initializeInterview = async () => {
            if (!interviewStarted.current && setupData) {
                interviewStarted.current = true;

                console.log('Initializing interview with setupData:', setupData);

                // Wait a bit for Clerk to be fully initialized
                await new Promise(resolve => setTimeout(resolve, 500));

                // Start interview session
                try {
                    const session = await startInterview({
                        type: setupData.type || 'technical',
                        role: setupData.role,
                        techStack: setupData.techStack,
                        experience: setupData.experience,
                        persona: setupData.persona,
                        cvData: setupData.cvData,
                        projectData: setupData.projectData,
                    });

                    console.log('Interview session started:', session);
                    sessionIdRef.current = session?.id;

                    // Request fullscreen immediately (will work if user gesture was recent)
                    // If it fails, the fullscreen button will be visible
                    requestFullscreen();

                    // Load first question with the session directly
                    if (session) {
                        // Small delay to ensure state is updated
                        setTimeout(async () => {
                            await loadFirstQuestion(session);
                        }, 300);
                    } else {
                        console.error('No session returned from startInterview');
                    }
                } catch (error) {
                    console.error('Error starting interview:', error);
                    // Retry once after a delay
                    setTimeout(async () => {
                        try {
                            console.log('Retrying interview start...');
                            const session = await startInterview({
                                type: setupData.type || 'technical',
                                role: setupData.role,
                                techStack: setupData.techStack,
                                experience: setupData.experience,
                                persona: setupData.persona,
                                cvData: setupData.cvData,
                                projectData: setupData.projectData,
                            });
                            sessionIdRef.current = session?.id;
                            if (session) {
                                await loadFirstQuestion(session);
                            }
                        } catch (retryError) {
                            console.error('Retry also failed:', retryError);
                            alert('Failed to start interview. Please refresh the page and try again.');
                        }
                    }, 1000);
                }
            }
        };

        if (setupData) {
            initializeInterview();
        } else {
            console.warn('No setupData available, cannot start interview');
        }
    }, [setupData]);

    // Fallback: Load question when currentSession becomes available
    useEffect(() => {
        if (currentSession && !currentQuestion && currentQuestionIndex === 0 && interviewStarted.current) {
            console.log('Loading first question from currentSession...', currentSession);
            loadFirstQuestion(currentSession);
        }
    }, [currentSession, currentQuestion, currentQuestionIndex]);

    // Prevent leaving during interview
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (currentQuestionIndex < TOTAL_QUESTIONS) {
                e.preventDefault();
                e.returnValue = 'Are you sure you want to leave? The interview is still in progress.';
                return e.returnValue;
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        return () => window.removeEventListener('beforeunload', handleBeforeUnload);
    }, [currentQuestionIndex]);

    // Fullscreen detection and enforcement
    useEffect(() => {
        const handleFullscreenChange = () => {
            const isFullscreenNow = !!document.fullscreenElement;
            setIsFullscreen(isFullscreenNow);

            if (!isFullscreenNow && currentQuestionIndex < TOTAL_QUESTIONS && interviewStarted.current) {
                // User exited fullscreen during interview - violation
                const violation = { type: 'fullscreen_exit', message: 'Fullscreen exited during interview', timestamp: Date.now() };
                addViolation(violation);
                setViolations(prev => [...prev, violation]);

                // Try to force back to fullscreen
                setTimeout(() => {
                    requestFullscreen();
                }, 100);
            }
        };

        // Check fullscreen state periodically (in case change event doesn't fire)
        const fullscreenCheck = setInterval(() => {
            if (interviewStarted.current && currentQuestionIndex < TOTAL_QUESTIONS) {
                const isFullscreenNow = !!document.fullscreenElement;
                if (!isFullscreenNow && !isFullscreen) {
                    setIsFullscreen(false);
                    requestFullscreen();
                }
            }
        }, 2000);

        document.addEventListener('fullscreenchange', handleFullscreenChange);
        return () => {
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
            clearInterval(fullscreenCheck);
        };
    }, [currentQuestionIndex, isFullscreen]);

    // Tab visibility detection (anti-cheating)
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden && currentQuestionIndex < TOTAL_QUESTIONS) {
                const violation = { type: 'tab_switch', message: 'Tab switch detected', timestamp: Date.now() };
                setViolations(prev => [...prev, violation]);
                addViolation(violation);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
    }, [currentQuestionIndex]);

    // Google Lens detection (check for image search patterns)
    useEffect(() => {
        const checkForCheating = () => {
            // Check for multiple tabs/windows
            if (window.screenX !== 0 || window.screenY !== 0) {
                const violation = { type: 'window_focus', message: 'Window focus changed', timestamp: Date.now() };
                setViolations(prev => [...prev, violation]);
                addViolation(violation);
            }
        };

        const interval = setInterval(checkForCheating, 2000);
        return () => clearInterval(interval);
    }, []);

    // Face detection and posture analysis (for HR interviews)
    const startFaceDetection = () => {
        if (!videoRef.current) return;

        faceDetectionIntervalRef.current = setInterval(() => {
            if (videoRef.current && videoRef.current.readyState === 4) {
                // Simple face detection: check if video is active and has content
                // In production, use MediaPipe Face Detection or similar
                const video = videoRef.current;
                const canvas = document.createElement('canvas');
                canvas.width = video.videoWidth;
                canvas.height = video.videoHeight;
                const ctx = canvas.getContext('2d');
                ctx.drawImage(video, 0, 0);

                // Check for face-like patterns (simplified)
                // In production, use proper face detection library
                const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const hasContent = imageData.data.some((val, idx) => idx % 4 !== 3 && val > 10);

                if (hasContent) {
                    setFaceDetected(true);
                    // Simulate single face detection
                    setFaceCount(1);

                    // For HR interviews, analyze posture
                    if (setupData.type === 'hr') {
                        analyzePosture(imageData, canvas.width, canvas.height);
                    }
                } else {
                    setFaceDetected(false);
                    setFaceCount(0);
                    const violation = { type: 'no_face', message: 'No face detected', timestamp: Date.now() };
                    setViolations(prev => [...prev, violation]);
                    addViolation(violation);
                }
            }
        }, 1000);
    };

    // Analyze posture (simplified - in production use pose estimation)
    const analyzePosture = (imageData, width, height) => {
        // Simplified posture analysis
        // In production, use MediaPipe Pose or similar
        const centerX = width / 2;
        const centerY = height / 2;

        // Check if person is centered (simplified check)
        const centerRegion = imageData.data.slice(
            ((centerY - 50) * width + (centerX - 50)) * 4,
            ((centerY + 50) * width + (centerX + 50)) * 4
        );

        const hasCenterContent = centerRegion.some((val, idx) => idx % 4 !== 3 && val > 50);

        if (hasCenterContent) {
            // Good posture (centered)
            setPostureScore(85);
        } else {
            // Needs improvement
            setPostureScore(65);
        }
    };

    // Request fullscreen - try automatic, show button if needed
    const requestFullscreen = async () => {
        try {
            if (!document.fullscreenElement) {
                try {
                    // Try to enter fullscreen automatically
                    await document.documentElement.requestFullscreen();
                    setIsFullscreen(true);
                    console.log('Entered fullscreen mode');
                } catch (fsError) {
                    // Fullscreen requires user gesture in some browsers
                    // Show a prominent button to enter fullscreen
                    console.log('Fullscreen requires user gesture. Showing fullscreen button.');
                    // The button is already in the UI, just ensure it's visible
                }
            }
        } catch (error) {
            console.log('Fullscreen not available:', error.message);
        }
    };

    // Load first question
    const loadFirstQuestion = async (sessionOverride = null) => {
        try {
            console.log('Loading first question...', {
                sessionOverride: sessionOverride ? { id: sessionOverride.id, type: sessionOverride.type } : null,
                currentSession: currentSession ? { id: currentSession.id, type: currentSession.type } : null
            });

            const question = await getNextQuestion(sessionOverride);

            console.log('Question received:', question ? {
                id: question.id,
                topic: question.topic,
                hasText: !!question.text,
                textPreview: question.text ? question.text.substring(0, 50) + '...' : 'No text'
            } : 'null');

            if (question && (question.text || question.question)) {
                setCurrentQuestion(question);
                // Wait a bit before speaking to ensure UI is ready
                setTimeout(() => {
                    const questionText = question.text || question.question || '';
                    if (questionText) {
                        speakQuestion(questionText);
                    } else {
                        console.warn('Question text is empty:', question);
                    }
                }, 500);
            } else {
                console.error('No valid question received from API. Question object:', question);
                // Show error to user
                alert('Failed to load question. Please try refreshing the page.');
            }
        } catch (error) {
            console.error('Error loading question:', error);
            alert('Error loading question: ' + error.message);
        }
    };

    // Text-to-speech for questions
    const speakQuestion = async (text) => {
        if (speechService.isSynthesisAvailable()) {
            setIsAISpeaking(true);
            try {
                // Use enhanced TTS with Gemini
                await speechService.enhancedSpeak(text, {
                    rate: 0.9,
                    pitch: 1,
                    volume: 1
                });
            } catch (error) {
                console.error('TTS error:', error);
                // Fallback to basic TTS
                await speechService.speak(text);
            } finally {
                setIsAISpeaking(false);
            }
        }
    };

    // Audio recording with speech-to-text
    const startRecording = async () => {
        try {
            // Start audio recording
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            audioChunksRef.current = [];

            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    audioChunksRef.current.push(event.data);
                }
            };

            mediaRecorder.onstop = async () => {
                const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
                setAudioBlob(audioBlob);

                // Analyze speaking style for HR interviews
                if (setupData.type === 'hr' && userResponse) {
                    const analysis = await speechService.analyzeSpeakingStyle(userResponse, audioBlob);
                    if (analysis) {
                        setSpeakingStyle(analysis);
                    }
                }
            };

            mediaRecorder.start();
            setIsRecording(true);

            // Start speech recognition for real-time transcription
            if (speechService.isRecognitionAvailable()) {
                speechService.startListening(
                    (result) => {
                        // Update textarea with transcription
                        if (result.final) {
                            setUserResponse(prev => prev + ' ' + result.final);
                        } else {
                            // Show interim results (optional)
                            // You can display this separately if needed
                        }
                    },
                    (error) => {
                        console.error('Speech recognition error:', error);
                    }
                );
            }
        } catch (error) {
            console.error('Recording error:', error);
            alert('Failed to start recording. Please check microphone permissions.');
        }
    };

    const stopRecording = () => {
        // Stop speech recognition
        speechService.stopListening();

        // Stop media recorder
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
        }
    };

    // Timer effect
    useEffect(() => {
        if (isPaused || !currentQuestion) return;

        const timer = setInterval(() => {
            setTimeRemaining((prev) => {
                if (prev <= 0) {
                    handleNextQuestion();
                    return 180;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [currentQuestionIndex, isPaused, currentQuestion]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNextQuestion = async () => {
        // Stop recording if active
        if (isRecording) {
            stopRecording();
        }

        // Stop any ongoing speech
        speechService.stopSpeaking();

        // Save current answer
        if (currentQuestion) {
            await submitAnswer(currentQuestion.id, userResponse || 'No answer provided', 180 - timeRemaining);
            addToHistory({
                role: 'user',
                content: userResponse,
                questionId: currentQuestion.id,
            });
        }

        // Check if we've completed 5 questions
        if (currentQuestionIndex >= TOTAL_QUESTIONS - 1) {
            await handleEndInterview();
            return;
        }

        // Load next question
        try {
            const nextQuestion = await getNextQuestion();
            if (nextQuestion) {
                setCurrentQuestion(nextQuestion);
                setCurrentQuestionIndex(prev => prev + 1);
                setUserResponse('');
                setTimeRemaining(180);
                setAudioBlob(null);
                speakQuestion(nextQuestion.text);
            }
        } catch (error) {
            console.error('Error loading next question:', error);
        }
    };

    const handleEndInterview = async () => {
        // Stop recording
        if (isRecording) {
            stopRecording();
        }

        // Stop speech
        speechService.stopSpeaking();

        try {
            // End interview session first
            if (sessionIdRef.current || currentSession?.id) {
                await endInterview();
            }

            // Generate report
            const sessionId = sessionIdRef.current || currentSession?.id;
            if (sessionId) {
                try {
                    const reportResponse = await reportsAPI.generateReport(sessionId);
                    const report = reportResponse.report;

                    if (report) {
                        // Add metadata to the report for display
                        const enrichedReport = {
                            ...report,
                            id: sessionId,
                            sessionId: sessionId,
                            date: new Date().toISOString(),
                            type: setupData?.type || 'technical',
                            role: setupData?.role || 'Software Engineer',
                            status: 'completed'
                        };

                        // Save to local store for Reports page
                        addReport(enrichedReport);
                        setGeneratedReport(enrichedReport);

                        console.log('Report saved successfully:', enrichedReport.id);
                    }
                } catch (reportError) {
                    console.error('Report generation failed:', reportError);
                    // Create a basic report even if API fails
                    const fallbackReport = {
                        id: sessionId,
                        sessionId: sessionId,
                        date: new Date().toISOString(),
                        type: setupData?.type || 'technical',
                        role: setupData?.role || 'Software Engineer',
                        status: 'completed',
                        overallScore: 0,
                        message: 'Report generation failed. Please check your reports later.'
                    };
                    addReport(fallbackReport);
                    setGeneratedReport(fallbackReport);
                }
            }

            setShowCompletionPopup(true);
            setInterviewStatus('completed');
        } catch (error) {
            console.error('Error ending interview:', error);
            // Still show popup even if something fails
            setShowCompletionPopup(true);
            setInterviewStatus('completed');
        }
    };

    const getTimeColor = () => {
        if (timeRemaining > 60) return 'text-emerald-400';
        if (timeRemaining > 30) return 'text-amber-400';
        return 'text-red-400';
    };

    return (
        <div className="min-h-screen bg-dark-900 flex flex-col">
            {/* Top Bar */}
            <header className="h-16 bg-dark-800/80 backdrop-blur-xl border-b border-glass-border flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        <Brain className="w-6 h-6 text-accent-indigo" />
                        <span className="font-display font-bold">InterVueX</span>
                    </div>
                    <div className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-sm font-medium flex items-center gap-2">
                        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
                        Live Interview
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {/* Fullscreen Button - Always show if not in fullscreen */}
                    {!isFullscreen && (
                        <button
                            onClick={async () => {
                                try {
                                    await document.documentElement.requestFullscreen();
                                    setIsFullscreen(true);
                                } catch (error) {
                                    console.error('Fullscreen error:', error);
                                    alert('Please allow fullscreen mode for the best interview experience. Click the browser\'s fullscreen icon or press F11.');
                                }
                            }}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 border-2 border-red-500/50 hover:bg-red-500/30 transition-all animate-pulse"
                            title="Enter Fullscreen (Required for Interview)"
                        >
                            <Maximize className="w-5 h-5" />
                            <span className="text-sm font-semibold">Enter Fullscreen</span>
                        </button>
                    )}

                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-white/60">Question {currentQuestionIndex + 1}/{TOTAL_QUESTIONS}</span>
                        <div className="w-32 h-2 bg-dark-600 rounded-full overflow-hidden">
                            <motion.div
                                className="h-full bg-gradient-to-r from-accent-indigo to-accent-purple"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>

                    {/* Timer */}
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-700 ${getTimeColor()}`}>
                        <Clock className="w-5 h-5" />
                        <span className="font-mono font-bold">{formatTime(timeRemaining)}</span>
                    </div>

                    {/* Fullscreen indicator */}
                    {isFullscreen && (
                        <div className="px-3 py-1 rounded-lg bg-accent-indigo/20 text-accent-indigo text-xs">
                            Fullscreen
                        </div>
                    )}
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Side - AI Interviewer */}
                <div className="flex-1 p-6 flex flex-col">
                    {/* AI Avatar */}
                    <div className="glass-card p-6 mb-6">
                        <div className="flex items-start gap-4">
                            <MiniAISphere size={64} animated={true} />
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <h3 className="font-display font-semibold">AI Interviewer</h3>
                                    <span className="badge">{setupData.persona || 'Balanced'}</span>
                                    {isAISpeaking && (
                                        <span className="badge badge-success flex items-center gap-1">
                                            <Sparkles className="w-3 h-3" />
                                            Speaking
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-sm text-white/60">
                                    <Volume2 className="w-4 h-4" />
                                    <span>Audio enabled - Questions are spoken</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        {currentQuestion ? (
                            <motion.div
                                key={currentQuestionIndex}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                className="flex-1 glass-card p-8"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <span className="badge">{currentQuestion.topic || 'Interview Question'}</span>
                                    <span className={`badge ${currentQuestion.difficulty === 'easy' ? 'badge-success' :
                                        currentQuestion.difficulty === 'medium' ? 'badge-warning' : 'badge-danger'
                                        }`}>
                                        {currentQuestion.difficulty || 'medium'}
                                    </span>
                                </div>

                                <h2 className="text-2xl font-display font-bold leading-relaxed mb-8">
                                    {currentQuestion.text || currentQuestion.question || 'Loading question...'}
                                </h2>

                                {/* Response Area */}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <span className="text-sm font-medium text-white/60">Your Response (Audio)</span>
                                        <button
                                            onClick={() => {
                                                if (isRecording) {
                                                    stopRecording();
                                                } else {
                                                    startRecording();
                                                }
                                            }}
                                            className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isRecording
                                                ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                                : 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                                                }`}
                                        >
                                            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                            {isRecording ? 'Stop Recording' : 'Start Voice Response'}
                                        </button>
                                    </div>

                                    {isRecording && (
                                        <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 flex items-center gap-2">
                                            <div className="w-3 h-3 bg-red-400 rounded-full animate-pulse" />
                                            <span className="text-sm text-red-400">Recording in progress...</span>
                                        </div>
                                    )}

                                    <textarea
                                        value={userResponse}
                                        onChange={(e) => setUserResponse(e.target.value)}
                                        placeholder="Type your answer here or use voice recording..."
                                        className="w-full h-40 input-glass resize-none"
                                    />

                                    <div className="flex items-center justify-between">
                                        <div className="text-sm text-white/40">
                                            {userResponse.length} characters
                                        </div>
                                        <button
                                            onClick={handleNextQuestion}
                                            className="btn-primary flex items-center gap-2"
                                        >
                                            {currentQuestionIndex < TOTAL_QUESTIONS - 1 ? (
                                                <>
                                                    <span>Next Question</span>
                                                    <ChevronRight className="w-5 h-5" />
                                                </>
                                            ) : (
                                                <>
                                                    <span>Finish Interview</span>
                                                    <CheckCircle2 className="w-5 h-5" />
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ) : (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 glass-card p-8 flex items-center justify-center"
                            >
                                <div className="text-center">
                                    <Brain className="w-16 h-16 text-accent-indigo mx-auto mb-4 animate-pulse" />
                                    <h3 className="text-xl font-display font-semibold mb-2">Loading Question...</h3>
                                    <p className="text-white/60">Preparing your interview question</p>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Right Side - Camera & Status */}
                <div className="w-80 p-6 border-l border-glass-border flex flex-col gap-6">
                    {/* Camera Feed */}
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium">Your Camera</span>
                            <div className="flex gap-2">
                                <span className={`badge ${faceDetected && faceCount === 1 ? 'badge-success' : 'badge-danger'}`}>
                                    {faceDetected && faceCount === 1 ? '1 Face' : 'No Face'}
                                </span>
                            </div>
                        </div>
                        <div className="aspect-video rounded-xl bg-dark-700 flex items-center justify-center overflow-hidden relative">
                            {cameraOn ? (
                                <>
                                    <video
                                        ref={videoRef}
                                        autoPlay
                                        playsInline
                                        muted
                                        className="w-full h-full object-cover"
                                    />
                                    {!faceDetected && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-red-500/20">
                                            <AlertTriangle className="w-8 h-8 text-red-400" />
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-white/40 text-sm">Camera Off</div>
                            )}
                        </div>
                    </div>

                    {/* Proctoring Status */}
                    <div className="glass-card p-4">
                        <h4 className="text-sm font-medium mb-4">Proctoring Status</h4>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Face Detection</span>
                                <span className={`badge ${faceDetected && faceCount === 1 ? 'badge-success' : 'badge-danger'}`}>
                                    {faceDetected && faceCount === 1 ? 'Active' : 'Issue'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Fullscreen</span>
                                <span className={`badge ${isFullscreen ? 'badge-success' : 'badge-danger'}`}>
                                    {isFullscreen ? 'Enabled' : 'Disabled'}
                                </span>
                            </div>
                            {setupData.type === 'hr' && postureScore !== null && (
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/60">Posture</span>
                                    <span className={`badge ${postureScore >= 80 ? 'badge-success' : postureScore >= 60 ? 'badge-warning' : 'badge-danger'}`}>
                                        {postureScore}/100
                                    </span>
                                </div>
                            )}
                            {setupData.type === 'hr' && speakingStyle && (
                                <div className="space-y-2 pt-2 border-t border-glass-border">
                                    <div className="text-xs font-medium text-white/80">Speaking Style Analysis</div>
                                    <div className="space-y-1 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Pace:</span>
                                            <span className="text-white">{speakingStyle.pace}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Clarity:</span>
                                            <span className="text-white">{speakingStyle.clarity}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-white/60">Tone:</span>
                                            <span className="text-white">{speakingStyle.tone}</span>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Violations</span>
                                <span className={`badge ${violations.length > 0 ? 'badge-danger' : 'badge-success'}`}>
                                    {violations.length}
                                </span>
                            </div>
                        </div>

                        {violations.length > 0 && (
                            <div className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
                                <div className="flex items-center gap-2 text-red-400 text-sm mb-2">
                                    <AlertTriangle className="w-4 h-4" />
                                    <span className="font-medium">Violations Detected</span>
                                </div>
                                <ul className="text-xs text-white/60 space-y-1">
                                    {violations.slice(-3).map((v, i) => (
                                        <li key={i}>{v.message}</li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </div>

                    {/* Question Navigator */}
                    <div className="glass-card p-4 flex-1">
                        <h4 className="text-sm font-medium mb-4">Questions</h4>
                        <div className="grid grid-cols-5 gap-2">
                            {[...Array(TOTAL_QUESTIONS)].map((_, i) => (
                                <div
                                    key={i}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium transition-all ${i === currentQuestionIndex
                                        ? 'bg-gradient-to-br from-accent-indigo to-accent-purple text-white'
                                        : i < currentQuestionIndex
                                            ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                            : 'bg-dark-600 text-white/40'
                                        }`}
                                >
                                    {i + 1}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Completion Popup */}
            <AnimatePresence>
                {showCompletionPopup && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-dark-900/95 backdrop-blur-xl flex items-center justify-center z-50"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="glass-card p-8 max-w-md w-full mx-4"
                        >
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
                                    <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                                </div>
                                <h2 className="text-2xl font-display font-bold mb-2">Evaluation Complete!</h2>
                                <p className="text-white/60">Your interview has been completed. How was your experience?</p>
                            </div>

                            {/* Feedback Form */}
                            <div className="mb-6 space-y-4">
                                <div className="flex justify-center gap-2">
                                    {[1, 2, 3, 4, 5].map((star) => (
                                        <button
                                            key={star}
                                            onClick={() => setRating(star)}
                                            onMouseEnter={() => setHoverRating(star)}
                                            onMouseLeave={() => setHoverRating(0)}
                                            className="transition-transform hover:scale-110"
                                        >
                                            <Sparkles
                                                className={`w-8 h-8 ${star <= (hoverRating || rating)
                                                    ? 'text-yellow-400 fill-yellow-400'
                                                    : 'text-white/20'
                                                    }`}
                                            />
                                        </button>
                                    ))}
                                </div>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    placeholder="Any feedback for us? (Optional)"
                                    className="w-full h-24 input-glass resize-none text-sm"
                                />
                            </div>

                            <div className="space-y-3 mb-6">
                                <button
                                    onClick={() => {
                                        console.log('Feedback submitted:', { rating, feedback });
                                        localStorage.setItem('last_interview_feedback', JSON.stringify({ rating, feedback, date: new Date() }));
                                        navigate('/reports');
                                    }}
                                    className="w-full btn-primary flex items-center justify-center gap-2"
                                >
                                    <FileText className="w-5 h-5" />
                                    <span>Submit & View Report</span>
                                </button>
                                <button
                                    onClick={() => {
                                        // Download report
                                        if (generatedReport) {
                                            const blob = new Blob([JSON.stringify(generatedReport, null, 2)], { type: 'application/json' });
                                            const url = URL.createObjectURL(blob);
                                            const a = document.createElement('a');
                                            a.href = url;
                                            a.download = `interview-report-${Date.now()}.json`;
                                            a.click();
                                        }
                                    }}
                                    className="w-full btn-secondary flex items-center justify-center gap-2"
                                >
                                    <Download className="w-5 h-5" />
                                    <span>Download Report PDF</span>
                                </button>
                            </div>

                            <button
                                onClick={() => {
                                    setShowCompletionPopup(false);
                                    navigate('/reports');
                                }}
                                className="w-full text-white/60 hover:text-white text-sm"
                            >
                                Skip Feedback
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
