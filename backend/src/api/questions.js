import { Router } from 'express';
import { QuestionEngine } from '../services/questionEngine.js';

const router = Router();
const questionEngine = new QuestionEngine();

// POST /api/questions/generate - Generate next question
router.post('/generate', async (req, res, next) => {
    try {
        const {
            sessionId,
            type,
            role,
            techStack,
            experience,
            previousAnswers,
            performanceMemory
        } = req.body;

        const question = await questionEngine.generateQuestion({
            type,
            role,
            techStack,
            experience,
            previousAnswers: previousAnswers || [],
            memory: performanceMemory || {}
        });

        res.json({
            success: true,
            question
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/questions/follow-up - Generate follow-up question
router.post('/follow-up', async (req, res, next) => {
    try {
        const { previousQuestion, previousAnswer, evaluationScore } = req.body;

        const followUp = await questionEngine.generateFollowUp({
            question: previousQuestion,
            answer: previousAnswer,
            score: evaluationScore
        });

        res.json({
            success: true,
            question: followUp
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/questions/topics/:techStack - Get topic list for tech stack
router.get('/topics/:techStack', async (req, res, next) => {
    try {
        const { techStack } = req.params;
        const topics = await questionEngine.getTopics(techStack);

        res.json({ topics });
    } catch (error) {
        next(error);
    }
});

export default router;
