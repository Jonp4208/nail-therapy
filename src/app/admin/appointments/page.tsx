'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import { Search, Calendar, Plus, Filter } from 'lucide-react';
import { Database } from '@/types/database.types';

type AppointmentWithDetails = Database['public']['Tables']['appointments']['Row'] & {
  services: {
    name: string;
    price: number;
  } | null;
  profiles?: {
    full_name: string;
    phone: string;
  } | null;
};

export default function AppointmentsPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [appointments, setAppointments] = useState<AppointmentWithDetails[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      checkAdminStatus();
    }
  }, [user, authLoading, router]);

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
      await fetchAppointments();
    } catch (err: any) {
      console.error('Error checking admin status:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            name,
            price
          )
        `)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: true });

      if (error) {
        throw error;
      }

      // Fetch client information for each appointment
      const appointmentsWithProfiles = await Promise.all(
        (data || []).map(async (appointment) => {
          if (appointment.user_id) {
            const { data: profileData, error: profileError } = await supabase
              .from('profiles')
              .select('full_name, phone')
              .eq('id', appointment.user_id)
              .single();

            if (!profileError && profileData) {
              return {
                ...appointment,
                profiles: profileData,
              };
            }
          }

          // If we have guest information, use that
          if (appointment.guest_name) {
            return {
              ...appointment,
              profiles: {
                full_name: appointment.guest_name,
                phone: appointment.guest_phone || 'N/A',
              },
            };
          }

          return {
            ...appointment,
            profiles: { full_name: 'Unknown', phone: 'N/A' },
          };
        })
      );

      setAppointments(appointmentsWithProfiles);
      setLoading(false);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
      setLoading(false);
    }
  };

  const handleConfirmAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'confirmed' })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      await fetchAppointments();
    } catch (err: any) {
      console.error('Error confirming appointment:', err);
      setError(err.message);
    }
  };

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      await fetchAppointments();
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      setError(err.message);
    }
  };

  const handleCompleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'completed' })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      await fetchAppointments();
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

  // Filter appointments based on search query and status filter
  const filteredAppointments = appointments.filter((appointment) => {
    const matchesSearch =
      !searchQuery ||
      appointment.profiles?.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      appointment.services?.name.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = !statusFilter || appointment.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-t-2 border-b-2 border-slate-700 mb-4"></div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">Loading...</h2>
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">Please wait while we load your appointments</p>
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">Appointments</h1>
            <p className="mt-2 text-gray-600">Manage all your salon appointments</p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link href="/admin">
              <Button variant="outline" className="mr-2">Back to Dashboard</Button>
            </Link>
            <Link href="/admin/appointments/create">
              <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                <Plus className="h-4 w-4 mr-2" />
                New Appointment
              </Button>
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
            {error}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden mb-8">
          <div className="p-4 sm:p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="relative w-full sm:max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
              <Input
                placeholder="Search by client or service"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 border-slate-300 focus:border-slate-400 focus:ring-slate-400 w-full"
              />
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <Filter className="text-slate-400" size={18} />
              <select
                value={statusFilter || ''}
                onChange={(e) => setStatusFilter(e.target.value || null)}
                className="border border-slate-300 rounded-md text-sm py-1.5 px-3 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-slate-400"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          {filteredAppointments.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
              {filteredAppointments.map((appointment) => (
                <div key={appointment.id} className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden">
                  <div className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-medium text-slate-900">{appointment.profiles?.full_name || 'Unknown'}</h3>
                        <p className="text-sm text-slate-600">{appointment.services?.name || 'Unknown'}</p>
                      </div>
                      <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
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
                    </div>

                    <div className="flex items-center text-sm text-slate-500 mb-2">
                      <span className="font-medium">{format(parseISO(appointment.appointment_date), 'MMM d, yyyy')}</span>
                      <span className="mx-1">•</span>
                      <span>{formatTime(appointment.appointment_time)}</span>
                    </div>

                    {appointment.services?.price && (
                      <div className="text-sm text-slate-500 mb-4">
                        ${((appointment.services.price) / 100).toFixed(2)}
                      </div>
                    )}
                  </div>

                  <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 flex justify-between items-center">
                    <div className="flex space-x-2">
                      <Link href={`/admin/appointments/${appointment.id}`}>
                        <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1 px-3 rounded" size="sm">
                          Edit
                        </Button>
                      </Link>

                      {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                        <Button
                          className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs py-1 px-3 rounded"
                          size="sm"
                          onClick={() => handleCancelAppointment(appointment.id)}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>

                    <div>
                      {appointment.status === 'pending' && (
                        <Button
                          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-3 rounded"
                          size="sm"
                          onClick={() => handleConfirmAppointment(appointment.id)}
                        >
                          Confirm
                        </Button>
                      )}
                      {appointment.status === 'confirmed' && (
                        <Button
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-3 rounded"
                          size="sm"
                          onClick={() => handleCompleteAppointment(appointment.id)}
                        >
                          Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 mx-auto text-slate-400" />
              <h3 className="mt-2 text-lg font-medium text-slate-900">No appointments found</h3>
              <p className="mt-1 text-slate-500">
                {searchQuery || statusFilter
                  ? 'Try adjusting your search or filter criteria'
                  : 'Get started by creating a new appointment'}
              </p>
              <div className="mt-6">
                <Link href="/admin/appointments/create">
                  <Button className="bg-pink-600 hover:bg-pink-700 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    New Appointment
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
