// User Verification and Re-login Fix
// Handles existing user verification and smooth re-login

import { getUser, setUser, hasUserEverBeenSetup, markUserAsSetup } from './dbUnified';

// Verify if a user account actually exists with proper data
export async function verifyUserAccount() {
  try {
    const user = await getUser();
    const everSetup = await hasUserEverBeenSetup();
    
    console.log('🔍 Verifying user account:', {
      hasUser: !!user,
      everSetup,
      userValid: user && user.pin && user.shopName
    });
    
    // Check if user data is complete and valid
    if (user) {
      const isValidUser = user.pin && user.shopName && user.createdAt;
      
      if (!isValidUser) {
        console.warn('⚠️ User data is incomplete:', {
          hasPin: !!user.pin,
          hasShopName: !!user.shopName,
          hasCreatedAt: !!user.createdAt
        });
        
        return {
          valid: false,
          reason: 'incomplete_user_data',
          user: user
        };
      }
      
      return {
        valid: true,
        reason: 'user_exists',
        user: user
      };
    }
    
    // No user but setup flag exists - this is a logged out state
    if (!user && everSetup) {
      return {
        valid: false,
        reason: 'user_logged_out',
        shouldShowLogin: true
      };
    }
    
    // No user and no setup flag - new user
    if (!user && !everSetup) {
      return {
        valid: false,
        reason: 'new_user',
        shouldShowSetup: true
      };
    }
    
    return {
      valid: false,
      reason: 'unknown_state'
    };
    
  } catch (error) {
    console.error('❌ User verification failed:', error);
    return {
      valid: false,
      reason: 'verification_error',
      error: error.message
    };
  }
}

// Enhanced PIN verification with detailed logging
export async function verifyUserPin(inputPin) {
  try {
    const verification = await verifyUserAccount();
    
    if (!verification.valid) {
      return {
        success: false,
        reason: verification.reason,
        message: getUserFriendlyMessage(verification.reason)
      };
    }
    
    const user = verification.user;
    
    // Test PIN matching with multiple methods
    const pinTests = {
      direct: inputPin === user.pin,
      string: String(inputPin) === String(user.pin),
      trimmed: String(inputPin).trim() === String(user.pin).trim(),
      number: Number(inputPin) === Number(user.pin)
    };
    
    console.log('🔍 PIN verification tests:', {
      inputPin: inputPin,
      storedPin: user.pin,
      tests: pinTests
    });
    
    const pinMatches = Object.values(pinTests).some(test => test === true);
    
    if (pinMatches) {
      return {
        success: true,
        user: user,
        method: Object.keys(pinTests).find(key => pinTests[key])
      };
    } else {
      return {
        success: false,
        reason: 'incorrect_pin',
        message: 'Incorrect PIN. Please try again.'
      };
    }
    
  } catch (error) {
    console.error('❌ PIN verification failed:', error);
    return {
      success: false,
      reason: 'verification_error',
      message: 'Login verification failed. Please try again.'
    };
  }
}

// Get user-friendly error messages
function getUserFriendlyMessage(reason) {
  switch (reason) {
    case 'incomplete_user_data':
      return 'Your account data is incomplete. Please use the emergency reset option.';
    case 'user_logged_out':
      return 'Please enter your PIN to log back in.';
    case 'new_user':
      return 'Welcome! Please set up your account.';
    case 'verification_error':
      return 'Unable to verify your account. Please try again.';
    default:
      return 'Please check your login details and try again.';
  }
}

// Fix corrupted user data
export async function repairUserData(user) {
  try {
    console.log('🔧 Repairing user data...');
    
    // Ensure all required fields exist
    const repairedUser = {
      ...user,
      pin: user.pin || '',
      shopName: user.shopName || 'My Shop',
      currency: user.currency || 'USD',
      createdAt: user.createdAt || Date.now(),
      updatedAt: Date.now(),
      securityQuestion: user.securityQuestion || '',
      securityAnswer: user.securityAnswer || '',
      lastPinReset: user.lastPinReset || Date.now(),
      pinResetCount: user.pinResetCount || 0,
      securityLevel: user.securityLevel || 'standard'
    };
    
    // Save repaired user data
    await setUser(repairedUser);
    
    // Ensure setup flag is set
    await markUserAsSetup();
    
    console.log('✅ User data repaired successfully');
    return { success: true, user: repairedUser };
    
  } catch (error) {
    console.error('❌ User data repair failed:', error);
    return { success: false, error: error.message };
  }
}

// Enhanced login flow for existing users
export async function enhancedLogin(inputPin) {
  try {
    console.log('🔐 Starting enhanced login process...');
    
    // Step 1: Verify user account
    const verification = await verifyUserAccount();
    console.log('🔍 Account verification:', verification);
    
    // Step 2: Handle different verification results
    if (verification.reason === 'incomplete_user_data') {
      // Try to repair user data
      const repair = await repairUserData(verification.user);
      if (!repair.success) {
        return {
          success: false,
          reason: 'repair_failed',
          message: 'Account data is corrupted. Please use emergency reset.',
          showEmergencyReset: true
        };
      }
      // Continue with repaired user
    } else if (verification.reason === 'user_logged_out') {
      return {
        success: false,
        reason: 'no_user_data',
        message: 'Your session has expired. Please set up your account again.',
        showSetup: true
      };
    } else if (verification.reason === 'new_user') {
      return {
        success: false,
        reason: 'new_user',
        message: 'Welcome! Please set up your account.',
        showSetup: true
      };
    } else if (!verification.valid) {
      return {
        success: false,
        reason: verification.reason,
        message: getUserFriendlyMessage(verification.reason)
      };
    }
    
    // Step 3: Verify PIN
    const pinVerification = await verifyUserPin(inputPin);
    console.log('🔍 PIN verification:', pinVerification);
    
    if (pinVerification.success) {
      console.log('✅ Enhanced login successful');
      return {
        success: true,
        user: pinVerification.user,
        method: pinVerification.method
      };
    } else {
      return pinVerification;
    }
    
  } catch (error) {
    console.error('❌ Enhanced login failed:', error);
    return {
      success: false,
      reason: 'login_error',
      message: 'Login failed due to a technical issue. Please try again.'
    };
  }
}

// Export for console debugging
if (typeof window !== 'undefined') {
  window.userVerification = {
    verify: verifyUserAccount,
    verifyPin: verifyUserPin,
    repair: repairUserData,
    enhancedLogin: enhancedLogin
  };
}

export default {
  verifyUserAccount,
  verifyUserPin,
  repairUserData,
  enhancedLogin
};