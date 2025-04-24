'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import DirectImage from '@/components/ui/DirectImage';

interface ServiceCategory {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image_url?: string;
}

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category_id: string;
  image_url: string;
  is_active: boolean;
  average_rating: number;
  review_count: number;
  service_categories?: ServiceCategory;
}

export default function ServicesPage() {
  const { supabase } = useSupabaseContext();

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select(`
            *,
            service_categories (
              id,
              name,
              slug,
              description
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
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [supabase]);

  // Group services by category
  const nailServices = services.filter(service =>
    service.service_categories?.slug === 'nails'
  );

  const eyebrowServices = services.filter(service =>
    service.service_categories?.slug === 'eyebrows'
  );

  const waxingServices = services.filter(service =>
    service.service_categories?.slug === 'waxing'
  );

  if (loading) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading Services...</h2>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Error</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              {error}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Services</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            We offer a wide range of professional nail, eyebrow, and waxing services to help you look and feel your best.
          </p>
        </div>

        {/* Nail Services */}
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:max-w-none">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Nail Services</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {nailServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative h-48">
                  {service.image_url ? (
                    <DirectImage
                      src={service.image_url}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">{service.name}</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>
                    ${(service.price / 100).toFixed(2)} • {service.duration} min
                    {service.review_count > 0 && (
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={service.average_rating && star <= Math.round(service.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="ml-1 text-xs">
                          ({service.review_count})
                        </span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2 w-full">
                    <Link href={`/services/${service.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Details</Button>
                    </Link>
                    <Link href={`/book?service=${service.id}`} className="flex-1">
                      <Button className="w-full">Book</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Eyebrow Services */}
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Eyebrow Services</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {eyebrowServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative h-48">
                  {service.image_url ? (
                    <DirectImage
                      src={service.image_url}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">{service.name}</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>
                    ${(service.price / 100).toFixed(2)} • {service.duration} min
                    {service.review_count > 0 && (
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={service.average_rating && star <= Math.round(service.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="ml-1 text-xs">
                          ({service.review_count})
                        </span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2 w-full">
                    <Link href={`/services/${service.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Details</Button>
                    </Link>
                    <Link href={`/book?service=${service.id}`} className="flex-1">
                      <Button className="w-full">Book</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* Waxing Services */}
        <div className="mx-auto mt-16 max-w-2xl lg:max-w-none">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Waxing Services</h3>
          <div className="grid grid-cols-1 gap-x-6 gap-y-10 sm:grid-cols-2 lg:grid-cols-3 xl:gap-x-8">
            {waxingServices.map((service) => (
              <Card key={service.id} className="overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 relative h-48">
                  {service.image_url ? (
                    <DirectImage
                      src={service.image_url}
                      alt={service.name}
                      className="object-cover w-full h-full"
                    />
                  ) : (
                    <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-500 font-medium">{service.name}</span>
                    </div>
                  )}
                </div>
                <CardHeader>
                  <CardTitle>{service.name}</CardTitle>
                  <CardDescription>
                    ${(service.price / 100).toFixed(2)} • {service.duration} min
                    {service.review_count > 0 && (
                      <div className="flex items-center mt-1">
                        <div className="flex text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <span key={star} className={service.average_rating && star <= Math.round(service.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                              ★
                            </span>
                          ))}
                        </div>
                        <span className="ml-1 text-xs">
                          ({service.review_count})
                        </span>
                      </div>
                    )}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">{service.description}</p>
                </CardContent>
                <CardFooter>
                  <div className="flex space-x-2 w-full">
                    <Link href={`/services/${service.id}`} className="flex-1">
                      <Button variant="outline" className="w-full">Details</Button>
                    </Link>
                    <Link href={`/book?service=${service.id}`} className="flex-1">
                      <Button className="w-full">Book</Button>
                    </Link>
                  </div>
                </CardFooter>
              </Card>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">Ready to book your appointment?</h3>
          <div className="mt-6">
            <Link href="/book">
              <Button size="lg">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
