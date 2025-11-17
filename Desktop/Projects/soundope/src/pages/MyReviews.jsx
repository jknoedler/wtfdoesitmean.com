
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, MessageSquare } from "lucide-react";
import { format } from "date-fns";

export default function MyReviews() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Add SEO meta tags
    document.title = "My Reviews - Track Your Music Feedback History | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "View all music reviews you've written. Track your feedback history, see earned points, and monitor your reviewer tier progress." },
      { type: 'name', key: 'keywords', content: "my music reviews, feedback history, reviewer stats, earned points, review analytics, music critic, feedback tracker" },
    ];

    metaTags.forEach(({ type, key, content }) => {
      let tag = document.querySelector(`meta[${type}="${key}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute(type, key);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
      }
    });

    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await api.auth.me();
    setCurrentUser(user);
  };

  const { data: reviews = [] } = useQuery({
    queryKey: ['my-reviews', currentUser?.id],
    queryFn: () => api.entities.Feedback.filter(
      { reviewer_id: currentUser.id },
      '-created_date'
    ),
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-light mb-8 text-[#d0d0d0] text-center">My Reviews</h1>

        <div className="neuro-base rounded-3xl p-6">
          {reviews.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-[#606060] mx-auto mb-4" />
              <p className="text-sm text-[#808080]">No reviews yet. Start listening!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="neuro-flat rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <p className="text-xs text-[#707070] mb-1">
                        {format(new Date(review.created_date), 'MMM d, yyyy')}
                      </p>
                      <p className="text-sm font-medium text-[#d0d0d0]">
                        Review for track by {review.artist_id}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                        review.sentiment === 'praise' ? 'bg-[#1a2a1a] text-[#90b090]' :
                        review.sentiment === 'neutral' ? 'bg-[#1a1a1a] text-[#909090]' :
                        'bg-[#2a1a1a] text-[#b09090]'
                      }`}>
                        {review.sentiment}
                      </span>
                      <span className="text-xs text-[#a0a0a0]">+{review.points_awarded}pts</span>
                    </div>
                  </div>

                  <p className="text-sm text-[#a0a0a0] mb-3 line-clamp-3">
                    {review.content}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-[#707070]">
                    <span className="capitalize">{review.tier_achieved} tier</span>
                    <span>•</span>
                    <span>{review.word_count} words</span>
                    <span>•</span>
                    <span>{Math.round(review.listen_percentage)}% listened</span>
                  </div>

                  {review.tags && review.tags.length > 0 && (
                    <div className="flex gap-2 mt-3">
                      {review.tags.map((tag, i) => (
                        <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#0a0a0a] text-[#707070]">
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
