# Testing Guide - Chikondi POS

## Testing Strategy

This guide covers manual testing, automated testing setup, and quality assurance for the Chikondi POS application.

## Manual Testing Checklist

### 1. Authentication Flow

#### First-Time Setup
- [ ] Open app shows setup screen
- [ ] Can enter shop name
- [ ] Can create PIN (4-6 digits)
- [ ] PIN confirmation validates correctly
- [ ] Error shown if PINs don't match
- [ ] Error shown if PIN too short
- [ ] Successfully creates account
- [ ] Redirects to dashboard after setup

#### Login
- [ ] Shows PIN entry screen
- [ ] Correct PIN logs in successfully
- [ ] Incorrect PIN shows error
- [ ] PIN field clears after error
- [ ] Can't bypass login screen

#### Logout
- [ ] Logout button in settings works
- [ ] Confirmation dialog appears
- [ ] Returns to login screen
- [ ] Data persists after logout
- [ ] Can log back in with same PIN

### 2. Sales Module

#### Recording Sales
- [ ] Can select product from dropdown
- [ ] Dropdown shows only in-stock products
- [ ] Quantity defaults to 1
- [ ] Can change quantity
- [ ] Can't exceed available stock
- [ ] Price calculated correctly
- [ ] Can override price with custom amount
- [ ] Can select payment method (Cash/Mobile Money)
- [ ] Success message appears after sale
- [ ] Stock automatically decremented
- [ ] Sale appears in reports immediately

#### Edge Cases
- [ ] Can't record sale without product
- [ ] Can't record sale with 0 quantity
- [ ] Can't record sale with negative quantity
- [ ] Can't record sale if product out of stock
- [ ] Form resets after successful sale

### 3. Inventory Module

#### Adding Products
- [ ] Can open add product form
- [ ] All fields required
- [ ] Can enter product name
- [ ] Can enter price (accepts decimals)
- [ ] Can enter quantity (integers only)
- [ ] Can set low stock alert threshold
- [ ] Product appears in list immediately
- [ ] Product available for sales

#### Editing Products
- [ ] Can click edit button
- [ ] Form pre-fills with current data
- [ ] Can update all fields
- [ ] Changes save correctly
- [ ] Updated data reflects immediately

#### Deleting Products
- [ ] Can click delete button
- [ ] Confirmation dialog appears
- [ ] Product removed from list
- [ ] Product no longer in sales dropdown

#### Stock Alerts
- [ ] Low stock products show warning
- [ ] Warning appears on dashboard
- [ ] Count accurate on dashboard

#### Edge Cases
- [ ] Can't add product with empty name
- [ ] Can't add product with negative price
- [ ] Can't add product with negative quantity
- [ ] Price accepts decimals (e.g., 99.99)
- [ ] Quantity only accepts integers

### 4. Expenses Module

#### Adding Expenses
- [ ] Can open add expense form
- [ ] Can enter description
- [ ] Can enter amount
- [ ] Can select category
- [ ] Expense appears in list immediately
- [ ] Expense included in reports

#### Viewing Expenses
- [ ] Expenses sorted by date (newest first)
- [ ] Shows description, category, amount
- [ ] Shows formatted date/time
- [ ] Amount displayed with currency

#### Categories
- [ ] All categories available in dropdown
- [ ] Stock Purchase
- [ ] Rent
- [ ] Utilities
- [ ] Transport
- [ ] Other

### 5. Reports Module

#### Period Selection
- [ ] Can select Today
- [ ] Can select Week
- [ ] Can select Month
- [ ] Data updates when period changes

#### Metrics Display
- [ ] Total sales calculated correctly
- [ ] Total expenses calculated correctly
- [ ] Net profit = sales - expenses
- [ ] Transaction count accurate
- [ ] Top products sorted by revenue
- [ ] Top products show quantity sold

#### Edge Cases
- [ ] Shows zero values when no data
- [ ] Handles negative profit correctly
- [ ] Date ranges calculated correctly
- [ ] Week starts on correct day

### 6. Dashboard

#### Stats Display
- [ ] Today's sales total correct
- [ ] Today's expenses total correct
- [ ] Today's profit calculated correctly
- [ ] Low stock count accurate
- [ ] Date displayed correctly

#### Quick Actions
- [ ] Record Sale button links to sales
- [ ] Manage Stock button links to inventory
- [ ] Add Expense button links to expenses

### 7. Settings Module

#### Shop Information
- [ ] Displays shop name
- [ ] Displays creation date
- [ ] Date formatted correctly

#### Cloud Sync
- [ ] Sync button visible
- [ ] Shows syncing state
- [ ] Shows success/error message
- [ ] Works when online
- [ ] Shows offline message when offline

#### About Section
- [ ] Shows app version
- [ ] Shows app description

### 8. Navigation

