import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error for debugging (development only)
    if (typeof import.meta !== 'undefined' && import.meta.env?.DEV && typeof console !== 'undefined') {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      // Fallback UI for mobile debugging
      return (
        <div className="min-h-screen bg-red-50 dark:bg-red-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h1 className="text-2xl font-bold text-red-600 dark:text-red-400 mb-4">
                Something went wrong
              </h1>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                The app encountered an error. This helps us debug mobile issues.
              </p>
              
              {/* Error details for debugging */}
              <div className="bg-gray-100 dark:bg-gray-700 rounded p-4 mb-4 text-left">
                <h3 className="font-bold text-sm mb-2">Error Details:</h3>
                <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto">
                  {this.state.error?.toString()}
                </pre>
                {this.state.errorInfo && (
                  <details className="mt-2">
                    <summary className="cursor-pointer text-sm font-medium">
                      Component Stack
                    </summary>
                    <pre className="text-xs mt-2 text-gray-600 dark:text-gray-300 overflow-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
              
              <div className="space-y-2">
                <button
                  onClick={() => window.location.reload()}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded"
                >
                  Reload App
                </button>
                
                <button
                  onClick={() => window.location.href = '/mobile-test.html'}
                  className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-4 rounded"
                >
                  Mobile Test Page
                </button>
              </div>
              
              {/* Device info for debugging */}
              <div className="mt-4 text-xs text-gray-500 dark:text-gray-400">
                <div>Screen: {window.innerWidth} x {window.innerHeight}</div>
                <div>Mobile: {window.innerWidth < 768 ? 'Yes' : 'No'}</div>
                <div>Touch: {'ontouchstart' in window ? 'Yes' : 'No'}</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
