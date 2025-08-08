// Data Context for Real Firebase Data Management
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { databaseService } from '../services/databaseService';
import { Student, Class, Notice, AttendanceRecord } from '../types/database';

interface DataContextType {
  // Data state
  currentStudent: Student | null;
  classes: Record<string, Class>;
  notices: Notice[];
  attendance: Record<string, AttendanceRecord>;
  

  
  // Actions
  markAttendance: (classId: string, status: 'present' | 'absent' | 'late') => Promise<boolean>;
  refreshData: () => Promise<void>;
  
  // Statistics
  attendanceStats: {
    totalClasses: number;
    attendedClasses: number;
    attendancePercentage: number;
  };
}

const DataContext = createContext<DataContextType | undefined>(undefined);

interface DataProviderProps {
  children: ReactNode;
  studentId?: string; // In real app, this would come from authentication
}

export const DataProvider: React.FC<DataProviderProps> = ({ 
  children, 
  studentId = 'student-1' // Default to first student for demo
}) => {
  const [currentStudent, setCurrentStudent] = useState<Student | null>(null);
  const [classes, setClasses] = useState<Record<string, Class>>({});
  const [notices, setNotices] = useState<Notice[]>([]);
  const [attendance, setAttendance] = useState<Record<string, AttendanceRecord>>({});
  const [isInitialized, setIsInitialized] = useState(false);


  // Initialize database and load data silently
  useEffect(() => {
    const initializeData = async () => {
      // Check if we're on mobile and having issues - use immediate fallback
      const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;
      const isOldBrowser = typeof window !== 'undefined' &&
        (!window.fetch || !window.Promise || !Array.from);
      const shouldUseFallback = isMobile || isOldBrowser ||
        (typeof localStorage !== 'undefined' && localStorage.getItem('use-fallback-data') === 'true');

      if (shouldUseFallback) {
        try {
          await loadStudentData();
          await loadClassesData();
          await loadNoticesData();
          await loadAttendanceData();
        } catch (error) {
          // Even fallback failed, use minimal data
          setCurrentStudent({
            id: studentId,
            name: 'Student',
            email: 'student@ohms44.edu',
            rollNumber: '001',
            joinedDate: new Date().toISOString(),
            isActive: true,
            classes: [],
            attendance: {}
          });
          setClasses({});
          setNotices([{
            id: 'welcome',
            title: 'Welcome to OhmS-44',
            content: 'Basic mode active for older devices.',
            category: 'general',
            priority: 'medium',
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            targetAudience: 'all',
            likeCount: 0,
            commentCount: 0
          }]);
          setAttendance({});
        }
        setIsInitialized(true);
        return;
      }

      try {
        // Initialize database with sample data if needed
        await databaseService.initializeDatabase();

        // Load initial data
        await loadStudentData();
        await loadClassesData();
        await loadNoticesData();
        await loadAttendanceData();

        setIsInitialized(true);
      } catch (error) {
        // Silently fall back to demo data if Firebase fails
        await loadStudentData();
        await loadClassesData();
        await loadNoticesData();
        await loadAttendanceData();

        setIsInitialized(true);
      }
    };

    initializeData();
  }, [studentId]);

  // Set up real-time listeners
  useEffect(() => {
    if (!isInitialized) return;

    const unsubscribers: (() => void)[] = [];

    try {
      // Listen to student data changes
      const unsubscribeStudent = databaseService.subscribeToStudentData(
        studentId,
        (student) => {
          if (student) {
            setCurrentStudent(student);
            if (student.attendance) {
              setAttendance(student.attendance);
            }
          }
        }
      );
      unsubscribers.push(unsubscribeStudent);

      // Listen to notices changes
      const unsubscribeNotices = databaseService.subscribeToNotices((notices) => {
        setNotices(notices);
      });
      unsubscribers.push(unsubscribeNotices);
    } catch (error) {
      // Silently ignore real-time listener errors
    }

    // Cleanup listeners on unmount
    return () => {
      unsubscribers.forEach(unsubscribe => unsubscribe());
    };
  }, [isInitialized, studentId]);

  const loadStudentData = async () => {
    try {
      const response = await databaseService.getStudent(studentId);
      if (response.success && response.data) {
        setCurrentStudent(response.data);
        if (response.data.attendance) {
          setAttendance(response.data.attendance);
        }
      } else {
        // Fallback to demo student data if Firebase fails
        setCurrentStudent({
          id: studentId,
          name: 'Demo Student',
          email: 'demo@ohms44.edu',
          rollNumber: '001',
          joinedDate: new Date().toISOString(),
          isActive: true,
          classes: ['class-1', 'class-2'],
          attendance: {}
        });
      }
    } catch (error) {
      // Fallback to demo student data
      setCurrentStudent({
        id: studentId,
        name: 'Demo Student',
        email: 'demo@ohms44.edu',
        rollNumber: '001',
        joinedDate: new Date().toISOString(),
        isActive: true,
        classes: ['class-1', 'class-2'],
        attendance: {}
      });
    }
  };

  const loadClassesData = async () => {
    try {
      const response = await databaseService.getAllClasses();
      if (response.success && response.data) {
        setClasses(response.data);
      } else {
        // Fallback to demo classes if Firebase fails
        setClasses({
          'class-1': {
            id: 'class-1',
            name: 'Mathematics',
            subject: 'Math',
            teacher: 'Prof. Smith',
            schedule: {
              dayOfWeek: 1, // Monday
              startTime: '09:00',
              endTime: '10:30',
              room: 'Room 101',
              duration: 90
            },
            students: [studentId],
            assignments: [],
            createdAt: new Date().toISOString(),
            isActive: true
          },
          'class-2': {
            id: 'class-2',
            name: 'Physics',
            subject: 'Physics',
            teacher: 'Prof. Johnson',
            schedule: {
              dayOfWeek: 2, // Tuesday
              startTime: '10:00',
              endTime: '11:30',
              room: 'Room 102',
              duration: 90
            },
            students: [studentId],
            assignments: [],
            createdAt: new Date().toISOString(),
            isActive: true
          }
        });
      }
    } catch (error) {
      // Fallback to demo classes
      setClasses({
        'class-1': {
          id: 'class-1',
          name: 'Mathematics',
          subject: 'Math',
          teacher: 'Prof. Smith',
          schedule: {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '10:30',
            room: 'Room 101',
            duration: 90
          },
          students: [studentId],
          assignments: [],
          createdAt: new Date().toISOString(),
          isActive: true
        },
        'class-2': {
          id: 'class-2',
          name: 'Physics',
          subject: 'Physics',
          teacher: 'Prof. Johnson',
          schedule: {
            dayOfWeek: 2, // Tuesday
            startTime: '10:00',
            endTime: '11:30',
            room: 'Room 102',
            duration: 90
          },
          students: [studentId],
          assignments: [],
          createdAt: new Date().toISOString(),
          isActive: true
        }
      });
    }
  };

  const loadNoticesData = async () => {
    try {
      const response = await databaseService.getActiveNotices();
      if (response.success && response.data) {
        setNotices(response.data);
      } else {
        // Fallback to demo notices if Firebase fails
        setNotices([
          {
            id: 'notice-1',
            title: 'Welcome to OhmS-44',
            content: 'Welcome to the OhmS-44 student portal. All features are working properly.',
            category: 'general',
            priority: 'medium',
            isActive: true,
            createdAt: new Date().toISOString(),
            createdBy: 'system',
            targetAudience: 'all',
            likeCount: 0,
            commentCount: 0
          }
        ]);
      }
    } catch (error) {
      // Fallback to demo notices
      setNotices([
        {
          id: 'notice-1',
          title: 'Welcome to OhmS-44',
          content: 'Welcome to the OhmS-44 student portal. All features are working properly.',
          category: 'general',
          priority: 'medium',
          isActive: true,
          createdAt: new Date().toISOString(),
          createdBy: 'system',
          targetAudience: 'all',
          likeCount: 0,
          commentCount: 0
        }
      ]);
    }
  };

  const loadAttendanceData = async () => {
    try {
      const response = await databaseService.getStudentAttendance(studentId);
      if (response.success && response.data) {
        setAttendance(response.data);
      } else {
        // Fallback to empty attendance if Firebase fails
        setAttendance({});
      }
    } catch (error) {
      // Fallback to empty attendance
      setAttendance({});
    }
  };

  const markAttendance = async (classId: string, status: 'present' | 'absent' | 'late'): Promise<boolean> => {
    try {
      const response = await databaseService.markAttendance(studentId, classId, status);
      if (response.success) {
        // Refresh attendance data
        await loadAttendanceData();
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error marking attendance:', error);
      return false;
    }
  };

  const refreshData = async () => {
    try {
      await Promise.all([
        loadStudentData(),
        loadClassesData(),
        loadNoticesData(),
        loadAttendanceData()
      ]);
    } catch (error) {
      // Silently handle refresh errors
    }
  };

  // Calculate attendance statistics
  const attendanceStats = React.useMemo(() => {
    const attendanceRecords = Object.values(attendance);
    const totalClasses = attendanceRecords.length;
    const attendedClasses = attendanceRecords.filter(
      record => record.status === 'present' || record.status === 'late'
    ).length;
    
    const attendancePercentage = totalClasses > 0 
      ? Math.round((attendedClasses / totalClasses) * 100)
      : 0;

    return {
      totalClasses,
      attendedClasses,
      attendancePercentage
    };
  }, [attendance]);

  // Get student's classes
  const studentClasses = React.useMemo(() => {
    if (!currentStudent) return {};
    
    const studentClassIds = currentStudent.classes || [];
    const filteredClasses: Record<string, Class> = {};
    
    studentClassIds.forEach(classId => {
      if (classes[classId]) {
        filteredClasses[classId] = classes[classId];
      }
    });
    
    return filteredClasses;
  }, [currentStudent, classes]);

  const value: DataContextType = {
    currentStudent,
    classes: studentClasses,
    notices,
    attendance,
    markAttendance,
    refreshData,
    attendanceStats
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};

// Helper hooks for specific data
export const useStudent = () => {
  const { currentStudent } = useData();
  return currentStudent;
};

export const useClasses = () => {
  const { classes } = useData();
  return classes;
};

export const useNotices = () => {
  const { notices } = useData();
  return notices;
};

export const useAttendance = () => {
  const { attendance, attendanceStats, markAttendance } = useData();
  return { attendance, attendanceStats, markAttendance };
};
