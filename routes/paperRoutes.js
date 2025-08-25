import express from 'express';
import { 
  submitPaper, 
  getPapers, 
  updatePaperStatus, 
  deletePaper 
} from '../controller/paperController.js';
import multer from 'multer';
import adminAuth from '../middleware/adminAuth.js';

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

// Public routes
router.post('/submit', upload.single('paper'), submitPaper);

// Admin routes
router.get('/', adminAuth, getPapers);
router.patch('/:id/status', adminAuth, updatePaperStatus);
router.delete('/:id', adminAuth, deletePaper);

export default router; 