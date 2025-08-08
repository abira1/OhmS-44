// TypeScript interfaces for Firebase data models

// Authentication and User related interfaces
export interface User {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'user';
  createdAt: number;
  lastLoginAt: number;
  approvalStatus?: 'pending' | 'approved' | 'denied';
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

// User approval system interfaces
export interface UserApprovalRequest {
  uid: string;
  email: string;
  displayName: string | null;
  photoURL: string | null;
  status: 'pending' | 'approved' | 'denied';
  requestedAt: number;
  reviewedAt?: number;
  reviewedBy?: string; // Admin email who reviewed
  reason?: string; // Optional reason for denial
}

export interface UserApprovalStatus {
  uid: string;
  status: 'pending' | 'approved' | 'denied';
  updatedAt: number;
  updatedBy?: string;
  reason?: string;
}

// Admin email configuration
export const ADMIN_EMAILS = [
  'ohms1384@gmail.com',
  'mthalve1@gmail.com',
  'abirsabirhossain@gmail.com'
];

// Role-based permissions
export interface Permissions {
  canCreateClasses: boolean;
  canEditClasses: boolean;
  canDeleteClasses: boolean;
  canCancelClasses: boolean;
  canCreateStudents: boolean;
  canEditStudents: boolean;
  canDeleteStudents: boolean;
  canRecordAttendance: boolean;
  canViewAttendance: boolean;
  canShareAttendance: boolean;
  canCreateNotices: boolean;
  canEditNotices: boolean;
  canDeleteNotices: boolean;
  canCreateNotes: boolean;
  canEditNotes: boolean;
  canDeleteNotes: boolean;
  canAccessDevPanel: boolean;
}

// Enhanced time and day interfaces
export interface TimeRange {
  startTime: string;
  endTime: string;
  duration?: number; // in minutes
}

export interface DaySchedule {
  type: 'weekly' | 'specific' | 'custom';
  days?: string[]; // For weekly recurring (e.g., ['Monday', 'Wednesday'])
  specificDates?: string[]; // For specific dates (ISO format)
  customPattern?: {
    startDate: string;
    endDate: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
}

// Class/Routine related interfaces
export interface ClassSchedule {
  id: string;

  // Enhanced day and time support
  daySchedule?: DaySchedule;
  timeRange?: TimeRange;
  timeZone?: string; // IANA timezone identifier

  // Legacy fields for backward compatibility
  day: string; // Keep for existing data
  time: string; // Keep for existing data

  // Class information
  subject: string;
  teacher: string;
  code: string;
  room: string;

  // Metadata
  createdAt: number;
  updatedAt: number;

  // Cancellation tracking
  cancellations?: Record<string, ClassCancellation>; // date (YYYY-MM-DD) -> cancellation info

  // Real-time tracking fields
  lastModified?: string; // ISO string for real-time updates
  modifiedBy?: string; // Email of user who made last change
  version?: number; // For conflict resolution

  // Additional enhanced features
  isRecurring?: boolean;
  recurringPattern?: 'weekly' | 'biweekly' | 'monthly' | 'custom';
  currentEnrollment?: number;
  description?: string;
  location?: {
    building?: string;
    floor?: string;
    room: string;
    coordinates?: {
      lat: number;
      lng: number;
    };
  };

  // Academic information
  semester?: string;
  academicYear?: string;
  department?: string;
  courseType?: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'workshop';

  // Status and flags
  isActive?: boolean;
  isCancelled?: boolean;
  isOnline?: boolean;
  meetingLink?: string;

