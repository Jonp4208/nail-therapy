'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Button from '@/components/ui/Button';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import ReviewsList from '@/components/ReviewsList';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { supabase } = useSupabaseContext();

  const serviceId = params.id as string;

  const [service, setService] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    fetchServiceDetails();
  }, [supabase, serviceId]);

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

  // Format price for display
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(service.price / 100);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            <div className="relative h-96 overflow-hidden rounded-lg">
              {service.image_url ? (
                <Image
                  src={service.image_url}
                  alt={service.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500 font-medium">{service.name}</span>
                </div>
              )}
            </div>

            <div>
              <h1 className="text-3xl font-bold tracking-tight text-gray-900">{service.name}</h1>

              <div className="mt-2 flex items-center">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <span key={star} className={service.average_rating && star <= Math.round(service.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                      ★
                    </span>
                  ))}
                </div>
                <Link href={`/services/${serviceId}/reviews`} className="ml-2 text-sm text-pink-600 hover:underline">
                  {service.review_count
                    ? `${service.review_count} ${service.review_count === 1 ? 'review' : 'reviews'}`
                    : 'No reviews yet'}
                </Link>
              </div>

              <p className="mt-4 text-2xl font-bold text-gray-900">{formattedPrice}</p>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <h2 className="text-lg font-medium text-gray-900">Description</h2>
                <p className="mt-2 text-gray-700">{service.description}</p>
              </div>

              <div className="mt-4 border-t border-gray-200 pt-4">
                <h2 className="text-lg font-medium text-gray-900">Duration</h2>
                <p className="mt-2 text-gray-700">{service.duration} minutes</p>
              </div>

              <div className="mt-8">
                <Link href={`/book?service=${serviceId}`}>
                  <Button size="lg" className="w-full">Book Now</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="text-2xl font-bold tracking-tight text-gray-900">Recent Reviews</h2>
            <div className="mt-6">
              <ReviewsList serviceId={serviceId} limit={3} />

              <div className="mt-8 text-center">
                <Link href={`/services/${serviceId}/reviews`}>
                  <Button variant="outline">View All Reviews</Button>
                </Link>
              </div>
            </div>
          </div>

          <div className="mt-16 text-center">
            <Link href="/services">
              <Button variant="outline">Back to Services</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
