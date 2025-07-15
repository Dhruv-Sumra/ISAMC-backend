import mongoose from "mongoose";
import logger from "../config/logger.js";

const dbConnection = async () => {
  try {
    const options = {
      dbName: process.env.DB_NAME || "isamc_db",
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4, // Use IPv4, skip trying IPv6
      retryWrites: true,
      w: 'majority'
    };

    await mongoose.connect(process.env.MONGODB_URI, options);
    logger.info("Connected to database successfully");
    
    // Connection event listeners
    mongoose.connection.on('error', (err) => {
      logger.error('MongoDB connection error:', err);
    });
    
    mongoose.connection.on('disconnected', () => {
      logger.warn('MongoDB disconnected');
    });
    
    mongoose.connection.on('reconnected', () => {
      logger.info('MongoDB reconnected');
    });
    
  } catch (err) {
    logger.error('Database connection failed:', err);
    
    // Retry connection after 5 seconds
    setTimeout(() => {
      logger.info('Retrying database connection...');
      dbConnection();
    }, 5000);
  }
};

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    logger.info('Database connection closed through app termination');
    process.exit(0);
  } catch (err) {
    logger.error('Error during database disconnection:', err);
    process.exit(1);
  }
});

export default dbConnection;
