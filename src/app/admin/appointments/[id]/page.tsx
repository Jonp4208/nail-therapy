'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import { Database } from '@/types/database.types';

type AppointmentWithDetails = Database['public']['Tables']['appointments']['Row'] & {
  services: {
    name: string;
    price: number;
    duration: number;
    service_categories?: {
      name: string;
    } | null;
  } | null;
  profiles?: {
    full_name: string;
    phone: string;
    email: string;
  } | null;
};

export default function AppointmentDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [appointment, setAppointment] = useState<AppointmentWithDetails | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, router, params.id]);

  const checkAdminStatus = async () => {
    try {
      // Check if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();

      if (profileError) {
        throw profileError;
      }

      // Check all possible representations of is_admin
      const isAdmin =
        profile?.is_admin === true ||
        profile?.is_admin === 'true' ||
        profile?.is_admin === 't' ||
        profile?.is_admin === 1 ||
        profile?.is_admin === '1';

      if (!isAdmin) {
        router.push('/dashboard');
        return;
      }

      setIsAdmin(true);
      await fetchAppointment();
    } catch (err: any) {
      console.error('Error checking admin status:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAppointment = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            price,
            duration,
            service_categories (
              name
            )
          )
        `)
        .eq('id', params.id)
        .single();

      if (error) {
        throw error;
      }

      if (!data) {
        throw new Error('Appointment not found');
      }

      // Fetch client information
      let clientInfo = null;
      if (data.user_id) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('full_name, phone, email')
          .eq('id', data.user_id)
          .single();

        if (!profileError && profileData) {
          clientInfo = profileData;
        }
      } else if (data.guest_name) {
        clientInfo = {
          full_name: data.guest_name,
          phone: data.guest_phone || 'N/A',
          email: data.guest_email || 'N/A',
        };
      }

      setAppointment({
        ...data,
        profiles: clientInfo,
      });
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching appointment:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      await fetchAppointment();
    } catch (err: any) {
      console.error('Error confirming appointment:', err);
      setError(err.message);
    }
  };

  const handleCancelAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      await fetchAppointment();
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      setError(err.message);
    }
  };

  const handleCompleteAppointment = async () => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', params.id);

      if (error) {
        throw error;
      }

      await fetchAppointment();
    } catch (err: any) {
      console.error('Error completing appointment:', err);
      setError(err.message);
    }
  };

  const formatTime = (timeStr: string) => {
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-slate-700 mb-4"></div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Loading...</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">Please wait while we load the appointment details</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block p-3 sm:p-4 bg-red-50 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 sm:h-12 sm:w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Access Denied</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg leading-7 text-gray-600">
              You do not have permission to access this page.
            </p>
            <div className="mt-6 sm:mt-10">
              <Link href="/dashboard">
                <Button className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 sm:px-6 rounded-lg transition-colors w-full sm:w-auto">
                  Go to User Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900">Appointment Not Found</h2>
            <p className="mt-4 text-gray-600">The appointment you're looking for doesn't exist or has been removed.</p>
            <div className="mt-8">
              <Link href="/admin/appointments">
                <Button className="bg-slate-700 hover:bg-slate-800 text-white">Back to Appointments</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">Appointment Details</h1>
          <div className="flex space-x-2">
            <Link href="/admin/appointments">
              <Button variant="outline">Back to Appointments</Button>
            </Link>
            <Link href="/admin">
              <Button variant="outline">Dashboard</Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Appointment Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Date & Time</h3>
                    <p className="mt-1 text-lg font-medium">
                      {format(parseISO(appointment.appointment_date), 'MMMM d, yyyy')} at {formatTime(appointment.appointment_time)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Status</h3>
                    <p className="mt-1">
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-sm font-medium ${
                        appointment.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : appointment.status === 'completed'
                          ? 'bg-indigo-100 text-indigo-800'
                          : appointment.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                      </span>
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Service</h3>
                    <p className="mt-1 text-lg font-medium">{appointment.services?.name || 'Unknown'}</p>
                    <p className="text-sm text-gray-500">
                      {appointment.services?.service_categories?.name || 'General Service'} • 
                      {appointment.services?.duration || 'N/A'} minutes • 
                      ${((appointment.services?.price || 0) / 100).toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <h3 className="text-sm font-medium text-gray-500">Deposit</h3>
                    <p className="mt-1 text-lg font-medium">
                      {appointment.deposit_paid ? 'Paid' : 'Not Paid'}
                    </p>
                  </div>
                </div>

                {appointment.notes && (
                  <div className="mb-6">
                    <h3 className="text-sm font-medium text-gray-500">Notes</h3>
                    <p className="mt-1 text-gray-700">{appointment.notes}</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-2 mt-6">
                  {appointment.status === 'pending' && (
                    <Button
                      className="bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={handleConfirmAppointment}
                    >
                      Confirm Appointment
                    </Button>
                  )}
                  {appointment.status === 'confirmed' && (
                    <Button
                      className="bg-indigo-600 hover:bg-indigo-700 text-white"
                      onClick={handleCompleteAppointment}
                    >
                      Mark as Completed
                    </Button>
                  )}
                  {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                    <Button
                      className="bg-red-600 hover:bg-red-700 text-white"
                      onClick={handleCancelAppointment}
                    >
                      Cancel Appointment
                    </Button>
                  )}
                  <Link href={`/admin/appointments/create?clientId=${appointment.user_id}`}>
                    <Button variant="outline">Book New Appointment</Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle>Client Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Name</h3>
                  <p className="mt-1 text-lg font-medium">{appointment.profiles?.full_name || 'Unknown'}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Phone</h3>
                  <p className="mt-1">{appointment.profiles?.phone || 'N/A'}</p>
                </div>
                <div className="mb-4">
                  <h3 className="text-sm font-medium text-gray-500">Email</h3>
                  <p className="mt-1">{appointment.profiles?.email || appointment.guest_email || 'N/A'}</p>
                </div>
                {appointment.user_id && (
                  <div className="mt-6">
                    <Link href={`/admin/clients/${appointment.user_id}`}>
                      <Button className="w-full bg-slate-700 hover:bg-slate-800 text-white">
                        View Client Profile
                      </Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
