import { EvaluationEngine } from './evaluationEngine.js';
import { InterviewService } from './interviewService.js';

const evaluationEngine = new EvaluationEngine();
const interviewService = new InterviewService();

// In-memory report store
const reports = new Map();

/**
 * ReportService - Generates and manages interview reports
 */
export class ReportService {
    /**
     * Generate a report for a completed session
     */
    async generateReport(sessionId) {
        console.log('Generating report for session:', sessionId);

        const session = await interviewService.getSession(sessionId);
        if (!session) {
            console.error('Session not found:', sessionId);
            throw new Error('Session not found');
        }

        console.log('Session found:', {
            id: session.id,
            status: session.status,
            questionsCount: session.questions?.length || 0,
            answersCount: session.answers?.length || 0
        });

        if (session.status !== 'completed') {
            console.error('Session not completed:', session.status);
            throw new Error('Cannot generate report for incomplete session');
        }

        // Ensure we have questions and answers arrays
        const questions = session.questions || [];
        const answers = session.answers || [];

        let evaluation;
        try {
            // Evaluate the entire session
            evaluation = await evaluationEngine.evaluateSession({
                sessionId,
                questions,
                answers,
                context: {
                    role: session.role,
                    techStack: session.techStack,
                    experience: session.experience
                }
            });
            console.log('Evaluation completed:', { averageScore: evaluation.averageScore });
        } catch (evalError) {
            console.error('Evaluation failed, using fallback:', evalError.message);
            // Provide fallback evaluation
            evaluation = this.getFallbackEvaluation(questions, answers);
        }

        // Build the report
        const report = {
            id: `report_${sessionId}`,
            sessionId,
            userId: session.userId,
            type: session.type,
            role: session.role,
            techStack: session.techStack,

            // Session metrics
            duration: session.duration || '0:00',
            questionsAnswered: answers.length,
            totalQuestions: questions.length,

            // Scores
            overallScore: evaluation.averageScore || 50,
            skillBreakdown: evaluation.skillBreakdown || {},

            // Detailed evaluations
            questionEvaluations: evaluation.evaluations || [],

            // Insights
            strongAreas: evaluation.strongAreas || [],
            weakAreas: evaluation.weakAreas || [],
            missedConcepts: evaluation.missedConcepts || [],

            // Assessment
            ...(evaluation.overallAssessment || { score: 50, recommendation: 'Review pending', readinessLevel: 'medium' }),

            // Proctoring (if applicable)
            proctoring: session.proctoring || { violations: 0, status: 'clean' },

            // Timestamps
            interviewDate: session.startedAt,
            generatedAt: new Date().toISOString()
        };

        // Store the report
        reports.set(report.id, report);
        console.log('Report generated and stored:', report.id);

        return report;
    }

    /**
     * Get fallback evaluation when AI evaluation fails
     */
    getFallbackEvaluation(questions, answers) {
        const evaluations = questions.map((q, i) => ({
            questionId: q.id,
            scores: {
                correctness: 5,
                depth: 5,
                clarity: 5,
                practicalUnderstanding: 5,
                confidence: 5
            },
            overallScore: 5,
            feedback: 'Evaluation pending - please check back later',
            strongPoints: [],
            weakPoints: [],
            missedConcepts: []
        }));

        return {
            evaluations,
            averageScore: 50,
            skillBreakdown: {
                correctness: 50,
                depth: 50,
                clarity: 50,
                practicalUnderstanding: 50,
                confidence: 50
            },
            strongAreas: [],
            weakAreas: [],
            missedConcepts: [],
            overallAssessment: {
                score: 50,
                recommendation: 'Evaluation in progress. Results will be updated soon.',
                readinessLevel: 'medium'
            }
        };
    }

    /**
     * Get a report by session ID
     */
    async getReport(sessionId) {
        const reportId = `report_${sessionId}`;
        return reports.get(reportId) || null;
    }

    /**
     * Get all reports for a user
     */
    async getUserReports(userId, { limit = 10, offset = 0 }) {
        const userReports = [];

        for (const [id, report] of reports.entries()) {
            if (report.userId === userId) {
                userReports.push({
                    id: report.id,
                    type: report.type,
                    role: report.role,
                    overallScore: report.overallScore,
                    interviewDate: report.interviewDate,
                    duration: report.duration
                });
            }
        }

        // Sort by date descending
        userReports.sort((a, b) => new Date(b.interviewDate) - new Date(a.interviewDate));

        return userReports.slice(offset, offset + limit);
    }

    /**
     * Get user analytics summary
     */
    async getUserAnalytics(userId, period = '30d') {
        const userReports = [];

        for (const [id, report] of reports.entries()) {
            if (report.userId === userId) {
                userReports.push(report);
            }
        }

        if (userReports.length === 0) {
            return {
                totalInterviews: 0,
                averageScore: 0,
                improvement: 0,
                topSkills: [],
                weakSkills: [],
                trend: []
            };
        }

        // Calculate metrics
        const totalInterviews = userReports.length;
        const averageScore = Math.round(
            userReports.reduce((sum, r) => sum + r.overallScore, 0) / totalInterviews
        );

        // Calculate improvement (compare first half to second half)
        const sorted = [...userReports].sort((a, b) =>
            new Date(a.interviewDate) - new Date(b.interviewDate)
        );
        const midpoint = Math.floor(sorted.length / 2);
        const firstHalf = sorted.slice(0, midpoint);
        const secondHalf = sorted.slice(midpoint);

        const firstAvg = firstHalf.length > 0
            ? firstHalf.reduce((sum, r) => sum + r.overallScore, 0) / firstHalf.length
            : 0;
        const secondAvg = secondHalf.length > 0
            ? secondHalf.reduce((sum, r) => sum + r.overallScore, 0) / secondHalf.length
            : 0;
        const improvement = Math.round(secondAvg - firstAvg);

        // Aggregate skill scores
        const skillTotals = {};
        const skillCounts = {};

        userReports.forEach(report => {
            if (report.skillBreakdown) {
                Object.entries(report.skillBreakdown).forEach(([skill, score]) => {
                    skillTotals[skill] = (skillTotals[skill] || 0) + score;
                    skillCounts[skill] = (skillCounts[skill] || 0) + 1;
                });
            }
        });

        const skillAverages = Object.entries(skillTotals)
            .map(([skill, total]) => ({
                skill,
                score: Math.round(total / skillCounts[skill])
            }))
            .sort((a, b) => b.score - a.score);

        // Generate trend data
        const trend = sorted.slice(-10).map((r, i) => ({
            interview: i + 1,
            score: r.overallScore,
            date: r.interviewDate
        }));

        return {
            totalInterviews,
            averageScore,
            improvement,
            topSkills: skillAverages.slice(0, 3),
            weakSkills: skillAverages.slice(-3).reverse(),
            trend,
            practiceHours: Math.round(totalInterviews * 0.5 * 10) / 10, // Estimate
            bestScore: Math.max(...userReports.map(r => r.overallScore)),
            recentActivity: userReports.slice(0, 5).map(r => ({
                type: r.type,
                score: r.overallScore,
                date: r.interviewDate
            }))
        };
    }

    /**
     * Export report as PDF (placeholder)
     */
    async exportReport(sessionId, format = 'pdf') {
        const report = await this.getReport(sessionId);
        if (!report) throw new Error('Report not found');

        // In production, use a PDF library like pdfkit or puppeteer
        // For now, return a placeholder
        return Buffer.from(`Report for session ${sessionId}\n\nScore: ${report.overallScore}%`);
    }
}
