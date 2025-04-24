'use client';

import React, { useEffect, useState } from 'react';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';

const SupabaseTest = () => {
  const { supabase } = useSupabaseContext();
  const [services, setServices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const { data, error } = await supabase
          .from('services')
          .select('*')
          .limit(5);

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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Supabase Connection Test</CardTitle>
        <CardDescription>Testing connection to your Supabase database</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p>Loading services...</p>
        ) : error ? (
          <div className="p-4 bg-red-50 text-red-700 rounded-md">
            <h3 className="font-bold">Error connecting to Supabase:</h3>
            <p>{error}</p>
          </div>
        ) : services.length === 0 ? (
          <p>No services found in the database.</p>
        ) : (
          <div>
            <h3 className="font-medium mb-2">Services from your database:</h3>
            <ul className="space-y-2">
              {services.map((service) => (
                <li key={service.id} className="p-3 bg-gray-50 rounded-md">
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-gray-500">${(service.price / 100).toFixed(2)} • {service.duration} min</div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default SupabaseTest;
