/**
 * 🧪 AxiomGigafactory Error Boundary Tests
 * 
 * Comprehensive test suite for React Error Boundary implementation with AxiomGigafactory component.
 * Tests error catching, fallback UI display, recovery mechanisms, and accessibility.
 * 
 * Test Coverage:
 * - Error boundary catches SmartFactoryService errors
 * - Error fallback UI displays correctly for different error types
 * - Component recovery after service restoration
 * - Error boundary with different error types (network, service, validation)
 * - Error states are properly reflected in UI
 * - Accessibility of error fallback UI
 * - Error logging and monitoring
 */

import React, { useState, useEffect } from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import '@testing-library/jest-dom';

// Import components and services
import AxiomGigafactory from '../AxiomGigafactory';
import ErrorBoundary from '../ErrorBoundary';
import { smartFactoryService, createAgent, fetchFactoryMetrics } from '@/services/factoryService';

// Extend Jest matchers
expect.extend(toHaveNoViolations);

// ============================================================================
// MOCKS AND UTILITIES
// ============================================================================

// Mock window.location for navigation tests
const mockLocation = {
  href: '',
  assign: jest.fn(),
  replace: jest.fn()
};

// Mock console methods to test error logging
const originalConsoleError = console.error;
const originalConsoleGroup = console.group;
const originalConsoleGroupEnd = console.groupEnd;

let mockConsoleError: jest.MockedFunction<typeof console.error>;
let mockConsoleGroup: jest.MockedFunction<typeof console.group>;
let mockConsoleGroupEnd: jest.MockedFunction<typeof console.groupEnd>;


// Mock navigator.userAgent
Object.defineProperty(window.navigator, 'userAgent', {
  value: 'Mozilla/5.0 (Test Browser) for Error Boundary Testing',
  writable: true
});

// ============================================================================
// TEST UTILITIES
// ============================================================================

const createMockError = (message: string, type: 'network' | 'service' | 'validation' | 'unknown' = 'unknown'): Error => {
  const error = new Error(message);
  
  // Add stack traces based on error type
  switch (type) {
    case 'network':
      error.stack = `NetworkError: Failed to fetch\n    at fetchFactoryMetrics (factoryService.ts:123)\n    at AxiomGigafactory (AxiomGigafactory.tsx:456)`;
      break;
    case 'service':
      error.stack = `ServiceError: Factory service unavailable\n    at createAgent (factoryService.ts:234)\n    at AxiomGigafactory (AxiomGigafactory.tsx:789)`;
      break;
    case 'validation':
      error.stack = `ValidationError: Invalid agent type\n    at validateAgent (factoryService.ts:345)\n    at AxiomGigafactory (AxiomGigafactory.tsx:567)`;
      break;
    default:
      error.stack = `Error: ${message}\n    at AxiomGigafactory (AxiomGigafactory.tsx:123)`;
  }
  
  return error;
};

const createThrowingComponent = (error: Error): React.FC => {
  return () => {
    throw error;
  };
};

const createAsyncThrowingComponent = (error: Error, delay: number = 100): React.FC => {
  return () => {
    const [shouldThrow, setShouldThrow] = useState(false);
    
    useEffect(() => {
      const timer = setTimeout(() => setShouldThrow(true), delay);
      return () => clearTimeout(timer);
    }, []);
    
    if (shouldThrow) {
      throw error;
    }
    
    return <div>Loading...</div>;
  };
};

// ============================================================================
// TEST SETUP AND TEARDOWN
// ============================================================================

beforeEach(() => {
  // Mock console methods
  mockConsoleError = jest.fn();
  mockConsoleGroup = jest.fn();
  mockConsoleGroupEnd = jest.fn();
  
  console.error = mockConsoleError;
  console.group = mockConsoleGroup;
  console.groupEnd = mockConsoleGroupEnd;
  
  // Reset location mock
  mockLocation.href = '';
  
  // Reset factory service
  smartFactoryService.resetFactory();
});

afterEach(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.group = originalConsoleGroup;
  console.groupEnd = originalConsoleGroupEnd;
  
  // Clear all mocks
  jest.clearAllMocks();
});

// ============================================================================
// BASIC ERROR BOUNDARY TESTS
// ============================================================================

