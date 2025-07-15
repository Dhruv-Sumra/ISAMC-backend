import express from 'express';
import { cacheUtils, cacheHealthCheck } from '../middleware/cache.js';
import adminAuth from '../middleware/adminAuth.js';

const cacheRouter = express.Router();

// Get cache statistics
cacheRouter.get('/cache/stats', adminAuth, (req, res) => {
  try {
    const stats = cacheUtils.getStats();
    const health = cacheHealthCheck();
    
    res.json({
      success: true,
      data: {
        stats,
        health,
        keys: cacheUtils.getKeys()
      }
    });
  } catch (error) {
    console.error('Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache statistics'
    });
  }
});

// Clear all cache
cacheRouter.delete('/cache/clear', adminAuth, (req, res) => {
  try {
    cacheUtils.clearAll();
    res.json({
      success: true,
      message: 'All cache cleared successfully'
    });
  } catch (error) {
    console.error('Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache'
    });
  }
});

// Clear cache by pattern
cacheRouter.delete('/cache/clear/:pattern', adminAuth, (req, res) => {
  try {
    const { pattern } = req.params;
    const clearedCount = cacheUtils.clearByPattern(pattern);
    
    res.json({
      success: true,
      message: `Cleared ${clearedCount} cache entries matching pattern: ${pattern}`
    });
  } catch (error) {
    console.error('Error clearing cache by pattern:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache by pattern'
    });
  }
});

// Get cache health
cacheRouter.get('/cache/health', adminAuth, (req, res) => {
  try {
    const health = cacheHealthCheck();
    res.json({
      success: true,
      data: health
    });
  } catch (error) {
    console.error('Error getting cache health:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache health'
    });
  }
});

export default cacheRouter; 