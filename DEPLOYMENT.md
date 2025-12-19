# BookMyShow - Deployment Guide

This guide provides comprehensive instructions for deploying the BookMyShow application to production.

## Table of Contents
- [Prerequisites](#prerequisites)
- [Environment Setup](#environment-setup)
- [Deployment Options](#deployment-options)
- [Security Checklist](#security-checklist)
- [Monitoring & Maintenance](#monitoring--maintenance)

---

## Prerequisites

### Required Software
- **Node.js**: v18.0.0 or higher
- **npm**: v9.0.0 or higher
- **MongoDB**: v5.0 or higher (MongoDB Atlas recommended)
- **Git**: For version control

### Production Server Requirements
- **RAM**: Minimum 1GB (2GB+ recommended)
- **Storage**: At least 1GB free space
- **OS**: Linux (Ubuntu 20.04+ recommended), Windows Server, or macOS

---

## Environment Setup

### 1. Clone the Repository
```bash
git clone <your-repository-url>
cd BookMyShow
```

### 2. Install Dependencies
```bash
npm install --production
```

### 3. Configure Environment Variables

Copy the example environment file and update with your production values:
```bash
cp .env.example .env
```

Edit `.env` with your production configuration:
```env
# Server Configuration
PORT=4000
NODE_ENV=production

# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/bookmyshow?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=your-super-secure-random-string-min-32-chars
JWT_EXPIRE=7d

# CORS Configuration (optional)
CORS_ORIGIN=https://yourdomain.com

# Logging
LOG_LEVEL=info
```

**Important Security Notes:**
- Generate a strong JWT_SECRET (use: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`)
- Never commit `.env` file to version control
- Use environment-specific configurations for different stages (dev, staging, production)

### 4. Database Setup

If using MongoDB Atlas:
1. Create a new cluster at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a database user with appropriate permissions
3. Whitelist your server's IP address (or use 0.0.0.0/0 for any IP, but less secure)
4. Copy the connection string and update `MONGODB_URI` in `.env`

### 5. Seed Initial Data (Optional)
```bash
npm run seed
```

---

## Deployment Options

### Option 1: Direct Node.js Deployment (Simple)

#### Start the Server
```bash
npm run start:prod
```

#### Keep Server Running with nohup
```bash
nohup npm run start:prod > server.log 2>&1 &
```

#### Stop the Server
```bash
# Find the process ID
ps aux | grep node

# Kill the process
kill <PID>
```

### Option 2: PM2 Deployment (Recommended for Production)

PM2 is a production process manager for Node.js applications with built-in load balancer, automatic restarts, and monitoring.

#### Install PM2 Globally
```bash
npm install -g pm2
```

#### Start Application with PM2
```bash
npm run pm2:start
```

#### Useful PM2 Commands
```bash
# View application status
pm2 status

# Monitor logs in real-time
npm run pm2:logs
# or
pm2 logs bookmyshow-api

# Monitor CPU and memory usage
npm run pm2:monit

# Restart application
npm run pm2:restart

# Stop application
npm run pm2:stop

# Remove application from PM2
npm run pm2:delete

# Save PM2 process list (survives server restart)
pm2 save

# Setup PM2 to start on system boot
pm2 startup
# Follow the instructions printed by the command
```

#### PM2 Configuration
The application uses `ecosystem.config.cjs` for PM2 configuration. Key features:
- **Cluster mode**: Uses all available CPU cores
- **Auto-restart**: Automatically restarts if the app crashes
- **Memory limit**: Restarts if memory exceeds 500MB
- **Log management**: Centralized logging in `logs/` directory

### Option 3: Docker Deployment

#### Create Dockerfile
Create a file named `Dockerfile` in the project root:
```dockerfile
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create logs directory
RUN mkdir -p logs

# Expose port
EXPOSE 4000

# Set environment to production
ENV NODE_ENV=production

# Start application
CMD ["npm", "run", "start:prod"]
```

#### Create .dockerignore
Create a file named `.dockerignore`:
```
node_modules
npm-debug.log
.env
.git
.gitignore
README.md
*.md
logs
```

#### Build and Run Docker Container
```bash
# Build image
docker build -t bookmyshow-api .

# Run container
docker run -d \
  --name bookmyshow \
  -p 4000:4000 \
  --env-file .env \
  --restart unless-stopped \
  bookmyshow-api

# View logs
docker logs bookmyshow

# Stop container
docker stop bookmyshow

# Remove container
docker rm bookmyshow
```

### Option 4: Cloud Platform Deployment

#### Heroku
```bash
# Install Heroku CLI
# Login to Heroku
heroku login

# Create new app
heroku create your-app-name

# Set environment variables
heroku config:set NODE_ENV=production
heroku config:set MONGODB_URI=your-mongodb-uri
heroku config:set JWT_SECRET=your-jwt-secret

# Deploy
git push heroku main

# View logs
heroku logs --tail
```

#### DigitalOcean App Platform
1. Connect your GitHub/GitLab repository
2. Configure environment variables in the dashboard
3. Set build command: `npm install`
4. Set run command: `npm run start:prod`
5. Deploy

#### AWS EC2
1. Launch an EC2 instance (Ubuntu 20.04 recommended)
2. SSH into the instance
3. Install Node.js and npm
4. Clone your repository
5. Follow "Direct Node.js" or "PM2" deployment steps
6. Configure security groups to allow traffic on port 4000
7. (Optional) Set up Nginx as reverse proxy

#### Railway, Render, or Fly.io
These platforms offer similar deployment workflows:
1. Connect your Git repository
2. Set environment variables
3. Deploy automatically on push

---

## Security Checklist

Before deploying to production, ensure you've completed these security measures:

### Essential Security Steps
- [ ] Change default `JWT_SECRET` to a strong random string (32+ characters)
- [ ] Set `NODE_ENV=production` in environment variables
- [ ] Use HTTPS/TLS for all connections
- [ ] Configure CORS to allow only trusted domains
- [ ] Enable MongoDB authentication and use strong passwords
- [ ] Restrict MongoDB network access (whitelist specific IPs)
- [ ] Never commit `.env` or sensitive files to Git
- [ ] Keep dependencies updated (`npm audit` and `npm audit fix`)
- [ ] Implement rate limiting for API endpoints (consider packages like `express-rate-limit`)
- [ ] Add input validation and sanitization
- [ ] Set secure HTTP headers (consider `helmet` package)

### Recommended Security Enhancements
```bash
# Install security packages
npm install helmet express-rate-limit express-mongo-sanitize xss-clean
```

Add to your `src/app.js`:
```javascript
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import mongoSanitize from 'express-mongo-sanitize';
import xss from 'xss-clean';

// Security headers
app.use(helmet());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
app.use('/api/', limiter);

// Data sanitization against NoSQL injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());
```

---

## Monitoring & Maintenance

### Health Check
The application provides a health check endpoint:
```bash
curl http://your-domain:4000/health
```

### Logging
- Application logs are managed by Morgan
- In production, logs use 'combined' format
- PM2 logs are stored in `logs/` directory
- Monitor logs regularly for errors and security issues

### Monitoring Tools (Optional)
- **PM2 Plus**: Advanced monitoring for PM2 (https://pm2.io)
- **New Relic**: Application performance monitoring
- **Datadog**: Infrastructure and application monitoring
- **Sentry**: Error tracking and monitoring

### Backup Strategy
1. **Database Backups**:
   - MongoDB Atlas: Enable automatic backups
   - Self-hosted: Use `mongodump` for regular backups
   ```bash
   mongodump --uri="mongodb+srv://..." --out=/path/to/backup
   ```

2. **Application Backups**:
   - Keep Git repository up to date
   - Tag releases: `git tag -a v1.0.0 -m "Release version 1.0.0"`

### Updates and Maintenance
```bash
# Check for security vulnerabilities
npm audit

# Fix vulnerabilities
npm audit fix

# Update dependencies
npm update

# Deploy updates with PM2
git pull
npm install
npm run pm2:restart
```

### Performance Optimization
- Enable gzip compression (add `compression` package)
- Use CDN for static assets
- Implement caching strategies (Redis)
- Optimize database queries (add indexes)
- Monitor response times and optimize slow endpoints

---

## Troubleshooting

### Common Issues

**Server won't start**
- Check if port 4000 is already in use: `netstat -ano | findstr :4000` (Windows) or `lsof -i :4000` (Linux/Mac)
- Verify all environment variables are set correctly
- Check MongoDB connection string

**MongoDB connection errors**
- Verify MONGODB_URI is correct
- Check network access in MongoDB Atlas (IP whitelist)
- Ensure database user has proper permissions

**Application crashes**
- Check logs: `pm2 logs` or `docker logs bookmyshow`
- Look for uncaught exceptions or unhandled promise rejections
- Verify all required dependencies are installed

**Performance issues**
- Monitor memory usage: `pm2 monit`
- Check database query performance
- Review application logs for slow endpoints
- Consider scaling horizontally (multiple instances)

---

## Support & Resources

- **Application Documentation**: See [README.md](README.md)
- **API Documentation**: Access `/api` endpoint
- **MongoDB Atlas Docs**: https://docs.atlas.mongodb.com/
- **PM2 Documentation**: https://pm2.keymetrics.io/docs/
- **Node.js Best Practices**: https://github.com/goldbergyoni/nodebestpractices

---

## Post-Deployment Checklist

After deployment, verify:
- [ ] Application is accessible at the correct URL
- [ ] Health check endpoint returns 200 OK
- [ ] Database connection is working
- [ ] User registration and login work correctly
- [ ] All API endpoints are functional
- [ ] CORS is configured correctly
- [ ] Logs are being written properly
- [ ] SSL/TLS certificate is valid (if using HTTPS)
- [ ] Monitoring is set up and working
- [ ] Backup strategy is implemented

---

## Version History

- **v0.1.0** - Initial deployment guide

---

**Note**: Always test your deployment in a staging environment before deploying to production. Keep your production environment variables secure and never share them publicly.
