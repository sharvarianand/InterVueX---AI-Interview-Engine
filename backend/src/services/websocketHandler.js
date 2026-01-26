import { WebSocketServer, WebSocket } from 'ws';

/**
 * WebSocket handler for real-time interview communication
 */
export function setupWebSocket(server) {
    const wss = new WebSocketServer({ server, path: '/ws' });

    // Store active sessions
    const sessions = new Map();

    wss.on('connection', (ws, req) => {
        const sessionId = req.url?.split('/').pop() || 'anonymous';
        console.log(`[WS] Client connected to session: ${sessionId}`);

        // Store connection
        if (!sessions.has(sessionId)) {
            sessions.set(sessionId, new Set());
        }
        sessions.get(sessionId).add(ws);

        // Send welcome message
        ws.send(JSON.stringify({
            type: 'connected',
            payload: { sessionId, timestamp: Date.now() }
        }));

        // Handle incoming messages
        ws.on('message', async (message) => {
            try {
                const data = JSON.parse(message.toString());
                await handleMessage(ws, sessionId, data);
            } catch (error) {
                console.error('[WS] Message handling error:', error);
                ws.send(JSON.stringify({
                    type: 'error',
                    payload: { message: 'Failed to process message' }
                }));
            }
        });

        // Handle disconnect
        ws.on('close', () => {
            console.log(`[WS] Client disconnected from session: ${sessionId}`);
            sessions.get(sessionId)?.delete(ws);
            if (sessions.get(sessionId)?.size === 0) {
                sessions.delete(sessionId);
            }
        });

        // Handle errors
        ws.on('error', (error) => {
            console.error(`[WS] Error in session ${sessionId}:`, error);
        });
    });

    /**
     * Handle incoming messages
     */
    async function handleMessage(ws, sessionId, data) {
        const { type, payload } = data;

        switch (type) {
            case 'answer':
                // Process answer in real-time
                await handleAnswer(ws, sessionId, payload);
                break;

            case 'next_question':
                // Generate and send next question
                await handleNextQuestion(ws, sessionId);
                break;

            case 'proctoring':
                // Handle proctoring updates
                handleProctoringUpdate(ws, sessionId, payload);
                break;

            case 'typing':
                // Forward typing indicator
                broadcast(sessionId, { type: 'user_typing', payload }, ws);
                break;

            default:
                console.log(`[WS] Unknown message type: ${type}`);
        }
    }

    /**
     * Handle answer submission
     */
    async function handleAnswer(ws, sessionId, payload) {
        const { questionId, answer } = payload;

        // Send acknowledgment
        ws.send(JSON.stringify({
            type: 'answer_received',
            payload: { questionId, timestamp: Date.now() }
        }));

        // Simulate AI evaluation (replace with actual evaluation)
        setTimeout(() => {
            ws.send(JSON.stringify({
                type: 'evaluation',
                payload: {
                    questionId,
                    scores: {
                        correctness: Math.floor(Math.random() * 4) + 6,
                        depth: Math.floor(Math.random() * 4) + 5,
                        clarity: Math.floor(Math.random() * 4) + 6,
                    },
                    feedback: 'Good explanation. Consider adding more specific examples.',
                    timestamp: Date.now()
                }
            }));
        }, 1500);
    }

    /**
     * Handle next question request
     */
    async function handleNextQuestion(ws, sessionId) {
        // Simulate AI question generation (replace with actual question engine)
        const questions = [
            { id: 'q1', text: 'Explain the concept of closures in JavaScript.', topic: 'JavaScript', difficulty: 'Medium' },
            { id: 'q2', text: 'What is the virtual DOM in React?', topic: 'React', difficulty: 'Easy' },
            { id: 'q3', text: 'Describe database indexing and its benefits.', topic: 'Databases', difficulty: 'Medium' },
        ];

        const question = questions[Math.floor(Math.random() * questions.length)];

        ws.send(JSON.stringify({
            type: 'question',
            payload: {
                ...question,
                timestamp: Date.now()
            }
        }));
    }

    /**
     * Handle proctoring updates
     */
    function handleProctoringUpdate(ws, sessionId, payload) {
        const { type: violationType, ...details } = payload;

        console.log(`[WS] Proctoring update for ${sessionId}:`, violationType);

        // Log violation and respond
        ws.send(JSON.stringify({
            type: 'proctoring_ack',
            payload: {
                received: true,
                violationType,
                timestamp: Date.now()
            }
        }));
    }

    /**
     * Broadcast to all clients in a session (except sender)
     */
    function broadcast(sessionId, message, excludeWs = null) {
        const clients = sessions.get(sessionId);
        if (!clients) return;

        const messageStr = JSON.stringify(message);
        clients.forEach((client) => {
            if (client !== excludeWs && client.readyState === WebSocket.OPEN) {
                client.send(messageStr);
            }
        });
    }

    console.log('[WS] WebSocket server initialized');
    return wss;
}
