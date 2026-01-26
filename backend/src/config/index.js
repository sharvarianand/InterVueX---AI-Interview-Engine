import dotenv from 'dotenv';
dotenv.config();

export default {
    // Server
    port: process.env.PORT || 3001,
    nodeEnv: process.env.NODE_ENV || 'development',

    // Supabase
    supabase: {
        url: process.env.SUPABASE_URL,
        anonKey: process.env.SUPABASE_ANON_KEY,
        serviceKey: process.env.SUPABASE_SERVICE_KEY,
    },

    // AI Providers
    ai: {
        openRouterKey: process.env.OPENROUTER_API_KEY,
        geminiKey: process.env.GEMINI_API_KEY,
        defaultModel: 'meta-llama/llama-3.1-8b-instruct', // Fast, cheap, and distinct from Gemini (good for fallback)
        fallbackModel: 'gemini-pro', // Fallback to Gemini direct
    },

    // Clerk Auth
    clerk: {
        secretKey: process.env.CLERK_SECRET_KEY,
    },

    // Rate Limiting
    rateLimit: {
        windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
        maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    },

    // Interview Settings
    interview: {
        questionTimeLimit: 180, // seconds per question
        maxQuestionsPerSession: 10,
        defaultDifficulty: 'medium',
    },

    // CORS
    cors: {
        origin: process.env.NODE_ENV === 'production'
            ? 'https://intervuex.com'
            : 'http://localhost:5173',
        credentials: true,
    },
};
