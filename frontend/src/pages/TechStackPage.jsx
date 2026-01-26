import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Layers,
    Play,
    CheckCircle2,
    XCircle,
    Clock,
    ChevronRight,
    Target,
    TrendingUp,
    Brain,
    Zap,
    RefreshCw,
    Award
} from 'lucide-react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';

// Available tech stacks
const techStacks = [
    { id: 'javascript', name: 'JavaScript', icon: '🟨', category: 'Language', mastery: 78 },
    { id: 'react', name: 'React', icon: '⚛️', category: 'Frontend', mastery: 85 },
    { id: 'nodejs', name: 'Node.js', icon: '🟢', category: 'Backend', mastery: 72 },
    { id: 'python', name: 'Python', icon: '🐍', category: 'Language', mastery: 65 },
    { id: 'sql', name: 'SQL', icon: '🗃️', category: 'Database', mastery: 68 },
    { id: 'typescript', name: 'TypeScript', icon: '💙', category: 'Language', mastery: 75 },
    { id: 'dsa', name: 'DSA', icon: '🧮', category: 'Fundamentals', mastery: 70 },
    { id: 'system-design', name: 'System Design', icon: '🏗️', category: 'Architecture', mastery: 55 },
    { id: 'docker', name: 'Docker', icon: '🐳', category: 'DevOps', mastery: 60 },
    { id: 'aws', name: 'AWS', icon: '☁️', category: 'Cloud', mastery: 45 },
    { id: 'mongodb', name: 'MongoDB', icon: '🍃', category: 'Database', mastery: 62 },
    { id: 'ml', name: 'Machine Learning', icon: '🤖', category: 'AI/ML', mastery: 40 },
];

const difficulties = [
    { id: 'easy', label: 'Easy', description: 'Fundamentals & basics', color: 'text-emerald-400', bg: 'bg-emerald-500/20' },
    { id: 'medium', label: 'Medium', description: 'Practical application', color: 'text-amber-400', bg: 'bg-amber-500/20' },
    { id: 'hard', label: 'Hard', description: 'Advanced concepts', color: 'text-red-400', bg: 'bg-red-500/20' },
    { id: 'adaptive', label: 'Adaptive', description: 'AI adjusts difficulty', color: 'text-accent-indigo', bg: 'bg-accent-indigo/20' },
];

// Sample question for evaluation
const sampleQuestion = {
    id: 1,
    text: "Explain the difference between == and === operators in JavaScript. When would you use each?",
    topic: "JavaScript Basics",
    difficulty: "Easy",
    options: [
        { id: 'a', text: "They are the same, === is just a newer syntax" },
        { id: 'b', text: "== compares only values, === compares values and types" },
        { id: 'c', text: "=== compares only values, == compares values and types" },
        { id: 'd', text: "== is for strings, === is for numbers" }
    ],
    correctAnswer: 'b',
    explanation: "The == operator performs type coercion before comparison, while === (strict equality) compares both value and type without coercion. Use === for more predictable comparisons."
};

