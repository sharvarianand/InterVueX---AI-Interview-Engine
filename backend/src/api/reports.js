import { Router } from 'express';
import { ReportService } from '../services/reportService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const reportService = new ReportService();

// GET /api/reports/:sessionId - Get report for a session
router.get('/:sessionId', requireAuth, async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.auth.userId;

        const report = await reportService.getReport(sessionId);

        if (!report) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'Report not found'
            });
        }

        // Security check
        if (report.userId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to access this report'
            });
        }

        res.json({ report });
    } catch (error) {
        next(error);
    }
});

// POST /api/reports/generate - Generate report for completed session
router.post('/generate', requireAuth, async (req, res, next) => {
    try {
        const { sessionId } = req.body;
        const report = await reportService.generateReport(sessionId);

        res.status(201).json({
            success: true,
            report
        });
    } catch (error) {
        next(error);
    }
});

// GET /api/reports/user/:userId - Get all reports for a user
router.get('/user/:userId', requireAuth, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const activeUserId = req.auth.userId;

        if (userId !== activeUserId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only view your own reports'
            });
        }

        const { limit = 10, offset = 0 } = req.query;

        const reports = await reportService.getUserReports(userId, {
            limit: parseInt(limit),
            offset: parseInt(offset)
        });

        res.json({ reports });
    } catch (error) {
        next(error);
    }
});

// GET /api/reports/user/:userId/analytics - Get analytics summary
router.get('/user/:userId/analytics', requireAuth, async (req, res, next) => {
    try {
        const { userId } = req.params;
        const activeUserId = req.auth.userId;

        if (userId !== activeUserId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You can only view your own analytics'
            });
        }

        const { period = '30d' } = req.query;

        const analytics = await reportService.getUserAnalytics(userId, period);

        res.json({ analytics });
    } catch (error) {
        next(error);
    }
});

// GET /api/reports/:sessionId/export - Export report as PDF
router.get('/:sessionId/export', requireAuth, async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        const userId = req.auth.userId;
        const { format = 'pdf' } = req.query;

        const report = await reportService.getReport(sessionId);
        if (report && report.userId !== userId) {
            return res.status(403).json({
                error: 'Forbidden',
                message: 'You do not have permission to export this report'
            });
        }

        const exportData = await reportService.exportReport(sessionId, format);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="intervuex-report-${sessionId}.pdf"`);
        res.send(exportData);
    } catch (error) {
        next(error);
    }
});

export default router;
