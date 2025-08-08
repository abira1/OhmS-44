// React hooks for Firebase data management
import { useState, useEffect, useCallback } from 'react';
import { ref, onValue } from 'firebase/database';
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
  RealTimeStatus
} from '../types';
import {
  ClassService,
  StudentService,
  AttendanceService,
  NoticeService,
  NotesService,
  ClassCancellationService,
  UserProfileService
} from '../services/firebase';

// Generic hook for Firebase data with real-time updates
export function useFirebaseData<T>(
  service: {
    getAll: () => Promise<FirebaseResponse<T[]>>;
    listenTo: (callback: (data: T[]) => void, errorCallback?: (error: Error) => void) => () => void;
  }
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let unsubscribe: (() => void) | null = null;

    const initializeData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Set up real-time listener
        unsubscribe = service.listenTo(
          (newData) => {
            setData(newData);
            setLoading(false);
          },
          (error) => {
            // Firebase listener error handled silently for production
            setError(error.message);
            setLoading(false);
          }
        );
      } catch (err) {
        // Error initializing Firebase data handled silently for production
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    initializeData();

    // Cleanup function
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { data, loading, error, setData };
}

// Hook for classes data
export function useClasses() {
  const { data: classes, loading, error } = useFirebaseData({
    getAll: ClassService.getAllClasses,
    listenTo: ClassService.listenToClasses
  });

  const createClass = useCallback(async (classData: Omit<ClassSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await ClassService.createClass(classData);
  }, []);

  const updateClass = useCallback(async (id: string, updates: Partial<ClassSchedule>) => {
    return await ClassService.updateClass(id, updates);
  }, []);

  const deleteClass = useCallback(async (id: string) => {
    return await ClassService.deleteClass(id);
  }, []);

  return {
    classes,
    loading,
    error,
    createClass,
    updateClass,
    deleteClass
  };
}

// Enhanced hook for classes with real-time status tracking
export function useRealTimeClasses() {
  const { classes, loading, error, createClass, updateClass, deleteClass } = useClasses();
  const [realTimeStatus, setRealTimeStatus] = useState<RealTimeStatus>({
    isConnected: navigator.onLine,
    lastUpdate: new Date().toISOString(),
    syncInProgress: false
  });
  const [retryCount, setRetryCount] = useState(0);
  const [pendingOperations, setPendingOperations] = useState<Array<{
    id: string;
    operation: 'create' | 'update' | 'delete';
    data: any;
    timestamp: number;
  }>>([]);

  // Enhanced createClass with real-time metadata and retry logic
  const createClassWithMetadata = useCallback(async (classData: Omit<ClassSchedule, 'id' | 'createdAt' | 'updatedAt'>) => {
    setRealTimeStatus(prev => ({ ...prev, syncInProgress: true }));

    const enhancedClassData = {
      ...classData,
      lastModified: new Date().toISOString(),
      modifiedBy: 'current-user', // Will be replaced with actual user email
      version: 1
    };

    const operationId = `create-${Date.now()}`;

    try {
      // Add to pending operations for offline support
      setPendingOperations(prev => [...prev, {
        id: operationId,
        operation: 'create',
        data: enhancedClassData,
        timestamp: Date.now()
      }]);

      const result = await createClass(enhancedClassData);

      // Remove from pending operations on success
      setPendingOperations(prev => prev.filter(op => op.id !== operationId));
      setRetryCount(0);

      setRealTimeStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastUpdate: new Date().toISOString(),
        error: undefined
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Implement exponential backoff for retries
      if (retryCount < 3 && !navigator.onLine) {
        const delay = Math.pow(2, retryCount) * 1000; // 1s, 2s, 4s
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          createClassWithMetadata(classData);
        }, delay);
      } else {
        setPendingOperations(prev => prev.filter(op => op.id !== operationId));
      }

      setRealTimeStatus(prev => ({
        ...prev,
        syncInProgress: false,
        error: errorMessage
      }));
      throw error;
    }
  }, [createClass, retryCount]);

  // Enhanced updateClass with conflict resolution
  const updateClassWithMetadata = useCallback(async (id: string, updates: Partial<ClassSchedule>) => {
    setRealTimeStatus(prev => ({ ...prev, syncInProgress: true }));

    // Get current version for conflict resolution
    const currentClass = classes.find(cls => cls.id === id);
    const currentVersion = currentClass?.version || 0;

    const enhancedUpdates = {
      ...updates,
      lastModified: new Date().toISOString(),
      modifiedBy: 'current-user', // Will be replaced with actual user email
      version: currentVersion + 1
    };

    const operationId = `update-${id}-${Date.now()}`;

    try {
      // Add to pending operations
      setPendingOperations(prev => [...prev, {
        id: operationId,
        operation: 'update',
        data: { id, updates: enhancedUpdates },
        timestamp: Date.now()
      }]);

      const result = await updateClass(id, enhancedUpdates);

      // Remove from pending operations on success
      setPendingOperations(prev => prev.filter(op => op.id !== operationId));
      setRetryCount(0);

      setRealTimeStatus(prev => ({
        ...prev,
        syncInProgress: false,
        lastUpdate: new Date().toISOString(),
        error: undefined
      }));
      return result;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      // Handle version conflicts
      if (errorMessage.includes('version') || errorMessage.includes('conflict')) {
        setPendingOperations(prev => prev.filter(op => op.id !== operationId));
        setRealTimeStatus(prev => ({
          ...prev,
          syncInProgress: false,
          error: 'Data was modified by another user. Please refresh and try again.'
        }));
      } else if (retryCount < 3 && !navigator.onLine) {
        const delay = Math.pow(2, retryCount) * 1000;
        setTimeout(() => {
          setRetryCount(prev => prev + 1);
          updateClassWithMetadata(id, updates);
        }, delay);
      } else {
        setPendingOperations(prev => prev.filter(op => op.id !== operationId));
        setRealTimeStatus(prev => ({
          ...prev,
          syncInProgress: false,
          error: errorMessage
        }));
      }
      throw error;
    }
  }, [updateClass, classes, retryCount]);

  // Enhanced connection status tracking with Firebase connection state
  useEffect(() => {
    const handleOnline = () => {
      setRealTimeStatus(prev => ({ ...prev, isConnected: true, error: undefined }));
      // Retry pending operations when back online
      if (pendingOperations.length > 0) {
        retryPendingOperations();
      }
    };

    const handleOffline = () => {
      setRealTimeStatus(prev => ({ ...prev, isConnected: false }));
    };

    // Firebase connection state monitoring
    const connectedRef = ref(database, '.info/connected');
    const unsubscribeConnected = onValue(connectedRef, (snapshot) => {
      const connected = snapshot.val() === true;
      setRealTimeStatus(prev => ({
        ...prev,
        isConnected: connected && navigator.onLine
      }));
    });

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsubscribeConnected();
    };
  }, [pendingOperations]);

  // Retry pending operations when connection is restored
  const retryPendingOperations = useCallback(async () => {
    if (pendingOperations.length === 0) return;

    setRealTimeStatus(prev => ({ ...prev, syncInProgress: true }));

    for (const operation of pendingOperations) {
      try {
        switch (operation.operation) {
          case 'create':
            await createClass(operation.data);
            break;
          case 'update':
            await updateClass(operation.data.id, operation.data.updates);
            break;
          case 'delete':
            await deleteClass(operation.data.id);
            break;
        }
      } catch (error) {
        console.error('Failed to retry operation:', operation, error);
      }
    }

    setPendingOperations([]);
    setRealTimeStatus(prev => ({
      ...prev,
      syncInProgress: false,
      lastUpdate: new Date().toISOString()
    }));
  }, [pendingOperations, createClass, updateClass, deleteClass]);

  // Update lastUpdate when classes change
  useEffect(() => {
    if (classes.length > 0) {
      setRealTimeStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString()
      }));
    }
  }, [classes]);

  return {
    classes,
    loading,
    error,
    realTimeStatus,
    pendingOperations: pendingOperations.length,
    createClass: createClassWithMetadata,
    updateClass: updateClassWithMetadata,
    deleteClass
  };
}

