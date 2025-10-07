# Render.com Deployment Guide - Chikondi POS Backend

## 🚀 Why Render.com?

- ✅ **No credit card required** for free tier
- ✅ **750 hours/month free** (enough for development)
- ✅ **PostgreSQL database** included (free tier)
- ✅ **Auto-deploy from GitHub**
- ✅ **Custom domains** (free)
- ✅ **Automatic HTTPS**
- ✅ **Better performance** than Heroku free tier
- ✅ **No sleeping** on paid plans ($7/month)

---

## 📋 Prerequisites

1. **Render Account** - Sign up at https://render.com (free, no credit card)
2. **GitHub Repository** - Your code (already done ✅)
3. **Simple Backend** - We'll use file-based storage (no external database needed)

---

## 🛠️ Step 1: Prepare Backend for Render

### 1.1 Switch to Simple Backend

Let's use the simple file-based backend instead of CouchDB:

```bash
# In your server directory
cd server

# Backup original (optional)
cp index.js index-couchdb-backup.js

# Use the simple version
cp index-simple.js index.js
```

### 1.2 Update package.json

Make sure your `server/package.json` has the correct scripts:

```json
{
  "name": "chikondi-pos-server",
  "version": "1.0.0",
  "description": "Cloud sync backend for Chikondi POS",
  "main": "index.js",
  "scripts": {
    "start": "node index.js",
    "dev": "nodemon index.js",
    "build": "echo 'No build step required'"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5"
  },
  "engines": {
    "node": ">=18.0.0"
  }
}
```

### 1.3 Create render.yaml (Optional)

Create `render.yaml` in your root directory for easier configuration:

```yaml
services:
  - type: web
    name: chikondi-pos-backend
    env: node
    rootDir: ./server
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
```

---

## 🚀 Step 2: Deploy to Render

### 2.1 Sign Up for Render

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (no credit card required)
4. Authorize Render to access your repositories

### 2.2 Create Web Service

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Connect your GitHub account if not already connected
4. Find and select your **"chikondi-pos"** repository
5. Click **"Connect"**

### 2.3 Configure Service

Fill in the deployment settings:

```
Name: chikondi-pos-backend
Root Directory: server
Environment: Node
Region: Oregon (US West) or closest to you
Branch: main

Build Command: npm install
Start Command: npm start

Instance Type: Free
```

### 2.4 Set Environment Variables

In the **Environment Variables** section, add:

```
NODE_ENV = production
PORT = 10000
```

### 2.5 Deploy

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Wait for deployment to complete (2-5 minutes)
4. You'll get a URL like: `https://chikondi-pos-backend.onrender.com`

---

## ✅ Step 3: Test Your Deployment

### 3.1 Test Health Endpoint

```bash
# Replace with your actual Render URL
curl https://chikondi-pos-backend.onrender.com/api/health

# Should return:
{
  "status": "ok",
  "message": "Chikondi POS Backend is running",
  "timestamp": "2025-01-...",
  "uptime": 123,
  "version": "1.0.0"
}
```

### 3.2 Test API Root

```bash
# Check API documentation
curl https://chikondi-pos-backend.onrender.com/

# Should return API info
```

### 3.3 View Logs

1. In Render dashboard
2. Go to your service
3. Click **"Logs"** tab
4. Should see: "🚀 Chikondi POS Backend Server Started"

---

## 🔗 Step 4: Connect Frontend

### 4.1 Update Frontend Environment

In your main project directory (not server), create/update `.env`:

```bash
VITE_API_URL=https://chikondi-pos-backend.onrender.com
```

Replace with your actual Render URL.

### 4.2 Test Sync

```bash
# Restart frontend dev server
npm run dev

# Open app → Settings → Sync Now
# Should work! ✅
```

### 4.3 Verify Data Storage

```bash
# Check data summary
curl https://chikondi-pos-backend.onrender.com/api/data/summary

# Should show synced data counts
```

---

## 📊 Render Free Tier Details

