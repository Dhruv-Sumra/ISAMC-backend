import express from 'express';
import {
  getAllVideos,
  getVideoById,
  getVideoCategories,
  adminGetAllVideos,
  addVideo,
  updateVideo,
  deleteVideo,
  toggleVideoStatus,
  updateVideoOrder
} from '../controller/videoController.js';
import Video from '../models/videoModel.js';
import userAuth from '../middleware/userAuth.js';
import adminAuth from '../middleware/adminAuth.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const videoRouter = express.Router();

// Public routes (with caching)
videoRouter.get('/videos', cacheMiddleware(900), getAllVideos); // Cache for 15 minutes
videoRouter.get('/videos/categories', cacheMiddleware(1800), getVideoCategories); // Cache for 30 minutes
videoRouter.get('/videos/:id', cacheMiddleware(900), getVideoById); // Cache for 15 minutes

// Admin routes (protected with cache invalidation)
videoRouter.get('/admin/videos', userAuth, adminAuth, adminGetAllVideos);
videoRouter.post('/admin/videos', userAuth, adminAuth, invalidateCache(['/videos']), addVideo);
videoRouter.put('/admin/videos/:id', userAuth, adminAuth, invalidateCache(['/videos']), updateVideo);
videoRouter.delete('/admin/videos/:id', userAuth, adminAuth, invalidateCache(['/videos']), deleteVideo);
videoRouter.patch('/admin/videos/:id/toggle', userAuth, adminAuth, invalidateCache(['/videos']), toggleVideoStatus);
videoRouter.put('/admin/videos/order', userAuth, adminAuth, invalidateCache(['/videos']), updateVideoOrder);

// Initialize sample videos route
videoRouter.post('/admin/videos/init-sample', userAuth, adminAuth, async (req, res) => {
  try {
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

    const videos = await Video.insertMany(sampleVideos);
    
    res.status(201).json({
      success: true,
      message: `Added ${videos.length} sample videos successfully`,
      data: videos
    });
  } catch (error) {
    console.error('Error adding sample videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add sample videos',
      error: error.message
    });
  }
});

export default videoRouter; 