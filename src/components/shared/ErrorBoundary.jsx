import React from 'react';
import { AlertTriangle, RefreshCw, Home, Bug, Heart, Mail } from 'lucide-react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null, retryCount: 0 };
  }

  static getDerivedStateFromError(_error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({
      error,
      errorInfo
    });

    // Log to error reporting service in production
    console.error('Error caught by boundary:', error, errorInfo);
  }

  handleRetry = () => {
    this.setState(prevState => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1
    }));
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 p-6">
          <div className="max-w-lg w-full">
            {/* Main Error Card */}
            <div className="bg-white rounded-2xl shadow-2xl shadow-gray-200/50 p-8 border border-gray-100">
              {/* Animated Icon */}
              <div className="relative flex items-center justify-center w-20 h-20 mx-auto mb-6">
                <div className="absolute inset-0 bg-red-100 rounded-full animate-ping opacity-30"></div>
                <div className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-red-100 to-red-200 rounded-full shadow-lg">
                  <AlertTriangle className="w-10 h-10 text-red-600" />
                </div>
              </div>

              <h1 className="text-2xl font-bold text-gray-900 text-center mb-2">
                Oops! Something went wrong
              </h1>

              <p className="text-gray-600 text-center mb-6">
                We apologize for the inconvenience. The application encountered an unexpected error.
                {this.state.retryCount > 0 && (
                  <span className="block text-sm text-amber-600 mt-2">
                    Retry attempt {this.state.retryCount} failed. The error may be persistent.
                  </span>
                )}
              </p>

              {/* Development Error Info */}
              {import.meta.env.MODE === 'development' && this.state.error && (
                <div className="mb-6 p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border border-gray-200 overflow-auto max-h-48">
                  <div className="flex items-center gap-2 mb-2">
                    <Bug className="w-4 h-4 text-red-500" />
                    <span className="text-xs font-semibold text-gray-700 uppercase tracking-wide">Debug Info</span>
                  </div>
                  <p className="text-sm font-mono text-red-600 mb-2">
                    {this.state.error.toString()}
                  </p>
                  <details className="text-xs font-mono text-gray-600">
                    <summary className="cursor-pointer font-semibold mb-2 text-gray-700 hover:text-blue-600 transition-colors">
                      Show Stack Trace
                    </summary>
                    <pre className="whitespace-pre-wrap text-gray-500 p-2 bg-white rounded border">
                      {this.state.errorInfo?.componentStack}
                    </pre>
                  </details>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 mb-4">
                <button
                  onClick={this.handleRetry}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </button>
              </div>

              <button
                onClick={() => window.location.reload()}
                className="w-full flex items-center justify-center gap-2 px-4 py-2.5 border-2 border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 transition-all text-sm"
              >
                <RefreshCw className="w-4 h-4" />
                Full Page Reload
              </button>
            </div>

            {/* Support Footer */}
            <div className="mt-6 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm">
                <Mail className="w-4 h-4 text-gray-400" />
                <p className="text-sm text-gray-600">
                  Need help?{' '}
                  <a href="mailto:algarainilama@gmail.com" className="text-blue-600 hover:underline font-medium">
                    Contact Support
                  </a>
                </p>
              </div>
            </div>

            {/* App Branding */}
            <div className="mt-6 flex items-center justify-center gap-2 text-gray-400">
              <Heart className="w-4 h-4" />
              <span className="text-sm">Innovative Geriatrics Medical App</span>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Inline Error Boundary for smaller components
export const InlineErrorBoundary = ({ children, fallback }) => {
  return (
    <ErrorBoundary
      fallback={
        fallback || (
          <div className="p-6 bg-red-50 border border-red-200 rounded-xl text-center">
            <AlertTriangle className="w-8 h-8 text-red-500 mx-auto mb-2" />
            <p className="text-sm text-red-700 font-medium">Failed to load this section</p>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 px-4 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Reload
            </button>
          </div>
        )
      }
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
