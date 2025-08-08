import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import EnhancedTimePicker from '../components/ui/EnhancedTimePicker';
import EnhancedDaySelector from '../components/ui/EnhancedDaySelector';
import TimeZoneSelector from '../components/ui/TimeZoneSelector';

describe('Enhanced Form Components', () => {
  describe('EnhancedTimePicker', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('should render with default values', () => {
      render(
        <EnhancedTimePicker
          onChange={mockOnChange}
          format="12h"
        />
      );

      expect(screen.getByText('Time Range')).toBeInTheDocument();
      expect(screen.getByText('Duration')).toBeInTheDocument();
      expect(screen.getByLabelText('Start Time')).toBeInTheDocument();
      expect(screen.getByLabelText('End Time')).toBeInTheDocument();
    });

    it('should validate time format correctly', async () => {
      render(
        <EnhancedTimePicker
          onChange={mockOnChange}
          format="12h"
        />
      );

      const startTimeInput = screen.getByLabelText('Start Time');
      
      // Test valid 12-hour format
      fireEvent.change(startTimeInput, { target: { value: '09:00 AM' } });
      fireEvent.blur(startTimeInput);
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalled();
      });

      // Test invalid format
      fireEvent.change(startTimeInput, { target: { value: '25:00 AM' } });
      fireEvent.blur(startTimeInput);
      
      // Should not call onChange for invalid time
      expect(startTimeInput).toHaveValue('09:00 AM'); // Should reset to last valid value
    });

    it('should calculate duration correctly', async () => {
      const onChange = vi.fn();
      render(
        <EnhancedTimePicker
          value={{
            startTime: '09:00 AM',
            endTime: '10:30 AM',
            duration: 90
          }}
          onChange={onChange}
          format="12h"
          showDuration={true}
        />
      );

      const endTimeInput = screen.getByLabelText('End Time');
      fireEvent.change(endTimeInput, { target: { value: '11:00 AM' } });
      fireEvent.blur(endTimeInput);

      await waitFor(() => {
        expect(onChange).toHaveBeenCalledWith(
          expect.objectContaining({
            startTime: '09:00 AM',
            endTime: '11:00 AM',
            duration: 120
          })
        );
      });
    });

    it('should switch between 12h and 24h formats', () => {
      const { rerender } = render(
        <EnhancedTimePicker
          onChange={mockOnChange}
          format="12h"
        />
      );

      expect(screen.getByPlaceholderText('HH:MM AM/PM')).toBeInTheDocument();

      rerender(
        <EnhancedTimePicker
          onChange={mockOnChange}
          format="24h"
        />
      );

      expect(screen.getByPlaceholderText('HH:MM')).toBeInTheDocument();
    });

    it('should handle duration-based input', async () => {
      render(
        <EnhancedTimePicker
          value={{
            startTime: '09:00 AM',
            endTime: '10:30 AM',
            duration: 90
          }}
          onChange={mockOnChange}
          showDuration={true}
        />
      );

      // Switch to duration mode
      fireEvent.click(screen.getByText('Duration'));

      const durationInput = screen.getByLabelText('Duration (minutes)');
      fireEvent.change(durationInput, { target: { value: '120' } });

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            duration: 120
          })
        );
      });
    });
  });

  describe('EnhancedDaySelector', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('should render weekly selection by default', () => {
      render(
        <EnhancedDaySelector
          onChange={mockOnChange}
        />
      );

      expect(screen.getByText('Weekly')).toBeInTheDocument();
      expect(screen.getByText('Select Days')).toBeInTheDocument();
      
      // Should show all days of the week
      expect(screen.getByText('Mon')).toBeInTheDocument();
      expect(screen.getByText('Tue')).toBeInTheDocument();
      expect(screen.getByText('Wed')).toBeInTheDocument();
      expect(screen.getByText('Thu')).toBeInTheDocument();
      expect(screen.getByText('Fri')).toBeInTheDocument();
      expect(screen.getByText('Sat')).toBeInTheDocument();
      expect(screen.getByText('Sun')).toBeInTheDocument();
    });

    it('should allow multiple day selection', async () => {
      render(
        <EnhancedDaySelector
          onChange={mockOnChange}
          allowMultiple={true}
        />
      );

      // Select Monday
      fireEvent.click(screen.getByText('Mon'));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'weekly',
            days: ['Monday']
          })
        );
      });

      // Select Wednesday
      fireEvent.click(screen.getByText('Wed'));
      
      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'weekly',
            days: expect.arrayContaining(['Monday', 'Wednesday'])
          })
        );
      });
    });

    it('should handle preset selections', async () => {
      render(
        <EnhancedDaySelector
          onChange={mockOnChange}
          allowMultiple={true}
        />
      );

      // Click on "Weekdays Only" preset
      fireEvent.click(screen.getByText('Weekdays Only'));

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'weekly',
            days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday']
          })
        );
      });
    });

    it('should switch to specific dates mode', async () => {
      render(
        <EnhancedDaySelector
          onChange={mockOnChange}
          allowSpecificDates={true}
        />
      );

      // Switch to specific dates
      fireEvent.click(screen.getByText('Specific'));

      expect(screen.getByText('Add Specific Date')).toBeInTheDocument();
      expect(screen.getByLabelText('Add Specific Date')).toBeInTheDocument();
    });

    it('should add and remove specific dates', async () => {
      render(
        <EnhancedDaySelector
          onChange={mockOnChange}
          allowSpecificDates={true}
        />
      );

      // Switch to specific dates
      fireEvent.click(screen.getByText('Specific'));

      const dateInput = screen.getByLabelText('Add Specific Date');
      const addButton = screen.getByText('Add');

      // Add a specific date
      fireEvent.change(dateInput, { target: { value: '2024-12-25' } });
      fireEvent.click(addButton);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith(
          expect.objectContaining({
            type: 'specific',
            specificDates: ['2024-12-25']
          })
        );
      });
    });
  });

  describe('TimeZoneSelector', () => {
    const mockOnChange = vi.fn();

    beforeEach(() => {
      mockOnChange.mockClear();
    });

    it('should render with placeholder', () => {
      render(
        <TimeZoneSelector
          onChange={mockOnChange}
          placeholder="Select timezone..."
        />
      );

      expect(screen.getByText('Select timezone...')).toBeInTheDocument();
    });

    it('should open dropdown when clicked', async () => {
      render(
        <TimeZoneSelector
          onChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('button');
      fireEvent.click(selector);

      await waitFor(() => {
        expect(screen.getByText('Bangladesh Standard Time')).toBeInTheDocument();
        expect(screen.getByText('Dhaka')).toBeInTheDocument();
      });
    });

    it('should select Bangladesh timezone and close dropdown', async () => {
      render(
        <TimeZoneSelector
          onChange={mockOnChange}
        />
      );

      const selector = screen.getByRole('button');
      fireEvent.click(selector);

      const bangladeshOption = screen.getByText('Bangladesh Standard Time');
      fireEvent.click(bangladeshOption);

      await waitFor(() => {
        expect(mockOnChange).toHaveBeenCalledWith('Asia/Dhaka');
      });
    });

    it('should show current time for selected timezone', () => {
      render(
        <TimeZoneSelector
          value="Asia/Dhaka"
          onChange={mockOnChange}
        />
      );

      // Should display the timezone name
      expect(screen.getByText(/Bangladesh Standard Time/)).toBeInTheDocument();
    });
  });

  describe('Integration Tests', () => {
    it('should work together in a form', async () => {
      const mockSubmit = vi.fn();

      const TestForm = () => {
        const [timeRange, setTimeRange] = React.useState({
          startTime: '09:00 AM',
          endTime: '10:30 AM',
          duration: 90
        });
        const [daySchedule, setDaySchedule] = React.useState({
          type: 'weekly' as const,
          days: ['Monday']
        });
        const [timeZone, setTimeZone] = React.useState('Asia/Dhaka');

        const handleSubmit = (e: React.FormEvent) => {
          e.preventDefault();
          mockSubmit({ timeRange, daySchedule, timeZone });
        };

        return (
          <form onSubmit={handleSubmit}>
            <EnhancedTimePicker
              value={timeRange}
              onChange={setTimeRange}
            />
            <EnhancedDaySelector
              value={daySchedule}
              onChange={setDaySchedule}
            />
            <TimeZoneSelector
              value={timeZone}
              onChange={setTimeZone}
            />
            <button type="submit">Submit</button>
          </form>
        );
      };

      render(<TestForm />);

      // Modify time
      const startTimeInput = screen.getByLabelText('Start Time');
      fireEvent.change(startTimeInput, { target: { value: '10:00 AM' } });
      fireEvent.blur(startTimeInput);

      // Select additional day
      fireEvent.click(screen.getByText('Wed'));

      // Submit form
      fireEvent.click(screen.getByText('Submit'));

      await waitFor(() => {
        expect(mockSubmit).toHaveBeenCalledWith({
          timeRange: expect.objectContaining({
            startTime: '10:00 AM'
          }),
          daySchedule: expect.objectContaining({
            days: expect.arrayContaining(['Monday', 'Wednesday'])
          }),
          timeZone: 'Asia/Dhaka'
        });
      });
    });

    it('should validate form data correctly', async () => {
      const mockOnChange = vi.fn();

      render(
        <EnhancedTimePicker
          onChange={mockOnChange}
          format="12h"
          minDuration={30}
          maxDuration={240}
        />
      );

      const startTimeInput = screen.getByLabelText('Start Time');
      const endTimeInput = screen.getByLabelText('End Time');

      // Test minimum duration validation
      fireEvent.change(startTimeInput, { target: { value: '09:00 AM' } });
      fireEvent.change(endTimeInput, { target: { value: '09:15 AM' } });
      fireEvent.blur(endTimeInput);

      await waitFor(() => {
        expect(screen.getByText('Minimum duration is 30 minutes')).toBeInTheDocument();
      });

      // Test maximum duration validation
      fireEvent.change(endTimeInput, { target: { value: '02:00 PM' } });
      fireEvent.blur(endTimeInput);

      await waitFor(() => {
        expect(screen.getByText('Maximum duration is 4 hours 0 minutes')).toBeInTheDocument();
      });
    });

    it('should handle timezone changes correctly', async () => {
      const mockOnChange = vi.fn();

      render(
        <TimeZoneSelector
          value="Asia/Dhaka"
          onChange={mockOnChange}
        />
      );

      // Should display current timezone with offset
      expect(screen.getByText(/Bangladesh Standard Time.*UTC/)).toBeInTheDocument();

      // Open dropdown and select Bangladesh timezone
      fireEvent.click(screen.getByRole('button'));

      await waitFor(() => {
        const bangladeshOption = screen.getByText('Bangladesh Standard Time');
        fireEvent.click(bangladeshOption);
      });

      expect(mockOnChange).toHaveBeenCalledWith('Asia/Dhaka');
    });
  });
});