describe('ErrorBoundary - Basic Functionality', () => {
  test('catches and displays error when child component throws', async () => {
    const errorMessage = 'Test error message';
    const error = createMockError(errorMessage);
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    // Verify error was logged
    expect(mockConsoleGroup).toHaveBeenCalledWith(
      expect.stringContaining('🚨 Error Boundary - UNKNOWN')
    );
    expect(mockConsoleError).toHaveBeenCalledWith('Error:', error);
  });

  test('renders children normally when no error occurs', () => {
    const NormalComponent = () => <div>Normal component content</div>;
    
    render(
      <ErrorBoundary>
        <NormalComponent />
      </ErrorBoundary>
    );
    
    expect(screen.getByText('Normal component content')).toBeInTheDocument();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  test('calls custom onError handler when provided', async () => {
    const errorMessage = 'Custom error handler test';
    const error = createMockError(errorMessage);
    const onError = jest.fn();
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary onError={onError}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(onError).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });

  test('calls custom logger when provided', async () => {
    const errorMessage = 'Custom logger test';
    const error = createMockError(errorMessage);
    const customLogger = jest.fn();
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary customLogger={customLogger}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(customLogger).toHaveBeenCalledWith(error, expect.any(Object));
    });
  });
});

// ============================================================================
// ERROR TYPE DETECTION TESTS
// ============================================================================

describe('ErrorBoundary - Error Type Detection', () => {
  test('detects and displays network error fallback', async () => {
    const error = createMockError('Network connection failed', 'network');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/network connection error/i)).toBeInTheDocument();
      expect(screen.getByText(/unable to connect to the factory service/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
    });
  });

  test('detects and displays service error fallback', async () => {
    const error = createMockError('Factory service error', 'service');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/factory service error/i)).toBeInTheDocument();
      expect(screen.getByText(/the factory service encountered an error/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /retry operation/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });
  });

  test('detects and displays validation error fallback', async () => {
    const error = createMockError('Invalid agent type', 'validation');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/validation error/i)).toBeInTheDocument();
      expect(screen.getByText(/there was an issue with the data provided/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
    });
  });

  test('displays unknown error fallback for unrecognized errors', async () => {
    const error = createMockError('Random unexpected error', 'unknown');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
      expect(screen.getByText(/something went wrong unexpectedly/i)).toBeInTheDocument();
      expect(screen.getByText(/error id:/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /report bug/i })).toBeInTheDocument();
    });
  });
});

// ============================================================================
// RETRY MECHANISM TESTS
// ============================================================================

describe('ErrorBoundary - Retry Mechanism', () => {
  test('allows retry when retry button is clicked', async () => {
    const error = createMockError('Retry test error');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary maxRetries={2} retryDelay={100}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    // Click retry button
    act(() => {
      fireEvent.click(retryButton);
    });
    
    // Should show retrying state
    expect(screen.getByText(/retrying/i)).toBeInTheDocument();
    expect(retryButton).toBeDisabled();
    
    // After delay, should attempt to render again (and fail again)
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    }, { timeout: 200 });
  });

  test('respects maxRetries limit', async () => {
    const error = createMockError('Max retries test');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary maxRetries={1} retryDelay={50}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    // First retry
    act(() => {
      fireEvent.click(retryButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    }, { timeout: 100 });
    
    // Second retry should be ignored (maxRetries = 1)
    act(() => {
      fireEvent.click(retryButton);
    });
    
    // Should still show error, not retrying
    expect(screen.queryByText(/retrying/i)).not.toBeInTheDocument();
  });

  test('recovers successfully when component stops throwing', async () => {
    let shouldThrow = true;
    const SometimesThrowingComponent = () => {
      if (shouldThrow) {
        throw createMockError('Temporary error');
      }
      return <div>Recovered successfully!</div>;
    };
    
    const { rerender } = render(
      <ErrorBoundary maxRetries={2} retryDelay={50}>
        <SometimesThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    // Fix the component and retry
    shouldThrow = false;
    const retryButton = screen.getByRole('button', { name: /try again/i });
    
    act(() => {
      fireEvent.click(retryButton);
    });
    
    await waitFor(() => {
      expect(screen.getByText('Recovered successfully!')).toBeInTheDocument();
    }, { timeout: 100 });
  });
});

// ============================================================================
// AXIOMGIGAFACTORY INTEGRATION TESTS
// ============================================================================

