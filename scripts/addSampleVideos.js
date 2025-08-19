import mongoose from 'mongoose';
import Video from '../models/videoModel.js';
import dotenv from 'dotenv';

dotenv.config();

const sampleVideos = [
  {
    title: "Introduction to Additive Manufacturing",
    description: "Learn the basics of additive manufacturing and 3D printing technologies.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Additive Manufacturing",
    author: "ISAMC Team",
    tags: ["3D Printing", "Manufacturing", "Technology"],
    isFeatured: true,
    isActive: true,
    order: 1
  },
  {
    title: "Advanced 3D Printing Techniques",
    description: "Explore advanced techniques in 3D printing for industrial applications.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "3D Printing",
    author: "Dr. Smith",
    tags: ["Advanced", "Industrial", "Techniques"],
    isFeatured: false,
    isActive: true,
    order: 2
  },
  {
    title: "Research in Additive Manufacturing",
    description: "Latest research developments in the field of additive manufacturing.",
    youtubeUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    category: "Research",
    author: "Research Team",
    tags: ["Research", "Innovation", "Development"],
    isFeatured: true,
    isActive: true,
    order: 3
  }
];

async function addSampleVideos() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing videos (optional)
    await Video.deleteMany({});
    console.log('Cleared existing videos');

    // Add sample videos
    const videos = await Video.insertMany(sampleVideos);
    console.log(`Added ${videos.length} sample videos`);

    videos.forEach(video => {
      console.log(`- ${video.title} (${video.category})`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample videos:', error);
    process.exit(1);
  }
}

addSampleVideos();