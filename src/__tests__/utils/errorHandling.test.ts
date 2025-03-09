import { 
  logError, 
  ErrorSeverity, 
  getUserFriendlyErrorMessage, 
  withErrorHandling,
  showErrorNotification,
  setNotificationFunction
} from '../../utils/errorHandling';

// Mock console methods
console.info = jest.fn();
console.warn = jest.fn();
console.error = jest.fn();
console.log = jest.fn();

describe('errorHandling utility', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks();
  });

  describe('logError', () => {
    it('should log info messages correctly', () => {
      const errorDetails = {
        message: 'Test info message',
        severity: ErrorSeverity.INFO,
        component: 'TestComponent'
      };
      
      logError(errorDetails);
      
      expect(console.info).toHaveBeenCalled();
      expect(console.info).toHaveBeenCalledWith(
        expect.stringContaining('[INFO] [TestComponent] Test info message'),
        expect.objectContaining({
          context: undefined,
          error: undefined
        })
      );
    });

    it('should log warning messages correctly', () => {
      const errorDetails = {
        message: 'Test warning message',
        severity: ErrorSeverity.WARNING
      };
      
      logError(errorDetails);
      
      expect(console.warn).toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining('[WARNING] Test warning message'),
        expect.objectContaining({
          context: undefined,
          error: undefined
        })
      );
    });

    it('should log error messages correctly', () => {
      const errorDetails = {
        message: 'Test error message',
        severity: ErrorSeverity.ERROR,
        error: new Error('Test error')
      };
      
      logError(errorDetails);
      
      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[ERROR] Test error message'),
        expect.objectContaining({
          error: expect.any(Error)
        })
      );
    });

    it('should log critical messages correctly', () => {
      const errorDetails = {
        message: 'Test critical message',
        severity: ErrorSeverity.CRITICAL,
        context: { testKey: 'testValue' }
      };
      
      logError(errorDetails);
      
      expect(console.error).toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining('[CRITICAL] Test critical message'),
        expect.objectContaining({
          context: { testKey: 'testValue' }
        })
      );
    });
  });

  describe('getUserFriendlyErrorMessage', () => {
    it('should return fallback message when error is null', () => {
      const result = getUserFriendlyErrorMessage(null);
      expect(result).toBe('An unexpected error occurred. Please try again later.');
    });

    it('should return network error message for fetch errors', () => {
      const fetchError = new TypeError('Failed to fetch');
      const result = getUserFriendlyErrorMessage(fetchError);
      expect(result).toBe('Network error. Please check your connection and try again.');
    });

    it('should return parsing error message for syntax errors', () => {
      const syntaxError = new SyntaxError('Unexpected token');
      const result = getUserFriendlyErrorMessage(syntaxError);
      expect(result).toBe('Failed to process data. Please try again later.');
    });

    it('should return error message for Error objects', () => {
      const error = new Error('Custom error message');
      const result = getUserFriendlyErrorMessage(error);
      expect(result).toBe('Custom error message');
    });

    it('should return custom fallback message when provided', () => {
      const result = getUserFriendlyErrorMessage(null, 'Custom fallback message');
      expect(result).toBe('Custom fallback message');
    });
  });

  describe('withErrorHandling', () => {
    it('should return the result of the function if no error occurs', async () => {
      const mockFn = jest.fn().mockResolvedValue('success');
      const errorHandler = jest.fn();
      
      const wrappedFn = withErrorHandling(mockFn, errorHandler);
      const result = await wrappedFn('arg1', 'arg2');
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(errorHandler).not.toHaveBeenCalled();
      expect(result).toBe('success');
    });

    it('should call the error handler if an error occurs', async () => {
      const error = new Error('Test error');
      const mockFn = jest.fn().mockRejectedValue(error);
      const errorHandler = jest.fn().mockReturnValue('error handled');
      
      const wrappedFn = withErrorHandling(mockFn, errorHandler);
      const result = await wrappedFn('arg1', 'arg2');
      
      expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2');
      expect(errorHandler).toHaveBeenCalledWith(error, 'arg1', 'arg2');
      expect(result).toBe('error handled');
    });
  });

  describe('showErrorNotification', () => {
    it('should log to console if no notification function is set', () => {
      showErrorNotification('Test message', ErrorSeverity.ERROR);
      
      expect(console.log).toHaveBeenCalledWith('[NOTIFICATION] ERROR: Test message');
    });

    it('should call the notification function if set', () => {
      const mockNotificationFn = jest.fn();
      setNotificationFunction(mockNotificationFn);
      
      showErrorNotification('Test message', ErrorSeverity.WARNING, 5000);
      
      expect(mockNotificationFn).toHaveBeenCalledWith('Test message', ErrorSeverity.WARNING, 5000);
      expect(console.log).not.toHaveBeenCalled();
      
      // Reset the notification function for other tests
      setNotificationFunction(null);
    });
  });
}); 