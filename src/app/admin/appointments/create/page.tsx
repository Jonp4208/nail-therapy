'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { format, addDays, parseISO } from 'date-fns';
import ReactCalendar from '@/components/ui/ReactCalendar';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import Textarea from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/SelectNew';
import Checkbox from '@/components/ui/Checkbox';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/types/database.types';
import Link from 'next/link';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import CreateClientModal from '@/components/CreateClientModal';
import { PlusCircle } from 'lucide-react';

type Service = Database['public']['Tables']['services']['Row'];
type Profile = Database['public']['Tables']['profiles']['Row'];

export default function CreateAppointmentPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [clients, setClients] = useState<Profile[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [availableTimes, setAvailableTimes] = useState<string[]>([]);

  // Form state
  const [clientId, setClientId] = useState<string>('');
  const [serviceId, setServiceId] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [depositPaid, setDepositPaid] = useState<boolean>(false);
  const [status, setStatus] = useState<string>('pending');

  // Client creation modal state
  const [isClientModalOpen, setIsClientModalOpen] = useState(false);

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Don't check admin status if still loading auth state
    if (authLoading) {
      return;
    }

    const checkAdminStatus = async () => {
      try {
        // If no user is logged in, redirect to login
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // If not admin, redirect to dashboard
        if (!profile?.is_admin) {
          router.push('/dashboard');
          return;
        }

        // User is admin, set state and fetch data
        setIsAdmin(true);

        // Fetch services and clients
        await Promise.all([
          fetchServices(),
          fetchClients()
        ]);

        // Check for client ID in URL query params
        const urlParams = new URLSearchParams(window.location.search);
        const clientIdParam = urlParams.get('clientId');

        if (clientIdParam) {
          setClientId(clientIdParam);
        }

        setLoading(false);
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading, supabase, router]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (
            id,
            name
          )
        `)
        .eq('is_active', true)
        .order('name');

      if (error) {
        throw error;
      }

      setServices(data || []);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message);
    }
  };

  const fetchClients = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_admin', false)
        .order('full_name');

      if (error) {
        throw error;
      }

      setClients(data || []);
    } catch (err: any) {
      console.error('Error fetching clients:', err);
      setError(err.message);
    }
  };

  const generateTimeSlots = () => {
    // Generate time slots from 9 AM to 7 PM
    const times = [];
    for (let hour = 9; hour < 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const formattedHour = hour.toString().padStart(2, '0');
        const formattedMinute = minute.toString().padStart(2, '0');
        times.push(`${formattedHour}:${formattedMinute}`);
      }
    }
    return times;
  };

  useEffect(() => {
    // When date changes, update available times
    const checkAvailability = async () => {
      try {
        const formattedDate = format(selectedDate, 'yyyy-MM-dd');

        // Get booked appointments for the selected date
        const { data: bookedSlots, error } = await supabase
          .from('appointments')
          .select('appointment_time')
          .eq('appointment_date', formattedDate)
          .in('status', ['pending', 'confirmed']);

        if (error) {
          throw error;
        }

        // Get blackout dates that include this date
        const { data: blackoutDates, error: blackoutError } = await supabase
          .from('blackout_dates')
          .select('*')
          .lte('start_date', formattedDate)
          .gte('end_date', formattedDate);

        if (blackoutError) {
          throw blackoutError;
        }

        // Start with all default time slots
        let availableSlots = generateTimeSlots();

        // Filter out booked time slots
        if (bookedSlots && bookedSlots.length > 0) {
          const bookedTimes = bookedSlots.map(slot => slot.appointment_time);
          availableSlots = availableSlots.filter(
            slot => !bookedTimes.includes(slot)
          );
        }

        // Filter out blackout times
        if (blackoutDates && blackoutDates.length > 0) {
          // Check each blackout date
          blackoutDates.forEach(blackout => {
            if (blackout.all_day) {
              // If it's an all-day blackout, remove all time slots
              availableSlots = [];
            } else if (blackout.start_time && blackout.end_time) {
              // Remove time slots that fall within the blackout time range
              availableSlots = availableSlots.filter(slot => {
                return slot < blackout.start_time || slot >= blackout.end_time;
              });
            }
          });
        }

        setAvailableTimes(availableSlots);
      } catch (err) {
        console.error('Error checking availability:', err);
        // Fallback to all time slots if there's an error
        setAvailableTimes(generateTimeSlots());
      }
    };

    checkAvailability();
    setSelectedTime('');
  }, [selectedDate, supabase]);

  // Handle client creation from modal
  const handleClientCreated = (newClientId: string, clientName: string) => {
    // Set the newly created client as the selected client
    setClientId(newClientId);

    // Refresh the clients list
    fetchClients();

    toast({
      title: 'Client Selected',
      description: `${clientName} has been selected for this appointment.`,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!clientId || !serviceId || !selectedDate || !selectedTime) {
      setError('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Format date for database
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Create appointment
      const { data: appointment, error: appointmentError } = await supabase
        .from('appointments')
        .insert({
          user_id: clientId,
          service_id: serviceId,
          appointment_date: formattedDate,
          appointment_time: selectedTime,
          status: status,
          notes: notes,
          deposit_paid: depositPaid,
        })
        .select()
        .single();

      if (appointmentError) {
        throw appointmentError;
      }

      toast({
        title: 'Appointment Created',
        description: 'The appointment has been successfully created.',
      });

      // Redirect to admin dashboard
      router.push('/admin');
    } catch (err: any) {
      console.error('Error creating appointment:', err);
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700 mb-4"></div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
            <p className="mt-4 text-lg text-gray-600">Please wait while we prepare your form</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Access Denied</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              You do not have permission to access this page.
            </p>
            <div className="mt-10">
              <Link href="/dashboard">
                <Button className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-6 rounded-lg transition-colors">
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
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Create Appointment</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Schedule a new appointment for a client
          </p>
        </div>

        <div className="mx-auto max-w-2xl">
          <Card className="shadow-md border border-slate-200 rounded-xl overflow-hidden">
            <CardHeader className="bg-gradient-to-r from-slate-700 to-slate-800 text-white">
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription className="text-slate-200">
                Fill in the details for the new appointment
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6">
              <form onSubmit={handleSubmit}>
                {error && (
                  <div className="mb-4 p-4 text-sm text-red-800 rounded-lg bg-red-50">
                    {error}
                  </div>
                )}

                <div className="space-y-6">
                  {/* Client Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="client">Client</Label>
                    <Select
                      value={clientId}
                      onValueChange={(value) => {
                        if (value === 'new') {
                          setIsClientModalOpen(true);
                        } else {
                          setClientId(value);
                        }
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                      <SelectContent>
                        {clients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.full_name} {client.phone ? `(${client.phone})` : ''}
                          </SelectItem>
                        ))}
                        <div className="py-2 px-2 border-t border-slate-200 mt-2">
                          <SelectItem value="new" className="flex items-center text-slate-700 font-medium">
                            <PlusCircle className="mr-2 h-4 w-4 text-slate-600" />
                            Create New Client
                          </SelectItem>
                        </div>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Service Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="service">Service</Label>
                    <Select
                      value={serviceId}
                      onValueChange={setServiceId}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                      <SelectContent>
                        {services.map((service) => (
                          <SelectItem key={service.id} value={service.id}>
                            {service.name} - ${(service.price / 100).toFixed(2)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Date Selection */}
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <div className="w-full shadow-sm">
                      <ReactCalendar
                        value={selectedDate}
                        onChange={(date) => date instanceof Date && setSelectedDate(date)}
                        minDate={new Date()}
                      />
                    </div>
                    <div className="text-center mt-2 text-sm text-slate-500">
                      Selected: <span className="font-medium text-slate-700">{selectedDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>

                  {/* Time Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="time">Time</Label>
                    <Select
                      value={selectedTime}
                      onValueChange={setSelectedTime}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select a time" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableTimes.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select
                      value={status}
                      onValueChange={setStatus}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Notes */}
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any special requests or notes"
                      rows={3}
                    />
                  </div>

                  {/* Deposit Paid */}
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="depositPaid"
                      checked={depositPaid}
                      onCheckedChange={(checked) => setDepositPaid(checked === true)}
                    />
                    <Label htmlFor="depositPaid">Deposit Paid</Label>
                  </div>
                </div>

                <div className="mt-8 flex justify-end space-x-4">
                  <Link href="/admin">
                    <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors" type="button">
                      Cancel
                    </Button>
                  </Link>
                  <Button
                    className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                    type="submit"
                    disabled={submitting}
                  >
                    {submitting ? 'Creating...' : 'Create Appointment'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Client Creation Modal */}
      {isClientModalOpen && (
        <CreateClientModal
          isOpen={isClientModalOpen}
          onClose={() => setIsClientModalOpen(false)}
          onClientCreated={handleClientCreated}
        />
      )}
    </div>
  );
}
