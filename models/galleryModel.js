import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  images: {
    type: [String],
    required: true
  }
}, {
  timestamps: true
});

const Gallery = mongoose.models.Gallery || mongoose.model('Gallery', gallerySchema);

export default Gallery; 