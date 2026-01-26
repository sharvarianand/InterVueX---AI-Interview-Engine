import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Menu,
    X,
    Sparkles,
    ChevronRight,
    LayoutDashboard
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
    SignInButton,
    SignUpButton,
    UserButton,
    SignedIn,
    SignedOut
} from '@clerk/clerk-react';

export default function Navbar({ variant = 'landing' }) {
    const [isScrolled, setIsScrolled] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const location = useLocation();

    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const navLinks = [
        { name: 'Features', href: '/#features' },
        { name: 'How It Works', href: '/#how-it-works' },
        { name: 'Use Cases', href: '/#use-cases' },
    ];

    return (
        <motion.nav
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
                ? 'bg-dark-900/80 backdrop-blur-xl border-b border-glass-border'
                : 'bg-transparent'
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16 md:h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-2 group">
                        <div className="relative w-10 h-10 flex items-center justify-center">
                            <div className="absolute inset-0 bg-gradient-to-br from-accent-indigo to-accent-purple rounded-xl opacity-80 group-hover:opacity-100 transition-opacity" />
                            <Sparkles className="relative w-5 h-5 text-white" />
                        </div>
                        <span className="font-display font-bold text-xl text-white">
                            Inter<span className="gradient-text">VueX</span>
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {variant === 'landing' && navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="text-white/70 hover:text-white transition-colors text-sm font-medium"
                            >
                                {link.name}
                            </a>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden md:flex items-center gap-4">
                        <SignedOut>
                            <SignInButton mode="modal">
                                <button className="text-white/80 hover:text-white transition-colors text-sm font-medium">
                                    Sign In
                                </button>
                            </SignInButton>
                            <SignUpButton mode="modal">
                                <button className="btn-primary group py-2">
                                    <span className="flex items-center gap-2">
                                        Get Started
                                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                    </span>
                                </button>
                            </SignUpButton>
                        </SignedOut>
                        <SignedIn>
                            <Link
                                to="/dashboard"
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-glass-light hover:bg-glass-medium border border-glass-border transition-all text-sm font-medium text-white/90"
                            >
                                <LayoutDashboard className="w-4 h-4 text-accent-indigo" />
                                Dashboard
                            </Link>
                            <div className="ml-2 pl-2 border-l border-glass-border">
                                <UserButton
                                    appearance={{
                                        elements: {
                                            userButtonAvatarBox: "w-9 h-9 border border-accent-indigo/30 shadow-glow-sm"
                                        }
                                    }}
                                />
                            </div>
                        </SignedIn>
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        className="md:hidden p-2 text-white/70 hover:text-white"
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                    >
                        {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {mobileMenuOpen && (
                <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="md:hidden bg-dark-800/95 backdrop-blur-xl border-b border-glass-border"
                >
                    <div className="px-4 py-6 space-y-4">
                        {variant === 'landing' && navLinks.map((link) => (
                            <a
                                key={link.name}
                                href={link.href}
                                className="block text-white/70 hover:text-white transition-colors py-2"
                                onClick={() => setMobileMenuOpen(false)}
                            >
                                {link.name}
                            </a>
                        ))}
                        <div className="pt-4 border-t border-glass-border space-y-3">
                            <SignedOut>
                                <SignInButton mode="modal">
                                    <button
                                        className="block text-center btn-secondary w-full"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        Sign In
                                    </button>
                                </SignInButton>
                                <SignUpButton mode="modal">
                                    <button
                                        className="block text-center btn-primary w-full"
                                        onClick={() => setMobileMenuOpen(false)}
                                    >
                                        <span>Get Started</span>
                                    </button>
                                </SignUpButton>
                            </SignedOut>
                            <SignedIn>
                                <Link
                                    to="/dashboard"
                                    className="block text-center btn-primary w-full"
                                    onClick={() => setMobileMenuOpen(false)}
                                >
                                    Dashboard
                                </Link>
                                <div className="flex justify-center pt-2">
                                    <UserButton />
                                </div>
                            </SignedIn>
                        </div>
                    </div>
                </motion.div>
            )}
        </motion.nav>
    );
}
