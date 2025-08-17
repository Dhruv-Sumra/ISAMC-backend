import { DB } from "../models/dbSchema.js";
import logger from "../config/logger.js";

class OtherEventController {
  // Create a new other event
  static async createEvent(req, res) {
    try {
      const eventData = req.body;
      
      // Validate required fields
      if (!eventData.title || !eventData.body || !eventData.date || !eventData.location) {
        return res.status(400).json({
          success: false,
          message: "Missing required fields: title, body, date, location"
        });
      }

      // Add the event to the otherEvents array
      const result = await DB.findOneAndUpdate(
        {},
        { $push: { otherEvents: eventData } },
        { new: true, upsert: true }
      );

      logger.info('Other event created', { 
        eventTitle: eventData.title,
        adminId: req.user?._id 
      });

      res.status(201).json({
        success: true,
        message: "Other event created successfully",
        data: eventData
      });
    } catch (error) {
      logger.error('Error creating other event', { 
        error: error.message,
        adminId: req.user?._id 
      });
      res.status(500).json({
        success: false,
        message: "Error creating other event",
        error: error.message
      });
    }
  }

  // Update an existing other event
  static async updateEvent(req, res) {
    try {
      const { id } = req.params;
      const updateData = req.body;

      // Find and update the specific event in the otherEvents array
      const result = await DB.findOneAndUpdate(
        { "otherEvents._id": id },
        { $set: { "otherEvents.$": updateData } },
        { new: true }
      );

      if (!result) {
        return res.status(404).json({
          success: false,
          message: "Other event not found"
        });
      }

      logger.info('Other event updated', { 
        eventId: id,
        adminId: req.user?._id 
      });

      res.status(200).json({
        success: true,
        message: "Other event updated successfully",
        data: result
      });
    } catch (error) {
      logger.error('Error updating other event', { 
        error: error.message,
        eventId: req.params.id,
        adminId: req.user?._id 
      });
      res.status(500).json({
        success: false,
        message: "Error updating other event",
        error: error.message
      });
    }
  }

  // Get all other events
  static async getAllEvents(req, res) {
    try {
      const document = await DB.findOne({});
      const otherEvents = document?.otherEvents || [];

      res.status(200).json({
        success: true,
        data: otherEvents
      });
    } catch (error) {
      logger.error('Error fetching other events', { 
        error: error.message,
        adminId: req.user?._id 
      });
      res.status(500).json({
        success: false,
        message: "Error fetching other events",
        error: error.message
      });
    }
  }

  // Delete an other event
  static async deleteEvent(req, res) {
    try {
      const { id } = req.params;

      const result = await DB.findOneAndUpdate(
        {},
        { $pull: { otherEvents: { _id: id } } },
        { new: true }
      );

      logger.info('Other event deleted', { 
        eventId: id,
        adminId: req.user?._id 
      });

      res.status(200).json({
        success: true,
        message: "Other event deleted successfully"
      });
    } catch (error) {
      logger.error('Error deleting other event', { 
        error: error.message,
        eventId: req.params.id,
        adminId: req.user?._id 
      });
      res.status(500).json({
        success: false,
        message: "Error deleting other event",
        error: error.message
      });
    }
  }
}

export default OtherEventController;
