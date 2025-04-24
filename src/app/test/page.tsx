'use client';

import React from 'react';
import SupabaseTest from '@/components/test/SupabaseTest';

export default function TestPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Supabase Connection Test</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            This page tests the connection to your Supabase database.
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-2xl">
          <SupabaseTest />
        </div>
      </div>
    </div>
  );
}
