import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
    Sparkles,
    LayoutDashboard,
    Code,
    Users,
    Briefcase,
    Layers,
    FileText,
    TrendingUp,
    Settings,
    LogOut,
    ChevronLeft,
    ChevronRight,
    Bell,
    Search
} from 'lucide-react';
import { useStore } from '../store/useStore';

const navItems = [
    {
        name: 'Dashboard',
        path: '/dashboard',
        icon: LayoutDashboard,
        exact: true
    },
    {
        name: 'Technical Interview',
        path: '/dashboard/technical',
        icon: Code
    },
    {
        name: 'HR & Behavioral',
        path: '/dashboard/hr',
        icon: Users
    },
    {
        name: 'Project Viva',
        path: '/dashboard/project',
        icon: Briefcase
    },
    {
        name: 'Tech Stack Eval',
        path: '/techstack-evaluation',
        icon: Layers
    },
    {
        divider: true
    },
    {
        name: 'Reports',
        path: '/reports',
        icon: FileText
    },
    {
        name: 'Progress',
        path: '/progress',
        icon: TrendingUp
    },
    {
        divider: true
    },
    {
        name: 'Settings',
        path: '/settings',
        icon: Settings
    },
];

export default function DashboardLayout({ children }) {
    const location = useLocation();
    const { sidebarOpen, toggleSidebar, user } = useStore();

    const isActive = (item) => {
        if (item.exact) {
            return location.pathname === item.path;
        }
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="min-h-screen bg-dark-900 flex">
            {/* Sidebar */}
            <motion.aside
                initial={false}
                animate={{ width: sidebarOpen ? 280 : 80 }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="fixed left-0 top-0 bottom-0 z-40 bg-dark-800/50 backdrop-blur-xl border-r border-glass-border flex flex-col"
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-glass-border">
                    <Link to="/" className={`flex items-center gap-2 ${!sidebarOpen && 'justify-center w-full'}`}>
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center flex-shrink-0">
                            <Sparkles className="w-5 h-5 text-white" />
                        </div>
                        {sidebarOpen && (
                            <motion.span
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="font-display font-bold text-lg"
                            >
                                Inter<span className="gradient-text">VueX</span>
                            </motion.span>
                        )}
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="flex-1 py-6 px-3 space-y-1 overflow-y-auto">
                    {navItems.map((item, index) => {
                        if (item.divider) {
                            return <div key={index} className="divider my-4" />;
                        }

                        const active = isActive(item);
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${active
                                        ? 'bg-gradient-to-r from-accent-indigo/20 to-accent-purple/10 text-white border-l-2 border-accent-indigo'
                                        : 'text-white/60 hover:text-white hover:bg-glass-light'
                                    } ${!sidebarOpen && 'justify-center px-3'}`}
                            >
                                <item.icon className={`w-5 h-5 flex-shrink-0 ${active && 'text-accent-indigo'}`} />
                                {sidebarOpen && (
                                    <motion.span
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        className="text-sm font-medium"
                                    >
                                        {item.name}
                                    </motion.span>
                                )}
                            </Link>
                        );
                    })}
                </nav>

                {/* Toggle Button */}
                <button
                    onClick={toggleSidebar}
                    className="absolute -right-3 top-20 w-6 h-6 rounded-full bg-dark-600 border border-glass-border flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                    {sidebarOpen ? (
                        <ChevronLeft className="w-4 h-4" />
                    ) : (
                        <ChevronRight className="w-4 h-4" />
                    )}
                </button>

                {/* User Section */}
                <div className="p-4 border-t border-glass-border">
                    <div className={`flex items-center gap-3 ${!sidebarOpen && 'justify-center'}`}>
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-bold">U</span>
                        </div>
                        {sidebarOpen && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex-1 min-w-0"
                            >
                                <p className="text-sm font-medium truncate">User Name</p>
                                <p className="text-xs text-white/50 truncate">user@email.com</p>
                            </motion.div>
                        )}
                        {sidebarOpen && (
                            <button className="p-2 text-white/40 hover:text-white transition-colors">
                                <LogOut className="w-4 h-4" />
                            </button>
                        )}
                    </div>
                </div>
            </motion.aside>

            {/* Main Content */}
            <div
                className="flex-1 transition-all duration-300"
                style={{ marginLeft: sidebarOpen ? 280 : 80 }}
            >
                {/* Top Header */}
                <header className="h-16 bg-dark-900/80 backdrop-blur-xl border-b border-glass-border sticky top-0 z-30 flex items-center justify-between px-6">
                    {/* Search */}
                    <div className="relative w-80">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
                        <input
                            type="text"
                            placeholder="Search interviews, reports..."
                            className="input-glass pl-10 py-2 text-sm"
                        />
                    </div>

                    {/* Right Actions */}
                    <div className="flex items-center gap-4">
                        {/* Notifications */}
                        <button className="relative p-2 text-white/60 hover:text-white transition-colors">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-1 right-1 w-2 h-2 bg-accent-pink rounded-full" />
                        </button>

                        {/* Quick Start Button */}
                        <Link to="/interview/setup" className="btn-primary text-sm">
                            <span className="flex items-center gap-2">
                                <Sparkles className="w-4 h-4" />
                                New Interview
                            </span>
                        </Link>
                    </div>
                </header>

                {/* Page Content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
