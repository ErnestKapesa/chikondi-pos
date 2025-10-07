import { useState, useEffect } from 'react';
import { setUser, getUser } from '../utils/db';

export default function Login({ onLogin }) {
  const [pin, setPin] = useState('');
  const [isSetup, setIsSetup] = useState(false);
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [shopName, setShopName] = useState('');
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

    await setUser({
      pin: newPin,
      shopName: shopName.trim(),
      createdAt: Date.now()
    });

    onLogin();
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

  if (isSetup) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-2 text-primary">Chikondi POS</h1>
          <p className="text-center text-gray-600 mb-6">Setup Your Account</p>
          
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
        <h1 className="text-3xl font-bold text-center mb-2 text-primary">Chikondi POS</h1>
        <p className="text-center text-gray-600 mb-6">Enter Your PIN</p>
        
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
        </form>
      </div>
    </div>
  );
}
