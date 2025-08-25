import Equipment from '../models/equipmentModel.js';

export const getEquipment = async (req, res) => {
  try {
    const equipment = await Equipment.find().sort({ createdAt: -1 });
    res.json({ success: true, data: equipment });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addEquipment = async (req, res) => {
  try {
    // Accept both frontend field names (title, body, img) and backend names (name, description, image)
    const { 
      title, 
      name, 
      body, 
      description, 
      img, 
      image, 
      useCase 
    } = req.body;
    
    // Map frontend fields to backend fields
    const equipmentData = {
      name: title || name,
      image: img || image,
      description: body || description,
      useCase: useCase || ''
    };
    
    // Validation
    if (!equipmentData.name || !equipmentData.image || !equipmentData.description) {
      return res.status(400).json({ 
        success: false, 
        message: 'Name/Title, image, and description are required' 
      });
    }

    const equipment = new Equipment(equipmentData);
    await equipment.save();
    
    // Return data with both field naming conventions for frontend compatibility
    const responseData = {
      ...equipment.toObject(),
      title: equipment.name,
      body: equipment.description,
      img: equipment.image
    };
    
    res.status(201).json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error adding equipment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Map frontend fields to backend fields
    const { 
      title, 
      name, 
      body, 
      description, 
      img, 
      image, 
      useCase 
    } = req.body;
    
    const updateData = {
      name: title || name,
      image: img || image,
      description: body || description,
      useCase: useCase || ''
    };

    // Remove undefined values
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    const equipment = await Equipment.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    // Return data with both field naming conventions
    const responseData = {
      ...equipment.toObject(),
      title: equipment.name,
      body: equipment.description,
      img: equipment.image
    };
    
    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error updating equipment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteEquipment = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findByIdAndDelete(id);
    
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    res.json({ success: true, message: 'Equipment deleted successfully' });
  } catch (error) {
    console.error('Error deleting equipment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Additional helper function to get single equipment (optional)
export const getEquipmentById = async (req, res) => {
  try {
    const { id } = req.params;
    const equipment = await Equipment.findById(id);
    
    if (!equipment) {
      return res.status(404).json({ success: false, message: 'Equipment not found' });
    }
    
    // Return data with both field naming conventions
    const responseData = {
      ...equipment.toObject(),
      title: equipment.name,
      body: equipment.description,
      img: equipment.image
    };
    
    res.json({ success: true, data: responseData });
  } catch (error) {
    console.error('Error fetching equipment:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};
