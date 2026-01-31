import { useState, useEffect, useCallback } from 'react';

/**
 * WebSocket Service for real-time interview communication
 * Handles streaming AI responses and proctoring updates
 */

const WS_URL = import.meta.env.VITE_WS_URL || 'wss://sharvarianand-intervuex-backend.hf.space';

class WebSocketService {
    constructor() {
        this.ws = null;
        this.listeners = new Map();
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.isConnected = false;
    }

    connect(sessionId) {
        return new Promise((resolve, reject) => {
            try {
                this.ws = new WebSocket(`${WS_URL}/interview/${sessionId}`);

                this.ws.onopen = () => {
                    console.log('[WS] Connected to interview session');
                    this.isConnected = true;
                    this.reconnectAttempts = 0;
                    resolve();
                };

                this.ws.onmessage = (event) => {
                    try {
                        const data = JSON.parse(event.data);
                        this.handleMessage(data);
                    } catch (err) {
                        console.error('[WS] Failed to parse message:', err);
                    }
                };

                this.ws.onclose = (event) => {
                    console.log('[WS] Connection closed:', event.code);
                    this.isConnected = false;

                    if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
                        this.reconnect(sessionId);
                    }
                };

                this.ws.onerror = (error) => {
                    console.error('[WS] Error:', error);
                    reject(error);
                };
            } catch (error) {
                reject(error);
            }
        });
    }

    reconnect(sessionId) {
        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);

        console.log(`[WS] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

        setTimeout(() => {
            this.connect(sessionId).catch(() => { });
        }, delay);
    }

    handleMessage(data) {
        const { type, payload } = data;

        const typeListeners = this.listeners.get(type) || [];
        typeListeners.forEach(callback => callback(payload));

        const allListeners = this.listeners.get('*') || [];
        allListeners.forEach(callback => callback(data));
    }

    on(eventType, callback) {
        if (!this.listeners.has(eventType)) {
            this.listeners.set(eventType, []);
        }
        this.listeners.get(eventType).push(callback);

        return () => {
            const listeners = this.listeners.get(eventType);
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        };
    }

    send(type, payload) {
        if (!this.ws || !this.isConnected) {
            console.warn('[WS] Cannot send - not connected');
            return false;
        }

        try {
            this.ws.send(JSON.stringify({ type, payload }));
            return true;
        } catch (error) {
            console.error('[WS] Send error:', error);
            return false;
        }
    }

    sendAnswer(questionId, answer) {
        return this.send('answer', { questionId, answer, timestamp: Date.now() });
    }

    sendProctoringUpdate(data) {
        return this.send('proctoring', data);
    }

    requestNextQuestion() {
        return this.send('next_question', { timestamp: Date.now() });
    }

    disconnect() {
        if (this.ws) {
            this.ws.close(1000, 'Client disconnecting');
            this.ws = null;
            this.isConnected = false;
        }
        this.listeners.clear();
    }
}

export const wsService = new WebSocketService();

/**
 * React hook for WebSocket connection
 */
export function useWebSocket(sessionId) {
    const [connected, setConnected] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!sessionId) return;

        wsService.connect(sessionId)
            .then(() => setConnected(true))
            .catch((err) => setError(err));

        return () => {
            wsService.disconnect();
            setConnected(false);
        };
    }, [sessionId]);

    const subscribe = useCallback((eventType, callback) => {
        return wsService.on(eventType, callback);
    }, []);

    const send = useCallback((type, payload) => {
        return wsService.send(type, payload);
    }, []);

    return {
        connected,
        error,
        subscribe,
        send,
        wsService,
    };
}
