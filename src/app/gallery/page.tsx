'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Button from '@/components/ui/Button';

// Mock data for gallery - in a real app, this would come from the database
const galleryItems = [
  {
    id: '1',
    title: 'Pink Ombre Nails',
    description: 'Gradient pink ombre with glitter accent.',
    image: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'nails',
  },
  {
    id: '2',
    title: 'French Manicure',
    description: 'Classic French manicure with a modern twist.',
    image: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'nails',
  },
  {
    id: '3',
    title: 'Gel Extensions',
    description: 'Long-lasting gel extensions with custom design.',
    image: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'nails',
  },
  {
    id: '4',
    title: 'Nail Art',
    description: 'Intricate nail art with rhinestones.',
    image: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'nails',
  },
  {
    id: '5',
    title: 'Eyebrow Shaping',
    description: 'Perfectly shaped eyebrows to frame your face.',
    image: 'https://images.unsplash.com/photo-1594641266925-8cbe33f4e4a9?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'eyebrows',
  },
  {
    id: '6',
    title: 'Eyebrow Tinting',
    description: 'Enhanced eyebrows with professional tinting.',
    image: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'eyebrows',
  },
  {
    id: '7',
    title: 'Leg Waxing',
    description: 'Smooth, hair-free legs that last for weeks.',
    image: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'waxing',
  },
  {
    id: '8',
    title: 'Facial Waxing',
    description: 'Gentle facial waxing for a smooth complexion.',
    image: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80',
    category: 'waxing',
  },
];

export default function GalleryPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Gallery</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Browse through our portfolio of nail designs, eyebrow transformations, and waxing results.
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div className="mt-10 flex justify-center space-x-4">
          <button className="px-4 py-2 text-sm font-medium text-pink-600 border-b-2 border-pink-600">
            All
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-pink-600">
            Nails
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-pink-600">
            Eyebrows
          </button>
          <button className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-pink-600">
            Waxing
          </button>
        </div>

        {/* Gallery Grid */}
        <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {galleryItems.map((item) => (
            <div key={item.id} className="group relative overflow-hidden rounded-lg">
              <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
                <Image
                  src={item.image}
                  alt={item.title}
                  width={600}
                  height={600}
                  className="h-full w-full object-cover object-center group-hover:opacity-75"
                />
              </div>
              <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                <p className="mt-1 text-sm text-gray-100">{item.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">Like what you see?</h3>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Book an appointment today to get your own stunning nails, eyebrows, or waxing service.
          </p>
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
