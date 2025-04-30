'use client';

import React, { useState, useEffect } from 'react';
import Calendar, { CalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';
import { cn } from '@/lib/utils';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import { isWithinInterval, parseISO } from 'date-fns';

type ValuePiece = Date | null;
type Value = ValuePiece | [ValuePiece, ValuePiece];

interface BlackoutDate {
  id: string;
  start_date: string;
  end_date: string;
}

interface ReactCalendarProps {
  value: Value;
  onChange: (value: Value) => void;
  className?: string;
  minDate?: Date;
  disableBlackoutDates?: boolean;
}

const ReactCalendar: React.FC<ReactCalendarProps> = ({
  value,
  onChange,
  className,
  minDate,
  disableBlackoutDates = true,
}) => {
  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [loading, setLoading] = useState(true);

  // Get Supabase client from context
  const { supabase } = useSupabaseContext();

  // Fetch blackout dates
  useEffect(() => {
    const fetchBlackoutDates = async () => {
      try {
        if (!supabase) return;

        const { data, error } = await supabase
          .from('blackout_dates')
          .select('id, start_date, end_date');

        if (error) {
          console.error('Error fetching blackout dates:', error);
          return;
        }

        setBlackoutDates(data || []);
      } catch (err) {
        console.error('Error in fetchBlackoutDates:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBlackoutDates();
  }, [supabase]);

  // Check if a date is within any blackout period
  const isBlackoutDate = (date: Date) => {
    return blackoutDates.some((blackout) => {
      const start = parseISO(blackout.start_date);
      const end = parseISO(blackout.end_date);
      return isWithinInterval(date, { start, end });
    });
  };

  // Custom tile content to mark blackout dates
  const tileClassName = ({ date, view }: { date: Date; view: string }) => {
    if (view === 'month' && isBlackoutDate(date)) {
      return 'blackout-date';
    }
    return null;
  };

  // Disable blackout dates if needed
  const tileDisabled = ({ date, view }: { date: Date; view: string }) => {
    if (disableBlackoutDates && view === 'month' && isBlackoutDate(date)) {
      return true;
    }
    return false;
  };

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

        .blackout-date {
          background-color: #fee2e2;
          color: #ef4444;
          text-decoration: line-through;
        }

        .blackout-date:hover {
          background-color: #fecaca;
        }

        .react-calendar__tile:disabled.blackout-date {
          background-color: #fee2e2;
          color: #ef4444;
          text-decoration: line-through;
          cursor: not-allowed;
        }
      `}</style>
      <Calendar
        value={value}
        onChange={onChange}
        minDate={minDate}
        className="react-calendar"
        locale="en-US" // Use US locale which has Sunday as the first day of the week
        tileClassName={tileClassName}
        tileDisabled={tileDisabled}
      />
    </div>
  );
};

export default ReactCalendar;
