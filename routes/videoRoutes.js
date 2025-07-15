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
import adminAuth from '../middleware/adminAuth.js';
import { cacheMiddleware, invalidateCache } from '../middleware/cache.js';

const videoRouter = express.Router();

// Public routes (with caching)
videoRouter.get('/videos', cacheMiddleware(900), getAllVideos); // Cache for 15 minutes
videoRouter.get('/videos/categories', cacheMiddleware(1800), getVideoCategories); // Cache for 30 minutes
videoRouter.get('/videos/:id', cacheMiddleware(900), getVideoById); // Cache for 15 minutes

// Admin routes (protected with cache invalidation)
videoRouter.get('/admin/videos', adminAuth, adminGetAllVideos);
videoRouter.post('/admin/videos', adminAuth, invalidateCache(['/videos']), addVideo);
videoRouter.put('/admin/videos/:id', adminAuth, invalidateCache(['/videos']), updateVideo);
videoRouter.delete('/admin/videos/:id', adminAuth, invalidateCache(['/videos']), deleteVideo);
videoRouter.patch('/admin/videos/:id/toggle', adminAuth, invalidateCache(['/videos']), toggleVideoStatus);
videoRouter.put('/admin/videos/order', adminAuth, invalidateCache(['/videos']), updateVideoOrder);

export default videoRouter; 