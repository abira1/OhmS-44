// Comprehensive error handling service for the application
export interface ErrorContext {
  component?: string;
  operation?: string;
  userId?: string;
  timestamp: number;
  userAgent: string;
  url: string;
  additionalData?: Record<string, any>;
}

export interface ErrorReport {
  id: string;
  error: Error;
  context: ErrorContext;
  severity: 'low' | 'medium' | 'high' | 'critical';
  category: 'network' | 'database' | 'ui' | 'auth' | 'validation' | 'unknown';
  retryable: boolean;
}

export class ErrorHandlingService {
  private static instance: ErrorHandlingService;
  private errorQueue: ErrorReport[] = [];
  private maxQueueSize = 50;

  private constructor() {
    // Set up global error handlers
    this.setupGlobalErrorHandlers();
  }

  public static getInstance(): ErrorHandlingService {
    if (!ErrorHandlingService.instance) {
      ErrorHandlingService.instance = new ErrorHandlingService();
    }
    return ErrorHandlingService.instance;
  }

  private setupGlobalErrorHandlers(): void {
    // Handle unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        new Error(`Unhandled Promise Rejection: ${event.reason}`),
        {
          component: 'Global',
          operation: 'Promise Rejection',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        'high',
        'unknown'
      );
    });

    // Handle JavaScript errors
    window.addEventListener('error', (event) => {
      this.handleError(
        new Error(`${event.message} at ${event.filename}:${event.lineno}:${event.colno}`),
        {
          component: 'Global',
          operation: 'JavaScript Error',
          timestamp: Date.now(),
          userAgent: navigator.userAgent,
          url: window.location.href
        },
        'high',
        'ui'
      );
    });
  }

  public handleError(
    error: Error,
    context: Partial<ErrorContext>,
    severity: ErrorReport['severity'] = 'medium',
    category: ErrorReport['category'] = 'unknown'
  ): ErrorReport {
    const errorReport: ErrorReport = {
      id: this.generateErrorId(),
      error,
      context: {
        timestamp: Date.now(),
        userAgent: navigator.userAgent,
        url: window.location.href,
        ...context
      },
      severity,
      category,
      retryable: this.isRetryableError(error, category)
    };

    // Add to queue
    this.addToQueue(errorReport);

    // Log error based on severity
    this.logError(errorReport);

    // Send to external service in production
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(errorReport);
    }

    return errorReport;
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private isRetryableError(error: Error, category: ErrorReport['category']): boolean {
    const retryablePatterns = [
      /network/i,
      /timeout/i,
      /connection/i,
      /fetch/i,
      /offline/i,
      /unavailable/i
    ];

    const retryableCategories: ErrorReport['category'][] = ['network', 'database'];

    return (
      retryableCategories.includes(category) ||
      retryablePatterns.some(pattern => pattern.test(error.message))
    );
  }

  private addToQueue(errorReport: ErrorReport): void {
    this.errorQueue.push(errorReport);
    
    // Maintain queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }
  }

  private logError(errorReport: ErrorReport): void {
    const logMethod = this.getLogMethod(errorReport.severity);
    
    logMethod(`[${errorReport.severity.toUpperCase()}] ${errorReport.category}:`, {
      id: errorReport.id,
      error: errorReport.error.message,
      stack: errorReport.error.stack,
      context: errorReport.context,
      retryable: errorReport.retryable
    });
  }

  private getLogMethod(severity: ErrorReport['severity']): typeof console.log {
    switch (severity) {
      case 'critical':
      case 'high':
        return console.error;
      case 'medium':
        return console.warn;
      case 'low':
      default:
        return console.info;
    }
  }

  private async sendToExternalService(errorReport: ErrorReport): Promise<void> {
    try {
      // TODO: Integrate with error reporting service like Sentry, LogRocket, etc.
      // For now, we'll just store in localStorage for debugging
      const existingErrors = JSON.parse(localStorage.getItem('errorReports') || '[]');
      existingErrors.push({
        ...errorReport,
        error: {
          message: errorReport.error.message,
          stack: errorReport.error.stack,
          name: errorReport.error.name
        }
      });
      
      // Keep only last 20 errors
      if (existingErrors.length > 20) {
        existingErrors.splice(0, existingErrors.length - 20);
      }
      
      localStorage.setItem('errorReports', JSON.stringify(existingErrors));
    } catch (error) {
      console.error('Failed to send error report:', error);
    }
  }

  // Database-specific error handling
  public handleDatabaseError(error: Error, operation: string, data?: any): ErrorReport {
    let category: ErrorReport['category'] = 'database';
    let severity: ErrorReport['severity'] = 'medium';

    // Categorize database errors
    if (error.message.includes('permission') || error.message.includes('auth')) {
      category = 'auth';
      severity = 'high';
    } else if (error.message.includes('network') || error.message.includes('offline')) {
      category = 'network';
      severity = 'medium';
    } else if (error.message.includes('conflict') || error.message.includes('version')) {
      severity = 'low'; // Conflicts are expected in real-time apps
    }

    return this.handleError(error, {
      component: 'Database',
      operation,
      additionalData: data
    }, severity, category);
  }

  // Network-specific error handling
  public handleNetworkError(error: Error, url: string, method: string): ErrorReport {
    let severity: ErrorReport['severity'] = 'medium';

    // Determine severity based on error type
    if (!navigator.onLine) {
      severity = 'low'; // Offline is expected
    } else if (error.message.includes('timeout')) {
      severity = 'medium';
    } else {
      severity = 'high';
    }

    return this.handleError(error, {
      component: 'Network',
      operation: `${method} ${url}`,
      additionalData: {
        online: navigator.onLine,
        connectionType: (navigator as any).connection?.effectiveType
      }
    }, severity, 'network');
  }

  // Get error statistics
  public getErrorStats(): {
    total: number;
    bySeverity: Record<ErrorReport['severity'], number>;
    byCategory: Record<ErrorReport['category'], number>;
    retryable: number;
  } {
    const stats = {
      total: this.errorQueue.length,
      bySeverity: { low: 0, medium: 0, high: 0, critical: 0 },
      byCategory: { network: 0, database: 0, ui: 0, auth: 0, validation: 0, unknown: 0 },
      retryable: 0
    };

    this.errorQueue.forEach(error => {
      stats.bySeverity[error.severity]++;
      stats.byCategory[error.category]++;
      if (error.retryable) stats.retryable++;
    });

    return stats;
  }

  // Clear error queue
  public clearErrors(): void {
    this.errorQueue = [];
  }

  // Get recent errors
  public getRecentErrors(limit: number = 10): ErrorReport[] {
    return this.errorQueue.slice(-limit);
  }
}

// Export singleton instance
export const errorHandler = ErrorHandlingService.getInstance();

// Utility functions for common error scenarios
export const handleAsyncError = async <T>(
  operation: () => Promise<T>,
  context: Partial<ErrorContext>,
  retryCount: number = 0,
  maxRetries: number = 3
): Promise<T> => {
  try {
    return await operation();
  } catch (error) {
    const errorReport = errorHandler.handleError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );

    if (errorReport.retryable && retryCount < maxRetries) {
      // Exponential backoff
      const delay = Math.pow(2, retryCount) * 1000;
      await new Promise(resolve => setTimeout(resolve, delay));
      return handleAsyncError(operation, context, retryCount + 1, maxRetries);
    }

    throw error;
  }
};
