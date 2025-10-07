# 🚀 START HERE - Chikondi POS

## What is Chikondi POS?

An **offline-first** Point of Sale and Inventory Management app for African micro-entrepreneurs. Works completely offline, syncs to cloud when online.

## Quick Start (3 Steps)

### 1. Install & Run
```bash
npm install
npm run dev
```

### 2. Open Browser
Go to: **http://localhost:5173**

### 3. Setup Account
- Enter your shop name
- Create a PIN (e.g., 1234)
- Start using the app!

## Key Features

✅ **Works Offline** - No internet required  
✅ **Sales Recording** - Quick sale entry  
✅ **Inventory Management** - Track stock  
✅ **Expense Tracking** - Record costs  
✅ **Reports** - Daily/weekly/monthly analytics  
✅ **Cloud Sync** - Automatic backup when online  
✅ **PWA** - Install on mobile like native app  

## Documentation

- **QUICK_START.md** - 5-minute tutorial
- **README.md** - Complete user guide
- **OFFLINE_ARCHITECTURE.md** - Technical details
- **DEPLOYMENT.md** - Production deployment
- **TESTING.md** - Testing guide
- **FEATURES.md** - Feature documentation
- **IMPLEMENTATION_NOTES.md** - Design decisions
- **PROJECT_SUMMARY.md** - Project overview

## Tech Stack

**Frontend**: React + Vite + TailwindCSS + IndexedDB  
**Backend**: Node.js + Express + CouchDB  
**PWA**: Service Workers + Workbox  

## Project Structure

```
src/
├── pages/          # Dashboard, Sales, Inventory, Expenses, Reports
├── components/     # Layout, Navigation
├── utils/          # Database, Sync, Service Worker
└── App.jsx         # Main app

server/
└── index.js        # Express API + CouchDB sync
```

## Test Offline Mode

1. Open Chrome DevTools (F12)
2. Network tab → Select "Offline"
3. Record a sale - it works!
4. Go back online - auto syncs

## Install as Mobile App

**Android**: Menu → Add to Home screen  
**iOS**: Share → Add to Home Screen  

## Backend Setup (Optional)

```bash
# Start CouchDB (Docker)
docker run -d -p 5984:5984 \
  -e COUCHDB_USER=admin \
  -e COUCHDB_PASSWORD=password \
  couchdb:latest

# Start backend
cd server
npm install
npm start
```

## Need Help?

- Check the documentation files
- Open a GitHub issue
- Read the inline code comments

## What Makes This Special?

1. **Offline-First** - Works without internet
2. **Mobile-Optimized** - Large touch targets
3. **Fast** - <3s load on 3G
4. **Simple** - Non-technical users can use it
5. **Reliable** - Data never lost

## Built For

Young African entrepreneurs:
- Market sellers
- Sneaker resellers  
- Barbers & salon owners
- Mobile vendors
- Small shop owners

## License

MIT - Free for commercial use

---

**Ready?** Run `npm install && npm run dev` and start building! 🎉
