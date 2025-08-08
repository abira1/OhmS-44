// Console disabling utility for production security
// This script provides minimal console protection without interfering with React

class ConsoleDisabler {
  private isProduction: boolean;

  constructor() {
    this.isProduction = import.meta.env.PROD;

    // Only apply minimal security measures in production
    if (this.isProduction) {
      // Wait for React to fully initialize before applying security
      setTimeout(() => {
        this.applyMinimalSecurity();
      }, 3000);
    }
  }

  private applyMinimalSecurity(): void {
    if (typeof window === 'undefined') return;

    // Remove debugging utilities from window object
    this.removeDebugUtilities();

    // Apply minimal console protection (non-intrusive)
    this.protectConsole();
  }

  private removeDebugUtilities(): void {
    // Remove any global debugging utilities
    delete (window as any).timeTestUtils;
    delete (window as any).clearAllDataForTesting;
    delete (window as any).populateWithSampleData;
    delete (window as any).debugTimeLogic;
    delete (window as any).forceRealTime;
  }

  private protectConsole(): void {
    // Only replace console methods with silent versions, don't freeze
    const noOp = () => {};

    // Store originals for potential restoration
    const originalMethods = {
      log: console.log,
      info: console.info,
      warn: console.warn,
      debug: console.debug
    };

    // Replace with no-ops but keep error for critical issues
    console.log = noOp;
    console.info = noOp;
    console.warn = noOp;
    console.debug = noOp;
    // Keep console.error for critical errors that might help with debugging
  }

}

// Initialize console disabler in production (minimal approach)
let consoleDisabler: ConsoleDisabler | null = null;

if (import.meta.env.PROD) {
  consoleDisabler = new ConsoleDisabler();
}

export default consoleDisabler;
export { ConsoleDisabler };
