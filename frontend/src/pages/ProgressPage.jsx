import { motion } from 'framer-motion';
import {
    TrendingUp,
    TrendingDown,
    Target,
    Award,
    Calendar,
    Clock,
    Zap,
    Brain,
    ChevronRight,
    ArrowUpRight,
    ArrowDownRight
} from 'lucide-react';
import {
    LineChart,
    Line,
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    Radar
} from 'recharts';
import DashboardLayout from '../layouts/DashboardLayout';
import { Link } from 'react-router-dom';

// Sample progress data
const monthlyProgress = [
    { month: 'Aug', score: 58, interviews: 3 },
    { month: 'Sep', score: 62, interviews: 5 },
    { month: 'Oct', score: 68, interviews: 6 },
    { month: 'Nov', score: 72, interviews: 4 },
    { month: 'Dec', score: 75, interviews: 7 },
    { month: 'Jan', score: 78, interviews: 5 },
];

const skillTrends = [
    { name: 'Problem Solving', current: 85, previous: 72, change: 13 },
    { name: 'Communication', current: 82, previous: 75, change: 7 },
    { name: 'Technical Depth', current: 78, previous: 70, change: 8 },
    { name: 'System Design', current: 65, previous: 55, change: 10 },
    { name: 'Code Quality', current: 80, previous: 78, change: 2 },
];

const weeklyActivity = [
    { day: 'Mon', minutes: 45 },
    { day: 'Tue', minutes: 30 },
    { day: 'Wed', minutes: 60 },
    { day: 'Thu', minutes: 0 },
    { day: 'Fri', minutes: 90 },
    { day: 'Sat', minutes: 45 },
    { day: 'Sun', minutes: 20 },
];

const currentSkills = [
    { skill: 'DSA', score: 78, fullMark: 100 },
    { skill: 'System Design', score: 65, fullMark: 100 },
    { skill: 'Frontend', score: 85, fullMark: 100 },
    { skill: 'Backend', score: 72, fullMark: 100 },
    { skill: 'Database', score: 68, fullMark: 100 },
    { skill: 'DevOps', score: 55, fullMark: 100 },
];

const achievements = [
    { title: 'First Interview', description: 'Completed your first mock interview', earned: true, icon: '🎯' },
    { title: 'Consistent Learner', description: '7-day practice streak', earned: true, icon: '🔥' },
    { title: 'Score Master', description: 'Scored 90%+ in any interview', earned: true, icon: '⭐' },
    { title: 'Tech Wizard', description: 'Mastered 5 different tech stacks', earned: false, icon: '🧙' },
    { title: 'Interview Pro', description: 'Completed 50 interviews', earned: false, icon: '🏆' },
];

const weakAreasLog = [
    { topic: 'Dynamic Programming', occurrences: 5, lastSeen: '2 days ago', trend: 'improving' },
    { topic: 'System Design Patterns', occurrences: 4, lastSeen: '1 week ago', trend: 'stable' },
    { topic: 'Database Optimization', occurrences: 3, lastSeen: '3 days ago', trend: 'worsening' },
    { topic: 'Graph Algorithms', occurrences: 2, lastSeen: '5 days ago', trend: 'improving' },
];

