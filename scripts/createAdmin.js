#!/usr/bin/env node

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import readline from 'readline';
import userModel from '../models/userModel.js';

// Load environment variables
dotenv.config();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const question = (query) => new Promise((resolve) => rl.question(query, resolve));

async function createFirstAdmin() {
  try {
    console.log('🚀 ISAMC Admin Setup Script');
    console.log('============================\n');

    // Connect to database
    await mongoose.connect(process.env.MONGO_URI, {
      dbName: process.env.DB_NAME || "isamc_db"
    });
    console.log('✅ Connected to database\n');

    // Check if any admin exists
    const existingAdmin = await userModel.findOne({ role: 'admin' });
    if (existingAdmin) {
      console.log('⚠️  An admin user already exists:');
      console.log(`   Email: ${existingAdmin.email}`);
      console.log(`   Name: ${existingAdmin.name}\n`);
      
      const overwrite = await question('Do you want to create another admin? (y/N): ');
      if (overwrite.toLowerCase() !== 'y' && overwrite.toLowerCase() !== 'yes') {
        console.log('❌ Admin creation cancelled.');
        process.exit(0);
      }
    }

    // Get admin details
    console.log('Please provide admin details:\n');
    
    const name = await question('Admin Name: ');
    if (!name.trim()) {
      console.log('❌ Name is required');
      process.exit(1);
    }

    const email = await question('Admin Email: ');
    const emailRegex = /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      console.log('❌ Valid email is required');
      process.exit(1);
    }

    // Check if email already exists
    const existingUser = await userModel.findOne({ email });
    if (existingUser) {
      console.log('⚠️  User with this email already exists');
      const updateExisting = await question('Update existing user to admin? (y/N): ');
      
      if (updateExisting.toLowerCase() === 'y' || updateExisting.toLowerCase() === 'yes') {
        existingUser.role = 'admin';
        await existingUser.save();
        
        console.log('\\n✅ User updated to admin successfully!');
        console.log(`   Name: ${existingUser.name}`);
        console.log(`   Email: ${existingUser.email}`);
        console.log(`   Role: ${existingUser.role}`);
        
        process.exit(0);
      } else {
        console.log('❌ Admin creation cancelled');
        process.exit(1);
      }
    }

    const password = await question('Admin Password (min 8 characters): ');
    if (!password || password.length < 8) {
      console.log('❌ Password must be at least 8 characters');
      process.exit(1);
    }

    // Create admin user
    const adminUser = new userModel({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password, // Will be hashed by the schema pre-save hook
      role: 'admin',
      isAccountVerified: true // Auto-verify admin
    });

    await adminUser.save();

    console.log('\\n🎉 Admin user created successfully!');
    console.log('=====================================');
    console.log(`Name: ${adminUser.name}`);
    console.log(`Email: ${adminUser.email}`);
    console.log(`Role: ${adminUser.role}`);
    console.log(`Verified: ${adminUser.isAccountVerified}`);
    console.log(`Created: ${adminUser.createdAt}`);
    
    console.log('\\n📝 Important Notes:');
    console.log('- The admin can now log in using the provided credentials');
    console.log('- Admin has access to all admin routes');
    console.log('- You can add more admin emails to ADMIN_EMAILS env variable');
    console.log('- Admin can promote other users through the admin panel');

  } catch (error) {
    console.error('❌ Error creating admin:', error.message);
    process.exit(1);
  } finally {
    rl.close();
    await mongoose.disconnect();
    console.log('\\n🔌 Database disconnected');
  }
}

// Handle script termination
process.on('SIGINT', async () => {
  console.log('\\n\\n❌ Script terminated by user');
  rl.close();
  if (mongoose.connection.readyState === 1) {
    await mongoose.disconnect();
  }
  process.exit(0);
});

// Run the script
createFirstAdmin().catch(error => {
  console.error('❌ Unexpected error:', error);
  process.exit(1);
});
