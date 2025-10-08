// Emergency update fix utilities
import { acceptUpdate, CURRENT_VERSION } from './appUpdates';

// Force complete a stuck update
export function forceCompleteUpdate() {
  try {
    // Mark current version as accepted
    acceptUpdate(CURRENT_VERSION);
    
    // Clear any stuck update states
    localStorage.removeItem('chikondi-update-in-progress');
    
    // Reload the page to clear any stuck states
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Error force completing update:', error);
    return false;
  }
}

// Check if update is stuck
export function isUpdateStuck() {
  const updateInProgress = localStorage.getItem('chikondi-update-in-progress');
  if (!updateInProgress) return false;
  
  const startTime = parseInt(updateInProgress);
  const now = Date.now();
  const timeElapsed = now - startTime;
  
  // Consider stuck if running for more than 2 minutes
  return timeElapsed > 2 * 60 * 1000;
}

// Mark update as started
export function markUpdateStarted() {
  localStorage.setItem('chikondi-update-in-progress', Date.now().toString());
}

// Clear update progress marker
export function clearUpdateProgress() {
  localStorage.removeItem('chikondi-update-in-progress');
}

// Emergency reset - clears all update states
export function emergencyReset() {
  try {
    // Clear all update-related localStorage items
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('chikondi-update-')) {
        keysToRemove.push(key);
      }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    
    // Set current version
    localStorage.setItem('chikondi-app-version', CURRENT_VERSION);
    
    // Reload page
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Emergency reset failed:', error);
    return false;
  }
}

export default {
  forceCompleteUpdate,
  isUpdateStuck,
  markUpdateStarted,
  clearUpdateProgress,
  emergencyReset
};