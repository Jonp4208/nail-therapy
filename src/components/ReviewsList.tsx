import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';

interface Review {
  id: string;
  rating: number;
  comment: string;
  created_at: string;
  profiles: {
    full_name: string;
  };
}

interface ReviewsListProps {
  serviceId?: string;
  limit?: number;
}

const ReviewsList: React.FC<ReviewsListProps> = ({
  serviceId,
  limit = 5
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        let url = `/api/reviews?limit=${limit}`;
        if (serviceId) {
          url += `&serviceId=${serviceId}`;
        }
        
        const response = await fetch(url);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch reviews');
        }
        
        setReviews(data.reviews || []);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchReviews();
  }, [serviceId, limit]);

  if (loading) {
    return <div className="text-center py-4">Loading reviews...</div>;
  }

  if (error) {
    return <div className="text-red-500 py-4">Error: {error}</div>;
  }

  if (reviews.length === 0) {
    return <div className="text-gray-500 py-4">No reviews yet.</div>;
  }

  return (
    <div className="space-y-6">
      {reviews.map((review) => (
        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-0">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center">
              <div className="flex text-yellow-400 mr-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span key={star} className={star <= review.rating ? 'text-yellow-400' : 'text-gray-300'}>
                    ★
                  </span>
                ))}
              </div>
              <span className="font-medium text-gray-900">
                {review.profiles.full_name}
              </span>
            </div>
            <span className="text-sm text-gray-500">
              {format(new Date(review.created_at), 'MMM d, yyyy')}
            </span>
          </div>
          {review.comment && (
            <p className="text-gray-700">{review.comment}</p>
          )}
        </div>
      ))}
    </div>
  );
};

export default ReviewsList;
