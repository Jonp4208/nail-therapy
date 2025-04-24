'use client';

import React from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { cn } from '@/lib/utils';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface ReactCalendarProps {
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  minDate?: Date;
}

const ReactCalendar: React.FC<ReactCalendarProps> = ({
  value,
  onChange,
  className,
  minDate,
}) => {
  return (
    <div className={cn('w-full', className)}>
      <style jsx global>{`
        .react-calendar {
          width: 100%;
          max-width: 100%;
          background: white;
          border: 1px solid #e2e8f0;
          border-radius: 0.5rem;
          font-family: inherit;
          line-height: 1.5;
        }

        .react-calendar button {
          border-radius: 0.25rem;
        }

        .react-calendar__tile--active {
          background: #334155;
          color: white;
        }

        .react-calendar__tile--active:enabled:hover,
        .react-calendar__tile--active:enabled:focus {
          background: #1e293b;
        }
      `}</style>
      <Calendar
        value={value}
        onChange={onChange}
        minDate={minDate}
        className="react-calendar"
        locale="en-US" // Use US locale which has Sunday as the first day of the week
      />
    </div>
  );
};

export default ReactCalendar;
