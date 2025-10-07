# Railway Deployment Guide - Chikondi POS Backend

## 🚂 Why Railway?

- ✅ **Free Tier**: $5 free credit per month (enough for small apps)
- ✅ **Easy Setup**: Deploy in minutes
- ✅ **CouchDB Support**: One-click database deployment
- ✅ **Auto-Deploy**: Connects to GitHub for automatic deployments
- ✅ **Environment Variables**: Easy configuration
- ✅ **HTTPS**: Automatic SSL certificates

---

## 📋 Prerequisites

1. **GitHub Account** - To connect your repository
2. **Railway Account** - Sign up at https://railway.app
3. **Code Pushed to GitHub** - Your Chikondi POS code

---

## 🚀 Step-by-Step Deployment

### Step 1: Sign Up for Railway

1. Go to https://railway.app
2. Click **"Start a New Project"**
3. Sign in with GitHub
4. Authorize Railway to access your repositories

---

### Step 2: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **chikondi-pos** repository
4. Railway will detect it's a Node.js project

---

### Step 3: Configure Backend Service

#### 3.1 Set Root Directory

Since your backend is in the `server/` folder:

1. Click on your service
2. Go to **Settings**
3. Find **"Root Directory"**
4. Set to: `server`
5. Click **"Save"**

#### 3.2 Set Start Command

1. Still in **Settings**
2. Find **"Start Command"**
3. Set to: `node index.js`
4. Click **"Save"**

#### 3.3 Configure Build

Railway should auto-detect, but verify:
- **Build Command**: `npm install`
- **Start Command**: `node index.js`

---

### Step 4: Add CouchDB Database

#### Option A: Railway CouchDB Template (Recommended)

1. In your project, click **"+ New"**
2. Select **"Database"**
3. Choose **"CouchDB"**
4. Railway will deploy CouchDB automatically
5. Note the connection details

#### Option B: External CouchDB (IBM Cloudant)

If Railway doesn't have CouchDB template:

1. Go to https://www.ibm.com/cloud/cloudant
2. Sign up for free tier
3. Create a new instance
4. Get connection URL
5. Add to Railway environment variables

---

### Step 5: Set Environment Variables

1. Click on your backend service
2. Go to **"Variables"** tab
3. Add these variables:

```bash
# Required Variables
PORT=3001
NODE_ENV=production

# CouchDB Connection (from Railway CouchDB service)
COUCHDB_URL=http://admin:password@couchdb.railway.internal:5984

# Or if using external CouchDB (IBM Cloudant)
COUCHDB_URL=https://username:password@your-instance.cloudant.com
```

#### How to Get CouchDB URL from Railway:

1. Click on your **CouchDB service**
2. Go to **"Variables"** tab
3. Copy the connection string
4. Format it as: `http://admin:password@host:5984`

---

### Step 6: Deploy Backend

1. Railway will automatically deploy after configuration
2. Wait for deployment to complete (1-2 minutes)
3. Check **"Deployments"** tab for status
4. Look for ✅ **"Success"** status

---

### Step 7: Get Your Backend URL

1. Click on your backend service
2. Go to **"Settings"**
3. Find **"Domains"** section
4. Click **"Generate Domain"**
5. Railway will give you a URL like:
   ```
   https://chikondi-pos-production.up.railway.app
   ```
6. **Copy this URL** - you'll need it for the frontend!

---

### Step 8: Test Your Backend

Test the health endpoint:

```bash
# Replace with your Railway URL
curl https://your-app.up.railway.app/api/health

# Should return:
{"status":"ok","timestamp":"2025-01-..."}
```

---

## 🔧 Configure Frontend to Use Railway Backend

### Update Frontend Environment Variable

1. In your local project, create/update `.env`:

```bash
VITE_API_URL=https://your-app.up.railway.app
```

2. Replace `your-app.up.railway.app` with your actual Railway URL

3. Restart your dev server:
```bash
npm run dev
```

---

## 📊 Railway Project Structure

After setup, your Railway project should have:

```
Chikondi POS Project
├── Backend Service (Node.js)
│   ├── Root Directory: server/
│   ├── Start Command: node index.js
│   └── Domain: https://your-app.up.railway.app
│
└── CouchDB Service
    ├── Internal URL: couchdb.railway.internal:5984
    └── Credentials: admin / [generated password]
```

---

## 🔐 Security Best Practices

### 1. Use Environment Variables

Never hardcode credentials:

```javascript
// ❌ BAD
const couchUrl = 'http://admin:password@localhost:5984';

// ✅ GOOD
const couchUrl = process.env.COUCHDB_URL;
```

### 2. Enable CORS Properly

Already configured in `server/index.js`:

```javascript
const cors = require('cors');
app.use(cors({
  origin: process.env.FRONTEND_URL || '*'
}));
```

### 3. Add Rate Limiting (Optional)

Install and configure:

```bash
npm install express-rate-limit
```

```javascript
const rateLimit = require('express-rate-limit');

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);
```

---

## 📈 Monitoring & Logs

### View Logs

1. Click on your backend service
2. Go to **"Deployments"** tab
3. Click on latest deployment
4. View real-time logs

### Common Log Messages

```bash
# Success
✅ Chikondi POS Server running on port 3001
✅ Database chikondi_sales created

# Errors to watch for
❌ Error: connect ECONNREFUSED (CouchDB not running)
❌ CORS error (Check CORS configuration)
```

---

## 💰 Railway Pricing

### Free Tier
- **$5 credit per month**
- **500 hours** of usage
- Perfect for development and small apps

### Usage Estimate for Chikondi POS:
- Backend: ~$3/month
- CouchDB: ~$2/month
- **Total: ~$5/month (covered by free tier!)**

