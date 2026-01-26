import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Code,
    Users,
    Briefcase,
    Layers,
    Play,
    Clock,
    Target,
    TrendingUp,
    ChevronRight,
    Star,
    Calendar,
    Award,
    Brain,
    Zap,
    ArrowUpRight
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useStore } from '../store/useStore';

// Interview type configurations
const interviewTypes = {
    technical: {
        title: 'Technical Interview',
        description: 'DSA, System Design, and coding fundamentals',
        icon: Code,
        gradient: 'from-indigo-500 to-blue-500',
        topics: ['Data Structures', 'Algorithms', 'System Design', 'OOP', 'Database'],
        duration: '30-45 min',
        difficulty: 'Adaptive'
    },
    hr: {
        title: 'HR & Behavioral',
        description: 'Communication, situational awareness, and soft skills',
        icon: Users,
        gradient: 'from-pink-500 to-rose-500',
        topics: ['Leadership', 'Teamwork', 'Conflict Resolution', 'Career Goals', 'Strengths'],
        duration: '20-30 min',
        difficulty: 'Moderate'
    },
    project: {
        title: 'Project Viva',
        description: 'Deep dive into your projects and practical experience',
        icon: Briefcase,
        gradient: 'from-purple-500 to-violet-500',
        topics: ['Architecture', 'Decisions', 'Challenges', 'Tech Stack', 'Impact'],
        duration: '25-40 min',
        difficulty: 'Project-based'
    }
};

// Stats cards data
const statsCards = [
    { label: 'Total Interviews', value: '24', change: '+3 this week', icon: Play, color: 'text-accent-indigo' },
    { label: 'Average Score', value: '78%', change: '+5% vs last month', icon: Target, color: 'text-accent-cyan' },
    { label: 'Practice Hours', value: '12.5h', change: 'This month', icon: Clock, color: 'text-accent-purple' },
    { label: 'Skill Growth', value: '+15%', change: 'Overall improvement', icon: TrendingUp, color: 'text-emerald-400' },
];

// Recent activity data
const recentActivity = [
    { type: 'technical', title: 'DSA Interview', score: 82, date: '2 hours ago', status: 'completed' },
    { type: 'hr', title: 'Behavioral Round', score: 88, date: 'Yesterday', status: 'completed' },
    { type: 'project', title: 'E-commerce Project', score: 75, date: '3 days ago', status: 'completed' },
    { type: 'technical', title: 'System Design', score: null, date: 'Scheduled', status: 'upcoming' },
];

// Skill progress data
const skillProgress = [
    { name: 'Problem Solving', score: 85, trend: 'up' },
    { name: 'Communication', score: 72, trend: 'up' },
    { name: 'Technical Depth', score: 78, trend: 'stable' },
    { name: 'System Design', score: 65, trend: 'up' },
    { name: 'Code Quality', score: 80, trend: 'stable' },
];

