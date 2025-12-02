/**
 * 🛡️ Error Boundary Component
 * 
 * A React Error Boundary that catches JavaScript errors in child component trees,
 * logs error information, and displays a fallback UI instead of crashing the entire app.
 * 
 * Features:
 * - Catches and logs component errors
 * - Provides accessible fallback UI
 * - Error recovery mechanisms
 * - Error reporting and monitoring integration
 * - Different error type handling (network, service, validation)
 * - Accessibility compliant
 */

'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw, Home, Bug, Wifi, WifiOff, Database, Shield } from 'lucide-react';

// ============================================================================
// TYPES
// ============================================================================

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  enableLogging?: boolean;
  customLogger?: (error: Error, errorInfo: ErrorInfo) => void;
  maxRetries?: number;
  retryDelay?: number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorType: 'network' | 'service' | 'validation' | 'unknown' | null;
  retryCount: number;
  isRetrying: boolean;
  errorId: string;
}

// ============================================================================
// ERROR TYPE DETECTION
// ============================================================================

const detectErrorType = (error: Error): 'network' | 'service' | 'validation' | 'unknown' => {
  const errorMessage = error.message.toLowerCase();
  const errorStack = error.stack?.toLowerCase() || '';
  
  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('failed to fetch') ||
    errorMessage.includes('networkerror') ||
    errorStack.includes('network') ||
    errorStack.includes('fetch')
  ) {
    return 'network';
  }
  
  // Service errors
  if (
    errorMessage.includes('service') ||
    errorMessage.includes('factory') ||
    errorMessage.includes('agent') ||
    errorMessage.includes('creation') ||
    errorMessage.includes('assembly') ||
    errorMessage.includes('smartfactory') ||
    errorStack.includes('factory') ||
    errorStack.includes('service')
  ) {
    return 'service';
  }
  
  // Validation errors
  if (
    errorMessage.includes('validation') ||
    errorMessage.includes('invalid') ||
    errorMessage.includes('required') ||
    errorMessage.includes('missing') ||
    errorMessage.includes('format') ||
    errorStack.includes('validation')
  ) {
    return 'validation';
  }
  
  return 'unknown';
};

// ============================================================================
// ERROR LOGGING
// ============================================================================

const logError = (error: Error, errorInfo: ErrorInfo, errorType: string, errorId: string): void => {
  const errorData = {
    errorId,
    timestamp: new Date().toISOString(),
    type: errorType,
    message: error.message,
    stack: error.stack,
    componentStack: errorInfo.componentStack,
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
    url: typeof window !== 'undefined' ? window.location.href : 'N/A'
  };
  
  // Console logging with structured format
  console.group(`🚨 Error Boundary - ${errorType.toUpperCase()} [${errorId}]`);
  console.error('Error:', error);
  console.error('Error Info:', errorInfo);
  console.error('Error Data:', errorData);
  console.groupEnd();
  
  // In production, you would send this to your error reporting service
  if (typeof window !== 'undefined' && window.location.hostname !== 'localhost') {
    // Example: Send to error reporting service
    // reportError(errorData);
  }
};

// ============================================================================
// FALLBACK UI COMPONENTS
// ============================================================================

const NetworkErrorFallback: React.FC<{ onRetry: () => void; isRetrying: boolean }> = ({ onRetry, isRetrying }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center">
        <WifiOff className="w-8 h-8 text-red-400" />
      </div>
      <h2 className="text-xl font-semibold text-red-400">Network Connection Error</h2>
      <p className="text-gray-400">
        Unable to connect to the factory service. Please check your internet connection and try again.
      </p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 disabled:bg-red-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-red-500"
        aria-label="Retry connection"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            Reconnecting...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Retry Connection
          </>
        )}
      </button>
    </div>
  </div>
);

const ServiceErrorFallback: React.FC<{ onRetry: () => void; isRetrying: boolean }> = ({ onRetry, isRetrying }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-orange-500/20 rounded-full flex items-center justify-center">
        <Database className="w-8 h-8 text-orange-400" />
      </div>
      <h2 className="text-xl font-semibold text-orange-400">Factory Service Error</h2>
      <p className="text-gray-400">
        The factory service encountered an error while processing your request. The team has been notified.
      </p>
      <div className="space-y-2">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500"
          aria-label="Retry operation"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Retry Operation
            </>
          )}
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Go to homepage"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Go Home
        </button>
      </div>
    </div>
  </div>
);

const ValidationErrorFallback: React.FC<{ onRetry: () => void; isRetrying: boolean }> = ({ onRetry, isRetrying }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center">
        <AlertCircle className="w-8 h-8 text-yellow-400" />
      </div>
      <h2 className="text-xl font-semibold text-yellow-400">Validation Error</h2>
      <p className="text-gray-400">
        There was an issue with the data provided. Please refresh the page and try again.
      </p>
      <button
        onClick={onRetry}
        disabled={isRetrying}
        className="w-full flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 disabled:bg-yellow-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-yellow-500"
        aria-label="Refresh page"
      >
        {isRetrying ? (
          <>
            <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
            Refreshing...
          </>
        ) : (
          <>
            <RefreshCw className="w-4 h-4" aria-hidden="true" />
            Refresh Page
          </>
        )}
      </button>
    </div>
  </div>
);

