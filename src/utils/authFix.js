// Authentication Flow Fix for Chikondi POS
import { getUser, logoutUser, hasUserEverBeenSetup, markUserAsSetup } from './dbUnified';

// Debug authentication state
export async function debugAuthState() {
  try {
    const user = await getUser();
    const everSetup = await hasUserEverBeenSetup();
    const setupFlag = localStorage.getItem('chikondi-ever-setup');
    
    console.log('🔍 Auth Debug State:', {
      hasUser: !!user,
      userExists: user ? 'YES' : 'NO',
      everSetupFlag: everSetup,
      localStorageFlag: setupFlag,
      shouldShowLogin: !user && everSetup,
      shouldShowSetup: !user && !everSetup
    });
    
    return {
      hasUser: !!user,
      everSetup,
      setupFlag,
      shouldShowLogin: !user && everSetup,
      shouldShowSetup: !user && !everSetup
    };
  } catch (error) {
    console.error('Auth debug error:', error);
    return null;
  }
}

// Fix authentication state
export async function fixAuthState() {
  try {
    const user = await getUser();
    const everSetup = await hasUserEverBeenSetup();
    
    console.log('🔧 Fixing auth state...', { hasUser: !!user, everSetup });
    
    // If user exists but no setup flag, mark as setup
    if (user && !everSetup) {
      console.log('✅ User exists but no setup flag - marking as setup');
      await markUserAsSetup();
      return { fixed: true, action: 'marked_as_setup' };
    }
    
    // If no user but setup flag exists, this is correct (logged out state)
    if (!user && everSetup) {
      console.log('✅ Correct logout state - user logged out but was setup before');
      return { fixed: false, action: 'already_correct' };
    }
    
    // If no user and no setup flag, this is a new user
    if (!user && !everSetup) {
      console.log('✅ New user state - should show setup');
      return { fixed: false, action: 'new_user' };
    }
    
    return { fixed: false, action: 'no_action_needed' };
  } catch (error) {
    console.error('Error fixing auth state:', error);
    return { fixed: false, error: error.message };
  }
}

// Safe logout that preserves setup state
export async function safeLogout() {
  try {
    console.log('🚪 Performing safe logout...');
    
    // Debug state before logout
    await debugAuthState();
    
    // Perform logout
    await logoutUser();
    
    // Verify setup flag is preserved
    const everSetup = await hasUserEverBeenSetup();
    if (!everSetup) {
      console.warn('⚠️ Setup flag was lost during logout - restoring it');
      await markUserAsSetup();
    }
    
    // Debug state after logout
    await debugAuthState();
    
    console.log('✅ Safe logout completed');
    return { success: true };
  } catch (error) {
    console.error('Safe logout error:', error);
    return { success: false, error: error.message };
  }
}

// Emergency auth reset
export function emergencyAuthReset() {
  try {
    console.log('🚨 Emergency auth reset...');
    
    // Clear all auth-related localStorage
    localStorage.removeItem('chikondi-ever-setup');
    
    // This will force the user to setup again
    window.location.reload();
    
    return true;
  } catch (error) {
    console.error('Emergency reset error:', error);
    return false;
  }
}

// Check if auth state is corrupted
export async function isAuthStateCorrupted() {
  try {
    const user = await getUser();
    const everSetup = await hasUserEverBeenSetup();
    const setupFlag = localStorage.getItem('chikondi-ever-setup');
    
    // Corruption scenarios:
    // 1. User exists but no setup flag
    if (user && !everSetup) {
      return { corrupted: true, reason: 'user_exists_no_setup_flag' };
    }
    
    // 2. Setup flag is not 'true' but exists
    if (setupFlag && setupFlag !== 'true') {
      return { corrupted: true, reason: 'invalid_setup_flag_value' };
    }
    
    return { corrupted: false };
  } catch (error) {
    return { corrupted: true, reason: 'database_error', error: error.message };
  }
}

// Auto-fix auth issues
export async function autoFixAuth() {
  try {
    const corruption = await isAuthStateCorrupted();
    
    if (corruption.corrupted) {
      console.log('🔧 Auto-fixing auth corruption:', corruption.reason);
      
      switch (corruption.reason) {
        case 'user_exists_no_setup_flag':
          await markUserAsSetup();
          return { fixed: true, action: 'restored_setup_flag' };
          
        case 'invalid_setup_flag_value':
          localStorage.setItem('chikondi-ever-setup', 'true');
          return { fixed: true, action: 'fixed_setup_flag_value' };
          
        case 'database_error':
          // Try to restore from localStorage backup
          const hasBackup = localStorage.getItem('chikondi-user-backup');
          if (hasBackup) {
            console.log('Attempting to restore from backup...');
            // This would need implementation
          }
          return { fixed: false, action: 'database_error_needs_manual_fix' };
          
        default:
          return { fixed: false, action: 'unknown_corruption' };
      }
    }
    
    return { fixed: false, action: 'no_corruption_found' };
  } catch (error) {
    console.error('Auto-fix error:', error);
    return { fixed: false, error: error.message };
  }
}

export default {
  debugAuthState,
  fixAuthState,
  safeLogout,
  emergencyAuthReset,
  isAuthStateCorrupted,
  autoFixAuth
};