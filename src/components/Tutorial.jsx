import { useState, useEffect } from 'react';
import { Icon } from './Icons';
import { BrandLogo } from './Typography';
import { analytics } from '../utils/analytics';

const TUTORIAL_STEPS = [
  {
    id: 'welcome',
    title: 'Welcome to Chikondi POS! 🎉',
    content: 'Your complete point-of-sale solution for small businesses. Let\'s take a quick tour to get you started.',
    target: null,
    position: 'center',
    showSkip: true
  },
  {
    id: 'navigation',
    title: 'Navigation Bar',
    content: 'Use the bottom navigation to access different sections: Home, Sales, Stock, Customers, and Reports.',
    target: 'nav',
    position: 'top',
    highlight: true
  },
  {
    id: 'sales',
    title: 'Make Your First Sale',
    content: 'Tap "Sales" to start selling. You can add products, calculate totals, and process payments.',
    target: '[href="/sales"]',
    position: 'top',
    action: 'Navigate to Sales'
  },
  {
    id: 'inventory',
    title: 'Manage Your Stock',
    content: 'Keep track of your products and inventory levels. Add new products and monitor stock levels.',
    target: '[href="/inventory"]',
    position: 'top',
    action: 'View Inventory'
  },
  {
    id: 'customers',
    title: 'Customer Management',
    content: 'Build customer relationships! Track purchases, loyalty points, and customer information.',
    target: '[href="/customers"]',
    position: 'top',
    action: 'Manage Customers',
    badge: 'NEW!'
  },
  {
    id: 'invoices',
    title: 'Smart Invoices',
    content: 'Generate professional PDF invoices for your sales. Works completely offline!',
    target: '[href="/invoices"]',
    position: 'top',
    action: 'Create Invoices',
    badge: 'NEW!'
  },
  {
    id: 'reports',
    title: 'Business Insights',
    content: 'View sales reports, track performance, and make data-driven decisions for your business.',
    target: '[href="/reports"]',
    position: 'top',
    action: 'View Reports'
  },
  {
    id: 'settings',
    title: 'Settings & Export',
    content: 'Access settings, export your data, and sync with cloud services from the settings icon.',
    target: '[href="/settings"]',
    position: 'bottom',
    action: 'Open Settings'
  },
  {
    id: 'offline',
    title: 'Works Offline! 📱',
    content: 'Chikondi POS works completely offline. Your data is stored securely on your device.',
    target: null,
    position: 'center',
    icon: 'offline'
  },
  {
    id: 'complete',
    title: 'You\'re All Set! 🚀',
    content: 'You\'re ready to start using Chikondi POS. Remember, all your data is saved automatically and works offline.',
    target: null,
    position: 'center',
    showComplete: true
  }
];

