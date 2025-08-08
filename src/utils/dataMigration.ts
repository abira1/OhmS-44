// Manual data migration utility - only runs when explicitly called by user
import { mockClasses, mockStudents, mockAttendance, mockNotices } from '../data/mockData';
import { ClassService, StudentService, AttendanceService, NoticeService } from '../services/firebase';
import { ClassSchedule, Student, AttendanceRecord, Notice } from '../types';
import logger from './logger';

// Convert mock data to Firebase format
export class DataMigration {
  // Migrate classes data
  static async migrateClasses(): Promise<void> {
    logger.test('Starting classes migration...');
    
    try {
      for (const mockClass of mockClasses) {
        const classData: Omit<ClassSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
          day: mockClass.day,
          time: mockClass.time,
          subject: mockClass.subject,
          teacher: mockClass.teacher,
          code: mockClass.code,
          room: mockClass.room
        };

        const result = await ClassService.createClass(classData);
        if (result.success) {
          logger.test(`✓ Migrated class: ${mockClass.subject}`);
        } else {
          logger.error(`✗ Failed to migrate class: ${mockClass.subject}`, result.error);
        }
      }
      logger.test('Classes migration completed!');
    } catch (error) {
      logger.error('Error during classes migration:', error);
    }
  }

  // Migrate students data
  static async migrateStudents(): Promise<void> {
    logger.test('Starting students migration...');
    
    try {
      for (const mockStudent of mockStudents) {
        const studentData: Omit<Student, 'id' | 'createdAt' | 'updatedAt'> = {
          name: mockStudent.name,
          roll: mockStudent.roll,
          bloodGroup: mockStudent.bloodGroup,
          phone: mockStudent.phone,
          email: mockStudent.email,
          image: mockStudent.image,
          role: mockStudent.id === 1 ? 'CR' : mockStudent.id === 2 ? 'CO-CR' : 'Regular'
        };

        const result = await StudentService.createStudent(studentData);
        if (result.success) {
          logger.test(`✓ Migrated student: ${mockStudent.name}`);
        } else {
          logger.error(`✗ Failed to migrate student: ${mockStudent.name}`, result.error);
        }
      }
      logger.test('Students migration completed!');
    } catch (error) {
      logger.error('Error during students migration:', error);
    }
  }

  // Migrate attendance data
  static async migrateAttendance(): Promise<void> {
    logger.test('Starting attendance migration...');

    try {
      // First, get all students to map IDs
      const studentsResult = await StudentService.getAllStudents();
      if (!studentsResult.success || !studentsResult.data) {
        logger.error('Failed to get students for attendance migration');
        return;
      }

      const students = studentsResult.data;
      
      for (const mockRecord of mockAttendance) {
        // Convert student indices to Firebase student IDs
        const absentStudentIds = mockRecord.absentStudents.map(index => {
          const student = students.find(s => s.roll === mockStudents[index - 1]?.roll);
          return student?.id || '';
        }).filter(id => id !== '');

        const presentStudentIds = students
          .filter(student => !absentStudentIds.includes(student.id))
          .map(student => student.id);

        const attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
          date: mockRecord.date,
          subject: mockRecord.subject,
          presentCount: mockRecord.presentCount,
          totalStudents: students.length,
          presentStudents: presentStudentIds,
          absentStudents: absentStudentIds
        };

        const result = await AttendanceService.createAttendance(attendanceData);
        if (result.success) {
          logger.test(`✓ Migrated attendance: ${mockRecord.date} - ${mockRecord.subject}`);
        } else {
          logger.error(`✗ Failed to migrate attendance: ${mockRecord.date} - ${mockRecord.subject}`, result.error);
        }
      }
      logger.test('Attendance migration completed!');
    } catch (error) {
      logger.error('Error during attendance migration:', error);
    }
  }

  // Migrate notices data
  static async migrateNotices(): Promise<void> {
    logger.test('Starting notices migration...');
    
    try {
      for (const mockNotice of mockNotices) {
        const noticeData: Omit<Notice, 'id' | 'createdAt' | 'updatedAt'> = {
          title: mockNotice.title,
          description: mockNotice.description,
          date: mockNotice.date,
          priority: 'medium', // Default priority
          isActive: true
        };

        const result = await NoticeService.createNotice(noticeData);
        if (result.success) {
          logger.test(`✓ Migrated notice: ${mockNotice.title}`);
        } else {
          logger.error(`✗ Failed to migrate notice: ${mockNotice.title}`, result.error);
        }
      }
      logger.test('Notices migration completed!');
    } catch (error) {
      logger.error('Error during notices migration:', error);
    }
  }

  // Run complete migration (manual only - called by user action)
  static async runFullMigration(): Promise<void> {
    logger.test('🚀 Starting manual data population to Firebase...');

    try {
      // Migrate in order: students first (needed for attendance), then classes, attendance, and notices
      await this.migrateStudents();
      await this.migrateClasses();
      await this.migrateAttendance();
      await this.migrateNotices();

      logger.test('🎉 Manual data population completed successfully!');
    } catch (error) {
      logger.error('❌ Data population failed:', error);
      throw error;
    }
  }

  // Clear all data (useful for testing)
  static async clearAllData(): Promise<void> {
    logger.test('⚠️ Clearing all Firebase data...');
    
    try {
      // Get all records and delete them
      const [classesResult, studentsResult, attendanceResult, noticesResult] = await Promise.all([
        ClassService.getAllClasses(),
        StudentService.getAllStudents(),
        AttendanceService.getAllAttendance(),
        NoticeService.getAllNotices()
      ]);

      // Delete all classes
      if (classesResult.success && classesResult.data) {
        for (const classItem of classesResult.data) {
          await ClassService.deleteClass(classItem.id);
        }
      }

      // Delete all students
      if (studentsResult.success && studentsResult.data) {
        for (const student of studentsResult.data) {
          await StudentService.deleteStudent(student.id);
        }
      }

      // Delete all attendance records
      if (attendanceResult.success && attendanceResult.data) {
        for (const record of attendanceResult.data) {
          await AttendanceService.deleteAttendance(record.id);
        }
      }

      // Delete all notices
      if (noticesResult.success && noticesResult.data) {
        for (const notice of noticesResult.data) {
          await NoticeService.deleteNotice(notice.id);
        }
      }

      logger.test('✅ All data cleared successfully!');
    } catch (error) {
      logger.error('❌ Error clearing data:', error);
    }
  }
}

// Utility function to check if migration is needed
export const checkMigrationStatus = async (): Promise<boolean> => {
  try {
    const [classesResult, studentsResult] = await Promise.all([
      ClassService.getAllClasses(),
      StudentService.getAllStudents()
    ]);

    const hasClasses = classesResult.success && classesResult.data && classesResult.data.length > 0;
    const hasStudents = studentsResult.success && studentsResult.data && studentsResult.data.length > 0;

    return hasClasses && hasStudents;
  } catch (error) {
    logger.error('Error checking migration status:', error);
    return false;
  }
};
