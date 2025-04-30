'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO, isWithinInterval } from 'date-fns';
import { Calendar, Plus, Trash2, Edit } from 'lucide-react';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/types/database.types';

type BlackoutDate = Database['public']['Tables']['blackout_dates']['Row'];

export default function BlackoutDatesPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [blackoutDates, setBlackoutDates] = useState<BlackoutDate[]>([]);
  const [loading, setLoading] = useState(true);
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
        await fetchBlackoutDates();
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [supabase, user, authLoading, router]);

  // Fetch blackout dates
  const fetchBlackoutDates = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('blackout_dates')
        .select('*')
        .order('start_date');

      if (error) {
        throw error;
      }

      setBlackoutDates(data || []);
    } catch (err: any) {
      console.error('Error fetching blackout dates:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete blackout date
  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this blackout date?')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('blackout_dates')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update local state
      setBlackoutDates(blackoutDates.filter(date => date.id !== id));

      toast({
        title: 'Blackout date deleted',
        description: 'The blackout date has been successfully deleted.',
      });
    } catch (err: any) {
      console.error('Error deleting blackout date:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  // Format date range for display
  const formatDateRange = (startDate: string, endDate: string) => {
    const start = parseISO(startDate);
    const end = parseISO(endDate);

    if (startDate === endDate) {
      return format(start, 'MMMM d, yyyy');
    }

    return `${format(start, 'MMMM d, yyyy')} - ${format(end, 'MMMM d, yyyy')}`;
  };

  // Format time range for display
  const formatTimeRange = (startTime: string | null, endTime: string | null, allDay: boolean) => {
    if (allDay) {
      return 'All Day';
    }

    if (!startTime || !endTime) {
      return '';
    }

    // Format time to 12-hour format
    const formatTime = (time: string) => {
      const [hours, minutes] = time.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    };

    return `${formatTime(startTime)} - ${formatTime(endTime)}`;
  };

  // Check if a blackout date is active (current date is within the range)
  const isActive = (startDate: string, endDate: string) => {
    const today = new Date();
    return isWithinInterval(today, {
      start: parseISO(startDate),
      end: parseISO(endDate),
    });
  };

  if (loading && !isAdmin) {
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

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-lg text-red-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Blackout Dates</h1>
            <p className="mt-2 text-gray-600">Manage dates and times when you're unavailable</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/admin">
              <Button variant="outline" className="mr-2">Back to Dashboard</Button>
            </Link>
            <Link href="/admin/blackout-dates/create">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                Add Blackout Date
              </Button>
            </Link>
          </div>
        </div>

        {blackoutDates.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {blackoutDates.map((blackoutDate) => (
              <Card key={blackoutDate.id} className={isActive(blackoutDate.start_date, blackoutDate.end_date) ? 'border-pink-500' : ''}>
                <CardHeader className="pb-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle>{formatDateRange(blackoutDate.start_date, blackoutDate.end_date)}</CardTitle>
                      <CardDescription>
                        {formatTimeRange(blackoutDate.start_time, blackoutDate.end_time, blackoutDate.all_day)}
                      </CardDescription>
                    </div>
                    <div>
                      {isActive(blackoutDate.start_date, blackoutDate.end_date) && (
                        <span className="inline-flex items-center rounded-full bg-pink-100 px-2.5 py-0.5 text-xs font-medium text-pink-800">
                          Active
                        </span>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  {blackoutDate.reason && (
                    <p className="text-sm text-gray-600">{blackoutDate.reason}</p>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end space-x-2 pt-0">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => router.push(`/admin/blackout-dates/${blackoutDate.id}`)}
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(blackoutDate.id)}
                  >
                    <Trash2 className="h-4 w-4 mr-1" />
                    Delete
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-slate-400" />
            <h3 className="mt-2 text-lg font-medium text-slate-900">No blackout dates found</h3>
            <p className="mt-1 text-slate-500">
              Get started by adding dates when you're unavailable
            </p>
            <div className="mt-6">
              <Link href="/admin/blackout-dates/create">
                <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Blackout Date
                </Button>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
