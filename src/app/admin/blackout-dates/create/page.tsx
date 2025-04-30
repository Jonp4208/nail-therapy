'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';
import { useSupabaseContext } from '@/contexts/SupabaseContext';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Textarea from '@/components/ui/Textarea';
import Checkbox from '@/components/ui/Checkbox';
import { toast } from '@/components/ui/use-toast';
import DateRangePicker from '@/components/ui/DateRangePicker';
import TimeRangePicker from '@/components/ui/TimeRangePicker';

export default function CreateBlackoutDatePage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();
  
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(),
    to: new Date(),
  });
  const [allDay, setAllDay] = useState(true);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [reason, setReason] = useState('');
  
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
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message);
      }
    };

    checkAdminStatus();
  }, [supabase, user, authLoading, router]);

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

      // Create blackout date
      const { data, error: insertError } = await supabase
        .from('blackout_dates')
        .insert({
          start_date: formattedStartDate,
          end_date: formattedEndDate,
          all_day: allDay,
          start_time: allDay ? null : startTime,
          end_time: allDay ? null : endTime,
          reason: reason || null,
        })
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      toast({
        title: 'Blackout Date Created',
        description: 'The blackout date has been successfully created.',
      });

      // Redirect to blackout dates page
      router.push('/admin/blackout-dates');
    } catch (err: any) {
      console.error('Error creating blackout date:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || (!isAdmin && !error)) {
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Add Blackout Date</h1>
          <p className="mt-2 text-gray-600">Create a new period when you're unavailable for appointments</p>
        </div>

        <Card>
          <form onSubmit={handleSubmit}>
            <CardHeader>
              <CardTitle>Blackout Details</CardTitle>
              <CardDescription>
                Select the dates and times when you won't be available for appointments
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
                {submitting ? 'Creating...' : 'Create Blackout Date'}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
