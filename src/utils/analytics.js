// Analytics utilities for Chikondi POS
import { track } from '@vercel/analytics';

// Track key user actions for business insights
export const trackEvent = (eventName, properties = {}) => {
  try {
    // Only track in production or when explicitly enabled
    if (typeof track === 'function') {
      track(eventName, properties);
    } else {
      console.log('📊 Analytics (dev):', eventName, properties);
    }
  } catch (error) {
    console.warn('Analytics tracking failed:', error);
  }
};

// Predefined events for consistent tracking
export const analytics = {
  // Add trackEvent method to analytics object for backward compatibility
  trackEvent: trackEvent,
  // User onboarding
  tutorialStarted: () => trackEvent('tutorial_started'),
  tutorialCompleted: () => trackEvent('tutorial_completed'),
  tutorialSkipped: (step) => trackEvent('tutorial_skipped', { step }),
  
  // Sales activities
  saleCompleted: (amount, paymentMethod, itemCount) => trackEvent('sale_completed', {
    amount,
    payment_method: paymentMethod,
    item_count: itemCount
  }),
  
  // Customer management
  customerAdded: () => trackEvent('customer_added'),
  customerEdited: () => trackEvent('customer_edited'),
  customerSearched: (query) => trackEvent('customer_searched', { query_length: query.length }),
  customerSegmentViewed: (segment) => trackEvent('customer_segment_viewed', { segment }),
  
  // Inventory management
  productAdded: () => trackEvent('product_added'),
  productEdited: () => trackEvent('product_edited'),
  lowStockViewed: () => trackEvent('low_stock_viewed'),
  
  // Data export
  dataExported: (format, type) => trackEvent('data_exported', { format, type }),
  businessSummaryShared: () => trackEvent('business_summary_shared'),
  
  // Feature usage
  featureUsed: (feature) => trackEvent('feature_used', { feature }),
  pageViewed: (page) => trackEvent('page_viewed', { page }),
  
  // Business insights
  reportsViewed: (reportType) => trackEvent('reports_viewed', { report_type: reportType }),
  settingsAccessed: () => trackEvent('settings_accessed'),
  
  // User engagement
  sessionStarted: () => trackEvent('session_started'),
  offlineUsage: () => trackEvent('offline_usage'),
  
  // Premium features (for future use)
  premiumFeatureViewed: (feature) => trackEvent('premium_feature_viewed', { feature }),
  upgradePromptShown: (tier) => trackEvent('upgrade_prompt_shown', { tier })
};

// Track page views automatically
export const trackPageView = (pageName) => {
  analytics.pageViewed(pageName);
};

// Track user journey milestones
export const trackMilestone = (milestone, metadata = {}) => {
  trackEvent('milestone_reached', { milestone, ...metadata });
};

// Track business metrics (anonymized)
export const trackBusinessMetric = (metric, value) => {
  trackEvent('business_metric', { metric, value });
};

export default analytics;