# FinTech Investment Platform - Deployment Guide

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 18+ (for local development)
- Python 3.9+ (for ML service)
- PostgreSQL 14+ (for production)
- Redis (for caching)

### Environment Setup

1. **Clone and setup:**
```bash
git clone <repository-url>
cd fintech-investment-platform
cp env.example .env
```

2. **Configure environment variables:**
Edit `.env` file with your configuration:
```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/fintech_platform"

# JWT Secrets (generate strong secrets)
JWT_SECRET="your-super-secret-jwt-key-here"
JWT_REFRESH_SECRET="your-super-secret-refresh-key-here"

# External APIs
ALPHA_VANTAGE_API_KEY="your-alpha-vantage-api-key"
FINNHUB_API_KEY="your-finnhub-api-key"
NEWS_API_KEY="your-news-api-key"
```

### Docker Deployment (Recommended)

1. **Start all services:**
```bash
docker-compose up -d
```

2. **Initialize database:**
```bash
docker-compose exec backend npx prisma migrate dev
docker-compose exec backend npx prisma generate
```

3. **Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- ML Service: http://localhost:5000
- Database: localhost:5432

### Manual Deployment

#### Backend Setup
```bash
cd backend
npm install
npx prisma migrate dev
npx prisma generate
npm run build
npm start
```

#### Frontend Setup
```bash
cd frontend
npm install
npm run build
npm start
```

#### ML Service Setup
```bash
cd ml-service
pip install -r requirements.txt
python src/app.py
```

## 🔧 Configuration

### Database Configuration
- **Development**: Uses Docker PostgreSQL
- **Production**: Configure external PostgreSQL instance
- **Migrations**: Run `npx prisma migrate deploy` for production

### External API Keys
1. **Alpha Vantage**: Get free API key at https://www.alphavantage.co/
2. **Finnhub**: Get free API key at https://finnhub.io/
3. **News API**: Get free API key at https://newsapi.org/

### Security Configuration
- Change default JWT secrets
- Configure CORS origins
- Set up SSL certificates for production
- Configure rate limiting

## 📊 Monitoring

### Health Checks
- Backend: `GET /health`
- Frontend: `GET /api/health`
- ML Service: `GET /health`

### Logs
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f backend
docker-compose logs -f frontend
docker-compose logs -f ml-service
```

## 🔒 Production Deployment

### Security Checklist
- [ ] Change all default passwords and secrets
- [ ] Configure SSL/TLS certificates
- [ ] Set up proper CORS origins
- [ ] Configure rate limiting
- [ ] Set up monitoring and alerting
- [ ] Configure backup strategy
- [ ] Set up log aggregation

### Performance Optimization
- [ ] Configure Redis for caching
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up load balancing
- [ ] Configure auto-scaling

### Environment Variables for Production
```bash
NODE_ENV=production
DATABASE_URL=postgresql://user:pass@prod-db:5432/fintech_platform
REDIS_URL=redis://prod-redis:6379
JWT_SECRET=super-secure-production-secret
FRONTEND_URL=https://your-domain.com
```

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check DATABASE_URL format
   - Ensure PostgreSQL is running
   - Verify network connectivity

2. **API Key Issues**
   - Verify API keys are valid
   - Check rate limits
   - Ensure proper permissions

3. **Build Issues**
   - Clear node_modules and reinstall
   - Check Node.js version compatibility
   - Verify all dependencies are installed

4. **Docker Issues**
   - Check Docker daemon is running
   - Verify docker-compose version
   - Check port conflicts

### Debug Mode
```bash
# Enable debug logging
DEBUG=* npm run dev

# Run with verbose output
docker-compose up --build -v
```

## 📈 Scaling

### Horizontal Scaling
- Use load balancer (nginx/HAProxy)
- Scale backend services: `docker-compose up --scale backend=3`
- Use managed database service
- Implement Redis clustering

### Vertical Scaling
- Increase container resources
- Optimize database queries
- Implement caching strategies
- Use CDN for static assets

## 🔄 Updates and Maintenance

### Application Updates
```bash
# Pull latest changes
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose up --build -d

# Run migrations
docker-compose exec backend npx prisma migrate deploy
```

### Database Maintenance
```bash
# Backup database
docker-compose exec postgres pg_dump -U fintech_user fintech_platform > backup.sql

# Restore database
docker-compose exec -T postgres psql -U fintech_user fintech_platform < backup.sql
```

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review application logs
3. Check GitHub issues
4. Contact the development team

## 🎯 Next Steps

After successful deployment:
1. Set up monitoring (Prometheus/Grafana)
2. Configure CI/CD pipeline
3. Set up automated backups
4. Implement security scanning
5. Set up performance monitoring
