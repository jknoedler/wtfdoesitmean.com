import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, ThumbsUp, Meh, AlertCircle, Star, Flag, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function ViewFeedback() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [feedback, setFeedback] = useState(null);
  const [track, setTrack] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportDescription, setReportDescription] = useState("");
  const [isReporting, setIsReporting] = useState(false);

  const params = new URLSearchParams(location.search);
  const feedbackId = params.get('feedbackId');

  useEffect(() => {
    loadData();
  }, [feedbackId]);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const user = await api.auth.me();
      setCurrentUser(user);

      // Fetch the feedback
      const feedbackRecords = await api.entities.Feedback.filter({ id: feedbackId });
      if (feedbackRecords.length === 0) {
        alert("Feedback not found");
        navigate(createPageUrl("Inbox"));
        return;
      }

      const feedbackRecord = feedbackRecords[0];
      setFeedback(feedbackRecord);

      // Fetch the track
      const tracks = await api.entities.Track.filter({ id: feedbackRecord.track_id });
      if (tracks.length > 0) {
        setTrack(tracks[0]);
      }

      // Verify ownership - only the track owner can view this feedback
      if (feedbackRecord.artist_id !== user.id) {
        alert("You don't have permission to view this feedback");
        navigate(createPageUrl("Discover"));
        return;
      }

      setIsLoading(false);
    } catch (error) {
      console.error("Error loading feedback:", error);
      alert("Failed to load feedback");
      navigate(createPageUrl("Inbox"));
    }
  };

  const handleReport = async () => {
    if (!reportDescription.trim()) {
      alert("Please provide a description for the report");
      return;
    }

    setIsReporting(true);
    try {
      // Create report
      await api.entities.Report.create({
        reporter_id: currentUser.id,
        reporter_email: currentUser.email,
        report_type: "Inappropriate Content",
        description: reportDescription,
        target_type: "feedback",
        target_id: feedback.id,
        status: "pending"
      });

      // Send email to admins
      const emailContent = `
New Feedback Report

Reported by: ${currentUser.email}
Feedback ID: ${feedback.id}
Track: ${track?.title || 'Unknown'}
Artist: ${track?.artist_name || 'Unknown'}

Reviewer (hidden from artist): ${feedback.reviewer_name} (${feedback.reviewer_id})

Description:
${reportDescription}

---
View in Moderation Dashboard: ${window.location.origin}${createPageUrl("Moderation")}
      `;

      await Promise.all([
        api.integrations.Core.SendEmail({
          to: "jknoedler@soundope.com",
          subject: `[FEEDBACK REPORT] ${track?.title} - Soundope`,
          body: emailContent
        }),
        api.integrations.Core.SendEmail({
          to: "k.debey@soundope.com",
          subject: `[FEEDBACK REPORT] ${track?.title} - Soundope`,
          body: emailContent
        })
      ]);

      setShowReportModal(false);
      setReportDescription("");
      alert("Report submitted. Thank you for helping maintain quality feedback.");
    } catch (error) {
      console.error("Report error:", error);
      alert("Failed to submit report. Please try again.");
    } finally {
      setIsReporting(false);
    }
  };

  const getSentimentIcon = (sentiment) => {
    switch (sentiment) {
      case 'praise': return ThumbsUp;
      case 'neutral': return Meh;
      case 'constructive': return AlertCircle;
      default: return Meh;
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

  if (isLoading || !currentUser || !feedback) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const SentimentIcon = getSentimentIcon(feedback.sentiment);

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(createPageUrl("Inbox"))}
          className="neuro-flat rounded-xl p-2 mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#808080]" />
          <span className="text-sm text-[#808080]">Back to Inbox</span>
        </button>

        {/* Report Modal */}
        {showReportModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <h2 className="text-xl font-light text-[#d0d0d0] mb-4">Report Feedback</h2>
              
              <p className="text-sm text-[#808080] mb-4">
                Please describe why this feedback violates our guidelines:
              </p>

              <Textarea
                value={reportDescription}
                onChange={(e) => setReportDescription(e.target.value)}
                placeholder="Describe the issue..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[120px] resize-none mb-4"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowReportModal(false);
                    setReportDescription("");
                  }}
                  className="flex-1 neuro-flat rounded-2xl py-3"
                >
                  <span className="text-[#808080]">Cancel</span>
                </Button>
                <Button
                  onClick={handleReport}
                  disabled={!reportDescription.trim() || isReporting}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {isReporting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  ) : (
                    <span className="text-[#a0a0a0]">Submit Report</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Feedback Header */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="flex justify-between items-start mb-4">
            <div>
              <h1 className="text-2xl font-light text-[#d0d0d0] mb-2">Private Feedback</h1>
              {track && (
                <p className="text-sm text-[#808080]">
                  For: <span className="text-[#a0a0a0]">{track.title}</span>
                </p>
              )}
            </div>
            <button
              onClick={() => setShowReportModal(true)}
              className="neuro-flat rounded-xl p-2"
              title="Report Feedback"
            >
              <Flag className="w-5 h-5 text-[#808080]" />
            </button>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className={`text-xs px-3 py-1 rounded-full capitalize flex items-center gap-1 ${getSentimentColor(feedback.sentiment)}`}>
              <SentimentIcon className="w-3 h-3" />
              {feedback.sentiment}
            </span>
            <span className="text-xs text-[#707070]">
              {format(new Date(feedback.created_date), 'MMM d, yyyy')}
            </span>
          </div>

          <p className="text-xs text-[#606060]">
            From: <span className="text-[#808080]">Anonymous Reviewer</span>
          </p>
        </div>

        {/* Ratings */}
        {(feedback.production_rating || feedback.vocals_rating || feedback.lyrics_rating || feedback.originality_rating || feedback.overall_rating) && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h3 className="text-sm text-[#808080] mb-4">Ratings</h3>
            <div className="grid grid-cols-2 gap-3">
              {feedback.production_rating && (
                <RatingDisplay rating={feedback.production_rating} label="Production" />
              )}
              {feedback.vocals_rating && (
                <RatingDisplay rating={feedback.vocals_rating} label="Vocals" />
              )}
              {feedback.lyrics_rating && (
                <RatingDisplay rating={feedback.lyrics_rating} label="Lyrics" />
              )}
              {feedback.originality_rating && (
                <RatingDisplay rating={feedback.originality_rating} label="Originality" />
              )}
            </div>
            {feedback.overall_rating && (
              <div className="mt-4 pt-4 border-t border-[#1a1a1a]">
                <div className="flex items-center justify-center gap-2">
                  <span className="text-sm text-[#a0a0a0] font-medium">Overall:</span>
                  <div className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star 
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(feedback.overall_rating) ? 'text-[#d4af37] fill-[#d4af37]' : 'text-[#404040]'
                        }`} 
                      />
                    ))}
                  </div>
                  <span className="text-sm text-[#a0a0a0]">{feedback.overall_rating?.toFixed(1)}/5</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Written Feedback */}
        {feedback.content && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h3 className="text-sm text-[#808080] mb-4">Detailed Feedback</h3>
            <p className="text-sm text-[#a0a0a0] leading-relaxed whitespace-pre-wrap">
              {feedback.content}
            </p>
          </div>
        )}

        {/* Tags */}
        {feedback.tags && feedback.tags.length > 0 && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h3 className="text-sm text-[#808080] mb-3">Focus Areas</h3>
            <div className="flex gap-2 flex-wrap">
              {feedback.tags.map((tag, i) => (
                <span key={i} className="text-xs px-3 py-1 rounded-full bg-[#0a0a0a] text-[#707070]">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="neuro-base rounded-3xl p-6">
          <h3 className="text-sm text-[#808080] mb-4">Feedback Quality</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="neuro-pressed rounded-xl p-3 text-center">
              <p className="text-xs text-[#707070] mb-1">Tier</p>
              <p className="text-sm font-medium text-[#a0a0a0] capitalize">{feedback.tier_achieved}</p>
            </div>
            {feedback.word_count > 0 && (
              <div className="neuro-pressed rounded-xl p-3 text-center">
                <p className="text-xs text-[#707070] mb-1">Words</p>
                <p className="text-sm font-medium text-[#a0a0a0]">{feedback.word_count}</p>
              </div>
            )}
            <div className="neuro-pressed rounded-xl p-3 text-center">
              <p className="text-xs text-[#707070] mb-1">Listened</p>
              <p className="text-sm font-medium text-[#a0a0a0]">{Math.round(feedback.listen_percentage)}%</p>
            </div>
            {feedback.ai_validation_score && (
              <div className="neuro-pressed rounded-xl p-3 text-center">
                <p className="text-xs text-[#707070] mb-1">AI Quality</p>
                <p className="text-sm font-medium text-[#a0a0a0]">{Math.round(feedback.ai_validation_score)}/100</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}