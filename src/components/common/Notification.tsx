/**
 * @fileoverview Reusable notification system with multiple severity levels
 * @author NexSellPro
 * @created 2024-03-07
 * @lastModified 2024-03-10
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import { ErrorSeverity } from '../../utils/errorHandling';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Default timeout for auto-dismissing notifications (5 seconds)
const NOTIFICATION_TIMEOUT = 5000;

// Style configurations for different severity levels
const NOTIFICATION_STYLES = {
  [ErrorSeverity.INFO]: {
    container: 'bg-blue-100 border-blue-500 text-blue-700',
    icon: '💬'
  },
  [ErrorSeverity.WARNING]: {
    container: 'bg-yellow-100 border-yellow-500 text-yellow-700',
    icon: '⚠️'
  },
  [ErrorSeverity.ERROR]: {
    container: 'bg-red-100 border-red-500 text-red-700',
    icon: '❌'
  },
  [ErrorSeverity.CRITICAL]: {
    container: 'bg-red-200 border-red-600 text-red-800',
    icon: '🚨'
  }
};

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Props for individual notification component
interface NotificationProps {
  message: string;                    // Text to display in notification
  severity?: ErrorSeverity;           // Level of importance/urgency
  duration?: number;                  // How long to show notification
  onClose?: () => void;              // Callback when notification closes
}

// Structure for a notification item in the manager
interface NotificationItem {
  id: string;                         // Unique identifier
  message: string;                    // Notification message
  severity: ErrorSeverity;            // Severity level
  duration?: number;                  // Display duration
}

// State management for notification system
interface NotificationManagerState {
  notifications: NotificationItem[];
  addNotification: (message: string, severity?: ErrorSeverity, duration?: number) => void;
  removeNotification: (id: string) => void;
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// Using NotificationProps defined above

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Notification: React.FC<NotificationProps> = ({
  message,
  severity = ErrorSeverity.INFO,
  duration = NOTIFICATION_TIMEOUT,
  onClose
}) => {

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
  // Controls whether the notification is shown or hidden
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-dismiss timer effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);
    
    // Cleanup timer on unmount
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////
// No Chrome API handlers needed for this component

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
  // Handle manual close button click
  const handleClose = () => {
    setIsVisible(false);
    if (onClose) {
      onClose();
    }
  };

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// No helper functions needed for this component

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////
// Styles are handled via Tailwind CSS classes in the JSX

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
  // Don't render anything if notification is not visible
  if (!isVisible) {
    return null;
  }
  
  // Get styles for current severity level
  const styles = NOTIFICATION_STYLES[severity];
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 p-3 rounded-lg border shadow-lg max-w-md transition-opacity duration-300 ${styles.container}`}
      role="alert"
    >
      <div className="flex items-center">
        {/* Severity Icon */}
        <span className="mr-2 text-xl">{styles.icon}</span>
        
        {/* Message Content */}
        <div className="flex-grow">
          <p className="font-medium">{message}</p>
        </div>
        
        {/* Close Button */}
        <button 
          onClick={handleClose}
          className="ml-4 text-gray-500 hover:text-gray-700 focus:outline-none"
          aria-label="Close"
        >
          ✕
        </button>
      </div>
    </div>
  );
};

////////////////////////////////////////////////
// Notification Manager:
////////////////////////////////////////////////
// Create context for notification system
export const NotificationContext = React.createContext<NotificationManagerState>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {}
});

// Provider component that manages notifications
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // State for storing active notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  // Counter for generating unique IDs
  const [counter, setCounter] = useState(0);
  
  // Add a new notification to the stack
  const addNotification = (
    message: string,
    severity: ErrorSeverity = ErrorSeverity.INFO,
    duration?: number
  ) => {
    const id = `${Date.now()}-${counter}`;
    setCounter(prev => prev + 1);
    setNotifications(prev => [...prev, { id, message, severity, duration }]);
  };
  
  // Remove a notification by its ID
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
      {/* Container for rendering all active notifications */}
      <div className="notification-container">
        {notifications.map(notification => (
          <Notification
            key={notification.id}
            message={notification.message}
            severity={notification.severity}
            duration={notification.duration}
            onClose={() => removeNotification(notification.id)}
          />
        ))}
      </div>
    </NotificationContext.Provider>
  );
};

// Custom hook for using notifications in components
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
export default Notification; 