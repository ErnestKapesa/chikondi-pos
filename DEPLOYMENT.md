# Deployment Guide - Chikondi POS

## Quick Start (Development)

### 1. Frontend Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Access at: http://localhost:5173

### 2. Backend Setup
```bash
# Navigate to server
cd server

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start server
npm start
```
Access at: http://localhost:3001

## Production Deployment

### Option 1: Netlify (Frontend) + Railway (Backend)

#### Frontend on Netlify
1. Push code to GitHub
2. Connect to Netlify
3. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Environment variables:
   - `VITE_API_URL=https://your-backend.railway.app`

#### Backend on Railway
1. Create new project on Railway
2. Add CouchDB service
3. Add Node.js service
4. Environment variables:
   - `PORT=3001`
   - `COUCHDB_URL=<from Railway CouchDB>`
   - `NODE_ENV=production`
5. Deploy from GitHub

### Option 2: Vercel (Frontend) + Heroku (Backend)

#### Frontend on Vercel
```bash
npm install -g vercel
vercel --prod
```

#### Backend on Heroku
```bash
# Install Heroku CLI
heroku create chikondi-pos-api

# Add CouchDB addon
heroku addons:create cloudant:lite

# Deploy
git subtree push --prefix server heroku main
```

### Option 3: Self-Hosted (VPS)

#### Requirements
- Ubuntu 20.04+ VPS
- Node.js 18+
- CouchDB 3.x
- Nginx

#### Setup Script
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install CouchDB
echo "deb https://apache.jfrog.io/artifactory/couchdb-deb/ focal main" | sudo tee /etc/apt/sources.list.d/couchdb.list
curl -L https://couchdb.apache.org/repo/keys.asc | sudo apt-key add -
sudo apt update
sudo apt install -y couchdb

# Install Nginx
sudo apt install -y nginx

# Clone repository
git clone https://github.com/yourusername/chikondi-pos.git
cd chikondi-pos

# Build frontend
npm install
npm run build

# Setup backend
cd server
npm install
cp .env.example .env
# Edit .env with your settings

# Install PM2
sudo npm install -g pm2

# Start backend
pm2 start index.js --name chikondi-api
pm2 startup
pm2 save
```

#### Nginx Configuration
```nginx
# /etc/nginx/sites-available/chikondi-pos
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        root /path/to/chikondi-pos/dist;
        try_files $uri $uri/ /index.html;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable site:
```bash
sudo ln -s /etc/nginx/sites-available/chikondi-pos /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

#### SSL with Let's Encrypt
```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com
```

## Cloud Database Options

### Option 1: IBM Cloudant (Free Tier)
1. Sign up at https://www.ibm.com/cloud/cloudant
2. Create database instance
3. Get connection URL
4. Update `COUCHDB_URL` in .env

### Option 2: Self-Hosted CouchDB
```bash
# Docker setup
docker run -d --name couchdb \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  -p 5984:5984 \
  -v /opt/couchdb/data:/opt/couchdb/data \
  couchdb:latest
```

## Environment Variables

### Frontend (.env)
```
VITE_API_URL=https://api.your-domain.com
```

### Backend (.env)
```
PORT=3001
COUCHDB_URL=http://admin:password@localhost:5984
NODE_ENV=production
```

## Testing Deployment

### Frontend Checklist
- [ ] PWA installable on mobile
- [ ] Service worker caching works
- [ ] Offline functionality works
- [ ] All routes accessible
- [ ] API calls work

### Backend Checklist
- [ ] Health endpoint responds: `/api/health`
- [ ] Sync endpoint works: `/api/sync`
- [ ] CouchDB connection successful
- [ ] CORS configured correctly

## Performance Optimization

### Frontend
```bash
# Analyze bundle size
npm run build -- --mode analyze

# Optimize images
npm install -D vite-plugin-imagemin
```

### Backend
- Enable gzip compression
- Add rate limiting
- Implement caching headers
- Use CDN for static assets

## Monitoring

### Frontend
- Google Analytics
- Sentry for error tracking
- Lighthouse CI for performance

### Backend
- PM2 monitoring: `pm2 monit`
- CouchDB Fauxton: `http://localhost:5984/_utils`
- Log aggregation with Winston

## Backup Strategy

### Automated Backups
```bash
# Backup script
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
curl -X GET http://admin:password@localhost:5984/chikondi_sales/_all_docs?include_docs=true > backup_sales_$DATE.json
curl -X GET http://admin:password@localhost:5984/chikondi_inventory/_all_docs?include_docs=true > backup_inventory_$DATE.json
curl -X GET http://admin:password@localhost:5984/chikondi_expenses/_all_docs?include_docs=true > backup_expenses_$DATE.json
```

Add to crontab:
```bash
0 2 * * * /path/to/backup.sh
```

## Troubleshooting

### PWA Not Installing
- Check manifest.json is accessible
- Verify HTTPS (required for PWA)
- Check service worker registration
- Clear browser cache

### Sync Not Working
- Check network connectivity
- Verify API URL in frontend
- Check CORS headers
- Verify CouchDB credentials

### Performance Issues
- Enable compression
- Optimize images
- Reduce bundle size
- Use lazy loading
- Implement pagination

## Security Checklist

- [ ] HTTPS enabled
- [ ] CouchDB admin password changed
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Input validation on backend
- [ ] SQL injection prevention
- [ ] XSS protection
- [ ] Regular security updates

## Scaling Considerations

### Horizontal Scaling
- Load balancer (Nginx/HAProxy)
- Multiple backend instances
- CouchDB clustering
- Redis for session management

### Vertical Scaling
- Increase server resources
- Optimize database queries
- Implement caching
- Use CDN

## Support & Maintenance

### Regular Tasks
- Weekly: Check logs for errors
- Monthly: Update dependencies
- Quarterly: Security audit
- Yearly: Performance review

### Update Process
```bash
# Frontend
git pull origin main
npm install
npm run build

# Backend
cd server
git pull origin main
npm install
pm2 restart chikondi-api
```

## Cost Estimates

### Minimal Setup (Free Tier)
- Frontend: Netlify/Vercel (Free)
- Backend: Railway (Free tier)
- Database: IBM Cloudant (Free tier)
- Total: $0/month

### Production Setup
- VPS: DigitalOcean Droplet ($6/month)
- Domain: Namecheap ($12/year)
- SSL: Let's Encrypt (Free)
- Backup: Backblaze B2 ($0.005/GB)
- Total: ~$7/month

### Enterprise Setup
- VPS: DigitalOcean ($24/month)
- Managed CouchDB: IBM Cloudant ($75/month)
- CDN: Cloudflare Pro ($20/month)
- Monitoring: Datadog ($15/month)
- Total: ~$134/month
