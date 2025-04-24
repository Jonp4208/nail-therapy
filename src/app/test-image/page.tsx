'use client';

import React from 'react';
import Image from 'next/image';

export default function TestImagePage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Test Image</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Testing image loading from Unsplash
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-lg">
          <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-lg bg-gray-200">
            <Image
              src="https://images.unsplash.com/photo-1604902396830-aca29e19b067?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=600&h=600&q=80"
              alt="Test image"
              width={600}
              height={600}
              className="h-full w-full object-cover object-center"
              unoptimized
            />
          </div>
        </div>
      </div>
    </div>
  );
}
