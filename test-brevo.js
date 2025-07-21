import dotenv from 'dotenv';
import sendBrevoEmail from './utils/bervoEmail.js';

// Load environment variables
dotenv.config();

console.log('=== Brevo Email Configuration Test ===');
console.log('BREVO_API_KEY:', process.env.BREVO_API_KEY ? '✓ Loaded' : '✗ NOT LOADED');
console.log('BREVO_SENDER_EMAIL:', process.env.BREVO_SENDER_EMAIL || '✗ NOT SET');
console.log('BREVO_SENDER_NAME:', process.env.BREVO_SENDER_NAME || '✗ NOT SET');

if (!process.env.BREVO_API_KEY) {
  console.log('\n❌ ERROR: BREVO_API_KEY is not set in .env file');
  process.exit(1);
}

if (!process.env.BREVO_SENDER_EMAIL) {
  console.log('\n❌ ERROR: BREVO_SENDER_EMAIL is not set in .env file');
  process.exit(1);
}

console.log('\n=== Testing Email Send ===');

// Test email sending
try {
  const result = await sendBrevoEmail({
    to: process.env.BREVO_SENDER_EMAIL, // Send to yourself for testing
    subject: 'Test Email from ISAMC',
    text: 'This is a test email to verify Brevo configuration is working correctly.',
    html: '<h1>Test Email</h1><p>This is a test email to verify Brevo configuration is working correctly.</p>'
  });
  
  console.log('✅ Email sent successfully!');
  console.log('Result:', result);
} catch (error) {
  console.log('❌ Email sending failed:');
  console.log('Error message:', error.message);
  console.log('Error status:', error.status);
  console.log('Error code:', error.code);
  console.log('Error text:', error.text);
  
  if (error.status === 401) {
    console.log('\n🔧 Troubleshooting for 401 Unauthorized:');
    console.log('1. Check if your API key is correct');
    console.log('2. Verify the sender email is verified in Brevo dashboard');
    console.log('3. Make sure you\'re using v3 API key, not SMTP key');
  }
} 