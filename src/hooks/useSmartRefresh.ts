import { useCallback, useRef } from 'react';
import { useData } from '../context/DataContext';
import { useAuth } from '../context/AuthContext';

export type RefreshableSection = 'routine' | 'classmates' | 'attendance' | 'notice' | 'notes' | 'admin' | 'all';

export interface RefreshOptions {
  force?: boolean;
  showProgress?: boolean;
  timeout?: number;
}

export interface RefreshResult {
  success: boolean;
  section: RefreshableSection;
  timestamp: number;
  error?: string;
  itemsUpdated?: number;
}

/**
 * Smart refresh hook that handles different content types intelligently
 * Provides section-specific refresh logic with caching and error handling
 */
export const useSmartRefresh = () => {
  const { refreshData } = useData();
  const { user, refreshUserData } = useAuth();
  const lastRefreshTimes = useRef<Record<RefreshableSection, number>>({
    routine: 0,
    classmates: 0,
    attendance: 0,
    notice: 0,
    notes: 0,
    admin: 0,
    all: 0
  });

  // Minimum time between refreshes (in milliseconds)
  const REFRESH_COOLDOWN = 30000; // 30 seconds

  /**
   * Check if a section can be refreshed (respects cooldown)
   */
  const canRefresh = useCallback((section: RefreshableSection, force: boolean = false): boolean => {
    if (force) return true;
    
    const lastRefresh = lastRefreshTimes.current[section];
    const now = Date.now();
    return (now - lastRefresh) > REFRESH_COOLDOWN;
  }, []);

  /**
   * Refresh routine/class schedule data
   */
  const refreshRoutine = useCallback(async (options: RefreshOptions = {}): Promise<RefreshResult> => {
    const { force = false, timeout = 10000 } = options;
    
    if (!canRefresh('routine', force)) {
      return {
        success: false,
        section: 'routine',
        timestamp: Date.now(),
        error: 'Refresh cooldown active'
      };
    }

    try {
      const startTime = Date.now();
      
      // Create timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), timeout);
      });

      // Refresh routine data with timeout
      await Promise.race([
        refreshData?.('classes'),
        timeoutPromise
      ]);

      lastRefreshTimes.current.routine = Date.now();
      
      return {
        success: true,
        section: 'routine',
        timestamp: Date.now(),
        itemsUpdated: 1
      };
    } catch (error) {
      return {
        success: false,
        section: 'routine',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [canRefresh, refreshData]);

  /**
   * Refresh classmates data
   */
  const refreshClassmates = useCallback(async (options: RefreshOptions = {}): Promise<RefreshResult> => {
    const { force = false, timeout = 10000 } = options;
    
    if (!canRefresh('classmates', force)) {
      return {
        success: false,
        section: 'classmates',
        timestamp: Date.now(),
        error: 'Refresh cooldown active'
      };
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), timeout);
      });

      await Promise.race([
        refreshData?.('students'),
        timeoutPromise
      ]);

      lastRefreshTimes.current.classmates = Date.now();
      
      return {
        success: true,
        section: 'classmates',
        timestamp: Date.now(),
        itemsUpdated: 1
      };
    } catch (error) {
      return {
        success: false,
        section: 'classmates',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [canRefresh, refreshData]);

  /**
   * Refresh attendance data
   */
  const refreshAttendance = useCallback(async (options: RefreshOptions = {}): Promise<RefreshResult> => {
    const { force = false, timeout = 10000 } = options;
    
    if (!canRefresh('attendance', force)) {
      return {
        success: false,
        section: 'attendance',
        timestamp: Date.now(),
        error: 'Refresh cooldown active'
      };
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), timeout);
      });

      await Promise.race([
        refreshData?.('attendance'),
        timeoutPromise
      ]);

      lastRefreshTimes.current.attendance = Date.now();
      
      return {
        success: true,
        section: 'attendance',
        timestamp: Date.now(),
        itemsUpdated: 1
      };
    } catch (error) {
      return {
        success: false,
        section: 'attendance',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [canRefresh, refreshData]);

  /**
   * Refresh notices data
   */
  const refreshNotices = useCallback(async (options: RefreshOptions = {}): Promise<RefreshResult> => {
    const { force = false, timeout = 10000 } = options;
    
    if (!canRefresh('notice', force)) {
      return {
        success: false,
        section: 'notice',
        timestamp: Date.now(),
        error: 'Refresh cooldown active'
      };
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), timeout);
      });

      await Promise.race([
        refreshData?.('announcements'),
        timeoutPromise
      ]);

      lastRefreshTimes.current.notice = Date.now();
      
      return {
        success: true,
        section: 'notice',
        timestamp: Date.now(),
        itemsUpdated: 1
      };
    } catch (error) {
      return {
        success: false,
        section: 'notice',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [canRefresh, refreshData]);

  /**
   * Refresh notes data
   */
  const refreshNotes = useCallback(async (options: RefreshOptions = {}): Promise<RefreshResult> => {
    const { force = false, timeout = 10000 } = options;
    
    if (!canRefresh('notes', force)) {
      return {
        success: false,
        section: 'notes',
        timestamp: Date.now(),
        error: 'Refresh cooldown active'
      };
    }

    try {
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Refresh timeout')), timeout);
      });

      await Promise.race([
        refreshData?.('notes'),
        timeoutPromise
      ]);

      lastRefreshTimes.current.notes = Date.now();
      
      return {
        success: true,
        section: 'notes',
        timestamp: Date.now(),
        itemsUpdated: 1
      };
    } catch (error) {
      return {
        success: false,
        section: 'notes',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [canRefresh, refreshData]);

  /**
   * Refresh all data
   */
  const refreshAll = useCallback(async (options: RefreshOptions = {}): Promise<RefreshResult> => {
    const { force = false, timeout = 30000 } = options;
    
    if (!canRefresh('all', force)) {
      return {
        success: false,
        section: 'all',
        timestamp: Date.now(),
        error: 'Refresh cooldown active'
      };
    }

    try {
      const refreshPromises = [
        refreshRoutine({ force: true, timeout: timeout / 5 }),
        refreshClassmates({ force: true, timeout: timeout / 5 }),
        refreshAttendance({ force: true, timeout: timeout / 5 }),
        refreshNotices({ force: true, timeout: timeout / 5 }),
        refreshNotes({ force: true, timeout: timeout / 5 })
      ];

      const results = await Promise.allSettled(refreshPromises);
      const successCount = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
      
      lastRefreshTimes.current.all = Date.now();
      
      return {
        success: successCount > 0,
        section: 'all',
        timestamp: Date.now(),
        itemsUpdated: successCount,
        error: successCount === 0 ? 'All refresh operations failed' : undefined
      };
    } catch (error) {
      return {
        success: false,
        section: 'all',
        timestamp: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }, [canRefresh, refreshRoutine, refreshClassmates, refreshAttendance, refreshNotices, refreshNotes]);

  /**
   * Smart refresh based on current section
   */
  const refreshSection = useCallback(async (
    section: RefreshableSection, 
    options: RefreshOptions = {}
  ): Promise<RefreshResult> => {
    switch (section) {
      case 'routine':
        return refreshRoutine(options);
      case 'classmates':
        return refreshClassmates(options);
      case 'attendance':
        return refreshAttendance(options);
      case 'notice':
        return refreshNotices(options);
      case 'notes':
        return refreshNotes(options);
      case 'all':
        return refreshAll(options);
      default:
        return {
          success: false,
          section,
          timestamp: Date.now(),
          error: 'Unknown section'
        };
    }
  }, [refreshRoutine, refreshClassmates, refreshAttendance, refreshNotices, refreshNotes, refreshAll]);

  /**
   * Get last refresh time for a section
   */
  const getLastRefreshTime = useCallback((section: RefreshableSection): number => {
    return lastRefreshTimes.current[section];
  }, []);

  /**
   * Reset refresh cooldowns (useful for testing or force refresh)
   */
  const resetCooldowns = useCallback(() => {
    Object.keys(lastRefreshTimes.current).forEach(key => {
      lastRefreshTimes.current[key as RefreshableSection] = 0;
    });
  }, []);

  return {
    refreshSection,
    refreshRoutine,
    refreshClassmates,
    refreshAttendance,
    refreshNotices,
    refreshNotes,
    refreshAll,
    canRefresh,
    getLastRefreshTime,
    resetCooldowns
  };
};
