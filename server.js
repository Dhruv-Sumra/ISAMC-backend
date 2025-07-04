import app from './app.js';
import logger from './config/logger.js';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    logger.info(`🚀 Server running on port ${PORT}`);
    logger.info(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`📊 Health check available at: http://localhost:${PORT}/health`);
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
    logger.info(`📡 Received ${signal}. Starting graceful shutdown...`);
    
    server.close(() => {
        logger.info('💤 HTTP server closed.');
        
        // Close database connections, cleanup, etc.
        process.exit(0);
    });
    
    // Force close server after 30 seconds
    setTimeout(() => {
        logger.error('⚠️ Could not close connections in time, forcefully shutting down');
        process.exit(1);
    }, 30000);
};

// Listen for termination signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Handle server errors
server.on('error', (error) => {
    if (error.code === 'EADDRINUSE') {
        logger.error(`❌ Port ${PORT} is already in use`);
        process.exit(1);
    } else {
        logger.error('❌ Server error:', error);
        process.exit(1);
    }
});
