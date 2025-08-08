// Firebase Realtime Database Service for OhmS-44
import { 
  ref, 
  push, 
  set, 
  get, 
  update, 
  remove, 
  onValue, 
  off,
  query,
  orderByChild,
  equalTo,
  limitToLast,
  DataSnapshot
} from 'firebase/database';
import { database } from '../config/firebase';
import { 
  Student, 
  Class, 
  Notice, 
  AttendanceRecord, 
  Assignment,
  ApiResponse,
  RealtimeUpdate 
} from '../types/database';

export class DatabaseService {
  private static instance: DatabaseService;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  // Generic CRUD operations
  private async create<T>(path: string, data: T): Promise<ApiResponse<T>> {
    try {
      const newRef = push(ref(database, path));
      await set(newRef, {
        ...data,
        id: newRef.key,
        createdAt: new Date().toISOString()
      });
      
      return {
        success: true,
        data: { ...data, id: newRef.key } as T,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error creating ${path}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async read<T>(path: string): Promise<ApiResponse<T>> {
    try {
      const snapshot = await get(ref(database, path));
      if (snapshot.exists()) {
        return {
          success: true,
          data: snapshot.val() as T,
          timestamp: new Date().toISOString()
        };
      } else {
        return {
          success: false,
          error: 'Data not found',
          timestamp: new Date().toISOString()
        };
      }
    } catch (error) {
      console.error(`Error reading ${path}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async updateData<T>(path: string, data: Partial<T>): Promise<ApiResponse<T>> {
    try {
      await update(ref(database, path), {
        ...data,
        updatedAt: new Date().toISOString()
      });
      
      return {
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error updating ${path}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  private async delete(path: string): Promise<ApiResponse<void>> {
    try {
      await remove(ref(database, path));
      return {
        success: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error deleting ${path}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Student operations
  public async createStudent(student: Omit<Student, 'id' | 'createdAt'>): Promise<ApiResponse<Student>> {
    return this.create<Student>('students', student as Student);
  }

  public async getStudent(studentId: string): Promise<ApiResponse<Student>> {
    return this.read<Student>(`students/${studentId}`);
  }

  public async getAllStudents(): Promise<ApiResponse<Record<string, Student>>> {
    return this.read<Record<string, Student>>('students');
  }

  public async updateStudent(studentId: string, data: Partial<Student>): Promise<ApiResponse<Student>> {
    return this.updateData<Student>(`students/${studentId}`, data);
  }

  // Class operations
  public async createClass(classData: Omit<Class, 'id' | 'createdAt'>): Promise<ApiResponse<Class>> {
    return this.create<Class>('classes', classData as Class);
  }

  public async getClass(classId: string): Promise<ApiResponse<Class>> {
    return this.read<Class>(`classes/${classId}`);
  }

  public async getAllClasses(): Promise<ApiResponse<Record<string, Class>>> {
    return this.read<Record<string, Class>>('classes');
  }

  public async updateClass(classId: string, data: Partial<Class>): Promise<ApiResponse<Class>> {
    return this.updateData<Class>(`classes/${classId}`, data);
  }

  // Notice operations
  public async createNotice(notice: Omit<Notice, 'id' | 'createdAt'>): Promise<ApiResponse<Notice>> {
    return this.create<Notice>('notices', notice as Notice);
  }

  public async getAllNotices(): Promise<ApiResponse<Record<string, Notice>>> {
    return this.read<Record<string, Notice>>('notices');
  }

  public async getActiveNotices(): Promise<ApiResponse<Notice[]>> {
    try {
      const snapshot = await get(query(
        ref(database, 'notices'),
        orderByChild('isActive'),
        equalTo(true)
      ));
      
      if (snapshot.exists()) {
        const notices = Object.values(snapshot.val() as Record<string, Notice>)
          .filter(notice => {
            if (notice.expiresAt) {
              return new Date(notice.expiresAt) > new Date();
            }
            return true;
          })
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        return {
          success: true,
          data: notices,
          timestamp: new Date().toISOString()
        };
      }
      
      return {
        success: true,
        data: [],
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error getting active notices:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  // Attendance operations
  public async markAttendance(
    studentId: string, 
    classId: string, 
    status: 'present' | 'absent' | 'late'
  ): Promise<ApiResponse<AttendanceRecord>> {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
    const attendanceRecord: AttendanceRecord = {
      date: today,
      classId,
      status,
      markedAt: new Date().toISOString(),
      markedBy: 'student'
    };

    try {
      await set(ref(database, `attendance/${today}/${studentId}`), attendanceRecord);
      
      // Update student's attendance record
      await update(ref(database, `students/${studentId}/attendance/${today}`), attendanceRecord);
      
      return {
        success: true,
        data: attendanceRecord,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error marking attendance:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      };
    }
  }

  public async getStudentAttendance(studentId: string, month?: string): Promise<ApiResponse<Record<string, AttendanceRecord>>> {
    const path = month 
      ? `students/${studentId}/attendance`
      : `students/${studentId}/attendance`;
    
    return this.read<Record<string, AttendanceRecord>>(path);
  }

  // Real-time listeners
  public subscribeToNotices(callback: (notices: Notice[]) => void): () => void {
    const noticesRef = ref(database, 'notices');
    
    const unsubscribe = onValue(noticesRef, (snapshot) => {
      if (snapshot.exists()) {
        const notices = Object.values(snapshot.val() as Record<string, Notice>)
          .filter(notice => notice.isActive)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        callback(notices);
      } else {
        callback([]);
      }
    });

    return () => off(noticesRef, 'value', unsubscribe);
  }

  public subscribeToStudentData(studentId: string, callback: (student: Student | null) => void): () => void {
    const studentRef = ref(database, `students/${studentId}`);
    
    const unsubscribe = onValue(studentRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as Student);
      } else {
        callback(null);
      }
    });

    return () => off(studentRef, 'value', unsubscribe);
  }

  public subscribeToClassData(classId: string, callback: (classData: Class | null) => void): () => void {
    const classRef = ref(database, `classes/${classId}`);
    
    const unsubscribe = onValue(classRef, (snapshot) => {
      if (snapshot.exists()) {
        callback(snapshot.val() as Class);
      } else {
        callback(null);
      }
    });

    return () => off(classRef, 'value', unsubscribe);
  }

  // Utility methods
  public async initializeDatabase(): Promise<void> {
    try {
      // Check if database is already initialized
      const settingsSnapshot = await get(ref(database, 'settings'));

      if (!settingsSnapshot.exists()) {
        // Initialize with default settings
        await set(ref(database, 'settings'), {
          schoolName: 'OhmS-44 School',
          academicYear: '2024-2025',
          semester: 'Spring',
          timezone: 'Asia/Kolkata',
          features: {
            attendance: true,
            assignments: true,
            notifications: true,
            fileSharing: false
          },
          initialized: true,
          initializedAt: new Date().toISOString()
        });

        // Add sample data
        await this.addSampleData();
      }
    } catch (error) {
      // Silently handle initialization errors
      throw error;
    }
  }

  private async addSampleData(): Promise<void> {
    try {
      // Sample classes
      const sampleClasses = {
        'physics-101': {
          id: 'physics-101',
          name: 'Physics 101',
          subject: 'Physics',
          teacher: 'Dr. Sarah Johnson',
          schedule: {
            dayOfWeek: 1, // Monday
            startTime: '09:00',
            endTime: '10:30',
            room: 'Room 201',
            duration: 90
          },
          description: 'Introduction to Classical Mechanics and Thermodynamics',
          students: ['student-1', 'student-2', 'student-3'],
          assignments: [],
          createdAt: new Date().toISOString(),
          isActive: true
        },
        'chemistry-101': {
          id: 'chemistry-101',
          name: 'Chemistry 101',
          subject: 'Chemistry',
          teacher: 'Prof. Michael Chen',
          schedule: {
            dayOfWeek: 2, // Tuesday
            startTime: '14:00',
            endTime: '15:30',
            room: 'Lab 105',
            duration: 90
          },
          description: 'Organic Chemistry Fundamentals',
          students: ['student-1', 'student-2', 'student-4'],
          assignments: [],
          createdAt: new Date().toISOString(),
          isActive: true
        },
        'mathematics-101': {
          id: 'mathematics-101',
          name: 'Mathematics 101',
          subject: 'Mathematics',
          teacher: 'Dr. Emily Rodriguez',
          schedule: {
            dayOfWeek: 3, // Wednesday
            startTime: '11:00',
            endTime: '12:30',
            room: 'Room 301',
            duration: 90
          },
          description: 'Calculus and Linear Algebra',
          students: ['student-1', 'student-3', 'student-4'],
          assignments: [],
          createdAt: new Date().toISOString(),
          isActive: true
        }
      };

      // Sample students
      const sampleStudents = {
        'student-1': {
          id: 'student-1',
          name: 'Alex Thompson',
          email: 'alex.thompson@student.ohms44.edu',
          rollNumber: 'ST2024001',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
          joinedDate: '2024-01-15',
          isActive: true,
          classes: ['physics-101', 'chemistry-101', 'mathematics-101'],
          attendance: {}
        },
        'student-2': {
          id: 'student-2',
          name: 'Maya Patel',
          email: 'maya.patel@student.ohms44.edu',
          rollNumber: 'ST2024002',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Maya',
          joinedDate: '2024-01-15',
          isActive: true,
          classes: ['physics-101', 'chemistry-101'],
          attendance: {}
        },
        'student-3': {
          id: 'student-3',
          name: 'Jordan Kim',
          email: 'jordan.kim@student.ohms44.edu',
          rollNumber: 'ST2024003',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Jordan',
          joinedDate: '2024-01-15',
          isActive: true,
          classes: ['physics-101', 'mathematics-101'],
          attendance: {}
        },
        'student-4': {
          id: 'student-4',
          name: 'Sam Wilson',
          email: 'sam.wilson@student.ohms44.edu',
          rollNumber: 'ST2024004',
          profileImage: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Sam',
          joinedDate: '2024-01-15',
          isActive: true,
          classes: ['chemistry-101', 'mathematics-101'],
          attendance: {}
        }
      };

      // Sample notices
      const sampleNotices = {
        'notice-1': {
          id: 'notice-1',
          title: '🎓 Welcome to OhmS-44!',
          content: 'Welcome to the new academic year! Please check your class schedules and make sure to mark your attendance daily.',
          priority: 'high',
          category: 'general',
          createdBy: 'admin-1',
          createdAt: new Date().toISOString(),
          isActive: true,
          targetAudience: 'all',
          attachments: []
        },
        'notice-2': {
          id: 'notice-2',
          title: '📚 Library Hours Extended',
          content: 'The library will now be open until 10 PM on weekdays to support your studies. New study rooms are also available for group work.',
          priority: 'medium',
          category: 'academic',
          createdBy: 'admin-1',
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
          isActive: true,
          targetAudience: 'all',
          attachments: []
        },
        'notice-3': {
          id: 'notice-3',
          title: '🧪 Chemistry Lab Safety Training',
          content: 'Mandatory safety training for all chemistry students. Please attend the session scheduled for this Friday at 3 PM in Lab 105.',
          priority: 'urgent',
          category: 'academic',
          createdBy: 'teacher-chemistry',
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // Expires in 1 week
          isActive: true,
          targetAudience: ['chemistry-101'],
          attachments: []
        }
      };

      // Set sample data
      await set(ref(database, 'classes'), sampleClasses);
      await set(ref(database, 'students'), sampleStudents);
      await set(ref(database, 'notices'), sampleNotices);


    } catch (error) {
      // Silently handle sample data errors
    }
  }
}

// Export singleton instance
export const databaseService = DatabaseService.getInstance();
