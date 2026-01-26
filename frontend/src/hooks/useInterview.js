import { useCallback, useState } from 'react';
import { interviewAPI, questionsAPI, evaluationAPI, reportsAPI, projectAPI } from '../services/api';
import { useStore, useMemoryStore } from '../store/useStore';

/**
 * Hook for managing interview sessions
 */
export function useInterview() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const {
        currentSession,
        setCurrentSession,
        setInterviewStatus,
        addAnswer,
        setupData
    } = useStore();
    const { addToHistory } = useMemoryStore();

    /**
     * Start a new interview session
     */
    const startInterview = useCallback(async (config = {}) => {
        setLoading(true);
        setError(null);

        try {
            const response = await interviewAPI.start({
                type: config.type || setupData.type || 'technical',
                role: config.role || setupData.role,
                techStack: config.techStack || setupData.techStack,
                experience: config.experience || setupData.experience,
                persona: config.persona || setupData.persona,
                cvData: config.cvData || setupData.cvData || null,
                projectData: config.projectData || setupData.projectData || null,
                userId: 'user_123', // TODO: Get from auth
            });

            setCurrentSession(response.session);
            setInterviewStatus('live');

            return response.session;
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    }, [setupData, setCurrentSession, setInterviewStatus]);

    /**
     * Get next question
     */
    const getNextQuestion = useCallback(async (sessionOverride = null) => {
        const session = sessionOverride || currentSession;
        if (!session) {
            console.error('No session available for question generation');
            return null;
        }

        setLoading(true);
        try {
            console.log('Requesting question with session data:', {
                sessionId: session.id,
                type: session.type,
                role: session.role,
                techStack: session.techStack,
                experience: session.experience
            });

            const response = await questionsAPI.generate({
                sessionId: session.id,
                type: session.type || 'technical',
                role: session.role || 'Software Engineer',
                techStack: session.techStack || [],
                experience: session.experience || 'mid',
                previousAnswers: session.answers || [],
                cvData: session.cvData || setupData?.cvData || null,
                projectData: session.projectData || setupData?.projectData || null,
            });

            console.log('Question API response:', response);

            if (!response || !response.question) {
                console.error('Invalid response from question API:', response);
                return null;
            }

            return response.question;
        } catch (err) {
            console.error('Error getting next question:', err);
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentSession, setupData]);

    /**
     * Submit an answer and get evaluation
     */
    const submitAnswer = useCallback(async (questionId, answer, timeSpent) => {
        if (!currentSession) return null;

        setLoading(true);
        try {
            // Submit answer to session
            await interviewAPI.submitAnswer(currentSession.id, {
                questionId,
                answer,
                timeSpent,
            });

            // Get evaluation
            const evaluation = await evaluationAPI.evaluateAnswer({
                question: { id: questionId },
                answer,
                context: {
                    role: currentSession.role,
                    techStack: currentSession.techStack,
                    experience: currentSession.experience,
                },
                type: currentSession.type,
            });

            // Update local state
            addAnswer({
                questionId,
                answer,
                timeSpent,
                evaluation: evaluation.evaluation,
            });

            // Update memory
            addToHistory({ role: 'user', content: answer, questionId });

            return evaluation.evaluation;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentSession, addAnswer, addToHistory]);

    /**
     * End interview session
     */
    const endInterview = useCallback(async () => {
        if (!currentSession) return null;

        setLoading(true);
        try {
            const result = await interviewAPI.endSession(currentSession.id);
            setInterviewStatus('completed');

            // Generate report
            const report = await reportsAPI.generateReport(currentSession.id);

            return { session: result, report: report.report };
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, [currentSession, setInterviewStatus]);

    return {
        loading,
        error,
        currentSession,
        startInterview,
        getNextQuestion,
        submitAnswer,
        endInterview,
    };
}

/**
 * Hook for fetching reports
 */
export function useReports() {
    const [reports, setReports] = useState([]);
    const [currentReport, setCurrentReport] = useState(null);
    const [analytics, setAnalytics] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchUserReports = useCallback(async (userId = 'user_123', params = {}) => {
        setLoading(true);
        try {
            const response = await reportsAPI.getUserReports(userId, params);
            setReports(response.reports);
            return response.reports;
        } catch (err) {
            setError(err.message);
            return [];
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchReport = useCallback(async (sessionId) => {
        setLoading(true);
        try {
            const response = await reportsAPI.getReport(sessionId);
            setCurrentReport(response.report);
            return response.report;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const fetchAnalytics = useCallback(async (userId = 'user_123', period = '30d') => {
        setLoading(true);
        try {
            const response = await reportsAPI.getUserAnalytics(userId, period);
            setAnalytics(response.analytics);
            return response.analytics;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        reports,
        currentReport,
        analytics,
        loading,
        error,
        fetchUserReports,
        fetchReport,
        fetchAnalytics,
    };
}

/**
 * Hook for tech stack evaluation
 */
export function useTechStackEval() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const evaluateAnswer = useCallback(async (question, answer, techStack) => {
        setLoading(true);
        try {
            const response = await evaluationAPI.evaluateAnswer({
                question,
                answer,
                context: { techStack: [techStack] },
                type: 'techstack',
            });
            return response.evaluation;
        } catch (err) {
            setError(err.message);
            return null;
        } finally {
            setLoading(false);
        }
    }, []);

    const getTopics = useCallback(async (techStack) => {
        try {
            const response = await questionsAPI.getTopics(techStack);
            return response.topics;
        } catch (err) {
            return [];
        }
    }, []);

    return {
        loading,
        error,
        evaluateAnswer,
        getTopics,
    };
}
