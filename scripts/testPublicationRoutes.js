import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

async function testPublicationRoutes() {
  console.log('Testing Publication Routes...\n');

  try {
    // Test 1: Check if publication routes are mounted
    console.log('1. Testing route availability...');
    const testResponse = await axios.get(`${API_BASE}/publications/test`);
    console.log('✅ Route test:', testResponse.data);
  } catch (error) {
    console.log('❌ Route test failed:', error.response?.data || error.message);
  }

  try {
    // Test 2: Check upload endpoint (should fail with 401 - no auth)
    console.log('\n2. Testing upload endpoint (without auth)...');
    const uploadResponse = await axios.post(`${API_BASE}/publications/upload-pdf`);
    console.log('✅ Upload test:', uploadResponse.data);
  } catch (error) {
    if (error.response?.status === 401) {
      console.log('✅ Upload endpoint correctly requires authentication');
    } else {
      console.log('❌ Upload test failed:', error.response?.data || error.message);
    }
  }

  console.log('\nTest completed!');
}

// Run the test
testPublicationRoutes().catch(console.error);