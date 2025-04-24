'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import ReviewForm from '@/components/ReviewForm';
import ReviewsList from '@/components/ReviewsList';

export default function ServiceReviewsPage() {
  const params = useParams();
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const serviceId = params.id as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userAppointments, setUserAppointments] = useState<any[]>([]);

  useEffect(() => {
    const fetchServiceDetails = async () => {
      try {
        // Fetch service details
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            service_categories (
              id,
              name,
              description
            )
          `)
          .eq('id', serviceId)
          .single();

        if (error) {
          throw error;
        }

        setService(data);
      } catch (err: any) {
        console.error('Error fetching service details:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    const fetchUserAppointments = async () => {
      if (!user) return;

      try {
        // Fetch user's completed appointments for this service
        const { data, error } = await supabase
          .from('appointments')
          .select('id, status')
          .eq('user_id', user.id)
          .eq('service_id', serviceId)
          .eq('status', 'completed')
          .order('appointment_date', { ascending: false });

        if (error) {
          throw error;
        }

        // Check which appointments have already been reviewed
        if (data && data.length > 0) {
          const appointmentIds = data.map(app => app.id);

          const { data: reviews, error: reviewsError } = await supabase
            .from('reviews')
            .select('appointment_id')
            .in('appointment_id', appointmentIds);

          if (reviewsError) {
            throw reviewsError;
          }

          const reviewedAppointmentIds = reviews?.map(review => review.appointment_id) || [];

          // Filter out appointments that have already been reviewed
          const unreviewedAppointments = data.filter(
            app => !reviewedAppointmentIds.includes(app.id)
          );

          setUserAppointments(unreviewedAppointments);
        }
      } catch (err: any) {
        console.error('Error fetching user appointments:', err);
      }
    };

    fetchServiceDetails();
    fetchUserAppointments();
  }, [supabase, serviceId, user]);

  const handleReviewSuccess = () => {
    // Refresh the list of user appointments
    fetchUserAppointments();
  };

  const fetchUserAppointments = async () => {
    if (!user) return;

    try {
      // Fetch user's completed appointments for this service
      const { data, error } = await supabase
        .from('appointments')
        .select('id, status')
        .eq('user_id', user.id)
        .eq('service_id', serviceId)
        .eq('status', 'completed')
        .order('appointment_date', { ascending: false });

      if (error) {
        throw error;
      }

      // Check which appointments have already been reviewed
      if (data && data.length > 0) {
        const appointmentIds = data.map(app => app.id);

        const { data: reviews, error: reviewsError } = await supabase
          .from('reviews')
          .select('appointment_id')
          .in('appointment_id', appointmentIds);

        if (reviewsError) {
          throw reviewsError;
        }

        const reviewedAppointmentIds = reviews?.map(review => review.appointment_id) || [];

        // Filter out appointments that have already been reviewed
        const unreviewedAppointments = data.filter(
          app => !reviewedAppointmentIds.includes(app.id)
        );

        setUserAppointments(unreviewedAppointments);
      }
    } catch (err: any) {
      console.error('Error fetching user appointments:', err);
    }
  };

  if (loading || authLoading) {
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

  if (error || !service) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Error</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {error || 'Service not found'}
            </p>
            <div className="mt-10">
              <Link href="/services">
                <Button>Back to Services</Button>
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
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            {service.name} Reviews
          </h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            See what our customers are saying about this service
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Customer Reviews</CardTitle>
                  <CardDescription>
                    {service.review_count
                      ? `${service.review_count} ${service.review_count === 1 ? 'review' : 'reviews'} with an average rating of ${service.average_rating.toFixed(1)} out of 5`
                      : 'No reviews yet'}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ReviewsList serviceId={serviceId} limit={10} />
                </CardContent>
              </Card>
            </div>

            <div>
              {user ? (
                userAppointments.length > 0 ? (
                  <ReviewForm
                    serviceId={serviceId}
                    appointmentId={userAppointments[0].id}
                    onSuccess={handleReviewSuccess}
                  />
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Write a Review</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">
                        You can write a review after you've experienced this service.
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Link href="/book">
                        <Button>Book This Service</Button>
                      </Link>
                    </CardFooter>
                  </Card>
                )
              ) : (
                <Card>
                  <CardHeader>
                    <CardTitle>Write a Review</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-gray-500">
                      Please sign in to write a review.
                    </p>
                  </CardContent>
                  <CardFooter>
                    <Link href="/login">
                      <Button>Sign In</Button>
                    </Link>
                  </CardFooter>
                </Card>
              )}
            </div>
          </div>

          <div className="mt-8 text-center">
            <Link href={`/services/${serviceId}`}>
              <Button variant="outline">Back to Service Details</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