#### Bottom Navigation
- [ ] All 5 tabs visible
- [ ] Active tab highlighted
- [ ] Icons display correctly
- [ ] Labels display correctly
- [ ] Taps navigate correctly
- [ ] Navigation persists state

#### Top Bar
- [ ] Shows app name
- [ ] Shows online/offline status
- [ ] Status updates in real-time
- [ ] Settings icon visible
- [ ] Settings icon navigates correctly

### 9. Offline Functionality

#### Core Features Offline
- [ ] Can record sales offline
- [ ] Can add products offline
- [ ] Can add expenses offline
- [ ] Can view reports offline
- [ ] Can navigate all pages offline
- [ ] Data persists after refresh
- [ ] No errors in console

#### Offline Indicator
- [ ] Shows "Offline" badge when offline
- [ ] Badge turns red
- [ ] Shows "Online" badge when online
- [ ] Badge turns green
- [ ] Updates automatically

#### Data Persistence
- [ ] Sales saved to IndexedDB
- [ ] Products saved to IndexedDB
- [ ] Expenses saved to IndexedDB
- [ ] User data saved to IndexedDB
- [ ] Data survives browser restart
- [ ] Data survives device restart

### 10. Sync Functionality

#### Automatic Sync
- [ ] Syncs when coming online
- [ ] Syncs periodically (every 5 min)
- [ ] Shows syncing indicator
- [ ] Marks data as synced
- [ ] No duplicate data created

#### Manual Sync
- [ ] Sync button works
- [ ] Shows progress indicator
- [ ] Shows success message
- [ ] Shows error message if fails
- [ ] Retries on failure

#### Conflict Resolution
- [ ] Newer data wins
- [ ] No data loss
- [ ] Timestamps used correctly

### 11. PWA Features

#### Installation
- [ ] Install prompt appears (mobile)
- [ ] Can add to home screen
- [ ] App icon appears on home screen
- [ ] Opens in standalone mode
- [ ] No browser UI visible

#### Service Worker
- [ ] Service worker registers
- [ ] Assets cached correctly
- [ ] App loads offline
- [ ] Updates automatically
- [ ] No stale content

#### Manifest
- [ ] Manifest.json accessible
- [ ] Icons load correctly
- [ ] Theme color applied
- [ ] Name displays correctly
- [ ] Description accurate

### 12. Performance

#### Load Times
- [ ] Initial load < 3 seconds (3G)
- [ ] Page transitions instant
- [ ] No lag when typing
- [ ] Smooth scrolling
- [ ] No janky animations

#### Memory Usage
- [ ] No memory leaks
- [ ] Stable over time
- [ ] Works on low-end devices

#### Battery Usage
- [ ] Reasonable battery consumption
- [ ] No excessive background activity

### 13. Responsive Design

#### Mobile (320px - 480px)
- [ ] All content visible
- [ ] No horizontal scroll
- [ ] Buttons easily tappable
- [ ] Text readable
- [ ] Forms usable

#### Tablet (481px - 768px)
- [ ] Layout adapts correctly
- [ ] Uses available space
- [ ] Navigation works

#### Desktop (769px+)
- [ ] Centered layout
- [ ] Max width applied
- [ ] Still usable

### 14. Accessibility

#### Keyboard Navigation
- [ ] Can tab through forms
- [ ] Enter submits forms
- [ ] Escape closes modals
- [ ] Focus visible

#### Screen Readers
- [ ] Labels on inputs
- [ ] Alt text on images
- [ ] ARIA labels where needed
- [ ] Semantic HTML used

#### Touch Targets
- [ ] Minimum 44x44px
- [ ] Adequate spacing
- [ ] No accidental taps

### 15. Browser Compatibility

#### Chrome/Edge (80+)
- [ ] All features work
- [ ] PWA installable
- [ ] Service worker works
- [ ] IndexedDB works

#### Safari (13+)
- [ ] All features work
- [ ] Can add to home screen
- [ ] IndexedDB works
- [ ] No iOS-specific bugs

#### Firefox (75+)
- [ ] All features work
- [ ] IndexedDB works
- [ ] Service worker works

## Automated Testing Setup

### Unit Tests (Vitest)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom
```

Create `vitest.config.js`:
```javascript
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/test/setup.js'
  }
});
```

### Example Test: `src/utils/db.test.js`
```javascript
import { describe, it, expect, beforeEach } from 'vitest';
import { initDB, addSale, getAllSales } from './db';

