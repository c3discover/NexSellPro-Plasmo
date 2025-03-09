import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Notification, NotificationProvider, useNotification } from '../../../components/common/Notification';
import { ErrorSeverity } from '../../../utils/errorHandling';

describe('Notification Component', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with the correct message and severity', () => {
    render(
      <Notification 
        message="Test notification" 
        severity={ErrorSeverity.ERROR} 
      />
    );
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveClass('bg-red-100');
  });

  it('renders with different styles based on severity', () => {
    const { rerender } = render(
      <Notification 
        message="Info notification" 
        severity={ErrorSeverity.INFO} 
      />
    );
    
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-100');
    
    rerender(
      <Notification 
        message="Warning notification" 
        severity={ErrorSeverity.WARNING} 
      />
    );
    
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-100');
    
    rerender(
      <Notification 
        message="Critical notification" 
        severity={ErrorSeverity.CRITICAL} 
      />
    );
    
    expect(screen.getByRole('alert')).toHaveClass('bg-red-200');
  });

  it('closes when the close button is clicked', () => {
    const onCloseMock = jest.fn();
    
    render(
      <Notification 
        message="Test notification" 
        onClose={onCloseMock} 
      />
    );
    
    fireEvent.click(screen.getByRole('button', { name: /close/i }));
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });

  it('auto-closes after the specified duration', () => {
    const onCloseMock = jest.fn();
    
    render(
      <Notification 
        message="Test notification" 
        duration={2000} 
        onClose={onCloseMock} 
      />
    );
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    
    expect(onCloseMock).toHaveBeenCalledTimes(1);
  });
});

// Test component to use the notification context
const TestComponent = () => {
  const { addNotification } = useNotification();
  
  return (
    <button onClick={() => addNotification('Test notification', ErrorSeverity.ERROR)}>
      Show Notification
    </button>
  );
};

describe('NotificationProvider', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('provides notification context to children', () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Notification'));
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
  });

  it('can display multiple notifications', () => {
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
    
    render(
      <NotificationProvider>
        <TestMultipleComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByTestId('btn-1'));
    fireEvent.click(screen.getByTestId('btn-2'));
    
    expect(screen.getByText('First notification')).toBeInTheDocument();
    expect(screen.getByText('Second notification')).toBeInTheDocument();
  });

  it('removes notifications when they are closed', () => {
    const TestRemoveComponent = () => {
      const { addNotification } = useNotification();
      
      return (
        <button 
          onClick={() => addNotification('Test notification', ErrorSeverity.ERROR, 1000)}
        >
          Show Notification
        </button>
      );
    };
    
    render(
      <NotificationProvider>
        <TestRemoveComponent />
      </NotificationProvider>
    );
    
    fireEvent.click(screen.getByText('Show Notification'));
    
    expect(screen.getByText('Test notification')).toBeInTheDocument();
    
    // Fast-forward time
    act(() => {
      jest.advanceTimersByTime(1000);
    });
    
    // The notification should be removed
    expect(screen.queryByText('Test notification')).not.toBeInTheDocument();
  });
}); 