'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format } from 'date-fns';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import CalendarLinks from '@/components/CalendarLinks';

// Create a client component that uses useSearchParams
function BookingConfirmationContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { supabase } = useSupabaseContext();

  const appointmentId = searchParams.get('appointmentId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [appointment, setAppointment] = useState<any>(null);
  const [service, setService] = useState<any>(null);

  useEffect(() => {
    if (!appointmentId) {
      router.push('/book');
      return;
    }

    const fetchAppointmentDetails = async () => {
      try {
        // Use the API endpoint to fetch appointment details (bypasses RLS)
        const response = await fetch(`/api/appointments/${appointmentId}`);

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch appointment details');
        }

        const data = await response.json();

        if (data.appointment) {
          setAppointment(data.appointment);
          setService(data.appointment.services);
        } else {
          throw new Error('Appointment not found');
        }
      } catch (err: any) {
        console.error('Error fetching appointment details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointmentDetails();
  }, [appointmentId, router, supabase]);

  if (loading) {
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

  if (error || !appointment) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Error</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {error || 'An error occurred while fetching your appointment details.'}
            </p>
            <div className="mt-10">
              <Link href="/book">
                <Button>Try Booking Again</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Format date and time for display
  const appointmentDate = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
  const formattedDate = format(appointmentDate, 'EEEE, MMMM d, yyyy');
  const formattedTime = format(appointmentDate, 'h:mm a');

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Booking Confirmed!</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Your appointment has been successfully booked. We look forward to seeing you!
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <Card>
            <CardHeader>
              <CardTitle>Appointment Details</CardTitle>
              <CardDescription>
                Please save this information for your records.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Service</h3>
                <p className="mt-1 text-gray-600">{service.name}</p>
                <p className="mt-1 text-gray-600">${(service.price / 100).toFixed(2)}</p>
              </div>

              <div className="border-b border-gray-200 pb-4">
                <h3 className="text-lg font-medium text-gray-900">Date & Time</h3>
                <p className="mt-1 text-gray-600">{formattedDate}</p>
                <p className="mt-1 text-gray-600">{formattedTime}</p>
              </div>

              {appointment.notes && (
                <div className="border-b border-gray-200 pb-4">
                  <h3 className="text-lg font-medium text-gray-900">Special Requests</h3>
                  <p className="mt-1 text-gray-600">{appointment.notes}</p>
                </div>
              )}

              <div>
                <h3 className="text-lg font-medium text-gray-900">Status</h3>
                <div className="mt-1">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                    {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                  </span>
                </div>
              </div>

              {/* Calendar Links */}
              <CalendarLinks
                serviceName={service.name}
                appointmentDate={appointment.appointment_date}
                appointmentTime={appointment.appointment_time}
                durationMinutes={service.duration || 60}
              />
            </CardContent>
            <CardFooter className="flex flex-col items-start border-t px-6 py-4">
              <p className="text-sm text-gray-500">
                Need to cancel or reschedule? Please contact us at least 24 hours in advance.
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Questions? Call us at <a href="tel:+15551234567" className="text-pink-600 hover:underline">+1 (555) 123-4567</a>
              </p>
              <div className="mt-6 w-full">
                <Link href="/dashboard">
                  <Button className="w-full">Go to Dashboard</Button>
                </Link>
              </div>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}

// Loading fallback component
function BookingConfirmationLoading() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Please wait while we fetch your booking details.
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component that uses Suspense
export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<BookingConfirmationLoading />}>
      <BookingConfirmationContent />
    </Suspense>
  );
}
