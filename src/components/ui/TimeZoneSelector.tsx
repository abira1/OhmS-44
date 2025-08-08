import React, { useState, useEffect, useMemo } from 'react';
import { GlobeIcon, ClockIcon } from 'lucide-react';

export interface TimeZoneInfo {
  value: string; // IANA timezone identifier
  label: string; // Display name
  offset: string; // UTC offset (e.g., "+05:30")
  region: string; // Geographic region
  city: string; // Primary city
}

export interface TimeZoneSelectorProps {
  value?: string;
  onChange: (timezone: string) => void;
  className?: string;
  error?: string;
  disabled?: boolean;
  placeholder?: string;
}

// Bangladesh Standard Time only
const COMMON_TIMEZONES: TimeZoneInfo[] = [
  { value: 'Asia/Dhaka', label: 'Bangladesh Standard Time', offset: '+06:00', region: 'Asia', city: 'Dhaka' }
];

const TimeZoneSelector: React.FC<TimeZoneSelectorProps> = ({
  value,
  onChange,
  className = '',
  error,
  disabled = false,
  placeholder = 'Select timezone...'
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTimezone, setSelectedTimezone] = useState<TimeZoneInfo | null>(null);

  // Get current timezone offset for a timezone
  const getCurrentOffset = (timezone: string): string => {
    try {
      const now = new Date();
      const utc = new Date(now.getTime() + (now.getTimezoneOffset() * 60000));
      const targetTime = new Date(utc.toLocaleString('en-US', { timeZone: timezone }));
      const offset = (targetTime.getTime() - utc.getTime()) / (1000 * 60 * 60);
      
      const sign = offset >= 0 ? '+' : '-';
      const hours = Math.floor(Math.abs(offset));
      const minutes = Math.round((Math.abs(offset) - hours) * 60);
      
      return `${sign}${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } catch {
      return '+00:00';
    }
  };

  // Update timezone info with current offset
  const timezonesWithCurrentOffset = useMemo(() => {
    return COMMON_TIMEZONES.map(tz => ({
      ...tz,
      offset: getCurrentOffset(tz.value)
    }));
  }, []);

  // Find selected timezone info
  useEffect(() => {
    if (value) {
      const found = timezonesWithCurrentOffset.find(tz => tz.value === value);
      setSelectedTimezone(found || null);
    } else {
      setSelectedTimezone(null);
    }
  }, [value, timezonesWithCurrentOffset]);

  // Set Bangladesh Standard Time as default
  const setBangladeshTime = () => {
    onChange('Asia/Dhaka');
    setIsOpen(false);
  };

  const handleTimezoneSelect = (timezone: TimeZoneInfo) => {
    onChange(timezone.value);
    setIsOpen(false);
    setSearchTerm('');
  };

  const formatDisplayText = (tz: TimeZoneInfo) => {
    return `${tz.label} (UTC${tz.offset})`;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Main Input */}
      <div className="relative">
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className={`w-full px-3 py-2 text-sm border rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 text-left focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner ${
            error
              ? 'border-red-300 dark:border-red-600'
              : 'border-gray-300 dark:border-gray-600'
          } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-gray-400 dark:hover:border-gray-500'}`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GlobeIcon className="h-4 w-4 text-gray-400" />
              <span className={selectedTimezone ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}>
                {selectedTimezone ? formatDisplayText(selectedTimezone) : placeholder}
              </span>
            </div>
            <ClockIcon className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''} text-gray-400`} />
          </div>
        </button>

        {/* Current Time Display */}
        {selectedTimezone && (
          <div className="absolute right-12 top-1/2 transform -translate-y-1/2 text-xs text-gray-500 dark:text-gray-400">
            {new Date().toLocaleTimeString('en-US', {
              timeZone: selectedTimezone.value,
              hour: '2-digit',
              minute: '2-digit',
              hour12: true
            })}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && !disabled && (
        <div className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl shadow-lg overflow-hidden">
          {/* Bangladesh Standard Time Option */}
          <div className="p-3">
            <button
              type="button"
              onClick={setBangladeshTime}
              className={`w-full px-3 py-3 text-sm text-left rounded-lg transition-colors ${
                selectedTimezone?.value === 'Asia/Dhaka'
                  ? 'bg-retro-purple/10 dark:bg-retro-teal/10 text-retro-purple dark:text-retro-teal'
                  : 'text-gray-900 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Bangladesh Standard Time</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    Dhaka
                  </div>
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400">
                  UTC+06:00
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="mt-1 text-xs text-red-600 dark:text-red-400">
          {error}
        </div>
      )}

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default TimeZoneSelector;