### What You Get (Free):
- ✅ **750 hours/month** (about 25 days)
- ✅ **512 MB RAM**
- ✅ **Custom domains**
- ✅ **Automatic HTTPS**
- ✅ **Git-based deployment**
- ✅ **Environment variables**

### Limitations:
- ⚠️ **Spins down after 15 minutes** of inactivity
- ⚠️ **Takes ~30 seconds** to spin back up
- ⚠️ **Limited to 750 hours/month**

### For Production:
- **Starter Plan ($7/month)**: No spinning down, always available
- **Standard Plan ($25/month)**: More resources, better performance

---

## 🔄 Step 5: Enable Auto-Deploy

### 5.1 Configure Auto-Deploy

1. In your Render service dashboard
2. Go to **"Settings"** tab
3. Find **"Auto-Deploy"** section
4. Enable **"Auto-Deploy"** for **main** branch
5. Click **"Save Changes"**

Now every time you push to GitHub:
1. Render detects changes
2. Automatically rebuilds
3. Deploys new version
4. Zero downtime!

### 5.2 Test Auto-Deploy

```bash
# Make a small change to test
echo "console.log('Auto-deploy test');" >> server/index.js

# Commit and push
git add .
git commit -m "Test auto-deploy"
git push origin main

# Check Render dashboard - should start new deployment
```

---

## 🐛 Troubleshooting

### Issue 1: Build Failed

**Check Build Logs:**
1. Render dashboard → Your service → Logs
2. Look for error messages during build

**Common Fixes:**
```bash
# Ensure package.json is correct
cd server
cat package.json

# Test locally first
npm install
npm start
```

### Issue 2: Service Won't Start

**Check Start Logs:**
1. Look for errors in the logs
2. Verify start command is correct

**Fix:**
```bash
# In render.yaml or dashboard settings
Start Command: npm start
# or
Start Command: node index.js
```

### Issue 3: App Spins Down (Free Tier)

**Expected Behavior:**
- Free tier spins down after 15 minutes
- Takes ~30 seconds to wake up
- First request after sleeping will be slow

**Solutions:**
1. **Upgrade to Starter ($7/month)** - No spinning down
2. **Use UptimeRobot** (free) - Ping every 14 minutes
3. **Accept the limitation** - Fine for development

### Issue 4: CORS Errors

**Already configured in your code, but if needed:**

```javascript
// In server/index.js
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

---

## 📈 Monitoring Your App

### Render Dashboard Features:

1. **Metrics**: CPU, Memory, Request volume
2. **Logs**: Real-time application logs
3. **Events**: Deployment history
4. **Settings**: Environment variables, domains

### Useful Monitoring URLs:

```bash
# Health check (bookmark this)
https://your-app.onrender.com/api/health

# Data summary
https://your-app.onrender.com/api/data/summary

# API documentation
https://your-app.onrender.com/
```

### Set Up UptimeRobot (Optional):

1. Go to https://uptimerobot.com (free)
2. Create account
3. Add monitor:
   - **Type**: HTTP(s)
   - **URL**: `https://your-app.onrender.com/api/health`
   - **Interval**: 14 minutes (keeps app awake)
4. Save

---

## 🔐 Security Best Practices

### Environment Variables

```bash
# In Render dashboard, add these if needed:
NODE_ENV=production
API_SECRET=your-secret-key
ALLOWED_ORIGINS=https://your-frontend.com
```

### HTTPS Only (Already Enabled)

Render automatically provides HTTPS for all apps.

### Rate Limiting (Optional)

