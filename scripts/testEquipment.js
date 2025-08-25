import Equipment from '../models/equipmentModel.js';
import dbConnection from '../database/dbConnection.js';

const testEquipment = async () => {
  try {
    // Connect to database
    await dbConnection();
    
    // Test data
    const sampleEquipment = {
      name: "3D Printer - Ultimaker S3",
      image: "https://images.unsplash.com/photo-1581833971358-2c8b550f87b3?w=500",
      description: "Professional 3D printer for rapid prototyping and small-scale production with dual extrusion capabilities.",
      useCase: "Ideal for creating complex geometries, functional prototypes, and educational demonstrations in additive manufacturing research."
    };

    // Create equipment
    const equipment = new Equipment(sampleEquipment);
    await equipment.save();
    console.log('✓ Sample equipment created:', equipment.name);

    // Fetch all equipment
    const allEquipment = await Equipment.find();
    console.log('✓ Total equipment count:', allEquipment.length);

    console.log('Equipment test completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Equipment test failed:', error);
    process.exit(1);
  }
};

testEquipment();