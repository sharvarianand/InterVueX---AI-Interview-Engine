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
    Sparkles
} from 'lucide-react';
import { useStore, useMemoryStore } from '../store/useStore';
import MiniAISphere from '../components/common/MiniAISphere';

// Sample questions for demo
const sampleQuestions = [
    {
        id: 1,
        text: "Can you explain the difference between let, const, and var in JavaScript? When would you use each?",
        topic: "JavaScript Fundamentals",
        difficulty: "Easy"
    },
    {
        id: 2,
        text: "Describe how the event loop works in JavaScript. How does it handle asynchronous operations?",
        topic: "JavaScript Runtime",
        difficulty: "Medium"
    },
    {
        id: 3,
        text: "What is the virtual DOM in React and how does it improve performance?",
        topic: "React",
        difficulty: "Medium"
    },
    {
        id: 4,
        text: "Explain the concept of closures with a practical example. How are they useful in real applications?",
        topic: "JavaScript Concepts",
        difficulty: "Medium"
    },
    {
        id: 5,
        text: "How would you design a URL shortening service like bit.ly? Walk me through the architecture.",
        topic: "System Design",
        difficulty: "Hard"
    }
];

export default function LiveInterviewPage() {
    const navigate = useNavigate();
    const {
        setupData,
        setInterviewStatus,
        addAnswer,
        proctoring,
        setProctoringState,
        addViolation
    } = useStore();
    const { addToHistory } = useMemoryStore();

    // Interview state
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [timeRemaining, setTimeRemaining] = useState(180); // 3 minutes per question
    const [isRecording, setIsRecording] = useState(false);
    const [userResponse, setUserResponse] = useState('');
    const [showResponse, setShowResponse] = useState(false);
    const [isAISpeaking, setIsAISpeaking] = useState(false);
    const [isPaused, setIsPaused] = useState(false);
    const [violations, setViolations] = useState([]);

    // Camera/Mic state
    const [cameraOn, setCameraOn] = useState(true);
    const [micOn, setMicOn] = useState(true);
    const videoRef = useRef(null);

    const currentQuestion = sampleQuestions[currentQuestionIndex];
    const totalQuestions = sampleQuestions.length;
    const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;

    // Timer effect
    useEffect(() => {
        if (isPaused) return;

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
    }, [currentQuestionIndex, isPaused]);

    // Fullscreen and tab detection
    useEffect(() => {
        const handleVisibilityChange = () => {
            if (document.hidden) {
                const violation = { type: 'tab_switch', message: 'Tab switch detected' };
                setViolations(prev => [...prev, violation]);
                addViolation(violation);
            }
        };

        const handleFullscreenChange = () => {
            if (!document.fullscreenElement) {
                const violation = { type: 'fullscreen_exit', message: 'Fullscreen exited' };
                setViolations(prev => [...prev, violation]);
                addViolation(violation);
            }
        };

        document.addEventListener('visibilitychange', handleVisibilityChange);
        document.addEventListener('fullscreenchange', handleFullscreenChange);

        return () => {
            document.removeEventListener('visibilitychange', handleVisibilityChange);
            document.removeEventListener('fullscreenchange', handleFullscreenChange);
        };
    }, []);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const handleNextQuestion = () => {
        // Save current answer
        addAnswer({
            questionId: currentQuestion.id,
            response: userResponse,
            timeSpent: 180 - timeRemaining,
        });
        addToHistory({
            role: 'user',
            content: userResponse,
            questionId: currentQuestion.id,
        });

        if (currentQuestionIndex < totalQuestions - 1) {
            setCurrentQuestionIndex(prev => prev + 1);
            setUserResponse('');
            setTimeRemaining(180);
            setShowResponse(false);
        } else {
            // End interview
            handleEndInterview();
        }
    };

    const handleEndInterview = () => {
        setInterviewStatus('completed');
        navigate('/reports/new');
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
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
                    {/* Progress */}
                    <div className="flex items-center gap-3">
                        <span className="text-sm text-white/60">Question {currentQuestionIndex + 1}/{totalQuestions}</span>
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

                    {/* Controls */}
                    <button
                        onClick={toggleFullscreen}
                        className="p-2 rounded-lg bg-dark-700 text-white/60 hover:text-white transition-colors"
                    >
                        <Maximize className="w-5 h-5" />
                    </button>
                    <button
                        onClick={() => setIsPaused(!isPaused)}
                        className={`p-2 rounded-lg ${isPaused ? 'bg-amber-500/20 text-amber-400' : 'bg-dark-700 text-white/60 hover:text-white'} transition-colors`}
                    >
                        <Pause className="w-5 h-5" />
                    </button>
                </div>
            </header>

            {/* Main Content */}
            <div className="flex-1 flex">
                {/* Left Side - AI Interviewer */}
                <div className="flex-1 p-6 flex flex-col">
                    {/* AI Avatar with Organic Sphere */}
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
                                    <span>Audio enabled</span>
                                </div>
                                <div className="mt-2 text-xs text-white/40">
                                    Evaluating: {setupData.role || 'Software Engineer'} • {setupData.techStack?.join(', ') || 'General'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Question Card */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentQuestionIndex}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="flex-1 glass-card p-8"
                        >
                            <div className="flex items-center gap-3 mb-6">
                                <span className="badge">{currentQuestion.topic}</span>
                                <span className={`badge ${currentQuestion.difficulty === 'Easy' ? 'badge-success' :
                                    currentQuestion.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
                                    }`}>
                                    {currentQuestion.difficulty}
                                </span>
                            </div>

                            <h2 className="text-2xl font-display font-bold leading-relaxed mb-8">
                                {currentQuestion.text}
                            </h2>

                            {/* Response Area */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-medium text-white/60">Your Response</span>
                                    <button
                                        onClick={() => setIsRecording(!isRecording)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${isRecording
                                            ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                                            : 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                                            }`}
                                    >
                                        {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
                                        {isRecording ? 'Stop Recording' : 'Start Voice Response'}
                                    </button>
                                </div>

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
                                        {currentQuestionIndex < totalQuestions - 1 ? (
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
                    </AnimatePresence>
                </div>

                {/* Right Side - Camera & Status */}
                <div className="w-80 p-6 border-l border-glass-border flex flex-col gap-6">
                    {/* Camera Feed */}
                    <div className="glass-card p-4">
                        <div className="flex items-center justify-between mb-4">
                            <span className="text-sm font-medium">Your Camera</span>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setCameraOn(!cameraOn)}
                                    className={`p-2 rounded-lg transition-colors ${cameraOn ? 'bg-accent-indigo/20 text-accent-indigo' : 'bg-red-500/20 text-red-400'
                                        }`}
                                >
                                    {cameraOn ? <Video className="w-4 h-4" /> : <VideoOff className="w-4 h-4" />}
                                </button>
                                <button
                                    onClick={() => setMicOn(!micOn)}
                                    className={`p-2 rounded-lg transition-colors ${micOn ? 'bg-accent-indigo/20 text-accent-indigo' : 'bg-red-500/20 text-red-400'
                                        }`}
                                >
                                    {micOn ? <Mic className="w-4 h-4" /> : <MicOff className="w-4 h-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="aspect-video rounded-xl bg-dark-700 flex items-center justify-center overflow-hidden">
                            {cameraOn ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <User className="w-20 h-20 text-white/20" />
                                    <div className="absolute bottom-2 left-2 right-2 flex justify-between">
                                        <span className="px-2 py-1 rounded bg-dark-900/80 text-xs">You</span>
                                        {micOn && (
                                            <span className="px-2 py-1 rounded bg-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1">
                                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                                                Mic On
                                            </span>
                                        )}
                                    </div>
                                </div>
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
                                <span className="badge badge-success">Active</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-white/60">Fullscreen</span>
                                <span className="badge badge-success">Enabled</span>
                            </div>
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
                            {sampleQuestions.map((q, i) => (
                                <div
                                    key={q.id}
                                    className={`aspect-square rounded-lg flex items-center justify-center text-sm font-medium cursor-pointer transition-all ${i === currentQuestionIndex
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

                    {/* Report Flag */}
                    <button className="btn-secondary flex items-center justify-center gap-2 text-sm">
                        <Flag className="w-4 h-4" />
                        Report Issue
                    </button>
                </div>
            </div>

            {/* Paused Overlay */}
            {isPaused && (
                <div className="fixed inset-0 bg-dark-900/90 backdrop-blur-xl flex items-center justify-center z-50">
                    <div className="text-center">
                        <div className="w-20 h-20 rounded-full bg-amber-500/20 flex items-center justify-center mx-auto mb-6">
                            <Pause className="w-10 h-10 text-amber-400" />
                        </div>
                        <h2 className="text-2xl font-display font-bold mb-2">Interview Paused</h2>
                        <p className="text-white/60 mb-6">The timer is stopped. Click resume when ready.</p>
                        <button
                            onClick={() => setIsPaused(false)}
                            className="btn-primary"
                        >
                            <span>Resume Interview</span>
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
