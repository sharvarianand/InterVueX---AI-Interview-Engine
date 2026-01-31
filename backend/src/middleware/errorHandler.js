export const errorHandler = (err, req, res, next) => {
    console.error(`[Error] ${err.message}`);
    console.error(err.stack);

    // Handle specific error types
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            error: 'Validation Error',
            message: err.message,
            details: err.details || null
        });
    }

    if (err.name === 'UnauthorizedError') {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Invalid or missing authentication token'
        });
    }

    if (err.name === 'ForbiddenError') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'You do not have permission to access this resource'
        });
    }

    if (err.name === 'NotFoundError') {
        return res.status(404).json({
            error: 'Not Found',
            message: err.message || 'Resource not found'
        });
    }

    // AI service errors
    if (err.name === 'AIServiceError') {
        return res.status(503).json({
            error: 'AI Service Unavailable',
            message: 'The AI service is temporarily unavailable. Please try again.',
            retryAfter: 5
        });
    }

    // Database errors
    if (err.code === 'PGRST' || err.name === 'PostgrestError') {
        return res.status(500).json({
            error: 'Database Error',
            message: 'An error occurred while accessing the database'
        });
    }

    // Rate limit errors
    if (err.name === 'RateLimitError') {
        return res.status(429).json({
            error: 'Too Many Requests',
            message: 'Rate limit exceeded. Please slow down.',
            retryAfter: err.retryAfter || 60
        });
    }

    // Default server error
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development'
            ? err.message
            : 'An unexpected error occurred'
    });
};

// Custom error classes
export class ValidationError extends Error {
    constructor(message, details = null) {
        super(message);
        this.name = 'ValidationError';
        this.details = details;
    }
}

export class UnauthorizedError extends Error {
    constructor(message = 'Unauthorized') {
        super(message);
        this.name = 'UnauthorizedError';
    }
}

export class ForbiddenError extends Error {
    constructor(message = 'Forbidden') {
        super(message);
        this.name = 'ForbiddenError';
    }
}

export class NotFoundError extends Error {
    constructor(message = 'Not found') {
        super(message);
        this.name = 'NotFoundError';
    }
}

export class AIServiceError extends Error {
    constructor(message = 'AI service error') {
        super(message);
        this.name = 'AIServiceError';
    }
}
