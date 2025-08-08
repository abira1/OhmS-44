// Enhanced loading hook with section awareness
import { useState, useCallback } from 'react';
import { LoadingSection } from '../components/SectionLoader';

interface LoadingState {
  isLoading: boolean;
  section?: LoadingSection;
  message?: string;
  progress?: number;
}

export function useLoading(initialSection?: LoadingSection) {
  const [loadingState, setLoadingState] = useState<LoadingState>({
    isLoading: false,
    section: initialSection,
    message: undefined,
    progress: 0
  });

  const startLoading = useCallback((section?: LoadingSection, message?: string) => {
    setLoadingState({
      isLoading: true,
      section: section || initialSection || 'app',
      message,
      progress: 0
    });
  }, [initialSection]);

  const updateProgress = useCallback((progress: number, message?: string) => {
    setLoadingState(prev => ({
      ...prev,
      progress,
      message: message || prev.message
    }));
  }, []);

  const updateMessage = useCallback((message: string) => {
    setLoadingState(prev => ({
      ...prev,
      message
    }));
  }, []);

  const stopLoading = useCallback(() => {
    setLoadingState(prev => ({
      ...prev,
      isLoading: false,
      progress: 100
    }));
  }, []);

  return {
    ...loadingState,
    startLoading,
    updateProgress,
    updateMessage,
    stopLoading
  };
}

// Predefined loading messages for different sections
export const loadingMessages = {
  routine: {
    connecting: 'Connecting to Firebase...',
    fetching: 'Loading class schedules...',
    processing: 'Organizing timetable...',
    complete: 'Routine loaded successfully!'
  },
  classmates: {
    connecting: 'Connecting to database...',
    fetching: 'Loading student profiles...',
    processing: 'Building directory...',
    complete: 'Classmates loaded successfully!'
  },
  attendance: {
    connecting: 'Establishing connection...',
    fetching: 'Loading attendance records...',
    processing: 'Calculating statistics...',
    complete: 'Attendance data ready!'
  },
  notices: {
    connecting: 'Connecting to server...',
    fetching: 'Loading announcements...',
    processing: 'Sorting by priority...',
    complete: 'Notices loaded successfully!'
  },
  firebase: {
    connecting: 'Initializing Firebase...',
    fetching: 'Authenticating connection...',
    processing: 'Setting up real-time sync...',
    complete: 'Firebase ready!'
  }
};

// Helper function to get section-specific loading message
export function getSectionMessage(section: LoadingSection, step: 'connecting' | 'fetching' | 'processing' | 'complete'): string {
  return loadingMessages[section]?.[step] || `${step.charAt(0).toUpperCase() + step.slice(1)}...`;
}
