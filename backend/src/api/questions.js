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
            performanceMemory,
            cvData,
            projectData
        } = req.body;

        // Validate required fields
        if (!type) {
            return res.status(400).json({
                success: false,
                error: 'Interview type is required'
            });
        }

        // Ensure techStack is an array
        const techStackArray = Array.isArray(techStack) ? techStack : (techStack ? [techStack] : []);

        console.log('Generating question with:', {
            type,
            role: role || 'Not specified',
            techStack: techStackArray,
            experience: experience || 'Not specified',
            hasCvData: !!cvData,
            hasProjectData: !!projectData
        });

        const question = await questionEngine.generateQuestion({
            type: type || 'technical',
            role: role || 'Software Engineer',
            techStack: techStackArray,
            experience: experience || 'mid',
            previousAnswers: previousAnswers || [],
            memory: performanceMemory || {},
            cvData: cvData || null,
            projectData: projectData || null
        });

        if (!question) {
            console.error('Question generation returned null');
            return res.status(500).json({
                success: false,
                error: 'Failed to generate question'
            });
        }

        console.log('Question generated successfully:', {
            id: question.id,
            topic: question.topic,
            hasText: !!question.text
        });

        res.json({
            success: true,
            question
        });
    } catch (error) {
        console.error('Error in question generation:', error);
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
