import React, { useState, useEffect } from 'react';
import { CalendarIcon, RepeatIcon, CalendarDaysIcon, CheckIcon } from 'lucide-react';

export interface DaySelection {
  type: 'weekly' | 'specific' | 'custom';
  days?: string[]; // For weekly recurring
  specificDates?: string[]; // For specific dates (ISO format)
  customPattern?: {
    startDate: string;
    endDate: string;
    daysOfWeek: number[]; // 0 = Sunday, 1 = Monday, etc.
  };
}

export interface DaySelectorProps {
  value?: DaySelection;
  onChange: (selection: DaySelection) => void;
  allowMultiple?: boolean;
  allowSpecificDates?: boolean;
  allowCustomPattern?: boolean;
  className?: string;
  error?: string;
  disabled?: boolean;
}

const DAYS_OF_WEEK = [
  { name: 'Sunday', short: 'Sun', value: 'Sunday', index: 0 },
  { name: 'Monday', short: 'Mon', value: 'Monday', index: 1 },
  { name: 'Tuesday', short: 'Tue', value: 'Tuesday', index: 2 },
  { name: 'Wednesday', short: 'Wed', value: 'Wednesday', index: 3 },
  { name: 'Thursday', short: 'Thu', value: 'Thursday', index: 4 },
  { name: 'Friday', short: 'Fri', value: 'Friday', index: 5 },
  { name: 'Saturday', short: 'Sat', value: 'Saturday', index: 6 }
];

const ACADEMIC_PRESETS = [
  { name: 'Weekdays Only', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] },
  { name: 'Weekend Only', days: ['Saturday', 'Sunday'] },
  { name: 'Mon-Wed-Fri', days: ['Monday', 'Wednesday', 'Friday'] },
  { name: 'Tue-Thu', days: ['Tuesday', 'Thursday'] },
  { name: 'All Days', days: DAYS_OF_WEEK.map(d => d.value) }
];

