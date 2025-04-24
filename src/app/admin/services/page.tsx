'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { Textarea } from '@/components/ui/Textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/SelectNew';
import { Switch } from '@/components/ui/Switch';
import { toast } from '@/components/ui/use-toast';
import { Database } from '@/types/database.types';
import Link from 'next/link';
import { Pencil, Trash2, Plus } from 'lucide-react';
import { useSupabaseContext } from '@/context/SupabaseProvider';

type Service = Database['public']['Tables']['services']['Row'] & {
  service_categories?: { id: string; name: string } | null;
};

type ServiceCategory = Database['public']['Tables']['service_categories']['Row'];

export default function ManageServicesPage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [services, setServices] = useState<Service[]>([]);
  const [categories, setCategories] = useState<ServiceCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Check if user is admin
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Don't check admin status if still loading auth state
    if (authLoading) {
      return;
    }

    const checkAdminStatus = async () => {
      try {
        // If no user is logged in, redirect to login
        if (!user) {
          router.push('/login');
          return;
        }

        // Check if user is admin
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('is_admin')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        // If not admin, redirect to dashboard
        if (!profile?.is_admin) {
          router.push('/dashboard');
          return;
        }

        // User is admin, set state and fetch data
        setIsAdmin(true);

        // Fetch services and categories
        await Promise.all([
          fetchServices(),
          fetchCategories()
        ]);

        setLoading(false);
      } catch (err: any) {
        console.error('Error checking admin status:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    checkAdminStatus();
  }, [user, authLoading, supabase, router]);

  const fetchServices = async () => {
    try {
      const { data, error } = await supabase
        .from('services')
        .select(`
          *,
          service_categories (
            id,
            name
          )
        `)
        .order('name');

      if (error) {
        throw error;
      }

      setServices(data || []);
    } catch (err: any) {
      console.error('Error fetching services:', err);
      setError(err.message);
    }
  };

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('service_categories')
        .select('*')
        .order('name');

      if (error) {
        throw error;
      }

      setCategories(data || []);
    } catch (err: any) {
      console.error('Error fetching categories:', err);
      setError(err.message);
    }
  };

  const handleToggleActive = async (serviceId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('services')
        .update({ is_active: !currentStatus })
        .eq('id', serviceId);

      if (error) {
        throw error;
      }

      // Update local state
      setServices(services.map(service =>
        service.id === serviceId
          ? { ...service, is_active: !currentStatus }
          : service
      ));

      toast({
        title: 'Service Updated',
        description: `Service has been ${!currentStatus ? 'activated' : 'deactivated'}.`,
      });
    } catch (err: any) {
      console.error('Error updating service:', err);
      toast({
        title: 'Error',
        description: err.message,
        variant: 'destructive',
      });
    }
  };

  const filteredServices = selectedCategory === 'all'
    ? services
    : services.filter(service => service.category_id === selectedCategory);

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-slate-700 mb-4"></div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
            <p className="mt-4 text-lg text-gray-600">Please wait while we prepare your services</p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <div className="inline-block p-4 bg-red-50 rounded-full mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Access Denied</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              You do not have permission to access this page.
            </p>
            <div className="mt-10">
              <Link href="/dashboard">
                <Button className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-6 rounded-lg transition-colors">
                  Go to User Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-16 sm:py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Manage Services</h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Add, edit, and manage your service offerings
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-7xl">
          {error && (
            <div className="mb-6 p-4 text-sm text-red-800 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-4">
              <Label htmlFor="category-filter">Filter by Category:</Label>
              <Select
                value={selectedCategory}
                onValueChange={setSelectedCategory}
              >
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Link href="/admin/services/create">
              <Button className="bg-slate-700 hover:bg-slate-800 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                <Plus className="mr-2 h-4 w-4" />
                Add New Service
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <Card key={service.id} className={`shadow-md border border-slate-200 rounded-xl overflow-hidden ${!service.is_active ? 'opacity-70' : ''}`}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-xl">{service.name}</CardTitle>
                      <div className="flex items-center space-x-2">
                        <Switch
                          checked={service.is_active}
                          onCheckedChange={() => handleToggleActive(service.id, service.is_active)}
                        />
                        <span className="text-sm text-gray-500">
                          {service.is_active ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    <CardDescription>
                      {service.service_categories?.name || 'Uncategorized'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-gray-500">Price:</span>
                        <span className="font-medium">${(service.price / 100).toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-500">Duration:</span>
                        <span className="font-medium">{service.duration} minutes</span>
                      </div>
                      {service.description && (
                        <div className="mt-4">
                          <p className="text-sm text-gray-600">{service.description}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                  <CardFooter className="flex justify-end space-x-2">
                    <Link href={`/admin/services/${service.id}`}>
                      <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-1 px-3 rounded-lg transition-colors text-sm" size="sm">
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                      </Button>
                    </Link>
                    <Button className="bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 font-medium py-1 px-3 rounded-lg transition-colors text-sm" size="sm">
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-gray-500">No services found. Add a new service to get started.</p>
              </div>
            )}
          </div>

          <div className="mt-10 flex justify-between">
            <Link href="/admin">
              <Button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium py-2 px-4 rounded-lg transition-colors">
                Back to Dashboard
              </Button>
            </Link>
            <Link href="/admin/services/categories">
              <Button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors">
                Manage Categories
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
