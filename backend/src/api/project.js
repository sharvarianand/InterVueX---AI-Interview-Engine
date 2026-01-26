import { Router } from 'express';
import { ProjectAnalysisService } from '../services/projectAnalysisService.js';

const router = Router();
const projectService = new ProjectAnalysisService();

// POST /api/project/analyze - Analyze GitHub repository and deployed project
router.post('/analyze', async (req, res, next) => {
    try {
        const { githubRepo, liveLink } = req.body;

        const analysis = {
            github: null,
            deployed: null
        };

        if (githubRepo) {
            analysis.github = await projectService.analyzeGitHubRepo(githubRepo);
        }

        if (liveLink) {
            analysis.deployed = await projectService.analyzeDeployedProject(liveLink);
        }

        res.json({
            success: true,
            analysis
        });
    } catch (error) {
        next(error);
    }
});

export default router;
