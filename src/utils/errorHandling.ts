////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Error severity levels
export enum ErrorSeverity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  CRITICAL = 'critical'
}

// Default error messages for common scenarios
const DEFAULT_ERROR_MESSAGES = {
  dataFetch: "Failed to fetch data. Please try again later.",
  parsing: "Failed to process data. Please try again later.",
  network: "Network error. Please check your connection and try again.",
  unknown: "An unexpected error occurred. Please try again later."
};

// Store a reference to the notification function
let notificationFunction: ((message: string, severity: ErrorSeverity, duration?: number) => void) | null = null;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
export interface ErrorDetails {
  message: string;
  severity: ErrorSeverity;
  context?: Record<string, any>;
  error?: Error;
  timestamp?: Date;
  component?: string;
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Sets the notification function to be used by showErrorNotification
 * This allows us to use the React notification component from non-React code
 * @param fn The notification function from the React context
 */
export const setNotificationFunction = (
  fn: (message: string, severity: ErrorSeverity, duration?: number) => void
): void => {
  notificationFunction = fn;
};

/**
 * Logs an error with additional context
 * @param details Error details including message, severity, and context
 */
export const logError = (details: ErrorDetails): void => {
  const { message, severity, context, error, component } = details;
  const timestamp = details.timestamp || new Date();
  
  // Format the error message
  const formattedMessage = component 
    ? `[${component}] ${message}`
    : message;
  
  // Log based on severity
  switch (severity) {
    case ErrorSeverity.INFO:
      console.info(`[INFO] ${formattedMessage}`, { timestamp, context, error });
      break;
    case ErrorSeverity.WARNING:
      console.warn(`[WARNING] ${formattedMessage}`, { timestamp, context, error });
      break;
    case ErrorSeverity.ERROR:
    case ErrorSeverity.CRITICAL:
      console.error(`[${severity.toUpperCase()}] ${formattedMessage}`, { timestamp, context, error });
      break;
    default:
      console.error(`[ERROR] ${formattedMessage}`, { timestamp, context, error });
  }
  
  // For critical errors, we might want to report them to a monitoring service
  if (severity === ErrorSeverity.CRITICAL) {
    reportCriticalError(details);
  }
  
  // Show a notification for errors and critical errors
  if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL) {
    showErrorNotification(message, severity);
  }
};

/**
 * Gets a user-friendly error message based on the error type
 * @param error The error object
 * @param fallbackMessage A fallback message if no specific message is found
 * @returns A user-friendly error message
 */
export const getUserFriendlyErrorMessage = (
  error: Error | unknown,
  fallbackMessage = DEFAULT_ERROR_MESSAGES.unknown
): string => {
  if (!error) {
    return fallbackMessage;
  }
  
  // Handle network errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return DEFAULT_ERROR_MESSAGES.network;
  }
  
  // Handle parsing errors
  if (error instanceof SyntaxError) {
    return DEFAULT_ERROR_MESSAGES.parsing;
  }
  
  // If it's an Error object with a message, use that
  if (error instanceof Error && error.message) {
    // Clean up the message if needed
    return error.message;
  }
  
  // Fallback to default message
  return fallbackMessage;
};

/**
 * Wraps an async function with error handling
 * @param fn The async function to wrap
 * @param errorHandler A function to handle errors
 * @returns A wrapped function with error handling
 */
export const withErrorHandling = <T, Args extends any[]>(
  fn: (...args: Args) => Promise<T>,
  errorHandler: (error: unknown, ...args: Args) => Promise<T> | T
) => {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (error) {
      return errorHandler(error, ...args);
    }
  };
};

/**
 * Reports a critical error to a monitoring service
 * This is a placeholder function that should be implemented based on your monitoring solution
 * @param details Error details
 */
const reportCriticalError = (details: ErrorDetails): void => {
  // This would typically send the error to a service like Sentry, LogRocket, etc.
  // For now, we'll just log it
  console.error('[REPORTING] Critical error:', details);
  
  // In the future, you might implement something like:
  // Sentry.captureException(details.error, {
  //   extra: {
  //     context: details.context,
  //     component: details.component,
  //     severity: details.severity
  //   }
  // });
};

/**
 * Displays an error notification to the user
 * @param message The error message to display
 * @param severity The severity of the error
 * @param duration Optional duration in milliseconds
 */
export const showErrorNotification = (
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  duration?: number
): void => {
  // If we have a notification function, use it
  if (notificationFunction) {
    notificationFunction(message, severity, duration);
    return;
  }
  
  // Fallback to console logging if no notification function is set
  console.log(`[NOTIFICATION] ${severity.toUpperCase()}: ${message}`);
}; 