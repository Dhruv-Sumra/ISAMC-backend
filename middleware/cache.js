import NodeCache from 'node-cache';

// Create a cache instance with default TTL of 30 minutes
const cache = new NodeCache({ 
  stdTTL: 1800, // 30 minutes in seconds
  checkperiod: 600, // Check for expired keys every 10 minutes
  useClones: false // Don't clone objects for better performance
});

// Cache middleware
export const cacheMiddleware = (duration = 1800) => {
  return (req, res, next) => {
    // Skip caching for non-GET requests
    if (req.method !== 'GET') {
      return next();
    }

    // Generate cache key based on URL and query parameters
    const cacheKey = `${req.originalUrl || req.url}`;
    
    // Check if we have cached data
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      console.log('Cache hit for:', cacheKey);
      return res.json(cachedData);
    }

    // Store original send function
    const originalSend = res.json;

    // Override res.json to cache the response
    res.json = function(data) {
      // Cache the response data
      cache.set(cacheKey, data, duration);
      console.log('Cached response for:', cacheKey);
      
      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

// Cache invalidation middleware
export const invalidateCache = (patterns = []) => {
  return (req, res, next) => {
    // Store original send function
    const originalSend = res.json;

    // Override res.json to invalidate cache after successful response
    res.json = function(data) {
      // Invalidate cache patterns
      patterns.forEach(pattern => {
        const keys = cache.keys();
        const matchingKeys = keys.filter(key => key.includes(pattern));
        matchingKeys.forEach(key => {
          cache.del(key);
          console.log('Invalidated cache for:', key);
        });
      });

      // Call original send function
      return originalSend.call(this, data);
    };

    next();
  };
};

// Manual cache operations
export const cacheUtils = {
  // Get cache statistics
  getStats: () => {
    return cache.getStats();
  },

  // Clear all cache
  clearAll: () => {
    cache.flushAll();
    console.log('All cache cleared');
  },

  // Clear cache by pattern
  clearByPattern: (pattern) => {
    const keys = cache.keys();
    const matchingKeys = keys.filter(key => key.includes(pattern));
    matchingKeys.forEach(key => {
      cache.del(key);
      console.log('Cleared cache for:', key);
    });
    return matchingKeys.length;
  },

  // Get cache keys
  getKeys: () => {
    return cache.keys();
  },

  // Set cache manually
  set: (key, data, ttl = 1800) => {
    cache.set(key, data, ttl);
  },

  // Get cache manually
  get: (key) => {
    return cache.get(key);
  },

  // Delete cache manually
  del: (key) => {
    return cache.del(key);
  }
};

// Cache health check
export const cacheHealthCheck = () => {
  const stats = cache.getStats();
  return {
    status: 'healthy',
    stats: {
      hits: stats.hits,
      misses: stats.misses,
      keys: stats.keys,
      ksize: stats.ksize,
      vsize: stats.vsize
    },
    hitRate: stats.hits / (stats.hits + stats.misses) * 100
  };
};

export default cache; 