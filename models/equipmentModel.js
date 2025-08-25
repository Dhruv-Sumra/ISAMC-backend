import mongoose from 'mongoose';

const equipmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  image: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  useCase: {
    type: String,
    required: false
  }
}, {
  timestamps: true
});

const Equipment = mongoose.models.Equipment || mongoose.model('Equipment', equipmentSchema);

export default Equipment;