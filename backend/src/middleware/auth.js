import { getAuth } from '@clerk/express';
import { UnauthorizedError } from './errorHandler.js';

export const requireAuth = (req, res, next) => {
    const auth = getAuth(req);

    if (!auth.userId) {
        return next(new UnauthorizedError('You must be logged in to access this resource'));
    }

    // Add user info to request for easier access in routes
    req.auth = auth;
    next();
};

export const optionalAuth = (req, res, next) => {
    const auth = getAuth(req);
    req.auth = auth;
    next();
};
