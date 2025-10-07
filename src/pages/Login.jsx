import { useState, useEffect } from 'react';
import { setUser, getUser } from '../utils/db';
import { CURRENCIES, POPULAR_CURRENCIES, DEFAULT_CURRENCY } from '../utils/currencies';

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

  useEffect(() => {
    checkSetup();
  }, []);

  const checkSetup = async () => {
    const user = await getUser();
    setIsSetup(!user);
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');

    if (newPin.length < 4) {
      setError('PIN must be at least 4 digits');
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

    await setUser({
      pin: newPin,
      shopName: shopName.trim(),
      currency: currency,
      securityQuestion: securityQuestion.trim(),
      securityAnswer: securityAnswer.trim().toLowerCase(),
      createdAt: Date.now()
    });

    onLogin();
  };

  const handlePinReset = async (e) => {
    e.preventDefault();
    setError('');

    const user = await getUser();
    if (!user) {
      setError('No account found');
      return;
    }

    if (resetAnswer.trim().toLowerCase() !== user.securityAnswer) {
      setError('Incorrect security answer');
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

    await setUser({
      ...user,
      pin: newPin
    });

    setShowPinReset(false);
    setError('');
    alert('PIN reset successfully!');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    const user = await getUser();
    if (user && user.pin === pin) {
      onLogin();
    } else {
      setError('Incorrect PIN');
      setPin('');
    }
  };

  if (showPinReset) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <div className="text-center mb-6">
            <img src="/logo.svg" alt="Chikondi POS" className="w-16 h-16 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-primary">Reset PIN</h1>
            <p className="text-gray-600">Answer your security question</p>
          </div>
          
          <form onSubmit={handlePinReset} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Security Question</label>
              <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                {JSON.parse(localStorage.getItem('chikondi-user') || '{}').securityQuestion || 'No question found'}
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
            <img src="/logo.svg" alt="Chikondi POS" className="w-16 h-16 mx-auto mb-2" />
            <h1 className="text-3xl font-bold text-primary">Chikondi POS</h1>
            <p className="text-gray-600">Setup Your Account</p>
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
                onChange={(e) => setNewPin(e.target.value)}
                className="input-field"
                placeholder="Enter 4-digit PIN"
                maxLength="6"
                required
              />
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
          <img src="/logo.svg" alt="Chikondi POS" className="w-16 h-16 mx-auto mb-2" />
          <h1 className="text-3xl font-bold text-primary">Chikondi POS</h1>
          <p className="text-gray-600">Enter Your PIN</p>
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

          <button 
            type="button"
            onClick={() => setShowPinReset(true)}
            className="w-full text-center text-primary text-sm hover:underline"
          >
            Forgot PIN?
          </button>
        </form>
      </div>
    </div>
  );
}
