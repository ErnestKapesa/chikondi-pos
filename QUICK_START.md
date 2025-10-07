# Quick Start Guide - Chikondi POS

## 🚀 Get Running in 5 Minutes

### Prerequisites
- Node.js 18+ installed
- npm or yarn
- A code editor (VS Code recommended)

### Step 1: Install Frontend Dependencies
```bash
npm install
```

### Step 2: Start Development Server
```bash
npm run dev
```

Your app will be running at: **http://localhost:5173**

### Step 3: Open in Browser
1. Open Chrome or any modern browser
2. Navigate to http://localhost:5173
3. You'll see the setup screen

### Step 4: First-Time Setup
1. **Enter Shop Name**: e.g., "My Shop"
2. **Create PIN**: Enter a 4-6 digit PIN (e.g., 1234)
3. **Confirm PIN**: Re-enter the same PIN
4. Click **Setup Account**

🎉 You're in! You'll see the dashboard.

## 📦 Add Your First Product

1. Click **📦 Stock** in the bottom navigation
2. Click **+ Add Product**
3. Fill in:
   - Product Name: "T-Shirt"
   - Price: 5000
   - Quantity: 20
   - Low Stock Alert: 5
4. Click **Add Product**

## 💰 Record Your First Sale

1. Click **💰 Sales** in the bottom navigation
2. Select product from dropdown
3. Enter quantity (default is 1)
4. Choose payment method (Cash or Mobile Money)
5. Click **Record Sale**

✅ Sale recorded! Stock automatically updated.

## 💸 Add an Expense

1. Click **💸 Expenses** in the bottom navigation
2. Click **+ Add Expense**
3. Fill in:
   - Description: "Rent"
   - Amount: 50000
   - Category: Rent
4. Click **Add Expense**

## 📊 View Reports

1. Click **📊 Reports** in the bottom navigation
2. Select period: Today / Week / Month
3. View your sales, expenses, and profit

## 🔄 Test Offline Mode

1. Open Chrome DevTools (F12)
2. Go to **Network** tab
3. Select **Offline** from throttling dropdown
4. Try recording a sale - it works!
5. Go back **Online**
6. Data will sync automatically

## ⚙️ Settings & Sync

1. Click **⚙️** icon in top-right
2. View shop information
3. Click **🔄 Sync Now** to manually sync
4. Click **🚪 Logout** to return to login

## 🔐 Login Again

1. After logout, you'll see the PIN screen
2. Enter your PIN (e.g., 1234)
3. Click **Login**

## 📱 Install as PWA (Mobile)

### On Android Chrome:
1. Open the app in Chrome
2. Tap the menu (⋮)
3. Tap **Add to Home screen**
4. Tap **Add**
5. App icon appears on home screen

### On iOS Safari:
1. Open the app in Safari
2. Tap the Share button
3. Tap **Add to Home Screen**
4. Tap **Add**

## 🖥️ Backend Setup (Optional)

If you want cloud sync:

### Step 1: Install CouchDB
```bash
# macOS
brew install couchdb

# Ubuntu
sudo apt install couchdb

# Or use Docker
docker run -d --name couchdb \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  -p 5984:5984 \
  couchdb:latest
```

### Step 2: Start Backend Server
```bash
cd server
npm install
cp .env.example .env
# Edit .env with your CouchDB credentials
npm start
```

Backend runs at: **http://localhost:3001**

### Step 3: Configure Frontend
Create `.env` in root:
```
VITE_API_URL=http://localhost:3001
```

Restart frontend:
```bash
npm run dev
```

## 🧪 Test Cloud Sync

1. Record some sales/expenses
2. Go to Settings
3. Click **🔄 Sync Now**
4. Check CouchDB at http://localhost:5984/_utils
5. You'll see your data in the databases

## 🎨 Customize

### Change Colors
Edit `tailwind.config.js`:
```javascript
theme: {
  extend: {
    colors: {
      primary: '#10b981',  // Change this
      secondary: '#3b82f6' // And this
    }
  }
}
```

### Change Currency
Edit files and replace "MWK" with your currency code.

### Change Language
All text is in the component files - easy to translate!

## 🐛 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

### Can't Install Dependencies
```bash
# Clear cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### PWA Not Installing
- Make sure you're using HTTPS (or localhost)
- Check service worker is registered (DevTools > Application > Service Workers)
- Clear browser cache and try again

### Sync Not Working
- Check backend is running: http://localhost:3001/api/health
- Check VITE_API_URL in .env
- Check browser console for errors
- Verify CouchDB is running

## 📚 Next Steps

1. Read **README.md** for full documentation
2. Check **OFFLINE_ARCHITECTURE.md** for technical details
3. See **DEPLOYMENT.md** for production deployment
4. Review **PROJECT_SUMMARY.md** for project overview

## 💡 Tips

- **Test offline first** - That's the main feature!
- **Use Chrome DevTools** - Network tab for offline testing
- **Check IndexedDB** - Application tab > Storage > IndexedDB
- **Monitor console** - Look for sync messages
- **Install as PWA** - Better mobile experience

## 🎯 Common Use Cases

### Market Seller
1. Add all products in the morning
2. Record sales throughout the day
3. View daily report in the evening
4. Sync when you get home (WiFi)

### Barber/Salon
1. Add services as products (e.g., "Haircut - 2000")
2. Record each service as a sale
3. Track expenses (rent, supplies)
4. View weekly/monthly reports

### Sneaker Reseller
1. Add sneakers with buy price
2. Set sell price
3. Record sales with profit margin
4. Track top-selling models

## 🆘 Need Help?

- **GitHub Issues**: Report bugs or request features
- **Documentation**: Check the docs folder
- **Community**: Join our Discord (coming soon)

## ✅ Checklist

- [ ] Installed dependencies
- [ ] Started dev server
- [ ] Created account with PIN
- [ ] Added first product
- [ ] Recorded first sale
- [ ] Added first expense
- [ ] Viewed reports
- [ ] Tested offline mode
- [ ] Installed as PWA (mobile)
- [ ] Set up backend (optional)
- [ ] Tested cloud sync (optional)

---

**You're all set!** Start building your business with Chikondi POS. 🚀
