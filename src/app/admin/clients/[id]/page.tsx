'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { format, parseISO } from 'date-fns';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/Tabs';
import { Database } from '@/types/database.types';
import Link from 'next/link';
import { Phone, Mail, Calendar, Clock, CheckCircle, XCircle } from 'lucide-react';

type Profile = Database['public']['Tables']['profiles']['Row'];
type Appointment = Database['public']['Tables']['appointments']['Row'] & {
  services?: { id: string; name: string; price: number; duration: number } | null;
};

export default function ClientDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const supabase = createClientComponentClient<Database>();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [client, setClient] = useState<Profile | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        setAuthLoading(true);

        // Get the current user session
        const { data: { session } } = await supabase.auth.getSession();

        if (!session || !session.user) {
          router.push('/login');
          return;
        }

        const user = session.user;
        console.log("Checking admin status for user ID:", user.id);

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          console.error("Profile error:", profileError);
          throw profileError;
        }

        // Check all possible representations of is_admin
        const isAdmin =
          profile?.is_admin === true ||
          profile?.is_admin === 'true' ||
          profile?.is_admin === 't' ||
          profile?.is_admin === 1 ||
          profile?.is_admin === '1';

        console.log('Admin check:', {
          userId: user.id,
          isAdminValue: profile?.is_admin,
          isAdminType: typeof profile?.is_admin,
          isAdmin: isAdmin
        });

        // If not admin, redirect to dashboard
        if (!isAdmin) {
          console.log("User is not admin");
          router.push('/dashboard');
          return;
        }

        // User is admin, set state and fetch data
        console.log("User is admin, proceeding");
        setIsAdmin(true);

        // Fetch client and appointments
        await Promise.all([
          fetchClient(),
          fetchAppointments()
        ]);

        setLoading(false);
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message);
        setLoading(false);
      } finally {
        setAuthLoading(false);
      }
    };

    checkAuth();
  }, [supabase, router, params.id]);

  const fetchClient = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', params.id)
        .single();

      if (error) {
        throw error;
      }

      setClient(data);
    } catch (err: any) {
      console.error('Error fetching client:', err);
      setError(err.message);
    }
  };

  const fetchAppointments = async () => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          services (
            id,
            name,
            price,
            duration
          )
        `)
        .eq('user_id', params.id)
        .order('appointment_date', { ascending: false })
        .order('appointment_time', { ascending: false });

      if (error) {
        throw error;
      }

      setAppointments(data || []);
    } catch (err: any) {
      console.error('Error fetching appointments:', err);
      setError(err.message);
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

      // Update local state
      setAppointments(appointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'confirmed' }
          : appointment
      ));
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

      // Update local state
      setAppointments(appointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'cancelled' }
          : appointment
      ));
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

      // Update local state
      setAppointments(appointments.map(appointment =>
        appointment.id === appointmentId
          ? { ...appointment, status: 'completed' }
          : appointment
      ));
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

  // Filter appointments by status
  const upcomingAppointments = appointments.filter(
    app => app.status !== 'cancelled' && app.status !== 'completed' &&
    new Date(`${app.appointment_date}T${app.appointment_time}`) >= new Date()
  );

  const pastAppointments = appointments.filter(
    app => app.status === 'completed' ||
    (app.status !== 'cancelled' && new Date(`${app.appointment_date}T${app.appointment_time}`) < new Date())
  );

  const cancelledAppointments = appointments.filter(app => app.status === 'cancelled');

  if (authLoading || loading) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Access Denied</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              You do not have permission to access this page.
            </p>
            <div className="mt-10">
              <Link href="/dashboard">
                <Button>Go to User Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Client Not Found</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              The client you are looking for does not exist or has been removed.
            </p>
            <div className="mt-10">
              <Link href="/admin/clients">
                <Button>Back to Client Directory</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-800 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">Client Profile</h2>
            <div className="flex space-x-4">
              <Link href={`/admin/appointments/create?clientId=${client.id}`}>
                <Button>Book Appointment</Button>
              </Link>
              <Link href="/admin/clients">
                <Button variant="outline">Back to Directory</Button>
              </Link>
            </div>
          </div>

          <Card className="mb-8">
            <CardHeader>
              <CardTitle>{client.full_name}</CardTitle>
              <CardDescription>
                Client since {new Date(client.created_at).toLocaleDateString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Mail className="mr-2 h-5 w-5 text-gray-400" />
                    <span>{client.email || 'No email provided'}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="mr-2 h-5 w-5 text-gray-400" />
                    <span>{client.phone || 'No phone provided'}</span>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="mr-2 h-5 w-5 text-gray-400" />
                    <span>
                      {appointments.length > 0
                        ? `${appointments.length} total appointments`
                        : 'No appointments'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-2 h-5 w-5 text-gray-400" />
                    <span>
                      {upcomingAppointments.length > 0
                        ? `${upcomingAppointments.length} upcoming appointments`
                        : 'No upcoming appointments'}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Tabs defaultValue="upcoming" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="upcoming">Upcoming ({upcomingAppointments.length})</TabsTrigger>
              <TabsTrigger value="past">Past ({pastAppointments.length})</TabsTrigger>
              <TabsTrigger value="cancelled">Cancelled ({cancelledAppointments.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="upcoming">
              {upcomingAppointments.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {upcomingAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{appointment.services?.name || 'Unknown Service'}</CardTitle>
                            <CardDescription>
                              {format(parseISO(appointment.appointment_date), 'EEEE, MMMM d, yyyy')} at {formatTime(appointment.appointment_time)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              appointment.status === 'confirmed'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                            }`}>
                              {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Duration: {appointment.services?.duration || 'N/A'} minutes</p>
                            <p className="text-sm text-gray-500">Price: ${((appointment.services?.price || 0) / 100).toFixed(2)}</p>
                          </div>
                          {appointment.notes && (
                            <div>
                              <p className="text-sm text-gray-500">Notes: {appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex space-x-2">
                          {appointment.status === 'pending' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleConfirmAppointment(appointment.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Confirm
                            </Button>
                          )}
                          {appointment.status === 'confirmed' && (
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleCompleteAppointment(appointment.id)}
                            >
                              <CheckCircle className="mr-2 h-4 w-4" />
                              Complete
                            </Button>
                          )}
                          {appointment.status !== 'cancelled' && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="text-red-600 hover:text-red-700"
                              onClick={() => handleCancelAppointment(appointment.id)}
                            >
                              <XCircle className="mr-2 h-4 w-4" />
                              Cancel
                            </Button>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No upcoming appointments.</p>
                  <div className="mt-4">
                    <Link href={`/admin/appointments/create?clientId=${client.id}`}>
                      <Button>Book New Appointment</Button>
                    </Link>
                  </div>
                </div>
              )}
            </TabsContent>

            <TabsContent value="past">
              {pastAppointments.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {pastAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{appointment.services?.name || 'Unknown Service'}</CardTitle>
                            <CardDescription>
                              {format(parseISO(appointment.appointment_date), 'EEEE, MMMM d, yyyy')} at {formatTime(appointment.appointment_time)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                              appointment.status === 'completed'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                              {appointment.status === 'completed' ? 'Completed' : 'Missed'}
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Duration: {appointment.services?.duration || 'N/A'} minutes</p>
                            <p className="text-sm text-gray-500">Price: ${((appointment.services?.price || 0) / 100).toFixed(2)}</p>
                          </div>
                          {appointment.notes && (
                            <div>
                              <p className="text-sm text-gray-500">Notes: {appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        {appointment.status !== 'completed' && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleCompleteAppointment(appointment.id)}
                          >
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Mark as Completed
                          </Button>
                        )}
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No past appointments.</p>
                </div>
              )}
            </TabsContent>

            <TabsContent value="cancelled">
              {cancelledAppointments.length > 0 ? (
                <div className="space-y-4 mt-4">
                  {cancelledAppointments.map((appointment) => (
                    <Card key={appointment.id}>
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <CardTitle>{appointment.services?.name || 'Unknown Service'}</CardTitle>
                            <CardDescription>
                              {format(parseISO(appointment.appointment_date), 'EEEE, MMMM d, yyyy')} at {formatTime(appointment.appointment_time)}
                            </CardDescription>
                          </div>
                          <div className="flex items-center">
                            <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium bg-red-100 text-red-800">
                              Cancelled
                            </span>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="pb-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <p className="text-sm text-gray-500">Duration: {appointment.services?.duration || 'N/A'} minutes</p>
                            <p className="text-sm text-gray-500">Price: ${((appointment.services?.price || 0) / 100).toFixed(2)}</p>
                          </div>
                          {appointment.notes && (
                            <div>
                              <p className="text-sm text-gray-500">Notes: {appointment.notes}</p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <Link href={`/admin/appointments/create?clientId=${client.id}`}>
                          <Button variant="outline" size="sm">
                            Rebook
                          </Button>
                        </Link>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10">
                  <p className="text-gray-500">No cancelled appointments.</p>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