export default function DashboardPage() {
    const { tab } = useParams();
    const { setInterviewType } = useStore();

    // Render interview type card
    const renderInterviewCard = (type, config) => (
        <motion.div
            key={type}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card-hover p-6 group"
        >
            <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center group-hover:scale-110 transition-transform`}>
                    <config.icon className="w-7 h-7 text-white" />
                </div>
                <div className="flex gap-2">
                    <span className="badge text-xs">{config.duration}</span>
                </div>
            </div>

            <h3 className="text-xl font-display font-semibold mb-2">{config.title}</h3>
            <p className="text-white/60 text-sm mb-4">{config.description}</p>

            {/* Topics */}
            <div className="flex flex-wrap gap-2 mb-6">
                {config.topics.slice(0, 3).map((topic) => (
                    <span key={topic} className="px-2 py-1 rounded-lg bg-dark-600/50 text-xs text-white/70">
                        {topic}
                    </span>
                ))}
                {config.topics.length > 3 && (
                    <span className="px-2 py-1 rounded-lg bg-dark-600/50 text-xs text-white/70">
                        +{config.topics.length - 3} more
                    </span>
                )}
            </div>

            <Link
                to={`/interview/setup?type=${type}`}
                onClick={() => setInterviewType(type)}
                className="w-full btn-primary text-sm flex items-center justify-center gap-2"
            >
                <Play className="w-4 h-4" />
                Start Interview
            </Link>
        </motion.div>
    );

    // Render main dashboard view
    const renderDashboard = () => (
        <div className="space-y-8">
            {/* Welcome Section */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="relative glass-card p-8 overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-br from-accent-indigo/10 via-transparent to-accent-purple/10" />
                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-indigo/10 rounded-full blur-3xl" />

                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">
                            Welcome back! 👋
                        </h1>
                        <p className="text-white/60 max-w-lg">
                            You've completed 24 interviews this month. Your consistency is paying off—keep pushing towards your goals!
                        </p>
                    </div>
                    <Link
                        to="/interview/setup"
                        className="btn-primary flex items-center gap-2 whitespace-nowrap"
                    >
                        <Zap className="w-5 h-5" />
                        Quick Start Interview
                    </Link>
                </div>
            </motion.div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((stat, index) => (
                    <motion.div
                        key={stat.label}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass-card p-5"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <stat.icon className={`w-5 h-5 ${stat.color}`} />
                            <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                        </div>
                        <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
                        <div className="text-sm text-white/50">{stat.label}</div>
                        <div className="text-xs text-emerald-400 mt-2">{stat.change}</div>
                    </motion.div>
                ))}
            </div>

            {/* Interview Types */}
            <div>
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-xl font-display font-semibold">Choose Interview Type</h2>
                    <Link to="/techstack-evaluation" className="text-accent-indigo text-sm hover:underline flex items-center gap-1">
                        Try Tech Stack Eval <ChevronRight className="w-4 h-4" />
                    </Link>
                </div>
                <div className="grid md:grid-cols-3 gap-6">
                    {Object.entries(interviewTypes).map(([type, config]) => renderInterviewCard(type, config))}
                </div>
            </div>

            {/* Two Column Layout */}
            <div className="grid lg:grid-cols-2 gap-6">
                {/* Recent Activity */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-display font-semibold">Recent Activity</h3>
                        <Link to="/reports" className="text-sm text-accent-indigo hover:underline">
                            View All
                        </Link>
                    </div>

                    <div className="space-y-4">
                        {recentActivity.map((activity, index) => {
                            const config = interviewTypes[activity.type];
                            return (
                                <div
                                    key={index}
                                    className="flex items-center gap-4 p-3 rounded-xl bg-dark-700/30 hover:bg-dark-700/50 transition-colors"
                                >
                                    <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${config.gradient} flex items-center justify-center flex-shrink-0`}>
                                        <config.icon className="w-5 h-5 text-white" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium truncate">{activity.title}</p>
                                        <p className="text-sm text-white/50">{activity.date}</p>
                                    </div>
                                    {activity.score ? (
                                        <div className="text-right">
                                            <div className="font-semibold text-accent-indigo">{activity.score}%</div>
                                            <div className="text-xs text-emerald-400">Completed</div>
                                        </div>
                                    ) : (
                                        <span className="badge">Upcoming</span>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </motion.div>

                {/* Skill Progress */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-display font-semibold">Skill Progress</h3>
                        <Link to="/progress" className="text-sm text-accent-indigo hover:underline">
                            Details
                        </Link>
                    </div>

                    <div className="space-y-5">
                        {skillProgress.map((skill) => (
                            <div key={skill.name}>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm font-medium">{skill.name}</span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-sm text-white/70">{skill.score}%</span>
                                        {skill.trend === 'up' && <TrendingUp className="w-4 h-4 text-emerald-400" />}
                                    </div>
                                </div>
                                <div className="progress-bar">
                                    <motion.div
                                        className="progress-bar-fill"
                                        initial={{ width: 0 }}
                                        animate={{ width: `${skill.score}%` }}
                                        transition={{ duration: 1, delay: 0.2 }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>

            {/* Recommendations */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-6"
            >
                <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                        <h3 className="text-lg font-display font-semibold">AI Recommendations</h3>
                        <p className="text-sm text-white/50">Based on your performance patterns</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                    <div className="p-4 rounded-xl bg-dark-700/30 border border-emerald-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Star className="w-4 h-4 text-emerald-400" />
                            <span className="text-sm font-medium text-emerald-400">Strength</span>
                        </div>
                        <p className="text-sm text-white/70">Your problem-solving skills are exceptional. Keep challenging yourself with harder problems.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-700/30 border border-amber-500/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Target className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-amber-400">Focus Area</span>
                        </div>
                        <p className="text-sm text-white/70">System design concepts need more practice. Try the dedicated evaluation module.</p>
                    </div>
                    <div className="p-4 rounded-xl bg-dark-700/30 border border-accent-indigo/20">
                        <div className="flex items-center gap-2 mb-2">
                            <Calendar className="w-4 h-4 text-accent-indigo" />
                            <span className="text-sm font-medium text-accent-indigo">Next Step</span>
                        </div>
                        <p className="text-sm text-white/70">Schedule a full mock interview to simulate real conditions and test your readiness.</p>
                    </div>
                </div>
            </motion.div>
        </div>
    );

    // Render specific interview type view
    const renderInterviewTypeView = () => {
        const config = interviewTypes[tab];
        if (!config) return renderDashboard();

        return (
            <div className="space-y-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="relative glass-card p-8 overflow-hidden"
                >
                    <div className={`absolute inset-0 bg-gradient-to-br ${config.gradient} opacity-10`} />

                    <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                        <div className={`w-20 h-20 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                            <config.icon className="w-10 h-10 text-white" />
                        </div>
                        <div className="flex-1">
                            <h1 className="text-2xl md:text-3xl font-display font-bold mb-2">{config.title}</h1>
                            <p className="text-white/60 mb-4">{config.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {config.topics.map((topic) => (
                                    <span key={topic} className="badge">{topic}</span>
                                ))}
                            </div>
                        </div>
                        <Link
                            to={`/interview/setup?type=${tab}`}
                            onClick={() => setInterviewType(tab)}
                            className="btn-primary flex items-center gap-2"
                        >
                            <Play className="w-5 h-5" />
                            Start Now
                        </Link>
                    </div>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="glass-card p-5 text-center">
                        <div className="text-3xl font-display font-bold gradient-text mb-1">8</div>
                        <div className="text-sm text-white/50">Sessions Completed</div>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <div className="text-3xl font-display font-bold gradient-text mb-1">76%</div>
                        <div className="text-sm text-white/50">Average Score</div>
                    </div>
                    <div className="glass-card p-5 text-center">
                        <div className="text-3xl font-display font-bold gradient-text mb-1">+12%</div>
                        <div className="text-sm text-white/50">Improvement</div>
                    </div>
                </div>

                {/* Interview Options */}
                <div className="grid md:grid-cols-2 gap-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card-hover p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-3">Quick Practice</h3>
                        <p className="text-white/60 text-sm mb-4">
                            15-minute focused session on specific topics. Great for daily practice.
                        </p>
                        <Link to={`/interview/setup?type=${tab}&mode=quick`} className="btn-secondary w-full text-center">
                            Start Quick Session
                        </Link>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card-hover p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-3">Full Interview</h3>
                        <p className="text-white/60 text-sm mb-4">
                            Complete 30-45 minute session simulating a real interview experience.
                        </p>
                        <Link to={`/interview/setup?type=${tab}&mode=full`} className="btn-primary w-full text-center">
                            <span>Start Full Interview</span>
                        </Link>
                    </motion.div>
                </div>

                {/* Past Sessions */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <h3 className="text-lg font-display font-semibold mb-6">Past Sessions</h3>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-xl bg-dark-700/30 hover:bg-dark-700/50 transition-colors">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-lg bg-dark-600 flex items-center justify-center text-white/60">
                                        #{i}
                                    </div>
                                    <div>
                                        <p className="font-medium">Session {i}</p>
                                        <p className="text-sm text-white/50">{i} days ago • 32 min</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="text-right">
                                        <div className="font-semibold">{70 + i * 5}%</div>
                                        <div className="text-xs text-emerald-400">+{i * 2}%</div>
                                    </div>
                                    <Link to={`/reports/${i}`} className="btn-secondary text-sm py-2 px-4">
                                        View Report
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>
            </div>
        );
    };

    return (
        <DashboardLayout>
            {tab ? renderInterviewTypeView() : renderDashboard()}
        </DashboardLayout>
    );
}
