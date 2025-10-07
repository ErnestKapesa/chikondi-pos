# Troubleshooting Guide

## Common Issues & Solutions

### 1. React Hook Error: "Cannot access before initialization"

**Error Message:**
```
Uncaught ReferenceError: Cannot access 'checkSetup' before initialization
```

**Cause:** Using `useState` instead of `useEffect` for side effects

**Solution:** ✅ Fixed! The code now uses `useEffect` correctly.

---

### 2. Service Worker Registration Failed

**Error Message:**
```
Failed to register a ServiceWorker: The script has an unsupported MIME type
```

**Cause:** Vite PWA plugin handles service worker automatically

**Solution:** ✅ Fixed! Removed manual service worker registration.

**Note:** Service worker will be generated automatically when you run `npm run build`

---

### 3. Favicon 404 Error

**Error Message:**
```
Failed to load resource: favicon.ico 404 (Not Found)
```

**Cause:** Missing favicon file

**Solution:** 
- ✅ Placeholder created
- See `public/ICONS_README.md` for how to add proper icons
- For now, the app works fine without it

---

### 4. Port Already in Use

**Error Message:**
```
Port 5173 is already in use
```

**Solution:**
```bash
# Option 1: Kill the process
lsof -ti:5173 | xargs kill -9

# Option 2: Use different port
npm run dev -- --port 3000
```

---

### 5. Dependencies Won't Install

**Error Message:**
```
npm ERR! code ERESOLVE
```

**Solution:**
```bash
# Clear cache and reinstall
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

---

### 6. IndexedDB Not Working

**Symptoms:** Data not persisting, errors in console

**Solutions:**
1. Check browser supports IndexedDB (all modern browsers do)
2. Clear browser data and try again
3. Check browser console for specific errors
4. Try in incognito/private mode

**Debug:**
```javascript
// Check IndexedDB support
if ('indexedDB' in window) {
  console.log('IndexedDB supported');
} else {
  console.log('IndexedDB NOT supported');
}
```

---

### 7. Service Worker Not Updating

**Symptoms:** Old version of app still showing after update

**Solution:**
```javascript
// In Chrome DevTools:
// 1. Application tab
// 2. Service Workers
// 3. Click "Unregister"
// 4. Hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
```

---

### 8. CouchDB Connection Failed

**Error Message:**
```
Error: connect ECONNREFUSED 127.0.0.1:5984
```

**Solutions:**

**Check if CouchDB is running:**
```bash
curl http://localhost:5984
# Should return: {"couchdb":"Welcome",...}
```

**If using Docker:**
```bash
docker ps  # Check if container is running
docker logs couchdb  # Check logs
docker restart couchdb  # Restart if needed
```

**If installed locally:**
```bash
# macOS
brew services restart couchdb

# Ubuntu
sudo systemctl restart couchdb
```

---

### 9. Sync Not Working

**Symptoms:** Data not syncing to cloud

**Checklist:**
- [ ] Backend server is running (`npm run server`)
- [ ] CouchDB is running (check http://localhost:5984)
- [ ] `.env` file has correct `VITE_API_URL`
- [ ] Browser shows "Online" status
- [ ] No errors in browser console
- [ ] No errors in server console

**Test Backend:**
```bash
# Test health endpoint
curl http://localhost:3001/api/health
# Should return: {"status":"ok",...}
```

---

### 10. Build Fails

**Error Message:**
```
Build failed with errors
```

**Common Causes & Solutions:**

**Missing dependencies:**
```bash
npm install
```

**TypeScript errors (if using TS):**
```bash
# Check for type errors
npm run type-check
```

**Syntax errors:**
- Check browser console
- Check terminal output
- Fix reported errors

---

### 11. PWA Not Installing on Mobile

**Symptoms:** No "Add to Home Screen" prompt

**Requirements:**
- [ ] HTTPS (or localhost for testing)
- [ ] Valid manifest.json
- [ ] Service worker registered
- [ ] Icons in manifest

**Test:**
1. Open Chrome DevTools
2. Go to Application tab
3. Check Manifest section
4. Check Service Workers section
5. Look for errors

---

### 12. Offline Mode Not Working

**Symptoms:** App doesn't work offline

**Debug Steps:**

1. **Check Service Worker:**
```javascript
// In console
navigator.serviceWorker.getRegistrations().then(registrations => {
  console.log('Service Workers:', registrations);
});
```

2. **Test Offline:**
- Open DevTools (F12)
- Network tab
- Select "Offline"
- Try using app

3. **Check Cache:**
- Application tab
- Cache Storage
- Should see cached files

---

### 13. Data Not Persisting

**Symptoms:** Data disappears after refresh

**Possible Causes:**

1. **Private/Incognito Mode:** IndexedDB may not persist
2. **Browser Storage Full:** Clear some space
3. **Browser Settings:** Check if storage is allowed

**Check Storage:**
```javascript
// In console
navigator.storage.estimate().then(estimate => {
  console.log('Usage:', estimate.usage);
  console.log('Quota:', estimate.quota);
  console.log('Percent:', (estimate.usage / estimate.quota * 100).toFixed(2) + '%');
});
```

---

### 14. Slow Performance

**Symptoms:** App is laggy or slow

**Solutions:**

1. **Clear Browser Cache:**
- Settings → Privacy → Clear browsing data

2. **Check Device Storage:**
- Low storage can slow down IndexedDB

3. **Reduce Data:**
- Archive old sales
- Delete unnecessary products

4. **Update Browser:**
- Use latest version

---

### 15. CORS Errors

**Error Message:**
```
Access to fetch blocked by CORS policy
```

**Solution:**
Backend already has CORS enabled. If still seeing errors:

1. **Check backend is running**
2. **Verify API URL in `.env`**
3. **Check browser console for exact error**

**Backend CORS config:**
```javascript
// Already in server/index.js
app.use(cors());
```

---

## Development Tips

### Hot Reload Not Working
```bash
# Restart dev server
# Ctrl+C to stop
npm run dev
```

### Clear All Data (Fresh Start)
```javascript
// In browser console
indexedDB.deleteDatabase('chikondi-pos');
// Then refresh page
```

### View IndexedDB Data
1. Open DevTools (F12)
2. Application tab
3. IndexedDB → chikondi-pos
4. Expand to see stores

### Monitor Network Requests
1. Open DevTools (F12)
2. Network tab
3. Watch API calls
4. Check for errors

---

## Getting More Help

### Before Asking for Help:

1. **Check browser console** for errors
2. **Check server console** for errors
3. **Try in incognito mode**
4. **Try different browser**
5. **Check this troubleshooting guide**

### When Reporting Issues:

Include:
- Error message (full text)
- Browser and version
- Operating system
- Steps to reproduce
- Screenshots if helpful
- Console errors

### Resources:

- **GitHub Issues:** Report bugs
- **Documentation:** Check all .md files
- **Browser DevTools:** Your best debugging tool
- **Console Logs:** Check for helpful messages

---

## Quick Fixes Checklist

When something goes wrong, try these in order:

1. [ ] Hard refresh (Cmd+Shift+R / Ctrl+Shift+R)
2. [ ] Clear browser cache
3. [ ] Restart dev server
4. [ ] Check browser console
5. [ ] Check server console (if using backend)
6. [ ] Try incognito mode
7. [ ] Restart browser
8. [ ] Restart computer (last resort!)

---

**Still stuck?** Open a GitHub issue with details!
