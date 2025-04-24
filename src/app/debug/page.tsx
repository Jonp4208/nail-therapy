'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import Link from 'next/link';
import Button from '@/components/ui/Button';

export default function DebugPage() {
  const supabase = createClientComponentClient<Database>();
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rpcResult, setRpcResult] = useState<any>(null);
  const [directQueryResult, setDirectQueryResult] = useState<any>(null);
  const [clientsResult, setClientsResult] = useState<any>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get current session
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        if (sessionError) {
          throw sessionError;
        }
        
        if (!session) {
          setError('No active session found. Please log in.');
          setLoading(false);
          return;
        }
        
        setUser(session.user);
        
        // Get user profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
          
        if (profileError) {
          console.error('Profile error:', profileError);
          setError(`Error fetching profile: ${profileError.message}`);
        } else {
          setProfile(profileData);
        }
        
        // Try RPC function
        try {
          const { data: rpcData, error: rpcError } = await supabase
            .rpc('get_all_profiles');
            
          if (rpcError) {
            console.error('RPC error:', rpcError);
          } else {
            setRpcResult(rpcData);
          }
        } catch (rpcErr) {
          console.error('RPC function error:', rpcErr);
        }
        
        // Try direct query
        try {
          const { data: directData, error: directError } = await supabase
            .from('profiles')
            .select('*');
            
          if (directError) {
            console.error('Direct query error:', directError);
          } else {
            setDirectQueryResult(directData);
          }
        } catch (directErr) {
          console.error('Direct query error:', directErr);
        }
        
        // Try clients query
        try {
          const { data: clientsData, error: clientsError } = await supabase
            .from('profiles')
            .select('*')
            .eq('is_admin', false);
            
          if (clientsError) {
            console.error('Clients query error:', clientsError);
          } else {
            setClientsResult(clientsData);
          }
        } catch (clientsErr) {
          console.error('Clients query error:', clientsErr);
        }
        
      } catch (err: any) {
        console.error('Error in auth check:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Loading...</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 mb-8">Debug Information</h1>
          
          {error && (
            <div className="mb-6 p-4 text-sm text-red-800 rounded-lg bg-red-50 border border-red-200">
              {error}
            </div>
          )}
          
          <div className="space-y-8">
            {/* User Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">User Information</h2>
                {user ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">ID:</span> {user.id}</p>
                    <p><span className="font-medium">Email:</span> {user.email}</p>
                    <p><span className="font-medium">Created:</span> {new Date(user.created_at).toLocaleString()}</p>
                    <p><span className="font-medium">Last Sign In:</span> {user.last_sign_in_at ? new Date(user.last_sign_in_at).toLocaleString() : 'Never'}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">No user information available.</p>
                )}
              </div>
            </div>
            
            {/* Profile Information */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Profile Information</h2>
                {profile ? (
                  <div className="space-y-2">
                    <p><span className="font-medium">ID:</span> {profile.id}</p>
                    <p><span className="font-medium">Full Name:</span> {profile.full_name}</p>
                    <p><span className="font-medium">Email:</span> {profile.email}</p>
                    <p><span className="font-medium">Phone:</span> {profile.phone || 'Not provided'}</p>
                    <p><span className="font-medium">Created:</span> {new Date(profile.created_at).toLocaleString()}</p>
                    <p>
                      <span className="font-medium">Admin Status:</span>{' '}
                      <span className={profile.is_admin ? 'text-green-600 font-semibold' : 'text-red-600'}>
                        {profile.is_admin ? 'Yes' : 'No'} ({typeof profile.is_admin}, value: {String(profile.is_admin)})
                      </span>
                    </p>
                  </div>
                ) : (
                  <p className="text-gray-500">No profile information available.</p>
                )}
              </div>
            </div>
            
            {/* Database Queries */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Database Query Results</h2>
                
                <div className="space-y-6">
                  {/* RPC Results */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">RPC Function Results</h3>
                    {rpcResult ? (
                      <div>
                        <p className="mb-2">Found {rpcResult.length} profiles via RPC</p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {rpcResult.map((profile: any) => (
                                <tr key={profile.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.full_name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.email}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {profile.is_admin ? 'Yes' : 'No'} ({typeof profile.is_admin})
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No RPC results available.</p>
                    )}
                  </div>
                  
                  {/* Direct Query Results */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Direct Query Results</h3>
                    {directQueryResult ? (
                      <div>
                        <p className="mb-2">Found {directQueryResult.length} profiles via direct query</p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Admin</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {directQueryResult.map((profile: any) => (
                                <tr key={profile.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{profile.full_name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{profile.email}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {profile.is_admin ? 'Yes' : 'No'} ({typeof profile.is_admin})
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No direct query results available.</p>
                    )}
                  </div>
                  
                  {/* Clients Query Results */}
                  <div>
                    <h3 className="text-lg font-medium mb-2">Clients Query Results</h3>
                    {clientsResult ? (
                      <div>
                        <p className="mb-2">Found {clientsResult.length} clients</p>
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {clientsResult.map((client: any) => (
                                <tr key={client.id}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.id}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{client.full_name}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.email}</td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{client.phone || 'None'}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    ) : (
                      <p className="text-gray-500">No clients query results available.</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
            
            {/* Navigation Links */}
            <div className="flex flex-wrap gap-4 justify-center">
              <Link href="/admin">
                <Button>Go to Admin Dashboard</Button>
              </Link>
              <Link href="/admin/clients">
                <Button variant="outline">Go to Client Directory</Button>
              </Link>
              <Link href="/dashboard">
                <Button variant="outline">Go to User Dashboard</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
