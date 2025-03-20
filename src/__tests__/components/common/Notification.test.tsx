/**
 * @fileoverview Tests for the Notification component and its provider
 * @author Your Name
 * @created 2024-03-20
 * @lastModified 2024-03-20
 */

////////////////////////////////////////////////
// Imports:
////////////////////////////////////////////////
// Import React and testing utilities
import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
// Import the components and utilities we're testing
import { Notification, NotificationProvider, useNotification } from '../../../components/common/Notification';
import { ErrorSeverity } from '../../../utils/errorHandling';

////////////////////////////////////////////////
// Constants and Variables:
////////////////////////////////////////////////
// Test values used throughout the tests
const TEST_MESSAGE = 'Test notification';
const TEST_DURATION = 2000; // Duration in milliseconds

////////////////////////////////////////////////
// Types and Interfaces:
////////////////////////////////////////////////
// Props for the test component that uses the notification context
interface TestComponentProps {
  message?: string;
  severity?: ErrorSeverity;
  duration?: number;
}

////////////////////////////////////////////////
// Props Interface:
////////////////////////////////////////////////
// Props for testing the Notification component directly
interface NotificationTestProps {
  onClose?: () => void;
  severity?: ErrorSeverity;
  duration?: number;
}

////////////////////////////////////////////////
// Component:
////////////////////////////////////////////////
// Test component that uses the notification context
// This helps us test the useNotification hook
const TestComponent: React.FC<TestComponentProps> = ({ 
  message = TEST_MESSAGE, 
  severity = ErrorSeverity.ERROR,
  duration 
}) => {
  const { addNotification } = useNotification();
  
  return (
    <button onClick={() => addNotification(message, severity, duration)}>
      Show Notification
    </button>
  );
};

////////////////////////////////////////////////
// State and Hooks:
////////////////////////////////////////////////
// No state or hooks needed in test file

////////////////////////////////////////////////
// Chrome API Handlers:
////////////////////////////////////////////////
// No Chrome API handlers needed in test file

////////////////////////////////////////////////
// Event Handlers:
////////////////////////////////////////////////
// Event handlers are defined within individual test cases

////////////////////////////////////////////////
// Helper Functions:
////////////////////////////////////////////////
// Helper function to set up the Notification component for testing
const setupTest = (props: NotificationTestProps = {}) => {
  return render(
    <Notification 
      message={TEST_MESSAGE}
      severity={ErrorSeverity.ERROR}
      {...props}
    />
  );
};

////////////////////////////////////////////////
// Styles:
////////////////////////////////////////////////
// No styles needed in test file

////////////////////////////////////////////////
// JSX:
////////////////////////////////////////////////
// JSX is defined within individual test cases

////////////////////////////////////////////////
// Test Cases:
////////////////////////////////////////////////
// Test suite for the Notification component
describe('Notification Component', () => {
  // Set up fake timers before each test
  beforeEach(() => {
    jest.useFakeTimers();
  });

  // Restore real timers after each test
  afterEach(() => {
    jest.useRealTimers();
  });

  // Test basic rendering with message and severity
  it('renders with the correct message and severity', () => {
    setupTest();
    // Check if message is displayed
    expect(screen.getByText(TEST_MESSAGE)).toBeInTheDocument();
    // Check if correct severity class is applied
    expect(screen.getByRole('alert')).toHaveClass('bg-red-100');
  });

  // Test different severity styles
  it('renders with different styles based on severity', () => {
    const { rerender } = setupTest({ severity: ErrorSeverity.INFO });
    // Check info style
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-100');
    
    // Test warning style
    rerender(
      <Notification 
        message="Warning notification" 
        severity={ErrorSeverity.WARNING} 
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-100');
    
    // Test critical style
    rerender(
      <Notification 
        message="Critical notification" 
        severity={ErrorSeverity.CRITICAL} 
      />
    );
    expect(screen.getByRole('alert')).toHaveClass('bg-red-200');
  });

  // Test close button functionality
  it('closes when the close button is clicked', () => {
    const onCloseMock = jest.fn();
    setupTest({ onClose: onCloseMock });
    // Simulate clicking the close button
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    // Verify onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  // Test auto-close functionality
  it('auto-closes after the specified duration', () => {
    const onCloseMock = jest.fn();
    setupTest({ duration: TEST_DURATION, onClose: onCloseMock });
    // Advance timers to trigger auto-close
    act(() => {
      jest.advanceTimersByTime(TEST_DURATION);
    });
    // Verify onClose was called
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

// Test suite for the NotificationProvider
describe('NotificationProvider', () => {
  // Set up fake timers before each test
  beforeEach(() => {
    jest.useFakeTimers();
  });

  // Restore real timers after each test
  afterEach(() => {
    jest.useRealTimers();
  });

  // Test that the provider makes notifications available to children
  it('provides notification context to children', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    // Trigger notification
    fireEvent.click(screen.getByText('Show Notification'));
    // Verify notification appears
    expect(screen.getByText(TEST_MESSAGE)).toBeInTheDocument();
  });

  // Test multiple notifications
  it('can display multiple notifications', () => {
    // Component that shows multiple notifications
    const TestMultipleComponent = () => {
      const { addNotification } = useNotification();
      return (
        <>
          <button 
            onClick={() => addNotification('First notification', ErrorSeverity.INFO)}
            data-testid="btn-1"
          >
            Show First
          </button>
          <button 
            onClick={() => addNotification('Second notification', ErrorSeverity.WARNING)}
            data-testid="btn-2"
          >
            Show Second
          </button>
        </>
      );
    };
    
    // Render and test multiple notifications
    render(
      <NotificationProvider>
        <TestMultipleComponent />
      </NotificationProvider>
    );
    
    // Show both notifications
    fireEvent.click(screen.getByTestId('btn-1'));
    fireEvent.click(screen.getByTestId('btn-2'));
    
    // Verify both notifications appear
    expect(screen.getByText('First notification')).toBeInTheDocument();
    expect(screen.getByText('Second notification')).toBeInTheDocument();
  });

  // Test notification removal
  it('removes notifications when they are closed', () => {
    render(
      <NotificationProvider>
        <TestComponent duration={1000} />
      </NotificationProvider>
    );
    
    // Show notification
    fireEvent.click(screen.getByText('Show Notification'));
    expect(screen.getByText(TEST_MESSAGE)).toBeInTheDocument();
    
    // Wait for auto-close
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // Verify notification is removed
    expect(screen.queryByText(TEST_MESSAGE)).not.toBeInTheDocument();
  });
}); 