// User Session Management for Chikondi POS
import { getUser, setUser, logoutUser, hasUserEverBeenSetup, markUserAsSetup } from './db';

// Session states
export const SESSION_STATES = {
  NEW_USER: 'new_user',           // Never been set up
  EXISTING_USER: 'existing_user', // User data exists
  LOGGED_OUT: 'logged_out',       // Was set up but logged out
  SESSION_EXPIRED: 'expired'      // Data was cleared but was set up before
};

// Get current session state
export async function getSessionState() {
  const user = await getUser();
  const everSetup = await hasUserEverBeenSetup();
  
  if (user) {
    return {
      state: SESSION_STATES.EXISTING_USER,
      user,
      needsLogin: false,
      needsSetup: false
    };
  } else if (everSetup) {
    return {
      state: SESSION_STATES.LOGGED_OUT,
      user: null,
      needsLogin: true,
      needsSetup: false
    };
  } else {
    return {
      state: SESSION_STATES.NEW_USER,
      user: null,
      needsLogin: false,
      needsSetup: true
    };
  }
}

// Initialize new user
export async function initializeUser(userData) {
  try {
    await setUser(userData);
    await markUserAsSetup();
    return { success: true };
  } catch (error) {
    console.error('Error initializing user:', error);
    return { success: false, error: error.message };
  }
}

// Authenticate existing user
export async function authenticateUser(pin) {
  try {
    const user = await getUser();
    
    if (!user) {
      const everSetup = await hasUserEverBeenSetup();
      if (everSetup) {
        return { 
          success: false, 
          error: 'Session expired. Please set up your account again.',
          needsSetup: true
        };
      } else {
        return { 
          success: false, 
          error: 'No account found. Please set up your account first.',
          needsSetup: true
        };
      }
    }
    
    if (user.pin === pin) {
      return { success: true, user };
    } else {
      return { success: false, error: 'Incorrect PIN' };
    }
  } catch (error) {
    console.error('Error authenticating user:', error);
    return { success: false, error: 'Authentication failed' };
  }
}

// Safe logout (preserves setup state)
export async function safeLogout() {
  try {
    await logoutUser();
    return { success: true };
  } catch (error) {
    console.error('Error during logout:', error);
    return { success: false, error: error.message };
  }
}

// Reset everything (for new shop setup)
export async function resetForNewShop() {
  try {
    await logoutUser();
    localStorage.removeItem('chikondi-ever-setup');
    localStorage.removeItem('chikondi-tutorial-completed');
    return { success: true };
  } catch (error) {
    console.error('Error resetting for new shop:', error);
    return { success: false, error: error.message };
  }
}

// Get user display info
export function getUserDisplayInfo(user) {
  if (!user) return null;
  
  return {
    shopName: user.shopName,
    currency: user.currency,
    createdAt: user.createdAt,
    memberSince: new Date(user.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    })
  };
}

// Session analytics
export function getSessionAnalytics() {
  const setupTime = localStorage.getItem('chikondi-ever-setup-time');
  const lastLogin = localStorage.getItem('chikondi-last-login');
  const loginCount = parseInt(localStorage.getItem('chikondi-login-count') || '0');
  
  return {
    setupTime: setupTime ? new Date(setupTime) : null,
    lastLogin: lastLogin ? new Date(lastLogin) : null,
    loginCount,
    isReturningUser: loginCount > 1
  };
}

// Track login
export function trackLogin() {
  const now = new Date().toISOString();
  const loginCount = parseInt(localStorage.getItem('chikondi-login-count') || '0') + 1;
  
  localStorage.setItem('chikondi-last-login', now);
  localStorage.setItem('chikondi-login-count', loginCount.toString());
  
  if (!localStorage.getItem('chikondi-ever-setup-time')) {
    localStorage.setItem('chikondi-ever-setup-time', now);
  }
}

export default {
  getSessionState,
  initializeUser,
  authenticateUser,
  safeLogout,
  resetForNewShop,
  getUserDisplayInfo,
  getSessionAnalytics,
  trackLogin,
  SESSION_STATES
};