import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import compression from "compression";
import { errorMiddleware } from "./error/error.js";
import { helmetConfig, generalLimiter, authLimiter, contactLimiter } from "./middleware/security.js";
import logger from "./config/logger.js";
import authRouter from './routes/authRouter.js';
import userRouter from "./routes/userRoutes.js";
import dbRoutes from "./routes/cards.js"; 
import contactRouter from "./routes/contactRoutes.js";
import dbConnection from "./database/dbConnection.js";
import paperRoutes from './routes/paperRoutes.js';
import adminRoutes from './routes/adminRoutes.js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Initialize database connection
dbConnection();

// Trust proxy (important for rate limiting behind proxy/load balancer)
app.set('trust proxy', 1);

// Security middleware
app.use(helmetConfig);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// CORS configuration (simplified for debugging)
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Logging middleware
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message) => logger.info(message.trim())
  }
}));

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

// Apply rate limiting
// app.use('/api/auth', authLimiter);
// app.use('/api/contact', contactLimiter);
// app.use('/api', generalLimiter);

// Root route (must come before other routes)
app.get('/', (req, res) => {
  res.json({ success: true, message: 'ISAMC Backend API is running.' });
});

// API Routes
app.use("/api/v1/db", dbRoutes);
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/contact", contactRouter);
app.use("/api/paper", paperRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler for undefined routes (must come after all valid routes)
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found', path: req.originalUrl });
});

// Error handling middleware (must be last)
app.use(errorMiddleware);

export default app;
