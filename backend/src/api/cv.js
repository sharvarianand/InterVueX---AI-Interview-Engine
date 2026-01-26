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
fs.mkdir(uploadsDir, { recursive: true }).catch(() => { });

// Configure multer for file uploads in memory for better cross-environment support
const storage = multer.memoryStorage();
const upload = multer({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024, // Increased to 10MB limit
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

        console.log(`Processing CV upload: ${req.file.originalname} (${req.file.size} bytes)`);

        const userId = req.auth?.userId || 'anonymous';
        const fileName = req.file.originalname;
        const fileContent = req.file.buffer;

        // Process CV using specialized service
        const extractedData = await cvService.processCVBuffer(fileContent, fileName);

        res.status(200).json({
            success: true,
            cv: {
                fileName,
                extractedData,
                uploadedAt: new Date().toISOString()
            }
        });
    } catch (error) {
        console.error('CV Upload Route Error:', error);
        res.status(500).json({
            error: 'Analysis Error',
            message: `Failed to process CV: ${error.message}`
        });
    }
});

export default router;
