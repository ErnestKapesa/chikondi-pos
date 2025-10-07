# Railway Quick Start - 5 Minutes ⚡

## 🎯 Goal
Deploy Chikondi POS backend to Railway in 5 minutes.

---

## ✅ Prerequisites
- [ ] GitHub account
- [ ] Code pushed to GitHub
- [ ] Railway account (sign up at railway.app)

---

## 🚀 5-Step Deployment

### Step 1: Create Project (30 seconds)
1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose **chikondi-pos** repository

### Step 2: Configure Backend (1 minute)
1. Click on your service
2. Go to **Settings**
3. Set **Root Directory**: `server`
4. Set **Start Command**: `node index.js`
5. Click **Save**

### Step 3: Add CouchDB (1 minute)
1. Click **"+ New"** in your project
2. Select **"Database"** → **"CouchDB"**
3. Wait for deployment
4. Copy the connection URL

### Step 4: Set Environment Variables (1 minute)
1. Click on backend service
2. Go to **"Variables"** tab
3. Add:
   ```
   PORT=3001
   NODE_ENV=production
   COUCHDB_URL=<paste-couchdb-url-here>
   ```

### Step 5: Generate Domain (30 seconds)
1. Go to **Settings**
2. Find **"Domains"**
3. Click **"Generate Domain"**
4. Copy your URL: `https://your-app.up.railway.app`

---

## ✅ Test It Works

```bash
# Test health endpoint
curl https://your-app.up.railway.app/api/health

# Should return:
{"status":"ok","timestamp":"..."}
```

---

## 🔗 Connect Frontend

Create `.env` in your project root:
```bash
VITE_API_URL=https://your-app.up.railway.app
```

Restart dev server:
```bash
npm run dev
```

Test sync from Settings page!

---

## 🎉 Done!

Your backend is live on Railway!

**Next Steps:**
- Deploy frontend (Netlify/Vercel)
- Test end-to-end sync
- Monitor Railway dashboard

**Full Guide:** See RAILWAY_DEPLOYMENT.md

---

## 🐛 Quick Troubleshooting

### Deployment Failed?
- Check root directory is `server`
- Check start command is `node index.js`
- View logs in Deployments tab

### Can't Connect to CouchDB?
- Verify COUCHDB_URL is set
- Check CouchDB service is running
- Format: `http://admin:password@host:5984`

### CORS Errors?
- Add your frontend URL to CORS config
- Redeploy backend

---

## 💰 Cost

**Free Tier:** $5/month credit
- Backend: ~$3/month
- CouchDB: ~$2/month
- **Total: FREE!** ✅

---

**Questions?** See RAILWAY_DEPLOYMENT.md for detailed guide!
