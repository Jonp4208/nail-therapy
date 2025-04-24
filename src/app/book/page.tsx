'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import DatePicker from '@/components/ui/DatePicker';
import Checkbox from '@/components/ui/Checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import { format } from 'date-fns';

// Default time slots
const defaultTimeSlots = [
  { value: '09:00', label: '9:00 AM' },
  { value: '10:00', label: '10:00 AM' },
  { value: '11:00', label: '11:00 AM' },
  { value: '12:00', label: '12:00 PM' },
  { value: '13:00', label: '1:00 PM' },
  { value: '14:00', label: '2:00 PM' },
  { value: '15:00', label: '3:00 PM' },
  { value: '16:00', label: '4:00 PM' },
  { value: '17:00', label: '5:00 PM' },
  { value: '18:00', label: '6:00 PM' },
];

export default function BookingPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  // Form state
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceId, setServiceId] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [notes, setNotes] = useState('');
  const [payDeposit, setPayDeposit] = useState(false);
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  // UI state
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [services, setServices] = useState<{value: string, label: string}[]>([]);
  const [timeSlots, setTimeSlots] = useState(defaultTimeSlots);

  // Fetch services from Supabase
  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            id,
            name,
            price,
            duration,
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

        if (data) {
          const formattedServices = data.map(service => ({
            value: service.id,
            label: `${service.name} - $${(service.price / 100).toFixed(2)}`
          }));

          setServices(formattedServices);
        }
      } catch (err) {
        console.error('Error fetching services:', err);
        // Fallback to default services if there's an error
        setServices([
          { value: '1', label: 'Classic Manicure - $25' },
          { value: '2', label: 'Gel Manicure - $35' },
          { value: '3', label: 'Spa Pedicure - $45' },
          { value: '4', label: 'Nail Extensions - $60' },
          { value: '5', label: 'Eyebrow Shaping - $15' },
          { value: '6', label: 'Eyebrow Tinting - $20' },
          { value: '7', label: 'Leg Waxing - $50' },
          { value: '8', label: 'Facial Waxing - $25' },
        ]);
      } finally {
        setLoading(false);
      }
    };

    // Populate form with user data if logged in
    const populateUserData = async () => {
      if (user) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('full_name, email, phone')
            .eq('id', user.id)
            .single();

          if (error) {
            throw error;
          }

          if (data) {
            const nameParts = data.full_name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setEmail(data.email || user.email || '');
            setPhone(data.phone || '');
          }
        } catch (err) {
          console.error('Error fetching user profile:', err);
          // Use data from auth if profile fetch fails
          if (user.user_metadata) {
            setFirstName(user.user_metadata.first_name || '');
            setLastName(user.user_metadata.last_name || '');
          }
          setEmail(user.email || '');
        }
      }
    };

    fetchServices();
    populateUserData();
  }, [supabase, user]);

  // Check for available time slots when date changes
  useEffect(() => {
    if (!selectedDate) return;

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

        // Filter out booked time slots
        if (bookedSlots && bookedSlots.length > 0) {
          const bookedTimes = bookedSlots.map(slot => slot.appointment_time);
          const availableSlots = defaultTimeSlots.filter(
            slot => !bookedTimes.includes(slot.value)
          );
          setTimeSlots(availableSlots);
        } else {
          // If no bookings, all slots are available
          setTimeSlots(defaultTimeSlots);
        }
      } catch (err) {
        console.error('Error checking availability:', err);
        // Fallback to all time slots if there's an error
        setTimeSlots(defaultTimeSlots);
      }
    };

    checkAvailability();
  }, [selectedDate, supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate form
    if (!selectedDate) {
      setError('Please select a date');
      return;
    }

    if (!selectedTime) {
      setError('Please select a time');
      return;
    }

    if (!serviceId) {
      setError('Please select a service');
      return;
    }

    if (!agreeToTerms) {
      setError('You must agree to the terms and conditions');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // Format date for database
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // If user is not authenticated, create a temporary profile or find existing one
      let userId = user ? user.id : null;

      if (!user) {
        console.log("Processing appointment for non-authenticated user:", email);

        // For non-authenticated users, we'll just store their information directly in the appointment
        // We won't try to create or update profiles due to RLS restrictions
        userId = null; // Keep this null for non-authenticated users

        // Note: We'll store the guest information directly in the appointment record below
      }

      // Use the API endpoint to create the appointment (bypasses RLS)
      let appointment;

      try {
        // Call our API endpoint
        const response = await fetch('/api/appointments', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            serviceId: serviceId,
            date: formattedDate,
            time: selectedTime,
            notes: notes,
            depositPaid: false,
            firstName: firstName,
            lastName: lastName,
            email: email,
            phone: phone
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          console.error("API error:", errorData);
          throw new Error(errorData.error || 'Failed to create appointment');
        }

        const data = await response.json();
        appointment = data.appointment;
        console.log("Appointment created successfully:", appointment);
      } catch (apiError) {
        console.error("API call failed:", apiError);
        throw apiError;
      }

      if (payDeposit) {
        // Redirect to payment page
        router.push(`/payment?appointmentId=${appointment.id}&serviceId=${serviceId}&isDeposit=true`);
      } else {
        // Redirect to confirmation page
        router.push(`/booking-confirmation?appointmentId=${appointment.id}`);
      }
    } catch (err: any) {
      console.error('Error booking appointment:', err);
      setError(err.message);
      setSubmitting(false);
    }
  };

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Book Your Appointment</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Schedule your nail, eyebrow, or waxing service with us. We can't wait to see you!
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                Fill out the form below to book your appointment. Required fields are marked with an asterisk (*).
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="First Name *"
                      type="text"
                      placeholder="Your first name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                    />

                    <Input
                      label="Last Name *"
                      type="text"
                      placeholder="Your last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="Email Address *"
                      type="email"
                      placeholder="Your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />

                    <Input
                      label="Phone Number *"
                      type="tel"
                      placeholder="Your phone number"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      required
                    />
                  </div>
                </div>

                {/* Service Selection */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Service Selection</h3>

                  <Select
                    label="Select Service *"
                    options={services}
                    value={serviceId}
                    onChange={(e) => setServiceId(e.target.value)}
                    required
                  />
                </div>

                {/* Appointment Time */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Appointment Time</h3>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <DatePicker
                        selected={selectedDate}
                        onChange={(date) => setSelectedDate(date)}
                        label="Select Date *"
                        minDate={new Date()}
                        placeholderText="Select a date"
                      />
                    </div>

                    <Select
                      label="Select Time *"
                      options={timeSlots}
                      value={selectedTime}
                      onChange={(e) => setSelectedTime(e.target.value)}
                      required
                      disabled={!selectedDate}
                    />
                  </div>
                </div>

                {/* Additional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900">Additional Information</h3>

                  <div className="space-y-2">
                    <Checkbox
                      label="I would like to pay a deposit to secure my appointment"
                      checked={payDeposit}
                      onChange={(e) => setPayDeposit(e.target.checked)}
                    />
                    <p className="text-sm text-gray-500">
                      A 25% deposit will be charged to secure your booking. This amount will be deducted from your final bill.
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Special Requests or Notes
                    </label>
                    <textarea
                      className="w-full rounded-md border border-gray-300 px-3 py-2 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                      rows={4}
                      placeholder="Any special requests or information we should know about"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                  </div>
                </div>

                {/* Terms and Conditions */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Checkbox
                      label="I agree to the terms and conditions *"
                      checked={agreeToTerms}
                      onChange={(e) => setAgreeToTerms(e.target.checked)}
                      required
                    />
                    <p className="text-sm text-gray-500">
                      By checking this box, you agree to our{' '}
                      <Link href="/terms" className="text-pink-600 hover:underline">
                        Terms of Service
                      </Link>{' '}
                      and{' '}
                      <Link href="/privacy" className="text-pink-600 hover:underline">
                        Privacy Policy
                      </Link>.
                    </p>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                  <Button type="submit" size="lg" className="w-full" isLoading={submitting}>
                    Book Appointment
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t px-6 py-4">
              <p className="text-sm text-gray-500">
                Need to cancel or reschedule? Please contact us at least 24 hours in advance.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Questions? Call us at <a href="tel:+15551234567" className="text-pink-600 hover:underline">+1 (555) 123-4567</a>
              </p>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