```bash
# Install rate limiting
npm install express-rate-limit

# Add to server/index.js
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 💾 Data Persistence

### How Data is Stored:

```
server/
├── data/
│   ├── sales.json      # All sales records
│   ├── inventory.json  # All inventory changes
│   └── expenses.json   # All expense records
└── index.js           # Express server
```

### Data Backup:

```bash
# Download your data anytime
curl https://your-app.onrender.com/api/data/sales > sales-backup.json
curl https://your-app.onrender.com/api/data/inventory > inventory-backup.json
curl https://your-app.onrender.com/api/data/expenses > expenses-backup.json
```

### Data Persistence Notes:

- ✅ **Data persists** between deployments
- ✅ **Automatic backups** by Render
- ⚠️ **File system is ephemeral** on free tier
- 💡 **Upgrade to paid plan** for persistent disk

---

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Simple backend code ready
- [ ] package.json has correct scripts
- [ ] Code tested locally
- [ ] Code pushed to GitHub

### Deployment:
- [ ] Render account created
- [ ] Web service created
- [ ] Root directory set to "server"
- [ ] Environment variables configured
- [ ] Service deployed successfully

### Post-Deployment:
- [ ] Health endpoint tested
- [ ] Frontend .env updated
- [ ] Sync functionality tested
- [ ] Auto-deploy enabled
- [ ] Monitoring set up (optional)

---

## 📊 Complete Setup Summary

### Backend (Render):
```
Service: chikondi-pos-backend
URL: https://chikondi-pos-backend.onrender.com
Health: https://chikondi-pos-backend.onrender.com/api/health
Sync: https://chikondi-pos-backend.onrender.com/api/sync
Data: https://chikondi-pos-backend.onrender.com/api/data/summary
```

### Frontend (Local):
```
Dev: http://localhost:5173
API: https://chikondi-pos-backend.onrender.com
```

---

## 🎯 Next Steps

### 1. Deploy Frontend

**Option A: Netlify (Recommended)**
```bash
npm run build
# Drag dist/ folder to netlify.com/drop
```

**Option B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option C: Render (Same Platform)**
1. New + → Static Site
2. Connect GitHub repo
3. Build command: `npm run build`
4. Publish directory: `dist`

### 2. Update Frontend Environment

In your frontend deployment, set:
```bash
VITE_API_URL=https://chikondi-pos-backend.onrender.com
```

### 3. Test End-to-End

1. Open deployed frontend
2. Create account with PIN
3. Add products to inventory
4. Record some sales
5. Add expenses
6. Go to Settings → Sync Now
7. Check: `https://your-backend.onrender.com/api/data/summary`

---

## 💡 Pro Tips

### 1. Keep App Awake (Free Tier)
```bash
# Use UptimeRobot to ping every 14 minutes
# URL to ping: https://your-app.onrender.com/api/health
```

### 2. Monitor Your Data
```bash
# Bookmark this URL
https://your-app.onrender.com/api/data/summary
```

### 3. Custom Domain (Free)
1. Render dashboard → Settings → Custom Domains
2. Add your domain
3. Update DNS records
4. Free SSL included!

### 4. Upgrade When Ready
- **Development**: Free tier is fine
- **Production**: Upgrade to Starter ($7/month)
- **Business**: Standard plan ($25/month)

---

## ✅ Success Indicators

You're successfully deployed when:

- [ ] Render service shows "Live"
- [ ] Health endpoint returns 200 OK
- [ ] No errors in Render logs
- [ ] Frontend can sync data
- [ ] Data appears in summary endpoint
- [ ] Auto-deploy working

---

## 📞 Getting Help

### Render Support:
- **Docs**: https://render.com/docs
- **Community**: https://community.render.com
- **Status**: https://status.render.com

### Chikondi POS Issues:
- **GitHub Issues**: Report bugs
- **Documentation**: Check all .md files

---

## 🎉 You're Done!

Your Chikondi POS backend is now running on Render with:

- ✅ **Free hosting** (750 hours/month)
- ✅ **Automatic HTTPS**
- ✅ **Git-based deployment**
- ✅ **Auto-deploy from GitHub**
- ✅ **File-based data storage**
- ✅ **Real-time monitoring**

**Total cost: $0/month** (with free tier limitations)

**Next:** Deploy your frontend and start using Chikondi POS! 🚀

---

## 📋 Quick Commands Reference

```bash
# Test health
curl https://your-app.onrender.com/api/health

# Check data
curl https://your-app.onrender.com/api/data/summary

# View logs
# Use Render dashboard → Logs tab

# Redeploy
git push origin main  # (if auto-deploy enabled)
```

**Ready to deploy? Let's do it!** 🚀