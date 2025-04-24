'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { format, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import CalendarLinks from '@/components/CalendarLinks';

interface Appointment {
  id: string;
  service_id: string;
  appointment_date: string;
  appointment_time: string;
  status: string;
  services: {
    name: string;
    price: number;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([]);
  const [pastAppointments, setPastAppointments] = useState<Appointment[]>([]);

  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      const fetchUserData = async () => {
        try {
          // Fetch user profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (profileError) {
            throw profileError;
          }

          // If user is an admin, redirect to admin dashboard
          if (profileData?.is_admin) {
            router.push('/admin');
            return;
          }

          setProfile(profileData);

          // Get current date in ISO format
          const today = new Date().toISOString().split('T')[0];

          // Fetch upcoming appointments
          const { data: upcomingData, error: upcomingError } = await supabase
            .from('appointments')
            .select(`
              *,
              services (
                id,
                name,
                price,
                duration,
                service_categories (
                  id,
                  name
                )
              )
            `)
            .eq('user_id', user.id)
            .gte('appointment_date', today)
            .in('status', ['pending', 'confirmed'])
            .order('appointment_date', { ascending: true })
            .order('appointment_time', { ascending: true });

          if (upcomingError) {
            throw upcomingError;
          }

          setUpcomingAppointments(upcomingData || []);

          // Fetch past appointments
          const { data: pastData, error: pastError } = await supabase
            .from('appointments')
            .select(`
              *,
              services (
                id,
                name,
                price,
                duration,
                service_categories (
                  id,
                  name
                )
              )
            `)
            .eq('user_id', user.id)
            .lt('appointment_date', today)
            .order('appointment_date', { ascending: false })
            .order('appointment_time', { ascending: false })
            .limit(10);

          if (pastError) {
            throw pastError;
          }

          setPastAppointments(pastData || []);
        } catch (err: any) {
          console.error('Error fetching user data:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    }
  }, [supabase, user, authLoading, router]);

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status: 'cancelled' })
        .eq('id', appointmentId);

      if (error) {
        throw error;
      }

      // Update the local state to reflect the cancellation
      setUpcomingAppointments(prevAppointments =>
        prevAppointments.map(appointment =>
          appointment.id === appointmentId
            ? { ...appointment, status: 'cancelled' }
            : appointment
        )
      );
    } catch (err: any) {
      console.error('Error cancelling appointment:', err);
      setError(err.message);
    }
  };

  const formatAppointmentDate = (dateStr: string) => {
    return format(parseISO(dateStr), 'MMMM d, yyyy');
  };

  const formatAppointmentTime = (timeStr: string) => {
    // Convert 24-hour time to 12-hour format
    const [hours, minutes] = timeStr.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  if (authLoading) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl lg:text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">My Dashboard</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Manage your appointments and account information
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl">
          {/* User Profile Summary */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Welcome, {profile?.full_name || user?.email}</CardTitle>
              <CardDescription>
                Manage your profile and appointments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-500">Email: {profile?.email || user?.email}</p>
                  {profile?.phone && <p className="text-sm text-gray-500">Phone: {profile.phone}</p>}
                </div>
                <div className="mt-4 sm:mt-0">
                  <Link href="/dashboard/profile">
                    <Button variant="outline">Edit Profile</Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Book a New Appointment</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Ready for your next service? Book a new appointment now.</p>
              </CardContent>
              <CardFooter>
                <Link href="/book">
                  <Button>Book Now</Button>
                </Link>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>View Our Services</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">Explore our range of nail, eyebrow, and waxing services.</p>
              </CardContent>
              <CardFooter>
                <Link href="/services">
                  <Button variant="outline">View Services</Button>
                </Link>
              </CardFooter>
            </Card>
          </div>

          {/* Upcoming Appointments */}
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Upcoming Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading appointments...</p>
              ) : error ? (
                <p className="text-red-500">Error loading appointments: {error}</p>
              ) : upcomingAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {upcomingAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b">
                          <td className="py-4">{appointment.services.name}</td>
                          <td className="py-4">{formatAppointmentDate(appointment.appointment_date)}</td>
                          <td className="py-4">{formatAppointmentTime(appointment.appointment_time)}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4">
                            <div className="flex flex-col space-y-2">
                              <div className="flex space-x-2">
                                {appointment.status !== 'cancelled' && (
                                  <>
                                    <Link href={`/book?edit=${appointment.id}`}>
                                      <Button variant="outline" size="sm">Reschedule</Button>
                                    </Link>
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      className="text-red-600 hover:text-red-700"
                                      onClick={() => handleCancelAppointment(appointment.id)}
                                    >
                                      Cancel
                                    </Button>
                                  </>
                                )}
                              </div>

                              {appointment.status !== 'cancelled' && (
                                <div className="flex justify-start">
                                  <div className="dropdown relative inline-block">
                                    <button className="text-xs text-pink-600 hover:text-pink-800 hover:underline">
                                      Add to Calendar
                                    </button>
                                    <div className="dropdown-content hidden absolute z-10 bg-white shadow-lg rounded-md p-2 mt-1 min-w-[200px] group-hover:block">
                                      <CalendarLinks
                                        serviceName={appointment.services.name}
                                        appointmentDate={appointment.appointment_date}
                                        appointmentTime={appointment.appointment_time}
                                        durationMinutes={appointment.services.duration || 60}
                                      />
                                    </div>
                                  </div>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">You have no upcoming appointments.</p>
              )}
            </CardContent>
            <CardFooter>
              <Link href="/book">
                <Button>Book New Appointment</Button>
              </Link>
            </CardFooter>
          </Card>

          {/* Past Appointments */}
          <Card>
            <CardHeader>
              <CardTitle>Past Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <p className="text-gray-500">Loading appointments...</p>
              ) : error ? (
                <p className="text-red-500">Error loading appointments: {error}</p>
              ) : pastAppointments.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="pb-3 font-medium">Service</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium">Time</th>
                        <th className="pb-3 font-medium">Status</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {pastAppointments.map((appointment) => (
                        <tr key={appointment.id} className="border-b">
                          <td className="py-4">{appointment.services.name}</td>
                          <td className="py-4">{formatAppointmentDate(appointment.appointment_date)}</td>
                          <td className="py-4">{formatAppointmentTime(appointment.appointment_time)}</td>
                          <td className="py-4">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              appointment.status === 'completed'
                                ? 'bg-green-100 text-green-800'
                                : appointment.status === 'cancelled'
                                ? 'bg-red-100 text-red-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </td>
                          <td className="py-4">
                            <Link href={`/book?service=${appointment.service_id}`}>
                              <Button variant="outline" size="sm">Book Again</Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-gray-500">You have no past appointments.</p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
