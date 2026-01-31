import { Router } from 'express';
import { MCQService } from '../services/mcqService.js';

const router = Router();
const mcqService = new MCQService();

// POST /api/mcq/generate - Generate MCQs for a tech stack
router.post('/generate', async (req, res, next) => {
    try {
        const { techStack, difficulty, count } = req.body;

        if (!techStack) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Tech stack is required'
            });
        }

        const questions = await mcqService.generateMCQs(
            techStack,
            difficulty || 'medium',
            count || 10
        );

        res.json({
            success: true,
            questions,
            count: questions.length
        });
    } catch (error) {
        next(error);
    }
});

export default router;
