'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import DirectImage from '@/components/ui/DirectImage';
import { motion } from 'framer-motion';
import { Star, Clock, Sparkles } from 'lucide-react';

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
      <div className="bg-gradient-to-b from-pink-50 to-white py-24 sm:py-32">
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
      <div className="bg-gradient-to-b from-pink-50 to-white py-24 sm:py-32">
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
    <div className="bg-gradient-to-b from-pink-50 to-white">
      <div className="mx-auto max-w-7xl px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Services</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Discover our range of professional services designed to enhance your natural beauty.
          </p>
        </div>

        {/* Category Navigation */}
        <nav className="sticky top-0 z-10 bg-white bg-opacity-90 backdrop-blur border-b border-pink-100 mb-8 py-2">
          <ul className="flex justify-center gap-6">
            <li><a href="#nail-services" className="text-pink-600 font-semibold hover:underline focus:underline">Nails</a></li>
            <li><a href="#eyebrow-services" className="text-pink-600 font-semibold hover:underline focus:underline">Eyebrows</a></li>
            <li><a href="#waxing-services" className="text-pink-600 font-semibold hover:underline focus:underline">Waxing</a></li>
          </ul>
        </nav>

        {/* Nail Services */}
        <div id="nail-services" className="mx-auto max-w-2xl lg:max-w-none mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Nail Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nailServices.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.03 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden h-full flex flex-col shadow-lg rounded-xl bg-gradient-to-br from-white to-pink-50 hover:shadow-2xl transition-shadow">
                  <div className="aspect-w-16 aspect-h-9 relative h-48">
                    {service.image_url ? (
                      <DirectImage
                        src={service.image_url}
                        alt={service.name + ' - ' + (service.service_categories?.name || '')}
                        className="object-cover w-full h-full rounded-t-xl"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center rounded-t-xl">
                        <span className="text-gray-500 font-medium">{service.name}</span>
                      </div>
                    )}
                    <span className="absolute top-2 left-2 bg-pink-100 text-pink-700 text-xs font-bold px-3 py-1 rounded-full shadow-sm">
                      {service.service_categories?.name}
                    </span>
                  </div>
                  <CardHeader>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">{service.name}</h3>
                    <CardDescription>
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-pink-600">
                          ${(service.price / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {service.duration} min
                        </span>
                      </div>
                      {service.review_count > 0 && (
                        <div className="flex items-center mt-2">
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={service.average_rating && star <= Math.round(service.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">
                            {service.average_rating ? service.average_rating.toFixed(1) : ''}/5 ({service.review_count} reviews)
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600">{service.description}</p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-2 w-full">
                      <Link href={`/services/${service.id}`} className="flex-1" tabIndex={0} aria-label={`Details for ${service.name}`}>
                        <Button variant="outline" className="w-full">Details</Button>
                      </Link>
                      <Link href={`/book?service=${service.id}`} className="flex-1" tabIndex={0} aria-label={`Book ${service.name}`}>
                        <Button className="w-full bg-pink-600 hover:bg-pink-700">Book Now</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Eyebrow Services */}
        <div id="eyebrow-services" className="mx-auto max-w-2xl lg:max-w-none mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Eyebrow Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eyebrowServices.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
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
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-pink-600">
                          ${(service.price / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {service.duration} min
                        </span>
                      </div>
                      {service.review_count > 0 && (
                        <div className="flex items-center mt-2">
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={service.average_rating && star <= Math.round(service.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">
                            ({service.review_count} reviews)
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600">{service.description}</p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-2 w-full">
                      <Link href={`/services/${service.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">Details</Button>
                      </Link>
                      <Link href={`/book?service=${service.id}`} className="flex-1">
                        <Button className="w-full bg-pink-600 hover:bg-pink-700">Book Now</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Waxing Services */}
        <div id="waxing-services" className="mx-auto max-w-2xl lg:max-w-none mb-16">
          <h2 className="text-2xl font-bold tracking-tight text-gray-900 mb-8">Waxing Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {waxingServices.map((service) => (
              <motion.div
                key={service.id}
                whileHover={{ scale: 1.02 }}
                transition={{ duration: 0.2 }}
              >
                <Card className="overflow-hidden h-full flex flex-col">
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
                      <div className="flex items-center justify-between">
                        <span className="text-lg font-semibold text-pink-600">
                          ${(service.price / 100).toFixed(2)}
                        </span>
                        <span className="text-sm text-gray-500">
                          {service.duration} min
                        </span>
                      </div>
                      {service.review_count > 0 && (
                        <div className="flex items-center mt-2">
                          <div className="flex text-yellow-400">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <span key={star} className={service.average_rating && star <= Math.round(service.average_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="ml-1 text-xs text-gray-500">
                            ({service.review_count} reviews)
                          </span>
                        </div>
                      )}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-600">{service.description}</p>
                  </CardContent>
                  <CardFooter>
                    <div className="flex space-x-2 w-full">
                      <Link href={`/services/${service.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">Details</Button>
                      </Link>
                      <Link href={`/book?service=${service.id}`} className="flex-1">
                        <Button className="w-full bg-pink-600 hover:bg-pink-700">Book Now</Button>
                      </Link>
                    </div>
                  </CardFooter>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="mx-auto max-w-7xl px-6 lg:px-8 py-16">
          <div className="mx-auto max-w-2xl text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Why Choose Us?</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              We combine expertise with premium products to deliver exceptional results every time.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Sparkles className="h-5 w-5 flex-none text-pink-600" />
                  Premium Quality
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">We use only the highest quality products and tools to ensure the best results for our clients.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Star className="h-5 w-5 flex-none text-pink-600" />
                  Expert Technicians
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Our team consists of highly trained professionals with years of experience in their craft.</p>
                </dd>
              </div>
              <div className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7 text-gray-900">
                  <Clock className="h-5 w-5 flex-none text-pink-600" />
                  Convenient Booking
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-gray-600">
                  <p className="flex-auto">Easy online booking system with flexible scheduling to fit your busy lifestyle.</p>
                </dd>
              </div>
            </dl>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-pink-600 rounded-3xl">
          <div className="mx-auto max-w-7xl py-16 px-6 sm:py-24 lg:px-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Transform Your Look?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-lg leading-8 text-pink-100">
                Book your appointment today and experience the difference of our premium services.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link href="/book">
                  <Button size="lg" className="bg-white text-pink-600 hover:bg-pink-50">
                    Book Now
                  </Button>
                </Link>
                <Link href="/contact" className="text-sm font-semibold leading-6 text-white">
                  Contact Us <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
