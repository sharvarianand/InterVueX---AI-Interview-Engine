/**
 * Frontend Speech Service - Uses Web Speech API and integrates with backend/Gemini
 */
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

export class SpeechService {
    constructor() {
        this.recognition = null;
        this.synthesis = window.speechSynthesis;
        this.isListening = false;
        this.onTranscriptCallback = null;
        this.onErrorCallback = null;
        
        this.initSpeechRecognition();
    }

    /**
     * Initialize Web Speech Recognition API
     */
    initSpeechRecognition() {
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.recognition = new SpeechRecognition();
            this.recognition.continuous = true;
            this.recognition.interimResults = true;
            this.recognition.lang = 'en-US';

            this.recognition.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                if (this.onTranscriptCallback) {
                    this.onTranscriptCallback({
                        interim: interimTranscript,
                        final: finalTranscript.trim(),
                        isFinal: finalTranscript.length > 0
                    });
                }
            };

            this.recognition.onerror = (event) => {
                if (this.onErrorCallback) {
                    this.onErrorCallback(event.error);
                }
            };

            this.recognition.onend = () => {
                this.isListening = false;
            };
        }
    }

    /**
     * Start speech recognition
     */
    startListening(onTranscript, onError) {
        if (!this.recognition) {
            if (onError) onError('Speech recognition not supported in this browser');
            return false;
        }

        try {
            this.onTranscriptCallback = onTranscript;
            this.onErrorCallback = onError;
            this.recognition.start();
            this.isListening = true;
            return true;
        } catch (error) {
            if (onError) onError(error.message);
            return false;
        }
    }

    /**
     * Stop speech recognition
     */
    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
            this.isListening = false;
        }
    }

    /**
     * Speak text using Web Speech Synthesis API
     */
    speak(text, options = {}) {
        return new Promise((resolve, reject) => {
            if (!this.synthesis) {
                reject(new Error('Speech synthesis not supported'));
                return;
            }

            // Cancel any ongoing speech
            this.synthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.rate = options.rate || 0.9;
            utterance.pitch = options.pitch || 1;
            utterance.volume = options.volume || 1;
            utterance.lang = options.lang || 'en-US';

            // Try to use a more natural voice
            const voices = this.synthesis.getVoices();
            const preferredVoice = voices.find(v => 
                v.name.includes('Natural') || 
                v.name.includes('Neural') ||
                v.lang.startsWith('en')
            ) || voices[0];
            
            if (preferredVoice) {
                utterance.voice = preferredVoice;
            }

            utterance.onend = () => resolve();
            utterance.onerror = (error) => reject(error);

            this.synthesis.speak(utterance);
        });
    }

    /**
     * Stop speaking
     */
    stopSpeaking() {
        if (this.synthesis) {
            this.synthesis.cancel();
        }
    }

    /**
     * Enhanced text-to-speech using backend/Gemini
     */
    async enhancedSpeak(text, options = {}) {
        try {
            // First, enhance the text using Gemini
            const response = await fetch(`${API_BASE_URL}/speech/enhance-tts`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    text,
                    options
                })
            });

            if (response.ok) {
                const data = await response.json();
                const textToSpeak = data.enhanced ? data.text : text;
                return await this.speak(textToSpeak, data);
            } else {
                // Fallback to basic TTS
                return await this.speak(text, options);
            }
        } catch (error) {
            console.error('Enhanced TTS error:', error);
            // Fallback to basic TTS
            return await this.speak(text, options);
        }
    }

    /**
     * Analyze speaking style using Gemini
     */
    async analyzeSpeakingStyle(transcript, audioBlob = null) {
        try {
            const formData = new FormData();
            if (audioBlob) {
                formData.append('audio', audioBlob, 'recording.webm');
            }
            formData.append('transcript', transcript);

            const response = await fetch(`${API_BASE_URL}/speech/analyze`, {
                method: 'POST',
                body: formData
            });

            if (response.ok) {
                const data = await response.json();
                return data.analysis;
            }

            return null;
        } catch (error) {
            console.error('Speaking style analysis error:', error);
            return null;
        }
    }

    /**
     * Check if speech recognition is available
     */
    isRecognitionAvailable() {
        return !!this.recognition;
    }

    /**
     * Check if speech synthesis is available
     */
    isSynthesisAvailable() {
        return !!this.synthesis;
    }

    /**
     * Get available voices
     */
    getVoices() {
        if (!this.synthesis) return [];
        return this.synthesis.getVoices();
    }
}

// Export singleton instance
export const speechService = new SpeechService();
