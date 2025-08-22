# Google Drive Setup Guide

## Overview
This guide will help you set up Google Drive integration for PDF uploads in the ISAMC website.

## Prerequisites
- Google Cloud Console account
- Google Drive account

## Step 1: Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google Drive API:
   - Go to "APIs & Services" > "Library"
   - Search for "Google Drive API"
   - Click on it and press "Enable"

## Step 2: Create Service Account

1. Go to "APIs & Services" > "Credentials"
2. Click "Create Credentials" > "Service Account"
3. Fill in the service account details:
   - Name: `isamc-drive-service`
   - Description: `Service account for ISAMC PDF uploads`
4. Click "Create and Continue"
5. Skip the optional steps and click "Done"

## Step 3: Generate Service Account Key

1. In the Credentials page, find your service account
2. Click on the service account email
3. Go to the "Keys" tab
4. Click "Add Key" > "Create New Key"
5. Select "JSON" format
6. Download the key file
7. Rename it to `google-service-account.json`
8. Place it in your backend root directory (same level as `server.js`)

## Step 4: Create Google Drive Folder

1. Go to [Google Drive](https://drive.google.com/)
2. Create a new folder called "ISAMC Publications"
3. Right-click the folder and select "Share"
4. Add the service account email (from step 2) with "Editor" permissions
5. Copy the folder ID from the URL (the long string after `/folders/`)

## Step 5: Update Environment Variables

Update your `.env` file with the correct values:

```env
# Google Drive Configuration
GOOGLE_SERVICE_ACCOUNT_KEY_FILE=./google-service-account.json
GOOGLE_DRIVE_FOLDER_ID=your_actual_folder_id_here
```

## Step 6: Test the Setup

1. Restart your backend server
2. Try uploading a PDF through the admin panel
3. Check the Google Drive folder to see if the file was uploaded

## Troubleshooting

### Common Issues:

1. **"Service account key file not found"**
   - Make sure the JSON file is in the correct location
   - Check the file path in the `.env` file

2. **"Permission denied"**
   - Make sure the service account has access to the Google Drive folder
   - Check that the Google Drive API is enabled

3. **"Folder not found"**
   - Verify the folder ID in the `.env` file
   - Make sure the folder exists and is shared with the service account

### Testing Without Google Drive

If you want to test the upload functionality without setting up Google Drive:
- The system will return placeholder URLs
- PDFs will be validated but not actually stored
- You'll see warning messages in the admin panel

## Security Notes

- Never commit the service account JSON file to version control
- Add `google-service-account.json` to your `.gitignore` file
- Keep your service account credentials secure
- Regularly rotate your service account keys

## Support

If you encounter issues:
1. Check the backend logs for detailed error messages
2. Verify all environment variables are set correctly
3. Test the Google Drive API access using Google's API Explorer