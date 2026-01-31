import { AIService } from './aiService.js';
import { extractJSON } from '../utils/aiUtils.js';

const aiService = new AIService();

/**
 * EvaluationEngine - Evaluates interview answers
 * 
 * Scoring Dimensions:
 * - Correctness (technical accuracy)
 * - Depth (level of understanding)
 * - Clarity (communication quality)
 * - Practical Understanding (real-world application)
 * - Confidence (certainty in answer)
 */
export class EvaluationEngine {
    /**
     * Evaluate a single answer
     */
    async evaluateAnswer({ question, answer, context, type }) {
        const systemPrompt = this.buildEvaluationPrompt(type);

        const userPrompt = `
Question: "${question.text}"
Expected Points: ${question.expectedPoints?.join(', ') || 'N/A'}
Topic: ${question.topic}
Difficulty: ${question.difficulty}

Candidate's Answer:
"${answer}"

Context:
- Role: ${context?.role || 'Software Engineer'}
- Experience: ${context?.experience || 'mid'}

Evaluate this answer comprehensively.
`;

        try {
            const response = await aiService.generate({
                systemPrompt,
                userPrompt,
                responseFormat: 'json'
            });

            const evaluation = extractJSON(response);
            if (!evaluation) throw new Error('Failed to parse AI evaluation response');


            return {
                questionId: question.id,
                scores: {
                    correctness: evaluation.correctness || 5,
                    depth: evaluation.depth || 5,
                    clarity: evaluation.clarity || 5,
                    practicalUnderstanding: evaluation.practicalUnderstanding || 5,
                    confidence: evaluation.confidence || 5
                },
                overallScore: evaluation.overallScore || this.calculateOverallScore(evaluation),
                feedback: evaluation.feedback || '',
                strongPoints: evaluation.strongPoints || [],
                weakPoints: evaluation.weakPoints || [],
                missedConcepts: evaluation.missedConcepts || [],
                followUpSuggestion: evaluation.followUpSuggestion || null
            };
        } catch (error) {
            console.error('Evaluation failed:', error);
            return this.getDefaultEvaluation(question.id);
        }
    }

    /**
     * Evaluate an entire interview session
     */
    async evaluateSession({ sessionId, questions, answers, context }) {
        // Evaluate each answer
        const evaluations = [];

        for (let i = 0; i < questions.length; i++) {
            const question = questions[i];
            const answer = answers[i]?.answer || '';

            const evaluation = await this.evaluateAnswer({
                question,
                answer,
                context,
                type: question.type
            });

            evaluations.push(evaluation);
        }

        // Aggregate results
        const aggregated = this.aggregateEvaluations(evaluations);

        // Generate overall assessment
        const overallAssessment = await this.generateOverallAssessment({
            evaluations,
            context,
            questions
        });

        return {
            sessionId,
            evaluations,
            ...aggregated,
            ...overallAssessment,
            completedAt: new Date().toISOString()
        };
    }

    /**
     * Build evaluation prompt based on interview type
     */
    buildEvaluationPrompt(type) {
        const base = `You are an expert interviewer evaluating candidate responses.

Score each dimension from 0-10:
- correctness: Technical accuracy of the answer
- depth: Level of understanding demonstrated
- clarity: How clearly the answer was communicated
- practicalUnderstanding: Real-world application knowledge
- confidence: How confident the candidate seemed

Respond in JSON format:
{
  "correctness": 0-10,
  "depth": 0-10,
  "clarity": 0-10,
  "practicalUnderstanding": 0-10,
  "confidence": 0-10,
  "overallScore": 0-10,
  "feedback": "Constructive feedback for the candidate",
  "strongPoints": ["What they did well"],
  "weakPoints": ["Areas for improvement"],
  "missedConcepts": ["Important concepts not mentioned"],
  "followUpSuggestion": "A good follow-up question to ask"
}`;

        const typeAdditions = {
            technical: '\n\nFocus on technical accuracy, problem-solving approach, and code quality understanding.',
            hr: '\n\nFocus on communication skills, emotional intelligence, and behavioral indicators.',
            project: '\n\nFocus on architectural decisions, practical experience, and problem-solving during development.'
        };

        return base + (typeAdditions[type] || typeAdditions.technical);
    }

