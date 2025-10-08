// Critical Authentication Repair Utility
// Fixes PIN recognition and authentication flow issues

import { getUser, setUser, hasUserEverBeenSetup, markUserAsSetup } from './dbUnified';
import { autoMigrate } from './dbMigration';

// Comprehensive authentication diagnosis
export async function diagnoseAuthIssue() {
  console.log('🔍 Starting comprehensive auth diagnosis...');
  
  try {
    // Step 1: Check database health
    const migrationResult = await autoMigrate();
    if (!migrationResult.success) {
      return {
        issue: 'database_corrupted',
        message: 'Database is corrupted and needs reset',
        solution: 'resetDatabase',
        details: migrationResult
      };
    }
    
    // Step 2: Check user data
    const user = await getUser();
    const everSetup = await hasUserEverBeenSetup();
    const setupFlag = localStorage.getItem('chikondi-ever-setup');
    
    console.log('🔍 Auth state:', { 
      hasUser: !!user, 
      everSetup, 
      setupFlag,
      userPin: user?.pin ? 'EXISTS' : 'MISSING'
    });
    
    // Step 3: Identify specific issues
    if (!user && !everSetup) {
      return {
        issue: 'new_user',
        message: 'This is a new user, should show setup',
        solution: 'showSetup'
      };
    }
    
    if (!user && everSetup) {
      return {
        issue: 'logged_out_user',
        message: 'User is logged out but was setup before, should show login',
        solution: 'showLogin'
      };
    }
    
    if (user && !everSetup) {
      return {
        issue: 'missing_setup_flag',
        message: 'User exists but setup flag is missing',
        solution: 'restoreSetupFlag'
      };
    }
    
    if (user && !user.pin) {
      return {
        issue: 'missing_pin',
        message: 'User exists but PIN is missing',
        solution: 'forceResetup'
      };
    }
    
    if (user && user.pin && everSetup) {
      return {
        issue: 'none',
        message: 'Authentication state appears normal',
        solution: 'checkPinMatching'
      };
    }
    
    return {
      issue: 'unknown',
      message: 'Unknown authentication state',
      solution: 'resetEverything'
    };
    
  } catch (error) {
    console.error('❌ Auth diagnosis failed:', error);
    return {
      issue: 'diagnosis_failed',
      message: `Diagnosis failed: ${error.message}`,
      solution: 'resetEverything',
      error: error
    };
  }
}

// Fix authentication issues based on diagnosis
export async function repairAuthentication(diagnosis) {
  console.log('🔧 Repairing authentication issue:', diagnosis.issue);
  
  try {
    switch (diagnosis.solution) {
      case 'showSetup':
        // Clear any corrupted data and show setup
        localStorage.removeItem('chikondi-ever-setup');
        return { success: true, action: 'redirect_to_setup' };
        
      case 'showLogin':
        // Ensure setup flag is correct and show login
        await markUserAsSetup();
        return { success: true, action: 'redirect_to_login' };
        
      case 'restoreSetupFlag':
        // Restore missing setup flag
        await markUserAsSetup();
        return { success: true, action: 'setup_flag_restored' };
        
      case 'forceResetup':
        // User data is corrupted, force complete reset
        await clearAllUserData();
        return { success: true, action: 'forced_reset_complete' };
        
      case 'checkPinMatching':
        // PIN matching issue - this needs special handling
        return await diagnosePinIssue();
        
      case 'resetEverything':
        // Nuclear option - reset everything
        await clearAllUserData();
        return { success: true, action: 'complete_reset' };
        
      case 'resetDatabase':
        // Database corruption - needs migration
        const migrationResult = await autoMigrate();
        return { 
          success: migrationResult.success, 
          action: 'database_reset',
          details: migrationResult
        };
        
      default:
        return { success: false, action: 'unknown_solution' };
    }
  } catch (error) {
    console.error('❌ Auth repair failed:', error);
    return { success: false, error: error.message };
  }
}

// Diagnose PIN matching issues
export async function diagnosePinIssue() {
  console.log('🔍 Diagnosing PIN matching issue...');
  
  try {
    const user = await getUser();
    
    if (!user) {
      return { success: false, issue: 'no_user_data' };
    }
    
    if (!user.pin) {
      return { success: false, issue: 'no_pin_stored' };
    }
    
    // Check if PIN is stored correctly
    console.log('🔍 PIN diagnosis:', {
      pinExists: !!user.pin,
      pinType: typeof user.pin,
      pinLength: user.pin?.length,
      shopName: user.shopName
    });
    
    // Test PIN format
    if (typeof user.pin !== 'string') {
      console.warn('⚠️ PIN is not stored as string, converting...');
      await setUser({
        ...user,
        pin: String(user.pin)
      });
      return { success: true, issue: 'pin_format_fixed' };
    }
    
    return { success: true, issue: 'pin_appears_normal' };
    
  } catch (error) {
    console.error('❌ PIN diagnosis failed:', error);
    return { success: false, error: error.message };
  }
}

