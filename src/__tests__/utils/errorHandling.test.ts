/**
 * @fileoverview Tests for error handling utilities
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Import all the error handling utilities we want to test
import { 
  logError, 
  ErrorSeverity, 
  getUserFriendlyErrorMessage, 
  withErrorHandling,
  showErrorNotification,
  setNotificationFunction
} from '../../utils/errorHandling';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Test values used throughout the tests
const TEST_MESSAGE = 'Test message';
const TEST_COMPONENT = 'TestComponent';
const TEST_CONTEXT = { testKey: 'testValue' };
const TEST_DURATION = 5000; // Duration in milliseconds

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Interface defining the structure of error details
interface ErrorDetails {
  message: string;
  severity: ErrorSeverity;
  component?: string;
  context?: Record<string, unknown>;
  error?: Error;
}

////////////////////////////////////////////////
// Enums:
////////////////////////////////////////////////
// Using imported ErrorSeverity enum

////////////////////////////////////////////////
// Configuration:
////////////////////////////////////////////////
// Mock console methods to track logging
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
console.log = jest.fn();

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// Helper function to create error details with default values
const createErrorDetails = (details: Partial<ErrorDetails>): ErrorDetails => ({
  message: TEST_MESSAGE,
  severity: ErrorSeverity.ERROR,
  ...details
});

////////////////////////////////////////////////
// Test Cases:
////////////////////////////////////////////////
// Main test suite for error handling utilities
describe('errorHandling utility', () => {
  // Clear all mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Test suite for logError function
  describe('logError', () => {
    // Test logging of info messages
    it('should log info messages correctly', () => {
      const errorDetails = createErrorDetails({
        message: 'Test info message',
        severity: ErrorSeverity.INFO,
        component: TEST_COMPONENT
      });
      
      logError(errorDetails);
      
      // Verify console.info was called with correct format
      expect(console.info).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [TestComponent] Test info message'),
        expect.objectContaining({
          context: undefined,
          error: undefined
        })
      );
    });

    // Test logging of warning messages
    it('should log warning messages correctly', () => {
      const errorDetails = createErrorDetails({
        message: 'Test warning message',
        severity: ErrorSeverity.WARNING
      });
      
      logError(errorDetails);
      
      // Verify console.warn was called with correct format
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARNING] Test warning message'),
        expect.objectContaining({
          context: undefined,
          error: undefined
        })
      );
    });

    // Test logging of error messages
    it('should log error messages correctly', () => {
      const errorDetails = createErrorDetails({
        message: 'Test error message',
        severity: ErrorSeverity.ERROR,
        error: new Error('Test error')
      });
      
      logError(errorDetails);
      
      // Verify console.error was called with correct format
      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Test error message'),
        expect.objectContaining({
          error: expect.any(Error)
        })
      );
    });

    // Test logging of critical messages
    it('should log critical messages correctly', () => {
      const errorDetails = createErrorDetails({
        message: 'Test critical message',
        severity: ErrorSeverity.CRITICAL,
        context: TEST_CONTEXT
      });
      
      logError(errorDetails);
      
      // Verify console.error was called with correct format
      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[CRITICAL] Test critical message'),
        expect.objectContaining({
          context: TEST_CONTEXT
        })
      );
    });
  });

  // Test suite for getUserFriendlyErrorMessage function
  describe('getUserFriendlyErrorMessage', () => {
    // Test handling of null errors
    it('should return fallback message when error is null', () => {
      const result = getUserFriendlyErrorMessage(null);
      expect(result).toBe('An unexpected error occurred. Please try again later.');
    });

    // Test handling of network errors
    it('should return network error message for fetch errors', () => {
      const fetchError = new TypeError('Failed to fetch');
      const result = getUserFriendlyErrorMessage(fetchError);
      expect(result).toBe('Network error. Please check your connection and try again.');
    });

    // Test handling of syntax errors
    it('should return parsing error message for syntax errors', () => {
      const syntaxError = new SyntaxError('Unexpected token');
      const result = getUserFriendlyErrorMessage(syntaxError);
      expect(result).toBe('Failed to process data. Please try again later.');
    });

    // Test handling of standard Error objects
    it('should return error message for Error objects', () => {
      const error = new Error('Custom error message');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('Custom error message');
    });

    // Test custom fallback message
    it('should return custom fallback message when provided', () => {
      const result = getUserFriendlyErrorMessage(null, 'Custom fallback message');
      expect(result).toBe('Custom fallback message');
    });
  });

  // Test suite for withErrorHandling function
  describe('withErrorHandling', () => {
    // Test successful function execution
    it('should return the result of the function if no error occurs', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const errorHandler = jest.fn();
      
      const wrappedFn = withErrorHandling(mockFn, errorHandler);
      const result = await wrappedFn('arg1', 'arg2');
      
      // Verify function was called with correct arguments
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      // Verify error handler wasn't called
      expect(errorHandler).not.toHaveBeenCalled();
      // Verify correct result was returned
      expect(result).toBe('success');
    });

    // Test error handling
    it('should call the error handler if an error occurs', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const errorHandler = jest.fn().mockReturnValue('error handled');
      
      const wrappedFn = withErrorHandling(mockFn, errorHandler);
      const result = await wrappedFn('arg1', 'arg2');
      
      // Verify function was called with correct arguments
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      // Verify error handler was called with error and arguments
      expect(errorHandler).toHaveBeenCalledWith(error, 'arg1', 'arg2');
      // Verify error handler result was returned
      expect(result).toBe('error handled');
    });
  });

  // Test suite for showErrorNotification function
  describe('showErrorNotification', () => {
    // Test fallback to console when no notification function is set
    it('should log to console if no notification function is set', () => {
      showErrorNotification(TEST_MESSAGE, ErrorSeverity.ERROR);
      expect(console.log).toHaveBeenCalledWith('[NOTIFICATION] ERROR: Test message');
    });

    // Test using custom notification function
    it('should call the notification function if set', () => {
      const mockNotificationFn = jest.fn();
      setNotificationFunction(mockNotificationFn);
      
      showErrorNotification(TEST_MESSAGE, ErrorSeverity.WARNING, TEST_DURATION);
      
      // Verify notification function was called with correct arguments
      expect(mockNotificationFn).toHaveBeenCalledWith(TEST_MESSAGE, ErrorSeverity.WARNING, TEST_DURATION);
      // Verify console wasn't used
      expect(console.log).not.toHaveBeenCalled();
      
      // Clean up
      setNotificationFunction(null);
    });
  });
}); 