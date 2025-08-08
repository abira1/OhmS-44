// Development-only logger utility for OhmS-44
// This logger is completely disabled in production builds for security

interface LogLevel {
  DEBUG: 'debug';
  INFO: 'info';
  WARN: 'warn';
  ERROR: 'error';
}

const LOG_LEVELS: LogLevel = {
  DEBUG: 'debug',
  INFO: 'info',
  WARN: 'warn',
  ERROR: 'error'
};

class DevelopmentLogger {
  private isDevelopment: boolean;
  private isEnabled: boolean;

  constructor() {
    // Only enable in development mode - use safer environment detection
    this.isDevelopment = typeof import.meta !== 'undefined' && import.meta.env?.DEV === true;
    this.isEnabled = this.isDevelopment;
  }

  // Development-only logging methods
  debug(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    console.debug(`🔍 [DEBUG] ${message}`, ...args);
  }

  info(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    console.info(`ℹ️ [INFO] ${message}`, ...args);
  }

  warn(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    console.warn(`⚠️ [WARN] ${message}`, ...args);
  }

  error(message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    console.error(`❌ [ERROR] ${message}`, ...args);
  }

  // Specialized logging methods for different components
  firebase(operation: string, data?: any): void {
    if (!this.isEnabled) return;
    console.log(`🔥 [FIREBASE] ${operation}`, data || '');
  }

  auth(operation: string, data?: any): void {
    if (!this.isEnabled) return;
    console.log(`🔐 [AUTH] ${operation}`, data || '');
  }

  time(label: string, data?: any): void {
    if (!this.isEnabled) return;
    console.log(`🕐 [TIME] ${label}`, data || '');
  }

  notification(message: string, data?: any): void {
    if (!this.isEnabled) return;
    console.log(`🔔 [NOTIFICATION] ${message}`, data || '');
  }

  test(message: string, data?: any): void {
    if (!this.isEnabled) return;
    console.log(`🧪 [TEST] ${message}`, data || '');
  }

  // Group logging for complex operations
  group(label: string): void {
    if (!this.isEnabled) return;
    console.group(`📋 ${label}`);
  }

  groupEnd(): void {
    if (!this.isEnabled) return;
    console.groupEnd();
  }

  // Table logging for structured data
  table(data: any): void {
    if (!this.isEnabled) return;
    console.table(data);
  }

  // Performance timing
  startTimer(label: string): void {
    if (!this.isEnabled) return;
    console.time(label);
  }

  endTimer(label: string): void {
    if (!this.isEnabled) return;
    console.timeEnd(label);
  }

  // Conditional logging
  assert(condition: boolean, message: string, ...args: any[]): void {
    if (!this.isEnabled) return;
    console.assert(condition, message, ...args);
  }

  // Clear console (development only)
  clear(): void {
    if (!this.isEnabled) return;
    console.clear();
  }

  // Check if logging is enabled
  get enabled(): boolean {
    return this.isEnabled;
  }

  // Disable logging at runtime (for testing)
  disable(): void {
    this.isEnabled = false;
  }

  // Enable logging at runtime (for testing)
  enable(): void {
    if (this.isDevelopment) {
      this.isEnabled = true;
    }
  }
}

// Create singleton instance
const logger = new DevelopmentLogger();

// Export the logger instance
export default logger;

// Export individual methods for convenience
export const {
  debug,
  info,
  warn,
  error,
  firebase,
  auth,
  time,
  notification,
  test,
  group,
  groupEnd,
  table,
  clear,
  assert,
  startTimer,
  endTimer
} = logger;

// Export logger class for testing
export { DevelopmentLogger };

// Note: This entire module is tree-shaken in production by Terser configuration
// No additional runtime checks needed as the build process handles console removal
