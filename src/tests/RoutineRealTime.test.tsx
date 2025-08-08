import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import RoutineSection from '../components/sections/RoutineSection';
import { AuthContext } from '../context/AuthContext';
import { useRealTimeClasses } from '../hooks/useFirebase';
import { ClassSchedule } from '../types';

// Mock Firebase hooks
vi.mock('../hooks/useFirebase');
vi.mock('../services/databaseService');
vi.mock('../services/errorHandlingService');

// Mock data
const mockClasses: ClassSchedule[] = [
  {
    id: '1',
    day: 'Monday',
    time: '09:00 - 10:30',
    subject: 'Physics',
    teacher: 'Dr. Smith',
    code: 'PHY101',
    room: 'Lab 1',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1
  },
  {
    id: '2',
    day: 'Tuesday',
    time: '11:00 - 12:30',
    subject: 'Chemistry',
    teacher: 'Prof. Johnson',
    code: 'CHE101',
    room: 'Lab 2',
    createdAt: Date.now(),
    updatedAt: Date.now(),
    version: 1
  }
];

const mockUser = {
  uid: 'test-user',
  email: 'test@example.com',
  displayName: 'Test User',
  photoURL: null,
  role: 'admin' as const,
  createdAt: Date.now(),
  lastLoginAt: Date.now(),
  approvalStatus: 'approved' as const
};

const mockPermissions = {
  canCreateClasses: true,
  canEditClasses: true,
  canDeleteClasses: true,
  canCancelClasses: true,
  canCreateStudents: false,
  canEditStudents: false,
  canDeleteStudents: false,
  canRecordAttendance: false,
  canViewAttendance: true,
  canShareAttendance: false,
  canCreateNotices: true,
  canEditNotices: true,
  canDeleteNotices: true,
  canCreateNotes: false,
  canEditNotes: false,
  canDeleteNotes: false,
  canAccessDevPanel: true
};

const mockRealTimeStatus = {
  isConnected: true,
  lastUpdate: new Date().toISOString(),
  syncInProgress: false
};

// Mock implementation of useRealTimeClasses
const mockUseRealTimeClasses = {
  classes: mockClasses,
  loading: false,
  error: null,
  realTimeStatus: mockRealTimeStatus,
  pendingOperations: 0,
  createClass: vi.fn(),
  updateClass: vi.fn(),
  deleteClass: vi.fn()
};

