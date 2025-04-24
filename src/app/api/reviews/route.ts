import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// GET all published reviews
export async function GET(request: Request) {
  try {
    const supabase = createServerSupabaseClient();
    const url = new URL(request.url);
    const serviceId = url.searchParams.get('serviceId');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    let query = supabase
      .from('reviews')
      .select(`
        id,
        rating,
        comment,
        created_at,
        service_id,
        services (
          id,
          name,
          service_categories (
            id,
            name,
            slug
          )
        ),
        user_id,
        profiles (full_name)
      `)
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (serviceId) {
      query = query.eq('service_id', serviceId);
    }

    const { data, error } = await query;

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ reviews: data });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST a new review
export async function POST(request: Request) {
  try {
    const supabase = createServerSupabaseClient();

    // Get user session
    const { data: { session } } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { serviceId, appointmentId, rating, comment } = await request.json();

    if (!serviceId || !rating) {
      return NextResponse.json(
        { error: 'Service ID and rating are required' },
        { status: 400 }
      );
    }

    // Validate rating
    const ratingNum = parseInt(rating);
    if (isNaN(ratingNum) || ratingNum < 1 || ratingNum > 5) {
      return NextResponse.json(
        { error: 'Rating must be between 1 and 5' },
        { status: 400 }
      );
    }

    // Check if user has already reviewed this service
    if (appointmentId) {
      const { data: existingReview, error: checkError } = await supabase
        .from('reviews')
        .select('id')
        .eq('appointment_id', appointmentId)
        .single();

      if (existingReview) {
        return NextResponse.json(
          { error: 'You have already reviewed this appointment' },
          { status: 400 }
        );
      }
    }

    // Create review
    const { data: review, error } = await supabase
      .from('reviews')
      .insert({
        service_id: serviceId,
        appointment_id: appointmentId,
        user_id: session.user.id,
        rating: ratingNum,
        comment: comment || '',
        is_published: true, // Auto-publish or set to false for moderation
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    // Update service average rating
    await updateServiceRating(supabase, serviceId);

    return NextResponse.json({
      success: true,
      review
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

// Helper function to update service average rating
async function updateServiceRating(supabase: any, serviceId: string) {
  try {
    // Get all published reviews for this service
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select('rating')
      .eq('service_id', serviceId)
      .eq('is_published', true);

    if (error) {
      console.error('Error fetching reviews:', error);
      return;
    }

    if (!reviews || reviews.length === 0) {
      return;
    }

    // Calculate average rating
    const totalRating = reviews.reduce((sum: number, review: any) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    // Update service with new average rating
    await supabase
      .from('services')
      .update({
        average_rating: averageRating,
        review_count: reviews.length
      })
      .eq('id', serviceId);
  } catch (error) {
    console.error('Error updating service rating:', error);
  }
}
