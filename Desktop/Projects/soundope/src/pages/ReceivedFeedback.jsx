
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, MessageSquare, ThumbsUp, Meh, AlertCircle, Flag, Star, Heart } from "lucide-react";
import { format } from "date-fns";

export default function ReceivedFeedback() {
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState("all");
  const queryClient = useQueryClient();

  useEffect(() => {
    // Add SEO meta tags
    document.title = "My Feedback Received - Track Your Music Reviews | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "View all feedback received on your music tracks. Read detailed reviews from listeners, track your ratings, and improve your music based on community feedback." },
      { type: 'name', key: 'keywords', content: "music feedback received, track reviews, artist feedback, music ratings, review analytics, improve music, listener feedback" },
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

  const { data: feedback = [], isLoading } = useQuery({
    queryKey: ['received-feedback', currentUser?.id],
    queryFn: () => api.entities.Feedback.filter(
      { artist_id: currentUser.id },
      '-created_date'
    ),
    enabled: !!currentUser,
  });

  const { data: tracks = [] } = useQuery({
    queryKey: ['my-tracks-for-feedback', currentUser?.id],
    queryFn: () => api.entities.Track.filter({ artist_id: currentUser.id }),
    enabled: !!currentUser,
  });

  const reportFeedbackMutation = useMutation({
    mutationFn: async (fb) => {
      await api.entities.Report.create({
        reporter_id: currentUser.id,
        reporter_email: currentUser.email,
        report_type: "Inappropriate Content",
        description: `Feedback reported by ${currentUser.email}: "${fb.content}"`,
        target_type: "feedback",
        target_id: fb.id,
        status: "pending"
      });

      const emailContent = `
New Feedback Report

Reported by: ${currentUser.email}
Feedback by: ${fb.reviewer_name}
Feedback ID: ${fb.id}

Content:
"${fb.content}"

---
Submitted at: ${new Date().toLocaleString()}
View in Moderation Dashboard: ${window.location.origin}/moderation
      `;

      await Promise.all([
        api.integrations.Core.SendEmail({
          to: "jknoedler@soundope.com",
          subject: `[REPORT] Feedback - Soundope`,
          body: emailContent
        }),
        api.integrations.Core.SendEmail({
          to: "k.debey@soundope.com",
          subject: `[REPORT] Feedback - Soundope`,
          body: emailContent
        })
      ]);
    },
    onSuccess: () => {
      alert("Feedback reported. Thank you for helping keep Soundope safe.");
    },
    onError: () => {
      alert("Failed to submit report. Please try again.");
    }
  });

  const handleReportFeedback = (fb) => {
    if (confirm("Report this feedback as inappropriate?")) {
      reportFeedbackMutation.mutate(fb);
    }
  };

  const filteredFeedback = selectedTrack === "all" 
    ? feedback 
    : feedback.filter(f => f.track_id === selectedTrack);

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'praise': return ThumbsUp;
      case 'neutral': return Meh;
      case 'constructive': return AlertCircle;
      default: return MessageSquare;
    }
  };

  const getSentimentColor = (sentiment) => {
    switch (sentiment) {
      case 'praise': return 'bg-[#1a2a1a] text-[#90b090]';
      case 'neutral': return 'bg-[#1a1a1a] text-[#909090]';
      case 'constructive': return 'bg-[#2a1a1a] text-[#b09090]';
      default: return 'bg-[#1a1a1a] text-[#808080]';
    }
  };

  const RatingDisplay = ({ rating, label }) => (
    <div className="flex items-center gap-2">
      <span className="text-xs text-[#707070]">{label}:</span>
      <div className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star 
            key={star}
            className={`w-3 h-3 ${
              star <= rating ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#404040]'
            }`} 
          />
        ))}
      </div>
      <span className="text-xs text-[#a0a0a0]">{rating}/5</span>
    </div>
  );

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="neuro-base w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <MessageSquare className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Feedback Received</h1>
          <p className="text-sm text-[#808080]">{feedback.length} total reviews</p>
        </div>

        {/* Track Filter */}
        {tracks.length > 0 && (
          <div className="neuro-base rounded-3xl p-4 mb-6">
            <label className="text-sm text-[#808080] mb-3 block">Filter by Track</label>
            <select
              value={selectedTrack}
              onChange={(e) => setSelectedTrack(e.target.value)}
              className="w-full bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl p-3"
            >
              <option value="all">All Tracks ({feedback.length})</option>
              {tracks.map(track => {
                const trackFeedbackCount = feedback.filter(f => f.track_id === track.id).length;
                return (
                  <option key={track.id} value={track.id}>
                    {track.title} ({trackFeedbackCount})
                  </option>
                );
              })}
            </select>
          </div>
        )}

        {/* Feedback List */}
        <div className="neuro-base rounded-3xl p-6">
          {filteredFeedback.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="w-12 h-12 text-[#606060] mx-auto mb-4" />
              <p className="text-sm text-[#808080]">
                {selectedTrack === "all" 
                  ? "No feedback received yet. Share your tracks to get reviews!"
                  : "No feedback for this track yet."}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredFeedback.map((fb) => {
                const SentimentIcon = getSentimentIcon(fb.sentiment);
                const track = tracks.find(t => t.id === fb.track_id);
                
                return (
                  <div key={fb.id} className="neuro-flat rounded-2xl p-5">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <p className="text-sm font-medium text-[#d0d0d0]">
                            {fb.reviewer_name}
                          </p>
                          <span className={`text-xs px-3 py-1 rounded-full capitalize flex items-center gap-1 ${getSentimentColor(fb.sentiment)}`}>
                            <SentimentIcon className="w-3 h-3" />
                            {fb.sentiment}
                          </span>
                        </div>
                        {track && (
                          <p className="text-xs text-[#707070]">
                            on "{track.title}"
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <p className="text-xs text-[#707070]">
                          {format(new Date(fb.created_date), 'MMM d, yyyy')}
                        </p>
                        <button
                          onClick={() => handleReportFeedback(fb)}
                          disabled={reportFeedbackMutation.isPending}
                          className="text-[#808080] hover:text-[#a08080] smooth-transition neuro-flat rounded-lg p-1"
                          title="Report feedback"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Ratings Display */}
                    {(fb.production_rating || fb.vocals_rating || fb.lyrics_rating || fb.originality_rating) && (
                      <div className="neuro-pressed rounded-xl p-4 mb-4">
                        <div className="grid grid-cols-2 gap-3">
                          {fb.production_rating && (
                            <RatingDisplay rating={fb.production_rating} label="Production" />
                          )}
                          {fb.vocals_rating && (
                            <RatingDisplay rating={fb.vocals_rating} label="Vocals" />
                          )}
                          {fb.lyrics_rating && (
                            <RatingDisplay rating={fb.lyrics_rating} label="Lyrics" />
                          )}
                          {fb.originality_rating && (
                            <RatingDisplay rating={fb.originality_rating} label="Originality" />
                          )}
                        </div>
                        {fb.overall_rating && (
                          <div className="mt-3 pt-3 border-t border-[#1a1a1a]">
                            <div className="flex items-center justify-center gap-2">
                              <span className="text-sm text-[#a0a0a0] font-medium">Overall:</span>
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star 
                                    key={star}
                                    className={`w-4 h-4 ${
                                      star <= Math.round(fb.overall_rating) ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#404040]'
                                    }`} 
                                  />
                                ))}
                              </div>
                              <span className="text-sm text-[#a0a0a0]">{fb.overall_rating?.toFixed(1)}/5</span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Content */}
                    {fb.content && (
                      <p className="text-sm text-[#a0a0a0] leading-relaxed mb-4">
                        {fb.content}
                      </p>
                    )}

                    {/* Tags */}
                    {fb.tags && fb.tags.length > 0 && (
                      <div className="flex gap-2 mb-3 flex-wrap">
                        {fb.tags.map((tag, i) => (
                          <span key={i} className="text-xs px-2 py-1 rounded-full bg-[#0a0a0a] text-[#707070]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center gap-4 text-xs text-[#707070] pt-3 border-t border-[#1a1a1a]">
                      <span className="capitalize">{fb.tier_achieved} tier</span>
                      {fb.word_count > 0 && (
                        <>
                          <span>•</span>
                          <span>{fb.word_count} words</span>
                        </>
                      )}
                      <span>•</span>
                      <span>{Math.round(fb.listen_percentage)}% listened</span>
                      {fb.ai_validation_score && (
                        <>
                          <span>•</span>
                          <span>AI Score: {Math.round(fb.ai_validation_score)}/100</span>
                        </>
                      )}
                      {fb.helpful_votes > 0 && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Heart className="w-3 h-3 text-[#b09090] fill-[#b09090]" />
                            {fb.helpful_votes} helpful
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
