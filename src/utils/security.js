// Enhanced Security System for Chikondi POS
import { getUser, setUser } from './dbUnified';
import { analytics } from './analytics';

// Security configuration
export const SECURITY_CONFIG = {
  MIN_PIN_LENGTH: 4,
  MAX_PIN_LENGTH: 8,
  MAX_LOGIN_ATTEMPTS: 5,
  LOCKOUT_DURATION: 15 * 60 * 1000, // 15 minutes
  PIN_EXPIRY_DAYS: 90, // PIN expires after 90 days
  SECURITY_QUESTIONS: [
    "What is your mother's maiden name?",
    "What was the name of your first pet?",
    "What city were you born in?",
    "What is your favorite food?",
    "What was your first job?",
    "What is your best friend's name?",
    "What was the name of your first school?",
    "What is your favorite movie?",
    "What street did you grow up on?",
    "What is your favorite color?"
  ]
};

// Hash PIN for secure storage (simple hash for demo - use bcrypt in production)
export function hashPin(pin) {
  // Simple hash function (replace with bcrypt in production)
  let hash = 0;
  for (let i = 0; i < pin.length; i++) {
    const char = pin.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return hash.toString();
}

// Verify PIN against hash
export function verifyPin(pin, hash) {
  return hashPin(pin) === hash;
}

// Validate PIN strength
export function validatePinStrength(pin) {
  const errors = [];
  
  if (!pin || pin.length < SECURITY_CONFIG.MIN_PIN_LENGTH) {
    errors.push(`PIN must be at least ${SECURITY_CONFIG.MIN_PIN_LENGTH} digits`);
  }
  
  if (pin.length > SECURITY_CONFIG.MAX_PIN_LENGTH) {
    errors.push(`PIN must be no more than ${SECURITY_CONFIG.MAX_PIN_LENGTH} digits`);
  }
  
  if (!/^\d+$/.test(pin)) {
    errors.push('PIN must contain only numbers');
  }
  
  // Check for weak patterns
  if (pin === '1234' || pin === '0000' || pin === '1111') {
    errors.push('PIN is too weak. Avoid common patterns like 1234 or 0000');
  }
  
  // Check for repeated digits
  if (pin.length >= 4 && /^(.)\1{3,}$/.test(pin)) {
    errors.push('PIN cannot be all the same digit');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    strength: calculatePinStrength(pin)
  };
}

// Calculate PIN strength score
function calculatePinStrength(pin) {
  if (!pin) return 0;
  
  let score = 0;
  
  // Length bonus
  score += Math.min(pin.length * 10, 40);
  
  // Digit variety bonus
  const uniqueDigits = new Set(pin.split('')).size;
  score += uniqueDigits * 5;
  
  // Pattern penalty
  if (pin === '1234' || pin === '4321' || pin === '0000') {
    score -= 30;
  }
  
  // Sequential pattern penalty
  if (isSequential(pin)) {
    score -= 20;
  }
  
  return Math.max(0, Math.min(100, score));
}

// Check if PIN is sequential
function isSequential(pin) {
  for (let i = 0; i < pin.length - 1; i++) {
    const current = parseInt(pin[i]);
    const next = parseInt(pin[i + 1]);
    if (Math.abs(current - next) !== 1) {
      return false;
    }
  }
  return pin.length >= 3;
}

// Track login attempts
export function trackLoginAttempt(success, pin = null) {
  const attempts = JSON.parse(localStorage.getItem('chikondi-login-attempts') || '[]');
  const now = Date.now();
  
  // Clean old attempts (older than 1 hour)
  const recentAttempts = attempts.filter(attempt => now - attempt.timestamp < 60 * 60 * 1000);
  
  // Add new attempt
  recentAttempts.push({
    timestamp: now,
    success,
    pinLength: pin ? pin.length : null,
    ip: 'local' // In a real app, you'd get the actual IP
  });
  
  localStorage.setItem('chikondi-login-attempts', JSON.stringify(recentAttempts));
  
  // Analytics
  analytics.trackEvent('login_attempt', { success, attempts_count: recentAttempts.length });
  
  return recentAttempts;
}

// Check if account is locked due to failed attempts
export function isAccountLocked() {
  const attempts = JSON.parse(localStorage.getItem('chikondi-login-attempts') || '[]');
  const now = Date.now();
  
  // Count failed attempts in the last hour
  const recentFailedAttempts = attempts.filter(attempt => 
    !attempt.success && (now - attempt.timestamp) < 60 * 60 * 1000
  );
  
  if (recentFailedAttempts.length >= SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS) {
    const lastFailedAttempt = Math.max(...recentFailedAttempts.map(a => a.timestamp));
    const lockoutEnd = lastFailedAttempt + SECURITY_CONFIG.LOCKOUT_DURATION;
    
    if (now < lockoutEnd) {
      return {
        locked: true,
        unlockTime: lockoutEnd,
        remainingTime: lockoutEnd - now
      };
    }
  }
  
  return { locked: false };
}

// Clear login attempts (after successful login)
export function clearLoginAttempts() {
  localStorage.removeItem('chikondi-login-attempts');
}

// Check if PIN has expired
export function isPinExpired(user) {
  if (!user || !user.createdAt) return false;
  
  const pinAge = Date.now() - (user.lastPinReset || user.createdAt);
  const expiryTime = SECURITY_CONFIG.PIN_EXPIRY_DAYS * 24 * 60 * 60 * 1000;
  
  return pinAge > expiryTime;
}

// Generate security audit log
export async function generateSecurityAudit() {
  try {
    const user = await getUser();
    const attempts = JSON.parse(localStorage.getItem('chikondi-login-attempts') || '[]');
    const now = Date.now();
    
    return {
      user: {
        shopName: user?.shopName || 'Unknown',
        accountAge: user?.createdAt ? Math.floor((now - user.createdAt) / (24 * 60 * 60 * 1000)) : 0,
        pinAge: user?.lastPinReset ? Math.floor((now - user.lastPinReset) / (24 * 60 * 60 * 1000)) : 
                user?.createdAt ? Math.floor((now - user.createdAt) / (24 * 60 * 60 * 1000)) : 0,
        pinResetCount: user?.pinResetCount || 0,
        hasSecurityQuestion: !!(user?.securityQuestion && user?.securityAnswer)
      },
      security: {
        totalLoginAttempts: attempts.length,
        failedAttempts: attempts.filter(a => !a.success).length,
        successfulLogins: attempts.filter(a => a.success).length,
        lastLoginAttempt: attempts.length > 0 ? new Date(Math.max(...attempts.map(a => a.timestamp))) : null,
        accountLocked: isAccountLocked().locked,
        pinExpired: user ? isPinExpired(user) : false
      },
      recommendations: generateSecurityRecommendations(user, attempts)
    };
  } catch (error) {
    console.error('Error generating security audit:', error);
    return null;
  }
}

// Generate security recommendations
function generateSecurityRecommendations(user, attempts) {
  const recommendations = [];
  
  if (!user) {
    recommendations.push({
      type: 'critical',
      message: 'No user account found',
      action: 'Set up your account with a strong PIN and security question'
    });
    return recommendations;
  }
  
  // PIN strength check
  if (user.pin && user.pin.length < 6) {
    recommendations.push({
      type: 'warning',
      message: 'PIN is shorter than recommended',
      action: 'Consider using a 6-digit PIN for better security'
    });
  }
  
  // PIN age check
  if (isPinExpired(user)) {
    recommendations.push({
      type: 'warning',
      message: 'PIN is old and should be changed',
      action: 'Reset your PIN for better security'
    });
  }
  
  // Security question check
  if (!user.securityQuestion || !user.securityAnswer) {
    recommendations.push({
      type: 'critical',
      message: 'No security question set up',
      action: 'Add a security question for PIN recovery'
    });
  }
  
  // Failed attempts check
  const recentFailedAttempts = attempts.filter(a => 
    !a.success && (Date.now() - a.timestamp) < 24 * 60 * 60 * 1000
  );
  
  if (recentFailedAttempts.length > 2) {
    recommendations.push({
      type: 'warning',
      message: `${recentFailedAttempts.length} failed login attempts in the last 24 hours`,
      action: 'Monitor for unauthorized access attempts'
    });
  }
  
  return recommendations;
}

// Secure data export (with user consent)
export async function secureDataExport(userPin) {
  try {
    const user = await getUser();
    if (!user || !verifyPin(userPin, user.pin)) {
      throw new Error('Invalid PIN. Cannot export data.');
    }
    
    // Log the export attempt
    analytics.trackEvent('secure_data_export', {
      timestamp: Date.now(),
      dataTypes: ['user', 'sales', 'inventory', 'customers']
    });
    
    return {
      success: true,
      message: 'Data export authorized'
    };
  } catch (error) {
    analytics.trackEvent('secure_data_export_failed', {
      error: error.message
    });
    
    return {
      success: false,
      error: error.message
    };
  }
}

// Data encryption utilities (for sensitive data)
export function encryptSensitiveData(data, key) {
  // Simple XOR encryption (replace with AES in production)
  const encrypted = [];
  for (let i = 0; i < data.length; i++) {
    encrypted.push(data.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(String.fromCharCode(...encrypted));
}

export function decryptSensitiveData(encryptedData, key) {
  try {
    const data = atob(encryptedData);
    const decrypted = [];
    for (let i = 0; i < data.length; i++) {
      decrypted.push(String.fromCharCode(data.charCodeAt(i) ^ key.charCodeAt(i % key.length)));
    }
    return decrypted.join('');
  } catch (error) {
    console.error('Decryption failed:', error);
    return null;
  }
}

export default {
  hashPin,
  verifyPin,
  validatePinStrength,
  trackLoginAttempt,
  isAccountLocked,
  clearLoginAttempts,
  isPinExpired,
  generateSecurityAudit,
  secureDataExport,
  encryptSensitiveData,
  decryptSensitiveData,
  SECURITY_CONFIG
};