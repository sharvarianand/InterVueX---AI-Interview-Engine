import { Router } from 'express';
import { SpeechService } from '../services/speechService.js';
import multer from 'multer';

const router = Router();
const speechService = new SpeechService();

// Configure multer for audio uploads
const upload = multer({
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB limit for audio
    },
    fileFilter: (req, file, cb) => {
        const allowedMimes = ['audio/wav', 'audio/webm', 'audio/mp3', 'audio/mpeg', 'audio/ogg'];
        if (allowedMimes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Only audio files are allowed'), false);
        }
    }
});

// POST /api/speech/transcribe - Transcribe audio to text
router.post('/transcribe', upload.single('audio'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'No audio file uploaded'
            });
        }

        const audioBlob = req.file.buffer;
        const language = req.body.language || 'en-US';
        
        // Note: Actual transcription happens on frontend with Web Speech API
        // This endpoint can be used for server-side processing if needed
        const result = await speechService.transcribeAudio(audioBlob, language);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/speech/analyze - Analyze speaking style
router.post('/analyze', upload.single('audio'), async (req, res, next) => {
    try {
        const { transcript } = req.body;
        
        if (!transcript) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Transcript is required'
            });
        }

        const audioBlob = req.file ? req.file.buffer : null;
        const analysis = await speechService.analyzeSpeakingStyle(audioBlob, transcript);

        res.json({
            success: true,
            analysis: analysis || {
                pace: 'moderate',
                clarity: 'good',
                tone: 'professional',
                pauses: 'appropriate',
                score: 75
            }
        });
    } catch (error) {
        next(error);
    }
});

// POST /api/speech/enhance-tts - Enhance text for better TTS
router.post('/enhance-tts', async (req, res, next) => {
    try {
        const { text, options } = req.body;

        if (!text) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Text is required'
            });
        }

        const enhanced = await speechService.enhancedTextToSpeech(text, options || {});

        res.json({
            success: true,
            ...enhanced
        });
    } catch (error) {
        next(error);
    }
});

export default router;