export default function Tutorial({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const [targetElement, setTargetElement] = useState(null);

  useEffect(() => {
    // Check if tutorial should be shown
    const hasSeenTutorial = localStorage.getItem('chikondi-tutorial-completed');
    if (!hasSeenTutorial) {
      setIsVisible(true);
      analytics.tutorialStarted();
    }
  }, []);

  useEffect(() => {
    if (isVisible && TUTORIAL_STEPS[currentStep]) {
      const step = TUTORIAL_STEPS[currentStep];
      if (step.target) {
        const element = document.querySelector(step.target);
        setTargetElement(element);
        
        // Scroll element into view
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      } else {
        setTargetElement(null);
      }
    }
  }, [currentStep, isVisible]);

  const nextStep = () => {
    if (currentStep < TUTORIAL_STEPS.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      completeTutorial();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const skipTutorial = () => {
    analytics.tutorialSkipped(currentStep);
    completeTutorial();
  };

  const completeTutorial = () => {
    if (currentStep === TUTORIAL_STEPS.length - 1) {
      analytics.tutorialCompleted();
    }
    localStorage.setItem('chikondi-tutorial-completed', 'true');
    setIsVisible(false);
    if (onComplete) onComplete();
  };

  const restartTutorial = () => {
    setCurrentStep(0);
    setIsVisible(true);
  };

  // Function to show tutorial (can be called from settings)
  window.showTutorial = restartTutorial;

  if (!isVisible) return null;

  const step = TUTORIAL_STEPS[currentStep];
  const progress = ((currentStep + 1) / TUTORIAL_STEPS.length) * 100;

  // Calculate tooltip position
  const getTooltipPosition = () => {
    if (!targetElement || step.position === 'center') {
      return {
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 1000
      };
    }

    const rect = targetElement.getBoundingClientRect();
    const tooltipWidth = 320;
    const tooltipHeight = 200;

    let top, left;

    switch (step.position) {
      case 'top':
        top = rect.top - tooltipHeight - 20;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'bottom':
        top = rect.bottom + 20;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
        break;
      case 'left':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.left - tooltipWidth - 20;
        break;
      case 'right':
        top = rect.top + (rect.height / 2) - (tooltipHeight / 2);
        left = rect.right + 20;
        break;
      default:
        top = rect.bottom + 20;
        left = rect.left + (rect.width / 2) - (tooltipWidth / 2);
    }

    // Keep tooltip within viewport
    const padding = 20;
    top = Math.max(padding, Math.min(top, window.innerHeight - tooltipHeight - padding));
    left = Math.max(padding, Math.min(left, window.innerWidth - tooltipWidth - padding));

    return {
      position: 'fixed',
      top: `${top}px`,
      left: `${left}px`,
      zIndex: 1000
    };
  };

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50" />
      
      {/* Highlight target element */}
      {targetElement && step.highlight && (
        <div
          className="fixed border-4 border-primary rounded-lg pointer-events-none z-50"
          style={{
            top: targetElement.getBoundingClientRect().top - 4,
            left: targetElement.getBoundingClientRect().left - 4,
            width: targetElement.getBoundingClientRect().width + 8,
            height: targetElement.getBoundingClientRect().height + 8,
          }}
        />
      )}

      {/* Tutorial Tooltip */}
      <div
        className="bg-white rounded-lg shadow-2xl p-6 max-w-sm w-full mx-4"
        style={getTooltipPosition()}
      >
        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">
              Step {currentStep + 1} of {TUTORIAL_STEPS.length}
            </span>
            {step.badge && (
              <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full font-semibold">
                {step.badge}
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          {step.id === 'welcome' && (
            <div className="mb-4">
              <BrandLogo size="lg" variant="default" className="justify-center" />
            </div>
          )}
          
          {step.icon && (
            <div className="mb-4">
              <Icon name={step.icon} size={48} className="mx-auto text-primary" />
            </div>
          )}

          <h3 className="text-lg font-bold text-gray-900 mb-3">
            {step.title}
          </h3>
          <p className="text-gray-600 leading-relaxed">
            {step.content}
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          {step.showSkip && (
            <button
              onClick={skipTutorial}
              className="btn-secondary flex-1"
            >
              Skip Tour
            </button>
          )}
          
          {currentStep > 0 && !step.showSkip && (
            <button
              onClick={prevStep}
              className="btn-secondary px-4"
            >
              <Icon name="ArrowLeft" size={20} />
            </button>
          )}
          
          <button
            onClick={nextStep}
            className="btn-primary flex-1 flex items-center justify-center gap-2"
          >
            {step.showComplete ? (
              <>
                <Icon name="CheckCircle" size={20} />
                Get Started
              </>
            ) : step.action ? (
              step.action
            ) : (
              <>
                Next
                <Icon name="ArrowRight" size={20} />
              </>
            )}
          </button>
        </div>

        {/* Close button */}
        <button
          onClick={skipTutorial}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Icon name="close" size={20} />
        </button>
      </div>
    </>
  );
}

// Tutorial trigger component for settings
export function TutorialTrigger() {
  const [showTutorial, setShowTutorial] = useState(false);

  const startTutorial = () => {
    localStorage.removeItem('chikondi-tutorial-completed');
    setShowTutorial(true);
  };

  return (
    <>
      <button
        onClick={startTutorial}
        className="btn-secondary w-full flex items-center justify-center gap-2"
      >
        <Icon name="info" size={20} />
        Show Tutorial
      </button>
      
      {showTutorial && (
        <Tutorial onComplete={() => setShowTutorial(false)} />
      )}
    </>
  );
}