// Hook for students data
export function useStudents() {
  const { data: students, loading, error } = useFirebaseData({
    getAll: StudentService.getAllStudents,
    listenTo: StudentService.listenToStudents
  });

  const createStudent = useCallback(async (studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await StudentService.createStudent(studentData);
  }, []);

  const updateStudent = useCallback(async (id: string, updates: Partial<Student>) => {
    return await StudentService.updateStudent(id, updates);
  }, []);

  const deleteStudent = useCallback(async (id: string) => {
    return await StudentService.deleteStudent(id);
  }, []);

  return {
    students,
    loading,
    error,
    createStudent,
    updateStudent,
    deleteStudent
  };
}

// Hook for attendance data
export function useAttendance() {
  const { data: attendance, loading, error } = useFirebaseData({
    getAll: AttendanceService.getAllAttendance,
    listenTo: AttendanceService.listenToAttendance
  });

  const createAttendance = useCallback(async (attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await AttendanceService.createAttendance(attendanceData);
  }, []);

  const updateAttendance = useCallback(async (id: string, updates: Partial<AttendanceRecord>) => {
    return await AttendanceService.updateAttendance(id, updates);
  }, []);

  const deleteAttendance = useCallback(async (id: string) => {
    return await AttendanceService.deleteAttendance(id);
  }, []);

  return {
    attendance,
    loading,
    error,
    createAttendance,
    updateAttendance,
    deleteAttendance
  };
}

// Hook for notices data
export function useNotices() {
  const { data: notices, loading, error } = useFirebaseData({
    getAll: NoticeService.getAllNotices,
    listenTo: NoticeService.listenToNotices
  });

  const createNotice = useCallback(async (noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'>) => {
    // Initialize interaction counts for new notices
    const noticeWithInteractions = {
      ...noticeData,
      likeCount: 0,
      commentCount: 0
    };
    return await NoticeService.createNotice(noticeWithInteractions);
  }, []);

  const updateNotice = useCallback(async (id: string, updates: Partial<Notice>) => {
    return await NoticeService.updateNotice(id, updates);
  }, []);

  const deleteNotice = useCallback(async (id: string) => {
    return await NoticeService.deleteNotice(id);
  }, []);

  return {
    notices,
    loading,
    error,
    createNotice,
    updateNotice,
    deleteNotice
  };
}

