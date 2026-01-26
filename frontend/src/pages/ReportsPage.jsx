import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    FileText,
    Download,
    Share2,
    ChevronRight,
    Target,
    TrendingUp,
    TrendingDown,
    AlertCircle,
    CheckCircle2,
    Clock,
    MessageSquare,
    Code,
    Users,
    Briefcase,
    Star,
    Award,
    BarChart3,
    PieChart
} from 'lucide-react';
import {
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar,
    ResponsiveContainer,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';

// Sample report data
const sampleReport = {
    id: 1,
    type: 'technical',
    title: 'Technical Interview - Full Stack',
    date: '2024-01-26',
    duration: '34 min',
    questionsAnswered: 5,
    totalQuestions: 5,
    overallScore: 78,
    scores: {
        correctness: 82,
        depth: 75,
        clarity: 80,
        practicalUnderstanding: 72,
        communication: 85
    },
    skillScores: [
        { skill: 'Problem Solving', score: 85, fullMark: 100 },
        { skill: 'Technical Depth', score: 72, fullMark: 100 },
        { skill: 'Communication', score: 88, fullMark: 100 },
        { skill: 'Code Quality', score: 78, fullMark: 100 },
        { skill: 'System Design', score: 65, fullMark: 100 },
        { skill: 'Best Practices', score: 80, fullMark: 100 }
    ],
    strongAreas: [
        'Excellent explanation of JavaScript closures',
        'Good understanding of React Virtual DOM',
        'Clear communication and structured answers'
    ],
    weakAreas: [
        'System design concepts need more depth',
        'Could improve on async/await error handling',
        'Database optimization knowledge gaps'
    ],
    missedConcepts: [
        'Database indexing strategies',
        'Microservices communication patterns',
        'Caching strategies'
    ],
    timeline: [
        { question: 1, score: 85, time: 150, topic: 'JavaScript Fundamentals' },
        { question: 2, score: 72, time: 180, topic: 'Event Loop' },
        { question: 3, score: 88, time: 120, topic: 'React Virtual DOM' },
        { question: 4, score: 75, time: 165, topic: 'Closures' },
        { question: 5, score: 68, time: 180, topic: 'System Design' }
    ],
    proctoring: {
        violations: 0,
        status: 'clean'
    }
};

const pastReports = [
    { id: 1, type: 'technical', title: 'DSA Interview', score: 82, date: '2 hours ago' },
    { id: 2, type: 'hr', title: 'Behavioral Round', score: 88, date: 'Yesterday' },
    { id: 3, type: 'project', title: 'E-commerce Viva', score: 75, date: '3 days ago' },
    { id: 4, type: 'technical', title: 'System Design', score: 70, date: '1 week ago' },
    { id: 5, type: 'hr', title: 'Leadership Skills', score: 85, date: '2 weeks ago' },
];

const typeIcons = {
    technical: Code,
    hr: Users,
    project: Briefcase
};

const typeGradients = {
    technical: 'from-indigo-500 to-blue-500',
    hr: 'from-pink-500 to-rose-500',
    project: 'from-purple-500 to-violet-500'
};

export default function ReportsPage() {
    const { id } = useParams();
    const [selectedReport, setSelectedReport] = useState(id ? sampleReport : null);

    const getScoreColor = (score) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        return 'text-red-400';
    };

    const getScoreBg = (score) => {
        if (score >= 80) return 'bg-emerald-500/20 border-emerald-500/30';
        if (score >= 60) return 'bg-amber-500/20 border-amber-500/30';
        return 'bg-red-500/20 border-red-500/30';
    };

    // Report Detail View
    const renderReportDetail = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-start justify-between">
                <button
                    onClick={() => setSelectedReport(null)}
                    className="text-white/60 hover:text-white flex items-center gap-2 text-sm"
                >
                    ← Back to Reports
                </button>
                <div className="flex gap-3">
                    <button className="btn-secondary flex items-center gap-2 text-sm">
                        <Download className="w-4 h-4" />
                        Export PDF
                    </button>
                    <button className="btn-secondary flex items-center gap-2 text-sm">
                        <Share2 className="w-4 h-4" />
                        Share
                    </button>
                </div>
            </div>

            {/* Report Header Card */}
            <div className="glass-card p-6">
                <div className="flex items-start gap-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${typeGradients[sampleReport.type]} flex items-center justify-center flex-shrink-0`}>
                        {(() => {
                            const Icon = typeIcons[sampleReport.type];
                            return <Icon className="w-8 h-8 text-white" />;
                        })()}
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-display font-bold mb-2">{sampleReport.title}</h1>
                        <div className="flex flex-wrap gap-4 text-sm text-white/60">
                            <span className="flex items-center gap-1">
                                <Clock className="w-4 h-4" />
                                {sampleReport.duration}
                            </span>
                            <span>{sampleReport.date}</span>
                            <span>{sampleReport.questionsAnswered}/{sampleReport.totalQuestions} Questions</span>
                            {sampleReport.proctoring.violations === 0 && (
                                <span className="flex items-center gap-1 text-emerald-400">
                                    <CheckCircle2 className="w-4 h-4" />
                                    No Violations
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-center">
                        <div className={`text-5xl font-display font-bold ${getScoreColor(sampleReport.overallScore)}`}>
                            {sampleReport.overallScore}
                        </div>
                        <div className="text-sm text-white/60">Overall Score</div>
                    </div>
                </div>
            </div>

            {/* Score Breakdown Grid */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                {Object.entries(sampleReport.scores).map(([key, value]) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className={`glass-card p-4 text-center border ${getScoreBg(value)}`}
                    >
                        <div className={`text-2xl font-bold ${getScoreColor(value)}`}>{value}%</div>
                        <div className="text-xs text-white/60 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</div>
                    </motion.div>
                ))}
            </div>

            {/* Charts Section */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Skill Radar */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-display font-semibold mb-6">Skill Analysis</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={sampleReport.skillScores}>
                            <PolarGrid stroke="rgba(255,255,255,0.1)" />
                            <PolarAngleAxis
                                dataKey="skill"
                                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
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

                {/* Performance Timeline */}
                <div className="glass-card p-6">
                    <h3 className="text-lg font-display font-semibold mb-6">Performance Timeline</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={sampleReport.timeline}>
                            <defs>
                                <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                    <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                            <XAxis
                                dataKey="question"
                                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            />
                            <YAxis
                                domain={[0, 100]}
                                tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                                axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            />
                            <Tooltip
                                contentStyle={{
                                    backgroundColor: '#1C242E',
                                    border: '1px solid rgba(255,255,255,0.1)',
                                    borderRadius: '8px'
                                }}
                            />
                            <Area
                                type="monotone"
                                dataKey="score"
                                stroke="#6366F1"
                                fill="url(#scoreGradient)"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Feedback Sections */}
            <div className="grid md:grid-cols-3 gap-6">
                {/* Strong Areas */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center">
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <h3 className="font-semibold">Strong Areas</h3>
                    </div>
                    <ul className="space-y-3">
                        {sampleReport.strongAreas.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Weak Areas */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-amber-500/20 flex items-center justify-center">
                            <Target className="w-5 h-5 text-amber-400" />
                        </div>
                        <h3 className="font-semibold">Areas to Improve</h3>
                    </div>
                    <ul className="space-y-3">
                        {sampleReport.weakAreas.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Missed Concepts */}
                <div className="glass-card p-6">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="w-10 h-10 rounded-xl bg-red-500/20 flex items-center justify-center">
                            <TrendingDown className="w-5 h-5 text-red-400" />
                        </div>
                        <h3 className="font-semibold">Missed Concepts</h3>
                    </div>
                    <ul className="space-y-3">
                        {sampleReport.missedConcepts.map((item, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm text-white/70">
                                <span className="w-4 h-4 rounded-full bg-red-500/20 flex items-center justify-center text-xs text-red-400 flex-shrink-0">
                                    {i + 1}
                                </span>
                                {item}
                            </li>
                        ))}
                    </ul>
                </div>
            </div>

            {/* Question-wise Breakdown */}
            <div className="glass-card p-6">
                <h3 className="text-lg font-display font-semibold mb-6">Question-wise Breakdown</h3>
                <div className="space-y-4">
                    {sampleReport.timeline.map((q) => (
                        <div key={q.question} className="flex items-center gap-4 p-4 rounded-xl bg-dark-700/30">
                            <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center text-white/60 font-medium">
                                Q{q.question}
                            </div>
                            <div className="flex-1">
                                <div className="font-medium mb-1">{q.topic}</div>
                                <div className="flex items-center gap-4 text-sm text-white/50">
                                    <span>{Math.floor(q.time / 60)}:{(q.time % 60).toString().padStart(2, '0')} time spent</span>
                                </div>
                            </div>
                            <div className={`text-2xl font-bold ${getScoreColor(q.score)}`}>
                                {q.score}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-4 justify-center">
                <Link to="/interview/setup" className="btn-primary">
                    <span>Practice Again</span>
                </Link>
                <Link to="/progress" className="btn-secondary">
                    View Progress Analysis
                </Link>
            </div>
        </motion.div>
    );

    // Reports List View
    const renderReportsList = () => (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="space-y-6"
        >
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-display font-bold mb-2">Interview Reports</h1>
                    <p className="text-white/60">Review your past performance and track improvement</p>
                </div>
                <div className="flex gap-3">
                    <select className="input-glass py-2 px-4 text-sm">
                        <option>All Types</option>
                        <option>Technical</option>
                        <option>HR & Behavioral</option>
                        <option>Project Viva</option>
                    </select>
                    <select className="input-glass py-2 px-4 text-sm">
                        <option>Last 30 Days</option>
                        <option>Last 7 Days</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>

            {/* Stats Summary */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-5 text-center">
                    <div className="text-3xl font-display font-bold gradient-text mb-1">24</div>
                    <div className="text-sm text-white/50">Total Interviews</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="text-3xl font-display font-bold text-emerald-400 mb-1">78%</div>
                    <div className="text-sm text-white/50">Average Score</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="text-3xl font-display font-bold text-accent-indigo mb-1">92%</div>
                    <div className="text-sm text-white/50">Best Score</div>
                </div>
                <div className="glass-card p-5 text-center">
                    <div className="text-3xl font-display font-bold text-amber-400 mb-1">+12%</div>
                    <div className="text-sm text-white/50">Improvement</div>
                </div>
            </div>

            {/* Reports List */}
            <div className="glass-card divide-y divide-glass-border">
                {pastReports.map((report) => {
                    const Icon = typeIcons[report.type];
                    return (
                        <div
                            key={report.id}
                            onClick={() => setSelectedReport(report)}
                            className="p-4 flex items-center gap-4 hover:bg-glass-light cursor-pointer transition-colors"
                        >
                            <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${typeGradients[report.type]} flex items-center justify-center`}>
                                <Icon className="w-6 h-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="font-medium mb-1">{report.title}</h3>
                                <p className="text-sm text-white/50">{report.date}</p>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className={`text-2xl font-bold ${getScoreColor(report.score)}`}>
                                    {report.score}%
                                </div>
                                <ChevronRight className="w-5 h-5 text-white/40" />
                            </div>
                        </div>
                    );
                })}
            </div>
        </motion.div>
    );

    return (
        <DashboardLayout>
            {selectedReport ? renderReportDetail() : renderReportsList()}
        </DashboardLayout>
    );
}
