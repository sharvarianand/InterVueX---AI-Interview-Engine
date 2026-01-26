// API Service for InterVueX
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';

// Helper for API calls
async function apiFetch(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;

    const defaultOptions = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    try {
        const response = await fetch(url, { ...defaultOptions, ...options });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || `API Error: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error(`API call failed: ${endpoint}`, error);
        throw error;
    }
}

// Interview API
export const interviewAPI = {
    // Upload CV/Resume for personalization
    uploadCV: async (file) => {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch(`${API_BASE_URL}/interview/upload-cv`, {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            const error = await response.json().catch(() => ({}));
            throw new Error(error.detail || 'Failed to upload CV');
        }

        return response.json();
    },

    // Start a new interview session
    start: async (config) => {
        return apiFetch('/interview/start', {
            method: 'POST',
            body: JSON.stringify({
                user_id: config.userId,
                mode: config.mode || 'interview',
                persona: config.persona || 'startup_cto',
                cv_id: config.cvId || null,
            }),
        });
    },

    // Submit an answer
    submitAnswer: async (sessionId, answer) => {
        return apiFetch(`/interview/${sessionId}/answer`, {
            method: 'POST',
            body: JSON.stringify({ answer }),
        });
    },

    // Get current question
    getQuestion: async (sessionId) => {
        return apiFetch(`/interview/${sessionId}/question`);
    },

    // Get session status
    getStatus: async (sessionId) => {
        return apiFetch(`/interview/${sessionId}/status`);
    },

    // Send video signal data
    sendVideoSignals: async (sessionId, signals) => {
        return apiFetch(`/interview/${sessionId}/video-signals`, {
            method: 'POST',
            body: JSON.stringify({ signals }),
        });
    },

    // End interview session
    end: async (sessionId) => {
        return apiFetch(`/interview/${sessionId}/end`, {
            method: 'POST',
        });
    },
};

// Report API
export const reportAPI = {
    // Get a specific report
    get: async (reportId) => {
        return apiFetch(`/report/${reportId}`);
    },

    // Get all reports for a specific user
    getAll: async (userId) => {
        return apiFetch(`/report/user/${userId}`);
    },

};

// Health check
export const healthCheck = async () => {
    try {
        const response = await fetch('http://localhost:8000/');
        return response.ok;
    } catch {
        return false;
    }
};

export default {
    interview: interviewAPI,
    report: reportAPI,
    healthCheck,
};
