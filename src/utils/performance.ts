import { useEffect, useRef, useCallback } from 'react';

// Debounce utility for performance optimization
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
  immediate?: boolean
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null;
  
  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null;
      if (!immediate) func(...args);
    };
    
    const callNow = immediate && !timeout;
    
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    
    if (callNow) func(...args);
  };
}

// Throttle utility for performance optimization
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean;
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

// Hook for debounced values
export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = React.useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Connection pool for Firebase listeners
class FirebaseConnectionPool {
  private connections = new Map<string, {
    listeners: Set<() => void>;
    unsubscribe: () => void;
    lastUsed: number;
  }>();
  
  private cleanupInterval: NodeJS.Timeout;
  private readonly CLEANUP_INTERVAL = 60000; // 1 minute
  private readonly MAX_IDLE_TIME = 300000; // 5 minutes

  constructor() {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, this.CLEANUP_INTERVAL);
  }

  addListener(path: string, listener: () => void, createConnection: () => () => void): () => void {
    if (!this.connections.has(path)) {
      const unsubscribe = createConnection();
      this.connections.set(path, {
        listeners: new Set(),
        unsubscribe,
        lastUsed: Date.now()
      });
    }

    const connection = this.connections.get(path)!;
    connection.listeners.add(listener);
    connection.lastUsed = Date.now();

    // Return cleanup function
    return () => {
      const conn = this.connections.get(path);
      if (conn) {
        conn.listeners.delete(listener);
        if (conn.listeners.size === 0) {
          conn.unsubscribe();
          this.connections.delete(path);
        }
      }
    };
  }

  private cleanup() {
    const now = Date.now();
    for (const [path, connection] of this.connections.entries()) {
      if (connection.listeners.size === 0 && now - connection.lastUsed > this.MAX_IDLE_TIME) {
        connection.unsubscribe();
        this.connections.delete(path);
      }
    }
  }

  destroy() {
    clearInterval(this.cleanupInterval);
    for (const connection of this.connections.values()) {
      connection.unsubscribe();
    }
    this.connections.clear();
  }
}

export const firebaseConnectionPool = new FirebaseConnectionPool();

// Optimistic update utility
export class OptimisticUpdates {
  private pendingUpdates = new Map<string, {
    data: any;
    timestamp: number;
    timeout: NodeJS.Timeout;
  }>();

  private readonly TIMEOUT_DURATION = 5000; // 5 seconds

  addUpdate<T>(key: string, optimisticData: T, onTimeout?: () => void): void {
    // Clear existing timeout if any
    const existing = this.pendingUpdates.get(key);
    if (existing) {
      clearTimeout(existing.timeout);
    }

    // Set new optimistic update with timeout
    const timeout = setTimeout(() => {
      this.pendingUpdates.delete(key);
      onTimeout?.();
    }, this.TIMEOUT_DURATION);

    this.pendingUpdates.set(key, {
      data: optimisticData,
      timestamp: Date.now(),
      timeout
    });
  }

  confirmUpdate(key: string): void {
    const update = this.pendingUpdates.get(key);
    if (update) {
      clearTimeout(update.timeout);
      this.pendingUpdates.delete(key);
    }
  }

  getOptimisticData<T>(key: string): T | null {
    const update = this.pendingUpdates.get(key);
    return update ? update.data : null;
  }

  hasPendingUpdate(key: string): boolean {
    return this.pendingUpdates.has(key);
  }

  clear(): void {
    for (const update of this.pendingUpdates.values()) {
      clearTimeout(update.timeout);
    }
    this.pendingUpdates.clear();
  }
}

// Memory management for large datasets
export class DataCache<T> {
  private cache = new Map<string, {
    data: T;
    timestamp: number;
    accessCount: number;
  }>();

  private readonly MAX_SIZE = 100;
  private readonly MAX_AGE = 600000; // 10 minutes

  set(key: string, data: T): void {
    // Clean up if cache is too large
    if (this.cache.size >= this.MAX_SIZE) {
      this.evictOldest();
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      accessCount: 1
    });
  }

  get(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    // Check if item is too old
    if (Date.now() - item.timestamp > this.MAX_AGE) {
      this.cache.delete(key);
      return null;
    }

    // Update access count
    item.accessCount++;
    return item.data;
  }

  has(key: string): boolean {
    return this.cache.has(key) && this.get(key) !== null;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  private evictOldest(): void {
    let oldestKey = '';
    let oldestTime = Date.now();
    let lowestAccess = Infinity;

    for (const [key, item] of this.cache.entries()) {
      if (item.timestamp < oldestTime || item.accessCount < lowestAccess) {
        oldestKey = key;
        oldestTime = item.timestamp;
        lowestAccess = item.accessCount;
      }
    }

    if (oldestKey) {
      this.cache.delete(oldestKey);
    }
  }

  getStats() {
    return {
      size: this.cache.size,
      maxSize: this.MAX_SIZE,
      maxAge: this.MAX_AGE
    };
  }
}

// Performance monitoring
export class PerformanceMonitor {
  private metrics = new Map<string, number[]>();

  startTiming(label: string): () => void {
    const start = performance.now();
    
    return () => {
      const duration = performance.now() - start;
      this.recordMetric(label, duration);
    };
  }

  recordMetric(label: string, value: number): void {
    if (!this.metrics.has(label)) {
      this.metrics.set(label, []);
    }
    
    const values = this.metrics.get(label)!;
    values.push(value);
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift();
    }
  }

  getAverageTime(label: string): number {
    const values = this.metrics.get(label);
    if (!values || values.length === 0) return 0;
    
    return values.reduce((sum, val) => sum + val, 0) / values.length;
  }

  getMetrics(): Record<string, { average: number; count: number; latest: number }> {
    const result: Record<string, { average: number; count: number; latest: number }> = {};
    
    for (const [label, values] of this.metrics.entries()) {
      if (values.length > 0) {
        result[label] = {
          average: values.reduce((sum, val) => sum + val, 0) / values.length,
          count: values.length,
          latest: values[values.length - 1]
        };
      }
    }
    
    return result;
  }
}

export const performanceMonitor = new PerformanceMonitor();