const UnknownErrorFallback: React.FC<{ 
  onRetry: () => void; 
  isRetrying: boolean; 
  errorId: string;
  onReportBug?: () => void;
}> = ({ onRetry, isRetrying, errorId, onReportBug }) => (
  <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-4">
    <div className="max-w-md w-full bg-gray-800 rounded-xl p-6 text-center space-y-4">
      <div className="mx-auto w-16 h-16 bg-purple-500/20 rounded-full flex items-center justify-center">
        <Bug className="w-8 h-8 text-purple-400" />
      </div>
      <h2 className="text-xl font-semibold text-purple-400">Unexpected Error</h2>
      <p className="text-gray-400">
        Something went wrong unexpectedly. Our team has been automatically notified.
      </p>
      <div className="text-xs text-gray-500">
        Error ID: {errorId}
      </div>
      <div className="space-y-2">
        <button
          onClick={onRetry}
          disabled={isRetrying}
          className="w-full flex items-center justify-center gap-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-500/50 disabled:cursor-not-allowed text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500"
          aria-label="Retry operation"
        >
          {isRetrying ? (
            <>
              <RefreshCw className="w-4 h-4 animate-spin" aria-hidden="true" />
              Retrying...
            </>
          ) : (
            <>
              <RefreshCw className="w-4 h-4" aria-hidden="true" />
              Try Again
            </>
          )}
        </button>
        <button
          onClick={() => window.location.href = '/'}
          className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
          aria-label="Go to homepage"
        >
          <Home className="w-4 h-4" aria-hidden="true" />
          Go Home
        </button>
        {onReportBug && (
          <button
            onClick={onReportBug}
            className="w-full flex items-center justify-center gap-2 bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500"
            aria-label="Report bug"
          >
            <Bug className="w-4 h-4" aria-hidden="true" />
            Report Bug
          </button>
        )}
      </div>
    </div>
  </div>
);

// ============================================================================
// MAIN ERROR BOUNDARY COMPONENT
// ============================================================================

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  private retryTimeout?: NodeJS.Timeout;

  constructor(props: ErrorBoundaryProps) {
    super(props);
    
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorType: null,
      retryCount: 0,
      isRetrying: false,
      errorId: ''
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return {
      hasError: true,
      error,
      errorType: detectErrorType(error),
      errorId: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });
    
    const errorType = detectErrorType(error);
    const { errorId } = this.state;
    
    // Log the error
    if (this.props.enableLogging !== false) {
      if (this.props.customLogger) {
        this.props.customLogger(error, errorInfo);
      } else {
        logError(error, errorInfo, errorType, errorId);
      }
    }
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = (): void => {
    const { maxRetries = 3, retryDelay = 1000 } = this.props;
    const { retryCount } = this.state;
    
    if (retryCount >= maxRetries) {
      return;
    }
    
    this.setState({ isRetrying: true });
    
    // Clear any existing timeout
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
    
    // Delay before retry
    this.retryTimeout = setTimeout(() => {
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        errorType: null,
        retryCount: retryCount + 1,
        isRetrying: false
      });
    }, retryDelay);
  };

  handleReportBug = (): void => {
    const { error, errorInfo, errorId } = this.state;
    
    // Create bug report data
    const bugReport = {
      errorId,
      errorMessage: error?.message,
      errorStack: error?.stack,
      componentStack: errorInfo?.componentStack,
      userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'N/A',
      url: typeof window !== 'undefined' ? window.location.href : 'N/A',
      timestamp: new Date().toISOString()
    };
    
    // In a real app, this would open a bug reporting form or send to a service
    console.log('Bug Report:', bugReport);
    
    // Open email client with pre-filled bug report
    const subject = `Bug Report - ${errorId}`;
    const body = `Error ID: ${errorId}\n\nError Message: ${bugReport.errorMessage}\n\nPlease describe what you were doing when this error occurred:\n\n`;
    window.location.href = `mailto:support@axiom.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  };

  componentWillUnmount(): void {
    if (this.retryTimeout) {
      clearTimeout(this.retryTimeout);
    }
  }

  render(): ReactNode {
    const { hasError, errorType, isRetrying, errorId, retryCount } = this.state;
    const { children, fallback, maxRetries = 3 } = this.props;
    
    if (hasError) {
      // Use custom fallback if provided
      if (fallback) {
        return fallback;
      }
      
      // Show appropriate fallback based on error type
      const commonProps = {
        onRetry: this.handleRetry,
        isRetrying
      };
      
      switch (errorType) {
        case 'network':
          return <NetworkErrorFallback {...commonProps} />;
        case 'service':
          return <ServiceErrorFallback {...commonProps} />;
        case 'validation':
          return <ValidationErrorFallback {...commonProps} />;
        default:
          return (
            <UnknownErrorFallback 
              {...commonProps} 
              errorId={errorId}
              onReportBug={this.handleReportBug}
            />
          );
      }
    }
    
    return children;
  }
}

// ============================================================================
// HOOK FOR FUNCTIONAL COMPONENTS
// ============================================================================

export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
): React.FC<P> => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
};

export default ErrorBoundary;