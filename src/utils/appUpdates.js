// App Update Management System for Chikondi POS
import { getUser } from './db';
import { analytics } from './analytics';

// App version management
export const APP_VERSIONS = {
  '1.0.0': {
    version: '1.0.0',
    name: 'Initial Release',
    features: ['Basic POS', 'Inventory', 'Sales'],
    releaseDate: '2024-12-01'
  },
  '1.1.0': {
    version: '1.1.0', 
    name: 'Customer Management',
    features: ['Customer Management', 'Data Export', 'Tutorial System'],
    releaseDate: '2025-01-07'
  },
  '1.2.0': {
    version: '1.2.0',
    name: 'Smart Invoices',
    features: ['PDF Invoice Generation', 'Analytics Integration', 'Enhanced Session Management'],
    releaseDate: '2025-01-08'
  }
};

export const CURRENT_VERSION = '1.2.0';

// Check if user needs update notification
export async function checkForUpdates() {
  try {
    const user = await getUser();
    if (!user) return null; // New users don't need update notifications
    
    const lastKnownVersion = localStorage.getItem('chikondi-app-version') || '1.0.0';
    const hasSeenUpdate = localStorage.getItem(`chikondi-update-${CURRENT_VERSION}-seen`);
    
    if (lastKnownVersion !== CURRENT_VERSION && !hasSeenUpdate) {
      return {
        needsUpdate: true,
        fromVersion: lastKnownVersion,
        toVersion: CURRENT_VERSION,
        newFeatures: getNewFeaturesSince(lastKnownVersion),
        isBreakingChange: isBreakingChange(lastKnownVersion, CURRENT_VERSION)
      };
    }
    
    return { needsUpdate: false };
  } catch (error) {
    console.error('Error checking for updates:', error);
    return null;
  }
}

// Get new features since last version
function getNewFeaturesSince(fromVersion) {
  const newFeatures = [];
  const versions = Object.keys(APP_VERSIONS).sort();
  const fromIndex = versions.indexOf(fromVersion);
  
  if (fromIndex === -1) return []; // Unknown version
  
  for (let i = fromIndex + 1; i < versions.length; i++) {
    const version = versions[i];
    if (APP_VERSIONS[version]) {
      newFeatures.push({
        version,
        name: APP_VERSIONS[version].name,
        features: APP_VERSIONS[version].features,
        releaseDate: APP_VERSIONS[version].releaseDate
      });
    }
  }
  
  return newFeatures;
}

// Check if update contains breaking changes
function isBreakingChange(fromVersion, toVersion) {
  // Define breaking changes between versions
  const breakingChanges = {
    '1.0.0_to_1.1.0': false, // Safe update
    '1.1.0_to_1.2.0': false, // Safe update
    '1.0.0_to_1.2.0': false  // Safe update (skipping versions)
  };
  
  const changeKey = `${fromVersion}_to_${toVersion}`;
  return breakingChanges[changeKey] || false;
}

// Mark update as seen
export function markUpdateAsSeen(version = CURRENT_VERSION) {
  localStorage.setItem(`chikondi-update-${version}-seen`, 'true');
  localStorage.setItem('chikondi-app-version', version);
  analytics.trackEvent('update_notification_seen', { version });
}

// Accept update
export function acceptUpdate(version = CURRENT_VERSION) {
  localStorage.setItem('chikondi-app-version', version);
  localStorage.setItem(`chikondi-update-${version}-accepted`, 'true');
  analytics.trackEvent('update_accepted', { version });
}

// Dismiss update (user chose to skip)
export function dismissUpdate(version = CURRENT_VERSION) {
  localStorage.setItem(`chikondi-update-${version}-dismissed`, 'true');
  analytics.trackEvent('update_dismissed', { version });
}

// Check if user dismissed this update
export function isUpdateDismissed(version = CURRENT_VERSION) {
  return localStorage.getItem(`chikondi-update-${version}-dismissed`) === 'true';
}

// Migrate user data if needed
export async function migrateUserData(fromVersion, toVersion) {
  try {
    console.log(`Migrating user data from ${fromVersion} to ${toVersion}`);
    
    // Add timeout to prevent hanging
    const migrationPromise = (async () => {
      // Version-specific migrations
      if (fromVersion === '1.0.0' && toVersion >= '1.1.0') {
        await migrateToV1_1_0();
      }
      
      if (fromVersion <= '1.1.0' && toVersion >= '1.2.0') {
        await migrateToV1_2_0();
      }
    })();
    
    // Race between migration and timeout
    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Migration timeout')), 10000); // 10 second timeout
    });
    
    await Promise.race([migrationPromise, timeoutPromise]);
    
    return { success: true };
  } catch (error) {
    console.error('Error migrating user data:', error);
    
    // If migration fails, still allow the update to continue
    // The app will work without the migration
    if (error.message === 'Migration timeout') {
      console.warn('Migration timed out, but update will continue');
      return { success: true, warning: 'Migration timed out but update completed' };
    }
    
    return { success: false, error: error.message };
  }
}

