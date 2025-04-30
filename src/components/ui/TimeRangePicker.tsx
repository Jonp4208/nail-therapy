'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/SelectNew';

interface TimeRangePickerProps {
  startTime: string;
  endTime: string;
  onStartTimeChange: (value: string) => void;
  onEndTimeChange: (value: string) => void;
  label?: string;
  error?: string;
  className?: string;
  disabled?: boolean;
}

const TimeRangePicker: React.FC<TimeRangePickerProps> = ({
  startTime,
  endTime,
  onStartTimeChange,
  onEndTimeChange,
  label,
  error,
  className,
  disabled = false,
}) => {
  // Generate time options in 30-minute increments
  const generateTimeOptions = () => {
    const times = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        const time = `${formattedHour}:${formattedMinute}`;
        const displayTime = formatTimeForDisplay(time);
        times.push({ value: time, label: displayTime });
      }
    }
    return times;
  };

  // Format time for display (12-hour format)
  const formatTimeForDisplay = (time: string) => {
    const [hours, minutes] = time.split(':').map(Number);
    const period = hours >= 12 ? 'PM' : 'AM';
    const displayHours = hours % 12 || 12;
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
  };

  const timeOptions = generateTimeOptions();

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <div className="flex space-x-2">
        <Select
          value={startTime}
          onValueChange={onStartTimeChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(
            "flex-1",
            error && "border-red-500 focus:ring-red-500"
          )}>
            <SelectValue placeholder="Start time" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <span className="flex items-center">to</span>
        <Select
          value={endTime}
          onValueChange={onEndTimeChange}
          disabled={disabled}
        >
          <SelectTrigger className={cn(
            "flex-1",
            error && "border-red-500 focus:ring-red-500"
          )}>
            <SelectValue placeholder="End time" />
          </SelectTrigger>
          <SelectContent>
            {timeOptions
              .filter((option) => option.value > startTime)
              .map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
          </SelectContent>
        </Select>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default TimeRangePicker;
