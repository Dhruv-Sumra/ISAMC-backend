import Gallery from '../models/galleryModel.js';

// Get all galleries
export const getGalleries = async (req, res) => {
  try {
    const galleries = await Gallery.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: galleries });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Add a new gallery
export const addGallery = async (req, res) => {
  const { title, images } = req.body;
  if (!title || !images || !Array.isArray(images) || images.length === 0) {
    return res.status(400).json({ success: false, message: 'Title and images are required' });
  }
  try {
    const newGallery = new Gallery({ title, images });
    await newGallery.save();
    res.status(201).json({ success: true, data: newGallery });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};

// Delete a gallery
export const deleteGallery = async (req, res) => {
  try {
    const gallery = await Gallery.findById(req.params.id);
    if (!gallery) {
      return res.status(404).json({ success: false, message: 'Gallery not found' });
    }
    await gallery.remove();
    res.status(200).json({ success: true, message: 'Gallery removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server Error' });
  }
}; 