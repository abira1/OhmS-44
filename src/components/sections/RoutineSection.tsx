import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { CalendarIcon, ClockIcon, UserIcon, BookIcon, XIcon, PlusIcon, ChevronRightIcon, AlertTriangleIcon, BanIcon } from 'lucide-react';
import { days, timeSlots } from '../../data/mockData';
import { ClassSchedule, TimeRange, DaySchedule } from '../../types';
import { useClasses } from '../../hooks/useFirebase';
import { useAuth } from '../../context/AuthContext';
import { databaseService } from '../../services/databaseService';
import { errorHandler, handleAsyncError } from '../../services/errorHandlingService';
import EnhancedTimePicker from '../ui/EnhancedTimePicker';
import EnhancedDaySelector from '../ui/EnhancedDaySelector';
import TimeZoneSelector from '../ui/TimeZoneSelector';
import SectionLoader from '../SectionLoader';

// Production-ready logging (removed for production)
const safeLog = (message: string, data?: any) => {
  // Logging disabled for production
};

// Enhanced toast notification system with retry functionality
const showToast = (message: string, type: 'success' | 'error' | 'info' | 'warning' = 'info', options?: {
  duration?: number;
  showRetry?: boolean;
  onRetry?: () => void;
}) => {
  const { duration = 3000, showRetry = false, onRetry } = options || {};

  // Create toast element
  const toast = document.createElement('div');
  toast.className = `fixed top-4 right-4 z-50 px-4 py-3 rounded-lg text-white text-sm font-medium transition-all duration-300 transform translate-x-full shadow-lg ${
    type === 'success' ? 'bg-green-500' :
    type === 'error' ? 'bg-red-500' :
    type === 'warning' ? 'bg-yellow-500' :
    'bg-blue-500'
  }`;

  // Create message container
  const messageContainer = document.createElement('div');
  messageContainer.className = 'flex items-center justify-between gap-3';

  const messageText = document.createElement('span');
  messageText.textContent = message;
  messageContainer.appendChild(messageText);

  // Add retry button if needed
  if (showRetry && onRetry) {
    const retryButton = document.createElement('button');
    retryButton.textContent = 'Retry';
    retryButton.className = 'px-2 py-1 bg-white bg-opacity-20 rounded text-xs hover:bg-opacity-30 transition-colors';
    retryButton.onclick = () => {
      onRetry();
      document.body.removeChild(toast);
    };
    messageContainer.appendChild(retryButton);
  }

  toast.appendChild(messageContainer);

  // Add to DOM
  document.body.appendChild(toast);

  // Animate in
  setTimeout(() => toast.style.transform = 'translateX(0)', 10);

  // Remove after specified duration
  setTimeout(() => {
    if (document.body.contains(toast)) {
      toast.style.transform = 'translateX(100%)';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }
  }, duration);
};

// Simple update animation state (moved to component level)
const useUpdateAnimations = () => {
  const [updatingClasses, setUpdatingClasses] = useState<Set<string>>(new Set());

  const triggerUpdate = (classId: string) => {
    setUpdatingClasses(prev => new Set(prev).add(classId));
    setTimeout(() => {
      setUpdatingClasses(prev => {
        const newSet = new Set(prev);
        newSet.delete(classId);
        return newSet;
      });
    }, 1000);
  };

  const isUpdating = (classId: string) => updatingClasses.has(classId);

  return { isUpdating, triggerUpdate };
};

