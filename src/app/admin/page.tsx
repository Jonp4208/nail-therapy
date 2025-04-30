'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';

interface AppointmentWithClient {
  id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: {
    name: string;
  };
  profiles: {
    full_name: string;
    phone: string;
  };
}

export default function AdminDashboardPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [todayAppointments, setTodayAppointments] = useState<AppointmentWithClient[]>([]);
  const [upcomingAppointments, setUpcomingAppointments] = useState<AppointmentWithClient[]>([]);
  const [stats, setStats] = useState({
    todayCount: 0,
    pendingCount: 0,
    weeklyRevenue: 0,
    clientCount: 0,
  });

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const checkAdminStatus = async () => {
        try {
          console.log("Checking admin status for user ID:", user.id);

          // First, try to get the profile directly
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')  // Select all fields for debugging
            .eq('id', user.id)
            .single();

          if (profileError) {
            console.error("Profile error details:", JSON.stringify(profileError));

            // Try a different approach - use RPC if available or a direct query
            console.log("Trying alternative approach to get profile");
            const { data: directProfile, error: directError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', user.id);

            if (directError || !directProfile || directProfile.length === 0) {
              console.error("Direct profile error:", directError);
              throw new Error(`Could not retrieve profile: ${directError?.message || 'Unknown error'}`);
            }

            console.log("Direct profile result:", directProfile);

            // Use the first result from the direct query
            var profileToUse = directProfile[0];
          } else {
            console.log("Profile data:", profileData);
            var profileToUse = profileData;
          }

          // Check all possible representations of is_admin
          const isAdmin =
            profileToUse?.is_admin === true ||
            profileToUse?.is_admin === 'true' ||
            profileToUse?.is_admin === 't' ||
            profileToUse?.is_admin === 1 ||
            profileToUse?.is_admin === '1';

          console.log('Admin check:', {
            userId: user.id,
            isAdminValue: profileToUse?.is_admin,
            isAdminType: typeof profileToUse?.is_admin,
            isAdmin: isAdmin
          });

          if (!isAdmin) {
            // Redirect non-admin users to the dashboard
            router.push('/dashboard');
            return;
          }

          setIsAdmin(true);

          // Fetch data for admin dashboard
          await fetchDashboardData();
        } catch (err: any) {
          console.error('Error checking admin status:', err);

          // More detailed error logging
          if (err instanceof Error) {
            console.error('Error details:', {
              message: err.message,
              stack: err.stack,
              name: err.name
            });
          } else {
            console.error('Non-Error object thrown:', err);
          }

          // Set a more descriptive error message
          setError(err.message || 'Failed to check admin status. Please try refreshing the page.');
          setLoading(false);

          // For debugging, let's try to manually set admin status if we know this is the admin user
          if (user.email === 'jonp4208@gmail.com') {
            console.log("This appears to be the admin email, manually setting admin status for debugging");
            setIsAdmin(true);
            await fetchDashboardData();
          }
        }
      };

      checkAdminStatus();
    }
  }, [supabase, user, authLoading, router]);

  const fetchDashboardData = async () => {
    try {
      // Get today's date in ISO format
      const today = new Date().toISOString().split('T')[0];

      // Fetch today's appointments
      // First, get appointments for today
      const { data: todayData, error: todayError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            service_categories (
              id,
              name
            )
          )
        `)
        .eq('appointment_date', today)
        .order('appointment_time');

      if (todayError) {
        throw todayError;
      }

      // Then, fetch profile information for each appointment
      let appointmentsWithProfiles = [];
      try {
        appointmentsWithProfiles = await Promise.all((todayData || []).map(async (appointment) => {
          try {
            // If the appointment has a user_id, try to get the profile
            if (appointment.user_id) {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', appointment.user_id)
                .single();

              if (!profileError && profileData) {
                return {
                  ...appointment,
                  profiles: profileData
                };
              }
            }

            // If we have guest information, use that
            if (appointment.guest_name) {
              return {
                ...appointment,
                profiles: {
                  full_name: appointment.guest_name,
                  phone: appointment.guest_phone || 'N/A'
                }
              };
            }
          } catch (err) {
            console.error('Error fetching profile for appointment:', err);
          }

          return {
            ...appointment,
            profiles: { full_name: 'Unknown', phone: 'N/A' }
          };
        }));
      } catch (err) {
        console.error('Error processing appointments with profiles:', err);
        appointmentsWithProfiles = todayData?.map(appointment => ({
          ...appointment,
          profiles: { full_name: 'Unknown', phone: 'N/A' }
        })) || [];
      }

      setTodayAppointments(appointmentsWithProfiles || []);

      // Fetch upcoming appointments (next 7 days)
      const nextWeek = new Date();
      nextWeek.setDate(nextWeek.getDate() + 7);
      const nextWeekStr = nextWeek.toISOString().split('T')[0];

      // Get upcoming appointments
      const { data: upcomingData, error: upcomingError } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            service_categories (
              id,
              name
            )
          )
        `)
        .gt('appointment_date', today)
        .lte('appointment_date', nextWeekStr)
        .order('appointment_date')
        .order('appointment_time');

      if (upcomingError) {
        throw upcomingError;
      }

      // Then, fetch profile information for each upcoming appointment
      let upcomingWithProfiles = [];
      try {
        upcomingWithProfiles = await Promise.all((upcomingData || []).map(async (appointment) => {
          try {
            // If the appointment has a user_id, try to get the profile
            if (appointment.user_id) {
              const { data: profileData, error: profileError } = await supabase
                .from('profiles')
                .select('full_name, phone')
                .eq('id', appointment.user_id)
                .single();

              if (!profileError && profileData) {
                return {
                  ...appointment,
                  profiles: profileData
                };
              }
            }

            // If we have guest information, use that
            if (appointment.guest_name) {
              return {
                ...appointment,
                profiles: {
                  full_name: appointment.guest_name,
                  phone: appointment.guest_phone || 'N/A'
                }
              };
            }
          } catch (err) {
            console.error('Error fetching profile for upcoming appointment:', err);
          }

          return {
            ...appointment,
            profiles: { full_name: 'Unknown', phone: 'N/A' }
          };
        }));
      } catch (err) {
        console.error('Error processing upcoming appointments with profiles:', err);
        upcomingWithProfiles = upcomingData?.map(appointment => ({
          ...appointment,
          profiles: { full_name: 'Unknown', phone: 'N/A' }
        })) || [];
      }

      setUpcomingAppointments(upcomingWithProfiles || []);

      // Calculate stats
      const pendingCount = [
        ...(appointmentsWithProfiles || []),
        ...(upcomingWithProfiles || [])
      ].filter(app => app.status === 'pending').length;

      // Fetch weekly revenue
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Start of week (Sunday)
      const weekStartStr = weekStart.toISOString().split('T')[0];

      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('amount')
        .gte('created_at', weekStartStr)
        .eq('status', 'succeeded');

      if (paymentsError) {
        throw paymentsError;
      }

      const weeklyRevenue = (paymentsData || []).reduce(
        (sum, payment) => sum + payment.amount, 0
      );

      // Fetch client count
      const { count: clientCount, error: clientError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('is_admin', false);

      if (clientError) {
        throw clientError;
      }

      setStats({
        todayCount: (appointmentsWithProfiles || []).length,
        pendingCount,
        weeklyRevenue,
        clientCount: clientCount || 0,
      });
    } catch (err: any) {
      console.error('Error fetching dashboard data:', err);
      setError(err.message);
    } finally {
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

      // Refresh data
      await fetchDashboardData();
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

      // Refresh data
      await fetchDashboardData();
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

      // Refresh data
      await fetchDashboardData();
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
            <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600">Please wait while we prepare your dashboard</p>
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
              You do not have permission to access the admin dashboard.
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-8 sm:py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl mb-2 sm:mb-4">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-slate-700 to-slate-900">
              Salon Admin Dashboard
            </span>
          </h1>
          <p className="mt-2 sm:mt-4 text-base sm:text-lg md:text-xl leading-7 text-gray-600 max-w-2xl mx-auto">
            Manage your salon's appointments, services, and clients all in one place
          </p>
        </div>

        <div className="mx-auto mt-8 sm:mt-12 md:mt-16 max-w-7xl">
          {/* Quick Stats */}
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8 sm:mb-12">
            <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 transition-all hover:shadow-lg">
              <div className="px-3 py-3 sm:px-6 sm:py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-slate-700 rounded-md p-2 sm:p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Today's Appointments</dt>
                      <dd>
                        <div className="text-xl sm:text-3xl font-bold text-gray-900">{stats.todayCount}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 transition-all hover:shadow-lg">
              <div className="px-3 py-3 sm:px-6 sm:py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-600 rounded-md p-2 sm:p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Pending Confirmations</dt>
                      <dd>
                        <div className="text-xl sm:text-3xl font-bold text-gray-900">{stats.pendingCount}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 transition-all hover:shadow-lg">
              <div className="px-3 py-3 sm:px-6 sm:py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-emerald-600 rounded-md p-2 sm:p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">This Week's Revenue</dt>
                      <dd>
                        <div className="text-xl sm:text-3xl font-bold text-gray-900">${(stats.weeklyRevenue / 100).toFixed(2)}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 transition-all hover:shadow-lg">
              <div className="px-3 py-3 sm:px-6 sm:py-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-slate-600 rounded-md p-2 sm:p-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <div className="ml-3 sm:ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-xs sm:text-sm font-medium text-gray-500 truncate">Total Clients</dt>
                      <dd>
                        <div className="text-xl sm:text-3xl font-bold text-gray-900">{stats.clientCount}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 mb-8 sm:mb-12">
            <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]">
              <div className="p-1 bg-gradient-to-r from-slate-600 to-slate-700"></div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg sm:text-xl font-bold text-gray-900">Appointments</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Schedule, manage, and track all client appointments in one place.</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <Link href="/admin/appointments/create" className="w-full sm:w-auto">
                    <Button className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                      Add Appointment
                    </Button>
                  </Link>
                  <Link href="/admin/appointments" className="text-slate-700 hover:text-slate-900 font-medium text-center sm:text-left">
                    View All →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]">
              <div className="p-1 bg-gradient-to-r from-indigo-500 to-indigo-600"></div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="p-2 bg-indigo-50 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg sm:text-xl font-bold text-gray-900">Services</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Create and manage your salon's service offerings and pricing.</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <Link href="/admin/services" className="w-full sm:w-auto">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                      Manage Services
                    </Button>
                  </Link>
                  <Link href="/admin/services/create" className="text-indigo-600 hover:text-indigo-800 font-medium text-center sm:text-left">
                    Add New →
                  </Link>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 transition-all duration-300 hover:shadow-lg hover:translate-y-[-2px]">
              <div className="p-1 bg-gradient-to-r from-slate-500 to-slate-600"></div>
              <div className="p-4 sm:p-6">
                <div className="flex items-center mb-3 sm:mb-4">
                  <div className="p-2 bg-slate-100 rounded-lg">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 sm:h-8 sm:w-8 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="ml-3 text-lg sm:text-xl font-bold text-gray-900">Clients</h3>
                </div>
                <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6">Build and maintain your client directory and contact information.</p>
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 sm:gap-0">
                  <Link href="/admin/clients" className="w-full sm:w-auto">
                    <Button className="bg-slate-600 hover:bg-slate-700 text-white font-medium py-2 px-4 rounded-lg transition-colors w-full sm:w-auto">
                      View Clients
                    </Button>
                  </Link>
                  <Link href="/admin/appointments/create" className="text-slate-600 hover:text-slate-800 font-medium text-center sm:text-left">
                    Book Client →
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Today's Appointments */}
          <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200 mb-6 sm:mb-8">
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-slate-700 to-slate-800">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Today's Appointments
              </h2>
              <p className="text-slate-200 text-xs sm:text-sm">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </p>
            </div>
            <div className="p-4 sm:p-6">
              {error ? (
                <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Error loading appointments: {error}
                  </p>
                </div>
              ) : todayAppointments.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Client</th>
                          <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Service</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Time</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {todayAppointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{appointment.profiles?.full_name || 'Unknown'}</div>
                              <div className="text-xs text-slate-500 sm:hidden">{appointment.services?.name || 'Unknown'}</div>
                            </td>
                            <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-slate-600">{appointment.services?.name || 'Unknown'}</td>
                            <td className="px-4 py-4 whitespace-nowrap text-sm text-slate-600">{formatTime(appointment.appointment_time)}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
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
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex flex-wrap justify-end gap-1">
                                {appointment.status === 'pending' && (
                                  <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2 rounded"
                                    size="sm"
                                    onClick={() => handleConfirmAppointment(appointment.id)}
                                  >
                                    Confirm
                                  </Button>
                                )}
                                {appointment.status === 'confirmed' && (
                                  <Button
                                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs py-1 px-2 rounded"
                                    size="sm"
                                    onClick={() => handleCompleteAppointment(appointment.id)}
                                  >
                                    Complete
                                  </Button>
                                )}
                                <Link href={`/admin/appointments/${appointment.id}`}>
                                  <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1 px-2 rounded" size="sm">Edit</Button>
                                </Link>
                                {appointment.status !== 'cancelled' && appointment.status !== 'completed' && (
                                  <Button
                                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs py-1 px-2 rounded"
                                    size="sm"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <p className="mt-2 text-slate-500 text-sm sm:text-base">No appointments scheduled for today.</p>
                  <Link href="/admin/appointments/create" className="inline-block mt-4">
                    <Button className="bg-slate-700 hover:bg-slate-800 text-white w-full sm:w-auto">Add Appointment</Button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Appointments */}
          <div className="bg-white overflow-hidden shadow-md rounded-xl border border-slate-200">
            <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gradient-to-r from-indigo-600 to-indigo-700">
              <h2 className="text-lg sm:text-xl font-bold text-white flex items-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Upcoming Appointments
              </h2>
              <p className="text-indigo-100 text-xs sm:text-sm">
                Next 7 days
              </p>
            </div>
            <div className="p-4 sm:p-6">
              {error ? (
                <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded-lg text-sm">
                  <p className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Error loading appointments: {error}
                  </p>
                </div>
              ) : upcomingAppointments.length > 0 ? (
                <div className="overflow-x-auto -mx-4 sm:mx-0">
                  <div className="inline-block min-w-full align-middle">
                    <table className="min-w-full divide-y divide-slate-200">
                      <thead className="bg-slate-50">
                        <tr>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Client</th>
                          <th scope="col" className="hidden sm:table-cell px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Service</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Date</th>
                          <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-slate-700 uppercase tracking-wider">Status</th>
                          <th scope="col" className="px-4 py-3 text-right text-xs font-medium text-slate-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-slate-200">
                        {upcomingAppointments.map((appointment) => (
                          <tr key={appointment.id} className="hover:bg-slate-50 transition-colors">
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-slate-900">{appointment.profiles?.full_name || 'Unknown'}</div>
                              <div className="text-xs text-slate-500 sm:hidden">{appointment.services?.name || 'Unknown'}</div>
                              <div className="text-xs text-slate-500 sm:hidden">{formatTime(appointment.appointment_time)}</div>
                            </td>
                            <td className="hidden sm:table-cell px-4 py-4 whitespace-nowrap text-sm text-slate-600">{appointment.services?.name || 'Unknown'}</td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <div className="text-sm text-slate-900">{format(parseISO(appointment.appointment_date), 'MMM d, yyyy')}</div>
                              <div className="text-xs text-slate-500 hidden sm:block">{formatTime(appointment.appointment_time)}</div>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap">
                              <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                                appointment.status === 'confirmed'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : appointment.status === 'cancelled'
                                  ? 'bg-red-100 text-red-800'
                                  : 'bg-amber-100 text-amber-800'
                              }`}>
                                {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                              </span>
                            </td>
                            <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <div className="flex flex-wrap justify-end gap-1">
                                {appointment.status === 'pending' && (
                                  <Button
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs py-1 px-2 rounded"
                                    size="sm"
                                    onClick={() => handleConfirmAppointment(appointment.id)}
                                  >
                                    Confirm
                                  </Button>
                                )}
                                <Link href={`/admin/appointments/${appointment.id}`}>
                                  <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs py-1 px-2 rounded" size="sm">Edit</Button>
                                </Link>
                                {appointment.status !== 'cancelled' && (
                                  <Button
                                    className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 text-xs py-1 px-2 rounded"
                                    size="sm"
                                    onClick={() => handleCancelAppointment(appointment.id)}
                                  >
                                    Cancel
                                  </Button>
                                )}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div className="text-center py-6 sm:py-8">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 sm:h-12 sm:w-12 mx-auto text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="mt-2 text-slate-500 text-sm sm:text-base">No upcoming appointments scheduled.</p>
                  <Link href="/admin/appointments/create" className="inline-block mt-4">
                    <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">Schedule Now</Button>
                  </Link>
                </div>
              )}
              <div className="mt-4 sm:mt-6 text-center">
                <Link href="/admin/appointments">
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white w-full sm:w-auto">View All Appointments</Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
