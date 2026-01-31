/**
 * InterviewService - Manages interview sessions
 */

// In-memory store (replace with Supabase in production)
const sessions = new Map();

export class InterviewService {
    /**
     * Create a new interview session
     */
    async createSession(sessionData) {
        const session = {
            ...sessionData,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        sessions.set(session.id, session);
        return session;
    }

    /**
     * Get session by ID
     */
    async getSession(sessionId) {
        return sessions.get(sessionId) || null;
    }

    /**
     * Update session
     */
    async updateSession(sessionId, updates) {
        const session = sessions.get(sessionId);
        if (!session) return null;

        const updated = {
            ...session,
            ...updates,
            updatedAt: new Date().toISOString()
        };

        sessions.set(sessionId, updated);
        return updated;
    }

    /**
     * Submit an answer to the session
     */
    async submitAnswer(sessionId, answerData) {
        const session = await this.getSession(sessionId);
        if (!session) throw new Error('Session not found');

        session.answers.push(answerData);
        session.currentQuestionIndex++;
        session.updatedAt = new Date().toISOString();

        sessions.set(sessionId, session);

        return {
            answerRecorded: true,
            currentQuestionIndex: session.currentQuestionIndex,
            progress: session.answers.length / (session.questions.length || 1)
        };
    }

    /**
     * Add a question to the session
     */
    async addQuestion(sessionId, question) {
        const session = await this.getSession(sessionId);
        if (!session) throw new Error('Session not found');

        session.questions.push(question);
        sessions.set(sessionId, session);

        return question;
    }

    /**
     * End interview session
     */
    async endSession(sessionId) {
        const session = await this.getSession(sessionId);
        if (!session) throw new Error('Session not found');

        session.status = 'completed';
        session.endedAt = new Date().toISOString();
        session.duration = this.calculateDuration(session.startedAt, session.endedAt);

        sessions.set(sessionId, session);

        return {
            sessionId,
            status: 'completed',
            duration: session.duration,
            questionsAnswered: session.answers.length,
            totalQuestions: session.questions.length
        };
    }

    /**
     * Get user's interview sessions
     */
    async getUserSessions(userId, { limit = 10, offset = 0 }) {
        const userSessions = [];

        for (const [id, session] of sessions.entries()) {
            if (session.userId === userId) {
                userSessions.push(session);
            }
        }

        // Sort by date descending
        userSessions.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

        return userSessions.slice(offset, offset + limit);
    }

    /**
     * Calculate duration between two timestamps
     */
    calculateDuration(start, end) {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate - startDate;
        const diffMins = Math.floor(diffMs / 60000);
        const diffSecs = Math.floor((diffMs % 60000) / 1000);
        return `${diffMins}:${diffSecs.toString().padStart(2, '0')}`;
    }
}