// Migration to v1.1.0 (Customer Management)
async function migrateToV1_1_0() {
  try {
    // Ensure customer database is initialized
    const { initCustomerDB } = await import('./customerDb');
    await initCustomerDB();
    
    // Mark tutorial as not completed for new features
    localStorage.removeItem('chikondi-tutorial-completed');
    
    console.log('✅ Migrated to v1.1.0: Customer Management ready');
  } catch (error) {
    console.error('Migration to v1.1.0 failed:', error);
    // Don't throw error, just log it - migration can continue
  }
}

// Migration to v1.2.0 (Smart Invoices)
async function migrateToV1_2_0() {
  try {
    // Initialize invoice-related settings
    const defaultBusinessInfo = {
      phone: '+265 123 456 789',
      email: 'business@example.com',
      address: 'Your Business Address'
    };
    
    if (!localStorage.getItem('chikondi-business-info')) {
      localStorage.setItem('chikondi-business-info', JSON.stringify(defaultBusinessInfo));
    }
    
    console.log('✅ Migrated to v1.2.0: Smart Invoices ready');
  } catch (error) {
    console.error('Migration to v1.2.0 failed:', error);
    // Don't throw error, just log it - migration can continue
  }
}

// Get update changelog
export function getUpdateChangelog(fromVersion, toVersion) {
  const newFeatures = getNewFeaturesSince(fromVersion);
  
  return {
    title: `Welcome to Chikondi POS ${toVersion}!`,
    subtitle: `Updated from v${fromVersion}`,
    features: newFeatures,
    highlights: getUpdateHighlights(fromVersion, toVersion)
  };
}

// Get key highlights for this update
function getUpdateHighlights(fromVersion, toVersion) {
  const highlights = [];
  
  if (fromVersion <= '1.0.0' && toVersion >= '1.1.0') {
    highlights.push({
      icon: '👥',
      title: 'Customer Management',
      description: 'Track customer purchases, loyalty points, and build relationships'
    });
    highlights.push({
      icon: '📤',
      title: 'Data Export',
      description: 'Backup your data with JSON, CSV, and business summary exports'
    });
    highlights.push({
      icon: '🎓',
      title: 'Interactive Tutorial',
      description: 'New user onboarding with step-by-step guidance'
    });
  }
  
  if (fromVersion <= '1.1.0' && toVersion >= '1.2.0') {
    highlights.push({
      icon: '📄',
      title: 'Smart Invoices',
      description: 'Generate professional PDF invoices offline with multiple templates'
    });
    highlights.push({
      icon: '📊',
      title: 'Analytics Integration',
      description: 'Track user behavior and app performance insights'
    });
    highlights.push({
      icon: '🔐',
      title: 'Enhanced Security',
      description: 'Improved session management and user authentication'
    });
  }
  
  return highlights;
}

// Check for critical updates that require immediate action
export function hasCriticalUpdate() {
  // Define critical updates that need immediate user attention
  const criticalVersions = ['2.0.0']; // Major version changes
  return criticalVersions.includes(CURRENT_VERSION);
}

// Get update notification settings
export function getUpdateNotificationSettings() {
  return {
    showUpdateNotifications: localStorage.getItem('chikondi-show-updates') !== 'false',
    autoAcceptMinorUpdates: localStorage.getItem('chikondi-auto-minor-updates') === 'true',
    lastNotificationShown: localStorage.getItem('chikondi-last-notification'),
    notificationFrequency: localStorage.getItem('chikondi-notification-frequency') || 'immediate'
  };
}

// Update notification preferences
export function setUpdateNotificationSettings(settings) {
  if (settings.showUpdateNotifications !== undefined) {
    localStorage.setItem('chikondi-show-updates', settings.showUpdateNotifications.toString());
  }
  if (settings.autoAcceptMinorUpdates !== undefined) {
    localStorage.setItem('chikondi-auto-minor-updates', settings.autoAcceptMinorUpdates.toString());
  }
  if (settings.notificationFrequency !== undefined) {
    localStorage.setItem('chikondi-notification-frequency', settings.notificationFrequency);
  }
}

export default {
  checkForUpdates,
  markUpdateAsSeen,
  acceptUpdate,
  dismissUpdate,
  isUpdateDismissed,
  migrateUserData,
  getUpdateChangelog,
  hasCriticalUpdate,
  getUpdateNotificationSettings,
  setUpdateNotificationSettings,
  CURRENT_VERSION,
  APP_VERSIONS
};