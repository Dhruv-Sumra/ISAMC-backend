import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';

const SCOPES = ['https://www.googleapis.com/auth/drive.file'];

class GoogleDriveService {
  constructor() {
    this.auth = null;
    this.drive = null;
    this.init();
  }

  async init() {
    try {
      this.auth = new google.auth.GoogleAuth({
        keyFile: process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE,
        scopes: SCOPES,
      });

      this.drive = google.drive({ version: 'v3', auth: this.auth });
    } catch (error) {
      console.error('Google Drive initialization error:', error);
    }
  }

  async uploadPDF(filePath, fileName) {
    try {
      const fileMetadata = {
        name: fileName,
        parents: [process.env.GOOGLE_DRIVE_FOLDER_ID], // Optional: specify folder
      };

      const media = {
        mimeType: 'application/pdf',
        body: fs.createReadStream(filePath),
      };

      const response = await this.drive.files.create({
        resource: fileMetadata,
        media: media,
        fields: 'id',
      });

      // Make file publicly viewable
      await this.drive.permissions.create({
        fileId: response.data.id,
        resource: {
          role: 'reader',
          type: 'anyone',
        },
      });

      // Return viewable link
      return `https://drive.google.com/file/d/${response.data.id}/view`;
    } catch (error) {
      console.error('Google Drive upload error:', error);
      throw error;
    }
  }

  async deletePDF(fileId) {
    try {
      await this.drive.files.delete({
        fileId: fileId,
      });
      return true;
    } catch (error) {
      console.error('Google Drive delete error:', error);
      throw error;
    }
  }
}

export default new GoogleDriveService();