interface SubjectDetailsProps {
  subject: string;
  teacher: string;
  code: string;
  room?: string;
  day?: string;
  time?: string;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const SubjectDetails: React.FC<SubjectDetailsProps> = ({
  subject,
  teacher,
  code,
  room,
  day,
  time,
  onClose,
  onEdit,
  onDelete,
  canEdit = false,
  canDelete = false
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-sm w-full p-4 sm:p-6 relative animate-fadeIn m-2">
        <button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full neu-button">
          <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>
        <div className="mb-5 sm:mb-6 text-center">
          <div className="bg-coral-50 dark:bg-coral-900/30 w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4 neu-shadow-sm">
            <BookIcon className="h-7 w-7 sm:h-8 sm:w-8 text-coral-500 dark:text-coral-400" />
          </div>
          <h3 className="text-lg sm:text-xl font-bold text-gray-800 dark:text-gray-100 mb-1">
            {subject}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 text-sm">{code}</p>
        </div>
        <div className="space-y-3 sm:space-y-4">
          <div className="flex items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl neu-shadow-inner">
            <div>
              <p className="text-xs sm:text-sm font-medium dark:text-gray-200">
                Teacher
              </p>
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                {teacher}
              </p>
            </div>
          </div>
          {room && (
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl neu-shadow-inner">
              <div>
                <p className="text-xs sm:text-sm font-medium dark:text-gray-200">
                  Location
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {room}
                </p>
              </div>
            </div>
          )}
          {day && time && (
            <div className="flex items-center p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl neu-shadow-inner">
              <div>
                <p className="text-xs sm:text-sm font-medium dark:text-gray-200">
                  Schedule
                </p>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                  {day}, {time}
                </p>
              </div>
            </div>
          )}
        </div>
        
        {/* Admin Controls */}
        {(canEdit || canDelete) && (
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="flex gap-2">
              {canEdit && (
                <button
                  onClick={() => {
                    onEdit?.();
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-xl font-medium transition-colors neu-shadow"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                  Edit
                </button>
              )}
              {canDelete && (
                <button
                  onClick={() => {
                    onDelete?.();
                    onClose();
                  }}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded-xl font-medium transition-colors neu-shadow"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface EnhancedSubjectData {
  // Enhanced scheduling
  daySchedule: DaySchedule;
  timeRange: TimeRange;
  timeZone: string;

  // Legacy fields for backward compatibility
  day: string;
  time: string;

  // Class information
  subject: string;
  teacher: string;
  code: string;
  room: string;

  // Additional fields
  description?: string;
  courseType?: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'workshop';
  isOnline?: boolean;
  meetingLink?: string;
  notifyBefore?: number;
}

interface AddSubjectModalProps {
  onClose: () => void;
  onAdd: (subjectData: EnhancedSubjectData) => void;
  initialData?: Partial<EnhancedSubjectData>;
  isEditing?: boolean;
}

const AddSubjectModal: React.FC<AddSubjectModalProps> = ({
  onClose,
  onAdd,
  initialData,
  isEditing = false
}) => {
  // Enhanced form state
  const [formData, setFormData] = useState<EnhancedSubjectData>({
    // Enhanced scheduling
    daySchedule: initialData?.daySchedule || {
      type: 'weekly',
      days: [days[0]]
    },
    timeRange: initialData?.timeRange || {
      startTime: '09:00 AM',
      endTime: '10:30 AM',
      duration: 90
    },
    timeZone: initialData?.timeZone || 'Asia/Dhaka',

    // Legacy fields for backward compatibility
    day: initialData?.day || days[0],
    time: initialData?.time || '09:00 AM - 10:30 AM',

    // Class information
    subject: initialData?.subject || '',
    teacher: initialData?.teacher || '',
    code: initialData?.code || '',
    room: initialData?.room || '',

    // Additional fields
    description: initialData?.description || '',
    courseType: initialData?.courseType || 'lecture',
    isOnline: initialData?.isOnline || false,
    meetingLink: initialData?.meetingLink || '',
    notifyBefore: initialData?.notifyBefore || 15
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [timeFormat, setTimeFormat] = useState<'12h' | '24h'>('12h');
  const [showAdvanced, setShowAdvanced] = useState(false);

  // Validation function
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    // Basic validation
    if (!formData.subject.trim()) {
      errors.subject = 'Subject name is required';
    }
    if (!formData.teacher.trim()) {
      errors.teacher = 'Teacher name is required';
    }
    if (!formData.code.trim()) {
      errors.code = 'Course code is required';
    }
    if (!formData.room.trim()) {
      errors.room = 'Room is required';
    }

    // Day schedule validation
    if (formData.daySchedule.type === 'weekly' && (!formData.daySchedule.days || formData.daySchedule.days.length === 0)) {
      errors.daySchedule = 'At least one day must be selected';
    }
    if (formData.daySchedule.type === 'specific' && (!formData.daySchedule.specificDates || formData.daySchedule.specificDates.length === 0)) {
      errors.daySchedule = 'At least one specific date must be selected';
    }

    // Time range validation
    if (!formData.timeRange.startTime || !formData.timeRange.endTime) {
      errors.timeRange = 'Both start and end times are required';
    }

    // Online class validation
    if (formData.isOnline && !formData.meetingLink?.trim()) {
      errors.meetingLink = 'Meeting link is required for online classes';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      // Convert enhanced data to legacy format for backward compatibility
      const legacyTime = `${formData.timeRange.startTime} - ${formData.timeRange.endTime}`;
      const legacyDay = formData.daySchedule.type === 'weekly' && formData.daySchedule.days
        ? formData.daySchedule.days[0]
        : formData.day;

      const enhancedData: EnhancedSubjectData = {
        ...formData,
        day: legacyDay,
        time: legacyTime
      };

      await onAdd(enhancedData);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle field updates
  const updateField = <K extends keyof EnhancedSubjectData>(field: K, value: EnhancedSubjectData[K]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear validation error for this field
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info before proceeding
      const basicErrors: Record<string, string> = {};
      if (!formData.subject.trim()) basicErrors.subject = 'Subject name is required';
      if (!formData.teacher.trim()) basicErrors.teacher = 'Teacher name is required';
      if (!formData.code.trim()) basicErrors.code = 'Course code is required';

      if (Object.keys(basicErrors).length > 0) {
        setValidationErrors(basicErrors);
        return;
      }
    }
    setCurrentStep(prev => Math.min(prev + 1, 3));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
      <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-2xl w-full p-4 sm:p-6 relative animate-fadeIn m-2 max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full neu-button z-10">
          <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
        </button>

        <div className="mb-5 sm:mb-6 text-center">
          <div className="bg-retro-purple dark:bg-retro-teal p-3 sm:p-4 rounded-full w-14 h-14 sm:w-16 sm:h-16 mx-auto mb-3 sm:mb-4 flex items-center justify-center neu-shadow">
            <BookIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
          </div>
          <h2 className="text-lg xs:text-xl sm:text-2xl font-bold text-gray-800 dark:text-white">
            {isEditing ? 'Edit Subject' : 'Add New Subject'}
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400 mt-0.5">
            {isEditing ? 'Update subject details below' : 'Enter subject details below'}
          </p>

          {/* Step Indicator */}
          <div className="flex justify-center mt-4 space-x-2">
            {[1, 2, 3].map(step => (
              <div
                key={step}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  step === currentStep
                    ? 'bg-retro-purple dark:bg-retro-teal text-white'
                    : step < currentStep
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-400'
                }`}
              >
                {step < currentStep ? '✓' : step}
              </div>
            ))}
          </div>
          <div className="flex justify-center mt-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="mx-2">Basic Info</span>
            <span className="mx-2">Schedule</span>
            <span className="mx-2">Advanced</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Step 1: Basic Information */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Basic Information
              </h3>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Subject Name *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => updateField('subject', e.target.value)}
                  className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner ${
                    validationErrors.subject ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="e.g., Advanced Physics Lab"
                  required
                />
                {validationErrors.subject && (
                  <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.subject}</p>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Teacher Name *
                  </label>
                  <input
                    type="text"
                    value={formData.teacher}
                    onChange={(e) => updateField('teacher', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner ${
                      validationErrors.teacher ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Dr. John Smith"
                    required
                  />
                  {validationErrors.teacher && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.teacher}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Code *
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => updateField('code', e.target.value.toUpperCase())}
                    className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner ${
                      validationErrors.code ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., PHY301"
                    required
                  />
                  {validationErrors.code && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.code}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Room/Location *
                  </label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => updateField('room', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner ${
                      validationErrors.room ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="e.g., Lab 101"
                    required
                  />
                  {validationErrors.room && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.room}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Course Type
                  </label>
                  <select
                    value={formData.courseType}
                    onChange={(e) => updateField('courseType', e.target.value as any)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner"
                  >
                    <option value="lecture">Lecture</option>
                    <option value="lab">Laboratory</option>
                    <option value="tutorial">Tutorial</option>
                    <option value="seminar">Seminar</option>
                    <option value="workshop">Workshop</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description (Optional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => updateField('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner"
                  placeholder="Brief description of the course..."
                />
              </div>
            </div>
          )}

          {/* Step 2: Schedule */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Schedule & Timing
              </h3>

              {/* Time Zone Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Zone
                </label>
                <TimeZoneSelector
                  value={formData.timeZone}
                  onChange={(timezone) => updateField('timeZone', timezone)}
                  showOffset={true}
                  showRegion={false}
                  error={validationErrors.timeZone}
                />
              </div>

              {/* Day Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Days & Recurrence
                </label>
                <EnhancedDaySelector
                  value={formData.daySchedule}
                  onChange={(daySchedule) => updateField('daySchedule', daySchedule)}
                  allowMultiple={true}
                  allowSpecificDates={true}
                  allowCustomPattern={true}
                  error={validationErrors.daySchedule}
                />
              </div>

              {/* Time Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Time Range
                </label>
                <div className="flex items-center gap-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setTimeFormat('12h')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      timeFormat === '12h'
                        ? 'bg-retro-purple dark:bg-retro-teal text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    12-hour
                  </button>
                  <button
                    type="button"
                    onClick={() => setTimeFormat('24h')}
                    className={`px-3 py-1 text-xs rounded-lg transition-colors ${
                      timeFormat === '24h'
                        ? 'bg-retro-purple dark:bg-retro-teal text-white'
                        : 'bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    24-hour
                  </button>
                </div>
                <EnhancedTimePicker
                  value={formData.timeRange}
                  onChange={(timeRange) => updateField('timeRange', timeRange)}
                  format={timeFormat}
                  allowCustomInput={true}
                  showDuration={true}
                  minDuration={30}
                  maxDuration={480}
                  error={validationErrors.timeRange}
                />
              </div>
            </div>
          )}

          {/* Step 3: Advanced Options */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
                Advanced Options
              </h3>

              {/* Online/Offline Toggle */}
              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl">
                <div>
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Online Class
                  </label>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Enable if this is a virtual/online class
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.isOnline}
                    onChange={(e) => updateField('isOnline', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-retro-purple/20 dark:peer-focus:ring-retro-teal/20 rounded-full peer dark:bg-gray-600 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-retro-purple dark:peer-checked:bg-retro-teal"></div>
                </label>
              </div>

              {/* Meeting Link (if online) */}
              {formData.isOnline && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Meeting Link *
                  </label>
                  <input
                    type="url"
                    value={formData.meetingLink}
                    onChange={(e) => updateField('meetingLink', e.target.value)}
                    className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner ${
                      validationErrors.meetingLink ? 'border-red-300 dark:border-red-600' : 'border-gray-300 dark:border-gray-600'
                    }`}
                    placeholder="https://zoom.us/j/..."
                    required
                  />
                  {validationErrors.meetingLink && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{validationErrors.meetingLink}</p>
                  )}
                </div>
              )}



              {/* Notification Settings */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Notify Before (minutes)
                </label>
                <select
                  value={formData.notifyBefore}
                  onChange={(e) => updateField('notifyBefore', parseInt(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner"
                >
                  <option value={5}>5 minutes</option>
                  <option value={10}>10 minutes</option>
                  <option value={15}>15 minutes</option>
                  <option value={30}>30 minutes</option>
                  <option value={60}>1 hour</option>
                </select>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={prevStep}
                className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors neu-shadow"
                disabled={isSubmitting}
              >
                Previous
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors neu-shadow"
              disabled={isSubmitting}
            >
              Cancel
            </button>

            <div className="flex-1"></div>

            {currentStep < 3 ? (
              <button
                type="button"
                onClick={nextStep}
                className="px-6 py-2 text-sm bg-retro-purple dark:bg-retro-teal text-white rounded-xl hover:opacity-90 transition-opacity neu-shadow"
                disabled={isSubmitting}
              >
                Next
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-2 text-sm bg-retro-purple dark:bg-retro-teal text-white rounded-xl hover:opacity-90 transition-opacity neu-shadow disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : (isEditing ? 'Update Subject' : 'Add Subject')}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

interface RoutineSectionProps {}

const RoutineSection: React.FC<RoutineSectionProps> = () => {
  // ALL HOOKS CALLED CONSISTENTLY AT THE TOP - NO CONDITIONAL LOGIC BEFORE HOOKS

  // State hooks
  const [selectedSubjectDetails, setSelectedSubjectDetails] = useState<{
    subject: string;
    teacher: string;
    code: string;
    room?: string;
    day?: string;
    time?: string;
  } | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [editingClass, setEditingClass] = useState<{
    subject: string;
    teacher: string;
    code: string;
    room?: string;
    day?: string;
    time?: string;
  } | null>(null);
  const [classToDelete, setClassToDelete] = useState<{
    subject: string;
    teacher: string;
    code: string;
    room?: string;
    day?: string;
    time?: string;
  } | null>(null);
  const [selectedMobileDay, setSelectedMobileDay] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [classToCancel, setClassToCancel] = useState<ClassSchedule | null>(null);
  const [cancelReason, setCancelReason] = useState('');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [forceUpdate, setForceUpdate] = useState(0);

  // Enhanced state for conflict resolution and error handling
  const [conflictResolution, setConflictResolution] = useState<{
    show: boolean;
    conflictedClass: ClassSchedule | null;
    localChanges: Partial<ClassSchedule> | null;
    remoteChanges: ClassSchedule | null;
  }>({
    show: false,
    conflictedClass: null,
    localChanges: null,
    remoteChanges: null
  });
  const [operationQueue, setOperationQueue] = useState<Array<{
    id: string;
    type: 'create' | 'update' | 'delete';
    data: any;
    retryCount: number;
    timestamp: number;
  }>>([]);
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  // Context hooks
  const { user, permissions } = useAuth();
  const {
    classes: firebaseClasses,
    loading: classesLoading,
    createClass,
    updateClass,
    deleteClass
  } = useClasses();

  // Simple real-time status tracking
  const [realTimeStatus, setRealTimeStatus] = useState({
    isConnected: navigator.onLine,
    lastUpdate: new Date().toISOString(),
    syncInProgress: false,
    error: undefined as string | undefined
  });

  // Animation hooks
  const { isUpdating, triggerUpdate } = useUpdateAnimations();

  // Helper function to convert day name to JavaScript day number (0 = Sunday, 1 = Monday, etc.)
  const getDayNumber = (dayName: string): number => {
    const dayMap: { [key: string]: number } = {
      'Sunday': 0,
      'Monday': 1,
      'Tuesday': 2,
      'Wednesday': 3,
      'Thursday': 4,
      'Friday': 5,
      'Saturday': 6
    };
    return dayMap[dayName] !== undefined ? dayMap[dayName] : 0;
  };

  // Helper function to check if a class is cancelled for today
  const isClassCancelledToday = (classSchedule: ClassSchedule): boolean => {
    const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
    return !!(classSchedule.cancellations && classSchedule.cancellations[today]?.isActive);
  };

  // Helper function to get cancellation reason for today
  const getCancellationReason = (classSchedule: ClassSchedule): string | null => {
    const today = new Date().toISOString().split('T')[0];
    const cancellation = classSchedule.cancellations?.[today];
    return cancellation?.isActive ? cancellation.reason || 'No reason provided' : null;
  };

  // Get today's date info
  const today = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  };
  const todayName = today.toLocaleDateString('en-US', { weekday: 'long' });
  const todayFormatted = today.toLocaleDateString('en-US', options);

  // Use Firebase classes data only (no mock data fallback for production)
  // Time-based functionality - moved before useMemo to avoid hoisting issues
  const parseTimeToMinutes = (timeStr: string): number => {
    const [time, period] = timeStr.split(' ');
    const [hours, minutes] = time.split(':').map(Number);
    let totalMinutes = hours * 60 + minutes;

    if (period === 'PM' && hours !== 12) {
      totalMinutes += 12 * 60;
    } else if (period === 'AM' && hours === 12) {
      totalMinutes = minutes;
    }

    return totalMinutes;
  };

  const allClasses = (firebaseClasses || []).map(cls => {
    // Ensure all required ClassSchedule properties exist
    const fullClass: ClassSchedule & { dayOfWeek: number } = {
      ...cls,
      id: (cls as any).id || `mock-${cls.subject}-${cls.day}-${cls.time}`,
      createdAt: (cls as any).createdAt || Date.now(),
      updatedAt: (cls as any).updatedAt || Date.now(),
      dayOfWeek: getDayNumber(cls.day)
    };
    return fullClass;
  });

  // Generate dynamic time slots from actual class data - only show slots with classes
  const dynamicTimeSlots = useMemo(() => {
    const timeSet = new Set<string>();

    // Only add time slots that actually have classes assigned
    allClasses.forEach(cls => {
      if (cls.time) {
        timeSet.add(cls.time);
      }
    });

    // Convert to sorted array - only includes time slots with actual classes
    return Array.from(timeSet).sort((a, b) => {
      const timeA = parseTimeToMinutes(a.split(' - ')[0]);
      const timeB = parseTimeToMinutes(b.split(' - ')[0]);
      return timeA - timeB;
    });
  }, [allClasses]);

  const todaysClasses = allClasses.filter(cls => cls.day === todayName);
  const selectedDayClasses = allClasses.filter(cls => cls.day === selectedMobileDay);

  // parseTimeToMinutes function moved above to avoid hoisting issues

  const getCurrentAndNextClass = () => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const todayClasses = todaysClasses
      .map(cls => ({
        ...cls,
        startMinutes: parseTimeToMinutes(cls.time.split(' - ')[0]),
        endMinutes: parseTimeToMinutes(cls.time.split(' - ')[1] || cls.time.split(' - ')[0])
      }))
      .sort((a, b) => a.startMinutes - b.startMinutes);

    const currentClass = todayClasses.find(cls =>
      currentMinutes >= cls.startMinutes && currentMinutes <= cls.endMinutes
    );

    const nextClass = todayClasses.find(cls => cls.startMinutes > currentMinutes);

    return { currentClass, nextClass };
  };

  const { currentClass, nextClass } = getCurrentAndNextClass();

  // Initialize selected mobile day to today
  useEffect(() => {
    if (!selectedMobileDay) {
      setSelectedMobileDay(todayName);
    }
  }, [todayName, selectedMobileDay]);

  // Enhanced conflict resolution function
  const handleConflictResolution = useCallback((
    conflictedClass: ClassSchedule,
    localChanges: Partial<ClassSchedule>,
    remoteChanges: ClassSchedule
  ) => {
    setConflictResolution({
      show: true,
      conflictedClass,
      localChanges,
      remoteChanges
    });
  }, []);

  // Resolve conflict by choosing local or remote version
  const resolveConflict = useCallback(async (useLocal: boolean) => {
    if (!conflictResolution.conflictedClass) return;

    try {
      const dataToUse = useLocal
        ? { ...conflictResolution.conflictedClass, ...conflictResolution.localChanges }
        : conflictResolution.remoteChanges!;

      const result = await updateClass(conflictResolution.conflictedClass.id, dataToUse);

      if (result.success) {
        showToast(`Conflict resolved using ${useLocal ? 'local' : 'remote'} changes`, 'success');
        setConflictResolution({
          show: false,
          conflictedClass: null,
          localChanges: null,
          remoteChanges: null
        });
      } else {
        throw new Error(result.error || 'Failed to resolve conflict');
      }
    } catch (error) {
      showToast('Failed to resolve conflict. Please try again.', 'error');
    }
  }, [conflictResolution, updateClass]);

  // Enhanced error handling with retry functionality
  const handleOperationError = useCallback((error: any, operation: () => Promise<any>, operationType: string) => {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('conflict') || errorMessage.includes('version')) {
      showToast('Data conflict detected. Please review changes.', 'warning');
      // Handle conflict resolution here if needed
    } else if (!navigator.onLine) {
      showToast('You are offline. Changes will sync when connection is restored.', 'info');
    } else {
      showToast(`Failed to ${operationType}. Click retry to try again.`, 'error', {
        showRetry: true,
        onRetry: operation,
        duration: 5000
      });
    }
  }, []);

  // Track real-time updates and show notifications
  useEffect(() => {
    if (firebaseClasses && firebaseClasses.length > 0 && !classesLoading) {
      // Update real-time status
      setRealTimeStatus(prev => ({
        ...prev,
        lastUpdate: new Date().toISOString(),
        syncInProgress: false
      }));

      // Check if this is not the initial load
      const hasInitialLoad = sessionStorage.getItem('routineInitialLoad');
      if (hasInitialLoad) {
        const timeSinceLastSync = Date.now() - lastSyncTime;
        if (timeSinceLastSync > 5000) { // Only show if more than 5 seconds since last sync
          showToast('Schedule updated', 'info');
          setLastSyncTime(Date.now());
        }
      } else {
        sessionStorage.setItem('routineInitialLoad', 'true');
        setLastSyncTime(Date.now());
      }
    }
  }, [firebaseClasses, classesLoading, lastSyncTime]);

  // Enhanced connection status monitoring
  useEffect(() => {
    if (realTimeStatus.error) {
      if (realTimeStatus.error.includes('permission') || realTimeStatus.error.includes('auth')) {
        showToast('Authentication error. Please refresh the page.', 'error', { duration: 5000 });
      } else if (realTimeStatus.error.includes('network') || realTimeStatus.error.includes('connection')) {
        showToast('Connection lost. Retrying...', 'warning');
      } else {
        showToast(`Connection error: ${realTimeStatus.error}`, 'error', {
          showRetry: true,
          onRetry: () => window.location.reload(),
          duration: 5000
        });
      }
    }
  }, [realTimeStatus.error]);

  // Removed pending operations tracking for simplified implementation

  // Update current time every minute
  useEffect(() => {
    const updateCurrentTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });
      setCurrentTime(timeString);
      setForceUpdate(prev => prev + 1);
    };

    updateCurrentTime();
    const interval = setInterval(updateCurrentTime, 60000);

    return () => clearInterval(interval);
  }, []);

  // Show loading state while Firebase classes are being loaded
  if (classesLoading) {
    return <SectionLoader section="routine" message="Loading class schedule..." />;
  }

  // Enhanced handle adding a new subject with comprehensive error handling
  const handleAddSubject = async (subjectData: EnhancedSubjectData) => {
    const operation = async () => {
      // Check for scheduling conflicts using legacy fields for backward compatibility
      const existingClass = allClasses.find(cls =>
        cls.day === subjectData.day &&
        cls.time === subjectData.time
      );

      if (existingClass) {
        showToast(`Time slot conflict: ${existingClass.subject} is already scheduled at ${subjectData.time} on ${subjectData.day}`, 'warning');
        return;
      }

      // Create enhanced class data with both new and legacy fields
      const classData: Omit<ClassSchedule, 'id' | 'createdAt' | 'updatedAt'> = {
        // Legacy fields for backward compatibility
        day: subjectData.day,
        time: subjectData.time,

        // Enhanced fields
        daySchedule: subjectData.daySchedule,
        timeRange: subjectData.timeRange,
        timeZone: subjectData.timeZone,

        // Basic class information
        subject: subjectData.subject,
        teacher: subjectData.teacher,
        code: subjectData.code,
        room: subjectData.room,

        // Additional enhanced features
        description: subjectData.description,
        courseType: subjectData.courseType,
        isOnline: subjectData.isOnline,
        meetingLink: subjectData.meetingLink,
        notifyBefore: subjectData.notifyBefore,
        isRecurring: subjectData.daySchedule?.type !== 'weekly' || (subjectData.daySchedule?.days && subjectData.daySchedule.days.length > 1),
        isActive: true
      };

      const result = await createClass(classData);
      if (result.success) {
        safeLog('Class created successfully:', result.data);
        showToast(`${subjectData.subject} added successfully`, 'success');
        setShowAddModal(false);
        triggerUpdate(result.data!.id);
        return result.data;
      } else {
        throw new Error(result.error || 'Failed to create class');
      }
    };

    try {
      await handleAsyncError(
        operation,
        {
          component: 'RoutineSection',
          operation: 'createClass',
          userId: user?.email,
          additionalData: subjectData
        }
      );
    } catch (error) {
      const errorReport = errorHandler.handleDatabaseError(
        error instanceof Error ? error : new Error(String(error)),
        'createClass',
        subjectData
      );

      if (errorReport.retryable) {
        showToast('Failed to add class. Click retry to try again.', 'error', {
          showRetry: true,
          onRetry: () => handleAddSubject(subjectData),
          duration: 5000
        });
      } else {
        showToast(`Failed to add class: ${errorReport.error.message}`, 'error');
      }
    }
  };

  // Handle editing a class
  const handleEditClass = (classData: {
    subject: string;
    teacher: string;
    code: string;
    room?: string;
    day?: string;
    time?: string;
  }) => {
    if (!permissions.canEditClasses) return;
    setEditingClass(classData);
    setShowEditModal(true);
  };

  // Handle deleting a class
  const handleDeleteClass = (classData: {
    subject: string;
    teacher: string;
    code: string;
    room?: string;
    day?: string;
    time?: string;
  }) => {
    if (!permissions.canDeleteClasses) return;
    setClassToDelete(classData);
    setShowDeleteConfirm(true);
  };

  // Enhanced process the deletion with better error handling
  const processClassDeletion = async () => {
    if (!classToDelete || !user || !firebaseClasses) return;

    const operation = async () => {
      try {
        const classToDeleteFromFirebase = firebaseClasses.find(cls =>
          cls.subject === classToDelete.subject &&
          cls.code === classToDelete.code &&
          cls.day === classToDelete.day &&
          cls.time === classToDelete.time
        );

        if (!classToDeleteFromFirebase) {
          showToast('Class not found. It may have already been deleted.', 'warning');
          setShowDeleteConfirm(false);
          setClassToDelete(null);
          return;
        }

        // Check if class has any dependencies (like attendance records, etc.)
        // Currently no dependency checking implemented
        const hasDependencies = false;

        if (hasDependencies) {
          showToast('Cannot delete class with existing attendance records. Archive instead?', 'warning');
          return;
        }

        const result = await deleteClass(classToDeleteFromFirebase.id);
        if (result.success) {
          safeLog('Class deleted successfully');
          showToast(`${classToDelete.subject} deleted successfully`, 'success');
          setShowDeleteConfirm(false);
          setClassToDelete(null);

          // Create a notice about the deletion
          try {
            const noticeData = {
              title: `Class Removed: ${classToDelete.subject}`,
              content: `${classToDelete.subject} (${classToDelete.code}) scheduled for ${classToDelete.time} on ${classToDelete.day} has been removed from the schedule.\n\nRemoved by: ${user?.email || 'Admin'}`,
              category: 'schedule' as const,
              priority: 'medium' as const,
              isActive: true,
              createdBy: user?.email || 'admin',
              targetAudience: 'all' as const,
              likeCount: 0,
              commentCount: 0
            };

            await databaseService.createNotice(noticeData);
            safeLog('Deletion notice created successfully');
          } catch (noticeError) {
            // Don't fail the deletion if notice creation fails
            // Error is handled silently in production
          }
        } else {
          throw new Error(result.error || 'Failed to delete class');
        }
      } catch (error) {
        safeLog('Error deleting class:', error);
        handleOperationError(error, operation, 'delete class');
      }
    };

    await operation();
  };

  // Enhanced handle editing form submission with conflict resolution
  const handleEditSubmit = async (editedData: EnhancedSubjectData) => {
    const operation = async () => {
      try {
        if (!editingClass || !firebaseClasses) return;

        const classToEdit = firebaseClasses.find(cls =>
          cls.subject === editingClass.subject &&
          cls.code === editingClass.code &&
          cls.day === editingClass.day &&
          cls.time === editingClass.time
        );

        if (!classToEdit) {
          showToast('Class not found. It may have been deleted by another user.', 'warning');
          setShowEditModal(false);
          setEditingClass(null);
          return;
        }

        // Check for scheduling conflicts (excluding current class)
        const conflictingClass = allClasses.find(cls =>
          cls.id !== classToEdit.id &&
          cls.day === editedData.day &&
          cls.time === editedData.time
        );

        if (conflictingClass) {
          showToast(`Time slot conflict: ${conflictingClass.subject} is already scheduled at ${editedData.time} on ${editedData.day}`, 'warning');
          return;
        }

        const updates = {
          day: editedData.day,
          time: editedData.time,
          subject: editedData.subject,
          teacher: editedData.teacher,
          code: editedData.code,
          room: editedData.room,
          modifiedBy: user?.email || 'unknown'
        };

        const result = await updateClass(classToEdit.id, updates);

        if (result.success) {
          safeLog('Class updated successfully');
          showToast(`${editedData.subject} updated successfully`, 'success');
          setShowEditModal(false);
          setEditingClass(null);
          triggerUpdate(classToEdit.id);
        } else {
          throw new Error(result.error || 'Failed to update class');
        }
      } catch (error) {
        safeLog('Error updating class:', error);

        // Handle version conflicts specifically
        if (error instanceof Error && error.message.includes('conflict')) {
          // Get the latest version of the class for conflict resolution
          const latestClass = firebaseClasses.find(cls => cls.id === editingClass?.subject);
          if (latestClass) {
            handleConflictResolution(latestClass, editedData, latestClass);
          }
        } else {
          handleOperationError(error, operation, 'update class');
        }
      }
    };

    await operation();
  };

  // Handle opening cancel modal
  const handleCancelClass = (classData: ClassSchedule) => {
    if (!permissions.canCreateClasses) return;
    setClassToCancel(classData);
    setShowCancelModal(true);
    setCancelReason('');
  };

  // Handle confirming class cancellation
  const handleConfirmCancellation = async () => {
    if (!classToCancel) return;

    try {
      // Create cancellation record for today
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
      const cancellationData = {
        id: `cancel-${classToCancel.id}-${today}`,
        classId: classToCancel.id,
        date: today,
        reason: cancelReason || 'No reason provided',
        cancelledBy: user?.email || 'admin',
        cancelledAt: Date.now(),
        isActive: true
      };

      // Update the class with cancellation info using real-time update
      const updatedClass = {
        ...classToCancel,
        cancellations: {
          ...classToCancel.cancellations,
          [today]: cancellationData
        }
      };

      // Use the real-time updateClass function
      const result = await updateClass(classToCancel.id, updatedClass);

      if (result.success) {
        // Create a notice for the class cancellation
        try {
          const noticeData = {
            title: `Class Cancelled: ${classToCancel.subject}`,
            content: `${classToCancel.subject} scheduled for ${classToCancel.time} in ${classToCancel.room} has been cancelled.\n\nReason: ${cancelReason || 'No reason provided'}\n\nCancelled by: ${user?.email || 'Admin'}`,
            category: 'schedule' as const,
            priority: 'high' as const,
            isActive: true,
            createdBy: user?.email || 'admin',
            targetAudience: 'all' as const,
            likeCount: 0,
            commentCount: 0
          };

          await databaseService.createNotice(noticeData);
          safeLog('Cancellation notice created successfully');
        } catch (noticeError) {
          // Don't fail the cancellation if notice creation fails
          // Error is handled silently in production
        }

        // Close modal and reset state
        setShowCancelModal(false);
        setClassToCancel(null);
        setCancelReason('');

        // Show success notification
        showToast(`${classToCancel.subject} has been cancelled and notice posted`, 'success');

        safeLog('Class cancelled successfully:', cancellationData);
      } else {
        throw new Error(result.error || 'Failed to cancel class');
      }
    } catch (error) {
      // Error handled with user-friendly message
      showToast('Failed to cancel class. Please try again.', 'error');
    }
  };

  // Handle closing cancel modal
  const handleCloseCancelModal = () => {
    setShowCancelModal(false);
    setClassToCancel(null);
    setCancelReason('');
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <h2 className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100">
            Class Routine
          </h2>
          {/* Enhanced Real-time Status Indicator */}
          <div className="flex items-center gap-2 text-xs">
            <div className={`w-2 h-2 rounded-full transition-all duration-300 ${
              realTimeStatus.isConnected ? 'bg-green-400 shadow-green-400/50 shadow-sm' : 'bg-red-400 shadow-red-400/50 shadow-sm'
            } ${realTimeStatus.syncInProgress ? 'animate-pulse scale-110' : ''}`} />
            <span className="text-gray-500 dark:text-gray-400 font-medium">
              {realTimeStatus.syncInProgress ? 'Syncing...' :
               realTimeStatus.isConnected ? 'Live' : 'Offline'}
            </span>
            {/* Pending operations indicator removed for simplified implementation */}
            {realTimeStatus.error && (
              <span className="px-2 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 rounded-full text-xs font-medium">
                Error
              </span>
            )}
          </div>
        </div>
        {permissions.canCreateClasses && (
          <button
            onClick={() => setShowAddModal(true)}
            className="retro-btn bg-retro-yellow dark:bg-retro-blue text-black dark:text-white flex items-center gap-2"
          >
            <PlusIcon className="h-4 w-4" />
            Add Subject
          </button>
        )}
      </div>

      {/* Top Row: TODAY Card + Next Class Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* TODAY Card */}
        <div className="neu-card p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:bg-gray-800 dark:bg-none">
          <div className="flex items-center">
            <div className="bg-retro-purple dark:bg-retro-teal p-3 rounded-xl mr-4 neu-shadow-sm">
              <CalendarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-bold mb-1 text-purple-800 dark:text-white">TODAY</h3>
              <p className="text-purple-600 dark:text-blue-100 text-lg font-medium">
                {todayFormatted}
              </p>
            </div>
          </div>
        </div>

        {/* Current/Next Class Card */}
        <div className="neu-card p-6 bg-gradient-to-br from-orange-50 to-red-50 dark:bg-gray-800 dark:bg-none">
          <div className="flex items-center mb-4">
            <div className="bg-retro-coral dark:bg-retro-yellow p-3 rounded-xl mr-4 neu-shadow-sm">
              <ClockIcon className="h-6 w-6 text-white dark:text-black" />
            </div>
            <h3 className="text-lg font-bold text-orange-800 dark:text-white">
              {currentClass ? 'Current Class' : 'Next Class'}
            </h3>
          </div>

          {(currentClass || nextClass) ? (
            <div className="space-y-3">
              {(() => {
                const displayClass = currentClass || nextClass;
                const isCancelled = displayClass ? isClassCancelledToday(displayClass) : false;
                const cancellationReason = displayClass ? getCancellationReason(displayClass) : null;

                return (
                  <div
                    className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                      isCancelled
                        ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 opacity-75'
                        : currentClass
                        ? 'bg-green-50 dark:bg-green-900/30 border-2 border-green-200 dark:border-green-700 hover:bg-green-100 dark:hover:bg-green-900/50'
                        : 'bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600'
                    } neu-shadow-inner`}
                onClick={() => {
                  const classToShow = currentClass || nextClass;
                  if (classToShow) {
                    if (currentClass && permissions.canCreateClasses) {
                      // Show cancel modal for current class
                      handleCancelClass(currentClass);
                    } else {
                      setSelectedSubjectDetails(classToShow);
                    }
                  }
                }}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-lg text-orange-800 dark:text-white">
                    {(currentClass || nextClass)?.subject}
                  </h4>
                  <div className="flex items-center gap-2">
                    {currentClass && (
                      <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                        Now
                      </span>
                    )}
                    {!currentClass && nextClass && (
                      <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                        Upcoming
                      </span>
                    )}
                  </div>
                </div>
                <p className="text-orange-600 dark:text-gray-300 text-sm mb-2 font-medium">
                  {(currentClass || nextClass)?.time} • {(currentClass || nextClass)?.room}
                </p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center text-orange-500 dark:text-gray-400 text-sm">
                    <UserIcon className="h-4 w-4 mr-2" />
                    {(currentClass || nextClass)?.teacher}
                  </div>
                  {currentClass && permissions.canCreateClasses && (
                    <span className="text-red-600 dark:text-red-400 text-xs font-medium">
                      Click to cancel
                    </span>
                  )}
                </div>
                {isCancelled && cancellationReason && (
                  <div className="mt-3 p-2 bg-red-100 dark:bg-red-900/50 rounded-lg">
                    <p className="text-red-700 dark:text-red-300 text-xs">
                      <span className="font-medium">Cancelled:</span> {cancellationReason}
                    </p>
                  </div>
                )}
              </div>
                );
              })()}
            </div>
          ) : (
            <div className="text-center py-4">
              <div className="bg-gray-100 dark:bg-gray-700 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3 neu-shadow-inner">
                <ClockIcon className="h-6 w-6 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400">No upcoming classes today</p>
            </div>
          )}
        </div>
      </div>

      {/* Today's Classes Section */}
      <div className="neu-card p-6 bg-gradient-to-br from-indigo-50 to-blue-50 dark:bg-gray-800 dark:bg-none">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-retro-navy dark:bg-retro-purple p-3 rounded-xl mr-4 neu-shadow-sm">
              <CalendarIcon className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-indigo-800 dark:text-white">Today's Classes</h3>
          </div>
          <div className="text-indigo-600 dark:text-gray-400 text-sm font-medium">
            {todaysClasses.length} classes
          </div>
        </div>

        {todaysClasses.length > 0 ? (
          <div className="space-y-3">
            {todaysClasses.map((cls, index) => {
              const isCurrentClass = currentClass && currentClass.subject === cls.subject && currentClass.time === cls.time;
              const isNextClass = nextClass && nextClass.subject === cls.subject && nextClass.time === cls.time;
              const isClassUpdating = isUpdating(cls.id);
              const isCancelled = isClassCancelledToday(cls);
              const cancellationReason = getCancellationReason(cls);

              return (
                <div
                  key={index}
                  className={`p-4 rounded-xl cursor-pointer transition-all duration-200 ${
                    isCancelled
                      ? 'bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-700 opacity-75'
                      : isCurrentClass
                      ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 neu-shadow-sm'
                      : isNextClass
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 neu-shadow-sm'
                      : 'bg-white dark:bg-gray-700 hover:bg-indigo-50 dark:hover:bg-gray-600 neu-shadow-inner border border-indigo-100 dark:border-gray-600'
                  } ${isClassUpdating ? 'animate-pulse ring-2 ring-blue-300 dark:ring-blue-600' : ''}`}
                  onClick={() => {
                    if (isCurrentClass && permissions.canCreateClasses) {
                      // Show cancel modal for current class
                      handleCancelClass(cls);
                    } else {
                      setSelectedSubjectDetails(cls);
                    }
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-indigo-100 dark:bg-gray-600 p-2 rounded-lg mr-4 neu-shadow-inner">
                        <ClockIcon className="h-5 w-5 text-indigo-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h4 className="font-bold text-lg text-indigo-800 dark:text-white">
                            {cls.subject}
                          </h4>
                          {isCurrentClass && (
                            <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                              Now
                            </span>
                          )}
                          {isNextClass && (
                            <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                              Next
                            </span>
                          )}
                          {isCancelled && (
                            <span className="px-2 py-1 bg-red-500 text-white text-xs font-medium rounded-full shadow-sm">
                              Cancelled
                            </span>
                          )}
                        </div>
                        <p className={`text-sm font-medium ${isCancelled ? 'line-through text-gray-400' : 'text-indigo-600 dark:text-gray-300'}`}>
                          {cls.time} • {cls.room}
                        </p>
                        {isCancelled && cancellationReason && (
                          <p className="text-red-600 dark:text-red-400 text-xs mt-1">
                            Reason: {cancellationReason}
                          </p>
                        )}
                        {isCurrentClass && permissions.canCreateClasses && !isCancelled && (
                          <p className="text-red-600 dark:text-red-400 text-xs mt-1 font-medium">
                            Click to cancel
                          </p>
                        )}
                      </div>
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neu-shadow-inner">
              <CalendarIcon className="h-8 w-8 text-gray-400" />
            </div>
            <p className="text-gray-500 dark:text-gray-400 mb-2">No classes today</p>
            <p className="text-gray-400 dark:text-gray-500 text-sm">Enjoy your free day! 🎉</p>
          </div>
        )}
      </div>

      {/* Weekly Routine - Desktop Table (768px and above) */}
      <div className="hidden md:block neu-card p-6 bg-gradient-to-br from-slate-50 to-gray-50 dark:bg-gray-800 dark:bg-none">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">Weekly Routine</h3>
          {permissions.canCreateClasses && (
            <button
              onClick={() => setShowAddModal(true)}
              className="retro-btn bg-retro-yellow dark:bg-retro-blue text-black dark:text-white flex items-center gap-2"
            >
              <PlusIcon className="h-4 w-4" />
              Add Class
            </button>
          )}
        </div>

        {/* Desktop Routine Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm font-medium text-slate-600 dark:text-gray-400 border-b border-slate-200 dark:border-gray-700">
                  Time
                </th>
                {days.map(day => (
                  <th
                    key={day}
                    className={`p-3 text-center text-sm font-medium border-b border-slate-200 dark:border-gray-700 ${
                      day === todayName
                        ? 'text-purple-700 dark:text-retro-teal bg-purple-100 dark:bg-retro-teal/5'
                        : 'text-slate-600 dark:text-gray-400'
                    }`}
                  >
                    {day === todayName && (
                      <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
                    )}
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dynamicTimeSlots.length === 0 ? (
                <tr>
                  <td colSpan={days.length + 1} className="p-8 text-center text-gray-500 dark:text-gray-400">
                    <div className="flex flex-col items-center">
                      <CalendarIcon className="h-12 w-12 mb-3 opacity-50" />
                      <p className="text-lg font-medium mb-2">No classes scheduled</p>
                      <p className="text-sm">Add your first subject to see the weekly routine</p>
                      {permissions.canCreateClasses && (
                        <button
                          onClick={() => setShowAddModal(true)}
                          className="mt-4 px-4 py-2 bg-retro-purple dark:bg-retro-teal text-white rounded-lg hover:opacity-90 transition-opacity text-sm"
                        >
                          Add Subject
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                dynamicTimeSlots.map((timeSlot) => (
                <tr key={timeSlot} className="border-b border-slate-100 dark:border-gray-800">
                  <td className="p-3 text-sm font-medium text-slate-700 dark:text-gray-400 whitespace-nowrap">
                    {timeSlot}
                  </td>
                  {days.map(day => {
                    const classForSlot = allClasses.find(cls => cls.day === day && cls.time === timeSlot);
                    const isToday = day === todayName;
                    const isCurrentSlot = isToday && currentClass && currentClass.time === timeSlot;
                    const isNextSlot = isToday && nextClass && nextClass.time === timeSlot;

                    return (
                      <td
                        key={`${day}-${timeSlot}`}
                        className={`p-2 text-center ${
                          isToday ? 'bg-purple-50 dark:bg-retro-teal/5' : ''
                        }`}
                      >
                        {classForSlot ? (
                          <div
                            className={`p-3 rounded-lg cursor-pointer transition-all duration-200 text-sm ${
                              isCurrentSlot
                                ? 'bg-green-200 dark:bg-green-900/50 border-2 border-green-400 dark:border-green-600 text-green-800 dark:text-green-200 neu-shadow-sm'
                                : isNextSlot
                                ? 'bg-blue-200 dark:bg-blue-900/50 border-2 border-blue-400 dark:border-blue-600 text-blue-800 dark:text-blue-200 neu-shadow-sm'
                                : 'bg-white dark:bg-gray-700 hover:bg-slate-100 dark:hover:bg-gray-600 text-slate-700 dark:text-gray-300 neu-shadow-inner border border-slate-200 dark:border-gray-600'
                            }`}
                            onClick={() => {
                              if (isCurrentSlot && permissions.canCreateClasses) {
                                // Show cancel modal for current class
                                handleCancelClass(classForSlot);
                              } else {
                                setSelectedSubjectDetails(classForSlot);
                              }
                            }}
                          >
                            <div className="font-medium mb-1">
                              {classForSlot.subject}
                            </div>
                            <div className="text-xs opacity-75">
                              {classForSlot.teacher}
                            </div>
                            <div className="text-xs opacity-60 mt-1">
                              {classForSlot.room}
                            </div>
                            {isCurrentSlot && (
                              <div className="text-xs font-medium text-green-600 dark:text-green-400 mt-1">
                                NOW
                              </div>
                            )}
                            {isNextSlot && (
                              <div className="text-xs font-medium text-blue-600 dark:text-blue-400 mt-1">
                                NEXT
                              </div>
                            )}
                            {isCurrentSlot && permissions.canCreateClasses && (
                              <div className="text-xs text-red-500 dark:text-red-400 mt-1">
                                Click to cancel
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className="p-3 text-gray-400 dark:text-gray-600 text-sm">
                            -
                          </div>
                        )}
                      </td>
                    );
                  })}
                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Day Selector and Classes (below 768px) */}
      <div className="block md:hidden neu-card p-4 bg-gradient-to-br from-violet-50 to-purple-50 dark:bg-gray-800 dark:bg-none">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-violet-800 dark:text-white">Weekly Routine</h3>
          {permissions.canCreateClasses && (
            <button
              onClick={() => setShowAddModal(true)}
              className="retro-btn bg-retro-yellow dark:bg-retro-blue text-black dark:text-white flex items-center gap-2 text-sm"
            >
              <PlusIcon className="h-4 w-4" />
              Add
            </button>
          )}
        </div>

        {/* Mobile Day Selector Tabs */}
        <div className="flex overflow-x-auto gap-2 mb-4 pb-2">
          {days.map(day => (
            <button
              key={day}
              onClick={() => setSelectedMobileDay(day)}
              className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-touch ${
                selectedMobileDay === day
                  ? 'bg-retro-purple dark:bg-retro-teal text-white shadow-md'
                  : 'bg-white dark:bg-gray-700 text-violet-700 dark:text-gray-300 hover:bg-violet-100 dark:hover:bg-gray-600 border border-violet-200 dark:border-gray-600'
              }`}
            >
              {day === todayName && (
                <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              )}
              {day}
            </button>
          ))}
        </div>

        {/* Mobile Classes List for Selected Day */}
        <div className="space-y-3">
          {selectedDayClasses.length > 0 ? (
            selectedDayClasses.map((cls, index) => {
              const isCurrentClass = selectedMobileDay === todayName && currentClass && currentClass.subject === cls.subject && currentClass.time === cls.time;
              const isNextClass = selectedMobileDay === todayName && nextClass && nextClass.subject === cls.subject && nextClass.time === cls.time;

              return (
                <div
                  key={index}
                  className={`p-4 rounded-lg cursor-pointer transition-all duration-200 min-h-touch ${
                    isCurrentClass
                      ? 'bg-green-100 dark:bg-green-900/30 border-2 border-green-300 dark:border-green-700 neu-shadow-sm'
                      : isNextClass
                      ? 'bg-blue-100 dark:bg-blue-900/30 border-2 border-blue-300 dark:border-blue-700 neu-shadow-sm'
                      : 'bg-white dark:bg-gray-700 hover:bg-violet-50 dark:hover:bg-gray-600 neu-shadow-inner border border-violet-200 dark:border-gray-600'
                  }`}
                  onClick={() => {
                    if (isCurrentClass && permissions.canCreateClasses) {
                      // Show cancel modal for current class
                      handleCancelClass(cls);
                    } else {
                      setSelectedSubjectDetails(cls);
                    }
                  }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-bold text-lg text-violet-800 dark:text-white">
                          {cls.subject}
                        </h4>
                        {isCurrentClass && (
                          <span className="px-2 py-1 bg-green-500 text-white text-xs font-medium rounded-full shadow-sm">
                            NOW
                          </span>
                        )}
                        {isNextClass && (
                          <span className="px-2 py-1 bg-blue-500 text-white text-xs font-medium rounded-full shadow-sm">
                            NEXT
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-violet-600 dark:text-gray-300 mb-1 font-medium">
                        {cls.time}
                      </p>
                      <p className="text-sm text-violet-600 dark:text-gray-300 mb-1">
                        {cls.teacher}
                      </p>
                      <p className="text-sm text-violet-500 dark:text-gray-400">
                        {cls.room}
                      </p>
                      {isCurrentClass && permissions.canCreateClasses && (
                        <p className="text-red-600 dark:text-red-400 text-xs mt-2 font-medium">
                          Click to cancel
                        </p>
                      )}
                    </div>
                    <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8">
              <div className="bg-gray-100 dark:bg-gray-700 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neu-shadow-inner">
                <CalendarIcon className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-gray-500 dark:text-gray-400 mb-2">No classes on {selectedMobileDay}</p>
              <p className="text-gray-400 dark:text-gray-500 text-sm">Free day! 🎉</p>
            </div>
          )}
        </div>
      </div>

      {/* Subject Details Modal */}
      {selectedSubjectDetails && (
        <SubjectDetails
          subject={selectedSubjectDetails.subject}
          teacher={selectedSubjectDetails.teacher}
          code={selectedSubjectDetails.code}
          room={selectedSubjectDetails.room}
          day={selectedSubjectDetails.day}
          time={selectedSubjectDetails.time}
          onClose={() => setSelectedSubjectDetails(null)}
          onEdit={() => handleEditClass(selectedSubjectDetails)}
          onDelete={() => handleDeleteClass(selectedSubjectDetails)}
          canEdit={permissions.canEditClasses}
          canDelete={permissions.canDeleteClasses}
        />
      )}

      {/* Add Subject Modal */}
      {permissions.canCreateClasses && showAddModal && (
        <AddSubjectModal
          onClose={() => setShowAddModal(false)}
          onAdd={handleAddSubject}
        />
      )}

      {/* Edit Class Modal */}
      {permissions.canEditClasses && showEditModal && editingClass && (
        <AddSubjectModal
          onClose={() => {
            setShowEditModal(false);
            setEditingClass(null);
          }}
          onAdd={handleEditSubmit}
          initialData={{
            // Legacy fields
            day: editingClass.day || days[0],
            time: editingClass.time || '09:00 AM - 10:30 AM',

            // Enhanced fields with fallbacks
            daySchedule: editingClass.daySchedule || {
              type: 'weekly',
              days: [editingClass.day || days[0]]
            },
            timeRange: editingClass.timeRange || {
              startTime: editingClass.time?.split(' - ')[0] || '09:00 AM',
              endTime: editingClass.time?.split(' - ')[1] || '10:30 AM',
              duration: 90
            },
            timeZone: editingClass.timeZone || 'Asia/Dhaka',

            // Basic information
            subject: editingClass.subject,
            teacher: editingClass.teacher,
            code: editingClass.code,
            room: editingClass.room || '',

            // Enhanced features with defaults
            description: editingClass.description || '',
            courseType: editingClass.courseType || 'lecture',
            isOnline: editingClass.isOnline || false,
            meetingLink: editingClass.meetingLink || '',
            notifyBefore: editingClass.notifyBefore || 15
          }}
          isEditing={true}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && classToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-md w-full p-4 sm:p-6 relative animate-fadeIn m-2">
            <div className="text-center mb-6">
              <div className="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neu-shadow-sm">
                <AlertTriangleIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Delete Class
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to delete this class from the routine?
              </p>
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-4">
                <p className="font-medium text-gray-800 dark:text-gray-200">{classToDelete.subject}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{classToDelete.code}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">{classToDelete.day}, {classToDelete.time}</p>
              </div>
              <p className="text-sm text-red-600 dark:text-red-400">
                This action cannot be undone.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setClassToDelete(null);
                }}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors neu-button"
              >
                Cancel
              </button>
              <button
                onClick={processClassDeletion}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors neu-shadow"
              >
                Delete Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Class Modal */}
      {showCancelModal && classToCancel && (
        <div className="fixed inset-0 bg-black bg-opacity-30 dark:bg-black dark:bg-opacity-50 flex items-center justify-center z-50 p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-md w-full p-4 sm:p-6 relative animate-fadeIn m-2">
            <button
              onClick={handleCloseCancelModal}
              className="absolute top-3 sm:top-4 right-3 sm:right-4 p-1.5 sm:p-2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 rounded-full neu-button"
            >
              <XIcon className="h-4 w-4 sm:h-5 sm:w-5" />
            </button>

            <div className="text-center mb-6">
              <div className="bg-red-50 dark:bg-red-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neu-shadow-sm">
                <BanIcon className="h-8 w-8 text-red-500 dark:text-red-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Cancel Class
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Are you sure you want to cancel this class?
              </p>

              {/* Class Details */}
              <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl mb-4 text-left">
                <h4 className="font-bold text-lg text-gray-800 dark:text-gray-200 mb-2">
                  {classToCancel.subject}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  {classToCancel.time} • {classToCancel.room}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Teacher: {classToCancel.teacher}
                </p>
              </div>

              {/* Reason Input */}
              <div className="text-left mb-4">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Reason for cancellation (optional)
                </label>
                <textarea
                  value={cancelReason}
                  onChange={(e) => setCancelReason(e.target.value)}
                  placeholder="Enter reason for cancellation..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner resize-none"
                  rows={3}
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={handleCloseCancelModal}
                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors neu-button"
              >
                Keep Class
              </button>
              <button
                onClick={handleConfirmCancellation}
                className="flex-1 px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors neu-shadow"
              >
                Cancel Class
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Debug panel removed for production */}

      {/* Conflict Resolution Modal */}
      {conflictResolution.show && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-2xl neu-shadow max-w-2xl w-full p-6 relative animate-fadeIn">
            <div className="mb-6 text-center">
              <div className="bg-yellow-100 dark:bg-yellow-900/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 neu-shadow-sm">
                <AlertTriangleIcon className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
                Data Conflict Detected
              </h3>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                This class was modified by another user while you were editing. Please choose which version to keep.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Local Changes */}
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border-2 border-blue-200 dark:border-blue-700">
                <h4 className="font-bold text-blue-800 dark:text-blue-300 mb-3 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Your Changes
                </h4>
                {conflictResolution.localChanges && (
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Subject:</span> {conflictResolution.localChanges.subject}</div>
                    <div><span className="font-medium">Teacher:</span> {conflictResolution.localChanges.teacher}</div>
                    <div><span className="font-medium">Time:</span> {conflictResolution.localChanges.time}</div>
                    <div><span className="font-medium">Room:</span> {conflictResolution.localChanges.room}</div>
                  </div>
                )}
              </div>

              {/* Remote Changes */}
              <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-xl border-2 border-green-200 dark:border-green-700">
                <h4 className="font-bold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                  <UserIcon className="h-4 w-4" />
                  Other User's Changes
                </h4>
                {conflictResolution.remoteChanges && (
                  <div className="space-y-2 text-sm">
                    <div><span className="font-medium">Subject:</span> {conflictResolution.remoteChanges.subject}</div>
                    <div><span className="font-medium">Teacher:</span> {conflictResolution.remoteChanges.teacher}</div>
                    <div><span className="font-medium">Time:</span> {conflictResolution.remoteChanges.time}</div>
                    <div><span className="font-medium">Room:</span> {conflictResolution.remoteChanges.room}</div>
                    <div className="text-xs text-gray-500 mt-2">
                      Modified by: {conflictResolution.remoteChanges.modifiedBy || 'Unknown'}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => resolveConflict(true)}
                className="flex-1 bg-blue-500 hover:bg-blue-600 text-white py-3 px-4 rounded-xl font-medium transition-colors neu-shadow"
              >
                Keep My Changes
              </button>
              <button
                onClick={() => resolveConflict(false)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 px-4 rounded-xl font-medium transition-colors neu-shadow"
              >
                Keep Other Changes
              </button>
              <button
                onClick={() => setConflictResolution({ show: false, conflictedClass: null, localChanges: null, remoteChanges: null })}
                className="px-4 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-xl font-medium transition-colors neu-shadow"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineSection;
