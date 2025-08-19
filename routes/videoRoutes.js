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
  updateVideoOrder,
  adminGetAllVideoResources,
  addVideoResource,
  updateVideoResource,
  deleteVideoResource
} from '../controller/videoController.js';
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

// Video resources admin routes
videoRouter.get('/admin/video-resources', userAuth, adminAuth, adminGetAllVideoResources);
videoRouter.post('/admin/video-resources', userAuth, adminAuth, addVideoResource);
videoRouter.put('/admin/video-resources/:id', userAuth, adminAuth, updateVideoResource);
videoRouter.delete('/admin/video-resources/:id', userAuth, adminAuth, deleteVideoResource);

export default videoRouter; 