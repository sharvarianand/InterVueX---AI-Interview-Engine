import { Router } from 'express';
import { EvaluationEngine } from '../services/evaluationEngine.js';

const router = Router();
const evaluationEngine = new EvaluationEngine();

// POST /api/evaluation/answer - Evaluate a single answer
router.post('/answer', async (req, res, next) => {
    try {
        const {
            question,
            answer,
            context, // role, techStack, experience
            type // technical, hr, project
        } = req.body;

        const evaluation = await evaluationEngine.evaluateAnswer({
            question,
            answer,
            context,
            type
        });

        res.json({
            success: true,
            evaluation
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/evaluation/session - Evaluate entire session
router.post('/session', async (req, res, next) => {
    try {
        const { sessionId, questions, answers, context } = req.body;

        const sessionEvaluation = await evaluationEngine.evaluateSession({
            sessionId,
            questions,
            answers,
            context
        });

        res.json({
            success: true,
            ...sessionEvaluation
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/evaluation/communication - Evaluate communication quality
router.post('/communication', async (req, res, next) => {
    try {
        const { answers } = req.body;

        const communicationScore = await evaluationEngine.evaluateCommunication(answers);

        res.json({
            success: true,
            score: communicationScore
        });
    } catch (error) {
        next(error);
    }
});

export default router;
