import React from 'react';
import ReactDatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { cn } from '@/lib/utils';

interface DatePickerProps {
  selected: Date | null;
  onChange: (date: Date | null) => void;
  label?: string;
  error?: string;
  minDate?: Date;
  maxDate?: Date;
  className?: string;
  placeholderText?: string;
  disabled?: boolean;
}

const DatePicker: React.FC<DatePickerProps> = ({
  selected,
  onChange,
  label,
  error,
  minDate,
  maxDate,
  className,
  placeholderText = 'Select date',
  disabled = false,
}) => {
  return (
    <div className="space-y-2">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
        </label>
      )}
      <ReactDatePicker
        selected={selected}
        onChange={onChange}
        minDate={minDate}
        maxDate={maxDate}
        placeholderText={placeholderText}
        disabled={disabled}
        className={cn(
          "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50",
          error && "border-red-500 focus:ring-red-500",
          className
        )}
        dateFormat="MMMM d, yyyy"
      />
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default DatePicker;
