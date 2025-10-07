# Render.com Quick Start - 10 Minutes ⚡

## 🎯 Goal
Deploy Chikondi POS backend to Render.com in 10 minutes (no credit card required).

---

## ✅ Prerequisites
- [ ] Render account (sign up at render.com - free, no credit card)
- [ ] Your code on GitHub (already done ✅)

---

## 🚀 6-Step Deployment

### Step 1: Switch to Simple Backend (2 minutes)

```bash
# Navigate to server directory
cd server

# Backup original (optional)
cp index.js index-couchdb-backup.js

# Use the simple version (already created for you)
cp index-simple.js index.js

# Commit changes
git add .
git commit -m "Switch to simple backend for Render deployment"
git push origin main
```

### Step 2: Sign Up for Render (1 minute)

1. Go to https://render.com
2. Click **"Get Started for Free"**
3. Sign up with GitHub (no credit card required)
4. Authorize Render to access your repositories

### Step 3: Create Web Service (2 minutes)

1. In Render dashboard, click **"New +"**
2. Select **"Web Service"**
3. Find and select **"chikondi-pos"** repository
4. Click **"Connect"**

### Step 4: Configure Service (3 minutes)

Fill in these settings:

```
Name: chikondi-pos-backend
Root Directory: server
Environment: Node
Region: Oregon (US West)
Branch: main

Build Command: npm install
Start Command: npm start

Instance Type: Free
```

**Environment Variables:**
```
NODE_ENV = production
```

### Step 5: Deploy (1 minute)

1. Click **"Create Web Service"**
2. Wait for deployment (2-5 minutes)
3. You'll get a URL like: `https://chikondi-pos-backend.onrender.com`

### Step 6: Test & Connect (1 minute)

```bash
# Test health endpoint (replace with your URL)
curl https://chikondi-pos-backend.onrender.com/api/health

# Should return: {"status":"ok",...}
```

**Update Frontend:**
```bash
# In your main project directory
echo "VITE_API_URL=https://chikondi-pos-backend.onrender.com" > .env

# Restart dev server
npm run dev
```

---

## ✅ Test It Works

1. Open your app: `npm run dev`
2. Go to **Settings** → **Sync Now**
3. Should see "Sync completed" ✅
4. Check data: `https://your-app.onrender.com/api/data/summary`

---

## 🎉 Done!

Your backend is live on Render!

**Your URLs:**
- **App**: `https://chikondi-pos-backend.onrender.com`
- **Health**: `https://chikondi-pos-backend.onrender.com/api/health`
- **Data**: `https://chikondi-pos-backend.onrender.com/api/data/summary`

---

## ⚠️ Free Tier Notes

- **Spins down** after 15 minutes of inactivity
- **Takes ~30 seconds** to wake up
- **750 hours/month** (enough for development)
- **Upgrade to $7/month** for always-on

---

## 🚀 Next Steps

1. **Deploy Frontend** (Netlify/Vercel)
2. **Enable Auto-Deploy** (Settings → Auto-Deploy)
3. **Set Up Monitoring** (UptimeRobot - optional)
4. **Test End-to-End** sync

**Full Guide:** See RENDER_DEPLOYMENT.md

---

## 🐛 Quick Troubleshooting

### Build Failed?
- Check Render logs for errors
- Verify `package.json` in server directory
- Test locally: `cd server && npm start`

### App Won't Start?
- Check start command: `npm start`
- Verify root directory: `server`
- Check environment variables

### Sync Not Working?
- Verify frontend .env has correct URL
- Check browser console for CORS errors
- Test health endpoint with curl

---

**Questions?** See RENDER_DEPLOYMENT.md for detailed guide!

---

## 💡 Pro Tips

- **Bookmark health URL** to check if app is running
- **Use UptimeRobot** (free) to prevent sleeping
- **Enable auto-deploy** for automatic updates
- **Monitor logs** in Render dashboard

---

**Ready? Let's deploy to Render!** 🚀