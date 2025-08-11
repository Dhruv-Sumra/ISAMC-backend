import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Membership from './models/membershipModel.js';
import User from './models/userModel.js';
import sendCpanelEmail from './utils/cpanelEmail.js';

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

const diagnose = async () => {
  console.log('🔍 ISAMC Membership System Diagnostic\n');
  
  await connectDB();
  
  try {
    // Check membership count
    const totalMemberships = await Membership.countDocuments();
    console.log(`📊 Total Memberships: ${totalMemberships}`);
    
    if (totalMemberships > 0) {
      const activeMemberships = await Membership.countDocuments({ status: 'active' });
      const pendingMemberships = await Membership.countDocuments({ status: 'pending' });
      const expiredMemberships = await Membership.countDocuments({ status: 'expired' });
      
      console.log(`   - Active: ${activeMemberships}`);
      console.log(`   - Pending: ${pendingMemberships}`);
      console.log(`   - Expired: ${expiredMemberships}`);
      
      // Get recent memberships
      const recentMemberships = await Membership.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('userId', 'name email');
      
      console.log('\n📝 Recent Memberships:');
      recentMemberships.forEach((membership, index) => {
        console.log(`   ${index + 1}. ${membership.userId?.name || 'N/A'} (${membership.userId?.email || 'N/A'}) - ${membership.status} - ${membership.membershipType}`);
      });
    } else {
      console.log('   No memberships found in database');
    }
    
    // Check users count
    const totalUsers = await User.countDocuments();
    console.log(`\n👥 Total Users: ${totalUsers}`);
    
    if (totalUsers > 0) {
      const recentUsers = await User.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .select('name email role createdAt');
      
      console.log('\n👤 Recent Users:');
      recentUsers.forEach((user, index) => {
        console.log(`   ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
      });
    }
    
    // Test email functionality
    console.log('\n📧 Testing Email Configuration...');
    try {
      await sendCpanelEmail({
        to: [process.env.CPANEL_EMAIL_USER],
        subject: 'Diagnostic Test Email',
        text: 'This is a diagnostic test email from the membership system.',
        html: '<h2>Diagnostic Test</h2><p>This is a diagnostic test email from the membership system.</p>'
      });
      console.log('✅ Email test successful');
    } catch (error) {
      console.error('❌ Email test failed:', error.message);
    }
    
    // Check environment variables
    console.log('\n🔧 Environment Check:');
    const requiredEnvVars = [
      'MONGODB_URI',
      'CPANEL_SMTP_HOST',
      'CPANEL_EMAIL_USER',
      'JWT_SECRET'
    ];
    
    let allEnvPresent = true;
    requiredEnvVars.forEach(envVar => {
      if (process.env[envVar]) {
        console.log(`   ✅ ${envVar}: Present`);
      } else {
        console.log(`   ❌ ${envVar}: Missing`);
        allEnvPresent = false;
      }
    });
    
    if (allEnvPresent) {
      console.log('\n🎉 System Status: All systems operational');
    } else {
      console.log('\n⚠️  System Status: Configuration issues detected');
    }
    
  } catch (error) {
    console.error('❌ Diagnostic failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n🔌 Database connection closed');
    process.exit(0);
  }
};

diagnose();
