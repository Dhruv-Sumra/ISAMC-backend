# ISAMC Backend - Production Deployment Guide

## 🚀 Production Optimizations Applied

### Security Enhancements
- ✅ Helmet.js for security headers
- ✅ Rate limiting (5 auth attempts/15min, 100 general requests/15min)
- ✅ Input validation and sanitization
- ✅ CORS properly configured
- ✅ Environment variable validation
- ✅ SQL injection prevention
- ✅ XSS protection

### Performance Optimizations
- ✅ Response compression
- ✅ Database connection pooling
- ✅ Connection retry logic
- ✅ Graceful shutdown handling
- ✅ Memory leak prevention

### Monitoring & Logging
- ✅ Winston logger with file rotation
- ✅ Error tracking with stack traces
- ✅ Request logging with Morgan
- ✅ Health check endpoint
- ✅ Unhandled error catching

### Database Optimizations
- ✅ Connection pooling (max 10 connections)
- ✅ Connection timeout management
- ✅ Retry logic for failed connections
- ✅ Graceful disconnection

## 📋 Pre-Deployment Checklist

### Environment Setup
- [ ] Set NODE_ENV=production
- [ ] Configure all environment variables from `.env.example`
- [ ] Set strong JWT secrets (minimum 32 characters)
- [ ] Configure email service (Gmail with app password)
- [ ] Set up MongoDB Atlas or production database
- [ ] Configure CORS origins for production domain

### Security Configuration
```bash
# Required Environment Variables
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/
DB_NAME=isamc_production
JWT_SECRET=your-super-secure-jwt-secret-key-here-minimum-32-characters
JWT_REFRESH_SECRET=your-super-secure-refresh-secret-key-here-minimum-32-characters
FRONTEND_URL=https://yourdomain.com
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-specific-password
```

### Database Setup
- [ ] MongoDB Atlas cluster configured
- [ ] Database user created with appropriate permissions
- [ ] IP whitelist configured (0.0.0.0/0 for cloud deployment)
- [ ] Backup strategy implemented

## 🌐 Deployment Options

### Option 1: Vercel (Recommended)
```bash
# Install dependencies
npm install

# Deploy to Vercel
vercel --prod

# Set environment variables in Vercel dashboard
```

### Option 2: Traditional VPS/Server
```bash
# Clone repository
git clone <repository-url>
cd backend

# Install dependencies
npm install

# Create production environment file
cp .env.example .env
# Edit .env with production values

# Install PM2 for process management
npm install -g pm2

# Start application with PM2
pm2 start ecosystem.config.js --env production

# Setup PM2 to start on boot
pm2 startup
pm2 save
```

### Option 3: Docker Deployment
```dockerfile
# Dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 5000

USER node

CMD ["npm", "start"]
```

## 📊 Monitoring Setup

### Health Checks
- Health endpoint: `GET /health`
- Returns server status, uptime, and environment info

### Log Monitoring
```bash
# View combined logs
npm run logs

# View error logs only
npm run logs:error

# For production servers
tail -f logs/combined.log
tail -f logs/error.log
```

### Performance Monitoring
Consider integrating:
- New Relic for application monitoring
- Sentry for error tracking
- MongoDB Atlas monitoring for database performance

## 🔧 Production Maintenance

### Regular Tasks
- [ ] Monitor log files for errors
- [ ] Check database performance
- [ ] Update dependencies regularly
- [ ] Monitor resource usage
- [ ] Backup database regularly

### Security Updates
- [ ] Update Node.js version
- [ ] Update npm packages
- [ ] Rotate JWT secrets periodically
- [ ] Monitor for security vulnerabilities

### Performance Optimization
- [ ] Monitor response times
- [ ] Optimize database queries
- [ ] Check memory usage
- [ ] Monitor rate limiting effectiveness

## 🚨 Troubleshooting

### Common Issues

#### Database Connection Failures
```bash
# Check MongoDB Atlas status
# Verify connection string
# Check IP whitelist
# Monitor connection logs
```

#### High Memory Usage
```bash
# Monitor with PM2
pm2 monit

# Check for memory leaks in logs
grep -i "memory" logs/error.log
```

#### Rate Limiting Issues
```bash
# Check rate limit logs
grep -i "rate limit" logs/combined.log

# Adjust limits in middleware/security.js if needed
```

### Emergency Procedures
1. Check health endpoint: `/health`
2. Review error logs: `logs/error.log`
3. Restart application: `pm2 restart backend`
4. Monitor database status
5. Check external dependencies (email service, etc.)

## 📈 Scaling Considerations

### Horizontal Scaling
- Use load balancer (Nginx, AWS ALB)
- Implement session storage (Redis)
- Database connection pooling
- CDN for static assets

### Vertical Scaling
- Monitor CPU and memory usage
- Upgrade server resources as needed
- Optimize database queries
- Implement caching strategies

## 🔒 Security Best Practices

1. **Never** commit `.env` files
2. Use environment variables for all secrets
3. Regularly update dependencies
4. Monitor for security vulnerabilities
5. Implement proper error handling
6. Use HTTPS in production
7. Regularly rotate secrets and passwords
8. Monitor authentication logs for suspicious activity

## 📞 Support & Maintenance

For production issues:
1. Check health endpoint
2. Review application logs
3. Monitor database performance
4. Verify external service status
5. Check server resources

Remember to keep this documentation updated as you make changes to the system!
