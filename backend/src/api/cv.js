import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import { CVService } from '../services/cvService.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
const cvService = new CVService();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../../uploads/cvs');
fs.mkdir(uploadsDir, { recursive: true }).catch(() => {});

// Configure multer for file uploads
const upload = multer({
    dest: uploadsDir,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedExtensions = ['.pdf', '.docx'];
        const ext = path.extname(file.originalname).toLowerCase();
        
        if (allowedExtensions.includes(ext)) {
            cb(null, true);
        } else {
            cb(new Error('Only PDF and DOCX files are allowed'), false);
        }
    }
});

// POST /api/cv/upload - Upload and parse CV
router.post('/upload', upload.single('cv'), async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'No file uploaded'
            });
        }

        const userId = req.auth?.userId || 'anonymous';
        const filePath = req.file.path;
        const fileName = req.file.originalname;

        // Process CV
        const extractedData = await cvService.processCV(filePath, fileName);

        // Clean up uploaded file after processing
        await fs.unlink(filePath).catch(() => {});

        res.status(200).json({
            success: true,
            cv: {
                fileName,
                extractedData,
                uploadedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        // Clean up file on error
        if (req.file?.path) {
            await fs.unlink(req.file.path).catch(() => {});
        }
        next(error);
    }
});

export default router;
