import config from '../config/index.js';

/**
 * AIService - Unified AI provider interface
 * 
 * Features:
 * - Primary: OpenRouter (Claude, GPT-4, etc.)
 * - Fallback: Google Gemini
 * - Automatic retry and fallback handling
 */
export class AIService {
    constructor() {
        this.primaryUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.fallbackUrl = 'https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent';
    }

    /**
     * Generate AI response with automatic fallback
     */
    async generate({ systemPrompt, userPrompt, responseFormat = 'text', maxRetries = 2 }) {
        try {
            // Try primary provider (OpenRouter)
            return await this.callOpenRouter({ systemPrompt, userPrompt, responseFormat });
        } catch (primaryError) {
            console.warn('Primary AI provider failed:', primaryError.message);

            // Try fallback (Gemini)
            try {
                return await this.callGemini({ systemPrompt, userPrompt });
            } catch (fallbackError) {
                console.error('Fallback AI provider failed:', fallbackError.message);
                throw new Error('All AI providers unavailable');
            }
        }
    }

    /**
     * Call OpenRouter API
     */
    async callOpenRouter({ systemPrompt, userPrompt, responseFormat }) {
        const apiKey = config.ai.openRouterKey;

        if (!apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const response = await fetch(this.primaryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://intervuex.com',
                'X-Title': 'InterVueX'
            },
            body: JSON.stringify({
                model: config.ai.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                response_format: responseFormat === 'json' ? { type: 'json_object' } : undefined,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`OpenRouter API error: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        return data.choices[0].message.content;
    }

    /**
     * Call Google Gemini API
     */
    async callGemini({ systemPrompt, userPrompt }) {
        const apiKey = config.ai.geminiKey;

        if (!apiKey) {
            throw new Error('Gemini API key not configured');
        }

        const url = `${this.fallbackUrl}?key=${apiKey}`;

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemPrompt}\n\n${userPrompt}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 2000
                }
            })
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(`Gemini API error: ${error.message || response.statusText}`);
        }

        const data = await response.json();
        return data.candidates[0].content.parts[0].text;
    }

    /**
     * Stream response (for real-time feedback)
     */
    async *stream({ systemPrompt, userPrompt }) {
        const apiKey = config.ai.openRouterKey;

        if (!apiKey) {
            throw new Error('OpenRouter API key not configured');
        }

        const response = await fetch(this.primaryUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://intervuex.com'
            },
            body: JSON.stringify({
                model: config.ai.defaultModel,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                stream: true,
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const reader = response.body.getReader();
        const decoder = new TextDecoder();

        while (true) {
            const { done, value } = await reader.read();
            if (done) break;

            const chunk = decoder.decode(value);
            const lines = chunk.split('\n').filter(line => line.startsWith('data: '));

            for (const line of lines) {
                const data = line.replace('data: ', '');
                if (data === '[DONE]') return;

                try {
                    const parsed = JSON.parse(data);
                    const content = parsed.choices[0]?.delta?.content;
                    if (content) yield content;
                } catch (e) {
                    // Skip malformed chunks
                }
            }
        }
    }
}
