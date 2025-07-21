import mongoose from "mongoose";

const newsletterSchema = new mongoose.Schema({
  subject: {
    type: String,
    required: true,
    trim: true
  },
  content: {
    type: String,
    required: true
  },
  sentAt: {
    type: Date,
    default: null
  },
  isSent: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Newsletter = mongoose.models.Newsletter || mongoose.model('Newsletter', newsletterSchema);

export default Newsletter; 