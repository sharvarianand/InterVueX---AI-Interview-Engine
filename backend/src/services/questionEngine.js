import config from '../config/index.js';
import { AIService } from './aiService.js';
import { extractJSON } from '../utils/aiUtils.js';

const aiService = new AIService();

/**
 * QuestionEngine - Generates adaptive interview questions
 * 
 * Features:
 * - Dynamic question generation based on context
 * - Difficulty adjustment based on performance
 * - Topic tracking to avoid repetition
 * - Follow-up question generation
 */
export class QuestionEngine {
    constructor() {
        this.topicCache = new Map();
    }

    /**
     * Generate a new question based on context
     */
    async generateQuestion({ type, role, techStack, experience, previousAnswers = [], memory = {} }) {
        // Build the context prompt
        const systemPrompt = this.buildSystemPrompt(type);
        const contextPrompt = this.buildContextPrompt({ role, techStack, experience, previousAnswers, memory });

        try {
            const response = await aiService.generate({
                systemPrompt,
                userPrompt: contextPrompt,
                responseFormat: 'json'
            });

            const question = extractJSON(response);
            if (!question) throw new Error('Failed to parse AI question response');

            return {
                id: `q_${Date.now()}`,
                text: question.question,
                topic: question.topic,
                difficulty: question.difficulty || this.calculateDifficulty(memory),
                expectedPoints: question.expectedPoints || [],
                timeLimit: config.interview.questionTimeLimit,
                type
            };
        } catch (error) {
            console.error('Question generation failed:', error);
            // Return a fallback question
            return this.getFallbackQuestion(type, techStack[0]);
        }
    }

    /**
     * Generate a follow-up question based on previous answer
     */
    async generateFollowUp({ question, answer, score }) {
        const prompt = `
      Previous Question: "${question}"
      Candidate's Answer: "${answer}"
      Score: ${score}/10

      ${score < 6
                ? 'Generate a simpler follow-up question to test basic understanding of this concept.'
                : 'Generate a deeper follow-up question to explore advanced aspects of this topic.'
            }

      Return JSON: { "question": "...", "topic": "...", "difficulty": "easy|medium|hard" }
    `;

        try {
            const response = await aiService.generate({
                systemPrompt: 'You are a technical interviewer. Generate follow-up questions.',
                userPrompt: prompt,
                responseFormat: 'json'
            });

            const followUp = extractJSON(response);
            return followUp;

        } catch (error) {
            return null;
        }
    }

    /**
     * Build system prompt based on interview type
     */
    buildSystemPrompt(type) {
        const prompts = {
            technical: `You are an expert technical interviewer. Your role is to:
- Generate challenging but fair technical questions
- Focus on problem-solving and understanding over memorization
- Include questions that test depth of knowledge
- Adjust difficulty based on candidate performance

Generate questions in this JSON format:
{
  "question": "The full question text",
  "topic": "The specific topic being tested",
  "difficulty": "easy|medium|hard",
  "expectedPoints": ["Key point 1", "Key point 2", ...]
}`,

            hr: `You are an experienced HR interviewer. Your role is to:
- Generate behavioral and situational questions
- Focus on soft skills, teamwork, and leadership
- Include questions about conflict resolution and communication
- Assess cultural fit and career goals

Generate questions in this JSON format:
{
  "question": "The full question text",
  "topic": "The skill or trait being assessed",
  "difficulty": "easy|medium|hard",
  "expectedPoints": ["Key behaviors to look for", ...]
}`,

            project: `You are a senior developer conducting a project viva. Your role is to:
- Ask deep questions about project architecture and decisions
- Probe the candidate's understanding of technologies used
- Question trade-offs and alternative approaches
- Assess problem-solving during development

Generate questions in this JSON format:
{
  "question": "The full question text",
  "topic": "The aspect of the project being explored",
  "difficulty": "easy|medium|hard",
  "expectedPoints": ["Key points to cover", ...]
}`
        };

        return prompts[type] || prompts.technical;
    }

    /**
     * Build context prompt with all relevant information
     */
    buildContextPrompt({ role, techStack, experience, previousAnswers, memory }) {
        let prompt = `
Interview Context:
- Target Role: ${role}
- Tech Stack: ${techStack.join(', ')}
- Experience Level: ${experience}
`;

        if (previousAnswers.length > 0) {
            prompt += `\nPrevious Questions Asked:\n`;
            previousAnswers.slice(-5).forEach((qa, i) => {
                prompt += `${i + 1}. ${qa.question} (Score: ${qa.score}/10)\n`;
            });
            prompt += `\nAvoid repeating similar topics.`;
        }

        if (memory.weakTopics?.length > 0) {
            prompt += `\n\nWeak Areas to Probe: ${memory.weakTopics.join(', ')}`;
        }

        if (memory.strongTopics?.length > 0) {
            prompt += `\nStrong Areas (covered): ${memory.strongTopics.join(', ')}`;
        }

        prompt += `\n\nGenerate the next interview question.`;

        return prompt;
    }

    /**
     * Calculate difficulty based on performance memory
     */
    calculateDifficulty(memory) {
        if (!memory.averageScore) return 'medium';
        if (memory.averageScore >= 8) return 'hard';
        if (memory.averageScore <= 4) return 'easy';
        return 'medium';
    }

    /**
     * Get fallback question if AI fails
     */
    getFallbackQuestion(type, techStack) {
        const fallbacks = {
            technical: {
                JavaScript: {
                    text: "Explain the event loop in JavaScript and how it handles asynchronous operations.",
                    topic: "JavaScript Runtime"
                },
                React: {
                    text: "What is the Virtual DOM and how does React use it to optimize performance?",
                    topic: "React Fundamentals"
                },
                Python: {
                    text: "Explain the difference between lists and tuples in Python. When would you use each?",
                    topic: "Python Basics"
                }
            },
            hr: {
                default: {
                    text: "Tell me about a challenging project you worked on and how you overcame obstacles.",
                    topic: "Problem Solving"
                }
            },
            project: {
                default: {
                    text: "Walk me through the architecture of your project and explain your key design decisions.",
                    topic: "Architecture"
                }
            }
        };

        const typeFallbacks = fallbacks[type] || fallbacks.technical;
        const question = typeFallbacks[techStack] || typeFallbacks.default || Object.values(typeFallbacks)[0];

        return {
            id: `q_fallback_${Date.now()}`,
            text: question.text,
            topic: question.topic,
            difficulty: 'medium',
            expectedPoints: [],
            timeLimit: config.interview.questionTimeLimit,
            type
        };
    }

    /**
     * Get topics for a tech stack
     */
    async getTopics(techStack) {
        const topics = {
            JavaScript: ['Variables & Types', 'Functions', 'Closures', 'Async/Await', 'Event Loop', 'Prototypes', 'ES6+'],
            React: ['Components', 'Hooks', 'State Management', 'Virtual DOM', 'Performance', 'Context', 'Redux'],
            'Node.js': ['Event Loop', 'Streams', 'Express', 'Authentication', 'Database', 'APIs', 'Security'],
            Python: ['Data Types', 'OOP', 'Decorators', 'Generators', 'Django', 'FastAPI', 'Testing'],
            SQL: ['Queries', 'Joins', 'Indexes', 'Normalization', 'Transactions', 'Optimization'],
            'System Design': ['Scalability', 'Load Balancing', 'Caching', 'Databases', 'Microservices', 'API Design'],
            DSA: ['Arrays', 'Linked Lists', 'Trees', 'Graphs', 'Dynamic Programming', 'Sorting', 'Searching']
        };

        return topics[techStack] || [];
    }
}
