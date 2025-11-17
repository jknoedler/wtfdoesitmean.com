import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ThumbsUp, Meh, AlertCircle, Star, Volume2, VolumeX } from "lucide-react";

export default function FeedbackPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { track, listenPercentage, listenDuration } = location.state || {};
  
  const [currentUser, setCurrentUser] = useState(null);
  const [content, setContent] = useState("");
  const [sentiment, setSentiment] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [productionRating, setProductionRating] = useState(0);
  const [vocalsRating, setVocalsRating] = useState(0);
  const [lyricsRating, setLyricsRating] = useState(0);
  const [originalityRating, setOriginalityRating] = useState(0);
  const [submitError, setSubmitError] = useState("");
  const [isMuted, setIsMuted] = useState(false);

  useEffect(() => {
    loadUser();
    
    // Check if audio is muted
    const checkMute = () => {
      const audio = document.querySelector('audio');
      const video = document.querySelector('video');
      const media = audio || video;
      if (media && media.muted) {
        setIsMuted(true);
      }
    };
    
    checkMute();
    const interval = setInterval(checkMute, 1000);
    return () => clearInterval(interval);
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const availableTags = [
    "production", "mixing", "mastering", "vocals", "lyrics", 
    "melody", "rhythm", "energy", "originality", "structure"
  ];

  const submitFeedbackMutation = useMutation({
    mutationFn: async () => {
      // Validation
      if (!sentiment) {
        throw new Error("Please select a sentiment");
      }

      if (!productionRating || !vocalsRating || !lyricsRating || !originalityRating) {
        throw new Error("Please provide all ratings");
      }

      if (listenPercentage < 75) {
        throw new Error("You must listen to at least 75% of the track to give feedback");
      }

      // Calculate overall rating
      const overallRating = (productionRating + vocalsRating + lyricsRating + originalityRating) / 4;

      // Calculate word count and tier
      const wordCount = content.trim().split(/\s+/).length;
      let tier = "basic";
      let basePoints = 10;

      if (wordCount >= 200) {
        tier = "masterful";
        basePoints = 50;
      } else if (wordCount >= 100) {
        tier = "comprehensive";
        basePoints = 30;
      } else if (wordCount >= 50) {
        tier = "detailed";
        basePoints = 20;
      }

      // AI Validation
      let aiValidationPassed = false;
      let aiValidationScore = 0;
      let aiFeedbackNotes = "";

      if (content.trim().length > 0) {
        try {
          const aiResponse = await api.integrations.Core.InvokeLLM({
            prompt: `Analyze this music feedback and rate its quality from 0-100. Consider:
- Is it genuine and thoughtful (not generic)?
- Does it provide specific, actionable insights?
- Is it respectful and constructive?
- Does it seem human-written (not AI-generated)?

Feedback: "${content}"

Track Info: ${track.title} by ${track.artist_name}
Listen Percentage: ${listenPercentage}%
Ratings given: Production ${productionRating}, Vocals ${vocalsRating}, Lyrics ${lyricsRating}, Originality ${originalityRating}

Return a score 0-100 and brief notes on quality.`,
            response_json_schema: {
              type: "object",
              properties: {
                score: { type: "number" },
                notes: { type: "string" },
                is_genuine: { type: "boolean" }
              }
            }
          });

          aiValidationScore = aiResponse.score || 0;
          aiFeedbackNotes = aiResponse.notes || "";
          aiValidationPassed = aiResponse.is_genuine && aiValidationScore >= 60;

          if (!aiValidationPassed) {
            throw new Error("Your feedback didn't meet our quality standards. Please provide more specific, thoughtful insights.");
          }
        } catch (error) {
          console.error("AI validation error:", error);
          throw new Error("Feedback validation failed. Please ensure your feedback is detailed and genuine.");
        }
      }

      // Create feedback entity
      const feedback = await api.entities.Feedback.create({
        track_id: track.id,
        reviewer_id: currentUser.id,
        reviewer_name: currentUser.artist_name || currentUser.full_name,
        artist_id: track.artist_id,
        content,
        sentiment,
        production_rating: productionRating,
        vocals_rating: vocalsRating,
        lyrics_rating: lyricsRating,
        originality_rating: originalityRating,
        overall_rating: overallRating,
        listen_percentage: listenPercentage,
        listen_duration_seconds: listenDuration,
        ai_validation_passed: aiValidationPassed,
        ai_validation_score: aiValidationScore,
        ai_feedback_notes: aiFeedbackNotes,
        word_count: wordCount,
        points_awarded: basePoints,
        tier_achieved: tier,
        tags: selectedTags
      });

      // Send private message to track owner with link to view feedback
      const feedbackLink = createPageUrl("ViewFeedback") + `?feedbackId=${feedback.id}`;
      await api.entities.Message.create({
        sender_id: currentUser.id,
        sender_name: "Soundope System",
        recipient_id: track.artist_id,
        recipient_name: track.artist_name,
        content: `You received new ${sentiment} feedback on "${track.title}".\n\nRatings:\n• Production: ${productionRating}/5\n• Vocals: ${vocalsRating}/5\n• Lyrics: ${lyricsRating}/5\n• Originality: ${originalityRating}/5\n• Overall: ${overallRating.toFixed(1)}/5\n\nClick to view full feedback: ${window.location.origin}${feedbackLink}`,
        thread_id: `feedback_${feedback.id}`
      });

      // Create notification (optional, for backward compatibility)
      await api.entities.Notification.create({
        recipient_id: track.artist_id,
        type: "feedback_received",
        title: "New Feedback Received",
        message: `You received ${sentiment} feedback on "${track.title}"`,
        action_url: feedbackLink,
        sender_id: currentUser.id,
        sender_name: currentUser.artist_name || currentUser.full_name,
        related_id: track.id
      });

      // Update user points and tier
      const newPoints = (currentUser.points || 0) + basePoints;
      const newTotalFeedback = (currentUser.total_feedback_given || 0) + 1;

      let reviewerTier = "novice";
      if (newTotalFeedback >= 100) reviewerTier = "legend";
      else if (newTotalFeedback >= 50) reviewerTier = "connoisseur";
      else if (newTotalFeedback >= 25) reviewerTier = "critic";
      else if (newTotalFeedback >= 10) reviewerTier = "contributor";

      await api.auth.updateMe({
        points: newPoints,
        total_feedback_given: newTotalFeedback,
        review_tier: reviewerTier,
        standard_credits: (currentUser.standard_credits || 0) + basePoints
      });

      // Update track stats
      const praiseDelta = sentiment === "praise" ? 1 : 0;
      const neutralDelta = sentiment === "neutral" ? 1 : 0;
      const constructiveDelta = sentiment === "constructive" ? 1 : 0;

      await api.entities.Track.update(track.id, {
        praise_count: (track.praise_count || 0) + praiseDelta,
        neutral_count: (track.neutral_count || 0) + neutralDelta,
        constructive_count: (track.constructive_count || 0) + constructiveDelta
      });

      // Create archive log
      await api.entities.ArchiveLog.create({
        user_id: currentUser.id,
        action_type: "feedback_given",
        target_id: track.id,
        target_type: "feedback",
        metadata: {
          track_title: track.title,
          artist_name: track.artist_name,
          sentiment,
          tier,
          points_earned: basePoints
        },
        points_earned: basePoints
      });
    },
    onSuccess: () => {
      navigate(createPageUrl("Discover"));
    },
    onError: (error) => {
      setSubmitError(error.message || "Failed to submit feedback. Please try again.");
    }
  });

  if (!track) {
    navigate(createPageUrl("Discover"));
    return null;
  }

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const canSubmit = sentiment && productionRating && vocalsRating && lyricsRating && originalityRating && listenPercentage >= 75;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Mute Warning */}
        {isMuted && (
          <div className="neuro-base rounded-3xl p-4 mb-6 bg-[#2a1a1a] border-2 border-[#b09090]">
            <div className="flex items-center gap-3">
              <VolumeX className="w-6 h-6 text-[#b09090]" />
              <div>
                <p className="text-sm font-medium text-[#b09090]">Audio is Muted</p>
                <p className="text-xs text-[#808080] mt-1">
                  Please unmute to properly listen to the track before giving feedback
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Track Preview */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="flex gap-4 mb-4">
            <img
              src={track.cover_image_url}
              alt={track.title}
              className="w-20 h-20 rounded-xl object-cover neuro-pressed"
            />
            <div>
              <h2 className="text-xl font-light text-[#d0d0d0] mb-1">{track.title}</h2>
              <p className="text-sm text-[#808080]">{track.artist_name}</p>
              <p className="text-xs text-[#707070] mt-2">
                Listened: {Math.round(listenPercentage)}%
              </p>
            </div>
          </div>
        </div>

        {submitError && (
          <div className="neuro-pressed rounded-2xl p-4 mb-6 bg-[#1a0f0f]">
            <p className="text-sm text-[#d09090] text-center">{submitError}</p>
          </div>
        )}

        {/* Sentiment Selection */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Overall Sentiment</h3>
          <div className="grid grid-cols-3 gap-4">
            <button
              onClick={() => setSentiment("praise")}
              className={`neuro-flat rounded-2xl p-4 flex flex-col items-center gap-2 smooth-transition hover:scale-105 ${
                sentiment === "praise" ? "neuro-pressed" : ""
              }`}
            >
              <ThumbsUp className={`w-6 h-6 ${sentiment === "praise" ? "text-[#90b090]" : "text-[#707070]"}`} />
              <span className={`text-sm ${sentiment === "praise" ? "text-[#90b090]" : "text-[#808080]"}`}>
                Praise
              </span>
            </button>

            <button
              onClick={() => setSentiment("neutral")}
              className={`neuro-flat rounded-2xl p-4 flex flex-col items-center gap-2 smooth-transition hover:scale-105 ${
                sentiment === "neutral" ? "neuro-pressed" : ""
              }`}
            >
              <Meh className={`w-6 h-6 ${sentiment === "neutral" ? "text-[#909090]" : "text-[#707070]"}`} />
              <span className={`text-sm ${sentiment === "neutral" ? "text-[#909090]" : "text-[#808080]"}`}>
                Neutral
              </span>
            </button>

            <button
              onClick={() => setSentiment("constructive")}
              className={`neuro-flat rounded-2xl p-4 flex flex-col items-center gap-2 smooth-transition hover:scale-105 ${
                sentiment === "constructive" ? "neuro-pressed" : ""
              }`}
            >
              <AlertCircle className={`w-6 h-6 ${sentiment === "constructive" ? "text-[#b09090]" : "text-[#707070]"}`} />
              <span className={`text-sm ${sentiment === "constructive" ? "text-[#b09090]" : "text-[#808080]"}`}>
                Constructive
              </span>
            </button>
          </div>
        </div>

        {/* Ratings */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Rate This Track</h3>
          
          <div className="space-y-4">
            {[
              { label: "Production", value: productionRating, setter: setProductionRating },
              { label: "Vocals", value: vocalsRating, setter: setVocalsRating },
              { label: "Lyrics", value: lyricsRating, setter: setLyricsRating },
              { label: "Originality", value: originalityRating, setter: setOriginalityRating }
            ].map(({ label, value, setter }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#a0a0a0]">{label}</span>
                  <span className="text-sm text-[#707070]">{value}/5</span>
                </div>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setter(rating)}
                      className="flex-1 neuro-flat rounded-xl py-3 smooth-transition hover:scale-105"
                    >
                      <Star
                        className={`w-6 h-6 mx-auto ${
                          rating <= value ? "text-[#d4af37] fill-[#d4af37]" : "text-[#404040]"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Tags */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Focus Areas (Optional)</h3>
          <div className="flex flex-wrap gap-2">
            {availableTags.map(tag => (
              <button
                key={tag}
                onClick={() => {
                  if (selectedTags.includes(tag)) {
                    setSelectedTags(selectedTags.filter(t => t !== tag));
                  } else {
                    setSelectedTags([...selectedTags, tag]);
                  }
                }}
                className={`neuro-base rounded-full px-4 py-2 text-xs smooth-transition hover:scale-105 ${
                  selectedTags.includes(tag) ? "neuro-pressed text-[#a0a0a0]" : "text-[#707070]"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Written Feedback */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">
            Written Feedback (Optional, but earns more credits)
          </h3>
          <Textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Share your thoughts on the track..."
            className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[150px] resize-none mb-2"
          />
          <p className="text-xs text-[#707070]">
            {content.trim().split(/\s+/).filter(w => w).length} words
          </p>
        </div>

        {/* Reward Tiers Info */}
        <div className="neuro-pressed rounded-2xl p-4 mb-6">
          <p className="text-xs text-[#808080] mb-2">Feedback Tiers & Rewards:</p>
          <div className="space-y-1 text-xs text-[#707070]">
            <p>• Basic (ratings only): 10 credits</p>
            <p>• Detailed (50+ words): 20 credits</p>
            <p>• Comprehensive (100+ words): 30 credits</p>
            <p>• Masterful (200+ words): 50 credits</p>
          </div>
        </div>

        {/* AI Warning */}
        <div className="neuro-pressed rounded-2xl p-4 mb-6 bg-[#1a1a1a]">
          <p className="text-xs text-[#a0a0a0] text-center">
            ⚠️ AI-generated feedback will be rejected. Please provide genuine, thoughtful insights.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={() => navigate(createPageUrl("Discover"))}
            className="flex-1 neuro-flat rounded-2xl py-4"
          >
            <span className="text-[#808080]">Cancel</span>
          </Button>
          <Button
            onClick={() => submitFeedbackMutation.mutate()}
            disabled={!canSubmit || submitFeedbackMutation.isPending}
            className={`flex-1 rounded-2xl py-4 ${
              canSubmit && !submitFeedbackMutation.isPending
                ? "neuro-base active:neuro-pressed hover:scale-[1.02] text-[#b0b0b0]"
                : "neuro-pressed opacity-40 cursor-not-allowed text-[#606060]"
            }`}
          >
            {submitFeedbackMutation.isPending ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin mr-2" />
                Submitting...
              </>
            ) : (
              "Submit Feedback"
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}