const EnhancedDaySelector: React.FC<DaySelectorProps> = ({
  value,
  onChange,
  allowMultiple = true,
  allowSpecificDates = true,
  allowCustomPattern = false,
  className = '',
  error,
  disabled = false
}) => {
  const [selectionType, setSelectionType] = useState<'weekly' | 'specific' | 'custom'>(
    value?.type || 'weekly'
  );
  const [selectedDays, setSelectedDays] = useState<string[]>(value?.days || []);
  const [specificDates, setSpecificDates] = useState<string[]>(value?.specificDates || []);
  const [customStartDate, setCustomStartDate] = useState(value?.customPattern?.startDate || '');
  const [customEndDate, setCustomEndDate] = useState(value?.customPattern?.endDate || '');
  const [customDaysOfWeek, setCustomDaysOfWeek] = useState<number[]>(
    value?.customPattern?.daysOfWeek || []
  );
  const [newSpecificDate, setNewSpecificDate] = useState('');

  // Update parent when selection changes
  useEffect(() => {
    let selection: DaySelection;

    switch (selectionType) {
      case 'weekly':
        selection = {
          type: 'weekly',
          days: selectedDays
        };
        break;
      case 'specific':
        selection = {
          type: 'specific',
          specificDates
        };
        break;
      case 'custom':
        selection = {
          type: 'custom',
          customPattern: {
            startDate: customStartDate,
            endDate: customEndDate,
            daysOfWeek: customDaysOfWeek
          }
        };
        break;
    }

    onChange(selection);
  }, [selectionType, selectedDays, specificDates, customStartDate, customEndDate, customDaysOfWeek, onChange]);

  const handleDayToggle = (day: string) => {
    if (!allowMultiple) {
      setSelectedDays([day]);
      return;
    }

    setSelectedDays(prev => 
      prev.includes(day) 
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handlePresetSelect = (preset: typeof ACADEMIC_PRESETS[0]) => {
    setSelectedDays(preset.days);
  };

  const handleAddSpecificDate = () => {
    if (newSpecificDate && !specificDates.includes(newSpecificDate)) {
      setSpecificDates(prev => [...prev, newSpecificDate].sort());
      setNewSpecificDate('');
    }
  };

  const handleRemoveSpecificDate = (date: string) => {
    setSpecificDates(prev => prev.filter(d => d !== date));
  };

  const handleCustomDayToggle = (dayIndex: number) => {
    setCustomDaysOfWeek(prev =>
      prev.includes(dayIndex)
        ? prev.filter(d => d !== dayIndex)
        : [...prev, dayIndex].sort()
    );
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getMinDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Selection Type Tabs */}
      <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1">
        <button
          type="button"
          onClick={() => setSelectionType('weekly')}
          disabled={disabled}
          className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
            selectionType === 'weekly'
              ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
              : 'text-gray-600 dark:text-gray-400'
          }`}
        >
          <RepeatIcon className="h-3 w-3 inline mr-1" />
          Weekly
        </button>
        
        {allowSpecificDates && (
          <button
            type="button"
            onClick={() => setSelectionType('specific')}
            disabled={disabled}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              selectionType === 'specific'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <CalendarIcon className="h-3 w-3 inline mr-1" />
            Specific
          </button>
        )}
        
        {allowCustomPattern && (
          <button
            type="button"
            onClick={() => setSelectionType('custom')}
            disabled={disabled}
            className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
              selectionType === 'custom'
                ? 'bg-white dark:bg-gray-600 text-gray-900 dark:text-gray-100 shadow-sm'
                : 'text-gray-600 dark:text-gray-400'
            }`}
          >
            <CalendarDaysIcon className="h-3 w-3 inline mr-1" />
            Custom
          </button>
        )}
      </div>

      {/* Weekly Selection */}
      {selectionType === 'weekly' && (
        <div className="space-y-3">
          {/* Quick Presets */}
          {allowMultiple && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Quick Presets
              </label>
              <div className="flex flex-wrap gap-2">
                {ACADEMIC_PRESETS.map(preset => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    disabled={disabled}
                    className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Day Selection */}
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              {allowMultiple ? 'Select Days' : 'Select Day'}
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => handleDayToggle(day.value)}
                  disabled={disabled}
                  className={`p-2 text-xs font-medium rounded-lg transition-colors ${
                    selectedDays.includes(day.value)
                      ? 'bg-retro-purple dark:bg-retro-teal text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{day.short}</div>
                  </div>
                  {selectedDays.includes(day.value) && (
                    <CheckIcon className="h-3 w-3 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Selected Days Summary */}
          {selectedDays.length > 0 && (
            <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-xs font-medium text-blue-800 dark:text-blue-300 mb-1">
                Selected Days:
              </div>
              <div className="text-xs text-blue-700 dark:text-blue-400">
                {selectedDays.join(', ')}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Specific Dates Selection */}
      {selectionType === 'specific' && allowSpecificDates && (
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Add Specific Date
            </label>
            <div className="flex gap-2">
              <input
                type="date"
                value={newSpecificDate}
                onChange={(e) => setNewSpecificDate(e.target.value)}
                min={getMinDate()}
                disabled={disabled}
                className="flex-1 px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner"
              />
              <button
                type="button"
                onClick={handleAddSpecificDate}
                disabled={disabled || !newSpecificDate}
                className="px-4 py-2 bg-retro-purple dark:bg-retro-teal text-white text-sm rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                Add
              </button>
            </div>
          </div>

          {/* Selected Dates List */}
          {specificDates.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
                Selected Dates
              </label>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {specificDates.map(date => (
                  <div
                    key={date}
                    className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      {formatDate(date)}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveSpecificDate(date)}
                      disabled={disabled}
                      className="text-red-500 hover:text-red-700 text-xs"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Custom Pattern Selection */}
      {selectionType === 'custom' && allowCustomPattern && (
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={customStartDate}
                onChange={(e) => setCustomStartDate(e.target.value)}
                min={getMinDate()}
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                End Date
              </label>
              <input
                type="date"
                value={customEndDate}
                onChange={(e) => setCustomEndDate(e.target.value)}
                min={customStartDate || getMinDate()}
                disabled={disabled}
                className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-retro-purple dark:focus:ring-retro-teal focus:border-transparent neu-shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">
              Repeat on Days
            </label>
            <div className="grid grid-cols-7 gap-2">
              {DAYS_OF_WEEK.map(day => (
                <button
                  key={day.index}
                  type="button"
                  onClick={() => handleCustomDayToggle(day.index)}
                  disabled={disabled}
                  className={`p-2 text-xs font-medium rounded-lg transition-colors ${
                    customDaysOfWeek.includes(day.index)
                      ? 'bg-retro-purple dark:bg-retro-teal text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                  }`}
                >
                  <div className="text-center">
                    <div className="font-semibold">{day.short}</div>
                  </div>
                  {customDaysOfWeek.includes(day.index) && (
                    <CheckIcon className="h-3 w-3 mx-auto mt-1" />
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="text-red-600 dark:text-red-400 text-xs">
          {error}
        </div>
      )}
    </div>
  );
};

export default EnhancedDaySelector;
