import { useState } from 'react';
import { motion } from 'framer-motion';
import {
    BookOpen,
    FileText,
    CheckCircle2,
    ChevronRight,
    Download,
    X,
    Code,
    Users,
    Briefcase,
    Lightbulb,
    Target,
    TrendingUp
} from 'lucide-react';

// Mock preparation materials for each interview type
const mockMaterials = {
    technical: {
        title: 'Technical Interview Preparation',
        icon: Code,
        sections: [
            {
                title: 'Core Programming Concepts',
                items: [
                    'Data Structures: Arrays, Linked Lists, Stacks, Queues, Trees, Graphs',
                    'Algorithms: Sorting, Searching, Dynamic Programming, Greedy Algorithms',
                    'Time & Space Complexity: Big O notation, optimization techniques',
                    'Object-Oriented Programming: Classes, Inheritance, Polymorphism, Encapsulation',
                    'Design Patterns: Singleton, Factory, Observer, MVC patterns'
                ]
            },
            {
                title: 'System Design Fundamentals',
                items: [
                    'Scalability: Horizontal vs Vertical scaling, load balancing',
                    'Database Design: SQL vs NoSQL, indexing, query optimization',
                    'Caching Strategies: Redis, Memcached, CDN implementation',
                    'API Design: RESTful principles, GraphQL, microservices architecture',
                    'Security: Authentication, authorization, encryption, HTTPS'
                ]
            },
            {
                title: 'Common Interview Questions',
                items: [
                    'Explain the difference between let, const, and var in JavaScript',
                    'What is the event loop and how does it work?',
                    'Describe the virtual DOM in React',
                    'How would you optimize a slow database query?',
                    'Explain the CAP theorem and its implications'
                ]
            },
            {
                title: 'Problem-Solving Framework',
                items: [
                    '1. Understand the problem clearly',
                    '2. Identify constraints and edge cases',
                    '3. Design approach before coding',
                    '4. Write clean, readable code',
                    '5. Test with examples and optimize'
                ]
            }
        ],
        tips: [
            'Practice coding problems daily on platforms like LeetCode or HackerRank',
            'Review your past projects and be ready to explain design decisions',
            'Understand the fundamentals deeply, not just memorization',
            'Practice explaining your thought process out loud',
            'Prepare questions to ask the interviewer about the role and team'
        ]
    },
    hr: {
        title: 'HR & Behavioral Interview Preparation',
        icon: Users,
        sections: [
            {
                title: 'STAR Method Framework',
                items: [
                    'Situation: Set the context and background',
                    'Task: Describe what you needed to accomplish',
                    'Action: Explain the specific actions you took',
                    'Result: Share the outcomes and what you learned'
                ]
            },
            {
                title: 'Common Behavioral Questions',
                items: [
                    'Tell me about a time you handled a difficult situation',
                    'Describe a project where you had to work under pressure',
                    'Give an example of when you showed leadership',
                    'How do you handle conflict in a team?',
                    'Tell me about a time you made a mistake and how you handled it'
                ]
            },
            {
                title: 'Communication Skills',
                items: [
                    'Maintain eye contact and confident posture',
                    'Speak clearly and at a moderate pace',
                    'Listen actively and ask clarifying questions',
                    'Use professional language and avoid filler words',
                    'Show enthusiasm and genuine interest'
                ]
            },
            {
                title: 'Key Soft Skills to Highlight',
                items: [
                    'Teamwork and Collaboration',
                    'Problem-solving and Critical Thinking',
                    'Adaptability and Flexibility',
                    'Time Management and Organization',
                    'Emotional Intelligence and Empathy'
                ]
            }
        ],
        tips: [
            'Prepare 5-7 stories using the STAR method',
            'Practice your responses out loud to improve delivery',
            'Research the company culture and values',
            'Prepare thoughtful questions about the role and team',
            'Be authentic and show your personality'
        ]
    },
    project: {
        title: 'Project Viva Preparation',
        icon: Briefcase,
        sections: [
            {
                title: 'Project Overview Preparation',
                items: [
                    'Clear project description and objectives',
                    'Problem statement and motivation',
                    'Target audience and use cases',
                    'Project timeline and milestones',
                    'Technologies and tools used'
                ]
            },
            {
                title: 'Technical Deep Dive',
                items: [
                    'Architecture and system design decisions',
                    'Database schema and data modeling',
                    'API design and endpoints',
                    'Security implementations',
                    'Performance optimizations and scalability'
                ]
            },
            {
                title: 'Challenges & Solutions',
                items: [
                    'Technical challenges faced and how you solved them',
                    'Trade-offs made in design decisions',
                    'Alternative approaches considered',
                    'Lessons learned during development',
                    'Future improvements and enhancements'
                ]
            },
            {
                title: 'Code Quality & Best Practices',
                items: [
                    'Code organization and structure',
                    'Testing strategies (unit, integration, e2e)',
                    'Version control and Git workflow',
                    'Documentation and code comments',
                    'Deployment and DevOps practices'
                ]
            }
        ],
        tips: [
            'Review your entire codebase and understand every component',
            'Be ready to explain why you chose specific technologies',
            'Prepare to discuss challenges and how you overcame them',
            'Have your GitHub repository ready and well-documented',
            'Practice explaining complex technical concepts simply'
        ]
    }
};

