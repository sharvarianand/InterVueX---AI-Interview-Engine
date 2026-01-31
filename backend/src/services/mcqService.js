/**
 * MCQService - Generates multiple choice questions dynamically using LLM
 */
import config from '../config/index.js';

export class MCQService {
    constructor() {
        this.openRouterUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    /**
     * Generate 10 MCQs for a specific tech stack
     */
    async generateMCQs(techStack, difficulty = 'medium', count = 10) {
        // Try Gemini first (faster and more reliable with the provided key)
        const geminiKey = config.ai.geminiKey;
        const openRouterKey = config.ai.openRouterKey;

        if (geminiKey && geminiKey !== 'your_gemini_api_key') {
            try {
                console.log('MCQ: Trying Gemini API...');
                const questions = await this.generateWithGemini(techStack, difficulty, count);
                return questions;
            } catch (error) {
                console.warn('Gemini MCQ generation failed:', error.message);
            }
        }

        // Fallback to OpenRouter
        if (openRouterKey && openRouterKey !== 'your_openrouter_api_key') {
            try {
                console.log('MCQ: Trying OpenRouter API...');
                const questions = await this.generateWithOpenRouter(techStack, difficulty, count);
                return questions;
            } catch (error) {
                console.warn('OpenRouter MCQ generation failed:', error.message);
            }
        }

        // Return fallback questions if all else fails
        console.log('MCQ: Returning fallback questions');
        return this.getFallbackQuestions(techStack, count);
    }

    /**
     * Generate MCQs using OpenRouter
     */
    async generateWithOpenRouter(techStack, difficulty, count) {
        const apiKey = config.ai.openRouterKey;
        if (!apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const prompt = this.buildMCQPrompt(techStack, difficulty, count);

        const response = await fetch(this.openRouterUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://intervuex.com',
                'X-Title': 'InterVueX'
            },
            body: JSON.stringify({
                model: config.ai.defaultModel || 'anthropic/claude-3-opus',
                messages: [
                    {
                        role: 'system',
                        content: 'You are an expert technical interviewer. Generate high-quality multiple choice questions in JSON format.'
                    },
                    {
                        role: 'user',
                        content: prompt
                    }
                ],
                response_format: { type: 'json_object' },
                temperature: 0.7,
                max_tokens: 4000
            })
        });

        if (!response.ok) {
            throw new Error(`OpenRouter API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        const parsed = JSON.parse(content);

        return this.parseMCQResponse(parsed, techStack);
    }

    /**
     * Generate MCQs using Gemini
     */
    async generateWithGemini(techStack, difficulty, count) {
        const apiKey = config.ai.geminiKey;
        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const prompt = this.buildMCQPrompt(techStack, difficulty, count);
        const url = `${this.geminiUrl}?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: prompt
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 4000,
                    response_mime_type: 'application/json'
                }
            })
        });

        if (!response.ok) {
            throw new Error(`Gemini API error: ${response.statusText}`);
        }

        const data = await response.json();
        const content = data.candidates[0]?.content?.parts[0]?.text;

        if (!content) {
            throw new Error('No content from Gemini');
        }

        const parsed = JSON.parse(content);
        return this.parseMCQResponse(parsed, techStack);
    }

    /**
     * Build prompt for MCQ generation
     */
    buildMCQPrompt(techStack, difficulty, count) {
        return `Generate exactly ${count} high-quality multiple choice questions about ${techStack} at ${difficulty} difficulty level.

Requirements:
- Each question should test practical knowledge and understanding
- Include 4 options (a, b, c, d) with only one correct answer
- Questions should cover different aspects: fundamentals, best practices, common pitfalls, and real-world scenarios
- Make questions progressively challenging but appropriate for ${difficulty} level
- Include clear, concise explanations for the correct answer

Return JSON in this exact format:
{
  "questions": [
    {
      "id": 1,
      "text": "Question text here?",
      "options": [
        {"id": "a", "text": "Option A"},
        {"id": "b", "text": "Option B"},
        {"id": "c", "text": "Option C"},
        {"id": "d", "text": "Option D"}
      ],
      "correctAnswer": "b",
      "explanation": "Clear explanation of why this is correct",
      "topic": "Specific topic within ${techStack}",
      "difficulty": "${difficulty}"
    }
  ]
}

Generate ${count} unique questions now.`;
    }

    /**
     * Parse MCQ response from LLM
     */
    parseMCQResponse(parsed, techStack) {
        if (!parsed.questions || !Array.isArray(parsed.questions)) {
            throw new Error('Invalid response format from LLM');
        }

        return parsed.questions.map((q, index) => ({
            id: q.id || index + 1,
            text: q.text || q.question || '',
            options: q.options || [],
            correctAnswer: q.correctAnswer || q.correct || 'a',
            explanation: q.explanation || 'No explanation provided',
            topic: q.topic || techStack,
            difficulty: q.difficulty || 'medium'
        }));
    }

    /**
     * Fallback questions if LLM fails
     */
    getFallbackQuestions(techStack, count) {
        const fallbackQuestions = {
            javascript: [
                {
                    id: 1,
                    text: "What is the output of: console.log(typeof null)?",
                    options: [
                        { id: 'a', text: 'null' },
                        { id: 'b', text: 'object' },
                        { id: 'c', text: 'undefined' },
                        { id: 'd', text: 'boolean' }
                    ],
                    correctAnswer: 'b',
                    explanation: 'In JavaScript, typeof null returns "object" due to a historical bug in the language.',
                    topic: 'JavaScript Types',
                    difficulty: 'easy'
                }
            ],
            react: [
                {
                    id: 1,
                    text: "What is the purpose of React keys?",
                    options: [
                        { id: 'a', text: 'To style components' },
                        { id: 'b', text: 'To help React identify which items have changed' },
                        { id: 'c', text: 'To add event handlers' },
                        { id: 'd', text: 'To define component props' }
                    ],
                    correctAnswer: 'b',
                    explanation: 'Keys help React identify which items have changed, been added, or removed.',
                    topic: 'React Fundamentals',
                    difficulty: 'easy'
                }
            ]
        };

        const questions = fallbackQuestions[techStack.toLowerCase()] || fallbackQuestions.javascript;
        return questions.slice(0, count);
    }
}
