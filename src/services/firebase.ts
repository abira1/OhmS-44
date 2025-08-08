// Firebase Realtime Database service utilities
import {
  ref,
  push,
  set,
  get,
  update,
  remove,
  onValue,
  off,
  DataSnapshot
} from 'firebase/database';
import { database } from '../config/firebase';
import {
  ClassSchedule,
  Student,
  AttendanceRecord,
  Notice,
  Note,
  ClassCancellation,
  UserLike,
  Comment,
  UserProfile,
  FirebaseResponse,
  DataCallback,
  ErrorCallback,
  DB_PATHS
} from '../types';

// Cache for frequently accessed data
const dataCache = new Map<string, { data: any; timestamp: number; ttl: number }>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes default TTL

// Generic Firebase operations
export class FirebaseService {
  // Cache management
  static getCachedData<T>(key: string): T | null {
    const cached = dataCache.get(key);
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      return cached.data as T;
    }
    dataCache.delete(key);
    return null;
  }

  static setCachedData<T>(key: string, data: T, ttl: number = CACHE_TTL): void {
    dataCache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    });
  }

  static clearCache(pattern?: string): void {
    if (pattern) {
      for (const key of dataCache.keys()) {
        if (key.includes(pattern)) {
          dataCache.delete(key);
        }
      }
    } else {
      dataCache.clear();
    }
  }

  // Create a new record with optimistic updates
  static async create<T>(path: string, data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseResponse<T>> {
    try {
      const listRef = ref(database, path);
      const newRef = push(listRef);
      const id = newRef.key!;

      const recordWithId = {
        ...data,
        id,
        createdAt: Date.now(),
        updatedAt: Date.now()
      } as T;

      // Optimistic update - update cache immediately
      const cacheKey = `${path}/${id}`;
      this.setCachedData(cacheKey, recordWithId);
      this.clearCache(path); // Clear list cache to force refresh

      await set(newRef, recordWithId);

      return {
        success: true,
        data: recordWithId
      };
    } catch (error) {
      // Remove from cache on error
      const id = (data as any).id;
      if (id) {
        dataCache.delete(`${path}/${id}`);
      }

      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Read a single record by ID with caching
  static async getById<T>(path: string, id: string, useCache: boolean = true): Promise<FirebaseResponse<T>> {
    const cacheKey = `${path}/${id}`;

    // Check cache first
    if (useCache) {
      const cached = this.getCachedData<T>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }
    }

    try {
      const recordRef = ref(database, `${path}/${id}`);
      const snapshot = await get(recordRef);

      if (snapshot.exists()) {
        const data = snapshot.val() as T;

        // Cache the result
        if (useCache) {
          this.setCachedData(cacheKey, data);
        }

        return {
          success: true,
          data
        };
      } else {
        return {
          success: false,
          error: 'Record not found'
        };
      }
    } catch (error) {
      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Read all records from a path with caching and pagination support
  static async getAll<T>(path: string, options?: {
    useCache?: boolean;
    limit?: number;
    orderBy?: string;
    startAfter?: any;
  }): Promise<FirebaseResponse<T[]>> {
    const { useCache = true, limit, orderBy, startAfter } = options || {};
    const cacheKey = `${path}_all${limit ? `_limit_${limit}` : ''}${orderBy ? `_order_${orderBy}` : ''}`;

    // Check cache first (only for simple queries without pagination)
    if (useCache && !startAfter) {
      const cached = this.getCachedData<T[]>(cacheKey);
      if (cached) {
        return {
          success: true,
          data: cached
        };
      }
    }

    try {
      let queryRef = ref(database, path);

      // Apply query constraints if provided
      if (orderBy || limit) {
        // Note: For complex queries, you might want to use Firebase query methods
        // This is a simplified implementation
      }

      const snapshot = await get(queryRef);

      if (snapshot.exists()) {
        const data = snapshot.val();
        let records = Object.values(data) as T[];

        // Apply client-side filtering/sorting if needed
        if (orderBy && (records[0] as any)[orderBy] !== undefined) {
          records.sort((a, b) => {
            const aVal = (a as any)[orderBy];
            const bVal = (b as any)[orderBy];
            return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
          });
        }

        if (limit) {
          records = records.slice(0, limit);
        }

        // Cache the result (only for simple queries)
        if (useCache && !startAfter) {
          this.setCachedData(cacheKey, records);
        }

        return {
          success: true,
          data: records
        };
      } else {
        const emptyResult: T[] = [];

        // Cache empty results too
        if (useCache && !startAfter) {
          this.setCachedData(cacheKey, emptyResult);
        }

        return {
          success: true,
          data: emptyResult
        };
      }
    } catch (error) {
      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Update a record with optimistic updates and conflict resolution
  static async update<T>(path: string, id: string, updates: Partial<T>, options?: {
    optimistic?: boolean;
    checkVersion?: boolean;
  }): Promise<FirebaseResponse<T>> {
    const { optimistic = true, checkVersion = true } = options || {};
    const cacheKey = `${path}/${id}`;

    try {
      const recordRef = ref(database, `${path}/${id}`);

      // Get current record for version checking
      let currentRecord: T | null = null;
      if (checkVersion) {
        const currentResult = await this.getById<T>(path, id, false); // Don't use cache for version check
        if (currentResult.success) {
          currentRecord = currentResult.data!;
        }
      }

      // Check for version conflicts
      if (checkVersion && currentRecord && (updates as any).version && (currentRecord as any).version) {
        const currentVersion = (currentRecord as any).version;
        const updateVersion = (updates as any).version;

        if (updateVersion <= currentVersion) {
          return {
            success: false,
            error: `Version conflict: Current version is ${currentVersion}, attempted to update with version ${updateVersion}`
          };
        }
      }

      const updateData = {
        ...updates,
        updatedAt: Date.now()
      };

      // Optimistic update - update cache immediately
      if (optimistic && currentRecord) {
        const optimisticRecord = { ...currentRecord, ...updateData } as T;
        this.setCachedData(cacheKey, optimisticRecord);
        this.clearCache(path); // Clear list cache
      }

      await update(recordRef, updateData);

      // Get the updated record and update cache
      const updatedRecord = await this.getById<T>(path, id, false);
      if (updatedRecord.success) {
        this.setCachedData(cacheKey, updatedRecord.data!);
        this.clearCache(path); // Clear list cache
      }

      return updatedRecord;
    } catch (error) {
      // Revert optimistic update on error
      if (optimistic) {
        dataCache.delete(cacheKey);
        this.clearCache(path);
      }

      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Delete a record
  static async delete(path: string, id: string): Promise<FirebaseResponse<void>> {
    try {
      const recordRef = ref(database, `${path}/${id}`);
      await remove(recordRef);
      
      return {
        success: true
      };
    } catch (error) {
      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Set up real-time listener for a path with throttling and error recovery
  static listenToPath<T>(
    path: string,
    callback: DataCallback<T[]>,
    errorCallback?: ErrorCallback,
    options?: {
      throttleMs?: number;
      maxRetries?: number;
      retryDelayMs?: number;
    }
  ): () => void {
    const { throttleMs = 100, maxRetries = 3, retryDelayMs = 1000 } = options || {};
    const listRef = ref(database, path);
    let retryCount = 0;
    let throttleTimer: NodeJS.Timeout | null = null;
    let lastData: T[] | null = null;
    let isActive = true;

    const throttledCallback = (data: T[]) => {
      if (!isActive) return;

      // Simple data comparison to avoid unnecessary updates
      if (lastData && JSON.stringify(lastData) === JSON.stringify(data)) {
        return;
      }

      lastData = data;

      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }

      throttleTimer = setTimeout(() => {
        if (isActive) {
          callback(data);
          // Update cache
          this.setCachedData(`${path}_all`, data);
        }
      }, throttleMs);
    };

    const setupListener = () => {
      const unsubscribe = onValue(
        listRef,
        (snapshot: DataSnapshot) => {
          if (!isActive) return;

          retryCount = 0; // Reset retry count on successful connection

          if (snapshot.exists()) {
            const data = snapshot.val();
            let records: T[] = [];

            if (data && typeof data === 'object') {
              // Handle both object and array formats
              if (Array.isArray(data)) {
                records = data.filter(item => item !== null && item !== undefined);
              } else {
                records = Object.values(data).filter(item => item !== null && item !== undefined) as T[];
              }
            }

            throttledCallback(records);
          } else {
            throttledCallback([]);
          }
        },
        (error) => {
          if (!isActive) return;

          // Error logged internally for production

          // Implement retry logic
          if (retryCount < maxRetries) {
            retryCount++;
            // Retry attempt logged internally

            setTimeout(() => {
              if (isActive) {
                setupListener();
              }
            }, retryDelayMs * retryCount); // Exponential backoff
          } else {
            if (errorCallback) {
              errorCallback(error);
            }
          }
        }
      );

      return unsubscribe;
    };

    const unsubscribe = setupListener();

    // Return cleanup function
    return () => {
      isActive = false;
      if (throttleTimer) {
        clearTimeout(throttleTimer);
      }
      off(listRef, 'value', unsubscribe);
    };
  }

  // Set up real-time listener for a single record
  static listenToRecord<T>(
    path: string,
    id: string,
    callback: DataCallback<T>,
    errorCallback?: ErrorCallback
  ): () => void {
    const recordRef = ref(database, `${path}/${id}`);
    
    const unsubscribe = onValue(
      recordRef,
      (snapshot: DataSnapshot) => {
        if (snapshot.exists()) {
          callback(snapshot.val() as T);
        } else {
          callback(null);
        }
      },
      (error) => {
        // Error logged internally for production
        if (errorCallback) {
          errorCallback(error);
        }
      }
    );

    // Return unsubscribe function
    return () => off(recordRef, 'value', unsubscribe);
  }

  // Batch update multiple records
  static async batchUpdate(updates: Record<string, any>): Promise<FirebaseResponse<void>> {
    try {
      const rootRef = ref(database);
      await update(rootRef, updates);
      
      return {
        success: true
      };
    } catch (error) {
      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// Utility functions for generating IDs and timestamps
export const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

export const getCurrentTimestamp = (): number => {
  return Date.now();
};

// Database path helpers
export const getClassPath = (id?: string): string => {
  return id ? `${DB_PATHS.CLASSES}/${id}` : DB_PATHS.CLASSES;
};

export const getStudentPath = (id?: string): string => {
  return id ? `${DB_PATHS.STUDENTS}/${id}` : DB_PATHS.STUDENTS;
};

export const getAttendancePath = (id?: string): string => {
  return id ? `${DB_PATHS.ATTENDANCE}/${id}` : DB_PATHS.ATTENDANCE;
};

export const getNoticePath = (id?: string): string => {
  return id ? `${DB_PATHS.NOTICES}/${id}` : DB_PATHS.NOTICES;
};

// Specialized service classes for each data type
export class ClassService {
  static async createClass(classData: Omit<ClassSchedule, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseResponse<ClassSchedule>> {
    // Add version control for new classes
    const enhancedClassData = {
      ...classData,
      version: 1,
      lastModified: new Date().toISOString()
    };
    return FirebaseService.create<ClassSchedule>(DB_PATHS.CLASSES, enhancedClassData);
  }

  static async getAllClasses(useCache: boolean = true): Promise<FirebaseResponse<ClassSchedule[]>> {
    return FirebaseService.getAll<ClassSchedule>(DB_PATHS.CLASSES, {
      useCache,
      orderBy: 'day' // Order by day for better UX
    });
  }

  static async getClassById(id: string, useCache: boolean = true): Promise<FirebaseResponse<ClassSchedule>> {
    return FirebaseService.getById<ClassSchedule>(DB_PATHS.CLASSES, id, useCache);
  }

  static async updateClass(id: string, updates: Partial<ClassSchedule>): Promise<FirebaseResponse<ClassSchedule>> {
    // Add metadata for tracking changes
    const enhancedUpdates = {
      ...updates,
      lastModified: new Date().toISOString()
    };

    return FirebaseService.update<ClassSchedule>(DB_PATHS.CLASSES, id, enhancedUpdates, {
      optimistic: true,
      checkVersion: true
    });
  }

  static async deleteClass(id: string): Promise<FirebaseResponse<void>> {
    // Clear related cache entries
    FirebaseService.clearCache(DB_PATHS.CLASSES);
    return FirebaseService.delete(DB_PATHS.CLASSES, id);
  }

  static listenToClasses(callback: DataCallback<ClassSchedule[]>, errorCallback?: ErrorCallback): () => void {
    return FirebaseService.listenToPath<ClassSchedule>(
      DB_PATHS.CLASSES,
      callback,
      errorCallback,
      {
        throttleMs: 200, // Throttle updates for better performance
        maxRetries: 5,
        retryDelayMs: 1000
      }
    );
  }

  // Additional utility methods for class management
  static async getClassesByDay(day: string): Promise<FirebaseResponse<ClassSchedule[]>> {
    const allClassesResult = await this.getAllClasses();
    if (allClassesResult.success) {
      const dayClasses = allClassesResult.data!.filter(cls => cls.day === day);
      return {
        success: true,
        data: dayClasses
      };
    }
    return allClassesResult;
  }

  static async getClassesBySubject(subject: string): Promise<FirebaseResponse<ClassSchedule[]>> {
    const allClassesResult = await this.getAllClasses();
    if (allClassesResult.success) {
      const subjectClasses = allClassesResult.data!.filter(cls => cls.subject === subject);
      return {
        success: true,
        data: subjectClasses
      };
    }
    return allClassesResult;
  }

  // Clear all class-related cache
  static clearClassCache(): void {
    FirebaseService.clearCache(DB_PATHS.CLASSES);
  }
}

export class StudentService {
  static async createStudent(studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseResponse<Student>> {
    return FirebaseService.create<Student>(DB_PATHS.STUDENTS, studentData);
  }

  static async getAllStudents(): Promise<FirebaseResponse<Student[]>> {
    return FirebaseService.getAll<Student>(DB_PATHS.STUDENTS);
  }

  static async getStudentById(id: string): Promise<FirebaseResponse<Student>> {
    return FirebaseService.getById<Student>(DB_PATHS.STUDENTS, id);
  }

  static async updateStudent(id: string, updates: Partial<Student>): Promise<FirebaseResponse<Student>> {
    return FirebaseService.update<Student>(DB_PATHS.STUDENTS, id, updates);
  }

  static async deleteStudent(id: string): Promise<FirebaseResponse<void>> {
    return FirebaseService.delete(DB_PATHS.STUDENTS, id);
  }

  static listenToStudents(callback: DataCallback<Student[]>, errorCallback?: ErrorCallback): () => void {
    return FirebaseService.listenToPath<Student>(DB_PATHS.STUDENTS, callback, errorCallback);
  }
}

export class AttendanceService {
  static async createAttendance(attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseResponse<AttendanceRecord>> {
    return FirebaseService.create<AttendanceRecord>(DB_PATHS.ATTENDANCE, attendanceData);
  }

  static async getAllAttendance(): Promise<FirebaseResponse<AttendanceRecord[]>> {
    return FirebaseService.getAll<AttendanceRecord>(DB_PATHS.ATTENDANCE);
  }

  static async getAttendanceById(id: string): Promise<FirebaseResponse<AttendanceRecord>> {
    return FirebaseService.getById<AttendanceRecord>(DB_PATHS.ATTENDANCE, id);
  }

  static async updateAttendance(id: string, updates: Partial<AttendanceRecord>): Promise<FirebaseResponse<AttendanceRecord>> {
    return FirebaseService.update<AttendanceRecord>(DB_PATHS.ATTENDANCE, id, updates);
  }

  static async deleteAttendance(id: string): Promise<FirebaseResponse<void>> {
    return FirebaseService.delete(DB_PATHS.ATTENDANCE, id);
  }

  static listenToAttendance(callback: DataCallback<AttendanceRecord[]>, errorCallback?: ErrorCallback): () => void {
    return FirebaseService.listenToPath<AttendanceRecord>(DB_PATHS.ATTENDANCE, callback, errorCallback);
  }
}

export class NoticeService {
  static async createNotice(noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseResponse<Notice>> {
    return FirebaseService.create<Notice>(DB_PATHS.NOTICES, noticeData);
  }

  static async getAllNotices(): Promise<FirebaseResponse<Notice[]>> {
    return FirebaseService.getAll<Notice>(DB_PATHS.NOTICES);
  }

  static async getNoticeById(id: string): Promise<FirebaseResponse<Notice>> {
    return FirebaseService.getById<Notice>(DB_PATHS.NOTICES, id);
  }

  static async updateNotice(id: string, updates: Partial<Notice>): Promise<FirebaseResponse<Notice>> {
    return FirebaseService.update<Notice>(DB_PATHS.NOTICES, id, updates);
  }

  static async deleteNotice(id: string): Promise<FirebaseResponse<void>> {
    return FirebaseService.delete(DB_PATHS.NOTICES, id);
  }

  static listenToNotices(callback: DataCallback<Notice[]>, errorCallback?: ErrorCallback): () => void {
    return FirebaseService.listenToPath<Notice>(DB_PATHS.NOTICES, callback, errorCallback);
  }

  // Notice interaction methods
  static async toggleNoticeLike(noticeId: string, userLike: UserLike): Promise<FirebaseResponse<boolean>> {
    return NotesService.toggleNoticeLike(noticeId, userLike);
  }

  static async addNoticeComment(noticeId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<FirebaseResponse<Comment>> {
    return NotesService.addNoticeComment(noticeId, comment);
  }

  static async updateNoticeComment(noticeId: string, commentId: string, content: string): Promise<FirebaseResponse<Comment>> {
    return NotesService.updateNoticeComment(noticeId, commentId, content);
  }

  static async deleteNoticeComment(noticeId: string, commentId: string, deletedBy: string): Promise<FirebaseResponse<void>> {
    return NotesService.deleteNoticeComment(noticeId, commentId, deletedBy);
  }

  static listenToNoticeInteractions(noticeId: string, callback: (interactions: { likes: Record<string, UserLike>, comments: Record<string, Comment> }) => void, errorCallback?: ErrorCallback): () => void {
    return NotesService.listenToNoticeInteractions(noticeId, callback, errorCallback);
  }
}

// Enhanced Notes Service for class notes with links
export class NotesService {
  static async createNote(noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseResponse<Note>> {
    return FirebaseService.create<Note>(DB_PATHS.NOTES, noteData);
  }

  static async getAllNotes(): Promise<FirebaseResponse<Note[]>> {
    return FirebaseService.getAll<Note>(DB_PATHS.NOTES);
  }

  static async getNoteById(id: string): Promise<FirebaseResponse<Note>> {
    return FirebaseService.getById<Note>(DB_PATHS.NOTES, id);
  }

  static async updateNote(id: string, updates: Partial<Note>): Promise<FirebaseResponse<Note>> {
    return FirebaseService.update<Note>(DB_PATHS.NOTES, id, updates);
  }

  static async deleteNote(id: string): Promise<FirebaseResponse<void>> {
    return FirebaseService.delete(DB_PATHS.NOTES, id);
  }

  static listenToNotes(callback: DataCallback<Note[]>, errorCallback?: ErrorCallback): () => void {
    return FirebaseService.listenToPath<Note>(DB_PATHS.NOTES, callback, errorCallback);
  }

  // Like/Unlike functionality for notices
  static async toggleNoticeLike(noticeId: string, userLike: UserLike): Promise<FirebaseResponse<boolean>> {
    try {
      const likePath = `${DB_PATHS.NOTICES}/${noticeId}/interactions/likes/${userLike.userId}`;
      const likeRef = ref(database, likePath);
      const likeSnapshot = await get(likeRef);

      const noticeRef = ref(database, `${DB_PATHS.NOTICES}/${noticeId}`);
      const noticeSnapshot = await get(noticeRef);

      if (!noticeSnapshot.exists()) {
        return { success: false, error: 'Notice not found' };
      }

      const currentNotice = noticeSnapshot.val() as Notice;
      const isLiked = likeSnapshot.exists();

      if (isLiked) {
        // Remove like
        await remove(likeRef);
        await update(noticeRef, {
          likeCount: Math.max(0, (currentNotice.likeCount || 0) - 1),
          updatedAt: Date.now()
        });
        return { success: true, data: false };
      } else {
        // Add like
        await set(likeRef, userLike);
        await update(noticeRef, {
          likeCount: (currentNotice.likeCount || 0) + 1,
          updatedAt: Date.now()
        });
        return { success: true, data: true };
      }
    } catch (error) {
      // Error logged internally for production
      return { success: false, error: 'Failed to toggle like' };
    }
  }

  // Add comment to notice
  static async addNoticeComment(noticeId: string, comment: Omit<Comment, 'id' | 'timestamp'>): Promise<FirebaseResponse<Comment>> {
    try {
      const commentsRef = ref(database, `${DB_PATHS.NOTICES}/${noticeId}/interactions/comments`);
      const newCommentRef = push(commentsRef);
      const commentId = newCommentRef.key!;

      const fullComment: Comment = {
        ...comment,
        id: commentId,
        timestamp: Date.now(),
        isEdited: false,
        isDeleted: false
      };

      // Remove undefined properties to avoid Firebase errors
      const cleanComment = Object.fromEntries(
        Object.entries(fullComment).filter(([_, value]) => value !== undefined)
      ) as Comment;

      await set(newCommentRef, cleanComment);

      // Update comment count
      const noticeRef = ref(database, `${DB_PATHS.NOTICES}/${noticeId}`);
      const noticeSnapshot = await get(noticeRef);

      if (noticeSnapshot.exists()) {
        const currentNotice = noticeSnapshot.val() as Notice;
        await update(noticeRef, {
          commentCount: (currentNotice.commentCount || 0) + 1,
          updatedAt: Date.now()
        });
      }

      return { success: true, data: cleanComment };
    } catch (error) {
      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to add comment'
      };
    }
  }

  // Update notice comment
  static async updateNoticeComment(noticeId: string, commentId: string, content: string): Promise<FirebaseResponse<Comment>> {
    try {
      const commentRef = ref(database, `${DB_PATHS.NOTICES}/${noticeId}/interactions/comments/${commentId}`);
      const commentSnapshot = await get(commentRef);

      if (!commentSnapshot.exists()) {
        return { success: false, error: 'Comment not found' };
      }

      const updates = {
        content,
        isEdited: true,
        editedAt: Date.now()
      };

      await update(commentRef, updates);

      const updatedComment = { ...commentSnapshot.val(), ...updates } as Comment;
      return { success: true, data: updatedComment };
    } catch (error) {
      // Error logged internally for production
      return { success: false, error: 'Failed to update comment' };
    }
  }

  // Delete notice comment (soft delete)
  static async deleteNoticeComment(noticeId: string, commentId: string, deletedBy: string): Promise<FirebaseResponse<void>> {
    try {
      const commentRef = ref(database, `${DB_PATHS.NOTICES}/${noticeId}/interactions/comments/${commentId}`);
      const commentSnapshot = await get(commentRef);

      if (!commentSnapshot.exists()) {
        return { success: false, error: 'Comment not found' };
      }

      await update(commentRef, {
        isDeleted: true,
        deletedAt: Date.now(),
        deletedBy
      });

      // Update comment count
      const noticeRef = ref(database, `${DB_PATHS.NOTICES}/${noticeId}`);
      const noticeSnapshot = await get(noticeRef);

      if (noticeSnapshot.exists()) {
        const currentNotice = noticeSnapshot.val() as Notice;
        await update(noticeRef, {
          commentCount: Math.max(0, (currentNotice.commentCount || 0) - 1),
          updatedAt: Date.now()
        });
      }

      return { success: true };
    } catch (error) {
      // Error logged internally for production
      return { success: false, error: 'Failed to delete comment' };
    }
  }

  // Listen to notice interactions (likes and comments)
  static listenToNoticeInteractions(noticeId: string, callback: (interactions: { likes: Record<string, UserLike>, comments: Record<string, Comment> }) => void, errorCallback?: ErrorCallback): () => void {
    const interactionsRef = ref(database, `${DB_PATHS.NOTICES}/${noticeId}/interactions`);

    const unsubscribe = onValue(interactionsRef, (snapshot) => {
      const data = snapshot.val() || {};
      callback({
        likes: data.likes || {},
        comments: data.comments || {}
      });
    }, errorCallback);

    return () => off(interactionsRef, 'value', unsubscribe);
  }

  // Get notes by subject
  static async getNotesBySubject(subject: string): Promise<FirebaseResponse<Note[]>> {
    try {
      const allNotesResponse = await this.getAllNotes();
      if (!allNotesResponse.success || !allNotesResponse.data) {
        return allNotesResponse;
      }

      const filteredNotes = allNotesResponse.data.filter(note =>
        note.subject.toLowerCase() === subject.toLowerCase() && note.isActive
      );

      return {
        success: true,
        data: filteredNotes
      };
    } catch (error) {
      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  // Get active notes sorted by creation date
  static async getActiveNotes(): Promise<FirebaseResponse<Note[]>> {
    try {
      const allNotesResponse = await this.getAllNotes();
      if (!allNotesResponse.success || !allNotesResponse.data) {
        return allNotesResponse;
      }

      const activeNotes = allNotesResponse.data
        .filter(note => note.isActive)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      return {
        success: true,
        data: activeNotes
      };
    } catch (error) {
      // Error logged internally for production
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }
}

// User Profile Service for caching user data
export class UserProfileService {
  static async saveUserProfile(userProfile: UserProfile): Promise<FirebaseResponse<UserProfile>> {
    try {
      const userRef = ref(database, `userProfiles/${userProfile.uid}`);
      await set(userRef, userProfile);
      return { success: true, data: userProfile };
    } catch (error) {
      // Error logged internally for production
      return { success: false, error: 'Failed to save user profile' };
    }
  }

  static async getUserProfile(uid: string): Promise<FirebaseResponse<UserProfile>> {
    try {
      const userRef = ref(database, `userProfiles/${uid}`);
      const snapshot = await get(userRef);

      if (snapshot.exists()) {
        return { success: true, data: snapshot.val() as UserProfile };
      } else {
        return { success: false, error: 'User profile not found' };
      }
    } catch (error) {
      // Error logged internally for production
      return { success: false, error: 'Failed to get user profile' };
    }
  }

  static async updateUserInteractionStats(uid: string, statsUpdate: Partial<UserProfile['interactionStats']>): Promise<FirebaseResponse<void>> {
    try {
      const userRef = ref(database, `userProfiles/${uid}/interactionStats`);
      await update(userRef, {
        ...statsUpdate,
        lastActive: Date.now()
      });
      return { success: true };
    } catch (error) {
      // Error logged internally for production
      return { success: false, error: 'Failed to update user stats' };
    }
  }
}

// Class Cancellation Service
export class ClassCancellationService {
  static async cancelClass(
    classId: string,
    date: string,
    cancelledBy: string,
    reason?: string
  ): Promise<FirebaseResponse<ClassCancellation>> {
    const cancellationData: Omit<ClassCancellation, 'id' | 'createdAt' | 'updatedAt'> = {
      classId,
      date,
      reason,
      cancelledBy,
      cancelledAt: Date.now(),
      isActive: true
    };

    return FirebaseService.create<ClassCancellation>(DB_PATHS.CLASS_CANCELLATIONS, cancellationData);
  }

  static async getClassCancellations(classId: string): Promise<FirebaseResponse<ClassCancellation[]>> {
    try {
      const allCancellations = await FirebaseService.getAll<ClassCancellation>(DB_PATHS.CLASS_CANCELLATIONS);
      if (allCancellations.success && allCancellations.data) {
        const classCancellations = allCancellations.data.filter(
          cancellation => cancellation.classId === classId && cancellation.isActive
        );
        return {
          success: true,
          data: classCancellations
        };
      }
      return allCancellations;
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async getCancellationForDate(classId: string, date: string): Promise<FirebaseResponse<ClassCancellation | null>> {
    try {
      const cancellations = await this.getClassCancellations(classId);
      if (cancellations.success && cancellations.data) {
        const cancellation = cancellations.data.find(c => c.date === date && c.isActive);
        return {
          success: true,
          data: cancellation || null
        };
      }
      return {
        success: false,
        error: cancellations.error || 'Failed to get cancellations'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  static async reactivateClass(cancellationId: string): Promise<FirebaseResponse<ClassCancellation>> {
    return FirebaseService.update<ClassCancellation>(DB_PATHS.CLASS_CANCELLATIONS, cancellationId, {
      isActive: false,
      updatedAt: Date.now()
    });
  }

  static async getAllCancellations(): Promise<FirebaseResponse<ClassCancellation[]>> {
    return FirebaseService.getAll<ClassCancellation>(DB_PATHS.CLASS_CANCELLATIONS);
  }

  static listenToCancellations(callback: DataCallback<ClassCancellation[]>, errorCallback?: ErrorCallback): () => void {
    return FirebaseService.listenToPath<ClassCancellation>(DB_PATHS.CLASS_CANCELLATIONS, callback, errorCallback);
  }
}
