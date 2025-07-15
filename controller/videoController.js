import { DB } from '../models/dbSchema.js';

// Get all videos (public) - fetch from admin panel data
export const getAllVideos = async (req, res) => {
  try {
    const { category, search, featured, limit = 20, page = 1 } = req.query;
    
    console.log('Video search request:', { category, search, featured, limit, page });
    
    // Fetch videos from the admin panel data (DB collection)
    let dbData;
    try {
      dbData = await DB.findOne({});
    } catch (dbError) {
      console.error('Error fetching DB data:', dbError);
      dbData = null;
    }
    
    const videos = dbData?.videos || [];
    
    console.log('Videos from admin panel:', videos.length);
    console.log('Sample video data:', videos.length > 0 ? {
      title: videos[0].title,
      youtubeUrl: videos[0].youtubeUrl,
      category: videos[0].category,
      description: videos[0].description,
      tags: videos[0].tags
    } : 'No videos found');
    
    // Filter videos based on query parameters
    let filteredVideos = videos.filter(video => {
      try {
        // Filter by category
        if (category && category !== 'all' && video.category !== category) {
          return false;
        }
        
        // Filter by featured
        if (featured === 'true' && !video.isFeatured) {
          return false;
        }
        
        // Search functionality
        if (search) {
          const searchLower = search.toLowerCase();
          const titleMatch = video.title && video.title.toLowerCase().includes(searchLower);
          const descriptionMatch = video.description && video.description.toLowerCase().includes(searchLower);
          const tagsMatch = video.tags && Array.isArray(video.tags) && video.tags.some(tag => tag.toLowerCase().includes(searchLower));
          
          return titleMatch || descriptionMatch || tagsMatch;
        }
        
        return true;
      } catch (filterError) {
        console.error('Error filtering video:', filterError, video);
        return false;
      }
    });
    
    // Sort videos
    filteredVideos.sort((a, b) => {
      try {
        if (a.order !== b.order) {
          return (a.order || 0) - (b.order || 0);
        }
        return new Date(b.publishDate || b.createdAt || 0) - new Date(a.publishDate || a.createdAt || 0);
      } catch (sortError) {
        console.error('Error sorting videos:', sortError);
        return 0;
      }
    });
    
    // Pagination
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;
    const paginatedVideos = filteredVideos.slice(skip, skip + limitNum);
    
    console.log('Filtered videos:', filteredVideos.length);
    console.log('Paginated videos:', paginatedVideos.length);
    console.log('Pagination params:', { pageNum, limitNum, skip });
    
    res.json({
      success: true,
      data: paginatedVideos,
      pagination: {
        current: pageNum,
        total: Math.ceil(filteredVideos.length / limitNum),
        hasNext: skip + paginatedVideos.length < filteredVideos.length,
        hasPrev: pageNum > 1
      }
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
};

// Get single video by ID (public)
export const getVideoById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findOne({ _id: id, isActive: true });
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    // Increment view count
    video.viewCount += 1;
    await video.save();
    
    res.json({
      success: true,
      data: video
    });
  } catch (error) {
    console.error('Error fetching video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch video'
    });
  }
};

// Get video categories (public)
export const getVideoCategories = async (req, res) => {
  try {
    const dbData = await DB.findOne({});
    const videos = dbData?.videos || [];
    
    // Extract unique categories from videos
    const categories = [...new Set(videos.map(video => video.category).filter(Boolean))];
    
    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch categories'
    });
  }
};

// Admin: Get all videos (including inactive)
export const adminGetAllVideos = async (req, res) => {
  try {
    const videos = await Video.find()
      .sort({ order: 1, createdAt: -1 })
      .select('-__v');
    
    res.json({
      success: true,
      data: videos
    });
  } catch (error) {
    console.error('Error fetching videos:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch videos'
    });
  }
};

// Admin: Add new video
export const addVideo = async (req, res) => {
  try {
    const {
      title,
      description,
      youtubeUrl,
      category,
      author,
      tags,
      isFeatured,
      order
    } = req.body;
    
    // Validate required fields
    if (!title || !description || !youtubeUrl || !category) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, YouTube URL, and category are required'
      });
    }
    
    // Validate YouTube URL
    const youtubeId = extractYouTubeId(youtubeUrl);
    if (!youtubeId) {
      return res.status(400).json({
        success: false,
        message: 'Invalid YouTube URL'
      });
    }
    
    const video = new Video({
      title,
      description,
      youtubeUrl,
      category,
      author,
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      isFeatured: isFeatured || false,
      isActive: true, // Explicitly set to true
      order: order || 0
    });
    
    await video.save();
    
    res.status(201).json({
      success: true,
      message: 'Video added successfully',
      data: video
    });
  } catch (error) {
    console.error('Error adding video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add video'
    });
  }
};

// Admin: Update video
export const updateVideo = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    // If YouTube URL is being updated, validate it
    if (updateData.youtubeUrl) {
      const youtubeId = extractYouTubeId(updateData.youtubeUrl);
      if (!youtubeId) {
        return res.status(400).json({
          success: false,
          message: 'Invalid YouTube URL'
        });
      }
    }
    
    // Convert tags string to array if provided
    if (updateData.tags && typeof updateData.tags === 'string') {
      updateData.tags = updateData.tags.split(',').map(tag => tag.trim());
    }
    
    const video = await Video.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Video updated successfully',
      data: video
    });
  } catch (error) {
    console.error('Error updating video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video'
    });
  }
};

// Admin: Delete video
export const deleteVideo = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findByIdAndDelete(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    res.json({
      success: true,
      message: 'Video deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting video:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete video'
    });
  }
};

// Admin: Toggle video status
export const toggleVideoStatus = async (req, res) => {
  try {
    const { id } = req.params;
    
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({
        success: false,
        message: 'Video not found'
      });
    }
    
    video.isActive = !video.isActive;
    await video.save();
    
    res.json({
      success: true,
      message: `Video ${video.isActive ? 'activated' : 'deactivated'} successfully`,
      data: video
    });
  } catch (error) {
    console.error('Error toggling video status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to toggle video status'
    });
  }
};

// Admin: Update video order
export const updateVideoOrder = async (req, res) => {
  try {
    const { videos } = req.body; // Array of { id, order }
    
    if (!Array.isArray(videos)) {
      return res.status(400).json({
        success: false,
        message: 'Videos array is required'
      });
    }
    
    const updatePromises = videos.map(({ id, order }) =>
      Video.findByIdAndUpdate(id, { order }, { new: true })
    );
    
    await Promise.all(updatePromises);
    
    res.json({
      success: true,
      message: 'Video order updated successfully'
    });
  } catch (error) {
    console.error('Error updating video order:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update video order'
    });
  }
};

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
} 