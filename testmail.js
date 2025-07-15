import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: true,
  auth: {
    user: process.env.SENDER_EMAIL,
    pass: process.env.SENDER_PASSWORD,
  },
});

// Test email configuration
const testEmail = async () => {
  console.log("Testing email configuration...");

  // Try sending a test email
  try {
    const testMailOptions = {
      from: process.env.SENDER_EMAIL,
      to: process.env.SENDER_EMAIL, // Send to yourself for testing
      subject: 'Test Email Configuration',
      text: 'This is a test email to verify email configuration.',
      html: '<h1>Test Email</h1><p>This is a test email to verify email configuration.</p>'
    };

    const result = await transporter.sendMail(testMailOptions);
    console.log("✅ Test email sent successfully:", result.messageId);
  } catch (error) {
    console.error("❌ Failed to send test email:", error.message);
    // Provide specific error guidance
    if (error.code === 'EAUTH') {
      console.log("\n🔧 Authentication Error Solutions:");
      console.log("1. Verify your email credentials are correct");
      console.log("2. Check if your email provider requires app-specific passwords");
      console.log("3. Ensure your email account allows SMTP access");
      console.log("4. Try different SMTP ports (587, 25, 465)");
    }
  }
};

// Run the test
testEmail();