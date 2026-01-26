import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Code,
    Users,
    Briefcase,
    Upload,
    ChevronRight,
    ChevronLeft,
    Camera,
    Mic,
    Monitor,
    CheckCircle2,
    AlertCircle,
    Sparkles,
    User,
    Zap,
    Shield
} from 'lucide-react';
import DashboardLayout from '../layouts/DashboardLayout';
import { useStore } from '../store/useStore';

const interviewConfigs = {
    technical: {
        title: 'Technical Interview',
        icon: Code,
        gradient: 'from-indigo-500 to-blue-500',
    },
    hr: {
        title: 'HR & Behavioral',
        icon: Users,
        gradient: 'from-pink-500 to-rose-500',
    },
    project: {
        title: 'Project Viva',
        icon: Briefcase,
        gradient: 'from-purple-500 to-violet-500',
    }
};

const roles = [
    'Software Engineer',
    'Frontend Developer',
    'Backend Developer',
    'Full Stack Developer',
    'Data Scientist',
    'DevOps Engineer',
    'Product Manager',
    'UI/UX Designer',
    'Mobile Developer',
    'ML Engineer'
];

const techStacks = [
    { name: 'JavaScript', category: 'frontend' },
    { name: 'React', category: 'frontend' },
    { name: 'Node.js', category: 'backend' },
    { name: 'Python', category: 'backend' },
    { name: 'Java', category: 'backend' },
    { name: 'TypeScript', category: 'frontend' },
    { name: 'Go', category: 'backend' },
    { name: 'SQL', category: 'database' },
    { name: 'MongoDB', category: 'database' },
    { name: 'AWS', category: 'cloud' },
    { name: 'Docker', category: 'devops' },
    { name: 'Kubernetes', category: 'devops' },
    { name: 'Machine Learning', category: 'ai' },
    { name: 'System Design', category: 'architecture' },
    { name: 'DSA', category: 'fundamentals' },
];

const personas = [
    {
        id: 'friendly',
        name: 'Friendly',
        description: 'Supportive and encouraging, provides hints when stuck',
        icon: '😊'
    },
    {
        id: 'balanced',
        name: 'Balanced',
        description: 'Professional and fair, simulates typical interview',
        icon: '👔'
    },
    {
        id: 'challenging',
        name: 'Challenging',
        description: 'Rigorous and demanding, pushes your limits',
        icon: '🔥'
    }
];

const experienceLevels = [
    { id: 'fresher', label: 'Fresher (0-1 years)' },
    { id: 'junior', label: 'Junior (1-3 years)' },
    { id: 'mid', label: 'Mid-level (3-5 years)' },
    { id: 'senior', label: 'Senior (5+ years)' },
];

