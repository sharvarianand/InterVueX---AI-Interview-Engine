import { Router } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { InterviewService } from '../services/interviewService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const interviewService = new InterviewService();

// POST /api/interview/start - Start a new interview session
router.post('/start', requireAuth, async (req, res, next) => {
    try {
        const { type, role, techStack, experience, persona } = req.body;
        const userId = req.auth.userId;

        // Validate required fields
        if (!type || !role) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Interview type and role are required'
            });
        }

        const session = await interviewService.createSession({
            id: uuidv4(),
            userId: userId,
            type,
            role,
            techStack: techStack || [],
            experience: experience || 'mid',
            persona: persona || 'balanced',
            status: 'active',
            startedAt: new Date().toISOString(),
            questions: [],
            answers: [],
            currentQuestionIndex: 0
        });

        res.status(201).json({
            success: true,
            session
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/interview/:sessionId - Get session details
router.get('/:sessionId', requireAuth, async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.auth.userId;
        const session = await interviewService.getSession(sessionId);

        if (!session) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Interview session not found'
            });
        }

        // Security check: only the owner can see the session
        if (session.userId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to access this session'
            });
        }

        res.json({ session });
    } catch (error) {
        next(error);
    }
});

// POST /api/interview/:sessionId/answer - Submit an answer
router.post('/:sessionId/answer', requireAuth, async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.auth.userId;
        const { questionId, answer, timeSpent } = req.body;

        const session = await interviewService.getSession(sessionId);
        if (session && session.userId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to update this session'
            });
        }

        const result = await interviewService.submitAnswer(sessionId, {
            questionId,
            answer,
            timeSpent,
            submittedAt: new Date().toISOString()
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/interview/:sessionId/end - End interview session
router.post('/:sessionId/end', requireAuth, async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.auth.userId;

        const session = await interviewService.getSession(sessionId);
        if (session && session.userId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to update this session'
            });
        }

        const result = await interviewService.endSession(sessionId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/interview/user/:userId - Get user's interview history
router.get('/user/:userId', requireAuth, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const activeUserId = req.auth.userId;

        // Security check
        if (userId !== activeUserId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only view your own interview history'
            });
        }

        const { limit = 10, offset = 0 } = req.query;

        const sessions = await interviewService.getUserSessions(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({ sessions });
    } catch (error) {
        next(error);
    }
});

export default router;