export default function TechStackPage() {
    const [selectedStack, setSelectedStack] = useState(null);
    const [selectedDifficulty, setSelectedDifficulty] = useState(null);
    const [evaluationStarted, setEvaluationStarted] = useState(false);
    const [currentQuestion, setCurrentQuestion] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState(null);
    const [showResult, setShowResult] = useState(false);
    const [score, setScore] = useState({ correct: 0, total: 0 });
    const [evaluationComplete, setEvaluationComplete] = useState(false);

    const handleStartEvaluation = () => {
        setEvaluationStarted(true);
        setCurrentQuestion(0);
        setScore({ correct: 0, total: 0 });
    };

    const handleAnswerSelect = (optionId) => {
        setSelectedAnswer(optionId);
    };

    const handleSubmitAnswer = () => {
        const isCorrect = selectedAnswer === sampleQuestion.correctAnswer;
        setScore(prev => ({
            correct: prev.correct + (isCorrect ? 1 : 0),
            total: prev.total + 1
        }));
        setShowResult(true);
    };

    const handleNextQuestion = () => {
        if (currentQuestion >= 4) {
            setEvaluationComplete(true);
        } else {
            setCurrentQuestion(prev => prev + 1);
            setSelectedAnswer(null);
            setShowResult(false);
        }
    };

    const handleReset = () => {
        setSelectedStack(null);
        setSelectedDifficulty(null);
        setEvaluationStarted(false);
        setEvaluationComplete(false);
        setCurrentQuestion(0);
        setSelectedAnswer(null);
        setShowResult(false);
        setScore({ correct: 0, total: 0 });
    };

    // Radar data for results
    const resultRadarData = [
        { skill: 'Accuracy', score: 80, fullMark: 100 },
        { skill: 'Speed', score: 75, fullMark: 100 },
        { skill: 'Depth', score: 70, fullMark: 100 },
        { skill: 'Consistency', score: 85, fullMark: 100 },
        { skill: 'Edge Cases', score: 65, fullMark: 100 },
    ];

    // Render stack selection
    const renderStackSelection = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-8"
        >
            {/* Header */}
            <div className="text-center max-w-2xl mx-auto">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center mx-auto mb-4">
                    <Layers className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl font-display font-bold mb-3">Tech Stack Evaluation</h1>
                <p className="text-white/60">
                    Quick, focused assessment of your technical knowledge. Choose a technology and difficulty to begin.
                </p>
            </div>

            {/* Tech Stack Grid */}
            <div>
                <h2 className="text-lg font-semibold mb-4">Select Technology</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {techStacks.map((stack) => (
                        <motion.button
                            key={stack.id}
                            onClick={() => setSelectedStack(stack)}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className={`p-4 rounded-xl text-center transition-all ${selectedStack?.id === stack.id
                                    ? 'bg-gradient-to-br from-accent-indigo/30 to-accent-purple/30 border-2 border-accent-indigo shadow-glow-sm'
                                    : 'glass-card-hover border-2 border-transparent'
                                }`}
                        >
                            <div className="text-3xl mb-2">{stack.icon}</div>
                            <div className="font-medium text-sm">{stack.name}</div>
                            <div className="text-xs text-white/50">{stack.category}</div>
                            <div className="mt-2 h-1.5 bg-dark-600 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-accent-indigo to-accent-purple rounded-full"
                                    style={{ width: `${stack.mastery}%` }}
                                />
                            </div>
                            <div className="text-xs text-white/40 mt-1">{stack.mastery}% mastery</div>
                        </motion.button>
                    ))}
                </div>
            </div>

            {/* Difficulty Selection */}
            {selectedStack && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                >
                    <h2 className="text-lg font-semibold mb-4">Select Difficulty</h2>
                    <div className="grid md:grid-cols-4 gap-4">
                        {difficulties.map((diff) => (
                            <button
                                key={diff.id}
                                onClick={() => setSelectedDifficulty(diff)}
                                className={`p-5 rounded-xl text-left transition-all ${selectedDifficulty?.id === diff.id
                                        ? `${diff.bg} border-2 border-current ${diff.color}`
                                        : 'glass-card-hover border-2 border-transparent'
                                    }`}
                            >
                                <div className={`font-semibold mb-1 ${selectedDifficulty?.id === diff.id ? diff.color : ''}`}>
                                    {diff.label}
                                </div>
                                <div className="text-sm text-white/60">{diff.description}</div>
                            </button>
                        ))}
                    </div>
                </motion.div>
            )}

            {/* Start Button */}
            {selectedStack && selectedDifficulty && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center"
                >
                    <div className="glass-card p-6 inline-block mb-6">
                        <div className="flex items-center gap-4 text-left">
                            <div className="text-4xl">{selectedStack.icon}</div>
                            <div>
                                <div className="font-semibold">{selectedStack.name} Evaluation</div>
                                <div className="text-sm text-white/60">
                                    {selectedDifficulty.label} • 5 Questions • ~10 min
                                </div>
                            </div>
                        </div>
                    </div>
                    <br />
                    <button onClick={handleStartEvaluation} className="btn-primary text-lg px-8">
                        <span className="flex items-center gap-2">
                            <Zap className="w-5 h-5" />
                            Start Evaluation
                        </span>
                    </button>
                </motion.div>
            )}
        </motion.div>
    );

    // Render evaluation question
    const renderEvaluation = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-3xl mx-auto space-y-6"
        >
            {/* Progress Header */}
            <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="text-2xl">{selectedStack.icon}</div>
                    <div>
                        <div className="font-semibold">{selectedStack.name}</div>
                        <div className="text-sm text-white/50">{selectedDifficulty.label} Level</div>
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-sm text-white/60">
                        Question {currentQuestion + 1}/5
                    </div>
                    <div className="w-32 h-2 bg-dark-600 rounded-full overflow-hidden">
                        <motion.div
                            className="h-full bg-gradient-to-r from-accent-indigo to-accent-purple"
                            initial={{ width: 0 }}
                            animate={{ width: `${((currentQuestion + 1) / 5) * 100}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Question Card */}
            <AnimatePresence mode="wait">
                <motion.div
                    key={currentQuestion}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -20 }}
                    className="glass-card p-8"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <span className="badge">{sampleQuestion.topic}</span>
                        <span className={`badge ${sampleQuestion.difficulty === 'Easy' ? 'badge-success' :
                                sampleQuestion.difficulty === 'Medium' ? 'badge-warning' : 'badge-danger'
                            }`}>
                            {sampleQuestion.difficulty}
                        </span>
                    </div>

                    <h2 className="text-xl font-display font-semibold mb-8">
                        {sampleQuestion.text}
                    </h2>

                    {/* Options */}
                    <div className="space-y-3">
                        {sampleQuestion.options.map((option) => {
                            const isSelected = selectedAnswer === option.id;
                            const isCorrect = option.id === sampleQuestion.correctAnswer;
                            const showCorrectness = showResult && (isSelected || isCorrect);

                            return (
                                <button
                                    key={option.id}
                                    onClick={() => !showResult && handleAnswerSelect(option.id)}
                                    disabled={showResult}
                                    className={`w-full p-4 rounded-xl text-left transition-all flex items-center gap-4 ${showCorrectness
                                            ? isCorrect
                                                ? 'bg-emerald-500/20 border-2 border-emerald-500/50'
                                                : 'bg-red-500/20 border-2 border-red-500/50'
                                            : isSelected
                                                ? 'bg-accent-indigo/20 border-2 border-accent-indigo'
                                                : 'glass-card hover:bg-glass-medium border-2 border-transparent'
                                        }`}
                                >
                                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-semibold ${showCorrectness
                                            ? isCorrect
                                                ? 'bg-emerald-500/30 text-emerald-400'
                                                : 'bg-red-500/30 text-red-400'
                                            : isSelected
                                                ? 'bg-accent-indigo text-white'
                                                : 'bg-dark-600 text-white/60'
                                        }`}>
                                        {showCorrectness ? (
                                            isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />
                                        ) : (
                                            option.id.toUpperCase()
                                        )}
                                    </div>
                                    <span className={showCorrectness && !isCorrect && isSelected ? 'line-through text-white/50' : ''}>
                                        {option.text}
                                    </span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Explanation */}
                    {showResult && (
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-6 p-4 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20"
                        >
                            <div className="flex items-center gap-2 mb-2">
                                <Brain className="w-5 h-5 text-accent-indigo" />
                                <span className="font-medium text-accent-indigo">Explanation</span>
                            </div>
                            <p className="text-sm text-white/70">{sampleQuestion.explanation}</p>
                        </motion.div>
                    )}

                    {/* Action Button */}
                    <div className="mt-8 flex justify-end">
                        {!showResult ? (
                            <button
                                onClick={handleSubmitAnswer}
                                disabled={!selectedAnswer}
                                className={`btn-primary ${!selectedAnswer && 'opacity-50 cursor-not-allowed'}`}
                            >
                                <span>Submit Answer</span>
                            </button>
                        ) : (
                            <button onClick={handleNextQuestion} className="btn-primary">
                                <span className="flex items-center gap-2">
                                    {currentQuestion >= 4 ? 'See Results' : 'Next Question'}
                                    <ChevronRight className="w-5 h-5" />
                                </span>
                            </button>
                        )}
                    </div>
                </motion.div>
            </AnimatePresence>

            {/* Score Tracker */}
            <div className="glass-card p-4 flex items-center justify-center gap-8">
                <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-emerald-400">{score.correct}</span>
                    <span className="text-white/50">Correct</span>
                </div>
                <div className="w-px h-6 bg-glass-border" />
                <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-red-400" />
                    <span className="font-semibold text-red-400">{score.total - score.correct}</span>
                    <span className="text-white/50">Incorrect</span>
                </div>
            </div>
        </motion.div>
    );

    // Render results
    const renderResults = () => {
        const percentage = Math.round((score.correct / 5) * 100);

        return (
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-4xl mx-auto space-y-8"
            >
                {/* Result Header */}
                <div className="text-center">
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-24 h-24 rounded-full bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center mx-auto mb-6"
                    >
                        <Award className="w-12 h-12 text-white" />
                    </motion.div>
                    <h1 className="text-3xl font-display font-bold mb-2">Evaluation Complete!</h1>
                    <p className="text-white/60">
                        {selectedStack.name} • {selectedDifficulty.label} Level
                    </p>
                </div>

                {/* Score Display */}
                <div className="glass-card p-8 text-center">
                    <div className="text-6xl font-display font-bold gradient-text mb-2">
                        {percentage}%
                    </div>
                    <div className="text-white/60 mb-6">
                        {score.correct} out of 5 questions correct
                    </div>
                    <div className="flex justify-center gap-4">
                        {percentage >= 80 ? (
                            <span className="badge badge-success text-sm px-4 py-2">Excellent Performance!</span>
                        ) : percentage >= 60 ? (
                            <span className="badge badge-warning text-sm px-4 py-2">Good Progress</span>
                        ) : (
                            <span className="badge badge-danger text-sm px-4 py-2">Needs Practice</span>
                        )}
                    </div>
                </div>

                {/* Results Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    {/* Skill Radar */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-display font-semibold mb-6">Skill Breakdown</h3>
                        <ResponsiveContainer width="100%" height={250}>
                            <RadarChart data={resultRadarData}>
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis
                                    dataKey="skill"
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }}
                                />
                                <Radar
                                    name="Score"
                                    dataKey="score"
                                    stroke="#6366F1"
                                    fill="#6366F1"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Feedback */}
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-display font-semibold mb-6">AI Feedback</h3>
                        <div className="space-y-4">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                                    <span className="font-medium text-emerald-400">Strength</span>
                                </div>
                                <p className="text-sm text-white/70">Good understanding of basic concepts. Quick response time.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Target className="w-4 h-4 text-amber-400" />
                                    <span className="font-medium text-amber-400">Focus Area</span>
                                </div>
                                <p className="text-sm text-white/70">Practice more edge cases and advanced scenarios.</p>
                            </div>
                            <div className="p-4 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20">
                                <div className="flex items-center gap-2 mb-2">
                                    <Brain className="w-4 h-4 text-accent-indigo" />
                                    <span className="font-medium text-accent-indigo">Recommendation</span>
                                </div>
                                <p className="text-sm text-white/70">Try the medium difficulty next to challenge yourself.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-center gap-4">
                    <button onClick={handleReset} className="btn-secondary flex items-center gap-2">
                        <RefreshCw className="w-5 h-5" />
                        Try Another Stack
                    </button>
                    <button onClick={() => {
                        setEvaluationComplete(false);
                        setEvaluationStarted(false);
                        setSelectedDifficulty(difficulties.find(d => d.id === 'medium'));
                        setTimeout(() => handleStartEvaluation(), 100);
                    }} className="btn-primary">
                        <span className="flex items-center gap-2">
                            <Play className="w-5 h-5" />
                            Practice Again
                        </span>
                    </button>
                </div>
            </motion.div>
        );
    };

    return (
        <DashboardLayout>
            {evaluationComplete
                ? renderResults()
                : evaluationStarted
                    ? renderEvaluation()
                    : renderStackSelection()
            }
        </DashboardLayout>
    );
}
