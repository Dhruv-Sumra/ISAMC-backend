// config/cloudinary.js
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';

class CloudinaryService {
  constructor() {
    // Configure Cloudinary
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
    
    console.log('Cloudinary configured with cloud name:', process.env.CLOUDINARY_CLOUD_NAME);
  }

  async uploadPDFBuffer(buffer, originalName) {
    try {
      console.log('Uploading buffer to Cloudinary:', { originalName, bufferSize: buffer.length });

      // Generate a clean public_id
      const publicId = `publications/${Date.now()}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_').replace('.pdf', '')}`;

      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          {
            resource_type: 'raw',
            public_id: publicId,
            folder: 'publications',
            use_filename: true,
            unique_filename: false,
            overwrite: false
          },
          (error, result) => {
            if (error) {
              console.error('Cloudinary upload error:', error);
              reject(new Error(`Cloudinary upload failed: ${error.message}`));
            } else {
              console.log('Cloudinary upload successful:', result.secure_url);
              resolve(result.secure_url);
            }
          }
        ).end(buffer);
      });

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async uploadPDF(filePath, originalName) {
    try {
      if (!fs.existsSync(filePath)) {
        throw new Error('File does not exist at path: ' + filePath);
      }

      console.log('Uploading to Cloudinary:', { filePath, originalName });

      // Generate a clean public_id
      const publicId = `publications/${Date.now()}_${originalName.replace(/[^a-zA-Z0-9.-]/g, '_').replace('.pdf', '')}`;

      const uploadResult = await cloudinary.uploader.upload(filePath, {
        resource_type: 'raw', // Important for PDF files
        public_id: publicId,
        folder: 'publications',
        use_filename: true,
        unique_filename: false,
        overwrite: false,
        // Add flags for better download behavior
        flags: 'attachment'
      });

      console.log('Cloudinary upload result:', {
        public_id: uploadResult.public_id,
        secure_url: uploadResult.secure_url,
        bytes: uploadResult.bytes,
        format: uploadResult.format
      });

      // Return the secure URL with attachment flag for download
      let downloadUrl = uploadResult.secure_url;
      
      // Ensure the URL has the attachment flag for forced download
      if (!downloadUrl.includes('fl_attachment')) {
        downloadUrl = downloadUrl.replace('/upload/', '/upload/fl_attachment/');
      }

      return downloadUrl;

    } catch (error) {
      console.error('Cloudinary upload error:', error);
      throw new Error(`Cloudinary upload failed: ${error.message}`);
    }
  }

  async deletePDF(publicId) {
    try {
      const result = await cloudinary.uploader.destroy(publicId, {
        resource_type: 'raw'
      });
      console.log('Cloudinary delete result:', result);
      return result;
    } catch (error) {
      console.error('Cloudinary delete error:', error);
      throw new Error(`Cloudinary delete failed: ${error.message}`);
    }
  }

  // Get optimized URL for PDF
  getOptimizedUrl(publicId) {
    return cloudinary.url(publicId, {
      resource_type: 'raw',
      flags: 'attachment'
    });
  }
}

const cloudinaryService = new CloudinaryService();
export default cloudinaryService;
