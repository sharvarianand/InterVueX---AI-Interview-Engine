import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useUser } from '@clerk/clerk-react';
import {
    Settings,
    User,
    Bell,
    Shield,
    Palette,
    Volume2,
    Camera,
    Monitor,
    Key,
    Save,
    ChevronRight,
    Moon,
    Sun,
    Trash2,
    Download,
    LogOut
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';

const settingsSections = [
    { id: 'profile', name: 'Profile', icon: User },
    { id: 'notifications', name: 'Notifications', icon: Bell },
    { id: 'privacy', name: 'Privacy & Security', icon: Shield },
    { id: 'appearance', name: 'Appearance', icon: Palette },
    { id: 'interview', name: 'Interview Settings', icon: Monitor },
    { id: 'audio', name: 'Audio & Video', icon: Volume2 },
];

export default function SettingsPage() {
    const { user } = useUser();
    const [activeSection, setActiveSection] = useState('profile');
    const [settings, setSettings] = useState({
        // Profile
        name: user?.fullName || user?.firstName || 'User',
        email: user?.primaryEmailAddress?.emailAddress || '',
        role: 'Full Stack Developer',
        experience: '3-5 years',

        // Notifications
        emailNotifications: true,
        interviewReminders: true,
        progressUpdates: true,
        weeklyDigest: false,

        // Privacy
        profileVisible: true,
        shareProgress: false,
        dataCollection: true,

        // Appearance
        theme: 'dark',
        animations: true,
        compactMode: false,

        // Interview
        defaultDuration: '30',
        autoFullscreen: true,
        proctoringEnabled: true,
        cameraRequired: true,

        // Audio
        micTestBeforeInterview: true,
        autoMuteEnabled: false,
        noiseSupression: true,
    });

    // Update settings when user data changes
    useEffect(() => {
        if (user) {
            // Sync user data to settings form
            // eslint-disable-next-line react-hooks/exhaustive-deps
            setSettings(prev => {
                const newName = user.fullName || user.firstName || prev.name;
                const newEmail = user.primaryEmailAddress?.emailAddress || prev.email;

                // Only update if changed to avoid loops (though dependency array protects us)
                if (prev.name === newName && prev.email === newEmail) return prev;

                return {
                    ...prev,
                    name: newName,
                    email: newEmail,
                };
            });
        }
    }, [user]);

    const handleSettingChange = (key, value) => {
        setSettings(prev => ({ ...prev, [key]: value }));
    };

    const renderProfileSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-display font-semibold mb-4">Profile Information</h3>
                <p className="text-white/60 text-sm mb-6">Manage your personal information and preferences.</p>
            </div>

            {/* Avatar */}
            <div className="flex items-center gap-6 p-6 glass-card rounded-xl">
                <div className="relative">
                    <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-accent-indigo to-accent-purple flex items-center justify-center">
                        <span className="text-3xl font-bold">JD</span>
                    </div>
                    <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-dark-600 border border-glass-border flex items-center justify-center hover:bg-dark-500 transition-colors">
                        <Camera className="w-4 h-4" />
                    </button>
                </div>
                <div>
                    <h4 className="font-semibold mb-1">{settings.name}</h4>
                    <p className="text-white/60 text-sm mb-3">{settings.email}</p>
                    <button className="btn-secondary text-sm py-2 px-4">Change Avatar</button>
                </div>
            </div>

            {/* Form Fields */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Full Name</label>
                    <input
                        type="text"
                        value={settings.name}
                        onChange={(e) => handleSettingChange('name', e.target.value)}
                        className="input-glass"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Email</label>
                    <input
                        type="email"
                        value={settings.email}
                        onChange={(e) => handleSettingChange('email', e.target.value)}
                        className="input-glass"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Target Role</label>
                    <select
                        value={settings.role}
                        onChange={(e) => handleSettingChange('role', e.target.value)}
                        className="input-glass"
                    >
                        <option>Full Stack Developer</option>
                        <option>Frontend Developer</option>
                        <option>Backend Developer</option>
                        <option>Data Scientist</option>
                        <option>DevOps Engineer</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Experience Level</label>
                    <select
                        value={settings.experience}
                        onChange={(e) => handleSettingChange('experience', e.target.value)}
                        className="input-glass"
                    >
                        <option>0-1 years</option>
                        <option>1-3 years</option>
                        <option>3-5 years</option>
                        <option>5+ years</option>
                    </select>
                </div>
            </div>
        </div>
    );

    const renderNotificationsSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-display font-semibold mb-4">Notification Preferences</h3>
                <p className="text-white/60 text-sm mb-6">Choose how you want to be notified.</p>
            </div>

            <div className="space-y-4">
                {[
                    { key: 'emailNotifications', label: 'Email Notifications', description: 'Receive updates via email' },
                    { key: 'interviewReminders', label: 'Interview Reminders', description: 'Get reminded before scheduled sessions' },
                    { key: 'progressUpdates', label: 'Progress Updates', description: 'Weekly progress and achievement notifications' },
                    { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Summary of your weekly activity' },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-xl">
                        <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-white/50">{item.description}</div>
                        </div>
                        <label className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings[item.key]}
                                onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-dark-600 rounded-full peer peer-checked:bg-accent-indigo transition-colors">
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-6' : ''
                                    }`} />
                            </div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderPrivacySection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-display font-semibold mb-4">Privacy & Security</h3>
                <p className="text-white/60 text-sm mb-6">Control your privacy settings and data.</p>
            </div>

            <div className="space-y-4">
                {[
                    { key: 'profileVisible', label: 'Public Profile', description: 'Allow others to see your profile' },
                    { key: 'shareProgress', label: 'Share Progress', description: 'Share your progress on leaderboards' },
                    { key: 'dataCollection', label: 'Analytics Data', description: 'Help us improve with anonymous usage data' },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-xl">
                        <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-white/50">{item.description}</div>
                        </div>
                        <label className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings[item.key]}
                                onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-dark-600 rounded-full peer peer-checked:bg-accent-indigo transition-colors">
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-6' : ''
                                    }`} />
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            <div className="pt-6 border-t border-glass-border space-y-4">
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                    <Key className="w-5 h-5" />
                    Change Password
                </button>
                <button className="btn-secondary w-full flex items-center justify-center gap-2">
                    <Download className="w-5 h-5" />
                    Download My Data
                </button>
                <button className="w-full py-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                    <Trash2 className="w-5 h-5" />
                    Delete Account
                </button>
            </div>
        </div>
    );

    const renderAppearanceSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-display font-semibold mb-4">Appearance</h3>
                <p className="text-white/60 text-sm mb-6">Customize how InterVueX looks.</p>
            </div>

            {/* Theme Selection */}
            <div>
                <label className="block text-sm font-medium mb-4">Theme</label>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handleSettingChange('theme', 'dark')}
                        className={`p-4 rounded-xl flex items-center gap-3 transition-all ${settings.theme === 'dark'
                            ? 'bg-accent-indigo/20 border-2 border-accent-indigo'
                            : 'glass-card border-2 border-transparent'
                            }`}
                    >
                        <Moon className="w-5 h-5" />
                        <span className="font-medium">Dark</span>
                    </button>
                    <button
                        onClick={() => handleSettingChange('theme', 'light')}
                        className={`p-4 rounded-xl flex items-center gap-3 transition-all ${settings.theme === 'light'
                            ? 'bg-accent-indigo/20 border-2 border-accent-indigo'
                            : 'glass-card border-2 border-transparent'
                            }`}
                    >
                        <Sun className="w-5 h-5" />
                        <span className="font-medium">Light</span>
                    </button>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { key: 'animations', label: 'Animations', description: 'Enable smooth animations and transitions' },
                    { key: 'compactMode', label: 'Compact Mode', description: 'Reduce spacing for more content' },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-xl">
                        <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-white/50">{item.description}</div>
                        </div>
                        <label className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings[item.key]}
                                onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-dark-600 rounded-full peer peer-checked:bg-accent-indigo transition-colors">
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-6' : ''
                                    }`} />
                            </div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderInterviewSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-display font-semibold mb-4">Interview Settings</h3>
                <p className="text-white/60 text-sm mb-6">Configure your interview experience.</p>
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Default Interview Duration</label>
                <select
                    value={settings.defaultDuration}
                    onChange={(e) => handleSettingChange('defaultDuration', e.target.value)}
                    className="input-glass"
                >
                    <option value="15">15 minutes (Quick)</option>
                    <option value="30">30 minutes (Standard)</option>
                    <option value="45">45 minutes (Full)</option>
                    <option value="60">60 minutes (Extended)</option>
                </select>
            </div>

            <div className="space-y-4">
                {[
                    { key: 'autoFullscreen', label: 'Auto Fullscreen', description: 'Automatically enter fullscreen during interviews' },
                    { key: 'proctoringEnabled', label: 'Proctoring', description: 'Enable proctoring features for realistic experience' },
                    { key: 'cameraRequired', label: 'Camera Required', description: 'Require camera to be on during interviews' },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-xl">
                        <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-white/50">{item.description}</div>
                        </div>
                        <label className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings[item.key]}
                                onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-dark-600 rounded-full peer peer-checked:bg-accent-indigo transition-colors">
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-6' : ''
                                    }`} />
                            </div>
                        </label>
                    </div>
                ))}
            </div>
        </div>
    );

    const renderAudioSection = () => (
        <div className="space-y-6">
            <div>
                <h3 className="text-lg font-display font-semibold mb-4">Audio & Video</h3>
                <p className="text-white/60 text-sm mb-6">Configure your microphone and camera settings.</p>
            </div>

            {/* Device Selection */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium mb-2">Camera</label>
                    <select className="input-glass">
                        <option>Default Camera</option>
                        <option>External Webcam</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-2">Microphone</label>
                    <select className="input-glass">
                        <option>Default Microphone</option>
                        <option>Headset Microphone</option>
                    </select>
                </div>
            </div>

            <div className="space-y-4">
                {[
                    { key: 'micTestBeforeInterview', label: 'Mic Test', description: 'Test microphone before each interview' },
                    { key: 'noiseSupression', label: 'Noise Suppression', description: 'Reduce background noise during recording' },
                ].map((item) => (
                    <div key={item.key} className="flex items-center justify-between p-4 glass-card rounded-xl">
                        <div>
                            <div className="font-medium">{item.label}</div>
                            <div className="text-sm text-white/50">{item.description}</div>
                        </div>
                        <label className="relative cursor-pointer">
                            <input
                                type="checkbox"
                                checked={settings[item.key]}
                                onChange={(e) => handleSettingChange(item.key, e.target.checked)}
                                className="sr-only peer"
                            />
                            <div className="w-12 h-6 bg-dark-600 rounded-full peer peer-checked:bg-accent-indigo transition-colors">
                                <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${settings[item.key] ? 'translate-x-6' : ''
                                    }`} />
                            </div>
                        </label>
                    </div>
                ))}
            </div>

            <button className="btn-secondary flex items-center gap-2">
                <Camera className="w-5 h-5" />
                Test Camera & Microphone
            </button>
        </div>
    );

    const renderActiveSection = () => {
        switch (activeSection) {
            case 'profile': return renderProfileSection();
            case 'notifications': return renderNotificationsSection();
            case 'privacy': return renderPrivacySection();
            case 'appearance': return renderAppearanceSection();
            case 'interview': return renderInterviewSection();
            case 'audio': return renderAudioSection();
            default: return renderProfileSection();
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-2xl font-display font-bold mb-2">Settings</h1>
                    <p className="text-white/60">Manage your account and preferences</p>
                </motion.div>

                <div className="grid md:grid-cols-4 gap-6">
                    {/* Sidebar */}
                    <div className="glass-card p-3 h-fit">
                        <nav className="space-y-1">
                            {settingsSections.map((section) => (
                                <button
                                    key={section.id}
                                    onClick={() => setActiveSection(section.id)}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all ${activeSection === section.id
                                        ? 'bg-gradient-to-r from-accent-indigo/20 to-transparent text-white'
                                        : 'text-white/60 hover:text-white hover:bg-glass-light'
                                        }`}
                                >
                                    <section.icon className={`w-5 h-5 ${activeSection === section.id ? 'text-accent-indigo' : ''}`} />
                                    <span className="text-sm font-medium">{section.name}</span>
                                </button>
                            ))}

                            <div className="divider my-3" />

                            <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-red-400 hover:bg-red-500/10 transition-all">
                                <LogOut className="w-5 h-5" />
                                <span className="text-sm font-medium">Sign Out</span>
                            </button>
                        </nav>
                    </div>

                    {/* Content */}
                    <div className="md:col-span-3 glass-card p-6">
                        <motion.div
                            key={activeSection}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.2 }}
                        >
                            {renderActiveSection()}
                        </motion.div>

                        {/* Save Button */}
                        <div className="mt-8 pt-6 border-t border-glass-border flex justify-end">
                            <button className="btn-primary flex items-center gap-2">
                                <Save className="w-5 h-5" />
                                <span>Save Changes</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
