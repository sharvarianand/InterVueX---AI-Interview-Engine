/**
 * SpeechService - Handles speech-to-text and text-to-speech using Gemini
 */
import config from '../config/index.js';

export class SpeechService {
    constructor() {
        this.geminiApiKey = config.ai.geminiKey;
        this.geminiApiUrl = 'https://generativelanguage.googleapis.com/v1/models';
    }

    /**
     * Convert speech/audio to text using Gemini
     */
    async speechToText(audioBlob, language = 'en-US') {
        try {
            if (!this.geminiApiKey) {
                throw new Error('Gemini API key not configured');
            }

            // Convert blob to base64
            const base64Audio = await this.blobToBase64(audioBlob);
            
            // Use Gemini's audio understanding capabilities
            // Note: Gemini doesn't have direct STT, so we'll use Web Speech API on frontend
            // and send transcriptions here for processing, or use a dedicated STT service
            
            // For now, return a placeholder that indicates we need frontend STT
            // In production, integrate with Google Cloud Speech-to-Text API or similar
            return {
                text: '',
                confidence: 0,
                language: language,
                note: 'Use Web Speech API on frontend or integrate Google Cloud Speech-to-Text'
            };
        } catch (error) {
            console.error('Speech-to-text error:', error);
            throw error;
        }
    }

    /**
     * Convert text to speech using Gemini (via OpenRouter/Gemini for voice synthesis)
     * Note: For actual TTS, we'll use browser's Web Speech API or a TTS service
     */
    async textToSpeech(text, options = {}) {
        try {
            // Browser's Web Speech API is used on frontend
            // This service can be used for server-side TTS if needed
            // For now, return configuration for frontend TTS
            
            return {
                text: text,
                voice: options.voice || 'default',
                rate: options.rate || 0.9,
                pitch: options.pitch || 1,
                volume: options.volume || 1,
                method: 'browser_speech_api' // Use browser's SpeechSynthesis API
            };
        } catch (error) {
            console.error('Text-to-speech error:', error);
            throw error;
        }
    }

    /**
     * Enhanced text-to-speech using Gemini's capabilities for better pronunciation
     */
    async enhancedTextToSpeech(text, options = {}) {
        try {
            // Use Gemini to improve pronunciation and naturalness
            // This can be used to pre-process text before TTS
            
            if (!this.geminiApiKey) {
                return this.textToSpeech(text, options);
            }

            // Use Gemini to enhance the text for better TTS
            const enhancementPrompt = `Convert this interview question into natural, conversational speech. 
            Make it sound like a real interviewer asking this question. 
            Keep it professional but friendly. 
            Question: "${text}"`;

            const url = `${this.geminiApiUrl}/gemini-pro:generateContent?key=${this.geminiApiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: enhancementPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        maxOutputTokens: 500
                    }
                })
            });

            if (!response.ok) {
                // Fallback to original text
                return this.textToSpeech(text, options);
            }

            const data = await response.json();
            const enhancedText = data.candidates[0]?.content?.parts[0]?.text || text;
            
            return {
                ...this.textToSpeech(enhancedText, options),
                enhanced: true,
                originalText: text
            };
        } catch (error) {
            console.error('Enhanced TTS error:', error);
            // Fallback to basic TTS
            return this.textToSpeech(text, options);
        }
    }

    /**
     * Analyze audio quality and speaking metrics (for HR interviews)
     */
    async analyzeSpeakingStyle(audioBlob, transcript) {
        try {
            if (!this.geminiApiKey || !transcript) {
                return null;
            }

            const analysisPrompt = `Analyze this spoken interview response for communication quality. 
            Evaluate:
            1. Speaking pace (words per minute)
            2. Clarity and articulation
            3. Professional tone
            4. Use of filler words
            5. Pauses and flow
            6. Overall communication effectiveness
            
            Transcript: "${transcript}"
            
            Return JSON format:
            {
                "pace": "fast|moderate|slow",
                "clarity": "excellent|good|needs_improvement",
                "tone": "professional|casual|nervous",
                "pauses": "appropriate|too_many|too_few",
                "fillerWords": number,
                "wpm": number,
                "score": number (0-100)
            }`;

            const url = `${this.geminiApiUrl}/gemini-pro:generateContent?key=${this.geminiApiKey}`;
            
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [{
                        parts: [{
                            text: analysisPrompt
                        }]
                    }],
                    generationConfig: {
                        temperature: 0.3,
                        maxOutputTokens: 500,
                        response_mime_type: 'application/json'
                    }
                })
            });

            if (!response.ok) {
                return null;
            }

            const data = await response.json();
            const analysisText = data.candidates[0]?.content?.parts[0]?.text;
            
            if (analysisText) {
                try {
                    return JSON.parse(analysisText);
                } catch (e) {
                    // If not JSON, parse manually
                    return this.parseAnalysisText(analysisText);
                }
            }

            return null;
        } catch (error) {
            console.error('Speaking style analysis error:', error);
            return null;
        }
    }

    /**
     * Parse analysis text if JSON parsing fails
     */
    parseAnalysisText(text) {
        const analysis = {
            pace: 'moderate',
            clarity: 'good',
            tone: 'professional',
            pauses: 'appropriate',
            fillerWords: 0,
            wpm: 150,
            score: 75
        };

        // Extract values from text
        if (text.includes('fast')) analysis.pace = 'fast';
        if (text.includes('slow')) analysis.pace = 'slow';
        if (text.includes('excellent')) analysis.clarity = 'excellent';
        if (text.includes('needs improvement')) analysis.clarity = 'needs_improvement';
        if (text.includes('casual')) analysis.tone = 'casual';
        if (text.includes('nervous')) analysis.tone = 'nervous';

        return analysis;
    }

    /**
     * Convert blob to base64
     */
    async blobToBase64(blob) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => {
                const base64 = reader.result.split(',')[1];
                resolve(base64);
            };
            reader.onerror = reject;
            reader.readAsDataURL(blob);
        });
    }

    /**
     * Transcribe audio using Web Speech API (frontend) or Google Cloud Speech
     */
    async transcribeAudio(audioBlob, language = 'en-US') {
        // This should be called from frontend using Web Speech API
        // Backend can process the transcription further
        return {
            method: 'web_speech_api',
            language: language,
            note: 'Use browser Web Speech API for real-time transcription'
        };
    }
}
