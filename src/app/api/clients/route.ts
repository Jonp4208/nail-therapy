import { NextResponse } from 'next/server';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { Database } from '@/types/database.types';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { full_name, email, phone, is_admin } = requestData;
    
    // Validate required fields
    if (!full_name || !email) {
      return NextResponse.json(
        { message: 'Name and email are required' },
        { status: 400 }
      );
    }
    
    // Create a Supabase client with the cookies
    const supabase = createRouteHandlerClient<Database>({ cookies });
    
    // Check if the user is authenticated and is an admin
    const {
      data: { user },
    } = await supabase.auth.getUser();
    
    if (!user) {
      return NextResponse.json(
        { message: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if the authenticated user is an admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single();
      
    if (profileError || !profile?.is_admin) {
      return NextResponse.json(
        { message: 'Unauthorized - Admin access required' },
        { status: 403 }
      );
    }
    
    // Check if email already exists
    const { data: existingUser, error: checkError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email)
      .maybeSingle();
      
    if (checkError) {
      throw checkError;
    }
    
    if (existingUser) {
      return NextResponse.json(
        { message: 'A client with this email already exists' },
        { status: 409 }
      );
    }
    
    // Create the new client profile
    // The server-side Supabase client bypasses RLS
    const { data: newClient, error: createError } = await supabase
      .from('profiles')
      .insert({
        full_name,
        email,
        phone: phone || null,
        is_admin: is_admin || false,
      })
      .select()
      .single();
      
    if (createError) {
      console.error('Error creating client:', createError);
      return NextResponse.json(
        { message: createError.message },
        { status: 500 }
      );
    }
    
    return NextResponse.json(newClient);
    
  } catch (error: any) {
    console.error('Error in client creation API:', error);
    return NextResponse.json(
      { message: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
