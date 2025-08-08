// Database Types for OhmS-44 Student App
export interface Student {
  id: string;
  name: string;
  email: string;
  rollNumber: string;
  profileImage?: string;
  joinedDate: string;
  isActive: boolean;
  classes: string[]; // Array of class IDs
  attendance: Record<string, AttendanceRecord>; // Date -> AttendanceRecord
}

export interface Class {
  id: string;
  name: string;
  subject: string;
  teacher: string;
  schedule: ClassSchedule;
  description?: string;
  students: string[]; // Array of student IDs
  assignments: Assignment[];
  createdAt: string;
  isActive: boolean;
}

export interface ClassSchedule {
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, etc.
  startTime: string; // "09:00"
  endTime: string; // "10:30"
  room?: string;
  duration: number; // minutes
}

// Class cancellation interface for database
export interface ClassCancellation {
  id: string;
  classId: string;
  date: string; // YYYY-MM-DD format
  reason?: string;
  cancelledBy: string; // Admin email who cancelled
  cancelledAt: string; // ISO timestamp
  isActive: boolean; // allows for reactivation if needed
}

export interface AttendanceRecord {
  date: string; // YYYY-MM-DD
  classId: string;
  status: 'present' | 'absent' | 'late';
  markedAt?: string; // ISO timestamp
  markedBy?: 'student' | 'teacher' | 'admin';
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string; // ISO timestamp
  subject: string;
  classId: string;
  createdBy: string; // teacher ID
  createdAt: string;
  isActive: boolean;
  submissions?: AssignmentSubmission[];
}

export interface AssignmentSubmission {
  studentId: string;
  submittedAt: string;
  content?: string;
  fileUrl?: string;
  status: 'submitted' | 'late' | 'graded';
  grade?: number;
  feedback?: string;
}

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
  attachments?: NoticeAttachment[];
  // Interactive features
  likeCount: number;
  commentCount: number;
  interactions?: {
    likes?: Record<string, UserLike>;
    comments?: Record<string, Comment>;
  };
}

// Enhanced Notes system for class notes with links
export interface Note {
  id: string;
  title: string;
  content: string;
  subject: string; // Subject/course name
  classLink?: string; // Optional class meeting/resource link
  createdBy: string; // admin ID who created the note
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
  priority: 'low' | 'medium' | 'high';
  tags?: string[]; // Optional tags for categorization
  targetAudience: 'all' | 'specific_class' | string[]; // class IDs or 'all'
}

// User like/reaction interface
export interface UserLike {
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoURL?: string;
  timestamp: number;
  reactionType: 'like' | 'love' | 'helpful' | 'important'; // Different reaction types
}

// Comment interface for notes
export interface Comment {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userPhotoURL?: string;
  content: string;
  timestamp: number;
  isEdited: boolean;
  editedAt?: number;
  parentCommentId?: string; // For threaded comments (future feature)
  isDeleted: boolean;
  deletedAt?: number;
  deletedBy?: string; // Admin who deleted the comment
  isPinned?: boolean; // Admin can pin important comments
  pinnedBy?: string;
  pinnedAt?: number;
}

// User profile interface for caching user data
export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: 'admin' | 'user';
  lastActive: number;
  interactionStats?: {
    totalLikes: number;
    totalComments: number;
    joinedAt: number;
  };
}

export interface NoticeAttachment {
  id: string;
  name: string;
  url: string;
  type: string; // file type
  size: number; // bytes
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subjects: string[];
  classes: string[]; // Array of class IDs
  profileImage?: string;
  isActive: boolean;
}

export interface Admin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin' | 'moderator';
  permissions: string[];
  isActive: boolean;
}

// Database structure
export interface DatabaseSchema {
  students: Record<string, Student>;
  classes: Record<string, Class>;
  teachers: Record<string, Teacher>;
  admins: Record<string, Admin>;
  notices: Record<string, Notice>;
  notes: Record<string, Note>; // Enhanced notes system
  attendance: Record<string, Record<string, AttendanceRecord>>; // date -> studentId -> record
  assignments: Record<string, Assignment>;
  classCancellations: Record<string, ClassCancellation>; // cancellation ID -> cancellation record
  settings: {
    schoolName: string;
    academicYear: string;
    semester: string;
    timezone: string;
    features: {
      attendance: boolean;
      assignments: boolean;
      notifications: boolean;
      fileSharing: boolean;
      notes: boolean; // Feature flag for notes system
      noteInteractions: boolean; // Feature flag for likes and comments
    };
  };
  // User interaction data
  userProfiles: Record<string, UserProfile>; // Cached user profile data
}
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

// Real-time update types
export interface RealtimeUpdate<T> {
  type: 'added' | 'changed' | 'removed';
  data: T;
  key: string;
  timestamp: string;
}

// Notification trigger types
export interface NotificationTrigger {
  id: string;
  type: 'class_reminder' | 'assignment_due' | 'attendance_reminder' | 'notice_posted';
  targetStudents: string[];
  scheduledFor: string; // ISO timestamp
  payload: {
    title: string;
    body: string;
    data?: Record<string, any>;
  };
  status: 'pending' | 'sent' | 'failed';
  createdAt: string;
}

// Statistics types
export interface AttendanceStats {
  studentId: string;
  totalClasses: number;
  attendedClasses: number;
  attendancePercentage: number;
  lastUpdated: string;
}

export interface ClassStats {
  classId: string;
  totalStudents: number;
  averageAttendance: number;
  totalAssignments: number;
  submissionRate: number;
  lastUpdated: string;
}
