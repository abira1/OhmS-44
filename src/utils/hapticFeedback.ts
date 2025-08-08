import { Haptics, ImpactStyle } from '@capacitor/haptics';

export type HapticFeedbackType = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

/**
 * Enhanced haptic feedback utility with Capacitor integration
 * Provides tactile feedback for mobile interactions with fallbacks
 */
export class HapticFeedbackManager {
  private static instance: HapticFeedbackManager;
  private isCapacitorAvailable: boolean = false;
  private isWebVibrationAvailable: boolean = false;

  constructor() {
    this.checkAvailability();
  }

  static getInstance(): HapticFeedbackManager {
    if (!HapticFeedbackManager.instance) {
      HapticFeedbackManager.instance = new HapticFeedbackManager();
    }
    return HapticFeedbackManager.instance;
  }

  private async checkAvailability() {
    // Check if Capacitor Haptics is available
    try {
      await Haptics.impact({ style: ImpactStyle.Light });
      this.isCapacitorAvailable = true;
    } catch (error) {
      this.isCapacitorAvailable = false;
    }

    // Check if Web Vibration API is available
    this.isWebVibrationAvailable = 'vibrate' in navigator;
  }

  /**
   * Trigger haptic feedback with the specified type
   */
  async trigger(type: HapticFeedbackType): Promise<void> {
    try {
      if (this.isCapacitorAvailable) {
        await this.triggerCapacitorHaptic(type);
      } else if (this.isWebVibrationAvailable) {
        this.triggerWebVibration(type);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Trigger haptic feedback using Capacitor (native mobile)
   */
  private async triggerCapacitorHaptic(type: HapticFeedbackType): Promise<void> {
    switch (type) {
      case 'light':
        await Haptics.impact({ style: ImpactStyle.Light });
        break;
      case 'medium':
        await Haptics.impact({ style: ImpactStyle.Medium });
        break;
      case 'heavy':
        await Haptics.impact({ style: ImpactStyle.Heavy });
        break;
      case 'success':
        await Haptics.notification({ type: 'SUCCESS' });
        break;
      case 'warning':
        await Haptics.notification({ type: 'WARNING' });
        break;
      case 'error':
        await Haptics.notification({ type: 'ERROR' });
        break;
    }
  }

  /**
   * Trigger vibration using Web Vibration API (fallback)
   */
  private triggerWebVibration(type: HapticFeedbackType): void {
    const patterns: Record<HapticFeedbackType, number[]> = {
      light: [10],
      medium: [20],
      heavy: [30],
      success: [10, 50, 10],
      warning: [20, 100, 20],
      error: [50, 100, 50, 100, 50]
    };

    const pattern = patterns[type];
    if (pattern && navigator.vibrate) {
      navigator.vibrate(pattern);
    }
  }

  /**
   * Check if haptic feedback is available
   */
  isAvailable(): boolean {
    return this.isCapacitorAvailable || this.isWebVibrationAvailable;
  }

  /**
   * Get the type of haptic feedback available
   */
  getAvailableType(): 'capacitor' | 'web' | 'none' {
    if (this.isCapacitorAvailable) return 'capacitor';
    if (this.isWebVibrationAvailable) return 'web';
    return 'none';
  }

  /**
   * Disable haptic feedback (useful for accessibility)
   */
  disable(): void {
    this.isCapacitorAvailable = false;
    this.isWebVibrationAvailable = false;
  }

  /**
   * Re-enable haptic feedback
   */
  async enable(): Promise<void> {
    await this.checkAvailability();
  }
}

// Export singleton instance
export const hapticFeedback = HapticFeedbackManager.getInstance();

// Convenience functions for common use cases
export const triggerHaptic = (type: HapticFeedbackType) => hapticFeedback.trigger(type);

// Pull-to-refresh specific haptic patterns
export const pullToRefreshHaptics = {
  start: () => triggerHaptic('light'),
  threshold: () => triggerHaptic('medium'),
  release: () => triggerHaptic('heavy'),
  success: () => triggerHaptic('success'),
  error: () => triggerHaptic('error')
};