export default function ProgressPage() {
    return (
        <DashboardLayout>
            <div className="space-y-6">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center justify-between"
                >
                    <div>
                        <h1 className="text-2xl font-display font-bold mb-2">Progress Analysis</h1>
                        <p className="text-white/60">Track your growth and identify areas for improvement</p>
                    </div>
                    <select className="input-glass py-2 px-4 text-sm">
                        <option>Last 6 Months</option>
                        <option>Last 3 Months</option>
                        <option>Last Year</option>
                    </select>
                </motion.div>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                        { label: 'Total Interviews', value: '24', change: '+5', icon: Target, positive: true },
                        { label: 'Average Score', value: '78%', change: '+12%', icon: TrendingUp, positive: true },
                        { label: 'Practice Hours', value: '15.5h', change: '+3h', icon: Clock, positive: true },
                        { label: 'Current Streak', value: '7 days', change: 'Best: 12', icon: Zap, positive: true },
                    ].map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="glass-card p-5"
                        >
                            <div className="flex items-center justify-between mb-3">
                                <stat.icon className="w-5 h-5 text-accent-indigo" />
                                <span className={`text-xs flex items-center gap-1 ${stat.positive ? 'text-emerald-400' : 'text-red-400'}`}>
                                    {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                    {stat.change}
                                </span>
                            </div>
                            <div className="text-2xl font-display font-bold mb-1">{stat.value}</div>
                            <div className="text-sm text-white/50">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Charts Row */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Score Progression */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-6">Score Progression</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={monthlyProgress}>
                                <defs>
                                    <linearGradient id="progressGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="month"
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                />
                                <YAxis
                                    domain={[50, 100]}
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
                                    fill="url(#progressGradient)"
                                    strokeWidth={2}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Skill Radar */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-6">Current Skill Map</h3>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={currentSkills}>
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
                                    stroke="#8B5CF6"
                                    fill="#8B5CF6"
                                    fillOpacity={0.3}
                                    strokeWidth={2}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Skill Trends & Weekly Activity */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Skill Trends */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="lg:col-span-2 glass-card p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-6">Skill Improvement</h3>
                        <div className="space-y-4">
                            {skillTrends.map((skill) => (
                                <div key={skill.name} className="flex items-center gap-4">
                                    <div className="w-32 text-sm font-medium">{skill.name}</div>
                                    <div className="flex-1">
                                        <div className="relative h-4 bg-dark-600 rounded-full overflow-hidden">
                                            {/* Previous score (dimmed) */}
                                            <div
                                                className="absolute inset-y-0 left-0 bg-white/10 rounded-full"
                                                style={{ width: `${skill.previous}%` }}
                                            />
                                            {/* Current score */}
                                            <motion.div
                                                className="absolute inset-y-0 left-0 bg-gradient-to-r from-accent-indigo to-accent-purple rounded-full"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${skill.current}%` }}
                                                transition={{ duration: 1, delay: 0.2 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="w-16 text-right">
                                        <span className="font-semibold">{skill.current}%</span>
                                    </div>
                                    <div className="w-16 text-right">
                                        <span className="text-emerald-400 text-sm flex items-center justify-end gap-1">
                                            <TrendingUp className="w-4 h-4" />
                                            +{skill.change}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Weekly Activity */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-6">This Week</h3>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                                <XAxis
                                    dataKey="day"
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                />
                                <YAxis
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C242E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '8px'
                                    }}
                                    formatter={(value) => [`${value} min`, 'Practice']}
                                />
                                <Bar
                                    dataKey="minutes"
                                    fill="#6366F1"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ResponsiveContainer>
                        <div className="mt-4 pt-4 border-t border-glass-border text-center">
                            <div className="text-2xl font-bold gradient-text">4h 50m</div>
                            <div className="text-sm text-white/50">Total this week</div>
                        </div>
                    </motion.div>
                </div>

                {/* Weak Areas & Achievements */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Weak Areas Tracking */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display font-semibold">Weak Areas Log</h3>
                            <Link to="/techstack-evaluation" className="text-sm text-accent-indigo hover:underline flex items-center gap-1">
                                Practice <ChevronRight className="w-4 h-4" />
                            </Link>
                        </div>
                        <div className="space-y-4">
                            {weakAreasLog.map((area, index) => (
                                <div key={index} className="flex items-center justify-between p-4 rounded-xl bg-dark-700/30">
                                    <div className="flex items-center gap-4">
                                        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${area.trend === 'improving' ? 'bg-emerald-500/20' :
                                                area.trend === 'stable' ? 'bg-amber-500/20' : 'bg-red-500/20'
                                            }`}>
                                            {area.trend === 'improving' ? (
                                                <TrendingUp className="w-5 h-5 text-emerald-400" />
                                            ) : area.trend === 'stable' ? (
                                                <Target className="w-5 h-5 text-amber-400" />
                                            ) : (
                                                <TrendingDown className="w-5 h-5 text-red-400" />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-medium">{area.topic}</div>
                                            <div className="text-sm text-white/50">Last seen: {area.lastSeen}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-semibold">{area.occurrences}x</div>
                                        <div className="text-xs text-white/50">mistakes</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* Achievements */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-6">Achievements</h3>
                        <div className="grid grid-cols-2 gap-4">
                            {achievements.map((achievement, index) => (
                                <div
                                    key={index}
                                    className={`p-4 rounded-xl text-center transition-all ${achievement.earned
                                            ? 'bg-gradient-to-br from-accent-indigo/20 to-accent-purple/20 border border-accent-indigo/30'
                                            : 'bg-dark-700/30 opacity-50'
                                        }`}
                                >
                                    <div className="text-3xl mb-2">{achievement.icon}</div>
                                    <div className="font-medium text-sm mb-1">{achievement.title}</div>
                                    <div className="text-xs text-white/50">{achievement.description}</div>
                                    {achievement.earned && (
                                        <div className="mt-2">
                                            <span className="badge badge-success text-xs">Earned</span>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </div>

                {/* AI Insights */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6"
                >
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center">
                            <Brain className="w-5 h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-display font-semibold">AI Insights</h3>
                            <p className="text-sm text-white/50">Personalized recommendations based on your performance</p>
                        </div>
                    </div>

                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                            <h4 className="font-medium text-emerald-400 mb-2">🎯 Your Strength</h4>
                            <p className="text-sm text-white/70">
                                Problem-solving skills have improved by 18% this month. Your structured approach to breaking down problems is excellent.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                            <h4 className="font-medium text-amber-400 mb-2">📈 Focus This Week</h4>
                            <p className="text-sm text-white/70">
                                Dedicate 2-3 sessions to Dynamic Programming. Use the pattern-based approach you've been developing.
                            </p>
                        </div>
                        <div className="p-4 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20">
                            <h4 className="font-medium text-accent-indigo mb-2">🚀 Next Milestone</h4>
                            <p className="text-sm text-white/70">
                                You're 3 interviews away from reaching the "Interview Pro" achievement. Keep up the consistency!
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>
        </DashboardLayout>
    );
}
