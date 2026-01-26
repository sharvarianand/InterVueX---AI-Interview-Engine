import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
    ChevronRight,
    Play,
    Sparkles,
    Brain,
    Target,
    TrendingUp,
    Shield,
    Zap,
    Users,
    Code,
    MessageSquare,
    FileText,
    Award,
    BarChart3,
    CheckCircle2,
    ArrowRight,
    Github,
    Twitter,
    Linkedin
} from 'lucide-react';
import { SignUpButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import Navbar from '../components/common/Navbar';
import AIAura from '../components/landing/AIAura';

// Animation variants
const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.1
        }
    }
};

export default function LandingPage() {
    const features = [
        {
            icon: Brain,
            title: 'Adaptive AI Interviews',
            description: 'Dynamic questions that evolve based on your responses, testing true understanding.',
            gradient: 'from-indigo-500 to-purple-500'
        },
        {
            icon: Target,
            title: 'Project-Aware Viva',
            description: 'Upload your projects and face real technical deep-dives on your own work.',
            gradient: 'from-purple-500 to-pink-500'
        },
        {
            icon: MessageSquare,
            title: 'HR & Behavioral',
            description: 'Practice situational questions with personalized feedback on communication.',
            gradient: 'from-pink-500 to-rose-500'
        },
        {
            icon: Code,
            title: 'Tech Stack Mastery',
            description: 'Focused evaluation on your chosen technologies with skill radar analysis.',
            gradient: 'from-cyan-500 to-blue-500'
        },
        {
            icon: Shield,
            title: 'Proctored Sessions',
            description: 'Camera monitoring, fullscreen enforcement, and integrity tracking.',
            gradient: 'from-emerald-500 to-teal-500'
        },
        {
            icon: BarChart3,
            title: 'Recruiter-Grade Reports',
            description: 'Detailed analytics, skill breakdowns, and actionable improvement plans.',
            gradient: 'from-orange-500 to-amber-500'
        }
    ];

    const useCases = [
        {
            title: 'Job Seekers',
            description: 'Practice unlimited mock interviews tailored to your target role and company.',
            icon: Users
        },
        {
            title: 'Students',
            description: 'Prepare for campus placements with realistic technical and HR rounds.',
            icon: Award
        },
        {
            title: 'Developers',
            description: 'Test your knowledge depth and discover blind spots in your tech stack.',
            icon: Code
        },
        {
            title: 'Career Switchers',
            description: 'Build confidence in new domains with structured practice sessions.',
            icon: TrendingUp
        }
    ];

    const stats = [
        { value: '10K+', label: 'Interviews Conducted' },
        { value: '95%', label: 'User Satisfaction' },
        { value: '50+', label: 'Tech Stacks Covered' },
        { value: '3x', label: 'Faster Improvement' }
    ];

    return (
        <div className="min-h-screen bg-dark-900 overflow-hidden">
            <Navbar variant="landing" />

            {/* Hero Section */}
            <section className="relative min-h-screen flex items-center pt-20">
                {/* Background effects */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-accent-indigo/10 rounded-full blur-3xl" />
                    <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent-purple/10 rounded-full blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent-cyan/5 rounded-full blur-3xl" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        {/* Left: Text Content */}
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="text-center lg:text-left"
                        >
                            {/* Badge */}
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.2 }}
                                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent-indigo/10 border border-accent-indigo/20 mb-6"
                            >
                                <Sparkles className="w-4 h-4 text-accent-indigo" />
                                <span className="text-sm text-accent-indigo font-medium">AI-Powered Interview Platform</span>
                            </motion.div>

                            {/* Headline */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold leading-tight mb-6">
                                Master Your Next Interview with{' '}
                                <span className="gradient-text">AI Precision</span>
                            </h1>

                            {/* Subheadline */}
                            <p className="text-lg md:text-xl text-white/60 mb-8 max-w-xl mx-auto lg:mx-0">
                                Experience adaptive mock interviews that evaluate not just answers,
                                but reasoning depth, communication, and real-world problem-solving.
                            </p>

                            {/* CTAs */}
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <SignedOut>
                                    <SignUpButton mode="modal">
                                        <button className="btn-primary group text-lg">
                                            <span className="flex items-center justify-center gap-2">
                                                Start Free Interview
                                                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </button>
                                    </SignUpButton>
                                </SignedOut>
                                <SignedIn>
                                    <Link to="/dashboard" className="btn-primary group text-lg">
                                        <span className="flex items-center justify-center gap-2">
                                            Start Free Interview
                                            <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                        </span>
                                    </Link>
                                </SignedIn>
                                <a href="#how-it-works" className="btn-secondary flex items-center justify-center gap-2 text-lg">
                                    <Play className="w-5 h-5" />
                                    See How It Works
                                </a>
                            </div>

                            {/* Social Proof */}
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="mt-12 flex items-center gap-6 justify-center lg:justify-start"
                            >
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4, 5].map((i) => (
                                        <div
                                            key={i}
                                            className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-indigo to-accent-purple border-2 border-dark-900 flex items-center justify-center text-xs font-bold"
                                        >
                                            {String.fromCharCode(64 + i)}
                                        </div>
                                    ))}
                                </div>
                                <div className="text-left">
                                    <p className="text-white font-semibold">10,000+ Users</p>
                                    <p className="text-white/50 text-sm">Trust InterVueX</p>
                                </div>
                            </motion.div>
                        </motion.div>

                        {/* Right: AI Aura */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 1, delay: 0.3 }}
                            className="flex justify-center lg:justify-end"
                        >
                            <AIAura size={450} interactive={true} />
                        </motion.div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <motion.div
                    className="absolute bottom-8 left-1/2 -translate-x-1/2"
                    animate={{ y: [0, 10, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <div className="w-6 h-10 rounded-full border-2 border-white/20 flex justify-center pt-2">
                        <div className="w-1 h-2 bg-white/40 rounded-full" />
                    </div>
                </motion.div>
            </section>

            {/* Stats Section */}
            <section className="relative py-20 border-y border-glass-border bg-glass-light">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid grid-cols-2 md:grid-cols-4 gap-8"
                    >
                        {stats.map((stat, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="text-center"
                            >
                                <div className="text-4xl md:text-5xl font-display font-bold gradient-text mb-2">
                                    {stat.value}
                                </div>
                                <div className="text-white/50">{stat.label}</div>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Everything You Need to{' '}
                            <span className="gradient-text">Ace Interviews</span>
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            A comprehensive suite of AI-powered tools designed to transform your interview preparation.
                        </p>
                    </motion.div>

                    {/* Features Grid */}
                    <motion.div
                        variants={staggerContainer}
                        initial="initial"
                        whileInView="animate"
                        viewport={{ once: true }}
                        className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {features.map((feature, index) => (
                            <motion.div
                                key={index}
                                variants={fadeInUp}
                                className="glass-card-hover p-6 group"
                            >
                                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                    <feature.icon className="w-6 h-6 text-white" />
                                </div>
                                <h3 className="text-xl font-display font-semibold mb-2">{feature.title}</h3>
                                <p className="text-white/60">{feature.description}</p>
                            </motion.div>
                        ))}
                    </motion.div>
                </div>
            </section>

            {/* How It Works Section */}
            <section id="how-it-works" className="relative py-24 bg-dark-800/50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    {/* Section Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            How <span className="gradient-text">InterVueX</span> Works
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Three simple steps to transform your interview performance.
                        </p>
                    </motion.div>

                    {/* Steps */}
                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connection line */}
                        <div className="hidden md:block absolute top-16 left-1/4 right-1/4 h-0.5 bg-gradient-to-r from-accent-indigo via-accent-purple to-accent-cyan" />

                        {[
                            {
                                step: '01',
                                title: 'Choose Interview Type',
                                description: 'Select from Technical, HR, Project Viva, or Tech Stack evaluation modes.',
                                icon: Target
                            },
                            {
                                step: '02',
                                title: 'Complete Your Session',
                                description: 'Face adaptive AI questions with real-time proctoring and time management.',
                                icon: Zap
                            },
                            {
                                step: '03',
                                title: 'Get Detailed Analysis',
                                description: 'Receive comprehensive reports with skill breakdowns and improvement roadmaps.',
                                icon: BarChart3
                            }
                        ].map((step, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.2 }}
                                className="relative text-center"
                            >
                                <div className="relative inline-flex items-center justify-center w-32 h-32 mb-6">
                                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-accent-indigo/20 to-accent-purple/20 animate-pulse" />
                                    <div className="relative w-24 h-24 rounded-full bg-dark-700 border border-glass-border flex items-center justify-center">
                                        <step.icon className="w-10 h-10 text-accent-indigo" />
                                    </div>
                                    <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-accent-indigo flex items-center justify-center text-sm font-bold">
                                        {step.step}
                                    </div>
                                </div>
                                <h3 className="text-xl font-display font-semibold mb-2">{step.title}</h3>
                                <p className="text-white/60">{step.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Use Cases Section */}
            <section id="use-cases" className="relative py-24">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                            Built for <span className="gradient-text">Everyone</span>
                        </h2>
                        <p className="text-white/60 text-lg max-w-2xl mx-auto">
                            Whether you're a student, professional, or career switcher — InterVueX adapts to your needs.
                        </p>
                    </motion.div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {useCases.map((useCase, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="glass-card p-6 text-center group hover:bg-glass-medium transition-all duration-300"
                            >
                                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-accent-indigo/10 border border-accent-indigo/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    <useCase.icon className="w-8 h-8 text-accent-indigo" />
                                </div>
                                <h3 className="text-lg font-display font-semibold mb-2">{useCase.title}</h3>
                                <p className="text-white/60 text-sm">{useCase.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="relative py-24">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative glass-card p-12 text-center overflow-hidden"
                    >
                        {/* Background effects */}
                        <div className="absolute inset-0 bg-gradient-to-br from-accent-indigo/10 via-transparent to-accent-purple/10" />
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 bg-accent-indigo/20 rounded-full blur-3xl -translate-y-1/2" />

                        <div className="relative">
                            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
                                Ready to Transform Your Interview Skills?
                            </h2>
                            <p className="text-white/60 text-lg mb-8 max-w-xl mx-auto">
                                Join thousands of candidates who've boosted their confidence and landed their dream jobs with InterVueX.
                            </p>
                            <SignedOut>
                                <SignUpButton mode="modal">
                                    <button className="btn-primary inline-flex items-center gap-2 text-lg">
                                        <span>Start Your Free Interview</span>
                                        <ArrowRight className="w-5 h-5" />
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link to="/dashboard" className="btn-primary inline-flex items-center gap-2 text-lg">
                                    <span>Start Your Free Interview</span>
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </SignedIn>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Footer */}
            <footer className="border-t border-glass-border py-12">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid md:grid-cols-4 gap-8">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-2 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center">
                                    <Sparkles className="w-5 h-5 text-white" />
                                </div>
                                <span className="font-display font-bold text-xl">InterVueX</span>
                            </div>
                            <p className="text-white/50 mb-6 max-w-sm">
                                AI-powered interview preparation platform that helps you practice, improve, and succeed.
                            </p>
                            <div className="flex gap-4">
                                <a href="#" className="w-10 h-10 rounded-lg bg-glass-light border border-glass-border flex items-center justify-center text-white/60 hover:text-white hover:bg-glass-medium transition-all">
                                    <Twitter className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-glass-light border border-glass-border flex items-center justify-center text-white/60 hover:text-white hover:bg-glass-medium transition-all">
                                    <Github className="w-5 h-5" />
                                </a>
                                <a href="#" className="w-10 h-10 rounded-lg bg-glass-light border border-glass-border flex items-center justify-center text-white/60 hover:text-white hover:bg-glass-medium transition-all">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                        {/* Links */}
                        <div>
                            <h4 className="font-semibold mb-4">Product</h4>
                            <ul className="space-y-2">
                                <li><a href="#features" className="text-white/50 hover:text-white transition-colors">Features</a></li>
                                <li><a href="#how-it-works" className="text-white/50 hover:text-white transition-colors">How It Works</a></li>
                                <li><a href="#use-cases" className="text-white/50 hover:text-white transition-colors">Use Cases</a></li>
                                <li><Link to="/dashboard" className="text-white/50 hover:text-white transition-colors">Dashboard</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h4 className="font-semibold mb-4">Resources</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Documentation</a></li>
                                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Blog</a></li>
                                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Support</a></li>
                                <li><a href="#" className="text-white/50 hover:text-white transition-colors">Privacy</a></li>
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-glass-border mt-12 pt-8 text-center text-white/40 text-sm">
                        © 2024 InterVueX. All rights reserved. Built with 💜 for interview excellence.
                    </div>
                </div>
            </footer>
        </div>
    );
}
