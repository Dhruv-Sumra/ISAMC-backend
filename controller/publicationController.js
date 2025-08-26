// controller/publicationController.js
import cloudinaryService from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadPublicationPDF = async (req, res) => {
  try {
    console.log('PDF upload request received');
    
    const file = req.file;
    
    if (!file) {
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded.' 
      });
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed.'
      });
    }

    // Validate file size (10MB)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return res.status(400).json({
        success: false,
        message: 'File size must be less than 10MB.'
      });
    }

    // Upload directly to Cloudinary using buffer
    const cloudinaryUrl = await cloudinaryService.uploadPDFBuffer(file.buffer, file.originalname);
    
    res.status(200).json({ 
      success: true, 
      url: cloudinaryUrl,
      message: 'PDF uploaded successfully to Cloudinary!',
      fileName: file.originalname,
      fileSize: file.size
    });
    
  } catch (err) {
    console.error('PDF upload error:', err);
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to upload PDF.' 
    });
  }
};
