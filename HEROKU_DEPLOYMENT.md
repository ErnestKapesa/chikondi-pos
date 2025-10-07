# Heroku Deployment Guide - Chikondi POS Backend

## 🚀 Why Heroku?

- ✅ **Free Tier Available** (with some limitations)
- ✅ **Easy Setup** - Deploy in minutes
- ✅ **Git-based Deployment** - Push to deploy
- ✅ **Add-ons Ecosystem** - Easy database setup
- ✅ **Automatic HTTPS** - SSL included
- ✅ **Environment Variables** - Easy configuration

---

## 📋 Prerequisites

1. **Heroku Account** - Sign up at https://heroku.com (free)
2. **Heroku CLI** - Command line tool
3. **GitHub Repository** - Your code (already done ✅)
4. **CouchDB Database** - We'll use IBM Cloudant (free tier)

---

## 🛠️ Step 1: Install Heroku CLI

### macOS:
```bash
brew tap heroku/brew && brew install heroku
```

### Windows:
Download from: https://devcenter.heroku.com/articles/heroku-cli

### Ubuntu/Linux:
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

### Verify Installation:
```bash
heroku --version
# Should show: heroku/8.x.x
```

---

## 🔐 Step 2: Login to Heroku

```bash
heroku login
```

This will open your browser to login. After login, you'll see:
```
Logged in as your-email@example.com
```

---

## 📦 Step 3: Prepare Your Backend for Heroku

### 3.1 Create Procfile

Heroku needs a Procfile to know how to start your app:

```bash
# Navigate to server directory
cd server

# Create Procfile
echo "web: node index.js" > Procfile
```

### 3.2 Update package.json

Make sure your `server/package.json` has the start script:

```json
{
  "scripts": {
    "start": "node index.js"
  }
}
```

### 3.3 Update Port Configuration

Your `server/index.js` should already have this (it does!):

```javascript
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## 🚀 Step 4: Create Heroku App

```bash
# Make sure you're in the server directory
cd server

# Create Heroku app (replace 'your-app-name' with something unique)
heroku create chikondi-pos-ernestkapesa

# Or let Heroku generate a name
heroku create
```

You'll get a URL like: `https://chikondi-pos-ernestkapesa.herokuapp.com`

---

## 💾 Step 5: Set Up CouchDB (IBM Cloudant)

Since Heroku doesn't have a native CouchDB add-on, we'll use IBM Cloudant (free tier):

### 5.1 Sign Up for IBM Cloudant

1. Go to: https://www.ibm.com/cloud/cloudant
2. Click **"Start for free"**
3. Create IBM Cloud account
4. Create a Cloudant instance

### 5.2 Get Connection Details

1. In IBM Cloud dashboard, go to your Cloudant service
2. Click **"Service Credentials"**
3. Click **"New credential"** if none exist
4. Copy the credential details

You'll get something like:
```json
{
  "url": "https://username:password@your-instance.cloudantnosqldb.appdomain.cloud",
  "username": "your-username",
  "password": "your-password"
}
```

### 5.3 Set Environment Variables

```bash
# Set CouchDB URL (replace with your actual Cloudant URL)
heroku config:set COUCHDB_URL="https://username:password@your-instance.cloudantnosqldb.appdomain.cloud"

# Set Node environment
heroku config:set NODE_ENV=production

# Verify variables are set
heroku config
```

---

## 📤 Step 6: Deploy to Heroku

### 6.1 Initialize Git in Server Directory

```bash
# Make sure you're in server directory
cd server

# Initialize git (if not already done)
git init

# Add Heroku remote
heroku git:remote -a your-app-name
```

### 6.2 Commit and Deploy

```bash
# Add all files
git add .

# Commit
git commit -m "Initial Heroku deployment"

# Deploy to Heroku
git push heroku main
```

You'll see build output like:
```
-----> Building on the Heroku-22 stack
-----> Using buildpack: heroku/nodejs
-----> Node.js app detected
-----> Installing node modules
-----> Build succeeded!
-----> Launching...
       Released v1
       https://your-app.herokuapp.com/ deployed to Heroku
```

---

## ✅ Step 7: Test Your Deployment

### 7.1 Test Health Endpoint

