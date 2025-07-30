import React, { Component, ReactNode, ErrorInfo } from 'react';
import { AppError } from '../types';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = (): void => {
    this.setState({ hasError: false, error: undefined });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div style={{
          padding: '20px',
          textAlign: 'center',
          backgroundColor: '#fff3cd',
          border: '1px solid #ffeaa7',
          borderRadius: '4px',
          margin: '20px'
        }}>
          <h2 style={{ color: '#856404', marginBottom: '10px' }}>
            Something went wrong
          </h2>
          <p style={{ color: '#664d03', marginBottom: '15px' }}>
            {this.state.error?.message || 'An unexpected error occurred'}
          </p>
          <button
            onClick={this.handleRetry}
            style={{
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              padding: '8px 16px',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for handling errors in functional components
export const useErrorHandler = () => {
  const handleError = (error: unknown): void => {
    console.error('Error caught by error handler:', error);
    
    // You could integrate with error reporting service here
    // e.g., Sentry, LogRocket, etc.
    
    if (error instanceof AppError) {
      // Handle known application errors
      console.error('Application error:', {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode
      });
    }
  };

  return { handleError };
};