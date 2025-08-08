import React, { useEffect, useState, useRef, useMemo } from 'react';
import { CalendarIcon, CheckIcon, UserIcon, AlertCircleIcon, ShareIcon, CopyIcon, XIcon, SearchIcon, UsersIcon, UserCheckIcon, UserXIcon, ClipboardCheckIcon } from 'lucide-react';
import { useData } from '../../context/DataContext';
import { useAttendance, useClasses, useStudents } from '../../hooks/useFirebase';
import { AttendanceRecord, Student, Class } from '../../types/database';
import { Permissions } from '../../types';
import SectionLoader from '../SectionLoader';
import { sortAndFilterStudents } from '../../utils/sortingUtils';
// Removed mockClasses import for production
interface AttendanceFormProps {
  onSubmit: (data: any) => void;
  students: Student[];
  classes: ClassSchedule[];
}
const AttendanceForm: React.FC<AttendanceFormProps> = ({
  onSubmit,
  students,
  classes
}) => {
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [subject, setSubject] = useState<string>('');
  const [presentStudents, setPresentStudents] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Extract unique subjects from Firebase classes data only
  const uniqueSubjects = useMemo(() => {
    const subjectSet = new Set<string>();

    // Add subjects from Firebase classes data
    (classes || []).forEach(cls => {
      if (cls.subject) {
        subjectSet.add(cls.subject);
      }
    });

    // Convert to sorted array
    return Array.from(subjectSet).sort();
  }, [classes]);
  const handleToggleStudent = (id: string) => {
    if (presentStudents.includes(id)) {
      setPresentStudents(presentStudents.filter(studentId => studentId !== id));
    } else {
      setPresentStudents([...presentStudents, id]);
    }
  };
  const handleSelectAll = () => {
    setPresentStudents(students.map(student => student.id));
  };
  const handleDeselectAll = () => {
    setPresentStudents([]);
  };
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      date,
      subject,
      presentStudents,
      absentStudents: students.filter(student => !presentStudents.includes(student.id)).map(student => student.id)
    });
    // Reset form
    setSubject('');
    setPresentStudents([]);
    setSearchTerm('');
  };
  // Filter and sort students based on search term and roll number
  const filteredStudents = sortAndFilterStudents(students, searchTerm);
  // Calculate attendance percentage
  const attendancePercentage = Math.round(presentStudents.length / students.length * 100);
  return <div className="neu-card p-4 sm:p-6 mb-8">
      <h3 className="text-lg sm:text-xl font-bold mb-4 sm:mb-5 dark:text-gray-100">
        Record Attendance
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="space-y-4 sm:space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Date
            </label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner" required />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Subject
            </label>
            <select value={subject} onChange={e => setSubject(e.target.value)} className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 neu-shadow-inner" required>
              <option value="">Select Subject</option>
              {uniqueSubjects.map(subj => <option key={subj} value={subj}>
                  {subj}
                </option>)}
            </select>
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Students Present
              </label>
              <div className="flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-lg">
                <div className={`h-2 w-16 rounded-full bg-gray-200 dark:bg-gray-600 overflow-hidden`}>
                  <div className={`h-full ${attendancePercentage > 70 ? 'bg-green-500' : attendancePercentage > 40 ? 'bg-yellow-500' : 'bg-red-500'}`} style={{
                  width: `${attendancePercentage}%`
                }}></div>
                </div>
                <span className="text-xs font-medium text-gray-600 dark:text-gray-300">
                  {presentStudents.length}/{students.length}
                </span>
              </div>
            </div>
            {/* Search and action buttons */}
            <div className="flex flex-col sm:flex-row gap-2 mb-3">
              <div className="relative flex-1">
                <input type="text" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} placeholder="Search by name or roll..." className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 focus:outline-none bg-gray-50 dark:bg-gray-700 text-gray-800 dark:text-gray-200 text-sm neu-shadow-inner" />
                <SearchIcon className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
              </div>
              <div className="flex gap-2">
                <button type="button" onClick={handleSelectAll} className="flex items-center justify-center gap-1 px-3 py-2 bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 rounded-xl text-xs font-medium transition-colors neu-shadow-sm hover:bg-navy-200 dark:hover:bg-navy-700">
                  <UserCheckIcon className="h-3.5 w-3.5" />
                  <span>All</span>
                </button>
                <button type="button" onClick={handleDeselectAll} className="flex items-center justify-center gap-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded-xl text-xs font-medium transition-colors neu-shadow-sm hover:bg-gray-200 dark:hover:bg-gray-700">
                  <UserXIcon className="h-3.5 w-3.5" />
                  <span>None</span>
                </button>
              </div>
            </div>
            <div className="border border-gray-200 dark:border-gray-700 rounded-xl p-2 sm:p-3 max-h-60 overflow-y-auto neu-shadow-inner bg-gray-50 dark:bg-gray-700">
              {filteredStudents.length > 0 ? <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {filteredStudents.map(student => {
                const isPresent = presentStudents.includes(student.id);
                return <div key={student.id} className={`flex items-center p-2 rounded-lg transition-all cursor-pointer ${isPresent ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' : 'bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500 border border-transparent'}`} onClick={() => handleToggleStudent(student.id)}>
                        <div className={`h-8 w-8 sm:h-9 sm:w-9 rounded-full overflow-hidden mr-3 border-2 ${isPresent ? 'border-green-500 dark:border-green-400' : 'border-gray-200 dark:border-gray-500'}`}>
                          <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium dark:text-gray-200 line-clamp-1">
                            {student.name}
                          </p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Roll: {student.roll}
                          </p>
                        </div>
                        <div className={`h-5 w-5 rounded-full flex items-center justify-center ${isPresent ? 'bg-green-500 text-white' : 'bg-gray-200 dark:bg-gray-700'}`}>
                          {isPresent && <CheckIcon className="h-3 w-3" />}
                        </div>
                      </div>;
              })}
                </div> : <div className="flex flex-col items-center justify-center py-6 text-center">
                  <UsersIcon className="h-10 w-10 text-gray-300 dark:text-gray-600 mb-2" />
                  <p className="text-gray-500 dark:text-gray-400 text-sm">
                    No students found matching "{searchTerm}"
                  </p>
                </div>}
            </div>
          </div>
          <button type="submit" className="w-full py-3 sm:py-4 bg-coral-500 hover:bg-coral-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors neu-shadow">
            <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            Confirm Attendance
          </button>
        </div>
      </form>
    </div>;
};
interface AttendanceHistoryModalProps {
  attendanceRecord: AttendanceRecord;
  onClose: () => void;
  students: Student[];
  classes: ClassSchedule[];
}

