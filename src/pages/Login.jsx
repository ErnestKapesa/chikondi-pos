import { useState, useEffect } from 'react';
import { setUser, getUser, hasUserEverBeenSetup, markUserAsSetup } from '../utils/db';
import { CURRENCIES, POPULAR_CURRENCIES, DEFAULT_CURRENCY } from '../utils/currencies';
import { BrandLogo } from '../components/Typography';
import { 
  validatePinStrength, 
  trackLoginAttempt, 
  isAccountLocked, 
  clearLoginAttempts,
  SECURITY_CONFIG 
} from '../utils/security';
import { debugAuthState, autoFixAuth } from '../utils/authFix';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [shopName, setShopName] = useState('');
  const [currency, setCurrency] = useState(DEFAULT_CURRENCY);
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [securityAnswer, setSecurityAnswer] = useState('');
  const [showPinReset, setShowPinReset] = useState(false);
  const [resetAnswer, setResetAnswer] = useState('');
  const [error, setError] = useState('');
  const [existingUser, setExistingUser] = useState(null);
  const [resetUser, setResetUser] = useState(null);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutTime, setLockoutTime] = useState(0);
  const [pinStrength, setPinStrength] = useState({ isValid: true, errors: [], strength: 0 });

  useEffect(() => {
    checkSetup();
    checkAccountLock();
  }, []);

  useEffect(() => {
    if (lockoutTime > 0) {
      const timer = setInterval(() => {
        const remaining = lockoutTime - Date.now();
        if (remaining <= 0) {
          setIsLocked(false);
          setLockoutTime(0);
          clearInterval(timer);
        }
      }, 1000);
      
      return () => clearInterval(timer);
    }
  }, [lockoutTime]);

  const checkAccountLock = () => {
    const lockStatus = isAccountLocked();
    if (lockStatus.locked) {
      setIsLocked(true);
      setLockoutTime(lockStatus.unlockTime);
      setError(`Account locked due to too many failed attempts. Try again in ${Math.ceil(lockStatus.remainingTime / 60000)} minutes.`);
    }
  };

  const checkSetup = async () => {
    try {
      // Debug current auth state
      await debugAuthState();
      
      // Auto-fix any auth issues
      const fixResult = await autoFixAuth();
      if (fixResult.fixed) {
        console.log('🔧 Auth issue auto-fixed:', fixResult.action);
      }
      
      const user = await getUser();
      const everSetup = await hasUserEverBeenSetup();
      
      console.log('🔍 Auth Check:', { 
        hasUser: !!user, 
        everSetup, 
        userShopName: user?.shopName 
      });
      
      if (user) {
        // User exists, show login
        console.log('✅ User exists - showing login');
        setExistingUser(user);
        setIsSetup(false);
      } else if (everSetup) {
        // User logged out but was setup before, show login
        console.log('✅ User logged out - showing login (not setup)');
        setExistingUser(null);
        setIsSetup(false);
      } else {
        // Truly new user, show setup
        console.log('✅ New user - showing setup');
        setExistingUser(null);
        setIsSetup(true);
      }
    } catch (error) {
      console.error('Error in checkSetup:', error);
      // Fallback to safe state
      setIsSetup(true);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');

    // Validate PIN strength
    const pinValidation = validatePinStrength(newPin);
    if (!pinValidation.isValid) {
      setError(pinValidation.errors[0]);
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    if (!shopName.trim()) {
      setError('Shop name is required');
      return;
    }

    if (!securityQuestion.trim() || !securityAnswer.trim()) {
      setError('Security question and answer are required');
      return;
    }

    if (securityAnswer.trim().length < 2) {
      setError('Security answer must be at least 2 characters');
      return;
    }

    await setUser({
      pin: newPin,
      shopName: shopName.trim(),
      currency: currency,
      securityQuestion: securityQuestion.trim(),
      securityAnswer: securityAnswer.trim().toLowerCase(),
      createdAt: Date.now(),
      lastPinReset: Date.now(),
      pinResetCount: 0,
      securityLevel: 'standard'
    });

    // Mark that user has been set up
    await markUserAsSetup();

    // Clear any previous login attempts
    clearLoginAttempts();

    onLogin();
  };

  const handlePinChange = (value) => {
    setNewPin(value);
    if (value) {
      const validation = validatePinStrength(value);
      setPinStrength(validation);
    } else {
      setPinStrength({ isValid: true, errors: [], strength: 0 });
    }
  };

  const handlePinReset = async (e) => {
    e.preventDefault();
    setError('');

    const user = resetUser || await getUser();
    if (!user) {
      setError('No account found. Please set up your account again.');
      setShowPinReset(false);
      setIsSetup(true);
      return;
    }

    if (!user.securityQuestion || !user.securityAnswer) {
      setError('Security question not found. Please set up your account again.');
      setShowPinReset(false);
      setIsSetup(true);
      return;
    }

    if (resetAnswer.trim().toLowerCase() !== user.securityAnswer.toLowerCase()) {
      setError('Incorrect security answer. Please try again.');
      return;
    }

    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
      return;
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match');
      return;
    }

    // Enhanced security: Update PIN with timestamp
    await setUser({
      ...user,
      pin: newPin,
      lastPinReset: Date.now(),
      pinResetCount: (user.pinResetCount || 0) + 1
    });

    setShowPinReset(false);
    setNewPin('');
    setConfirmPin('');
    setResetAnswer('');
    setError('');
    
    alert('PIN reset successfully! You can now log in with your new PIN.');
  };

  const handleShowPinReset = async () => {
    const user = await getUser();
    if (!user) {
      setError('No account found. Please set up your account first.');
      return;
    }
    
    if (!user.securityQuestion) {
      setError('Security question not set up. Please contact support.');
      return;
    }
    
    setResetUser(user);
    setShowPinReset(true);
    setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Check if account is locked
    const lockStatus = isAccountLocked();
    if (lockStatus.locked) {
      setIsLocked(true);
      setLockoutTime(lockStatus.unlockTime);
      setError(`Account locked. Try again in ${Math.ceil(lockStatus.remainingTime / 60000)} minutes.`);
      return;
    }

    const user = await getUser();
    if (user && user.pin === pin) {
      // Successful login
      trackLoginAttempt(true, pin);
      clearLoginAttempts();
      onLogin();
    } else {
      // Failed login
      trackLoginAttempt(false, pin);
      
      const everSetup = await hasUserEverBeenSetup();
      if (everSetup && !user) {
        setError('Session expired. Please set up your account again.');
        setIsSetup(true);
      } else {
        const attempts = JSON.parse(localStorage.getItem('chikondi-login-attempts') || '[]');
        const recentFailedAttempts = attempts.filter(a => 
          !a.success && (Date.now() - a.timestamp) < 60 * 60 * 1000
        ).length;
        
        const remainingAttempts = SECURITY_CONFIG.MAX_LOGIN_ATTEMPTS - recentFailedAttempts;
        
        if (remainingAttempts <= 1) {
          setError(`Incorrect PIN. Account will be locked after ${remainingAttempts} more failed attempt(s).`);
        } else {
          setError(`Incorrect PIN. ${remainingAttempts} attempts remaining.`);
        }
      }
      setPin('');
    }
  };

  if (showPinReset) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
              <BrandLogo size="xxl" variant="default" />
            </div>
            <p className="text-gray-600 font-medium">Reset Your PIN</p>
            <p className="text-sm text-gray-500">Answer your security question</p>
          </div>
          
          <form onSubmit={handlePinReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Security Question</label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {resetUser?.securityQuestion || 'Loading security question...'}
              </p>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Your Answer</label>
              <input
                type="text"
                value={resetAnswer}
                onChange={(e) => setResetAnswer(e.target.value)}
                className="input-field"
                placeholder="Enter your answer"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => setNewPin(e.target.value)}
                className="input-field"
                placeholder="Enter new PIN"
                maxLength="6"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confirm New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="input-field"
                placeholder="Re-enter new PIN"
                maxLength="6"
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <div className="flex gap-3">
              <button 
                type="button" 
                onClick={() => setShowPinReset(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button type="submit" className="btn-primary flex-1">
                Reset PIN
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isSetup) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="text-center mb-6">
            <div className="mb-4 flex justify-center">
              <BrandLogo size="xxl" variant="default" />
            </div>
            <p className="text-gray-600 font-medium">Setup Your Account</p>
          </div>
          
          <form onSubmit={handleSetup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Shop Name</label>
              <input
                type="text"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
                className="input-field"
                placeholder="Enter your shop name"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Currency</label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="input-field"
                required
              >
                <optgroup label="Popular Currencies">
                  {POPULAR_CURRENCIES.map(code => {
                    const curr = CURRENCIES.find(c => c.code === code);
                    return (
                      <option key={code} value={code}>
                        {curr.symbol} - {curr.name} ({code})
                      </option>
                    );
                  })}
                </optgroup>
                <optgroup label="All Currencies">
                  {CURRENCIES.filter(c => !POPULAR_CURRENCIES.includes(c.code)).map(curr => (
                    <option key={curr.code} value={curr.code}>
                      {curr.symbol} - {curr.name} ({curr.code})
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Create PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={newPin}
                onChange={(e) => handlePinChange(e.target.value)}
                className={`input-field ${!pinStrength.isValid ? 'border-red-500' : ''}`}
                placeholder="Enter 4-8 digit PIN"
                maxLength="8"
                required
              />
              
              {newPin && (
                <div className="mt-2">
                  {/* PIN Strength Indicator */}
                  <div className="flex items-center gap-2 mb-1">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          pinStrength.strength < 30 ? 'bg-red-500' :
                          pinStrength.strength < 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: `${pinStrength.strength}%` }}
                      />
                    </div>
                    <span className={`text-xs font-medium ${
                      pinStrength.strength < 30 ? 'text-red-600' :
                      pinStrength.strength < 60 ? 'text-yellow-600' :
                      'text-green-600'
                    }`}>
                      {pinStrength.strength < 30 ? 'Weak' :
                       pinStrength.strength < 60 ? 'Fair' : 'Strong'}
                    </span>
                  </div>
                  
                  {/* PIN Validation Errors */}
                  {pinStrength.errors.length > 0 && (
                    <div className="text-red-600 text-xs">
                      {pinStrength.errors[0]}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={confirmPin}
                onChange={(e) => setConfirmPin(e.target.value)}
                className="input-field"
                placeholder="Re-enter PIN"
                maxLength="6"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Security Question (for PIN recovery)</label>
              <select
                value={securityQuestion}
                onChange={(e) => setSecurityQuestion(e.target.value)}
                className="input-field"
                required
              >
                <option value="">Choose a security question</option>
                <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                <option value="What was the name of your first pet?">What was the name of your first pet?</option>
                <option value="What city were you born in?">What city were you born in?</option>
                <option value="What is your favorite food?">What is your favorite food?</option>
                <option value="What was your first job?">What was your first job?</option>
                <option value="What is your best friend's name?">What is your best friend's name?</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Security Answer</label>
              <input
                type="text"
                value={securityAnswer}
                onChange={(e) => setSecurityAnswer(e.target.value)}
                className="input-field"
                placeholder="Enter your answer"
                required
              />
            </div>

            {error && <p className="text-red-600 text-sm">{error}</p>}
            
            <button type="submit" className="btn-primary w-full">
              Setup Account
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
        <div className="text-center mb-6">
          <div className="mb-4 flex justify-center">
            <BrandLogo size="xxl" variant="default" />
          </div>
          {existingUser ? (
            <div className="mb-2">
              <p className="text-gray-800 font-semibold text-lg">{existingUser.shopName}</p>
              <p className="text-gray-600 font-medium">Welcome back! Enter your PIN</p>
            </div>
          ) : (
            <p className="text-gray-600 font-medium">Enter Your PIN</p>
          )}
        </div>
        
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="password"
            inputMode="numeric"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            className="input-field text-center text-2xl tracking-widest"
            placeholder="••••"
            maxLength="6"
            autoFocus
            required
          />

          {error && <p className="text-red-600 text-sm text-center">{error}</p>}
          
          <button type="submit" className="btn-primary w-full">
            Login
          </button>

          <div className="flex justify-between">
            <button 
              type="button"
              onClick={handleShowPinReset}
              className="text-primary text-sm hover:underline"
            >
              Forgot PIN?
            </button>
            
            {existingUser && (
              <button 
                type="button"
                onClick={() => {
                  if (confirm('This will clear the current shop data and let you set up a new shop. Are you sure?')) {
                    localStorage.removeItem('chikondi-ever-setup');
                    setIsSetup(true);
                    setExistingUser(null);
                  }
                }}
                className="text-gray-500 text-sm hover:underline"
              >
                Not your shop?
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
