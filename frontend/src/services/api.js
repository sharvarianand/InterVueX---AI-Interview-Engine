/**
 * API Configuration
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'https://sharvarianand-intervuex-backend.hf.space/api';

// Token getter function - will be set by Clerk
let getTokenFn = null;

/**
 * Set the token getter function (should be called with Clerk's getToken)
 */
export function setTokenGetter(fn) {
    getTokenFn = fn;
}

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
        credentials: 'include', // Include cookies for Clerk session
        ...options,
    };

    // Add auth token if available (Clerk token)
    // Clerk middleware can use cookies, but we also send Bearer token for API routes
    if (getTokenFn) {
        try {
            const token = await getTokenFn();
            if (token) {
                config.headers['Authorization'] = `Bearer ${token}`;
            }
        } catch (error) {
            // Token getter failed - cookies should still work with clerkMiddleware
            // Don't throw, let the backend handle auth via cookies
        }
    }

    try {
        const response = await fetch(url, config);

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            const errorMessage = error.message || error.error?.message || `HTTP error! status: ${response.status}`;
            throw new Error(errorMessage);
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
 * CV API
 */
export const cvAPI = {
    upload: async (file) => {
        const formData = new FormData();
        formData.append('cv', file);

        const headers = {};

        // Add auth token if available
        if (getTokenFn) {
            try {
                const token = await getTokenFn();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn('Failed to get auth token:', error);
            }
        }

        return fetch(`${API_BASE_URL}/cv/upload`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: formData
        }).then(async (response) => {
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || error.error?.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },
};

/**
 * Project API
 */
export const projectAPI = {
    analyze: (data) =>
        apiFetch('/project/analyze', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
};

/**
 * Speech API
 */
export const speechAPI = {
    transcribe: async (audioBlob, language = 'en-US') => {
        const formData = new FormData();
        formData.append('audio', audioBlob, 'recording.webm');
        formData.append('language', language);

        const headers = {};

        // Add auth token if available
        if (getTokenFn) {
            try {
                const token = await getTokenFn();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn('Failed to get auth token:', error);
            }
        }

        return fetch(`${API_BASE_URL}/speech/transcribe`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: formData
        }).then(async (response) => {
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || error.error?.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },

    analyzeSpeakingStyle: async (transcript, audioBlob = null) => {
        const formData = new FormData();
        if (audioBlob) {
            formData.append('audio', audioBlob, 'recording.webm');
        }
        formData.append('transcript', transcript);

        const headers = {};

        // Add auth token if available
        if (getTokenFn) {
            try {
                const token = await getTokenFn();
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                }
            } catch (error) {
                console.warn('Failed to get auth token:', error);
            }
        }

        return fetch(`${API_BASE_URL}/speech/analyze`, {
            method: 'POST',
            headers,
            credentials: 'include',
            body: formData
        }).then(async (response) => {
            if (!response.ok) {
                const error = await response.json().catch(() => ({}));
                throw new Error(error.message || error.error?.message || `HTTP error! status: ${response.status}`);
            }
            return response.json();
        });
    },

    enhanceTTS: (text, options = {}) =>
        apiFetch('/speech/enhance-tts', {
            method: 'POST',
            body: JSON.stringify({ text, options }),
        }),
};

/**
 * MCQ API
 */
export const mcqAPI = {
    generate: (data) =>
        apiFetch('/mcq/generate', {
            method: 'POST',
            body: JSON.stringify(data),
        }),
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
    cv: cvAPI,
    project: projectAPI,
    speech: speechAPI,
    mcq: mcqAPI,
    healthCheck,
};
