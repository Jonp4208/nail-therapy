'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/Card';
import { useSupabaseContext } from '@/context/SupabaseProvider';

export default function ProfilePage() {
  const router = useRouter();
  const { supabase, user, loading: authLoading } = useSupabaseContext();
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  
  useEffect(() => {
    // Redirect to login if not authenticated
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    
    if (user) {
      const fetchProfile = async () => {
        try {
          // Fetch user profile
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();
            
          if (error) {
            throw error;
          }
          
          if (data) {
            setFullName(data.full_name || '');
            setEmail(data.email || user.email || '');
            setPhone(data.phone || '');
          } else {
            // If no profile exists, initialize with user data from auth
            setEmail(user.email || '');
            if (user.user_metadata) {
              const firstName = user.user_metadata.first_name || '';
              const lastName = user.user_metadata.last_name || '';
              setFullName(`${firstName} ${lastName}`.trim());
            }
          }
        } catch (err: any) {
          console.error('Error fetching profile:', err);
          setError(err.message);
        } finally {
          setLoading(false);
        }
      };
      
      fetchProfile();
    }
  }, [supabase, user, authLoading, router]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user) return;
    
    setSaving(true);
    setError(null);
    setSuccess(null);
    
    try {
      // Check if profile exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
        
      if (checkError && checkError.code !== 'PGRST116') { // PGRST116 is "not found" error
        throw checkError;
      }
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: fullName,
            email: email,
            phone: phone,
          })
          .eq('id', user.id);
          
        if (updateError) {
          throw updateError;
        }
      } else {
        // Create new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            full_name: fullName,
            email: email,
            phone: phone,
          });
          
        if (insertError) {
          throw insertError;
        }
      }
      
      setSuccess('Profile updated successfully');
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };
  
  if (authLoading || loading) {
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
  
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Your Profile</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Update your personal information
          </p>
        </div>
        
        <div className="mx-auto mt-16 max-w-xl">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your account information
              </CardDescription>
            </CardHeader>
            <CardContent>
              {error && (
                <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}
              
              {success && (
                <div className="mb-6 p-3 bg-green-50 text-green-700 rounded-md text-sm">
                  {success}
                </div>
              )}
              
              <form className="space-y-6" onSubmit={handleSubmit}>
                <Input
                  label="Full Name"
                  type="text"
                  placeholder="Your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
                
                <Input
                  label="Email Address"
                  type="email"
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={true} // Email is managed by auth system
                />
                
                <Input
                  label="Phone Number"
                  type="tel"
                  placeholder="Your phone number"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
                
                <div className="pt-4 flex justify-between">
                  <Link href="/dashboard">
                    <Button variant="outline" type="button">
                      Back to Dashboard
                    </Button>
                  </Link>
                  <Button type="submit" isLoading={saving}>
                    Save Changes
                  </Button>
                </div>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center border-t px-6 py-4">
              <button
                type="button"
                className="text-sm font-medium text-red-600 hover:text-red-500"
                onClick={async () => {
                  if (confirm('Are you sure you want to sign out?')) {
                    await supabase.auth.signOut();
                    router.push('/');
                  }
                }}
              >
                Sign Out
              </button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
