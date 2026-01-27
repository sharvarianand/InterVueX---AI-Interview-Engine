import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { clerkMiddleware } from '@clerk/express';
import config from './config/index.js';
import { setupWebSocket } from './services/websocketHandler.js';

// Import routes
import authRoutes from './api/auth.js';
import interviewRoutes from './api/interview.js';
import questionRoutes from './api/questions.js';
import evaluationRoutes from './api/evaluation.js';
import reportRoutes from './api/reports.js';
import cvRoutes from './api/cv.js';
import projectRoutes from './api/project.js';
import speechRoutes from './api/speech.js';
import mcqRoutes from './api/mcq.js';

// Import middleware
import { errorHandler } from './middleware/errorHandler.js';
import { rateLimiter } from './middleware/rateLimiter.js';

const app = express();

// Trust proxy for secure cookies behind reverse proxy (Hugging Face / Vercel / Render)
app.set('trust proxy', 1);

const server = createServer(app);

// Initialize WebSocket
setupWebSocket(server);

// Security middleware
app.use(helmet());
app.use(cors(config.cors));

// Logging
app.use(morgan('dev'));

// Clerk Middleware
// Note: Requires CLERK_SECRET_KEY to be set in .env
app.use(clerkMiddleware({
    // Clerk middleware will automatically extract session from cookies or Authorization header
    // Make sure CLERK_SECRET_KEY is set in your .env file
}));

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate limiting
app.use(rateLimiter);

// Root route for validation
app.get('/', (req, res) => {
    res.json({ message: 'InterVueX Backend is Running', status: 'active', timestamp: new Date().toISOString() });
});

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: new Date().toISOString(),
        version: '1.0.0',
        websocket: 'enabled'
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/interview', interviewRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/evaluation', evaluationRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/cv', cvRoutes);
app.use('/api/project', projectRoutes);
app.use('/api/speech', speechRoutes);
app.use('/api/mcq', mcqRoutes);

// Error handling
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        error: 'Not Found',
        message: `Route ${req.method} ${req.path} not found`
    });
});

// Start server
const PORT = config.port;
server.listen(PORT, () => {
    console.log(`
  ╔═══════════════════════════════════════════════════════╗
  ║                                                       ║
  ║   🧠 InterVueX Backend Server                         ║
  ║                                                       ║
  ║   Environment: ${config.nodeEnv.padEnd(20)}            ║
  ║   Port: ${String(PORT).padEnd(26)}            ║
  ║   WebSocket: Enabled (Configured)                     ║
  ║   Time: ${new Date().toISOString().padEnd(25)}  ║
  ║                                                       ║
  ╚═══════════════════════════════════════════════════════╝
  `);
});

export default app;