describe('AxiomGigafactory - Error Boundary Integration', () => {
  test('catches SmartFactoryService errors in AxiomGigafactory', async () => {
    // Mock fetchFactoryMetrics to throw a network error
    const originalFetchFactoryMetrics = fetchFactoryMetrics;
    const mockFetchFactoryMetrics = jest.fn().mockRejectedValue(
      createMockError('Network connection failed', 'network')
    );
    
    // Temporarily replace the function
    (global as any).fetchFactoryMetrics = mockFetchFactoryMetrics;
    
    render(
      <ErrorBoundary>
        <AxiomGigafactory />
      </ErrorBoundary>
    );
    
    // Wait for error to be caught
    await waitFor(() => {
      expect(screen.getByText(/network connection error/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Restore original function
    (global as any).fetchFactoryMetrics = originalFetchFactoryMetrics;
  });

  test('handles service errors from agent creation', async () => {
    // Mock createAgent to throw a service error
    const originalCreateAgent = createAgent;
    const mockCreateAgent = jest.fn().mockRejectedValue(
      createMockError('Factory service unavailable', 'service')
    );
    
    (global as any).createAgent = mockCreateAgent;
    
    render(
      <ErrorBoundary>
        <AxiomGigafactory />
      </ErrorBoundary>
    );
    
    // Wait for component to load
    await waitFor(() => {
      expect(screen.getByText(/axiom gigafactory/i)).toBeInTheDocument();
    });
    
    // Try to create an agent
    const createButton = screen.getByRole('button', { name: /create agent/i });
    act(() => {
      fireEvent.click(createButton);
    });
    
    // Wait for error to be caught
    await waitFor(() => {
      expect(screen.getByText(/factory service error/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Restore original function
    (global as any).createAgent = originalCreateAgent;
  });

  test('recovers when service is restored', async () => {
    let shouldFail = true;
    const mockFetchFactoryMetrics = jest.fn().mockImplementation(() => {
      if (shouldFail) {
        return Promise.reject(createMockError('Service temporarily unavailable', 'service'));
      }
      return Promise.resolve({
        totalAgentsCreated: 0,
        activeAgents: 0,
        completedAgents: 0,
        failedAgents: 0,
        averageProductionTime: 0,
        currentProductionRate: 0,
        uptime: 0,
        efficiency: 100,
        lastProductionTime: 0,
        activeWallets: 0,
        totalToolsLoaded: 0
      });
    });
    
    (global as any).fetchFactoryMetrics = mockFetchFactoryMetrics;
    
    render(
      <ErrorBoundary maxRetries={2} retryDelay={100}>
        <AxiomGigafactory />
      </ErrorBoundary>
    );
    
    // Wait for error
    await waitFor(() => {
      expect(screen.getByText(/factory service error/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Fix the service and retry
    shouldFail = false;
    const retryButton = screen.getByRole('button', { name: /retry operation/i });
    
    act(() => {
      fireEvent.click(retryButton);
    });
    
    // Should recover and show the component
    await waitFor(() => {
      expect(screen.getByText(/axiom gigafactory/i)).toBeInTheDocument();
    }, { timeout: 5000 });
    
    // Restore original function
    delete (global as any).fetchFactoryMetrics;
  });
});

// ============================================================================
// ACCESSIBILITY TESTS
// ============================================================================

describe('ErrorBoundary - Accessibility', () => {
  test('network error fallback UI is accessible', async () => {
    const error = createMockError('Network error', 'network');
    const ThrowingComponent = createThrowingComponent(error);
    
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/network connection error/i)).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Test ARIA labels
    expect(screen.getByRole('button', { name: /retry connection/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('service error fallback UI is accessible', async () => {
    const error = createMockError('Service error', 'service');
    const ThrowingComponent = createThrowingComponent(error);
    
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/factory service error/i)).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Test ARIA labels
    expect(screen.getByRole('button', { name: /retry operation/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('validation error fallback UI is accessible', async () => {
    const error = createMockError('Validation error', 'validation');
    const ThrowingComponent = createThrowingComponent(error);
    
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/validation error/i)).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Test ARIA labels
    expect(screen.getByRole('button', { name: /refresh page/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('unknown error fallback UI is accessible', async () => {
    const error = createMockError('Unknown error', 'unknown');
    const ThrowingComponent = createThrowingComponent(error);
    
    const { container } = render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    const results = await axe(container);
    expect(results).toHaveNoViolations();
    
    // Test ARIA labels
    expect(screen.getByRole('button', { name: /try again/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /report bug/i })).toBeInTheDocument();
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  test('keyboard navigation works in error fallback UI', async () => {
    const error = createMockError('Service error', 'service');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/factory service error/i)).toBeInTheDocument();
    });
    
    const user = userEvent.setup();
    
    // Tab through buttons
    await user.tab();
    expect(screen.getByRole('button', { name: /retry operation/i })).toHaveFocus();
    
    await user.tab();
    expect(screen.getByRole('button', { name: /go home/i })).toHaveFocus();
    
    // Enter key should activate focused button
    await user.keyboard('{Enter}');
    expect(mockLocation.href).toBe('/');
  });
});

// ============================================================================
// ERROR LOGGING AND MONITORING TESTS
// ============================================================================

describe('ErrorBoundary - Error Logging and Monitoring', () => {
  test('logs error with correct structure', async () => {
    const error = createMockError('Test logging error');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary enableLogging={true}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    // Verify error logging structure
    expect(mockConsoleGroup).toHaveBeenCalledWith(
      expect.stringContaining('🚨 Error Boundary - UNKNOWN')
    );
    expect(mockConsoleError).toHaveBeenCalledWith('Error:', error);
    expect(mockConsoleError).toHaveBeenCalledWith('Error Info:', expect.any(Object));
    expect(mockConsoleError).toHaveBeenCalledWith('Error Data:', expect.objectContaining({
      errorId: expect.stringMatching(/^err_\d+_[a-z0-9]+$/),
      timestamp: expect.any(String),
      type: 'unknown',
      message: 'Test logging error',
      stack: expect.any(String),
      componentStack: expect.any(String),
      userAgent: expect.any(String),
      url: expect.any(String)
    }));
    expect(mockConsoleGroupEnd).toHaveBeenCalled();
  });

  test('can disable error logging', async () => {
    const error = createMockError('No logging error');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary enableLogging={false}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    // Should not log when disabled
    expect(mockConsoleGroup).not.toHaveBeenCalled();
    expect(mockConsoleError).not.toHaveBeenCalled();
  });

  test('uses custom logger when provided', async () => {
    const error = createMockError('Custom logger error');
    const customLogger = jest.fn();
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary customLogger={customLogger}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    // Should use custom logger instead of default
    expect(customLogger).toHaveBeenCalledWith(error, expect.any(Object));
    expect(mockConsoleGroup).not.toHaveBeenCalled();
  });

  test('generates unique error IDs', async () => {
    const error1 = createMockError('First error');
    const error2 = createMockError('Second error');
    
    const ThrowingComponent1 = createThrowingComponent(error1);
    const ThrowingComponent2 = createThrowingComponent(error2);
    
    const { unmount } = render(
      <ErrorBoundary>
        <ThrowingComponent1 />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    const firstErrorId = screen.getByText(/error id:/i).textContent;
    
    unmount();
    
    render(
      <ErrorBoundary>
        <ThrowingComponent2 />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
    
    const secondErrorId = screen.getByText(/error id:/i).textContent;
    
    expect(firstErrorId).not.toBe(secondErrorId);
  });
});

// ============================================================================
// CUSTOM FALLBACK TESTS
// ============================================================================

describe('ErrorBoundary - Custom Fallback', () => {
  test('renders custom fallback when provided', async () => {
    const error = createMockError('Custom fallback test');
    const ThrowingComponent = createThrowingComponent(error);
    const CustomFallback = () => <div>Custom error fallback component</div>;
    
    render(
      <ErrorBoundary fallback={<CustomFallback />}>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByText('Custom error fallback component')).toBeInTheDocument();
    });
    
    // Should not show default fallback
    expect(screen.queryByText(/unexpected error/i)).not.toBeInTheDocument();
  });
});

// ============================================================================
// HOC TESTS
// ============================================================================

describe('ErrorBoundary - Higher Order Component', () => {
  test('withErrorBoundary HOC wraps component correctly', async () => {
    const error = createMockError('HOC test error');
    const ThrowingComponent = createThrowingComponent(error);
    const WrappedComponent = ErrorBoundary.withErrorBoundary(ThrowingComponent);
    
    render(<WrappedComponent />);
    
    await waitFor(() => {
      expect(screen.getByText(/unexpected error/i)).toBeInTheDocument();
    });
  });

  test('HOC passes props to wrapped component', () => {
    const TestComponent: React.FC<{ message: string }> = ({ message }) => <div>{message}</div>;
    const WrappedComponent = ErrorBoundary.withErrorBoundary(TestComponent);
    
    render(<WrappedComponent message="Test message" />);
    
    expect(screen.getByText('Test message')).toBeInTheDocument();
  });
});

// ============================================================================
// NAVIGATION TESTS
// ============================================================================

describe('ErrorBoundary - Navigation', () => {
  test('go home button navigates to homepage', async () => {
    const error = createMockError('Navigation test error', 'service');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /go home/i })).toBeInTheDocument();
    });
    
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /go home/i }));
    });
    
    expect(mockLocation.href).toBe('/');
  });

  test('report bug button opens email client', async () => {
    const error = createMockError('Bug report test', 'unknown');
    const ThrowingComponent = createThrowingComponent(error);
    
    render(
      <ErrorBoundary>
        <ThrowingComponent />
      </ErrorBoundary>
    );
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /report bug/i })).toBeInTheDocument();
    });
    
    act(() => {
      fireEvent.click(screen.getByRole('button', { name: /report bug/i }));
    });
    
    expect(mockLocation.href).toContain('mailto:support@axiom.com');
    expect(mockLocation.href).toContain('subject=');
    expect(mockLocation.href).toContain('body=');
  });
});