### If You Exceed Free Tier:
- Add payment method
- Pay only for what you use
- ~$5-10/month for production app

---

## 🔄 Automatic Deployments

### Enable Auto-Deploy from GitHub

1. Go to **Settings** → **Service**
2. Find **"Deploy Triggers"**
3. Enable **"Deploy on Push"**
4. Select branch (usually `main` or `master`)

Now every time you push to GitHub:
1. Railway detects changes
2. Automatically rebuilds
3. Deploys new version
4. Zero downtime!

---

## 🐛 Troubleshooting

### Issue 1: Deployment Failed

**Check:**
1. Build logs for errors
2. Correct root directory (`server/`)
3. All dependencies in `package.json`
4. Start command is correct

**Fix:**
```bash
# In Railway Settings
Root Directory: server
Start Command: node index.js
```

---

### Issue 2: CouchDB Connection Failed

**Error:** `ECONNREFUSED` or `Connection timeout`

**Check:**
1. CouchDB service is running
2. Environment variable `COUCHDB_URL` is set
3. URL format is correct

**Fix:**
```bash
# Correct format
COUCHDB_URL=http://admin:password@couchdb.railway.internal:5984

# Or for external
COUCHDB_URL=https://username:password@host.cloudant.com
```

---

### Issue 3: CORS Errors

**Error:** `Access to fetch blocked by CORS policy`

**Fix:**

Add to `server/index.js`:
```javascript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-frontend.netlify.app'
  ],
  credentials: true
}));
```

---

### Issue 4: 502 Bad Gateway

**Causes:**
1. App crashed
2. Port not configured correctly
3. Start command wrong

**Fix:**
```javascript
// In server/index.js
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 📱 Complete Deployment Checklist

### Backend (Railway)
- [ ] Railway account created
- [ ] Project created from GitHub
- [ ] Root directory set to `server/`
- [ ] Start command set to `node index.js`
- [ ] CouchDB service added
- [ ] Environment variables configured
- [ ] Domain generated
- [ ] Health endpoint tested
- [ ] Logs checked for errors

### Frontend (Local)
- [ ] `.env` file created
- [ ] `VITE_API_URL` set to Railway URL
- [ ] Dev server restarted
- [ ] Sync tested from Settings
- [ ] Data appears in CouchDB

---

## 🚀 Next Steps After Railway Deployment

### 1. Deploy Frontend

Choose one:

**Option A: Netlify**
```bash
npm run build
# Drag dist/ folder to Netlify
```

**Option B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

See `DEPLOYMENT.md` for detailed frontend deployment.

### 2. Update Frontend Environment

In your frontend deployment platform:
```bash
VITE_API_URL=https://your-railway-app.up.railway.app
```

### 3. Test End-to-End

1. Open deployed frontend
2. Create account
3. Add products
4. Record sales
5. Go to Settings → Sync Now
6. Check Railway logs
7. Verify data in CouchDB

---

## 📊 Railway Dashboard Overview

### Key Sections:

1. **Deployments**
   - View deployment history
   - Check build logs
   - Rollback if needed

2. **Metrics**
   - CPU usage
   - Memory usage
   - Network traffic

3. **Variables**
   - Environment variables
   - Secrets management

4. **Settings**
   - Service configuration
   - Domain management
   - Deploy triggers

---

## 🔗 Useful Railway Commands

### Railway CLI (Optional)

Install:
```bash
npm install -g @railway/cli
```

Login:
```bash
railway login
```

Deploy:
```bash
railway up
```

View logs:
```bash
railway logs
```

---

## 💡 Pro Tips

### 1. Use Railway CLI for Quick Deploys
```bash
railway up
# Faster than waiting for GitHub push
```

### 2. Set Up Staging Environment
- Create separate Railway project for staging
- Test changes before production
- Use different branch for auto-deploy

### 3. Monitor Usage
- Check Railway dashboard regularly
- Set up alerts for high usage
- Optimize if approaching limits

### 4. Backup CouchDB
```bash
# Export data regularly
curl http://admin:password@your-db.railway.app/chikondi_sales/_all_docs?include_docs=true > backup.json
```

---

## 📞 Getting Help

### Railway Support
- **Docs**: https://docs.railway.app
- **Discord**: https://discord.gg/railway
- **Twitter**: @Railway

### Chikondi POS Issues
- **GitHub Issues**: Report bugs
- **Documentation**: Check all .md files
- **Troubleshooting**: See TROUBLESHOOTING.md

---

## ✅ Success Checklist

You're successfully deployed when:

- [ ] Railway backend is running
- [ ] Health endpoint returns 200 OK
- [ ] CouchDB is accessible
- [ ] Frontend can sync data
- [ ] No errors in Railway logs
- [ ] Data persists in CouchDB
- [ ] Auto-deploy is working

---

## 🎉 You're Done!

Your Chikondi POS backend is now running on Railway with:
- ✅ Automatic deployments from GitHub
- ✅ CouchDB for data storage
- ✅ HTTPS with SSL
- ✅ Environment variables configured
- ✅ Monitoring and logs
- ✅ Free tier (or low cost)

**Next:** Deploy your frontend and start using Chikondi POS! 🚀

---

## 📸 Visual Guide

### Railway Dashboard Flow:
```
1. New Project
   ↓
2. Deploy from GitHub
   ↓
3. Select Repository
   ↓
4. Configure Service
   ↓
5. Add CouchDB
   ↓
6. Set Environment Variables
   ↓
7. Generate Domain
   ↓
8. Deploy! ✅
```

---

**Questions?** Check the Railway docs or open a GitHub issue!
