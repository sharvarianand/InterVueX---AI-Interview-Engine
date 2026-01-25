// API Service for InterVueX
const API_BASE_URL = 'http://localhost:8000/api/v1';

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
    // Start a new interview session
    start: async (config) => {
        return apiFetch('/interview/start', {
            method: 'POST',
            body: JSON.stringify({
                user_id: config.userId,
                mode: config.mode || 'interview',
                persona: config.persona || 'startup_cto',
                github_url: config.githubUrl || null,
                deployment_url: config.deploymentUrl || null,
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

    // Send video signal data
    sendVideoSignal: async (sessionId, signalData) => {
        return apiFetch(`/interview/${sessionId}/video-signal`, {
            method: 'POST',
            body: JSON.stringify(signalData),
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

    // Get all reports for current user
    getAll: async () => {
        // This would need authentication in production
        return apiFetch('/report/all');
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
