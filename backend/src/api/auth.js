import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { clerkClient } from '@clerk/express';

const router = Router();

// GET /api/auth/user - Get current user details from Clerk
router.get('/user', requireAuth, async (req, res, next) => {
    try {
        const userId = req.auth.userId;
        const user = await clerkClient.users.getUser(userId);

        res.json({
            user: {
                id: user.id,
                email: user.emailAddresses[0]?.emailAddress,
                firstName: user.firstName,
                lastName: user.lastName,
                imageUrl: user.imageUrl,
                createdAt: user.createdAt
            }
        });
    } catch (error) {
        next(error);
    }
});

export default router;
