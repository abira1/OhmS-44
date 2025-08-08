import React, { useState, useEffect, useCallback } from 'react';
import { ClockIcon, CalendarIcon, AlertCircleIcon } from 'lucide-react';

export interface TimeRange {
  startTime: string;
  endTime: string;
  duration?: number; // in minutes
}

export interface TimePickerProps {
  value?: TimeRange;
  onChange: (timeRange: TimeRange) => void;
  format?: '12h' | '24h';
  allowCustomInput?: boolean;
  showDuration?: boolean;
  minDuration?: number; // in minutes
  maxDuration?: number; // in minutes
  className?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

interface TimeInputProps {
  value: string;
  onChange: (value: string) => void;
  format: '12h' | '24h';
  placeholder: string;
  error?: boolean;
  disabled?: boolean;
}

const TimeInput: React.FC<TimeInputProps> = ({
  value,
  onChange,
  format,
  placeholder,
  error,
  disabled
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isValid, setIsValid] = useState(true);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  const validateTime = useCallback((timeStr: string): boolean => {
    if (!timeStr.trim()) return false;

    if (format === '12h') {
      // 12-hour format: HH:MM AM/PM
      const regex = /^(0?[1-9]|1[0-2]):([0-5][0-9])\s?(AM|PM)$/i;
      return regex.test(timeStr.trim());
    } else {
      // 24-hour format: HH:MM
      const regex = /^([01]?[0-9]|2[0-3]):([0-5][0-9])$/;
      return regex.test(timeStr.trim());
    }
  }, [format]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    
    const valid = validateTime(newValue);
    setIsValid(valid);
    
    if (valid) {
      onChange(newValue);
    }
  };

  const handleBlur = () => {
    if (!validateTime(inputValue)) {
      setInputValue(value); // Reset to last valid value
      setIsValid(true);
    }
  };

  return (
    <div className="relative">
      <input
        type="text"
        value={inputValue}
        onChange={handleInputChange}
        onBlur={handleBlur}
        placeholder={placeholder}
        disabled={disabled}
        className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner ${
          error || !isValid
            ? 'border-red-300 dark:border-red-600'
            : 'border-gray-300 dark:border-gray-600'
        } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      />
      {(!isValid || error) && (
        <AlertCircleIcon className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-red-500" />
      )}
    </div>
  );
};

const EnhancedTimePicker: React.FC<TimePickerProps> = ({
  value,
  onChange,
  format = '12h',
  allowCustomInput = true,
  showDuration = true,
  minDuration = 30,
  maxDuration = 480, // 8 hours
  className = '',
  error,
  disabled = false,
  placeholder
}) => {
  const [startTime, setStartTime] = useState(value?.startTime || '');
  const [endTime, setEndTime] = useState(value?.endTime || '');
  const [duration, setDuration] = useState(value?.duration || 90);
  const [inputMode, setInputMode] = useState<'time' | 'duration'>('time');
  const [validationError, setValidationError] = useState<string>('');

  // Convert time string to minutes since midnight
  const timeToMinutes = useCallback((timeStr: string): number => {
    if (!timeStr) return 0;

    if (format === '12h') {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})\s?(AM|PM)$/i);
      if (!match) return 0;
      
      let hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      const period = match[3].toUpperCase();
      
      if (period === 'PM' && hours !== 12) hours += 12;
      if (period === 'AM' && hours === 12) hours = 0;
      
      return hours * 60 + minutes;
    } else {
      const match = timeStr.match(/^(\d{1,2}):(\d{2})$/);
      if (!match) return 0;
      
      const hours = parseInt(match[1]);
      const minutes = parseInt(match[2]);
      
      return hours * 60 + minutes;
    }
  }, [format]);

  // Convert minutes since midnight to time string
  const minutesToTime = useCallback((minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;

    if (format === '12h') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${mins.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
    }
  }, [format]);

  // Calculate duration from start and end times
  const calculateDuration = useCallback((start: string, end: string): number => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    
    if (endMinutes <= startMinutes) {
      return 0; // Invalid time range
    }
    
    return endMinutes - startMinutes;
  }, [timeToMinutes]);

  // Update end time based on start time and duration
  const updateEndTimeFromDuration = useCallback((start: string, durationMins: number) => {
    const startMinutes = timeToMinutes(start);
    const endMinutes = startMinutes + durationMins;
    
    // Handle day overflow (past midnight)
    if (endMinutes >= 24 * 60) {
      setValidationError('Class cannot extend past midnight');
      return;
    }
    
    const newEndTime = minutesToTime(endMinutes);
    setEndTime(newEndTime);
    setValidationError('');
  }, [timeToMinutes, minutesToTime]);

  // Validate time range
  const validateTimeRange = useCallback((start: string, end: string): string => {
    if (!start || !end) return '';
    
    const startMinutes = timeToMinutes(start);
    const endMinutes = timeToMinutes(end);
    
    if (endMinutes <= startMinutes) {
      return 'End time must be after start time';
    }
    
    const durationMins = endMinutes - startMinutes;
    
    if (durationMins < minDuration) {
      return `Minimum duration is ${minDuration} minutes`;
    }
    
    if (durationMins > maxDuration) {
      return `Maximum duration is ${Math.floor(maxDuration / 60)} hours ${maxDuration % 60} minutes`;
    }
    
    return '';
  }, [timeToMinutes, minDuration, maxDuration]);

  // Handle start time change
  const handleStartTimeChange = (newStartTime: string) => {
    setStartTime(newStartTime);
    
    if (inputMode === 'duration' && newStartTime) {
      updateEndTimeFromDuration(newStartTime, duration);
    } else if (endTime) {
      const error = validateTimeRange(newStartTime, endTime);
      setValidationError(error);
    }
  };

  // Handle end time change
  const handleEndTimeChange = (newEndTime: string) => {
    setEndTime(newEndTime);
    
    if (startTime) {
      const error = validateTimeRange(startTime, newEndTime);
      setValidationError(error);
      
      if (!error) {
        const newDuration = calculateDuration(startTime, newEndTime);
        setDuration(newDuration);
      }
    }
  };

  // Handle duration change
  const handleDurationChange = (newDuration: number) => {
    setDuration(newDuration);
    
    if (startTime) {
      updateEndTimeFromDuration(startTime, newDuration);
    }
  };

  // Update parent component when values change
  useEffect(() => {
    if (startTime && endTime && !validationError) {
      const timeRange: TimeRange = {
        startTime,
        endTime,
        duration: calculateDuration(startTime, endTime)
      };
      onChange(timeRange);
    }
  }, [startTime, endTime, validationError, calculateDuration, onChange]);

  const formatPlaceholder = format === '12h' ? 'HH:MM AM/PM' : 'HH:MM';

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Input Mode Toggle */}
      {showDuration && (
        <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
          <button
            type="button"
            onClick={() => setInputMode('time')}
            className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              inputMode === 'time'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <ClockIcon className="h-3 w-3 inline mr-1" />
            Time Range
          </button>
          <button
            type="button"
            onClick={() => setInputMode('duration')}
            className={`flex-1 px-3 py-1 text-xs font-medium rounded-md transition-colors ${
              inputMode === 'duration'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <CalendarIcon className="h-3 w-3 inline mr-1" />
            Duration
          </button>
        </div>
      )}

      {/* Time Inputs */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Start Time
          </label>
          <TimeInput
            value={startTime}
            onChange={handleStartTimeChange}
            format={format}
            placeholder={placeholder || formatPlaceholder}
            error={!!validationError}
            disabled={disabled}
          />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            End Time
          </label>
          <TimeInput
            value={endTime}
            onChange={handleEndTimeChange}
            format={format}
            placeholder={placeholder || formatPlaceholder}
            error={!!validationError}
            disabled={disabled || inputMode === 'duration'}
          />
        </div>
      </div>

      {/* Duration Input */}
      {showDuration && inputMode === 'duration' && (
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
            Duration (minutes)
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={duration}
              onChange={(e) => handleDurationChange(parseInt(e.target.value) || 0)}
              min={minDuration}
              max={maxDuration}
              step={15}
              disabled={disabled}
              className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner"
            />
            <span className="text-xs text-gray-500 dark:text-gray-400">
              ({Math.floor(duration / 60)}h {duration % 60}m)
            </span>
          </div>
        </div>
      )}

      {/* Error Display */}
      {(validationError || error) && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-xs">
          <AlertCircleIcon className="h-4 w-4" />
          <span>{validationError || error}</span>
        </div>
      )}

      {/* Format Toggle */}
      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => {
            // This would be handled by parent component
            // For now, just show the current format
          }}
          className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          {format === '12h' ? 'Switch to 24h' : 'Switch to 12h'}
        </button>
      </div>
    </div>
  );
};

export default EnhancedTimePicker;