const AttendanceHistoryModal: React.FC<AttendanceHistoryModalProps> = ({
  attendanceRecord,
  onClose,
  students,
  classes
}) => {
  // Handle ESC key press
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [onClose]);
  // Find teacher name from classes
  const classInfo = classes.find(cls => cls.subject === attendanceRecord.subject);
  const teacherName = classInfo ? classInfo.teacher : 'Not assigned';

  // Format date and time
  const formattedDate = new Date(attendanceRecord.date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const formattedTime = new Date(attendanceRecord.createdAt).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true
  });

  // Get present students from the attendance record
  const presentStudents = students.filter(student =>
    attendanceRecord.presentStudents?.includes(student.id)
  );

  // Handle loading state for students data
  const isLoadingStudents = students.length === 0;

  // Handle case where student data might not be available
  const missingStudentIds = attendanceRecord.presentStudents?.filter(id =>
    !students.find(student => student.id === id)
  ) || [];

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="attendance-modal-title"
      aria-describedby="attendance-modal-description"
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow w-full max-w-2xl max-h-[90vh] overflow-hidden relative animate-fadeIn retro-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
          <button
            onClick={onClose}
            className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full neu-button transition-colors"
            aria-label="Close modal"
          >
            <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
          </button>

          <div className="pr-8">
            <h3
              id="attendance-modal-title"
              className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2"
            >
              Attendance History
            </h3>
            <p
              id="attendance-modal-description"
              className="text-sm text-gray-600 dark:text-gray-400"
            >
              Detailed view of attendance record for {attendanceRecord.subject} on {formattedDate}
            </p>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="p-4 sm:p-6">
            {/* Attendance Details */}
            <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 sm:p-5 mb-6 neu-shadow-inner">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Date:
                  </span>
                  <p className="text-sm sm:text-base font-medium dark:text-gray-200">
                    {formattedDate}
                  </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Time:
                  </span>
                  <p className="text-sm sm:text-base font-medium dark:text-gray-200">
                    {formattedTime}
                  </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Subject:
                  </span>
                  <p className="text-sm sm:text-base font-medium dark:text-gray-200">
                    {attendanceRecord.subject}
                  </p>
                </div>
                <div>
                  <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                    Teacher:
                  </span>
                  <p className="text-sm sm:text-base font-medium dark:text-gray-200">
                    {teacherName}
                  </p>
                </div>
              </div>

              {/* Attendance Stats */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                        {attendanceRecord.presentCount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Present
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                        {attendanceRecord.totalStudents - attendanceRecord.presentCount}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Absent
                      </div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg sm:text-xl font-bold text-gray-900 dark:text-gray-100">
                        {Math.round((attendanceRecord.presentCount / attendanceRecord.totalStudents) * 100)}%
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Rate
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Present Students List */}
            <div>
              <h4 className="font-bold mb-4 text-lg dark:text-gray-200 flex items-center gap-2">
                <UserCheckIcon className="h-5 w-5" />
                Present Students ({presentStudents.length})
              </h4>

              {isLoadingStudents ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-8 neu-shadow-inner text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto mb-3"></div>
                  <p className="text-gray-500 dark:text-gray-400 text-sm">Loading student data...</p>
                </div>
              ) : presentStudents.length > 0 ? (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 neu-shadow-inner">
                  <div className="grid grid-cols-1 gap-3">
                    {presentStudents.map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center p-3 bg-white dark:bg-gray-600 rounded-lg neu-shadow-sm"
                      >
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full overflow-hidden neu-shadow-sm">
                            <img
                              src={student.image}
                              alt={student.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm sm:text-base font-medium dark:text-gray-200">
                              {student.name}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                              <span>Roll: {student.roll}</span>
                              {student.role !== 'Regular' && (
                                <span className="px-2 py-0.5 bg-gray-200 dark:bg-gray-500 text-gray-700 dark:text-gray-200 rounded-full text-xs">
                                  {student.role}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-500 dark:text-gray-400">
                              #{index + 1}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Show note about missing student data if any */}
                  {missingStudentIds.length > 0 && (
                    <div className="mt-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Note: {missingStudentIds.length} student record(s) could not be found in the current database.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                  <UserXIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No students were marked present</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

interface ShareAttendanceModalProps {
  date: string;
  subject: string;
  onClose: () => void;
  absentStudents?: string[];
  students: Student[];
  classes: ClassSchedule[];
}
const ShareAttendanceModal: React.FC<ShareAttendanceModalProps> = ({
  date,
  subject,
  onClose,
  absentStudents = [],
  students,
  classes
}) => {
  const [copied, setCopied] = useState(false);
  const [copyError, setCopyError] = useState<string | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  // Find teacher name from classes
  const classInfo = classes.find(cls => cls.subject === subject);
  const teacherName = classInfo ? classInfo.teacher : 'Not assigned';
  // Format date
  const formattedDate = new Date(date).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  // Get present students (with safety check for absentStudents)
  const presentStudents = students.filter(student => !absentStudents?.includes(student.id));
  // Format attendance text for copying
  const getFormattedText = () => {
    let text = `Attendance Report\n`;
    text += `Date: ${formattedDate}\n`;
    text += `Subject: ${subject}\n`;
    text += `Teacher: ${teacherName}\n\n`;
    text += `Present Students (${presentStudents.length}):\n`;
    presentStudents.forEach((student, index) => {
      text += `${index + 1}. ${student.name} (${student.roll})\n`;
    });
    return text;
  };
  // Fallback copy method for browsers that don't support clipboard API
  const fallbackCopyTextToClipboard = (text: string) => {
    if (!textAreaRef.current) return false;
    const textArea = textAreaRef.current;
    textArea.value = text;
    textArea.focus();
    textArea.select();
    try {
      const successful = document.execCommand('copy');
      return successful;
    } catch (err) {
      return false;
    }
  };
  const handleCopyToClipboard = () => {
    const text = getFormattedText();
    setCopyError(null);
    // Try to use the modern clipboard API first
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }).catch(err => {
        // Failed to copy with Clipboard API, try fallback method
        const success = fallbackCopyTextToClipboard(text);
        if (success) {
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        } else {
          setCopyError('Unable to copy to clipboard. Please try again or copy manually.');
        }
      });
    } else {
      // Fallback for browsers without clipboard API
      const success = fallbackCopyTextToClipboard(text);
      if (success) {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } else {
        setCopyError("Your browser doesn't support automatic copying. Please copy manually.");
      }
    }
  };
  return <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow w-full max-w-lg p-4 sm:p-6 relative animate-fadeIn">
        <button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full neu-button">
          <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <h3 className="text-lg sm:text-xl font-bold mb-3 sm:mb-4 dark:text-gray-100">
          Share Attendance
        </h3>
        <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 sm:p-4 mb-4 neu-shadow-inner">
          <div className="mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Date:
            </span>
            <p className="text-sm sm:text-base font-medium dark:text-gray-200">
              {formattedDate}
            </p>
          </div>
          <div className="mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Subject:
            </span>
            <p className="text-sm sm:text-base font-medium dark:text-gray-200">
              {subject}
            </p>
          </div>
          <div className="mb-2 sm:mb-3">
            <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
              Teacher:
            </span>
            <p className="text-sm sm:text-base font-medium dark:text-gray-200">
              {teacherName}
            </p>
          </div>
        </div>
        <div className="mb-4">
          <h4 className="font-medium mb-2 dark:text-gray-200">
            Present Students ({presentStudents.length})
          </h4>
          <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-3 max-h-40 overflow-y-auto neu-shadow-inner">
            {presentStudents.map(student => <div key={student.id} className="flex items-center py-2 border-b border-gray-100 dark:border-gray-600 last:border-0">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full overflow-hidden mr-2 sm:mr-3">
                  <img src={student.image} alt={student.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <p className="text-xs sm:text-sm font-medium dark:text-gray-200">
                    {student.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Roll: {student.roll}
                  </p>
                </div>
              </div>)}
          </div>
        </div>
        {/* Hidden textarea for fallback copy method */}
        <textarea ref={textAreaRef} className="opacity-0 absolute h-px w-px -z-10" aria-hidden="true" tabIndex={-1} />
        {copyError && <div className="text-red-500 text-xs sm:text-sm mb-3 p-2 bg-red-50 dark:bg-red-900/20 rounded-lg">
            {copyError}
          </div>}
        <button onClick={handleCopyToClipboard} className="w-full py-2.5 sm:py-3 bg-navy-500 hover:bg-navy-600 text-white rounded-xl font-medium flex items-center justify-center gap-2 transition-colors neu-shadow">
          {copied ? <>
              <CheckIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Copied!</span>
            </> : <>
              <CopyIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              <span className="text-sm sm:text-base">Copy to Clipboard</span>
            </>}
        </button>
      </div>
    </div>;
};
interface AttendanceHistoryProps {
  isAdmin: boolean;
  permissions: Permissions;
  attendanceRecords: AttendanceRecord[];
  students: Student[];
  classes: ClassSchedule[];
}

const AttendanceHistory: React.FC<AttendanceHistoryProps> = ({
  isAdmin,
  permissions,
  attendanceRecords,
  students,
  classes
}) => {
  const [shareModalData, setShareModalData] = useState<{
    date: string;
    subject: string;
    absentStudents?: string[];
  } | null>(null);
  const [selectedAttendanceRecord, setSelectedAttendanceRecord] = useState<AttendanceRecord | null>(null);
  // Group attendance records by date
  const groupedAttendance: Record<string, AttendanceRecord[]> = {};
  attendanceRecords.forEach(record => {
    if (!groupedAttendance[record.date]) {
      groupedAttendance[record.date] = [];
    }
    groupedAttendance[record.date].push(record);
  });
  const sortedDates = Object.keys(groupedAttendance).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
  const handleShare = (date: string, subject: string, absentStudents?: string[]) => {
    setShareModalData({
      date,
      subject,
      absentStudents
    });
  };

  // Empty state for attendance history
  if (attendanceRecords.length === 0) {
    return <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold dark:text-gray-100 mb-4">
        Attendance History
      </h3>
      <div className="neu-card p-8 sm:p-12 text-center">
        <div className="bg-retro-yellow/20 dark:bg-retro-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 neu-shadow-sm">
          <ClipboardCheckIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
        </div>
        <h4 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          No Attendance Records Yet
        </h4>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mx-auto">
          {permissions.canRecordAttendance
            ? "Start recording attendance for your classes. Use the form above to mark student attendance."
            : "No attendance records have been created yet. Attendance history will appear here once classes begin."
          }
        </p>
      </div>
    </div>;
  }

  return <div className="space-y-4 sm:space-y-6">
      <h3 className="text-lg sm:text-xl font-bold dark:text-gray-100 mb-4">
        Attendance History
      </h3>
      {sortedDates.map(date => <div key={date} className="neu-card p-4 sm:p-6">
          <div className="flex items-center mb-4 sm:mb-5">
            <div className="bg-navy-50 dark:bg-navy-900/30 p-2 sm:p-3 rounded-xl mr-3 sm:mr-4 neu-shadow-sm">
              <CalendarIcon className="h-5 w-5 sm:h-6 sm:w-6 text-navy-500 dark:text-navy-300" />
            </div>
            <h3 className="text-base sm:text-xl font-bold dark:text-gray-100">
              {new Date(date).toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
            </h3>
          </div>
          <div className="space-y-3 sm:space-y-4">
            {groupedAttendance[date].map((record, idx) => <div
                key={idx}
                className="p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl neu-shadow-inner cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                onClick={() => setSelectedAttendanceRecord(record)}
              >
                <div className="flex justify-between items-center">
                  <h4 className="font-medium text-base sm:text-lg dark:text-gray-200">
                    {record.subject}
                  </h4>
                  <div className="flex items-center gap-2">
                    <span className="text-xs bg-navy-100 dark:bg-navy-800 text-navy-600 dark:text-navy-300 px-2 sm:px-3 py-1 sm:py-1.5 rounded-full neu-shadow-sm">
                      {record.presentCount} present
                    </span>
                    {permissions.canShareAttendance && <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(date, record.subject, record.absentStudents || []);
                        }}
                        className="p-1.5 sm:p-2 bg-coral-50 dark:bg-coral-900/30 text-coral-500 dark:text-coral-400 rounded-full neu-button"
                        title="Share attendance"
                      >
                        <ShareIcon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                      </button>}
                  </div>
                </div>
              </div>)}
          </div>
        </div>)}
      {shareModalData && <ShareAttendanceModal date={shareModalData.date} subject={shareModalData.subject} absentStudents={shareModalData.absentStudents} students={students} classes={classes} onClose={() => setShareModalData(null)} />}
      {selectedAttendanceRecord && <AttendanceHistoryModal attendanceRecord={selectedAttendanceRecord} students={students} classes={classes} onClose={() => setSelectedAttendanceRecord(null)} />}
    </div>;
};
interface AttendanceSectionProps {
  isAdmin: boolean;
  permissions: Permissions;
}

const AttendanceSection: React.FC<AttendanceSectionProps> = ({
  isAdmin,
  permissions
}) => {
  const { attendance: attendanceRecords, loading: attendanceLoading, error: attendanceError, createAttendance } = useAttendance();
  const { students, loading: studentsLoading, error: studentsError } = useStudents();
  const { classes, loading: classesLoading, error: classesError } = useClasses();
  const [showConfirmation, setShowConfirmation] = useState(false);
  const handleSubmitAttendance = async (data: any) => {
    try {
      const attendanceData: Omit<AttendanceRecord, 'id' | 'createdAt' | 'updatedAt'> = {
        date: data.date,
        subject: data.subject,
        presentCount: data.presentStudents.length,
        totalStudents: students.length,
        presentStudents: data.presentStudents,
        absentStudents: data.absentStudents
      };

      const result = await createAttendance(attendanceData);
      if (result.success) {
        setShowConfirmation(true);
        // Hide confirmation after 3 seconds
        setTimeout(() => {
          setShowConfirmation(false);
        }, 3000);
      } else {
        // Failed to create attendance record - error handled silently
      }
    } catch (error) {
      // Error creating attendance record - handled silently
    }
  };

  if (attendanceLoading || studentsLoading || classesLoading) {
    return <div className="space-y-4 sm:space-y-6">
      <SectionLoader
        section="attendance"
        message="Loading attendance records, student data, and class schedules..."
        size="large"
      />
    </div>;
  }

  if (attendanceError || studentsError || classesError) {
    return <div className="space-y-4 sm:space-y-6">
      <div className="flex items-center justify-center py-12">
        <div className="text-lg text-red-600 dark:text-red-400">
          Error loading data: {attendanceError || studentsError || classesError}
        </div>
      </div>
    </div>;
  }

  // Empty state when no students or classes exist
  if (students.length === 0 || classes.length === 0) {
    return <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
        Attendance
      </h2>
      <div className="neu-card p-8 sm:p-12 text-center">
        <div className="bg-retro-yellow/20 dark:bg-retro-blue/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 neu-shadow-sm">
          <ClipboardCheckIcon className="h-10 w-10 text-retro-purple dark:text-retro-teal" />
        </div>
        <h3 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mb-4">
          Setup Required
        </h3>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto">
          {students.length === 0 && classes.length === 0
            ? "You need to add students and classes before recording attendance. Please add them from the respective sections first."
            : students.length === 0
            ? "You need to add students before recording attendance. Please add them from the Classmates section first."
            : "You need to add classes before recording attendance. Please add them from the Routine section first."
          }
        </p>
        <div className="flex flex-wrap gap-3 justify-center">
          {students.length === 0 && (
            <span className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-xl">
              <UsersIcon className="h-4 w-4" />
              Add Students First
            </span>
          )}
          {classes.length === 0 && (
            <span className="inline-flex items-center gap-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-2 px-4 rounded-xl">
              <CalendarIcon className="h-4 w-4" />
              Add Classes First
            </span>
          )}
        </div>
      </div>
    </div>;
  }

  return <div className="space-y-4 sm:space-y-6">
      <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
        Attendance
      </h2>
      {/* Retro styled confirmation message */}
      {showConfirmation && <div className="fixed top-20 sm:top-24 left-1/2 transform -translate-x-1/2 z-50 animate-fadeIn">
          <div className="bg-retro-yellow dark:bg-retro-blue text-black dark:text-white px-4 sm:px-6 py-3 sm:py-4 rounded-xl neu-shadow border-2 border-black dark:border-gray-600 flex items-center gap-3 max-w-sm retro-glitch">
            <div className="bg-white dark:bg-gray-800 p-2 rounded-full neu-shadow-sm">
              <CheckIcon className="h-5 w-5 text-retro-green dark:text-retro-teal" />
            </div>
            <div>
              <p className="font-vhs text-base sm:text-lg tracking-wide">
                SUCCESS!
              </p>
              <p className="font-vhs text-xs sm:text-sm">Attendance recorded</p>
            </div>
          </div>
        </div>}
      {permissions.canRecordAttendance && <AttendanceForm onSubmit={handleSubmitAttendance} students={students} classes={classes} />}
      <AttendanceHistory isAdmin={isAdmin} permissions={permissions} attendanceRecords={attendanceRecords} students={students} classes={classes} />
    </div>;
};
export default AttendanceSection;