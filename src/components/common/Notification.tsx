////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
import React, { useEffect, useState } from 'react';
import { ErrorSeverity } from '../../utils/errorHandling';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
const NOTIFICATION_TIMEOUT = 5000; // 5 seconds

// Notification styles based on severity
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
interface NotificationProps {
  message: string;
  severity?: ErrorSeverity;
  duration?: number;
  onClose?: () => void;
}

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
export const Notification: React.FC<NotificationProps> = ({
  message,
  severity = ErrorSeverity.INFO,
  duration = NOTIFICATION_TIMEOUT,
  onClose
}) => {
  const [isVisible, setIsVisible] = useState(true);
  
  // Auto-close the notification after the specified duration
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) {
        onClose();
      }
    }, duration);
    
    return () => {
      clearTimeout(timer);
    };
  }, [duration, onClose]);
  
  // If not visible, don't render anything
  if (!isVisible) {
    return null;
  }
  
  const styles = NOTIFICATION_STYLES[severity];
  
  return (
    <div 
      className={`fixed top-4 right-4 z-50 p-3 rounded-lg border shadow-lg max-w-md transition-opacity duration-300 ${styles.container}`}
      role="alert"
    >
      <div className="flex items-center">
        <span className="mr-2 text-xl">{styles.icon}</span>
        <div className="flex-grow">
          <p className="font-medium">{message}</p>
        </div>
        <button 
          onClick={() => {
            setIsVisible(false);
            if (onClose) {
              onClose();
            }
          }}
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
interface NotificationItem {
  id: string;
  message: string;
  severity: ErrorSeverity;
  duration?: number;
}

interface NotificationManagerState {
  notifications: NotificationItem[];
  addNotification: (message: string, severity?: ErrorSeverity, duration?: number) => void;
  removeNotification: (id: string) => void;
}

// Create a React context for the notification manager
export const NotificationContext = React.createContext<NotificationManagerState>({
  notifications: [],
  addNotification: () => {},
  removeNotification: () => {}
});

// Provider component for the notification manager
export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [counter, setCounter] = useState(0);
  
  const addNotification = (
    message: string,
    severity: ErrorSeverity = ErrorSeverity.INFO,
    duration?: number
  ) => {
    const id = `${Date.now()}-${counter}`;
    setCounter(prev => prev + 1);
    setNotifications(prev => [...prev, { id, message, severity, duration }]);
  };
  
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };
  
  return (
    <NotificationContext.Provider value={{ notifications, addNotification, removeNotification }}>
      {children}
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

// Hook to use the notification manager
export const useNotification = () => {
  const context = React.useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
}; 