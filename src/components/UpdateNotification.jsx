import { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { BrandLogo } from './Typography';
import { 
  checkForUpdates, 
  acceptUpdate, 
  dismissUpdate, 
  markUpdateAsSeen,
  migrateUserData,
  getUpdateChangelog 
} from '../utils/appUpdates';
import { 
  forceCompleteUpdate, 
  isUpdateStuck, 
  markUpdateStarted, 
  clearUpdateProgress 
} from '../utils/updateFix';
import { analytics } from '../utils/analytics';

export default function UpdateNotification() {
  const [updateInfo, setUpdateInfo] = useState(null);
  const [showNotification, setShowNotification] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    checkForAppUpdates();
  }, []);

  const checkForAppUpdates = async () => {
    try {
      const updateCheck = await checkForUpdates();
      if (updateCheck?.needsUpdate) {
        setUpdateInfo(updateCheck);
        setShowNotification(true);
        analytics.trackEvent('update_notification_shown', {
          from_version: updateCheck.fromVersion,
          to_version: updateCheck.toVersion
        });
      }
    } catch (error) {
      console.error('Error checking for updates:', error);
    }
  };

  const handleAcceptUpdate = async () => {
    if (!updateInfo) return;
    
    setIsUpdating(true);
    markUpdateStarted();
    
    try {
      // Step 1: Show migration progress
      setCurrentStep(1);
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 2: Migrate user data
      setCurrentStep(2);
      const migrationResult = await migrateUserData(
        updateInfo.fromVersion, 
        updateInfo.toVersion
      );
      
      if (!migrationResult.success && !migrationResult.warning) {
        throw new Error(migrationResult.error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Step 3: Complete update
      setCurrentStep(3);
      acceptUpdate(updateInfo.toVersion);
      clearUpdateProgress();
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Step 4: Success
      setCurrentStep(4);
      analytics.trackEvent('update_completed_successfully', {
        from_version: updateInfo.fromVersion,
        to_version: updateInfo.toVersion,
        had_warning: !!migrationResult.warning
      });
      
      setTimeout(() => {
        setShowNotification(false);
        setIsUpdating(false);
        setCurrentStep(0);
      }, 2000);
      
    } catch (error) {
      console.error('Error updating app:', error);
      clearUpdateProgress();
      analytics.trackEvent('update_failed', {
        error: error.message,
        from_version: updateInfo.fromVersion,
        to_version: updateInfo.toVersion
      });
      
      // Offer force complete option
      const forceComplete = confirm(
        'Update failed. Would you like to force complete the update? Your data will be safe.'
      );
      
      if (forceComplete) {
        forceCompleteUpdate();
      } else {
        setIsUpdating(false);
        setCurrentStep(0);
      }
    }
  };

  const handleDismissUpdate = () => {
    if (!updateInfo) return;
    
    dismissUpdate(updateInfo.toVersion);
    markUpdateAsSeen(updateInfo.toVersion);
    setShowNotification(false);
    
    analytics.trackEvent('update_dismissed', {
      from_version: updateInfo.fromVersion,
      to_version: updateInfo.toVersion
    });
  };

  const handleRemindLater = () => {
    if (!updateInfo) return;
    
    markUpdateAsSeen(updateInfo.toVersion);
    setShowNotification(false);
    
    // Show again in 24 hours
    setTimeout(() => {
      setShowNotification(true);
    }, 24 * 60 * 60 * 1000);
    
    analytics.trackEvent('update_remind_later', {
      from_version: updateInfo.fromVersion,
      to_version: updateInfo.toVersion
    });
  };

  if (!showNotification || !updateInfo) return null;

  const changelog = getUpdateChangelog(updateInfo.fromVersion, updateInfo.toVersion);

  // Update in progress screen
  if (isUpdating) {
    const steps = [
      { id: 1, title: 'Preparing Update', description: 'Getting ready to update your app...' },
      { id: 2, title: 'Migrating Data', description: 'Safely updating your business data...' },
      { id: 3, title: 'Finalizing', description: 'Completing the update process...' },
      { id: 4, title: 'Complete!', description: 'Your app has been successfully updated!' }
    ];

    const currentStepInfo = steps.find(s => s.id === currentStep) || steps[0];
    
    // Show skip button if stuck on step 3 for more than 15 seconds
    const [showSkipButton, setShowSkipButton] = useState(false);
    
    useEffect(() => {
      if (currentStep === 3) {
        const timer = setTimeout(() => {
          setShowSkipButton(true);
        }, 15000); // 15 seconds
        
        return () => clearTimeout(timer);
      }
    }, [currentStep]);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center p-4 z-50">
        <div className="bg-white rounded-lg p-8 w-full max-w-md text-center">
          <div className="mb-6">
            <BrandLogo size="lg" variant="default" className="justify-center mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">Updating Chikondi POS</h3>
            <p className="text-gray-600">Please wait while we update your app...</p>
          </div>

          {/* Progress Steps */}
          <div className="mb-6">
            <div className="flex justify-center mb-4">
              {steps.map((step, index) => (
                <div key={step.id} className="flex items-center">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    currentStep >= step.id 
                      ? 'bg-primary text-white' 
                      : currentStep === step.id 
                        ? 'bg-blue-500 text-white animate-pulse'
                        : 'bg-gray-200 text-gray-500'
                  }`}>
                    {currentStep > step.id ? (
                      <Icon name="success" size={16} />
                    ) : (
                      step.id
                    )}
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`w-8 h-1 mx-2 ${
                      currentStep > step.id ? 'bg-primary' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
              <h4 className="font-semibold text-gray-900 mb-1">{currentStepInfo.title}</h4>
              <p className="text-sm text-gray-600">{currentStepInfo.description}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-500"
              style={{ width: `${(currentStep / steps.length) * 100}%` }}
            />
          </div>

          <p className="text-xs text-gray-500">
            {currentStep === 4 ? 'Update completed successfully!' : 'Do not close this window...'}
          </p>
          
          {/* Skip button if update is stuck */}
          {showSkipButton && currentStep === 3 && (
            <div className="mt-4">
              <p className="text-sm text-yellow-600 mb-2">Update taking longer than expected?</p>
              <button
                onClick={() => {
                  setCurrentStep(4);
                  acceptUpdate(updateInfo.toVersion);
                  setTimeout(() => {
                    setShowNotification(false);
                    setIsUpdating(false);
                    setCurrentStep(0);
                  }, 2000);
                }}
                className="btn-secondary text-sm py-2 px-4"
              >
                Complete Update
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Main update notification
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="bg-gradient-to-r from-primary to-green-600 text-white p-6 rounded-t-lg">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-white bg-opacity-20 rounded-full flex items-center justify-center">
                <Icon name="star" size={24} />
              </div>
              <div>
                <h2 className="text-xl font-bold">{changelog.title}</h2>
                <p className="text-green-100 text-sm">{changelog.subtitle}</p>
              </div>
            </div>
            <div className="bg-white bg-opacity-20 px-3 py-1 rounded-full">
              <span className="text-sm font-semibold">NEW</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-3">🎉 What's New</h3>
            <div className="space-y-4">
              {changelog.highlights.map((highlight, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl">{highlight.icon}</div>
                  <div>
                    <h4 className="font-semibold text-gray-900">{highlight.title}</h4>
                    <p className="text-sm text-gray-600">{highlight.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Data Safety Assurance */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Icon name="shield" size={20} className="text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-semibold text-blue-900 mb-1">Your Data is Safe</h4>
                <p className="text-sm text-blue-800">
                  This update will preserve all your existing data including sales, customers, 
                  inventory, and settings. The update process is completely safe and reversible.
                </p>
              </div>
            </div>
          </div>

          {/* Version Details */}
          <div className="mb-6">
            <h4 className="font-medium text-gray-900 mb-2">Update Details</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <div className="flex justify-between">
                <span>Current Version:</span>
                <span className="font-mono">{updateInfo.fromVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>New Version:</span>
                <span className="font-mono font-semibold text-primary">{updateInfo.toVersion}</span>
              </div>
              <div className="flex justify-between">
                <span>Update Size:</span>
                <span>~2MB</span>
              </div>
              <div className="flex justify-between">
                <span>Estimated Time:</span>
                <span>30 seconds</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <button
              onClick={handleAcceptUpdate}
              disabled={isUpdating}
              className="btn-primary w-full flex items-center justify-center gap-2"
            >
              <Icon name="download" size={20} />
              Update Now (Recommended)
            </button>
            
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleRemindLater}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Icon name="clock" size={16} />
                Remind Later
              </button>
              <button
                onClick={handleDismissUpdate}
                className="btn-secondary flex items-center justify-center gap-2"
              >
                <Icon name="close" size={16} />
                Skip Update
              </button>
            </div>
          </div>

          {/* Footer Note */}
          <div className="mt-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 text-center">
              💡 Updates bring new features, improvements, and bug fixes to enhance your experience.
              You can always update later from Settings.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// Settings component for update preferences
export function UpdateSettings() {
  const [settings, setSettings] = useState({
    showUpdateNotifications: true,
    autoAcceptMinorUpdates: false
  });

  useEffect(() => {
    // Load current settings
    const showUpdates = localStorage.getItem('chikondi-show-updates') !== 'false';
    const autoMinor = localStorage.getItem('chikondi-auto-minor-updates') === 'true';
    
    setSettings({
      showUpdateNotifications: showUpdates,
      autoAcceptMinorUpdates: autoMinor
    });
  }, []);

  const handleSettingChange = (key, value) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    
    // Save to localStorage
    localStorage.setItem(`chikondi-${key.replace(/([A-Z])/g, '-$1').toLowerCase()}`, value.toString());
    
    analytics.trackEvent('update_settings_changed', { [key]: value });
  };

  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-lg">Update Preferences</h3>
      
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Show Update Notifications</h4>
            <p className="text-sm text-gray-600">Get notified when new features are available</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showUpdateNotifications}
              onChange={(e) => handleSettingChange('showUpdateNotifications', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <h4 className="font-medium">Auto-Accept Minor Updates</h4>
            <p className="text-sm text-gray-600">Automatically install bug fixes and small improvements</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.autoAcceptMinorUpdates}
              onChange={(e) => handleSettingChange('autoAcceptMinorUpdates', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/25 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
}