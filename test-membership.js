import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { sendMembershipApplication } from './controller/contactController.js';

dotenv.config();

// Connect to database
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    process.exit(1);
  }
};

const testMembershipApplication = async () => {
  console.log('🧪 Testing Membership Application Process\n');
  
  await connectDB();
  
  // Create mock request and response objects
  const mockReq = {
    body: {
      fullName: 'John Doe Test',
      email: 'john.doe.test@example.com',
      phone: '+91 9876543210',
      gender: 'Male',
      dateOfBirth: '1990-05-15',
      institute: 'Test University',
      designation: 'Research Scientist',
      expertise: 'Materials Engineering, Composite Materials',
      linkedinProfile: 'https://linkedin.com/in/johndoe',
      membershipType: 'Student Membership',
      tierTitle: 'Student Membership',
      tierPrice: '1000',
      tierDuration: 'Annual',
      notes: 'This is a test membership application.'
    }
  };

  const mockRes = {
    statusCode: 200,
    responseData: null,
    status: function(code) {
      this.statusCode = code;
      return this;
    },
    json: function(data) {
      this.responseData = data;
      console.log(`Response Status: ${this.statusCode}`);
      console.log('Response Data:', JSON.stringify(data, null, 2));
      return this;
    }
  };

  try {
    console.log('📋 Submitting test membership application...');
    console.log('Application Details:');
    console.log(`   Name: ${mockReq.body.fullName}`);
    console.log(`   Email: ${mockReq.body.email}`);
    console.log(`   Membership Type: ${mockReq.body.membershipType}`);
    console.log(`   Price: ₹${mockReq.body.tierPrice}`);
    console.log();

    await sendMembershipApplication(mockReq, mockRes);

    if (mockRes.statusCode === 200) {
      console.log('✅ Test membership application submitted successfully!');
      
      // Now check if data was saved
      console.log('\n🔍 Checking database...');
      const Membership = (await import('./models/membershipModel.js')).default;
      const User = (await import('./models/userModel.js')).default;
      
      const testUser = await User.findOne({ email: mockReq.body.email });
      if (testUser) {
        console.log('✅ Test user created in database:', testUser.name);
        
        const testMembership = await Membership.findOne({ userId: testUser._id });
        if (testMembership) {
          console.log('✅ Test membership created in database:', testMembership.membershipType);
          console.log('   Status:', testMembership.status);
          console.log('   Amount: ₹' + testMembership.amount);
        } else {
          console.log('❌ Test membership not found in database');
        }
      } else {
        console.log('❌ Test user not found in database');
      }
    } else {
      console.log('❌ Test membership application failed');
    }

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

testMembershipApplication();
