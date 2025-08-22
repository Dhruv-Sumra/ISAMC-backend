import googleDriveService from '../config/googleDrive.js';
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
      fileName: req.file?.originalname
    });
    
    const file = req.file;
    
    if (!file) {
      console.log('No file in request');
      return res.status(400).json({ 
        success: false, 
        message: 'No file uploaded.' 
      });
    }

    if (file.mimetype !== 'application/pdf') {
      console.log('Invalid file type:', file.mimetype);
      return res.status(400).json({
        success: false,
        message: 'Only PDF files are allowed.'
      });
    }

    // Check Google Drive configuration
    if (!process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE || 
        !process.env.GOOGLE_DRIVE_FOLDER_ID ||
        process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE === 'path/to/your/service-account-key.json' ||
        process.env.GOOGLE_DRIVE_FOLDER_ID === 'your_drive_folder_id_here') {
      console.warn('Google Drive not configured, returning placeholder URL');
      
      // Return a placeholder response when Google Drive is not configured
      return res.status(200).json({
        success: true,
        url: `https://placeholder-pdf-url.com/${file.originalname}`,
        message: 'PDF upload simulated (Google Drive not configured). Please configure Google Drive for actual uploads.',
        warning: 'Google Drive service not configured. This is a placeholder URL.'
      });
    }

    // Create temp file for Google Drive upload
    const tempDir = path.join(__dirname, '../temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    tempFilePath = path.join(tempDir, `${Date.now()}-${file.originalname}`);
    fs.writeFileSync(tempFilePath, file.buffer);
    console.log('Temp file created:', tempFilePath);

    // Upload to Google Drive
    console.log('Starting Google Drive upload...');
    let googleDriveUrl;
    try {
      googleDriveUrl = await googleDriveService.uploadPDF(tempFilePath, file.originalname);
      console.log('Google Drive upload successful:', googleDriveUrl);
    } catch (driveError) {
      console.error('Google Drive upload failed:', driveError);
      // Return placeholder URL if Google Drive fails
      return res.status(200).json({
        success: true,
        url: `https://placeholder-pdf-url.com/${file.originalname}`,
        message: 'PDF received but Google Drive upload failed. Please check Google Drive configuration.',
        warning: 'Google Drive upload failed. This is a placeholder URL.'
      });
    }
    
    res.status(200).json({ 
      success: true, 
      url: googleDriveUrl,
      message: 'PDF uploaded successfully!'
    });
    
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