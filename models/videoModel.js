import mongoose from 'mongoose';

// Add the poster image field to your video schema
const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true,
    trim: true
  },
  youtubeUrl: {
    type: String,
    required: true,
    trim: true
  },
  thumbnailUrl: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    enum: ['Additive Manufacturing', '3D Printing', 'Research', 'Tutorial', 'Industry News', 'Case Study', 'Other'],
    default: 'Other'
  },
  duration: {
    type: String,
    trim: true
  },
  author: {
    type: String,
    trim: true
  },
  publishDate: {
    type: Date,
    default: Date.now
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [{
    type: String,
    trim: true
  }],
  viewCount: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  order: {
    type: Number,
    default: 0
  },
  posterImage: {
    type: String,
    default: ''
  },
}, {
  timestamps: true
});

// Index for better search performance
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ category: 1, isActive: 1, isFeatured: 1 });

// Method to extract YouTube video ID from URL
videoSchema.methods.getYouTubeId = function() {
  const url = this.youtubeUrl;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

// Method to generate thumbnail URL
videoSchema.methods.getThumbnailUrl = function() {
  const videoId = this.getYouTubeId();
  if (videoId) {
    return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  }
  return this.thumbnailUrl || '/default-video-thumbnail.jpg';
};

// Method to generate embed URL
videoSchema.methods.getEmbedUrl = function() {
  const videoId = this.getYouTubeId();
  if (videoId) {
    return `https://www.youtube.com/embed/${videoId}`;
  }
  return null;
};

const Video = mongoose.model('Video', videoSchema);

export default Video;