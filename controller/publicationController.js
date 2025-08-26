// controller/publicationController.js
import cloudinaryService from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const uploadPublicationPDF = async (req, res) => {
  let tempFilePath = null;
  
  try {
    console.log('PDF upload request received:', {
      user: req.user?.email,
      fileReceived: !!req.file,
      fileName: req.file?.originalname,
      fileSize: req.file?.size
    });
    
    const file = req.file;
    
    if (!file) {
      console.log('No file in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded.' 
      });
    }

    // Validate file type
    if (file.mimetype !== 'application/pdf') {
      console.log('Invalid file type:', file.mimetype);
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

    // Check Cloudinary configuration
    if (!process.env.CLOUDINARY_CLOUD_NAME || 
        !process.env.CLOUDINARY_API_KEY ||
        !process.env.CLOUDINARY_API_SECRET) {
      console.warn('Cloudinary not configured');
      return res.status(500).json({
        success: false,
        message: 'Cloudinary configuration missing. Please configure CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET environment variables.'
      });
    }

    // Create temp file for Cloudinary upload
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const sanitizedFilename = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    tempFilePath = path.join(tempDir, `${Date.now()}-${sanitizedFilename}`);
    fs.writeFileSync(tempFilePath, file.buffer);
    console.log('Temp file created:', tempFilePath);

    // Upload to Cloudinary
    console.log('Starting Cloudinary upload...');
    try {
      const cloudinaryUrl = await cloudinaryService.uploadPDF(tempFilePath, file.originalname);
      console.log('Cloudinary upload successful:', cloudinaryUrl);
      
      res.status(200).json({ 
        success: true, 
        url: cloudinaryUrl,
        message: 'PDF uploaded successfully to Cloudinary!',
        fileName: file.originalname,
        fileSize: file.size,
        uploadedAt: new Date().toISOString()
      });
      
    } catch (cloudinaryError) {
      console.error('Cloudinary upload failed:', cloudinaryError);
      res.status(500).json({
        success: false,
        message: 'Failed to upload PDF to Cloudinary: ' + cloudinaryError.message
      });
    }
    
  } catch (err) {
    console.error('PDF upload error:', {
      message: err.message,
      stack: err.stack,
      user: req.user?.email
    });
    res.status(500).json({ 
      success: false, 
      message: err.message || 'Failed to upload PDF.' 
    });
  } finally {
    // Clean up temp file
    if (tempFilePath && fs.existsSync(tempFilePath)) {
      try {
        fs.unlinkSync(tempFilePath);
        console.log('Temp file cleaned up:', tempFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup temp file:', cleanupError);
      }
    }
  }
};
