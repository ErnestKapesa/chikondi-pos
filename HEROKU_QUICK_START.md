# Heroku Quick Start - 10 Minutes ⚡

## 🎯 Goal
Deploy Chikondi POS backend to Heroku in 10 minutes.

---

## ✅ Prerequisites
- [ ] Heroku account (sign up at heroku.com - free)
- [ ] Heroku CLI installed
- [ ] Your code on GitHub (already done ✅)

---

## 🚀 6-Step Deployment

### Step 1: Install Heroku CLI (2 minutes)

**macOS:**
```bash
brew install heroku/brew/heroku
```

**Windows:** Download from https://devcenter.heroku.com/articles/heroku-cli

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

**Verify:**
```bash
heroku --version
```

### Step 2: Login to Heroku (1 minute)
```bash
heroku login
# Opens browser to login
```

### Step 3: Prepare Backend (1 minute)
```bash
cd server
echo "web: node index.js" > Procfile
```

### Step 4: Create Heroku App (1 minute)
```bash
# Replace with your preferred name
heroku create chikondi-pos-ernestkapesa

# Or let Heroku choose
heroku create
```

### Step 5: Set Up Database (3 minutes)

**Get IBM Cloudant (Free):**
1. Go to https://www.ibm.com/cloud/cloudant
2. Sign up for free
3. Create Cloudant instance
4. Get connection URL

**Set Environment Variables:**
```bash
# Replace with your actual Cloudant URL
heroku config:set COUCHDB_URL="https://username:password@your-instance.cloudantnosqldb.appdomain.cloud"
heroku config:set NODE_ENV=production
```

### Step 6: Deploy (2 minutes)
```bash
# Initialize git in server directory
git init
heroku git:remote -a your-app-name

# Deploy
git add .
git commit -m "Deploy to Heroku"
git push heroku main
```

---

## ✅ Test It Works

```bash
# Test health endpoint (replace with your URL)
curl https://your-app.herokuapp.com/api/health

# Should return:
{"status":"ok","timestamp":"..."}
```

---

## 🔗 Connect Frontend

Create `.env` in project root:
```bash
VITE_API_URL=https://your-app.herokuapp.com
```

Restart dev server:
```bash
npm run dev
```

Test sync from Settings page!

---

## 🎉 Done!

Your backend is live on Heroku!

**Your URLs:**
- App: `https://your-app.herokuapp.com`
- Health: `https://your-app.herokuapp.com/api/health`
- Sync: `https://your-app.herokuapp.com/api/sync`

---

## 🐛 Quick Troubleshooting

### Build Failed?
```bash
heroku logs --tail
```

### App Crashes?
- Check Procfile exists: `cat Procfile`
- Check environment variables: `heroku config`
- Check logs: `heroku logs`

### CouchDB Issues?
- Verify COUCHDB_URL is set
- Test connection: `curl $COUCHDB_URL`

---

## ⚠️ Free Tier Limitations

- **Sleeps after 30 minutes** of inactivity
- **Takes 10-30 seconds** to wake up
- **550-1000 hours/month** (enough for development)

**For production:** Upgrade to Hobby ($7/month) - no sleeping!

---

## 🚀 Next Steps

1. **Deploy Frontend** (Netlify/Vercel)
2. **Test End-to-End** sync
3. **Upgrade to Hobby** when ready for production

**Full Guide:** See HEROKU_DEPLOYMENT.md

---

## 💡 Pro Tips

- Use UptimeRobot (free) to ping your app every 25 minutes
- Enable auto-deploy from GitHub
- Monitor with `heroku logs --tail`
- Upgrade to paid plan for production

---

**Questions?** See HEROKU_DEPLOYMENT.md for detailed guide!