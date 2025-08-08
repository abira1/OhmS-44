import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { FirebaseService, ClassService } from '../services/firebase';
import { ClassSchedule } from '../types';

// Mock Firebase
vi.mock('firebase/database', () => ({
  ref: vi.fn(),
  push: vi.fn(),
  set: vi.fn(),
  get: vi.fn(),
  update: vi.fn(),
  remove: vi.fn(),
  onValue: vi.fn(),
  off: vi.fn()
}));

vi.mock('../config/firebase', () => ({
  database: {}
}));

describe('FirebaseService', () => {
  beforeEach(() => {
    // Clear cache before each test
    FirebaseService.clearCache();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Caching', () => {
    it('should cache data after first read', async () => {
      const mockData = { id: '1', name: 'Test' };
      const mockSnapshot = {
        exists: () => true,
        val: () => mockData
      };

      const mockGet = vi.fn().mockResolvedValue(mockSnapshot);
      vi.doMock('firebase/database', () => ({
        get: mockGet,
        ref: vi.fn()
      }));

      // First call should hit database
      await FirebaseService.getById('test', '1');
      expect(mockGet).toHaveBeenCalledTimes(1);

      // Second call should use cache
      await FirebaseService.getById('test', '1');
      expect(mockGet).toHaveBeenCalledTimes(1); // Still 1, not 2
    });

    it('should respect cache TTL', async () => {
      const mockData = { id: '1', name: 'Test' };
      
      // Set data in cache with very short TTL
      FirebaseService.setCachedData('test/1', mockData, 1); // 1ms TTL
      
      // Wait for TTL to expire
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const cached = FirebaseService.getCachedData('test/1');
      expect(cached).toBeNull();
    });

    it('should clear cache by pattern', () => {
      FirebaseService.setCachedData('classes/1', { id: '1' });
      FirebaseService.setCachedData('classes/2', { id: '2' });
      FirebaseService.setCachedData('students/1', { id: '1' });
      
      FirebaseService.clearCache('classes');
      
      expect(FirebaseService.getCachedData('classes/1')).toBeNull();
      expect(FirebaseService.getCachedData('classes/2')).toBeNull();
      expect(FirebaseService.getCachedData('students/1')).not.toBeNull();
    });
  });

  describe('Optimistic Updates', () => {
    it('should update cache immediately on create', async () => {
      const mockData = { name: 'Test Class' };
      const mockNewRef = { key: 'new-id' };
      
      const mockPush = vi.fn().mockReturnValue(mockNewRef);
      const mockSet = vi.fn().mockResolvedValue(undefined);
      
      vi.doMock('firebase/database', () => ({
        push: mockPush,
        set: mockSet,
        ref: vi.fn()
      }));

      await FirebaseService.create('classes', mockData);
      
      // Check if data was cached
      const cached = FirebaseService.getCachedData('classes/new-id');
      expect(cached).toEqual(expect.objectContaining({
        id: 'new-id',
        name: 'Test Class'
      }));
    });

    it('should revert cache on create failure', async () => {
      const mockData = { name: 'Test Class' };
      const mockNewRef = { key: 'new-id' };
      
      const mockPush = vi.fn().mockReturnValue(mockNewRef);
      const mockSet = vi.fn().mockRejectedValue(new Error('Network error'));
      
      vi.doMock('firebase/database', () => ({
        push: mockPush,
        set: mockSet,
        ref: vi.fn()
      }));

      await expect(FirebaseService.create('classes', mockData)).rejects.toThrow();
      
      // Cache should be cleared on error
      const cached = FirebaseService.getCachedData('classes/new-id');
      expect(cached).toBeNull();
    });
  });

  describe('Real-time Listeners', () => {
    it('should set up listener with throttling', () => {
      const mockCallback = vi.fn();
      const mockOnValue = vi.fn();
      
      vi.doMock('firebase/database', () => ({
        onValue: mockOnValue,
        off: vi.fn(),
        ref: vi.fn()
      }));

      FirebaseService.listenToPath('classes', mockCallback, undefined, {
        throttleMs: 100
      });

      expect(mockOnValue).toHaveBeenCalled();
    });

    it('should implement retry logic on listener errors', () => {
      const mockCallback = vi.fn();
      const mockErrorCallback = vi.fn();
      const mockOnValue = vi.fn();
      
      vi.doMock('firebase/database', () => ({
        onValue: mockOnValue,
        off: vi.fn(),
        ref: vi.fn()
      }));

      FirebaseService.listenToPath('classes', mockCallback, mockErrorCallback, {
        maxRetries: 3,
        retryDelayMs: 100
      });

      // Simulate error
      const errorHandler = mockOnValue.mock.calls[0][2];
      errorHandler(new Error('Connection lost'));

      // Should attempt retry
      expect(mockOnValue).toHaveBeenCalledTimes(1);
    });
  });

  describe('Conflict Resolution', () => {
    it('should detect version conflicts', async () => {
      const existingData = { id: '1', version: 2, name: 'Old Name' };
      const updateData = { version: 1, name: 'New Name' };
      
      const mockSnapshot = {
        exists: () => true,
        val: () => existingData
      };
      
      const mockGet = vi.fn().mockResolvedValue(mockSnapshot);
      
      vi.doMock('firebase/database', () => ({
        get: mockGet,
        ref: vi.fn(),
        update: vi.fn()
      }));

      const result = await FirebaseService.update('classes', '1', updateData, {
        checkVersion: true
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Version conflict');
    });

    it('should allow updates with higher version', async () => {
      const existingData = { id: '1', version: 1, name: 'Old Name' };
      const updateData = { version: 2, name: 'New Name' };
      
      const mockSnapshot = {
        exists: () => true,
        val: () => ({ ...existingData, ...updateData })
      };
      
      const mockGet = vi.fn().mockResolvedValue(mockSnapshot);
      const mockUpdate = vi.fn().mockResolvedValue(undefined);
      
      vi.doMock('firebase/database', () => ({
        get: mockGet,
        update: mockUpdate,
        ref: vi.fn()
      }));

      const result = await FirebaseService.update('classes', '1', updateData, {
        checkVersion: true
      });

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalled();
    });
  });
});

describe('ClassService', () => {
  beforeEach(() => {
    FirebaseService.clearCache();
  });

  describe('Enhanced Operations', () => {
    it('should add version control to new classes', async () => {
      const classData = {
        day: 'Monday',
        time: '09:00 - 10:30',
        subject: 'Physics',
        teacher: 'Dr. Smith',
        code: 'PHY101',
        room: 'Lab 1'
      };

      const mockCreate = vi.spyOn(FirebaseService, 'create').mockResolvedValue({
        success: true,
        data: { ...classData, id: '1', version: 1 } as ClassSchedule
      });

      await ClassService.createClass(classData);

      expect(mockCreate).toHaveBeenCalledWith('classes', expect.objectContaining({
        ...classData,
        version: 1,
        lastModified: expect.any(String)
      }));
    });

    it('should use caching for getAllClasses', async () => {
      const mockGetAll = vi.spyOn(FirebaseService, 'getAll').mockResolvedValue({
        success: true,
        data: []
      });

      await ClassService.getAllClasses();
      expect(mockGetAll).toHaveBeenCalledWith('classes', {
        useCache: true,
        orderBy: 'day'
      });
    });

    it('should filter classes by day', async () => {
      const mockClasses = [
        { id: '1', day: 'Monday', subject: 'Physics' },
        { id: '2', day: 'Tuesday', subject: 'Chemistry' },
        { id: '3', day: 'Monday', subject: 'Math' }
      ] as ClassSchedule[];

      vi.spyOn(ClassService, 'getAllClasses').mockResolvedValue({
        success: true,
        data: mockClasses
      });

      const result = await ClassService.getClassesByDay('Monday');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.every(cls => cls.day === 'Monday')).toBe(true);
    });

    it('should filter classes by subject', async () => {
      const mockClasses = [
        { id: '1', subject: 'Physics', day: 'Monday' },
        { id: '2', subject: 'Chemistry', day: 'Tuesday' },
        { id: '3', subject: 'Physics', day: 'Wednesday' }
      ] as ClassSchedule[];

      vi.spyOn(ClassService, 'getAllClasses').mockResolvedValue({
        success: true,
        data: mockClasses
      });

      const result = await ClassService.getClassesBySubject('Physics');
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(2);
      expect(result.data?.every(cls => cls.subject === 'Physics')).toBe(true);
    });
  });
});
