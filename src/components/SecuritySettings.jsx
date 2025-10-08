import { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { getUser, setUser } from '../utils/db';
import { 
  generateSecurityAudit, 
  validatePinStrength, 
  isPinExpired,
  SECURITY_CONFIG 
} from '../utils/security';
import { analytics } from '../utils/analytics';

export default function SecuritySettings() {
  const [user, setUserState] = useState(null);
  const [securityAudit, setSecurityAudit] = useState(null);
  const [showPinChange, setShowPinChange] = useState(false);
  const [currentPin, setCurrentPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadSecurityData();
  }, []);

  const loadSecurityData = async () => {
    try {
      const userData = await getUser();
      const audit = await generateSecurityAudit();
      setUserState(userData);
      setSecurityAudit(audit);
    } catch (error) {
      console.error('Error loading security data:', error);
    }
  };

  const handlePinChange = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Verify current PIN
      if (!user || user.pin !== currentPin) {
        setError('Current PIN is incorrect');
        setLoading(false);
        return;
      }

      // Validate new PIN
      const validation = validatePinStrength(newPin);
      if (!validation.isValid) {
        setError(validation.errors[0]);
        setLoading(false);
        return;
      }

      if (newPin !== confirmPin) {
        setError('New PINs do not match');
        setLoading(false);
        return;
      }

      if (newPin === currentPin) {
        setError('New PIN must be different from current PIN');
        setLoading(false);
        return;
      }

      // Update PIN
      await setUser({
        ...user,
        pin: newPin,
        lastPinReset: Date.now(),
        pinResetCount: (user.pinResetCount || 0) + 1
      });

      setSuccess('PIN changed successfully!');
      setShowPinChange(false);
      setCurrentPin('');
      setNewPin('');
      setConfirmPin('');
      
      // Reload security data
      await loadSecurityData();
      
      analytics.trackEvent('pin_changed_successfully');
      
    } catch (error) {
      setError('Failed to change PIN. Please try again.');
      console.error('PIN change error:', error);
    }
    
    setLoading(false);
  };

  const getSecurityScore = () => {
    if (!securityAudit) return 0;
    
    let score = 100;
    
    // Deduct points for security issues
    if (!securityAudit.user.hasSecurityQuestion) score -= 30;
    if (securityAudit.security.pinExpired) score -= 20;
    if (securityAudit.security.failedAttempts > 0) score -= 10;
    if (securityAudit.user.pinAge > 60) score -= 15; // PIN older than 60 days
    
    return Math.max(0, score);
  };

  const getSecurityLevel = (score) => {
    if (score >= 90) return { level: 'Excellent', color: 'text-green-600', bg: 'bg-green-100' };
    if (score >= 70) return { level: 'Good', color: 'text-blue-600', bg: 'bg-blue-100' };
    if (score >= 50) return { level: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-100' };
    return { level: 'Poor', color: 'text-red-600', bg: 'bg-red-100' };
  };

  if (!user || !securityAudit) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-gray-500">Loading security settings...</div>
      </div>
    );
  }

  const securityScore = getSecurityScore();
  const securityLevel = getSecurityLevel(securityScore);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Security Settings</h3>
        <div className={`px-3 py-1 rounded-full ${securityLevel.bg}`}>
          <span className={`text-sm font-medium ${securityLevel.color}`}>
            {securityLevel.level} ({securityScore}%)
          </span>
        </div>
      </div>

      {/* Security Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="card text-center">
          <div className="text-2xl font-bold text-primary">{securityAudit.user.accountAge}</div>
          <div className="text-sm text-gray-600">Days Active</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-blue-600">{securityAudit.user.pinAge}</div>
          <div className="text-sm text-gray-600">PIN Age (Days)</div>
        </div>
        <div className="card text-center">
          <div className="text-2xl font-bold text-green-600">{securityAudit.security.successfulLogins}</div>
          <div className="text-sm text-gray-600">Successful Logins</div>
        </div>
      </div>

      {/* Security Recommendations */}
      {securityAudit.recommendations.length > 0 && (
        <div className="card">
          <h4 className="font-semibold mb-3 flex items-center gap-2">
            <Icon name="warning" size={20} className="text-yellow-600" />
            Security Recommendations
          </h4>
          <div className="space-y-3">
            {securityAudit.recommendations.map((rec, index) => (
              <div key={index} className={`p-3 rounded-lg border-l-4 ${
                rec.type === 'critical' ? 'bg-red-50 border-red-500' : 'bg-yellow-50 border-yellow-500'
              }`}>
                <div className={`font-medium ${
                  rec.type === 'critical' ? 'text-red-800' : 'text-yellow-800'
                }`}>
                  {rec.message}
                </div>
                <div className={`text-sm mt-1 ${
                  rec.type === 'critical' ? 'text-red-600' : 'text-yellow-600'
                }`}>
                  {rec.action}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PIN Management */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-semibold">PIN Security</h4>
          <button
            onClick={() => setShowPinChange(!showPinChange)}
            className="btn-secondary text-sm py-2 px-4"
          >
            Change PIN
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">PIN Age:</span>
            <span className={`ml-2 font-medium ${
              securityAudit.user.pinAge > 60 ? 'text-yellow-600' : 'text-green-600'
            }`}>
              {securityAudit.user.pinAge} days
            </span>
          </div>
          <div>
            <span className="text-gray-600">Reset Count:</span>
            <span className="ml-2 font-medium">{securityAudit.user.pinResetCount}</span>
          </div>
        </div>

        {isPinExpired(user) && (
          <div className="mt-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 text-yellow-800">
              <Icon name="warning" size={16} />
              <span className="font-medium">PIN Expired</span>
            </div>
            <p className="text-sm text-yellow-700 mt-1">
              Your PIN is over {SECURITY_CONFIG.PIN_EXPIRY_DAYS} days old. Consider changing it for better security.
            </p>
          </div>
        )}

        {/* PIN Change Form */}
        {showPinChange && (
          <form onSubmit={handlePinChange} className="mt-4 space-y-4 border-t pt-4">
            <div>
              <label className="block text-sm font-medium mb-2">Current PIN</label>
              <input
                type="password"
                inputMode="numeric"
                value={currentPin}
                onChange={(e) => setCurrentPin(e.target.value)}
                className="input-field"
                placeholder="Enter current PIN"
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
                maxLength="8"
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
                placeholder="Confirm new PIN"
                maxLength="8"
                required
              />
            </div>

            {error && (
              <div className="text-red-600 text-sm">{error}</div>
            )}

            {success && (
              <div className="text-green-600 text-sm">{success}</div>
            )}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowPinChange(false);
                  setCurrentPin('');
                  setNewPin('');
                  setConfirmPin('');
                  setError('');
                  setSuccess('');
                }}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn-primary flex-1"
              >
                {loading ? 'Changing...' : 'Change PIN'}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Account Security */}
      <div className="card">
        <h4 className="font-semibold mb-3">Account Security</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium">Security Question</h5>
              <p className="text-sm text-gray-600">
                {user.securityQuestion ? 'Configured' : 'Not set up'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              user.securityQuestion ? 'bg-green-500' : 'bg-red-500'
            }`} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium">Login Attempts</h5>
              <p className="text-sm text-gray-600">
                {securityAudit.security.failedAttempts} failed attempts
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              securityAudit.security.failedAttempts === 0 ? 'bg-green-500' : 'bg-yellow-500'
            }`} />
          </div>

          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <h5 className="font-medium">Account Status</h5>
              <p className="text-sm text-gray-600">
                {securityAudit.security.accountLocked ? 'Locked' : 'Active'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${
              securityAudit.security.accountLocked ? 'bg-red-500' : 'bg-green-500'
            }`} />
          </div>
        </div>
      </div>

      {/* Security Tips */}
      <div className="card">
        <h4 className="font-semibold mb-3 flex items-center gap-2">
          <Icon name="shield" size={20} className="text-blue-600" />
          Security Tips
        </h4>
        <div className="space-y-2 text-sm text-gray-600">
          <div className="flex items-start gap-2">
            <Icon name="success" size={16} className="text-green-600 mt-0.5" />
            <span>Use a PIN that's at least 6 digits long</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="success" size={16} className="text-green-600 mt-0.5" />
            <span>Avoid common patterns like 1234 or 0000</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="success" size={16} className="text-green-600 mt-0.5" />
            <span>Change your PIN every 3 months</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="success" size={16} className="text-green-600 mt-0.5" />
            <span>Keep your security question answer private</span>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="success" size={16} className="text-green-600 mt-0.5" />
            <span>Log out when sharing your device</span>
          </div>
        </div>
      </div>
    </div>
  );
}