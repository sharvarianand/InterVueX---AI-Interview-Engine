import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Main application store
export const useStore = create(
    persist(
        (set, get) => ({
            // User state
            user: null,
            setUser: (user) => set({ user }),

            // Interview state
            currentInterview: null,
            currentSession: null, // Active interview session from API
            setCurrentSession: (session) => set({ currentSession: session }),
            interviewType: null, // 'technical', 'hr', 'project', 'techstack'
            interviewStatus: 'idle', // 'idle', 'setup', 'live', 'completed'

            // Interview setup
            setupData: {
                role: '',
                techStack: [],
                experience: '',
                resume: null,
                cvData: null,
                persona: 'balanced', // 'friendly', 'balanced', 'challenging'
            },

            setInterviewType: (type) => set({ interviewType: type }),
            setInterviewStatus: (status) => set({ interviewStatus: status }),
            setSetupData: (data) => set({ setupData: { ...get().setupData, ...data } }),
            resetSetup: () => set({
                setupData: {
                    role: '',
                    techStack: [],
                    experience: '',
                    resume: null,
                    cvData: null,
                    persona: 'balanced',
                },
                interviewType: null,
                interviewStatus: 'idle',
            }),

            // Interview session
            currentQuestion: null,
            questionIndex: 0,
            answers: [],
            timeRemaining: 180, // seconds per question

            setCurrentQuestion: (question) => set({ currentQuestion: question }),
            nextQuestion: () => set((state) => ({ questionIndex: state.questionIndex + 1 })),
            addAnswer: (answer) => set((state) => ({
                answers: [...state.answers, answer]
            })),
            setTimeRemaining: (time) => set({ timeRemaining: time }),

            // Proctoring state
            proctoring: {
                cameraActive: false,
                faceDetected: false,
                violations: [],
                fullscreen: false,
            },

            setProctoringState: (data) => set({
                proctoring: { ...get().proctoring, ...data }
            }),
            addViolation: (violation) => set((state) => ({
                proctoring: {
                    ...state.proctoring,
                    violations: [...state.proctoring.violations, { ...violation, timestamp: Date.now() }]
                }
            })),

            // Reports
            reports: [],
            addReport: (report) => set((state) => ({
                reports: [...state.reports, report]
            })),

            // Progress metrics
            progress: {
                totalInterviews: 0,
                averageScore: 0,
                skillsImproved: [],
                weakAreas: [],
            },
            updateProgress: (data) => set({
                progress: { ...get().progress, ...data }
            }),

            // UI state
            sidebarOpen: true,
            toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),

            // Theme
            theme: 'dark',
        }),
        {
            name: 'intervuex-storage',
            partialize: (state) => ({
                user: state.user,
                reports: state.reports,
                progress: state.progress,
            }),
        }
    )
);

// Interview memory store (for AI context)
export const useMemoryStore = create((set, get) => ({
    // Conversation history
    conversationHistory: [],
    addToHistory: (message) => set((state) => ({
        conversationHistory: [...state.conversationHistory, message]
    })),
    clearHistory: () => set({ conversationHistory: [] }),

    // User performance memory
    performanceMemory: {
        strongTopics: [],
        weakTopics: [],
        answeredQuestions: [],
        mistakes: [],
    },

    updatePerformance: (data) => set({
        performanceMemory: { ...get().performanceMemory, ...data }
    }),

    addStrongTopic: (topic) => set((state) => ({
        performanceMemory: {
            ...state.performanceMemory,
            strongTopics: [...new Set([...state.performanceMemory.strongTopics, topic])]
        }
    })),

    addWeakTopic: (topic) => set((state) => ({
        performanceMemory: {
            ...state.performanceMemory,
            weakTopics: [...new Set([...state.performanceMemory.weakTopics, topic])]
        }
    })),

    resetMemory: () => set({
        conversationHistory: [],
        performanceMemory: {
            strongTopics: [],
            weakTopics: [],
            answeredQuestions: [],
            mistakes: [],
        }
    }),
}));

export default useStore;
