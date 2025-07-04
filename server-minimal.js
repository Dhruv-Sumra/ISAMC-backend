import app from './app-minimal.js';

const PORT = process.env.PORT || 4000;

const server = app.listen(PORT, () => {
    console.log(`🚀 Minimal server running on port ${PORT}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down minimal server...');
    server.close(() => {
        console.log('Minimal server closed.');
        process.exit(0);
    });
}); 