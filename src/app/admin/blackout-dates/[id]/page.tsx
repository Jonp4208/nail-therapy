'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { format, parseISO } from 'date-fns';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import { toast } from '@/components/ui/use-toast';
import DateRangePicker from '@/components/ui/DateRangePicker';
import TimeRangePicker from '@/components/ui/TimeRangePicker';
import { Database } from '@/types/database.types';

type BlackoutDate = Database['public']['Tables']['blackout_dates']['Row'];

export default function EditBlackoutDatePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [blackoutDate, setBlackoutDate] = useState<BlackoutDate | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check if user is admin
  useEffect(() => {
    if (!user || authLoading) return;

    const checkAdminStatus = async () => {
      try {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // Check all possible representations of is_admin
        const adminStatus =
          profile?.is_admin === true ||
          profile?.is_admin === 'true' ||
          profile?.is_admin === 't' ||
          profile?.is_admin === 1 ||
          profile?.is_admin === '1';

        if (!adminStatus) {
          router.push('/dashboard');
          return;
        }

        setIsAdmin(true);
        await fetchBlackoutDate();
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [supabase, user, authLoading, router]);

  // Fetch blackout date
  const fetchBlackoutDate = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blackout_dates')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Blackout date not found');
      }

      setBlackoutDate(data);

      // Set form values
      setDateRange({
        from: parseISO(data.start_date),
        to: parseISO(data.end_date),
      });
      setAllDay(data.all_day);
      setStartTime(data.start_time || '09:00');
      setEndTime(data.end_time || '17:00');
      setReason(data.reason || '');
    } catch (err: any) {
      console.error('Error fetching blackout date:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!dateRange?.from || !dateRange?.to) {
      setError('Please select a date range');
      return;
    }

    if (!allDay && (!startTime || !endTime)) {
      setError('Please select start and end times');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Format dates for database
      const formattedStartDate = format(dateRange.from, 'yyyy-MM-dd');
      const formattedEndDate = format(dateRange.to || dateRange.from, 'yyyy-MM-dd');

      // Update blackout date
      const { data, error: updateError } = await supabase
        .from('blackout_dates')
        .update({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          all_day: allDay,
          start_time: allDay ? null : startTime,
          end_time: allDay ? null : endTime,
          reason: reason || null,
        })
        .eq('id', params.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Blackout Date Updated',
        description: 'The blackout date has been successfully updated.',
      });

      // Redirect to blackout dates page
      router.push('/admin/blackout-dates');
    } catch (err: any) {
      console.error('Error updating blackout date:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (!isAdmin && !error)) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error && !blackoutDate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
            <div className="mt-6">
              <Link href="/admin/blackout-dates">
                <Button>Back to Blackout Dates</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Edit Blackout Date</h1>
          <p className="mt-2 text-gray-600">Update the period when you're unavailable for appointments</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Blackout Details</CardTitle>
              <CardDescription>
                Edit the dates and times when you won't be available for appointments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="rounded-md bg-red-50 p-4 mb-4">
                  <div className="flex">
                    <div className="text-sm text-red-700">{error}</div>
                  </div>
                </div>
              )}

              {/* Date Range Selection */}
              <DateRangePicker
                label="Date Range *"
                value={dateRange}
                onChange={setDateRange}
              />

              {/* All Day Toggle */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="all-day"
                  checked={allDay}
                  onCheckedChange={(checked) => setAllDay(checked === true)}
                />
                <label
                  htmlFor="all-day"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  All Day
                </label>
              </div>

              {/* Time Range Selection (only if not all day) */}
              {!allDay && (
                <TimeRangePicker
                  label="Time Range *"
                  startTime={startTime}
                  endTime={endTime}
                  onStartTimeChange={setStartTime}
                  onEndTimeChange={setEndTime}
                />
              )}

              {/* Reason */}
              <Textarea
                label="Reason (Optional)"
                placeholder="Enter a reason for this blackout period"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                rows={3}
              />
            </CardContent>
            <CardFooter className="flex justify-between">
              <Link href="/admin/blackout-dates">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
              <Button
                type="submit"
                className="bg-pink-600 hover:bg-pink-700 text-white"
                disabled={submitting}
              >
                {submitting ? 'Updating...' : 'Update Blackout Date'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
