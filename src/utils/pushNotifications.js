// Push Notification System for App Updates
import { analytics } from './analytics';

// Check if push notifications are supported
export function isPushNotificationSupported() {
  return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
}

// Request notification permission
export async function requestNotificationPermission() {
  if (!isPushNotificationSupported()) {
    return { success: false, error: 'Push notifications not supported' };
  }

  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      analytics.trackEvent('notification_permission_granted');
      return { success: true, permission };
    } else {
      analytics.trackEvent('notification_permission_denied');
      return { success: false, error: 'Permission denied' };
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return { success: false, error: error.message };
  }
}

// Show local notification for app updates
export function showUpdateNotification(updateInfo) {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification('Chikondi POS Update Available! 🚀', {
      body: `New features available: ${updateInfo.newFeatures.map(f => f.name).join(', ')}`,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'chikondi-update',
      requireInteraction: true,
      actions: [
        {
          action: 'update',
          title: 'Update Now',
          icon: '/icon-192x192.png'
        },
        {
          action: 'later',
          title: 'Later',
          icon: '/icon-192x192.png'
        }
      ],
      data: {
        updateInfo,
        timestamp: Date.now()
      }
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
      analytics.trackEvent('update_notification_clicked');
    };

    // Auto-close after 10 seconds
    setTimeout(() => {
      notification.close();
    }, 10000);

    analytics.trackEvent('update_notification_shown', {
      from_version: updateInfo.fromVersion,
      to_version: updateInfo.toVersion
    });

    return true;
  } catch (error) {
    console.error('Error showing update notification:', error);
    return false;
  }
}

// Show feature announcement notification
export function showFeatureAnnouncement(feature) {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  try {
    const notification = new Notification(`New Feature: ${feature.title} ✨`, {
      body: feature.description,
      icon: '/icon-192x192.png',
      badge: '/icon-192x192.png',
      tag: 'chikondi-feature',
      requireInteraction: false,
      data: {
        feature,
        timestamp: Date.now()
      }
    });

    notification.onclick = () => {
      window.focus();
      notification.close();
    };

    // Auto-close after 5 seconds
    setTimeout(() => {
      notification.close();
    }, 5000);

    analytics.trackEvent('feature_notification_shown', {
      feature_name: feature.title
    });

    return true;
  } catch (error) {
    console.error('Error showing feature notification:', error);
    return false;
  }
}

// Schedule periodic update checks
export function scheduleUpdateChecks() {
  if (!isPushNotificationSupported()) {
    return false;
  }

  // Check for updates every 6 hours
  setInterval(async () => {
    try {
      const { checkForUpdates } = await import('./appUpdates');
      const updateInfo = await checkForUpdates();
      
      if (updateInfo?.needsUpdate) {
        const settings = JSON.parse(localStorage.getItem('chikondi-notification-settings') || '{}');
        
        if (settings.showUpdateNotifications !== false) {
          showUpdateNotification(updateInfo);
        }
      }
    } catch (error) {
      console.error('Error in scheduled update check:', error);
    }
  }, 6 * 60 * 60 * 1000); // 6 hours

  return true;
}

// Get notification settings
export function getNotificationSettings() {
  const settings = localStorage.getItem('chikondi-notification-settings');
  return settings ? JSON.parse(settings) : {
    enabled: false,
    updateNotifications: true,
    featureAnnouncements: true,
    marketingMessages: false
  };
}

// Update notification settings
export function setNotificationSettings(settings) {
  localStorage.setItem('chikondi-notification-settings', JSON.stringify(settings));
  analytics.trackEvent('notification_settings_updated', settings);
}

// Initialize push notification system
export async function initializePushNotifications() {
  if (!isPushNotificationSupported()) {
    console.log('Push notifications not supported');
    return false;
  }

  try {
    // Register service worker if not already registered
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registered:', registration);
    }

    const settings = getNotificationSettings();
    
    if (settings.enabled && Notification.permission === 'default') {
      // Don't auto-request permission, let user choose
      console.log('Notification permission not granted yet');
    }

    // Schedule update checks if notifications are enabled
    if (settings.enabled && Notification.permission === 'granted') {
      scheduleUpdateChecks();
    }

    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
}

// Show welcome notification for new features
export function showWelcomeNotification() {
  if (!isPushNotificationSupported() || Notification.permission !== 'granted') {
    return false;
  }

  const notification = new Notification('Welcome to Chikondi POS! 🎉', {
    body: 'Your offline-first POS system is ready to help grow your business.',
    icon: '/icon-192x192.png',
    badge: '/icon-192x192.png',
    tag: 'chikondi-welcome',
    requireInteraction: false
  });

  notification.onclick = () => {
    window.focus();
    notification.close();
  };

  setTimeout(() => {
    notification.close();
  }, 5000);

  analytics.trackEvent('welcome_notification_shown');
  return true;
}

export default {
  isPushNotificationSupported,
  requestNotificationPermission,
  showUpdateNotification,
  showFeatureAnnouncement,
  scheduleUpdateChecks,
  getNotificationSettings,
  setNotificationSettings,
  initializePushNotifications,
  showWelcomeNotification
};