```bash
# Test with curl (replace with your Heroku URL)
curl https://your-app.herokuapp.com/api/health

# Should return:
{"status":"ok","timestamp":"2025-01-..."}
```

### 7.2 View Logs

```bash
# View real-time logs
heroku logs --tail

# View recent logs
heroku logs
```

### 7.3 Open in Browser

```bash
# Open your app
heroku open
```

---

## 🔧 Step 8: Configure Frontend

### 8.1 Update Frontend Environment

In your main project directory (not server), create/update `.env`:

```bash
# Replace with your actual Heroku URL
VITE_API_URL=https://your-app.herokuapp.com
```

### 8.2 Test Sync

```bash
# Start frontend
npm run dev

# Go to Settings → Sync Now
# Should work! ✅
```

---

## 📊 Heroku Free Tier Limitations

### What You Get (Free):
- ✅ 550-1000 dyno hours/month
- ✅ Custom domains
- ✅ HTTPS/SSL
- ✅ Git deployment
- ✅ Environment variables

### Limitations:
- ⚠️ **Sleeps after 30 min** of inactivity
- ⚠️ **Takes ~10-30 seconds** to wake up
- ⚠️ **No custom domains** on free tier
- ⚠️ **Limited to 512MB RAM**

### For Production:
- Upgrade to **Hobby ($7/month)** or **Professional ($25/month)**
- No sleeping, faster performance, custom domains

---

## 🔄 Alternative: Deploy from GitHub

Instead of git push, you can deploy directly from GitHub:

### 8.1 Connect GitHub

1. Go to: https://dashboard.heroku.com/apps/your-app-name
2. Click **"Deploy"** tab
3. Select **"GitHub"** as deployment method
4. Connect your GitHub account
5. Search for **"chikondi-pos"**
6. Click **"Connect"**

### 8.2 Configure Auto-Deploy

1. Scroll to **"Automatic deploys"**
2. Select **"main"** branch
3. Click **"Enable Automatic Deploys"**

Now every time you push to GitHub, Heroku will automatically deploy!

### 8.3 Manual Deploy

You can also deploy manually:
1. Scroll to **"Manual deploy"**
2. Select **"main"** branch
3. Click **"Deploy Branch"**

---

## 🐛 Troubleshooting

### Issue 1: Build Failed

**Check logs:**
```bash
heroku logs --tail
```

**Common fixes:**
- Ensure `package.json` has correct dependencies
- Check Node.js version compatibility
- Verify Procfile exists and is correct

### Issue 2: App Crashes

**Check logs:**
```bash
heroku logs --tail
```

**Common causes:**
- Port not configured correctly
- Missing environment variables
- CouchDB connection failed

**Fix port issue:**
```javascript
// In server/index.js (should already be correct)
const PORT = process.env.PORT || 3001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
```

### Issue 3: CouchDB Connection Failed

**Check environment variables:**
```bash
heroku config
```

**Should show:**
```
COUCHDB_URL: https://username:password@your-instance.cloudantnosqldb.appdomain.cloud
NODE_ENV: production
```

**Test connection:**
```bash
# SSH into Heroku dyno
heroku run bash

# Test CouchDB connection
curl $COUCHDB_URL
```

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

## 📈 Monitoring & Maintenance

### View App Metrics

```bash
# Open Heroku dashboard
heroku open --app your-app-name

# Or go to: https://dashboard.heroku.com/apps/your-app-name
```

### Useful Commands

```bash
# View app info
heroku info

# View config vars
heroku config

# View logs
heroku logs --tail

# Restart app
heroku restart

# Scale dynos
heroku ps:scale web=1

# Run commands
heroku run node --version
```

### Set Up Log Drains (Optional)

For better logging:
```bash
# Add papertrail (free log management)
heroku addons:create papertrail:choklad
```

---

## 💰 Cost Optimization

### Free Tier Tips:

1. **Keep App Awake:**
   - Use a service like UptimeRobot (free)
   - Ping your app every 25 minutes
   - Prevents sleeping during business hours

2. **Monitor Usage:**
   ```bash
   heroku ps
   heroku logs --tail
   ```

3. **Optimize for Speed:**
   - Keep dependencies minimal
   - Use compression middleware
   - Cache responses where possible

