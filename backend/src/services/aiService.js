import config from '../config/index.js';

/**
 * AIService - Unified AI provider interface
 * 
 * Features:
 * - Primary: Google Gemini (fast and reliable)
 * - Fallback: OpenRouter (Claude, GPT-4, etc.)
 * - Automatic retry and fallback handling
 */
export class AIService {
    constructor() {
        this.primaryUrl = 'https://openrouter.ai/api/v1/chat/completions';
        this.geminiUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';
    }

    /**
     * Generate AI response with automatic fallback
     */
    async generate({ systemPrompt, userPrompt, responseFormat = 'text', maxRetries = 2 }) {
        // Try Gemini first (it's faster and we have a working key)
        const geminiKey = config.ai.geminiKey;
        const openRouterKey = config.ai.openRouterKey;

        if (geminiKey && geminiKey !== 'your_gemini_api_key') {
            try {
                console.log('Trying Gemini API...');
                return await this.callGemini({ systemPrompt, userPrompt });
            } catch (geminiError) {
                console.warn('Gemini API failed:', geminiError.message);
            }
        }

        // Fallback to OpenRouter
        if (openRouterKey && openRouterKey !== 'your_openrouter_api_key') {
            try {
                console.log('Trying OpenRouter API...');
                return await this.callOpenRouter({ systemPrompt, userPrompt, responseFormat });
            } catch (openRouterError) {
                console.warn('OpenRouter API failed:', openRouterError.message);
            }
        }

        throw new Error('All AI providers unavailable. Please check your API keys.');
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

        const url = `${this.geminiUrl}?key=${apiKey}`;

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
