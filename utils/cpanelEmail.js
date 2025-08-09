import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

// Debug logging
console.log('CPANEL_SMTP_HOST:', process.env.CPANEL_SMTP_HOST || 'NOT SET');
console.log('CPANEL_SMTP_PORT:', process.env.CPANEL_SMTP_PORT || 'NOT SET');
console.log('CPANEL_EMAIL_USER:', process.env.CPANEL_EMAIL_USER || 'NOT SET');
console.log('CPANEL_EMAIL_PASS:', process.env.CPANEL_EMAIL_PASS ? 'Loaded' : 'NOT LOADED');
console.log('CPANEL_SENDER_NAME:', process.env.CPANEL_SENDER_NAME || 'NOT SET');

// Create transporter for cPanel SMTP
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.CPANEL_SMTP_HOST,
    port: parseInt(process.env.CPANEL_SMTP_PORT) || 587,
    secure: process.env.CPANEL_SMTP_PORT === '465', // true for 465, false for other ports
    auth: {
      user: process.env.CPANEL_EMAIL_USER,
      pass: process.env.CPANEL_EMAIL_PASS,
    },
    tls: {
      // Do not fail on invalid certs
      rejectUnauthorized: false
    }
  });
};

const sendCpanelEmail = async ({ to, subject, html, text }) => {
  const transporter = createTransporter();

  const sender = {
    name: process.env.CPANEL_SENDER_NAME || 'ISAMC Team',
    address: process.env.CPANEL_EMAIL_USER
  };

  const receivers = Array.isArray(to) ? to : [to];

  const mailOptions = {
    from: sender,
    to: receivers,
    subject,
    text,
    ...(html && { html })
  };

  try {
    console.log('Sending cPanel email to:', receivers);
    console.log('Sender:', sender);
    console.log('SMTP Host:', process.env.CPANEL_SMTP_HOST);
    console.log('SMTP Port:', process.env.CPANEL_SMTP_PORT);
    
    const info = await transporter.sendMail(mailOptions);
    console.log('cPanel email sent successfully:', info.messageId);
    console.log('Response:', info.response);
    return info;
  } catch (error) {
    console.error('cPanel email error details:', {
      message: error.message,
      code: error.code,
      command: error.command,
      responseCode: error.responseCode,
      response: error.response
    });
    throw error;
  }
};

// Test email connection
export const testEmailConnection = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    console.log('cPanel SMTP connection verified successfully');
    return true;
  } catch (error) {
    console.error('cPanel SMTP connection failed:', error.message);
    return false;
  }
};

export default sendCpanelEmail;
