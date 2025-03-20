/**
 * @fileoverview Error handling and logging utilities
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// No external imports needed

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////

/**
 * Error severity levels for logging and handling
 */
export enum ErrorSeverity {
  INFO = 'info',      // Informational messages
  WARNING = 'warning', // Warning messages
  ERROR = 'error',    // Error messages
  CRITICAL = 'critical' // Critical error messages
}

/**
 * Default error messages for common scenarios
 */
const DEFAULT_ERROR_MESSAGES = {
  dataFetch: "Failed to fetch data. Please try again later.",
  parsing: "Failed to process data. Please try again later.",
  network: "Network error. Please check your connection and try again.",
  unknown: "An unexpected error occurred. Please try again later."
};

// Store reference to notification function
let notificationFunction: ((message: string, severity: ErrorSeverity, duration?: number) => void) | null = null;

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////

/**
 * Interface for error details
 */
export interface ErrorDetails {
  message: string;                    // Error message
  severity: ErrorSeverity;           // Error severity level
  context?: Record<string, any>;     // Additional context data
  error?: Error;                     // Original error object
  timestamp?: Date;                  // When the error occurred
  component?: string;                // Component where error occurred
}

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////

/**
 * Set the notification function for error display
 * @param fn - Function to display notifications
 */
export const setNotificationFunction = (
  fn: (message: string, severity: ErrorSeverity, duration?: number) => void
): void => {
  notificationFunction = fn;
};

/**
 * Log an error with additional context
 * @param details - Error details including message and severity
 */
export const logError = (details: ErrorDetails): void => {
  const { message, severity, context, error, component } = details;
  const timestamp = details.timestamp || new Date();
  
  // Format error message with component name if available
  const formattedMessage = component 
    ? `[${component}] ${message}`
    : message;
  
  // Log based on severity level
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
  
  // Report critical errors to monitoring service
  if (severity === ErrorSeverity.CRITICAL) {
    reportCriticalError(details);
  }
  
  // Show notification for errors and critical errors
  if (severity === ErrorSeverity.ERROR || severity === ErrorSeverity.CRITICAL) {
    showErrorNotification(message, severity);
  }
};

/**
 * Get user-friendly error message based on error type
 * @param error - The error object
 * @param fallbackMessage - Default message if no specific message found
 * @returns User-friendly error message
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
  
  // Use error message if available
  if (error instanceof Error && error.message) {
    return error.message;
  }
  
  // Fallback to default message
  return fallbackMessage;
};

/**
 * Wrap an async function with error handling
 * @param fn - Async function to wrap
 * @param errorHandler - Function to handle errors
 * @returns Wrapped function with error handling
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
 * Report critical errors to monitoring service
 * @param details - Error details
 */
const reportCriticalError = (details: ErrorDetails): void => {
  // Log critical error (placeholder for monitoring service integration)
  console.error('[REPORTING] Critical error:', details);
  
  // Example of future monitoring service integration:
  // Sentry.captureException(details.error, {
  //   extra: {
  //     context: details.context,
  //     component: details.component,
  //     severity: details.severity
  //   }
  // });
};

/**
 * Display error notification to user
 * @param message - Error message to display
 * @param severity - Error severity level
 * @param duration - Optional display duration in milliseconds
 */
export const showErrorNotification = (
  message: string,
  severity: ErrorSeverity = ErrorSeverity.ERROR,
  duration?: number
): void => {
  // Use notification function if available
  if (notificationFunction) {
    notificationFunction(message, severity, duration);
    return;
  }
  
  // Fallback to console logging
  console.log(`[NOTIFICATION] ${severity.toUpperCase()}: ${message}`);
};

////////////////////////////////////////////////
// Export Statement:
////////////////////////////////////////////////
// All functions and types are exported above 