### Upgrade When Ready:

**Hobby Tier ($7/month):**
- No sleeping
- Custom domains
- Better performance

**Professional Tier ($25/month):**
- Horizontal scaling
- Metrics dashboard
- Threshold alerting

---

## 🔐 Security Best Practices

### Environment Variables

```bash
# Never commit secrets to git
# Use Heroku config vars instead
heroku config:set SECRET_KEY="your-secret"
```

### HTTPS Only

```javascript
// In server/index.js (for production)
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      res.redirect(`https://${req.header('host')}${req.url}`);
    } else {
      next();
    }
  });
}
```

### Rate Limiting

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

## 🚀 Deployment Checklist

### Pre-Deployment:
- [ ] Heroku CLI installed
- [ ] Logged into Heroku
- [ ] Procfile created
- [ ] package.json has start script
- [ ] Port configured correctly

### Deployment:
- [ ] Heroku app created
- [ ] Environment variables set
- [ ] Code deployed
- [ ] Health endpoint tested
- [ ] Logs checked

### Post-Deployment:
- [ ] Frontend .env updated
- [ ] Sync tested
- [ ] CouchDB connection verified
- [ ] Auto-deploy configured (optional)

---

## 📱 Complete Setup Summary

### Backend (Heroku):
```
App: https://your-app.herokuapp.com
Health: https://your-app.herokuapp.com/api/health
Sync: https://your-app.herokuapp.com/api/sync
```

### Database (IBM Cloudant):
```
URL: https://username:password@instance.cloudantnosqldb.appdomain.cloud
Databases: chikondi_sales, chikondi_inventory, chikondi_expenses
```

### Frontend (Local):
```
Dev: http://localhost:5173
API: https://your-app.herokuapp.com
```

---

## 🎯 Next Steps

### 1. Deploy Frontend

**Option A: Netlify**
```bash
npm run build
# Drag dist/ folder to netlify.com/drop
```

**Option B: Vercel**
```bash
npm install -g vercel
vercel --prod
```

**Option C: GitHub Pages**
```bash
npm install -g gh-pages
npm run build
gh-pages -d dist
```

### 2. Custom Domain (Optional)

```bash
# Add custom domain (requires paid plan)
heroku domains:add api.your-domain.com
```

### 3. SSL Certificate

Heroku provides automatic SSL for .herokuapp.com domains. For custom domains:

```bash
# Automatic SSL (requires paid plan)
heroku certs:auto:enable
```

---

## 📞 Getting Help

### Heroku Support:
- **Docs**: https://devcenter.heroku.com/
- **Status**: https://status.heroku.com/
- **Support**: https://help.heroku.com/

### Chikondi POS Issues:
- **GitHub Issues**: Report bugs
- **Documentation**: Check all .md files
- **Troubleshooting**: See TROUBLESHOOTING.md

---

## ✅ Success Indicators

You're successfully deployed when:

- [ ] `heroku logs` shows no errors
- [ ] Health endpoint returns 200 OK
- [ ] CouchDB connection works
- [ ] Frontend can sync data
- [ ] Data persists in Cloudant
- [ ] Auto-deploy working (if configured)

---

## 🎉 You're Done!

Your Chikondi POS backend is now running on Heroku with:

- ✅ **Free hosting** (with limitations)
- ✅ **Automatic HTTPS**
- ✅ **Git-based deployment**
- ✅ **Environment variables**
- ✅ **CouchDB integration**
- ✅ **Monitoring and logs**

**Next:** Deploy your frontend and start using Chikondi POS! 🚀

---

## 📊 Heroku vs Railway Comparison

| Feature | Heroku Free | Railway Free | Winner |
|---------|-------------|--------------|---------|
| **Sleeping** | Yes (30 min) | No | Railway |
| **Build Time** | Slower | Faster | Railway |
| **Ease of Use** | Easy | Easier | Railway |
| **Documentation** | Excellent | Good | Heroku |
| **Add-ons** | Many | Few | Heroku |
| **Git Integration** | Excellent | Excellent | Tie |
| **Custom Domains** | Paid only | Free | Railway |

**Recommendation:** Use Heroku for learning, Railway for production (when trial resets).

---

**Questions?** Check the Heroku docs or open a GitHub issue!