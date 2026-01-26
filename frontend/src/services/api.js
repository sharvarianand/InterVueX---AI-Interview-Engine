/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

/**
 * Base API fetch wrapper with error handling
 */
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const config = {
        headers: {
            'Content-Type': 'application/json',
            ...options.headers,
        },
        ...options,
    };

    // Add auth token if available
    const token = localStorage.getItem('auth_token');
    if (token) {
        config.headers['Authorization'] = `Bearer ${token}`;
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.message || `HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API Error [${endpoint}]:`, error);
        throw error;
    }
}

/**
 * Authentication API
 */
export const authAPI = {
    verify: (token) =>
        apiFetch('/auth/verify', {
            method: 'POST',
            body: JSON.stringify({ token })
        }),

    getUser: () =>
        apiFetch('/auth/user'),
};

/**
 * Interview API
 */
export const interviewAPI = {
    start: (data) =>
        apiFetch('/interview/start', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getSession: (sessionId) =>
        apiFetch(`/interview/${sessionId}`),

    submitAnswer: (sessionId, data) =>
        apiFetch(`/interview/${sessionId}/answer`, {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    endSession: (sessionId) =>
        apiFetch(`/interview/${sessionId}/end`, {
            method: 'POST',
        }),

    getUserHistory: (userId, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/interview/user/${userId}${query ? `?${query}` : ''}`);
    },
};

/**
 * Questions API
 */
export const questionsAPI = {
    generate: (data) =>
        apiFetch('/questions/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    generateFollowUp: (data) =>
        apiFetch('/questions/follow-up', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    getTopics: (techStack) =>
        apiFetch(`/questions/topics/${techStack}`),
};

/**
 * Evaluation API
 */
export const evaluationAPI = {
    evaluateAnswer: (data) =>
        apiFetch('/evaluation/answer', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    evaluateSession: (data) =>
        apiFetch('/evaluation/session', {
            method: 'POST',
            body: JSON.stringify(data),
        }),

    evaluateCommunication: (data) =>
        apiFetch('/evaluation/communication', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

/**
 * Reports API
 */
export const reportsAPI = {
    getReport: (sessionId) =>
        apiFetch(`/reports/${sessionId}`),

    generateReport: (sessionId) =>
        apiFetch('/reports/generate', {
            method: 'POST',
            body: JSON.stringify({ sessionId }),
        }),

    getUserReports: (userId, params = {}) => {
        const query = new URLSearchParams(params).toString();
        return apiFetch(`/reports/user/${userId}${query ? `?${query}` : ''}`);
    },

    getUserAnalytics: (userId, period = '30d') =>
        apiFetch(`/reports/user/${userId}/analytics?period=${period}`),

    exportReport: (sessionId, format = 'pdf') =>
        `${API_BASE_URL}/reports/${sessionId}/export?format=${format}`,
};

/**
 * Health check
 */
export const healthCheck = () =>
    fetch(`${API_BASE_URL.replace('/api', '')}/health`).then(r => r.json());

export default {
    auth: authAPI,
    interview: interviewAPI,
    questions: questionsAPI,
    evaluation: evaluationAPI,
    reports: reportsAPI,
    healthCheck,
};