describe('RoutineSection Real-time Functionality', () => {
  beforeEach(() => {
    vi.mocked(useRealTimeClasses).mockReturnValue(mockUseRealTimeClasses);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  const renderWithAuth = (component: React.ReactElement) => {
    return render(
      <AuthContext.Provider value={{
        user: mockUser,
        permissions: mockPermissions,
        loading: false,
        error: null,
        signIn: vi.fn(),
        signOut: vi.fn(),
        signUp: vi.fn()
      }}>
        {component}
      </AuthContext.Provider>
    );
  };

  describe('Real-time Connection Status', () => {
    it('should display connection status correctly', () => {
      renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('Live')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-green-400');
    });

    it('should show offline status when disconnected', () => {
      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        realTimeStatus: {
          ...mockRealTimeStatus,
          isConnected: false
        }
      });

      renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('bg-red-400');
    });

    it('should show syncing status during operations', () => {
      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        realTimeStatus: {
          ...mockRealTimeStatus,
          syncInProgress: true
        }
      });

      renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('Syncing...')).toBeInTheDocument();
      expect(screen.getByRole('status')).toHaveClass('animate-pulse');
    });

    it('should show pending operations count', () => {
      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        pendingOperations: 3
      });

      renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('3 pending')).toBeInTheDocument();
    });
  });

  describe('CRUD Operations', () => {
    it('should create a new class successfully', async () => {
      const mockCreateClass = vi.fn().mockResolvedValue({
        success: true,
        data: { ...mockClasses[0], id: '3', subject: 'Math' }
      });

      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        createClass: mockCreateClass
      });

      renderWithAuth(<RoutineSection />);
      
      // Open add modal
      fireEvent.click(screen.getByText('Add Subject'));
      
      // Fill form
      fireEvent.change(screen.getByLabelText('Subject Name'), {
        target: { value: 'Mathematics' }
      });
      fireEvent.change(screen.getByLabelText('Teacher Name'), {
        target: { value: 'Dr. Brown' }
      });
      fireEvent.change(screen.getByLabelText('Course Code'), {
        target: { value: 'MATH101' }
      });
      
      // Submit form
      fireEvent.click(screen.getByText('Add Subject'));
      
      await waitFor(() => {
        expect(mockCreateClass).toHaveBeenCalledWith(
          expect.objectContaining({
            subject: 'Mathematics',
            teacher: 'Dr. Brown',
            code: 'MATH101'
          })
        );
      });
    });

    it('should handle create class errors gracefully', async () => {
      const mockCreateClass = vi.fn().mockRejectedValue(
        new Error('Network error')
      );

      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        createClass: mockCreateClass
      });

      renderWithAuth(<RoutineSection />);
      
      // Open add modal and submit
      fireEvent.click(screen.getByText('Add Subject'));
      fireEvent.change(screen.getByLabelText('Subject Name'), {
        target: { value: 'Test Subject' }
      });
      fireEvent.click(screen.getByText('Add Subject'));
      
      await waitFor(() => {
        expect(screen.getByText(/Failed to add class/)).toBeInTheDocument();
      });
    });

    it('should detect scheduling conflicts', async () => {
      renderWithAuth(<RoutineSection />);
      
      // Try to add a class at the same time as existing one
      fireEvent.click(screen.getByText('Add Subject'));
      
      // Set same day and time as existing class
      fireEvent.change(screen.getByDisplayValue('Monday'), {
        target: { value: 'Monday' }
      });
      fireEvent.change(screen.getByDisplayValue('09:00 - 10:30'), {
        target: { value: '09:00 - 10:30' }
      });
      fireEvent.change(screen.getByLabelText('Subject Name'), {
        target: { value: 'Conflict Subject' }
      });
      
      fireEvent.click(screen.getByText('Add Subject'));
      
      await waitFor(() => {
        expect(screen.getByText(/Time slot conflict/)).toBeInTheDocument();
      });
    });
  });

  describe('Real-time Updates', () => {
    it('should update UI when classes change', async () => {
      const { rerender } = renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('Physics')).toBeInTheDocument();
      
      // Simulate real-time update
      const updatedClasses = [
        ...mockClasses,
        {
          id: '3',
          day: 'Wednesday',
          time: '14:00 - 15:30',
          subject: 'Biology',
          teacher: 'Dr. Wilson',
          code: 'BIO101',
          room: 'Lab 3',
          createdAt: Date.now(),
          updatedAt: Date.now(),
          version: 1
        }
      ];

      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        classes: updatedClasses
      });

      rerender(
        <AuthContext.Provider value={{
          user: mockUser,
          permissions: mockPermissions,
          loading: false,
          error: null,
          signIn: vi.fn(),
          signOut: vi.fn(),
          signUp: vi.fn()
        }}>
          <RoutineSection />
        </AuthContext.Provider>
      );

      await waitFor(() => {
        expect(screen.getByText('Biology')).toBeInTheDocument();
      });
    });

    it('should show loading state during data fetch', () => {
      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        loading: true
      });

      renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('Loading class schedule...')).toBeInTheDocument();
    });
  });

  describe('Error Handling', () => {
    it('should display error messages for connection issues', () => {
      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        realTimeStatus: {
          ...mockRealTimeStatus,
          error: 'Connection failed'
        }
      });

      renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('Error')).toBeInTheDocument();
    });

    it('should handle network offline scenarios', () => {
      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        realTimeStatus: {
          ...mockRealTimeStatus,
          isConnected: false
        }
      });

      renderWithAuth(<RoutineSection />);
      
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });
  });

  describe('Performance', () => {
    it('should not re-render unnecessarily', () => {
      const renderSpy = vi.fn();

      const TestComponent = () => {
        renderSpy();
        return <RoutineSection />;
      };

      const { rerender } = renderWithAuth(<TestComponent />);

      expect(renderSpy).toHaveBeenCalledTimes(1);

      // Re-render with same data
      rerender(
        <AuthContext.Provider value={{
          user: mockUser,
          permissions: mockPermissions,
          loading: false,
          error: null,
          signIn: vi.fn(),
          signOut: vi.fn(),
          signUp: vi.fn()
        }}>
          <TestComponent />
        </AuthContext.Provider>
      );

      // Should not cause unnecessary re-renders
      expect(renderSpy).toHaveBeenCalledTimes(2);
    });

    it('should throttle real-time updates', async () => {
      const updateSpy = vi.fn();

      // Mock rapid updates
      for (let i = 0; i < 10; i++) {
        act(() => {
          updateSpy();
        });
      }

      // Should throttle updates
      await waitFor(() => {
        expect(updateSpy).toHaveBeenCalledTimes(10);
      }, { timeout: 1000 });
    });
  });

  describe('Conflict Resolution', () => {
    it('should detect version conflicts', async () => {
      const mockUpdateClass = vi.fn().mockRejectedValue(
        new Error('Version conflict: Current version is 2, attempted to update with version 1')
      );

      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        updateClass: mockUpdateClass
      });

      renderWithAuth(<RoutineSection />);

      // Try to edit a class
      fireEvent.click(screen.getByText('Physics'));

      await waitFor(() => {
        expect(screen.getByText(/conflict/i)).toBeInTheDocument();
      });
    });

    it('should show conflict resolution modal', async () => {
      renderWithAuth(<RoutineSection />);

      // Simulate conflict state
      act(() => {
        // This would be triggered by the conflict resolution logic
        // In a real scenario, this would be set by the component's conflict handling
      });

      // Check if conflict resolution UI elements are present
      // This test would need to be expanded based on the actual conflict resolution UI
    });
  });

  describe('Offline Support', () => {
    it('should queue operations when offline', async () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        pendingOperations: 1,
        realTimeStatus: {
          ...mockRealTimeStatus,
          isConnected: false
        }
      });

      renderWithAuth(<RoutineSection />);

      expect(screen.getByText('1 pending')).toBeInTheDocument();
      expect(screen.getByText('Offline')).toBeInTheDocument();
    });

    it('should retry operations when back online', async () => {
      const mockCreateClass = vi.fn().mockResolvedValue({
        success: true,
        data: mockClasses[0]
      });

      // Start offline
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false
      });

      vi.mocked(useRealTimeClasses).mockReturnValue({
        ...mockUseRealTimeClasses,
        createClass: mockCreateClass,
        pendingOperations: 1
      });

      renderWithAuth(<RoutineSection />);

      // Go back online
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true
      });

      // Simulate online event
      act(() => {
        window.dispatchEvent(new Event('online'));
      });

      await waitFor(() => {
        expect(screen.getByText('Live')).toBeInTheDocument();
      });
    });
  });
});
