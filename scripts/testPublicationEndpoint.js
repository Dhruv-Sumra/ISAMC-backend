import axios from 'axios';

const API_BASE = process.env.API_URL || 'http://localhost:4000';

async function testPublicationEndpoints() {
  console.log('Testing publication endpoints...');
  console.log('API Base URL:', API_BASE);
  
  try {
    // Test the health endpoint
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE}/health`);
    console.log('✓ Health check:', healthResponse.data);
    
    // Test publication test route
    console.log('\n2. Testing publication test route...');
    const testResponse = await axios.get(`${API_BASE}/api/publications/test`);
    console.log('✓ Publication test route:', testResponse.data);
    
    // Test upload endpoint (GET - should return info)
    console.log('\n3. Testing upload endpoint info...');
    const uploadInfoResponse = await axios.get(`${API_BASE}/api/publications/upload-pdf`);
    console.log('✓ Upload endpoint info:', uploadInfoResponse.data);
    
    console.log('\n✅ All endpoints are accessible!');
    
  } catch (error) {
    console.error('\n❌ Error testing endpoints:');
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
      console.error('URL:', error.config?.url);
    } else if (error.request) {
      console.error('No response received:', error.message);
    } else {
      console.error('Error:', error.message);
    }
  }
}

// Run the test
testPublicationEndpoints();