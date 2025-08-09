import sendCpanelEmail, { testEmailConnection } from './utils/cpanelEmail.js';
import dotenv from 'dotenv';

dotenv.config();

async function testCpanelEmail() {
  console.log('Testing cPanel email configuration...\n');
  
  // Test connection first
  console.log('1. Testing SMTP connection...');
  const connectionTest = await testEmailConnection();
  
  if (!connectionTest) {
    console.log('❌ SMTP connection failed. Please check your configuration.');
    return;
  }
  
  console.log('✅ SMTP connection successful!\n');
  
  // Test sending an email
  console.log('2. Testing email sending...');
  try {
    const result = await sendCpanelEmail({
      to: process.env.CPANEL_EMAIL_USER, // Send to yourself for testing
      subject: 'cPanel Email Test',
      text: 'This is a test email from your cPanel email configuration. If you receive this, your setup is working correctly!',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">cPanel Email Test</h2>
          <p>This is a test email from your cPanel email configuration.</p>
          <p>If you receive this, your setup is working correctly!</p>
          <hr>
          <small style="color: #6b7280;">Sent from ISAMC backend server</small>
        </div>
      `
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', result.messageId);
    console.log('\nCheck your email inbox to confirm delivery.');
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error.message);
    console.error('Error details:', error);
  }
}

// Run the test
testCpanelEmail().then(() => {
  console.log('\nTest completed.');
  process.exit(0);
}).catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});
