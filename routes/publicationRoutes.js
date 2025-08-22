import express from 'express';
import { uploadPublicationPDF } from '../controller/publicationController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();
const upload = multer({
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Test route to verify the endpoint is accessible
router.get('/test', (req, res) => {
  res.json({ success: true, message: 'Publication routes are working' });
});

// Health check for upload endpoint
router.get('/upload-pdf', (req, res) => {
  res.json({ success: true, message: 'Upload PDF endpoint is available. Use POST method to upload.' });
});

// Admin routes - userAuth first, then adminAuth
router.post('/upload-pdf', userAuth, adminAuth, upload.single('pdf'), uploadPublicationPDF);

export default router;