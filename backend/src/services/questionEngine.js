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
    async generateQuestion({ type, role, techStack, experience, previousAnswers = [], memory = {}, cvData = null, projectData = null }) {
        // Build the context prompt
        const systemPrompt = this.buildSystemPrompt(type);
        const contextPrompt = this.buildContextPrompt({ role, techStack, experience, previousAnswers, memory, cvData, projectData });

        console.log('Generating question with context:', {
            type,
            role,
            techStack: Array.isArray(techStack) ? techStack : [techStack],
            experience,
            hasCvData: !!cvData,
            hasProjectData: !!projectData,
            previousAnswersCount: previousAnswers.length
        });

        try {
            const response = await aiService.generate({
                systemPrompt,
                userPrompt: contextPrompt,
                responseFormat: 'json'
            });

            const question = extractJSON(response);
            if (!question) throw new Error('Failed to parse AI question response');

            // Validate question has required fields
            if (!question.question && !question.text) {
                throw new Error('AI generated question missing text field');
            }

            const generatedQuestion = {
                id: `q_${Date.now()}`,
                text: question.question || question.text,
                topic: question.topic || 'General',
                difficulty: question.difficulty || this.calculateDifficulty(memory),
                expectedPoints: question.expectedPoints || [],
                timeLimit: config.interview.questionTimeLimit,
                type
            };

            console.log('Question generated successfully:', {
                id: generatedQuestion.id,
                topic: generatedQuestion.topic,
                difficulty: generatedQuestion.difficulty,
                textPreview: generatedQuestion.text.substring(0, 100)
            });

            return generatedQuestion;
        } catch (error) {
            console.error('Question generation failed:', error);
            console.error('Error details:', {
                message: error.message,
                stack: error.stack,
                type,
                techStack,
                role,
                hasCvData: !!cvData
            });
            // Return a fallback question that's still relevant
            const fallback = this.getFallbackQuestion(type, techStack && techStack.length > 0 ? techStack[0] : null);
            console.log('Returning fallback question:', fallback);
            return fallback;
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
            technical: `You are an expert technical interviewer conducting a personalized interview. Your role is to:
- Generate challenging but fair technical questions SPECIFICALLY based on the candidate's CV, Tech Stack, and Target Role
- Ask questions about technologies, projects, and experiences mentioned in their resume
- Focus on problem-solving and understanding over memorization
- Test depth of knowledge in their claimed expertise areas
- Adjust difficulty based on candidate performance and experience level
- Reference specific technologies from their tech stack
- Ask about projects and experiences from their CV

CRITICAL: The questions MUST be personalized based on:
1. The candidate's CV/Resume (skills, technologies, projects, experience)
2. The target role they're applying for
3. The tech stack they've specified

Generate questions in this JSON format:
{
  "question": "The full question text (should reference their CV, role, or tech stack)",
  "topic": "The specific topic being tested",
  "difficulty": "easy|medium|hard",
  "expectedPoints": ["Key point 1", "Key point 2", ...]
}`,

            hr: `You are an experienced HR interviewer. Your role is to:
- Generate behavioral and situational questions based on the candidate's CV
- Focus on communication skills, soft skills, teamwork, and leadership
- Include questions about conflict resolution, problem-solving, and interpersonal skills
- Assess cultural fit, career goals, and emotional intelligence
- Ask questions that evaluate speaking style, clarity, and professional communication
- Probe into past experiences mentioned in their resume

IMPORTANT: Observe and evaluate:
- Communication clarity and articulation
- Speaking style and professional tone
- Posture and body language (if visible)
- Ability to structure responses clearly
- Emotional intelligence and empathy

Generate questions in this JSON format:
{
  "question": "The full question text",
  "topic": "The skill or trait being assessed (e.g., Communication, Leadership, Conflict Resolution)",
  "difficulty": "easy|medium|hard",
  "expectedPoints": ["Key behaviors to look for", "Communication indicators", ...]
}`,

            project: `You are a senior developer conducting a project viva. Your role is to:
- Ask deep questions about project architecture and decisions based on the GitHub repository analysis
- Probe the candidate's understanding of technologies used in their project
- Question trade-offs, alternative approaches, and design decisions
- Assess problem-solving during development
- Ask about specific code implementations, features, and technical challenges
- Reference specific parts of their project (from GitHub analysis) to test deep understanding

IMPORTANT: Use the project analysis data to ask specific questions about:
- Technologies and frameworks used
- Architecture patterns and design decisions
- Features implemented
- Code quality and best practices
- Deployment and DevOps practices
- Challenges faced and solutions implemented

Generate questions in this JSON format:
{
  "question": "The full question text (reference specific project aspects)",
  "topic": "The aspect of the project being explored",
  "difficulty": "easy|medium|hard",
  "expectedPoints": ["Key points to cover", "Technical details to discuss", ...]
}`
        };

        return prompts[type] || prompts.technical;
    }

    /**
     * Build context prompt with all relevant information
     */
    buildContextPrompt({ role, techStack, experience, previousAnswers, memory, cvData = null, projectData = null }) {
        // Ensure techStack is an array
        const techStackArray = Array.isArray(techStack) ? techStack : (techStack ? [techStack] : []);

        let prompt = `
CRITICAL INTERVIEW CONTEXT - Generate questions based on ALL of this:

TARGET ROLE: ${role || 'Software Engineer'}
- Generate questions relevant to this specific role
- Ask about role-specific responsibilities and challenges
- Test knowledge required for this position

TECH STACK: ${techStackArray.length > 0 ? techStackArray.join(', ') : 'General'}
- Focus questions on these specific technologies
- Ask about practical implementation in these tech stacks
- Test deep understanding of these tools and frameworks

EXPERIENCE LEVEL: ${experience || 'mid'}
- Adjust question complexity to match this level
- ${experience === 'junior' ? 'Focus on fundamentals and basic concepts' : experience === 'senior' ? 'Focus on architecture, design patterns, and leadership' : 'Focus on intermediate to advanced concepts'}
`;

        // Add CV-based context if available
        if (cvData) {
            prompt += `\n\n=== CANDIDATE'S CV/RESUME INFORMATION ===`;
            prompt += `\nYOU MUST GENERATE QUESTIONS BASED ON THIS CV DATA:\n`;

            if (cvData.skills && cvData.skills.length > 0) {
                prompt += `\nSKILLS: ${cvData.skills.join(', ')}`;
                prompt += `\n→ Ask about their experience with these specific skills`;
            }

            if (cvData.technologies && cvData.technologies.length > 0) {
                prompt += `\nTECHNOLOGIES: ${cvData.technologies.join(', ')}`;
                prompt += `\n→ Ask technical questions about these technologies`;
            }

            if (cvData.experience && cvData.experience.length > 0) {
                prompt += `\nEXPERIENCE HIGHLIGHTS:`;
                cvData.experience.slice(0, 5).forEach((exp, idx) => {
                    prompt += `\n  ${idx + 1}. ${exp}`;
                });
                prompt += `\n→ Ask about specific projects and challenges from their experience`;
            }

            if (cvData.projects && cvData.projects.length > 0) {
                prompt += `\nPROJECTS MENTIONED:`;
                cvData.projects.slice(0, 5).forEach((proj, idx) => {
                    prompt += `\n  ${idx + 1}. ${proj}`;
                });
                prompt += `\n→ Ask detailed questions about these projects`;
            }

            if (cvData.summary) {
                prompt += `\nCV SUMMARY: ${cvData.summary.substring(0, 500)}`;
                prompt += `\n→ Use this to understand their background and ask relevant questions`;
            }

            if (cvData.rawText) {
                prompt += `\n\nADDITIONAL CV CONTEXT (first 800 chars): ${cvData.rawText.substring(0, 800)}`;
            }

            prompt += `\n\n=== CRITICAL INSTRUCTIONS ===`;
            prompt += `\n1. Generate questions that SPECIFICALLY reference their CV (technologies, projects, experience)`;
            prompt += `\n2. Ask about their claimed expertise - probe deeper into what they've mentioned`;
            prompt += `\n3. Connect questions to their target role: "${role || 'Software Engineer'}"`;
            prompt += `\n4. Use their tech stack: ${techStackArray.length > 0 ? techStackArray.join(', ') : 'General'}`;
            prompt += `\n5. Make questions personalized - not generic!`;
        } else {
            prompt += `\n\nNOTE: No CV data provided. Generate questions based on role and tech stack only.`;
        }

        // Add project data for project viva interviews
        if (projectData && projectData.github) {
            prompt += `\n\nProject Analysis (GitHub Repository):`;
            prompt += `\n- Repository: ${projectData.github.owner}/${projectData.github.repo}`;
            prompt += `\n- Technologies Used: ${projectData.github.technologies?.join(', ') || 'N/A'}`;
            prompt += `\n- Languages: ${Object.keys(projectData.github.languages || {}).join(', ')}`;
            prompt += `\n- Features: ${projectData.github.features?.slice(0, 5).join('; ') || 'N/A'}`;
            if (projectData.github.readme) {
                prompt += `\n- Project Description: ${projectData.github.readme.substring(0, 500)}`;
            }
            prompt += `\n\nIMPORTANT: Ask specific questions about their project implementation, architecture decisions, and code quality. Reference specific technologies and features from their repository.`;
        }

        if (projectData && projectData.deployed) {
            prompt += `\n- Deployed Link: ${projectData.deployed.url}`;
        }

        if (previousAnswers.length > 0) {
            // Extract topics that have been covered
            const coveredTopics = previousAnswers
                .map(qa => qa.topic || qa.question?.substring(0, 30))
                .filter(Boolean);

            // Calculate average score to determine if follow-up is needed
            const lastAnswer = previousAnswers[previousAnswers.length - 1];
            const lastScore = lastAnswer?.score || lastAnswer?.evaluation?.score || 5;

            prompt += `\n\n=== QUESTION DIVERSITY RULES ===`;
            prompt += `\nPrevious Questions Asked (DO NOT REPEAT THESE TOPICS):`;
            previousAnswers.slice(-5).forEach((qa, i) => {
                const topic = qa.topic || 'Unknown';
                const score = qa.score || qa.evaluation?.score || 'N/A';
                prompt += `\n${i + 1}. Topic: "${topic}" - Score: ${score}/10`;
            });

            if (lastScore < 5) {
                // Only do follow-up for weak answers
                prompt += `\n\n⚠️ LAST ANSWER WAS WEAK (Score: ${lastScore}/10)`;
                prompt += `\nYou MAY ask a simpler follow-up question on the same topic to verify understanding.`;
                prompt += `\nOR you can move to a completely different topic.`;
            } else {
                // Good answer - move to a new topic
                prompt += `\n\n✓ Last answer was good (Score: ${lastScore}/10)`;
                prompt += `\n→ MUST ask about a COMPLETELY DIFFERENT TOPIC`;
                prompt += `\n→ DO NOT ask follow-up questions on the same topic`;
            }

            prompt += `\n\nTOPICS TO AVOID (already covered): ${coveredTopics.join(', ')}`;
            prompt += `\n→ Generate a question on a NEW, UNCOVERED topic from their CV/tech stack.`;
        } else {
            prompt += `\n\nThis is the FIRST question. Make it impactful and relevant to their CV and role.`;
        }

        if (memory.weakTopics?.length > 0) {
            prompt += `\n\nWeak Areas (probe these if not recently covered): ${memory.weakTopics.join(', ')}`;
        }

        if (memory.strongTopics?.length > 0) {
            prompt += `\nStrong Areas (already verified - skip these): ${memory.strongTopics.join(', ')}`;
        }

        prompt += `\n\n=== FINAL INSTRUCTION ===`;
        prompt += `\nGenerate ONE interview question that:`;
        prompt += `\n1. Is on a DIFFERENT topic from previous questions`;
        prompt += `\n2. Tests a specific skill from their CV or tech stack`;
        prompt += `\n3. Is appropriately difficult for their experience level`;
        prompt += `\n4. Is practical and job-relevant`;

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
                default: {
                    text: "Explain the difference between let, const, and var in JavaScript. When would you use each?",
                    topic: "JavaScript Fundamentals"
                },
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
                },
                'Node.js': {
                    text: "Explain how Node.js handles asynchronous I/O operations and the event loop.",
                    topic: "Node.js Fundamentals"
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
        const question = (techStack && typeFallbacks[techStack])
            ? typeFallbacks[techStack]
            : (typeFallbacks.default || Object.values(typeFallbacks)[0]);

        if (!question) {
            // Ultimate fallback
            return {
                id: `q_fallback_${Date.now()}`,
                text: "Tell me about your experience with software development and what technologies you're most comfortable with.",
                topic: "General",
                difficulty: 'medium',
                expectedPoints: [],
                timeLimit: config.interview.questionTimeLimit,
                type: type || 'technical'
            };
        }

        return {
            id: `q_fallback_${Date.now()}`,
            text: question.text,
            topic: question.topic,
            difficulty: 'medium',
            expectedPoints: [],
            timeLimit: config.interview.questionTimeLimit,
            type: type || 'technical'
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