describe('Database Operations', () => {
  beforeEach(async () => {
    await initDB();
  });

  it('should add a sale', async () => {
    const sale = {
      productId: 1,
      productName: 'Test Product',
      quantity: 2,
      amount: 1000,
      paymentMethod: 'cash'
    };
    
    const id = await addSale(sale);
    expect(id).toBeDefined();
  });

  it('should retrieve all sales', async () => {
    const sales = await getAllSales();
    expect(Array.isArray(sales)).toBe(true);
  });
});
```

### E2E Tests (Playwright)

```bash
npm install -D @playwright/test
npx playwright install
```

Create `tests/e2e/sales.spec.js`:
```javascript
import { test, expect } from '@playwright/test';

test('record a sale', async ({ page }) => {
  await page.goto('http://localhost:5173');
  
  // Setup account
  await page.fill('input[placeholder="Enter your shop name"]', 'Test Shop');
  await page.fill('input[placeholder="Enter 4-digit PIN"]', '1234');
  await page.fill('input[placeholder="Re-enter PIN"]', '1234');
  await page.click('button:has-text("Setup Account")');
  
  // Add product
  await page.click('text=Stock');
  await page.click('text=Add Product');
  await page.fill('input[placeholder="Product Name"]', 'Test Product');
  await page.fill('input[placeholder="Price"]', '1000');
  await page.fill('input[placeholder="Quantity"]', '10');
  await page.click('button:has-text("Add Product")');
  
  // Record sale
  await page.click('text=Sales');
  await page.selectOption('select', { label: /Test Product/ });
  await page.click('button:has-text("Record Sale")');
  
  // Verify success
  await expect(page.locator('text=Sale recorded successfully')).toBeVisible();
});
```

## Performance Testing

### Lighthouse CI

```bash
npm install -g @lhci/cli

# Run audit
lhci autorun --collect.url=http://localhost:5173
```

Target scores:
- Performance: >90
- Accessibility: >90
- Best Practices: >90
- SEO: >90
- PWA: >90

### Bundle Size Analysis

```bash
npm run build -- --mode analyze
```

Target: Total bundle < 500KB

## Load Testing (Backend)

### Using Apache Bench
```bash
# Test sync endpoint
ab -n 1000 -c 10 -p data.json -T application/json \
  http://localhost:3001/api/sync
```

### Using Artillery
```bash
npm install -g artillery

# Create artillery.yml
artillery quick --count 10 --num 100 http://localhost:3001/api/health
```

## Security Testing

### OWASP ZAP
- Scan for vulnerabilities
- Test authentication
- Check for XSS
- Verify CORS

### Manual Security Checks
- [ ] PIN not stored in plain text
- [ ] No sensitive data in console
- [ ] HTTPS enforced in production
- [ ] CORS properly configured
- [ ] Input validation on backend
- [ ] SQL injection prevention
- [ ] XSS protection

## Regression Testing

After each update, verify:
- [ ] All existing features still work
- [ ] No new console errors
- [ ] Performance not degraded
- [ ] Offline functionality intact
- [ ] Sync still works
- [ ] PWA still installable

## Bug Reporting Template

```markdown
**Bug Description**
Clear description of the issue

**Steps to Reproduce**
1. Go to...
2. Click on...
3. See error

**Expected Behavior**
What should happen

**Actual Behavior**
What actually happens

**Environment**
- Device: iPhone 12 / Samsung Galaxy S21
- OS: iOS 15 / Android 12
- Browser: Chrome 96
- App Version: 1.0.0

**Screenshots**
If applicable

**Console Errors**
Any errors from browser console
```

## Test Data

### Sample Products
```javascript
[
  { name: 'T-Shirt', price: 5000, quantity: 20 },
  { name: 'Jeans', price: 15000, quantity: 10 },
  { name: 'Sneakers', price: 25000, quantity: 5 },
  { name: 'Hat', price: 3000, quantity: 30 }
]
```

### Sample Sales
```javascript
[
  { productName: 'T-Shirt', quantity: 2, amount: 10000, paymentMethod: 'cash' },
  { productName: 'Jeans', quantity: 1, amount: 15000, paymentMethod: 'mobile_money' }
]
```

### Sample Expenses
```javascript
[
  { description: 'Rent', amount: 50000, category: 'rent' },
  { description: 'Electricity', amount: 10000, category: 'utilities' },
  { description: 'Transport', amount: 5000, category: 'transport' }
]
```

## Continuous Integration

### GitHub Actions Workflow

Create `.github/workflows/test.yml`:
```yaml
name: Test

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 18
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm test
      
      - name: Build
        run: npm run build
      
      - name: Lighthouse CI
        run: |
          npm install -g @lhci/cli
          lhci autorun
```

## Quality Gates

Before releasing:
- [ ] All manual tests pass
- [ ] All automated tests pass
- [ ] Lighthouse score >90
- [ ] No console errors
- [ ] Bundle size acceptable
- [ ] Works offline
- [ ] Syncs correctly
- [ ] PWA installable
- [ ] Tested on real devices
- [ ] Security scan passed

---

**Remember**: Test offline functionality first - it's the core feature!
