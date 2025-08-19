import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Video from '../models/videoModel.js';
import { DB } from '../models/dbSchema.js';

dotenv.config();

const testVideos = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Test 1: Create a sample video
    console.log('\n1. Creating sample video...');
    const sampleVideo = new Video({
      title: 'Test Video - Introduction to Manufacturing',
      description: 'This is a test video to demonstrate the video management system.',
      youtubeUrl: 'https://www.youtube.com/watch?v=9bZkp7q19f0',
      category: 'Tutorial',
      author: 'Test Author',
      tags: ['test', 'manufacturing', 'tutorial'],
      isFeatured: true,
      isActive: true,
      order: 1
    });

    await sampleVideo.save();
    console.log('✓ Sample video created:', sampleVideo.title);

    // Test 2: Fetch all videos
    console.log('\n2. Fetching all videos...');
    const allVideos = await Video.find({});
    console.log(`✓ Found ${allVideos.length} videos`);
    allVideos.forEach(video => {
      console.log(`  - ${video.title} (${video.category})`);
    });

    // Test 3: Test video methods
    console.log('\n3. Testing video methods...');
    const testVideo = allVideos[0];
    console.log('YouTube ID:', testVideo.getYouTubeId());
    console.log('Thumbnail URL:', testVideo.getThumbnailUrl());
    console.log('Embed URL:', testVideo.getEmbedUrl());

    // Test 4: Check admin panel data structure
    console.log('\n4. Checking admin panel data...');
    const dbData = await DB.findOne({});
    if (dbData && dbData.videos) {
      console.log(`✓ Admin panel has ${dbData.videos.length} videos`);
    } else {
      console.log('! No videos in admin panel data');
    }

    // Test 5: Add video to admin panel data
    console.log('\n5. Adding video to admin panel...');
    const adminVideo = {
      title: 'Admin Panel Test Video',
      description: 'Test video added through admin panel structure',
      youtubeUrl: 'https://www.youtube.com/watch?v=kJQP7kiw5Fk',
      category: 'Test',
      author: 'Admin',
      tags: ['admin', 'test'],
      isFeatured: false,
      isActive: true,
      order: 2,
      createdAt: new Date().toISOString()
    };

    await DB.findOneAndUpdate(
      {},
      { $push: { videos: adminVideo } },
      { new: true, upsert: true }
    );
    console.log('✓ Video added to admin panel');

    // Test 6: Verify admin panel update
    const updatedDbData = await DB.findOne({});
    if (updatedDbData && updatedDbData.videos) {
      console.log(`✓ Admin panel now has ${updatedDbData.videos.length} videos`);
    }

    console.log('\n✅ All tests completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
};

// Run the test
testVideos();