export default function InterviewSetupPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const type = searchParams.get('type') || 'technical';
    const mode = searchParams.get('mode') || 'full';

    const { setupData, setSetupData, setInterviewStatus } = useStore();

    const [step, setStep] = useState(1);
    const [cameraReady, setCameraReady] = useState(false);
    const [micReady, setMicReady] = useState(false);
    const [selectedRole, setSelectedRole] = useState(setupData.role || '');
    const [selectedTechStack, setSelectedTechStack] = useState(setupData.techStack || []);
    const [selectedExperience, setSelectedExperience] = useState(setupData.experience || '');
    const [selectedPersona, setSelectedPersona] = useState(setupData.persona || 'balanced');
    const [resumeFile, setResumeFile] = useState(null);

    const config = interviewConfigs[type];
    const totalSteps = type === 'project' ? 5 : 4;

    const handleNext = () => {
        if (step < totalSteps) {
            setStep(step + 1);
        }
    };

    const handleBack = () => {
        if (step > 1) {
            setStep(step - 1);
        }
    };

    const handleTechStackToggle = (tech) => {
        if (selectedTechStack.includes(tech)) {
            setSelectedTechStack(selectedTechStack.filter(t => t !== tech));
        } else {
            setSelectedTechStack([...selectedTechStack, tech]);
        }
    };

    const handleStartInterview = () => {
        setSetupData({
            role: selectedRole,
            techStack: selectedTechStack,
            experience: selectedExperience,
            persona: selectedPersona,
            resume: resumeFile,
        });
        setInterviewStatus('live');
        navigate('/interview/live');
    };

    const canProceed = () => {
        switch (step) {
            case 1: return selectedRole !== '';
            case 2: return selectedTechStack.length > 0;
            case 3: return selectedExperience !== '' && selectedPersona !== '';
            case 4: return type === 'project' ? resumeFile !== null : (cameraReady && micReady);
            case 5: return cameraReady && micReady;
            default: return false;
        }
    };

    // Step renderers
    const renderStep1 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">Select Your Target Role</h2>
                <p className="text-white/60">Choose the role you're preparing for</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {roles.map((role) => (
                    <button
                        key={role}
                        onClick={() => setSelectedRole(role)}
                        className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 ${selectedRole === role
                                ? 'bg-gradient-to-br from-accent-indigo to-accent-purple text-white shadow-glow-sm'
                                : 'glass-card hover:bg-glass-medium'
                            }`}
                    >
                        {role}
                    </button>
                ))}
            </div>
        </motion.div>
    );

    const renderStep2 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">Select Tech Stack</h2>
                <p className="text-white/60">Choose technologies you want to be evaluated on</p>
            </div>

            <div className="flex flex-wrap gap-3">
                {techStacks.map((tech) => (
                    <button
                        key={tech.name}
                        onClick={() => handleTechStackToggle(tech.name)}
                        className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 flex items-center gap-2 ${selectedTechStack.includes(tech.name)
                                ? 'bg-gradient-to-br from-accent-indigo to-accent-purple text-white shadow-glow-sm'
                                : 'glass-card hover:bg-glass-medium'
                            }`}
                    >
                        {selectedTechStack.includes(tech.name) && <CheckCircle2 className="w-4 h-4" />}
                        {tech.name}
                    </button>
                ))}
            </div>

            {selectedTechStack.length > 0 && (
                <div className="p-4 rounded-xl bg-accent-indigo/10 border border-accent-indigo/20">
                    <p className="text-sm text-white/80">
                        <strong>Selected:</strong> {selectedTechStack.join(', ')}
                    </p>
                </div>
            )}
        </motion.div>
    );

    const renderStep3 = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
        >
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">Customize Your Interview</h2>
                <p className="text-white/60">Set difficulty and interviewer personality</p>
            </div>

            {/* Experience Level */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Experience Level</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {experienceLevels.map((level) => (
                        <button
                            key={level.id}
                            onClick={() => setSelectedExperience(level.id)}
                            className={`p-4 rounded-xl text-sm font-medium transition-all duration-300 ${selectedExperience === level.id
                                    ? 'bg-gradient-to-br from-accent-indigo to-accent-purple text-white shadow-glow-sm'
                                    : 'glass-card hover:bg-glass-medium'
                                }`}
                        >
                            {level.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Interviewer Persona */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold">Interviewer Persona</h3>
                <div className="grid md:grid-cols-3 gap-4">
                    {personas.map((persona) => (
                        <button
                            key={persona.id}
                            onClick={() => setSelectedPersona(persona.id)}
                            className={`p-6 rounded-xl text-left transition-all duration-300 ${selectedPersona === persona.id
                                    ? 'bg-gradient-to-br from-accent-indigo/20 to-accent-purple/20 border-2 border-accent-indigo shadow-glow-sm'
                                    : 'glass-card hover:bg-glass-medium border-2 border-transparent'
                                }`}
                        >
                            <div className="text-3xl mb-3">{persona.icon}</div>
                            <h4 className="font-semibold mb-1">{persona.name}</h4>
                            <p className="text-sm text-white/60">{persona.description}</p>
                        </button>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderStep4Project = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">Upload Project Details</h2>
                <p className="text-white/60">Upload your resume or project documentation</p>
            </div>

            <div className="glass-card p-8 border-2 border-dashed border-glass-border hover:border-accent-indigo/50 transition-colors">
                <div className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-full bg-accent-indigo/10 flex items-center justify-center mb-4">
                        <Upload className="w-8 h-8 text-accent-indigo" />
                    </div>
                    <h3 className="font-semibold mb-2">Drop your file here</h3>
                    <p className="text-sm text-white/60 mb-4">Supports PDF, DOCX (Max 5MB)</p>
                    <label className="btn-secondary cursor-pointer">
                        <input
                            type="file"
                            accept=".pdf,.docx"
                            className="hidden"
                            onChange={(e) => setResumeFile(e.target.files[0])}
                        />
                        Browse Files
                    </label>
                </div>
            </div>

            {resumeFile && (
                <div className="flex items-center gap-4 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                    <div className="flex-1">
                        <p className="font-medium">{resumeFile.name}</p>
                        <p className="text-sm text-white/60">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <button
                        onClick={() => setResumeFile(null)}
                        className="text-white/60 hover:text-white"
                    >
                        Remove
                    </button>
                </div>
            )}
        </motion.div>
    );

    const renderEnvironmentCheck = () => (
        <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
        >
            <div>
                <h2 className="text-2xl font-display font-bold mb-2">Environment Check</h2>
                <p className="text-white/60">Ensure your setup is ready for the interview</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
                {/* Camera Preview */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Camera className="w-5 h-5 text-accent-indigo" />
                            <span className="font-medium">Camera</span>
                        </div>
                        {cameraReady ? (
                            <span className="badge badge-success">Ready</span>
                        ) : (
                            <span className="badge badge-warning">Checking...</span>
                        )}
                    </div>
                    <div className="aspect-video rounded-xl bg-dark-700 flex items-center justify-center overflow-hidden">
                        <div className="text-center">
                            <User className="w-16 h-16 text-white/20 mx-auto mb-2" />
                            <p className="text-sm text-white/40">Camera preview</p>
                        </div>
                    </div>
                    <button
                        onClick={() => setCameraReady(true)}
                        className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-all ${cameraReady
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'btn-secondary'
                            }`}
                    >
                        {cameraReady ? '✓ Camera Working' : 'Test Camera'}
                    </button>
                </div>

                {/* Audio Check */}
                <div className="glass-card p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <Mic className="w-5 h-5 text-accent-purple" />
                            <span className="font-medium">Microphone</span>
                        </div>
                        {micReady ? (
                            <span className="badge badge-success">Ready</span>
                        ) : (
                            <span className="badge badge-warning">Checking...</span>
                        )}
                    </div>
                    <div className="aspect-video rounded-xl bg-dark-700 flex items-center justify-center">
                        <div className="flex gap-1">
                            {[...Array(5)].map((_, i) => (
                                <motion.div
                                    key={i}
                                    className="w-2 bg-accent-purple rounded-full"
                                    animate={{
                                        height: micReady ? [20, 40, 20] : 20,
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: micReady ? Infinity : 0,
                                        delay: i * 0.1,
                                    }}
                                />
                            ))}
                        </div>
                    </div>
                    <button
                        onClick={() => setMicReady(true)}
                        className={`mt-4 w-full py-2 rounded-lg text-sm font-medium transition-all ${micReady
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'btn-secondary'
                            }`}
                    >
                        {micReady ? '✓ Microphone Working' : 'Test Microphone'}
                    </button>
                </div>
            </div>

            {/* Additional Checks */}
            <div className="glass-card p-6">
                <h3 className="font-semibold mb-4">Before You Start</h3>
                <div className="space-y-3">
                    {[
                        { icon: Monitor, text: 'Fullscreen mode will be enabled during the interview' },
                        { icon: Shield, text: 'Single face detection is active for proctoring' },
                        { icon: Zap, text: 'Ensure stable internet connection for best experience' },
                    ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3 text-white/70">
                            <item.icon className="w-5 h-5 text-accent-indigo" />
                            <span className="text-sm">{item.text}</span>
                        </div>
                    ))}
                </div>
            </div>
        </motion.div>
    );

    const renderCurrentStep = () => {
        if (type === 'project') {
            switch (step) {
                case 1: return renderStep1();
                case 2: return renderStep2();
                case 3: return renderStep3();
                case 4: return renderStep4Project();
                case 5: return renderEnvironmentCheck();
                default: return null;
            }
        } else {
            switch (step) {
                case 1: return renderStep1();
                case 2: return renderStep2();
                case 3: return renderStep3();
                case 4: return renderEnvironmentCheck();
                default: return null;
            }
        }
    };

    return (
        <DashboardLayout>
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="glass-card p-6 mb-8"
                >
                    <div className="flex items-center gap-4">
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${config.gradient} flex items-center justify-center`}>
                            <config.icon className="w-7 h-7 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-display font-bold">{config.title} Setup</h1>
                            <p className="text-white/60 text-sm">
                                {mode === 'quick' ? 'Quick Practice Session' : 'Full Interview Experience'}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Progress Steps */}
                <div className="mb-8">
                    <div className="flex items-center justify-between mb-4">
                        {[...Array(totalSteps)].map((_, i) => (
                            <div key={i} className="flex items-center">
                                <div
                                    className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${step > i + 1
                                            ? 'bg-emerald-500 text-white'
                                            : step === i + 1
                                                ? 'bg-gradient-to-br from-accent-indigo to-accent-purple text-white'
                                                : 'bg-dark-600 text-white/40'
                                        }`}
                                >
                                    {step > i + 1 ? <CheckCircle2 className="w-5 h-5" /> : i + 1}
                                </div>
                                {i < totalSteps - 1 && (
                                    <div className={`w-full h-1 mx-2 rounded transition-all ${step > i + 1 ? 'bg-emerald-500' : 'bg-dark-600'
                                        }`} style={{ width: '80px' }} />
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Step Content */}
                <div className="glass-card p-8 mb-8">
                    <AnimatePresence mode="wait">
                        {renderCurrentStep()}
                    </AnimatePresence>
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={handleBack}
                        disabled={step === 1}
                        className={`btn-secondary flex items-center gap-2 ${step === 1 && 'opacity-50 cursor-not-allowed'}`}
                    >
                        <ChevronLeft className="w-5 h-5" />
                        Back
                    </button>

                    {step === totalSteps ? (
                        <button
                            onClick={handleStartInterview}
                            disabled={!canProceed()}
                            className={`btn-primary flex items-center gap-2 ${!canProceed() && 'opacity-50 cursor-not-allowed'}`}
                        >
                            <Sparkles className="w-5 h-5" />
                            <span>Start Interview</span>
                        </button>
                    ) : (
                        <button
                            onClick={handleNext}
                            disabled={!canProceed()}
                            className={`btn-primary flex items-center gap-2 ${!canProceed() && 'opacity-50 cursor-not-allowed'}`}
                        >
                            <span>Continue</span>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    )}
                </div>
            </div>
        </DashboardLayout>
    );
}
