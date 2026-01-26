import config from '../config/index.js';

// Simple in-memory rate limiter
const requestCounts = new Map();

export const rateLimiter = (req, res, next) => {
    const clientId = req.ip || req.headers['x-forwarded-for'] || 'unknown';
    const now = Date.now();
    const windowMs = config.rateLimit.windowMs;
    const maxRequests = config.rateLimit.maxRequests;

    // Get or create client record
    let clientData = requestCounts.get(clientId);

    if (!clientData || now - clientData.windowStart > windowMs) {
        // Reset window
        clientData = {
            windowStart: now,
            count: 0
        };
    }

    clientData.count++;
    requestCounts.set(clientId, clientData);

    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', Math.max(0, maxRequests - clientData.count));
    res.setHeader('X-RateLimit-Reset', Math.ceil((clientData.windowStart + windowMs) / 1000));

    if (clientData.count > maxRequests) {
        const retryAfter = Math.ceil((clientData.windowStart + windowMs - now) / 1000);
        res.setHeader('Retry-After', retryAfter);

        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please slow down.',
            retryAfter
        });
    }

    next();
};

// Cleanup old entries periodically
setInterval(() => {
    const now = Date.now();
    const windowMs = config.rateLimit.windowMs;

    for (const [clientId, data] of requestCounts.entries()) {
        if (now - data.windowStart > windowMs * 2) {
            requestCounts.delete(clientId);
        }
    }
}, 60000); // Clean up every minute
