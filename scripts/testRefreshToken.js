import dotenv from 'dotenv';
import { generateRefreshToken, verifyRefreshToken } from '../utils/jwt.utils.js';

// Load environment variables
dotenv.config();

// Test the refresh token functionality
async function testRefreshToken() {
  console.log('🔧 Testing Refresh Token Functionality...\n');
  
  // Check environment variables
  console.log('📋 Environment Check:');
  console.log('JWT_SECRET set:', !!process.env.JWT_SECRET);
  console.log('JWT_REFRESH_SECRET set:', !!process.env.JWT_REFRESH_SECRET);
  console.log('NODE_ENV:', process.env.NODE_ENV || 'not set');
  
  if (!process.env.JWT_SECRET || !process.env.JWT_REFRESH_SECRET) {
    console.error('\n❌ Missing required JWT secrets in environment variables!');
    console.log('Please set JWT_SECRET and JWT_REFRESH_SECRET in your .env file');
    process.exit(1);
  }
  
  console.log('\n✅ Environment variables are set correctly\n');
  
  // Test token generation and verification
  const mockUser = {
    _id: '507f1f77bcf86cd799439011', // Valid ObjectId format
    email: 'test@example.com',
    role: 'user'
  };
  
  try {
    console.log('🔑 Testing token generation...');
    const refreshToken = generateRefreshToken(mockUser);
    console.log('✅ Refresh token generated successfully');
    console.log('Token length:', refreshToken.length);
    
    console.log('\n🔍 Testing token verification...');
    const decoded = verifyRefreshToken(refreshToken);
    console.log('✅ Token verified successfully');
    console.log('Decoded payload:', { id: decoded.id, exp: new Date(decoded.exp * 1000) });
    
    console.log('\n🎉 All tests passed! Refresh token functionality is working correctly.');
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    process.exit(1);
  }
}

// Run the test if this script is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  testRefreshToken();
}

export default testRefreshToken;