    /**
     * Calculate overall score from dimensions
     */
    calculateOverallScore(evaluation) {
        const weights = {
            correctness: 0.3,
            depth: 0.25,
            clarity: 0.2,
            practicalUnderstanding: 0.15,
            confidence: 0.1
        };

        let score = 0;
        for (const [key, weight] of Object.entries(weights)) {
            score += (evaluation[key] || 5) * weight;
        }

        return Math.round(score * 10) / 10;
    }

    /**
     * Aggregate multiple evaluations
     */
    aggregateEvaluations(evaluations) {
        if (evaluations.length === 0) {
            return { averageScore: 0, skillBreakdown: {} };
        }

        // Calculate averages
        const totals = {
            correctness: 0,
            depth: 0,
            clarity: 0,
            practicalUnderstanding: 0,
            confidence: 0,
            overall: 0
        };

        const allStrongPoints = [];
        const allWeakPoints = [];
        const allMissedConcepts = [];

        evaluations.forEach(evaluation => {
            totals.correctness += evaluation.scores.correctness;
            totals.depth += evaluation.scores.depth;
            totals.clarity += evaluation.scores.clarity;
            totals.practicalUnderstanding += evaluation.scores.practicalUnderstanding;
            totals.confidence += evaluation.scores.confidence;
            totals.overall += evaluation.overallScore;

            allStrongPoints.push(...evaluation.strongPoints);
            allWeakPoints.push(...evaluation.weakPoints);
            allMissedConcepts.push(...evaluation.missedConcepts);
        });

        const count = evaluations.length;

        return {
            averageScore: Math.round((totals.overall / count) * 10),
            skillBreakdown: {
                correctness: Math.round((totals.correctness / count) * 10),
                depth: Math.round((totals.depth / count) * 10),
                clarity: Math.round((totals.clarity / count) * 10),
                practicalUnderstanding: Math.round((totals.practicalUnderstanding / count) * 10),
                confidence: Math.round((totals.confidence / count) * 10)
            },
            strongAreas: [...new Set(allStrongPoints)].slice(0, 5),
            weakAreas: [...new Set(allWeakPoints)].slice(0, 5),
            missedConcepts: [...new Set(allMissedConcepts)].slice(0, 5)
        };
    }

    /**
     * Generate overall assessment
     */
    async generateOverallAssessment({ evaluations, context, questions }) {
        const averageScore = evaluations.reduce((sum, e) => sum + e.overallScore, 0) / evaluations.length;

        let recommendation = '';
        if (averageScore >= 8) {
            recommendation = 'Strong candidate. Ready for the next round.';
        } else if (averageScore >= 6) {
            recommendation = 'Good potential. Some areas need improvement.';
        } else if (averageScore >= 4) {
            recommendation = 'Needs more preparation. Review weak areas.';
        } else {
            recommendation = 'Significant gaps. Recommend focused practice.';
        }

        return {
            overallAssessment: {
                score: Math.round(averageScore * 10),
                recommendation,
                readinessLevel: averageScore >= 7 ? 'high' : averageScore >= 5 ? 'medium' : 'low'
            }
        };
    }

    /**
     * Evaluate communication quality
     */
    async evaluateCommunication(answers) {
        // Analyze communication patterns across all answers
        const metrics = {
            clarity: 0,
            structure: 0,
            conciseness: 0,
            vocabulary: 0
        };

        answers.forEach(answer => {
            const text = answer.answer || '';

            // Simple heuristics (in production, use AI)
            metrics.structure += text.includes('\n') || text.length > 100 ? 7 : 5;
            metrics.clarity += text.split('.').length > 2 ? 7 : 5;
            metrics.conciseness += text.length < 500 ? 7 : text.length < 1000 ? 5 : 3;
            metrics.vocabulary += 7; // Placeholder
        });

        const count = answers.length || 1;

        return {
            clarity: Math.round(metrics.clarity / count),
            structure: Math.round(metrics.structure / count),
            conciseness: Math.round(metrics.conciseness / count),
            vocabulary: Math.round(metrics.vocabulary / count),
            overall: Math.round(Object.values(metrics).reduce((a, b) => a + b) / (4 * count))
        };
    }

    /**
     * Get default evaluation if AI fails
     */
    getDefaultEvaluation(questionId) {
        return {
            questionId,
            scores: {
                correctness: 5,
                depth: 5,
                clarity: 5,
                practicalUnderstanding: 5,
                confidence: 5
            },
            overallScore: 5,
            feedback: 'Unable to evaluate automatically. Please review manually.',
            strongPoints: [],
            weakPoints: [],
            missedConcepts: [],
            followUpSuggestion: null
        };
    }
}
