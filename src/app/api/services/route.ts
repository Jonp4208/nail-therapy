import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase';

// Get all services
export async function GET() {
  try {
    const supabase = createServerSupabaseClient();
    
    // In a real app, you would:
    // 1. Fetch all services from the database
    // 2. Return them to the frontend
    
    // Mock response
    return NextResponse.json({
      services: [
        {
          id: '1',
          name: 'Classic Manicure',
          description: 'Our classic manicure includes nail shaping, cuticle care, hand massage, and polish application.',
          price: 2500, // $25.00
          duration: 30,
          category: 'nails',
          imageUrl: 'https://images.unsplash.com/photo-1604902396830-aca29e19b067',
        },
        {
          id: '2',
          name: 'Gel Manicure',
          description: 'Long-lasting gel polish that stays shiny and chip-free for up to two weeks.',
          price: 3500, // $35.00
          duration: 45,
          category: 'nails',
          imageUrl: 'https://images.unsplash.com/photo-1610992015732-2449b76344bc',
        },
        {
          id: '3',
          name: 'Spa Pedicure',
          description: 'Relaxing foot soak, exfoliation, callus removal, nail care, massage, and polish.',
          price: 4500, // $45.00
          duration: 60,
          category: 'nails',
          imageUrl: 'https://images.unsplash.com/photo-1519751138087-5bf79df62d5b',
        },
        {
          id: '4',
          name: 'Nail Extensions',
          description: 'Acrylic or gel extensions to add length and strength to your natural nails.',
          price: 6000, // $60.00
          duration: 90,
          category: 'nails',
          imageUrl: 'https://images.unsplash.com/photo-1632345031435-8727f6897d53',
        },
        {
          id: '5',
          name: 'Eyebrow Shaping',
          description: 'Professional eyebrow shaping using waxing or threading techniques.',
          price: 1500, // $15.00
          duration: 15,
          category: 'eyebrows',
          imageUrl: 'https://images.unsplash.com/photo-1594641266925-8cbe33f4e4a9',
        },
        {
          id: '6',
          name: 'Eyebrow Tinting',
          description: 'Semi-permanent dye to enhance and define your eyebrows.',
          price: 2000, // $20.00
          duration: 20,
          category: 'eyebrows',
          imageUrl: 'https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec',
        },
        {
          id: '7',
          name: 'Leg Waxing',
          description: 'Smooth, hair-free legs for weeks with our professional waxing service.',
          price: 5000, // $50.00
          duration: 45,
          category: 'waxing',
          imageUrl: 'https://images.unsplash.com/photo-1570172619644-dfd03ed5d881',
        },
        {
          id: '8',
          name: 'Facial Waxing',
          description: 'Gentle waxing for upper lip, chin, or full face.',
          price: 2500, // $25.00
          duration: 30,
          category: 'waxing',
          imageUrl: 'https://images.unsplash.com/photo-1560750588-73207b1ef5b8',
        },
      ],
    });
  } catch (error) {
    console.error('Error fetching services:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
