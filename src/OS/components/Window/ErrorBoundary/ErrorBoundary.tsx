'use client';

/**
 * Error Boundary Component
 * Catches React errors in child components to prevent system-wide crashes
 * Per-app error boundaries ensure one crash doesn't kill the entire OS
 */

import React from 'react';
import { eventBus } from '../../../lib/eventBus';
import Button from '../../UI/Button/Button';
import styles from './ErrorBoundary.module.css';

interface ErrorBoundaryProps {
  children: React.ReactNode;
  appId: string;
  appName: string;
  onReset?: () => void;
  fallback?: React.ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: React.ErrorInfo | null;
}

export default class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details
    console.error(`App crashed: ${this.props.appName}`, error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Publish error event to event bus
    eventBus.publish('APP_ERROR', {
      appId: this.props.appId,
      error,
    });

    // Could send to error reporting service here
    // reportErrorToService(error, errorInfo, this.props.appId);
  }

  handleReset = () => {
    // Reset error state
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });

    // Call optional reset handler
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback if provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default Mac OS 8 style error dialog
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorDialog}>
            {/* Icon */}
            <div className={styles.iconSection}>
              <div className={styles.errorIcon}>💥</div>
            </div>

            {/* Content */}
            <div className={styles.content}>
              <div className={styles.title}>
                {this.props.appName} has unexpectedly quit
              </div>

              <div className={styles.message}>
                The application "{this.props.appName}" quit unexpectedly.
              </div>

              {/* Error details (collapsible) */}
              {this.state.error && (
                <details className={styles.details}>
                  <summary className={styles.detailsSummary}>
                    Technical Details
                  </summary>
                  <div className={styles.errorDetails}>
                    <div className={styles.errorType}>
                      <strong>Error:</strong> {this.state.error.name}
                    </div>
                    <div className={styles.errorMessage}>
                      <strong>Message:</strong> {this.state.error.message}
                    </div>
                    {this.state.errorInfo && (
                      <div className={styles.errorStack}>
                        <strong>Component Stack:</strong>
                        <pre>{this.state.errorInfo.componentStack}</pre>
                      </div>
                    )}
                  </div>
                </details>
              )}

              {/* Actions */}
              <div className={styles.actions}>
                <Button
                  variant="primary"
                  onClick={this.handleReset}
                >
                  Relaunch
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    // Copy error to clipboard for reporting
                    const errorText = `App: ${this.props.appName}\nError: ${this.state.error?.name}\nMessage: ${this.state.error?.message}\nStack: ${this.state.error?.stack}`;
                    navigator.clipboard?.writeText(errorText);
                  }}
                >
                  Copy Error
                </Button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

