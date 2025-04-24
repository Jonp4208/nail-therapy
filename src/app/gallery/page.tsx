'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Button from '@/components/ui/Button';
import DirectImage from '@/components/ui/DirectImage';
import { useSupabaseContext } from '@/context/SupabaseProvider';

interface GalleryItem {
  id: string;
  title: string;
  description: string;
  image_url: string;
  category_id: string;
  category?: {
    id: string;
    name: string;
  };
}

export default function GalleryPage() {
  const [galleryItems, setGalleryItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { supabase } = useSupabaseContext();

  useEffect(() => {
    const fetchGalleryItems = async () => {
      try {
        let query = supabase
          .from('gallery')
          .select(`
            *,
            service_categories (
              id,
              name
            )
          `)
          .order('title');

        if (activeCategory) {
          query = query.eq('category_id', activeCategory);
        }

        const { data, error } = await query;

        if (error) {
          throw error;
        }

        setGalleryItems(data || []);
      } catch (err: any) {
        console.error('Error fetching gallery items:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchGalleryItems();
  }, [supabase, activeCategory]);

  // Fetch categories for filter tabs
  const [categories, setCategories] = useState<any[]>([]);

  useEffect(() => {
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
      }
    };

    fetchCategories();
  }, [supabase]);

  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">Our Gallery</h2>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Browse through our portfolio of nail designs, eyebrow transformations, and waxing results.
          </p>
        </div>

        {/* Gallery Filter Tabs */}
        <div className="mt-10 flex justify-center space-x-4">
          <button
            className={`px-4 py-2 text-sm font-medium ${activeCategory === null ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
            onClick={() => setActiveCategory(null)}
          >
            All
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              className={`px-4 py-2 text-sm font-medium ${activeCategory === category.id ? 'text-pink-600 border-b-2 border-pink-600' : 'text-gray-500 hover:text-pink-600'}`}
              onClick={() => setActiveCategory(category.id)}
            >
              {category.name}
            </button>
          ))}
        </div>

        {/* Loading State */}
        {loading && (
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600">Loading gallery items...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="mt-16 text-center">
            <p className="text-lg text-red-600">Error: {error}</p>
          </div>
        )}

        {/* Gallery Grid */}
        {!loading && !error && (
          <div className="mx-auto mt-10 grid max-w-2xl grid-cols-1 gap-x-8 gap-y-10 sm:mt-16 sm:grid-cols-2 lg:mx-0 lg:max-w-none lg:grid-cols-3">
            {galleryItems.map((item) => (
              <div key={item.id} className="group relative overflow-hidden rounded-lg">
                <div className="aspect-h-1 aspect-w-1 w-full overflow-hidden rounded-lg bg-gray-200">
                  <DirectImage
                    src={item.image_url}
                    alt={item.title}
                    width={600}
                    height={600}
                    className="h-full w-full object-cover object-center group-hover:opacity-75"
                  />
                </div>
                <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/60 to-transparent p-6 opacity-0 group-hover:opacity-100 transition-opacity">
                  <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                  <p className="mt-1 text-sm text-gray-100">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && galleryItems.length === 0 && (
          <div className="mt-16 text-center">
            <p className="text-lg text-gray-600">No gallery items found.</p>
          </div>
        )}

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold tracking-tight text-gray-900">Like what you see?</h3>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Book an appointment today to get your own stunning nails, eyebrows, or waxing service.
          </p>
          <div className="mt-6">
            <Link href="/book">
              <Button size="lg">Book Now</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
