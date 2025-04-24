'use client';

import { useState } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database.types';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';
import { toast } from '@/components/ui/use-toast';

interface CreateClientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClientCreated: (clientId: string, clientName: string) => void;
}

const CreateClientModal: React.FC<CreateClientModalProps> = ({
  isOpen,
  onClose,
  onClientCreated,
}) => {
  const supabase = createClientComponentClient<Database>();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fullName || !email) {
      setError('Name and email are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // First check if a profile with this email already exists
      const { data: existingProfile, error: checkError } = await supabase
        .from('profiles')
        .select('id, email')
        .eq('email', email)
        .maybeSingle();

      if (checkError) {
        throw checkError;
      }

      if (existingProfile) {
        setError('A client with this email already exists');
        setLoading(false);
        return;
      }

      // Create a new auth user with a random password
      // This will trigger the database function that creates a profile
      const randomPassword = Math.random().toString(36).slice(-10) +
                            Math.random().toString(36).slice(-10);

      console.log("Creating new client with email:", email);

      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password: randomPassword,
        options: {
          data: {
            full_name: fullName,
            phone: phone || null,
            is_admin: false,
          },
        },
      });

      if (signUpError) {
        console.error("Error signing up user:", signUpError);
        throw signUpError;
      }

      if (!authData.user) {
        console.error("No user returned from signUp");
        throw new Error('Failed to create user');
      }

      console.log("User created with ID:", authData.user.id);

      // Wait a moment for the profile to be created by the trigger
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Fetch the newly created profile
      const { data: profiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', authData.user.id);

      if (fetchError) {
        console.error("Error fetching profile:", fetchError);
        throw fetchError;
      }

      if (!profiles || profiles.length === 0) {
        console.log("Profile not found, creating manually");

        // If profile wasn't created automatically, create it manually
        const { data: newProfile, error: createError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            full_name: fullName,
            email: email,
            phone: phone || null,
            is_admin: false,
          })
          .select();

        if (createError) {
          console.error("Error creating profile manually:", createError);
          throw createError;
        }

        if (!newProfile || newProfile.length === 0) {
          throw new Error('Failed to create profile manually');
        }

        console.log("Profile created manually:", newProfile[0]);
        const newClient = newProfile[0];

        // Call onClientCreated with the new client data
        onClientCreated(newClient.id, newClient.full_name);

        // Reset form and close modal
        setFullName('');
        setEmail('');
        setPhone('');
        onClose();

        return;
      }

      console.log("Profile found:", profiles[0]);
      const newClient = profiles[0];

      toast({
        title: 'Client Created',
        description: `${fullName} has been added to your client list.`,
      });

      // Pass the new client back to the parent component
      onClientCreated(newClient.id, newClient.full_name);

      // Reset form and close modal
      setFullName('');
      setEmail('');
      setPhone('');
      onClose();

    } catch (err: any) {
      console.error('Error creating client:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="p-6">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Add New Client</h2>

          {error && (
            <div className="mb-4 p-3 text-sm text-red-800 rounded-lg bg-red-50">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <Label htmlFor="fullName">Full Name *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter client's full name"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter client's email"
                  required
                />
              </div>

              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter client's phone number"
                />
              </div>
            </div>

            <div className="mt-6 flex justify-end space-x-3">
              <Button
                type="button"
                className="bg-slate-100 hover:bg-slate-200 text-slate-700"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="bg-slate-700 hover:bg-slate-800 text-white"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Client'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateClientModal;
