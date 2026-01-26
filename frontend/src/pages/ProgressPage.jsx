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
    Radar,
    Cell,
    PieChart,
    Pie,
    Sector
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

// This Week's Score Progression
const weeklyScoreProgression = [
    { day: 'Mon', score: 72, interviews: 1 },
    { day: 'Tue', score: 75, interviews: 1 },
    { day: 'Wed', score: 78, interviews: 2 },
    { day: 'Thu', score: 0, interviews: 0 },
    { day: 'Fri', score: 80, interviews: 1 },
    { day: 'Sat', score: 82, interviews: 1 },
    { day: 'Sun', score: 85, interviews: 1 },
];

// Current Skill Map This Week
const weeklySkillMap = [
    { skill: 'DSA', score: 78, previousWeek: 72, change: +6 },
    { skill: 'System Design', score: 65, previousWeek: 60, change: +5 },
    { skill: 'Frontend', score: 85, previousWeek: 82, change: +3 },
    { skill: 'Backend', score: 72, previousWeek: 70, change: +2 },
    { skill: 'Database', score: 68, previousWeek: 65, change: +3 },
    { skill: 'DevOps', score: 55, previousWeek: 52, change: +3 },
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

                {/* Charts Row 1 - Direct Progress */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Monthly Growth Trend */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display font-semibold">Monthly Growth Trend</h3>
                            <div className="flex items-center gap-2">
                                <span className="flex items-center gap-1 text-xs text-white/40">
                                    <div className="w-2 h-2 rounded-full bg-accent-indigo" />
                                    Avg. Score
                                </span>
                                <span className="flex items-center gap-1 text-xs text-white/40">
                                    <div className="w-2 h-2 rounded-full bg-accent-purple" />
                                    Interviews
                                </span>
                            </div>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <LineChart data={monthlyProgress}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="month"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C242E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px',
                                        boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)'
                                    }}
                                    itemStyle={{ fontSize: '12px' }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366F1"
                                    strokeWidth={3}
                                    dot={{ r: 4, fill: '#6366F1', strokeWidth: 2, stroke: '#1C242E' }}
                                    activeDot={{ r: 6, strokeWidth: 0 }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="interviews"
                                    stroke="#8B5CF6"
                                    strokeWidth={2}
                                    strokeDasharray="5 5"
                                    dot={false}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Score Progression This Week */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display font-semibold">Score Progression This Week</h3>
                            <span className="text-xs text-white/60 bg-accent-indigo/20 px-2 py-1 rounded">This Week</span>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <AreaChart data={weeklyScoreProgression}>
                                <defs>
                                    <linearGradient id="weeklyProgressGradient" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#6366F1" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#6366F1" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    domain={[0, 100]}
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C242E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="score"
                                    stroke="#6366F1"
                                    fill="url(#weeklyProgressGradient)"
                                    strokeWidth={3}
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </motion.div>
                </div>

                {/* Charts Row 2 - Skills */}
                <div className="grid lg:grid-cols-2 gap-6">
                    {/* Current Skill Map This Week */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display font-semibold">Current Skill Map</h3>
                            <span className="text-xs text-white/60 bg-accent-indigo/20 px-2 py-1 rounded">Performance Matrix</span>
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <RadarChart data={weeklySkillMap} cx="50%" cy="50%" outerRadius="80%">
                                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                                <PolarAngleAxis
                                    dataKey="skill"
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 11 }}
                                />
                                <PolarRadiusAxis
                                    angle={30}
                                    domain={[0, 100]}
                                    tick={false}
                                />
                                <Radar
                                    name="Current Score"
                                    dataKey="score"
                                    stroke="#8B5CF6"
                                    fill="#8B5CF6"
                                    fillOpacity={0.3}
                                    strokeWidth={3}
                                />
                                <Radar
                                    name="Previous Week"
                                    dataKey="previousWeek"
                                    stroke="#6366F1"
                                    fill="#6366F1"
                                    fillOpacity={0.1}
                                    strokeWidth={2}
                                    strokeDasharray="4 4"
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C242E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                />
                            </RadarChart>
                        </ResponsiveContainer>
                    </motion.div>

                    {/* Weekly Activity Heatmap style BarChart */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="glass-card p-6"
                    >
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-lg font-display font-semibold">Activity Intensity</h3>
                            <TrendingUp className="w-5 h-5 text-emerald-400" />
                        </div>
                        <ResponsiveContainer width="100%" height={280}>
                            <BarChart data={weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                                <XAxis
                                    dataKey="day"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: 'rgba(255,255,255,0.6)', fontSize: 12 }}
                                />
                                <Tooltip
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                    contentStyle={{
                                        backgroundColor: '#1C242E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                    formatter={(value) => [`${value} min`, 'Practice Time']}
                                />
                                <Bar
                                    dataKey="minutes"
                                    radius={[6, 6, 0, 0]}
                                >
                                    {weeklyActivity.map((entry, index) => (
                                        <Cell
                                            key={`cell-${index}`}
                                            fill={entry.minutes > 60 ? '#8B5CF6' : entry.minutes > 30 ? '#6366F1' : '#4F46E5'}
                                        />
                                    ))}
                                </Bar>
                            </BarChart>
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

                {/* Final Row: Skill Distribution & AI Insights */}
                <div className="grid lg:grid-cols-3 gap-6">
                    {/* Skill Distribution */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="glass-card p-6"
                    >
                        <h3 className="text-lg font-display font-semibold mb-6">Skill Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie
                                    data={currentSkills}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="score"
                                >
                                    {currentSkills.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][index % 6]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#1C242E',
                                        border: '1px solid rgba(255,255,255,0.1)',
                                        borderRadius: '12px'
                                    }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                            {currentSkills.map((s, i) => (
                                <div key={i} className="flex items-center gap-2 text-xs text-white/50">
                                    <div className="w-2 h-2 rounded-full" style={{ backgroundColor: ['#6366F1', '#8B5CF6', '#EC4899', '#3B82F6', '#10B981', '#F59E0B'][i % 6] }} />
                                    {s.skill}
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    {/* AI Insights (Occupying 2/3 now) */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="lg:col-span-2 glass-card p-6"
                    >
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center">
                                <Brain className="w-5 h-5 text-white" />
                            </div>
                            <div>
                                <h3 className="text-lg font-display font-semibold">Adaptive Learning Insights</h3>
                                <p className="text-sm text-white/50">Generative recommendations for your next session</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                                <h4 className="font-medium text-emerald-400 mb-2">🎯 Peak Performance</h4>
                                <p className="text-sm text-white/70">
                                    Your response speed in Backend interviews has peaked. You're ready for "Senior Level" challenges in Node.js.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20">
                                <h4 className="font-medium text-amber-400 mb-2">📈 Growth Ops</h4>
                                <p className="text-sm text-white/70">
                                    System Design is your biggest growth opportunity. Focus on Load Balancing and Caching strategies this week.
                                </p>
                            </div>
                            <div className="p-4 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20 col-span-2">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-medium text-accent-indigo mb-1">🚀 Road to Interview Pro</h4>
                                        <p className="text-sm text-white/70">
                                            Maintain your current streak for 3 more days to unlock the next level of mock simulations.
                                        </p>
                                    </div>
                                    <button className="btn-primary text-xs py-2">View Roadmap</button>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </div>
        </DashboardLayout>
    );
}