  // Notification settings
  notifyBefore?: number; // minutes before class
  sendReminders?: boolean;
}

// Class cancellation interface
export interface ClassCancellation {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD format
  reason?: string;
  cancelledBy: string; // Admin email who cancelled
  cancelledAt: number; // timestamp
  isActive: boolean; // allows for reactivation if needed
}

// Real-time connection status interface
export interface RealTimeStatus {
  isConnected: boolean;
  lastUpdate: string;
  syncInProgress: boolean;
  error?: string;
}

// Student related interfaces
export interface Student {
  id: string;
  name: string;
  roll: string;
  bloodGroup: string;
  phone: string;
  email: string;
  image: string;
  role: 'Regular' | 'CR' | 'CO-CR';
  createdAt: number;
  updatedAt: number;
}

// Attendance related interfaces
export interface AttendanceRecord {
  id: string;
  date: string;
  subject: string;
  presentCount: number;
  totalStudents: number;
  presentStudents: string[]; // Array of student IDs
  absentStudents: string[]; // Array of student IDs
  createdAt: number;
  updatedAt: number;
  createdBy?: string; // Admin who recorded attendance
}

// Notice related interfaces
export interface Notice {
  id: string;
  title: string;
  content: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  category: 'general' | 'academic' | 'event' | 'emergency';
  createdBy: string; // admin/teacher ID
  createdAt: string;
  expiresAt?: string;
  isActive: boolean;
  targetAudience: 'all' | 'students' | 'teachers' | string[]; // specific class IDs
  attachments?: any[]; // NoticeAttachment[] - simplified for now
  // Interactive features
  likeCount: number;
  commentCount: number;
  interactions?: {
    likes?: Record<string, any>; // UserLike - simplified for now
    comments?: Record<string, any>; // Comment - simplified for now
  };
}

// Firebase database structure interface
export interface DatabaseSchema {
  classes: Record<string, ClassSchedule>;
  students: Record<string, Student>;
  attendance: Record<string, AttendanceRecord>;
  notices: Record<string, Notice>;
  metadata: {
    lastUpdated: number;
    version: string;
  };
}

// API response interfaces
export interface FirebaseResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Real-time listener callback types
export type DataCallback<T> = (data: T | null) => void;
export type ErrorCallback = (error: Error) => void;

// Form data interfaces for creating/updating records
export interface CreateClassData {
  day: string;
  time: string;
  subject: string;
  teacher: string;
  code: string;
  room: string;
}

export interface CreateStudentData {
  name: string;
  roll: string;
  bloodGroup: string;
  phone: string;
  email: string;
  image: string;
  role: 'Regular' | 'CR' | 'CO-CR';
}

export interface CreateAttendanceData {
  date: string;
  subject: string;
  presentStudents: string[];
  absentStudents: string[];
}

export interface CreateNoticeData {
  title: string;
  description: string;
  date: string;
  priority: 'low' | 'medium' | 'high';
}

// Utility types
export type UpdateData<T> = Partial<Omit<T, 'id' | 'createdAt'>> & {
  updatedAt: number;
};

// Constants for database paths
export const DB_PATHS = {
  CLASSES: 'classes',
  STUDENTS: 'students',
  ATTENDANCE: 'attendance',
  NOTICES: 'notices',
  NOTES: 'notes',
  METADATA: 'metadata',
  USERS: 'users',
  CLASS_CANCELLATIONS: 'classCancellations'
} as const;

// Utility function to get user permissions based on role and approval status
export const getUserPermissions = (user: User | null): Permissions => {
  // Default permissions for unauthenticated users (no access)
  if (!user) {
    return {
      canCreateClasses: false,
      canEditClasses: false,
      canDeleteClasses: false,
      canCancelClasses: false,
      canCreateStudents: false,
      canEditStudents: false,
      canDeleteStudents: false,
      canRecordAttendance: false,
      canViewAttendance: false,
      canShareAttendance: false,
      canCreateNotices: false,
      canEditNotices: false,
      canDeleteNotices: false,
      canCreateNotes: false,
      canEditNotes: false,
      canDeleteNotes: false,
      canAccessDevPanel: false,
    };
  }

  // Admin users have full access regardless of approval status
  if (user.role === 'admin') {
    return {
      canCreateClasses: true,
      canEditClasses: true,
      canDeleteClasses: true,
      canCancelClasses: true,
      canCreateStudents: true,
      canEditStudents: true,
      canDeleteStudents: true,
      canRecordAttendance: true,
      canViewAttendance: true,
      canShareAttendance: true,
      canCreateNotices: true,
      canEditNotices: true,
      canDeleteNotices: true,
      canCreateNotes: true,
      canEditNotes: true,
      canDeleteNotes: true,
      canAccessDevPanel: true,
    };
  }

  // Regular users need approval to access content
  const isApproved = user.approvalStatus === 'approved';

  return {
    canCreateClasses: false,
    canEditClasses: false,
    canDeleteClasses: false,
    canCancelClasses: false,
    canCreateStudents: false,
    canEditStudents: false,
    canDeleteStudents: false,
    canRecordAttendance: false,
    canViewAttendance: isApproved,
    canShareAttendance: false,
    canCreateNotices: false,
    canEditNotices: false,
    canDeleteNotices: false,
    canCreateNotes: false,
    canEditNotes: false,
    canDeleteNotes: false,
    canAccessDevPanel: false,
  };
};

// Utility function to determine if user is admin
export const isUserAdmin = (user: User | null): boolean => {
  return user?.email ? ADMIN_EMAILS.includes(user.email) && user?.role === 'admin' : false;
};

// Utility function to check if user is approved for access
export const isUserApproved = (user: User | null): boolean => {
  if (!user) return false;
  if (isUserAdmin(user)) return true; // Admins are always approved
  return user.approvalStatus === 'approved';
};

// Utility function to check if user needs approval
export const isUserPending = (user: User | null): boolean => {
  if (!user) return false;
  if (isUserAdmin(user)) return false; // Admins don't need approval
  return user.approvalStatus === 'pending' || !user.approvalStatus;
};

// Utility function to check if user was denied access
export const isUserDenied = (user: User | null): boolean => {
  if (!user) return false;
  if (isUserAdmin(user)) return false; // Admins can't be denied
  return user.approvalStatus === 'denied';
};

// Re-export database types for interactions
export type {
  Note,
  UserLike,
  Comment,
  UserProfile
} from './database';
