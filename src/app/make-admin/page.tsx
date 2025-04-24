'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSupabaseContext } from '@/context/SupabaseProvider';
import Button from '@/components/ui/Button';
import Link from 'next/link';

export default function MakeAdminPage() {
  const router = useRouter();
  const { supabase, user, loading } = useSupabaseContext();
  
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [adminStatus, setAdminStatus] = useState<boolean | string | null>(null);
  
  const checkAdminStatus = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setAdminStatus(data.is_admin);
    } catch (err: any) {
      console.error('Error checking admin status:', err);
      setError(err.message);
    }
  };
  
  const makeAdmin = async () => {
    if (!user) return;
    
    setUpdating(true);
    setError(null);
    
    try {
      // Update the user to be an admin
      const { error } = await supabase
        .from('profiles')
        .update({ is_admin: true })
        .eq('id', user.id);
        
      if (error) throw error;
      
      setSuccess(true);
      setAdminStatus(true);
      
      // Wait 2 seconds then redirect to admin page
      setTimeout(() => {
        router.push('/admin');
      }, 2000);
      
    } catch (err: any) {
      console.error('Error making admin:', err);
      setError(err.message);
    } finally {
      setUpdating(false);
    }
  };
  
  // Check admin status when component mounts
  if (user && adminStatus === null && !loading) {
    checkAdminStatus();
  }
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32 flex items-center justify-center">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Not Logged In</h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Please log in to access this page.
            </p>
            <div className="mt-10">
              <Link href="/login">
                <Button>Go to Login</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32 flex items-center justify-center">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Admin Access</h2>
          
          {error && (
            <div className="mt-6 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-6 p-4 text-sm text-green-800 rounded-lg bg-green-50 border border-green-200">
              Successfully set as admin! Redirecting to admin page...
            </div>
          )}
          
          <div className="mt-8 p-6 bg-white rounded-xl shadow-sm border border-slate-200">
            <p className="text-lg text-gray-700 mb-4">
              Current user: <span className="font-semibold">{user.email}</span>
            </p>
            
            <p className="text-lg text-gray-700 mb-6">
              Admin status: {' '}
              {adminStatus === null ? (
                'Checking...'
              ) : (
                <span className={adminStatus ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
                  {adminStatus ? 'Yes' : 'No'}
                </span>
              )}
            </p>
            
            {adminStatus ? (
              <div className="mt-6">
                <p className="text-green-600 font-medium">
                  You already have admin access.
                </p>
                <div className="mt-4">
                  <Link href="/admin">
                    <Button>Go to Admin Dashboard</Button>
                  </Link>
                </div>
              </div>
            ) : (
              <Button 
                onClick={makeAdmin} 
                disabled={updating}
                className="bg-slate-800 hover:bg-slate-900 text-white"
              >
                {updating ? 'Setting as Admin...' : 'Make Me an Admin'}
              </Button>
            )}
          </div>
          
          <div className="mt-10">
            <Link href="/dashboard">
              <Button variant="outline">Back to Dashboard</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