export default function QuickPreparation({ interviewType, onClose, onStartInterview }) {
    const [currentSection, setCurrentSection] = useState(0);
    const material = mockMaterials[interviewType] || mockMaterials.technical;
    const Icon = material.icon;

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-dark-900/95 backdrop-blur-xl z-50 overflow-y-auto"
        >
            <div className="min-h-screen p-6">
                <div className="max-w-5xl mx-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-4">
                            <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${
                                interviewType === 'technical' ? 'from-indigo-500 to-blue-500' :
                                interviewType === 'hr' ? 'from-pink-500 to-rose-500' :
                                'from-purple-500 to-violet-500'
                            } flex items-center justify-center`}>
                                <Icon className="w-8 h-8 text-white" />
                            </div>
                            <div>
                                <h1 className="text-3xl font-display font-bold">{material.title}</h1>
                                <p className="text-white/60">Review these materials before starting your interview</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-lg bg-dark-700 hover:bg-dark-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="grid md:grid-cols-3 gap-6 mb-8">
                        {/* Sidebar Navigation */}
                        <div className="md:col-span-1">
                            <div className="glass-card p-4 sticky top-6">
                                <h3 className="font-semibold mb-4 flex items-center gap-2">
                                    <BookOpen className="w-5 h-5 text-accent-indigo" />
                                    Sections
                                </h3>
                                <div className="space-y-2">
                                    {material.sections.map((section, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentSection(index)}
                                            className={`w-full text-left p-3 rounded-lg transition-all ${
                                                currentSection === index
                                                    ? 'bg-accent-indigo/20 text-accent-indigo border border-accent-indigo/30'
                                                    : 'bg-dark-700 hover:bg-dark-600 text-white/80'
                                            }`}
                                        >
                                            <div className="flex items-center justify-between">
                                                <span className="text-sm font-medium">{section.title}</span>
                                                {currentSection === index && (
                                                    <ChevronRight className="w-4 h-4" />
                                                )}
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Main Content */}
                        <div className="md:col-span-2 space-y-6">
                            {/* Current Section */}
                            <motion.div
                                key={currentSection}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass-card p-6"
                            >
                                <h2 className="text-2xl font-display font-bold mb-6 flex items-center gap-3">
                                    <FileText className="w-6 h-6 text-accent-indigo" />
                                    {material.sections[currentSection].title}
                                </h2>
                                <ul className="space-y-3">
                                    {material.sections[currentSection].items.map((item, index) => (
                                        <li key={index} className="flex items-start gap-3">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
                                            <span className="text-white/80 leading-relaxed">{item}</span>
                                        </li>
                                    ))}
                                </ul>
                            </motion.div>

                            {/* Tips Section */}
                            {currentSection === material.sections.length - 1 && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="glass-card p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border border-amber-500/20"
                                >
                                    <h3 className="text-xl font-display font-bold mb-4 flex items-center gap-2">
                                        <Lightbulb className="w-6 h-6 text-amber-400" />
                                        Pro Tips
                                    </h3>
                                    <ul className="space-y-3">
                                        {material.tips.map((tip, index) => (
                                            <li key={index} className="flex items-start gap-3">
                                                <Target className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                                                <span className="text-white/90 leading-relaxed">{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </motion.div>
                            )}

                            {/* Navigation */}
                            <div className="flex items-center justify-between">
                                <button
                                    onClick={() => setCurrentSection(Math.max(0, currentSection - 1))}
                                    disabled={currentSection === 0}
                                    className={`btn-secondary flex items-center gap-2 ${
                                        currentSection === 0 && 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    <ChevronRight className="w-4 h-4 rotate-180" />
                                    Previous
                                </button>
                                <div className="flex items-center gap-2">
                                    {material.sections.map((_, index) => (
                                        <div
                                            key={index}
                                            className={`w-2 h-2 rounded-full transition-all ${
                                                index === currentSection
                                                    ? 'bg-accent-indigo w-8'
                                                    : 'bg-dark-600'
                                            }`}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={() => setCurrentSection(Math.min(material.sections.length - 1, currentSection + 1))}
                                    disabled={currentSection === material.sections.length - 1}
                                    className={`btn-secondary flex items-center gap-2 ${
                                        currentSection === material.sections.length - 1 && 'opacity-50 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between glass-card p-6">
                        <button
                            onClick={() => {
                                // Download preparation material as text
                                const content = material.sections.map(s => 
                                    `${s.title}\n${s.items.map(i => `  • ${i}`).join('\n')}`
                                ).join('\n\n') + `\n\nPro Tips:\n${material.tips.map(t => `  • ${t}`).join('\n')}`;
                                
                                const blob = new Blob([content], { type: 'text/plain' });
                                const url = URL.createObjectURL(blob);
                                const a = document.createElement('a');
                                a.href = url;
                                a.download = `${material.title.replace(/\s+/g, '-')}-Preparation.txt`;
                                a.click();
                                URL.revokeObjectURL(url);
                            }}
                            className="btn-secondary flex items-center gap-2"
                        >
                            <Download className="w-5 h-5" />
                            Download Materials
                        </button>
                        <div className="flex items-center gap-4">
                            <button
                                onClick={onClose}
                                className="btn-secondary"
                            >
                                Back to Setup
                            </button>
                            <button
                                onClick={onStartInterview}
                                className="btn-primary flex items-center gap-2"
                            >
                                <TrendingUp className="w-5 h-5" />
                                Start Interview
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
