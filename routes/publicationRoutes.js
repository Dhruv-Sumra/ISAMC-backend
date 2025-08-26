import express from 'express';
import { uploadPublicationPDF } from '../controller/publicationController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';
import userAuth from '../middleware/userAuth.js';

const router = express.Router();

// DEBUG: Add these routes first to test if routing works
router.get('/', (req, res) => {
  res.json({ success: true, message: 'Publications root route working' });
});

router.get('/test-upload', (req, res) => {
  res.json({ success: true, message: 'Publications upload route accessible' });
});

router.post('/test-post', (req, res) => {
  res.json({ success: true, message: 'Publications POST route working' });
});

// Configure multer
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    console.log('File filter called:', file.mimetype);
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'), false);
    }
  }
});

// Add middleware logging
router.use((req, res, next) => {
  console.log(`Publications Route: ${req.method} ${req.path}`);
  console.log('Headers:', req.headers);
  console.log('User:', req.user?.email || 'No user');
  next();
});

// Main upload route
router.post('/upload-pdf', (req, res, next) => {
  console.log('Upload-pdf route hit!');
  next();
}, userAuth, adminAuth, upload.single('pdf'), uploadPublicationPDF);

export default router;
