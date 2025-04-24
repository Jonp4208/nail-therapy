import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase admin client with service role for bypassing RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: 'Appointment ID is required' },
        { status: 400 }
      );
    }
    
    // Fetch appointment details using admin client (bypasses RLS)
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .select(`
        *,
        services (
          *,
          service_categories (
            id,
            name
          )
        )
      `)
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching appointment:', error);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    if (!appointment) {
      return NextResponse.json(
        { error: 'Appointment not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ appointment });
  } catch (error: any) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