// Clear all user data for fresh start
export async function clearAllUserData() {
  console.log('🧹 Clearing all user data...');
  
  try {
    // Clear database user data
    const db = await import('./dbUnified').then(m => m.initDB());
    await db.clear('user');
    
    // Clear localStorage flags
    localStorage.removeItem('chikondi-ever-setup');
    localStorage.removeItem('chikondi-tutorial-completed');
    localStorage.removeItem('chikondi-app-version');
    
    // Clear any cached auth data
    const authKeys = Object.keys(localStorage).filter(key => 
      key.startsWith('chikondi-') && 
      (key.includes('auth') || key.includes('login') || key.includes('pin'))
    );
    
    authKeys.forEach(key => localStorage.removeItem(key));
    
    console.log('✅ All user data cleared');
    return true;
  } catch (error) {
    console.error('❌ Failed to clear user data:', error);
    return false;
  }
}

// Test PIN matching with detailed logging
export async function testPinMatch(inputPin) {
  console.log('🔍 Testing PIN match...');
  
  try {
    const user = await getUser();
    
    if (!user) {
      console.log('❌ No user found');
      return { match: false, reason: 'no_user' };
    }
    
    if (!user.pin) {
      console.log('❌ No PIN stored');
      return { match: false, reason: 'no_pin_stored' };
    }
    
    console.log('🔍 PIN comparison:', {
      inputPin: inputPin,
      inputType: typeof inputPin,
      inputLength: inputPin?.length,
      storedPin: user.pin,
      storedType: typeof user.pin,
      storedLength: user.pin?.length,
      directMatch: inputPin === user.pin,
      stringMatch: String(inputPin) === String(user.pin)
    });
    
    // Try different comparison methods
    const directMatch = inputPin === user.pin;
    const stringMatch = String(inputPin) === String(user.pin);
    const trimmedMatch = String(inputPin).trim() === String(user.pin).trim();
    
    if (directMatch || stringMatch || trimmedMatch) {
      console.log('✅ PIN match successful');
      return { match: true, method: directMatch ? 'direct' : stringMatch ? 'string' : 'trimmed' };
    } else {
      console.log('❌ PIN match failed');
      return { match: false, reason: 'pin_mismatch' };
    }
    
  } catch (error) {
    console.error('❌ PIN test failed:', error);
    return { match: false, reason: 'test_error', error: error.message };
  }
}

// Emergency authentication reset (for users)
export function emergencyReset() {
  console.log('🚨 Emergency authentication reset...');
  
  try {
    // Show confirmation
    const confirmed = confirm(
      'This will reset all your account data and you will need to set up your shop again. ' +
      'Are you sure you want to continue?'
    );
    
    if (!confirmed) {
      return { success: false, reason: 'user_cancelled' };
    }
    
    // Clear everything
    clearAllUserData();
    
    // Reload page
    window.location.reload();
    
    return { success: true };
  } catch (error) {
    console.error('❌ Emergency reset failed:', error);
    return { success: false, error: error.message };
  }
}

// Auto-repair on app startup
export async function autoRepairAuth() {
  console.log('🔄 Auto-repairing authentication...');
  
  try {
    const diagnosis = await diagnoseAuthIssue();
    console.log('🔍 Diagnosis result:', diagnosis);
    
    if (diagnosis.issue === 'none') {
      console.log('✅ Authentication is healthy');
      return { success: true, action: 'no_repair_needed' };
    }
    
    const repair = await repairAuthentication(diagnosis);
    console.log('🔧 Repair result:', repair);
    
    return repair;
  } catch (error) {
    console.error('❌ Auto-repair failed:', error);
    return { success: false, error: error.message };
  }
}

// Export for debugging in console
if (typeof window !== 'undefined') {
  window.authRepair = {
    diagnose: diagnoseAuthIssue,
    repair: repairAuthentication,
    testPin: testPinMatch,
    emergencyReset: emergencyReset,
    clearData: clearAllUserData
  };
}

export default {
  diagnoseAuthIssue,
  repairAuthentication,
  diagnosePinIssue,
  testPinMatch,
  clearAllUserData,
  emergencyReset,
  autoRepairAuth
};