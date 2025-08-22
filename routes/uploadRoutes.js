import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import googleDriveService from '../config/googleDrive.js';

const router = express.Router();

// Configure multer for file upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/pdfs';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/pdf') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF files are allowed'), false);
  }
};

const upload = multer({ 
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Upload PDF to Google Drive
router.post('/pdf', userAuth, adminAuth, upload.single('pdf'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: 'No PDF file uploaded'
      });
    }

    const filePath = req.file.path;
    const fileName = req.file.originalname;

    // Upload to Google Drive
    const driveUrl = await googleDriveService.uploadPDF(filePath, fileName);

    // Clean up local file
    fs.unlinkSync(filePath);

    res.status(200).json({
      success: true,
      message: 'PDF uploaded successfully',
      url: driveUrl,
      fileName: fileName
    });

  } catch (error) {
    // Clean up local file if exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      success: false,
      message: 'PDF upload failed',
      error: error.message
    });
  }
});

export default router;