# Chikondi POS - Offline-First Point of Sale System

A Progressive Web App (PWA) designed for African micro-entrepreneurs to manage sales, inventory, and expenses offline.

## Features

- 📴 **Offline-First**: Works completely offline using IndexedDB
- 💰 **Sales Recording**: Quick sale entry with automatic stock updates
- 📦 **Inventory Management**: Track products, prices, and stock levels
- 💸 **Expense Tracking**: Record business expenses by category
- 📊 **Reports**: Daily, weekly, and monthly business insights
- 🔄 **Cloud Sync**: Automatic sync when internet is available
- 🔐 **PIN Authentication**: Simple local security
- 📱 **Mobile-First**: Large touch-friendly buttons for smartphones
- ⚡ **Fast & Lightweight**: Optimized for low-end Android devices

## Tech Stack

### Frontend
- React 18 + Vite
- TailwindCSS for styling
- React Router for navigation
- IndexedDB (via idb) for local storage
- Vite PWA plugin for service workers
- date-fns for date handling

### Backend
- Node.js + Express
- CouchDB for cloud storage
- Nano (CouchDB client)

## Project Structure

```
chikondi-pos/
├── src/
│   ├── components/
│   │   └── Layout.jsx          # Main layout with navigation
│   ├── pages/
│   │   ├── Login.jsx           # PIN authentication
│   │   ├── Dashboard.jsx       # Home screen with stats
│   │   ├── Sales.jsx           # Record sales
│   │   ├── Inventory.jsx       # Manage products
│   │   ├── Expenses.jsx        # Track expenses
│   │   ├── Reports.jsx         # View reports
│   │   └── Settings.jsx        # App settings
│   ├── utils/
│   │   ├── db.js               # IndexedDB operations
│   │   ├── sync.js             # Cloud sync logic
│   │   └── registerSW.js       # Service worker registration
│   ├── App.jsx                 # Main app component
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── server/
│   ├── index.js                # Express server
│   ├── package.json            # Server dependencies
│   └── .env.example            # Environment variables template
├── public/                     # Static assets
├── index.html
├── vite.config.js              # Vite + PWA configuration
├── tailwind.config.js
└── package.json

```

## Installation

### Prerequisites
- Node.js 18+ and npm
- CouchDB 3.x (for cloud sync)

### Frontend Setup

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### Backend Setup

```bash
# Navigate to server directory
cd server

# Install dependencies
npm install

# Create .env file
cp .env.example .env

# Edit .env with your CouchDB credentials
# Start server
npm start

# Or use nodemon for development
npm run dev
```

### CouchDB Setup

1. Install CouchDB from https://couchdb.apache.org/
2. Access Fauxton at http://localhost:5984/_utils
3. Create admin user
4. Update server/.env with credentials

## Key Implementation Details

### Offline-First Architecture

1. **IndexedDB Storage**: All data stored locally first
   - Sales, inventory, expenses stored in separate object stores
   - Each record has a `synced` flag
   - Timestamps for conflict resolution

2. **Service Worker**: Caches app shell and assets
   - Configured via Vite PWA plugin
   - Workbox for advanced caching strategies
   - Runtime caching for fonts and external resources

3. **Sync Strategy**:
   - Auto-sync when device comes online
   - Periodic sync every 5 minutes (if online)
   - Manual sync button in settings
   - Conflict resolution based on timestamps

### Data Flow

```
User Action → IndexedDB (local) → UI Update
                ↓ (when online)
            Cloud Sync → CouchDB
```

### PWA Features

- **Installable**: Add to home screen on Android
- **Offline capable**: Full functionality without internet
- **Fast loading**: Service worker caching
- **Mobile-optimized**: Touch-friendly 56px minimum button height

### Security

- PIN stored locally (consider encryption for production)
- No sensitive data transmitted without HTTPS
- Local-first approach minimizes attack surface

## Usage Guide

### First Time Setup
1. Open app → Create PIN and shop name
2. Add products to inventory
3. Start recording sales

### Recording a Sale
1. Go to Sales tab
2. Select product
3. Enter quantity
4. Choose payment method
5. Submit

### Managing Inventory
1. Go to Stock tab
2. Add new products with name, price, quantity
3. Edit or delete existing products
4. Low stock alerts shown on dashboard

### Viewing Reports
1. Go to Reports tab
2. Select period (today, week, month)
3. View sales, expenses, profit
4. See top-selling products

## Deployment

### Frontend (Netlify/Vercel)
```bash
npm run build
# Deploy dist/ folder
```

### Backend (Heroku/Railway)
```bash
cd server
# Deploy with your platform's CLI
```

### CouchDB (Cloud)
- Use IBM Cloudant (free tier)
- Or self-host on DigitalOcean/AWS

## Future Enhancements

- [ ] Bluetooth receipt printer support
- [ ] Barcode scanning
- [ ] Multi-currency support
- [ ] Employee management
- [ ] Customer records
- [ ] SMS notifications
- [ ] WhatsApp integration
- [ ] Multi-language support (Chichewa, Swahili)
- [ ] Export reports to PDF
- [ ] Backup to Google Drive

## Performance Optimization

- Lazy loading for routes
- Virtual scrolling for long lists
- Image optimization
- Code splitting
- Minimal dependencies

## Browser Support

- Chrome/Edge 80+
- Safari 13+
- Firefox 75+
- Android WebView 80+

## Contributing

Contributions welcome! Please follow these guidelines:
1. Fork the repository
2. Create feature branch
3. Test offline functionality
4. Submit pull request

## License

MIT License - feel free to use for commercial projects

## Support

For issues and questions, open a GitHub issue or contact support.

---

Built with ❤️ for African entrepreneurs