// Hook for enhanced notes data with class links
export function useNotes() {
  const { data: notes, loading, error } = useFirebaseData({
    getAll: NotesService.getAllNotes,
    listenTo: NotesService.listenToNotes
  });

  const createNote = useCallback(async (noteData: Omit<Note, 'id' | 'createdAt' | 'updatedAt'>) => {
    return await NotesService.createNote(noteData);
  }, []);

  const updateNote = useCallback(async (id: string, updates: Partial<Note>) => {
    return await NotesService.updateNote(id, updates);
  }, []);

  const deleteNote = useCallback(async (id: string) => {
    return await NotesService.deleteNote(id);
  }, []);

  const getNotesBySubject = useCallback(async (subject: string) => {
    return await NotesService.getNotesBySubject(subject);
  }, []);

  const getActiveNotes = useCallback(async () => {
    return await NotesService.getActiveNotes();
  }, []);

  // Filter active notes from the real-time data
  const activeNotes = notes?.filter(note => note.isActive) || [];

  // Get unique subjects from active notes
  const subjects = [...new Set(activeNotes.map(note => note.subject))].sort();

  return {
    notes: activeNotes,
    allNotes: notes,
    subjects,
    loading,
    error,
    createNote,
    updateNote,
    deleteNote,
    getNotesBySubject,
    getActiveNotes
  };
}

// Hook for class cancellations
export function useClassCancellations() {
  const { data: cancellations, loading, error } = useFirebaseData({
    getAll: ClassCancellationService.getAllCancellations,
    listenTo: ClassCancellationService.listenToCancellations
  });

  const cancelClass = useCallback(async (
    classId: string,
    date: string,
    cancelledBy: string,
    reason?: string
  ) => {
    return await ClassCancellationService.cancelClass(classId, date, cancelledBy, reason);
  }, []);

  const getCancellationForDate = useCallback(async (classId: string, date: string) => {
    return await ClassCancellationService.getCancellationForDate(classId, date);
  }, []);

  const reactivateClass = useCallback(async (cancellationId: string) => {
    return await ClassCancellationService.reactivateClass(cancellationId);
  }, []);

  const getClassCancellations = useCallback(async (classId: string) => {
    return await ClassCancellationService.getClassCancellations(classId);
  }, []);

  return {
    cancellations,
    loading,
    error,
    cancelClass,
    getCancellationForDate,
    reactivateClass,
    getClassCancellations
  };
}

// Hook for notice interactions (likes and comments)
export function useNoticeInteractions(noticeId: string) {
  const [likes, setLikes] = useState<Record<string, UserLike>>({});
  const [comments, setComments] = useState<Record<string, Comment>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!noticeId) return;

    setLoading(true);
    setError(null);

    const unsubscribe = NoticeService.listenToNoticeInteractions(
      noticeId,
      (interactions) => {
        setLikes(interactions.likes);
        setComments(interactions.comments);
        setLoading(false);
      },
      (error) => {
        setError(error.message);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [noticeId]);

  const toggleLike = useCallback(async (userLike: UserLike) => {
    return await NoticeService.toggleNoticeLike(noticeId, userLike);
  }, [noticeId]);

  const addComment = useCallback(async (comment: Omit<Comment, 'id' | 'timestamp'>) => {
    return await NoticeService.addNoticeComment(noticeId, comment);
  }, [noticeId]);

  const updateComment = useCallback(async (commentId: string, content: string) => {
    return await NoticeService.updateNoticeComment(noticeId, commentId, content);
  }, [noticeId]);

  const deleteComment = useCallback(async (commentId: string, deletedBy: string) => {
    return await NoticeService.deleteNoticeComment(noticeId, commentId, deletedBy);
  }, [noticeId]);

  return {
    likes,
    comments,
    loading,
    error,
    toggleLike,
    addComment,
    updateComment,
    deleteComment
  };
}

// Hook for user profile management
export function useUserProfile(uid: string) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!uid) return;

    const fetchProfile = async () => {
      setLoading(true);
      setError(null);

      const result = await UserProfileService.getUserProfile(uid);
      if (result.success) {
        setProfile(result.data || null);
      } else {
        setError(result.error || 'Failed to load user profile');
      }
      setLoading(false);
    };

    fetchProfile();
  }, [uid]);

  const saveProfile = useCallback(async (userProfile: UserProfile) => {
    return await UserProfileService.saveUserProfile(userProfile);
  }, []);

  const updateInteractionStats = useCallback(async (statsUpdate: Partial<UserProfile['interactionStats']>) => {
    return await UserProfileService.updateUserInteractionStats(uid, statsUpdate);
  }, [uid]);

  return {
    profile,
    loading,
    error,
    saveProfile,
    updateInteractionStats
  };
}

// Note: Automatic migration has been removed.
// Use the DevPanel or console commands for manual data management.
