
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate, useLocation } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, TrendingUp, Award, MessageCircle, X } from "lucide-react";

export default function VotePage() { // Kept VotePage to match existing file, outline had Vote()
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  
  const { track, feedbackData } = location.state || {};
  
  const [currentUser, setCurrentUser] = useState(null);
  const [votesToAllocate, setVotesToAllocate] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messageContent, setMessageContent] = useState("");

  useEffect(() => {
    // Add SEO meta tags
    document.title = "Vote for Music - Support Your Favorite Independent Artists | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Vote for your favorite independent music tracks. Support emerging artists by allocating your monthly votes to the best submissions. Help great music rise to the top." },
      { type: 'name', key: 'keywords', content: "vote for music, support independent artists, music voting, rate music, music competition, artist voting, discover music, community voting" },
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
    if (!track) {
      navigate(createPageUrl("Discover"));
    }
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      
      // Check if votes need to be reset (monthly reset)
      const now = new Date();
      const resetDate = user.votes_reset_date ? new Date(user.votes_reset_date) : null;
      
      if (!resetDate || now > resetDate) {
        // Reset votes for new month
        const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        await api.auth.updateMe({
          monthly_votes_remaining: 10,
          votes_reset_date: nextMonth.toISOString()
        });
        user.monthly_votes_remaining = 10;
        user.votes_reset_date = nextMonth.toISOString();
      }
      
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const submitVoteMutation = useMutation({
    mutationFn: async (voteCount) => {
      if (voteCount > 0) {
        // Create vote record
        await api.entities.Vote.create({
          track_id: track.id,
          voter_id: currentUser.id,
          artist_id: track.artist_id,
          vote_count: voteCount,
          vote_type: "leaderboard",
          voted_at: new Date().toISOString()
        });

        // Update track vote count
        await api.entities.Track.update(track.id, {
          total_votes: track.total_votes + voteCount
        });

        // Update user's remaining votes
        await api.auth.updateMe({
          monthly_votes_remaining: currentUser.monthly_votes_remaining - voteCount
        });

        // Create archive log
        await api.entities.ArchiveLog.create({
          user_id: currentUser.id,
          action_type: "vote_cast",
          target_id: track.id,
          target_type: "track",
          metadata: {
            track_title: track.title,
            artist_name: track.artist_name,
            votes_allocated: voteCount
          }
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['discover-tracks']);
      navigate(createPageUrl("Discover"));
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const message = await api.entities.Message.create({
        sender_id: currentUser.id,
        sender_name: currentUser.artist_name || currentUser.full_name,
        recipient_id: track.artist_id,
        recipient_name: track.artist_name,
        content: messageContent,
        thread_id: `${currentUser.id}_${track.artist_id}`
      });

      return message;
    },
    onSuccess: () => {
      setShowMessageModal(false);
      setMessageContent("");
    }
  });

  const handleVote = async () => {
    setIsSubmitting(true);
    await submitVoteMutation.mutateAsync(votesToAllocate);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    await submitVoteMutation.mutateAsync(0);
  };

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      sendMessageMutation.mutate();
    }
  };

  if (!track || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const maxVotes = Math.min(10, currentUser.monthly_votes_remaining || 0);

  return (
    <div className="min-h-screen px-4 py-8 flex items-center justify-center">
      <div className="max-w-xl w-full">
        {/* Success Message */}
        {feedbackData && (
          <div className="neuro-base rounded-3xl p-6 mb-6 text-center">
            <Award className="w-12 h-12 text-[#a0a0a0] mx-auto mb-4" />
            <h2 className="text-xl font-light text-[#d0d0d0] mb-2">
              Feedback Submitted!
            </h2>
            <p className="text-sm text-[#909090] mb-2">
              +{feedbackData.points} points ({feedbackData.tier})
            </p>
          </div>
        )}

        {/* Track Info */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="flex gap-4 mb-6">
            <img
              src={track.cover_image_url}
              alt={track.title}
              className="w-24 h-24 rounded-2xl object-cover neuro-pressed"
            />
            <div className="flex-1">
              <h2 className="text-xl font-light text-[#d0d0d0] mb-1">{track.title}</h2>
              <p className="text-sm text-[#808080] mb-3">{track.artist_name}</p>
              
              {/* Message Artist Button */}
              <button
                onClick={() => setShowMessageModal(true)}
                className="neuro-flat rounded-2xl px-4 py-2 flex items-center gap-2 smooth-transition hover:scale-105"
              >
                <MessageCircle className="w-4 h-4 text-[#808080]" />
                <span className="text-xs text-[#808080]">Message Artist</span>
              </button>
            </div>
          </div>

          <div className="neuro-pressed rounded-2xl p-4 mb-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="w-5 h-5 text-[#a0a0a0]" />
              <h3 className="text-sm font-medium text-[#d0d0d0]">
                Vote for Leaderboard?
              </h3>
            </div>
            <p className="text-xs text-[#808080] leading-relaxed">
              Each user gets <span className="text-[#a0a0a0] font-medium">10 votes per month</span> for the leaderboard. 
              You can give this track anywhere from 1 to 10 votes, or save them for other tracks.
            </p>
          </div>

          {/* Votes Remaining */}
          <div className="neuro-flat rounded-2xl p-4 mb-6">
            <div className="flex justify-between items-center">
              <span className="text-sm text-[#808080]">Your Votes Remaining:</span>
              <span className="text-2xl font-light text-[#a0a0a0]">
                {currentUser.monthly_votes_remaining || 0}
              </span>
            </div>
          </div>

          {/* Vote Slider */}
          {maxVotes > 0 ? (
            <div className="mb-6">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm text-[#808080]">Votes to Give:</span>
                <span className="text-3xl font-light text-[#d0d0d0]">{votesToAllocate}</span>
              </div>
              
              <input
                type="range"
                min="1"
                max={maxVotes}
                value={votesToAllocate}
                onChange={(e) => setVotesToAllocate(parseInt(e.target.value))}
                className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer"
                style={{
                  background: `linear-gradient(to right, #505050 0%, #505050 ${(votesToAllocate / maxVotes) * 100}%, #1a1a1a ${(votesToAllocate / maxVotes) * 100}%, #1a1a1a 100%)`
                }}
              />
              
              <div className="flex justify-between mt-2">
                <span className="text-xs text-[#606060]">1</span>
                <span className="text-xs text-[#606060]">{maxVotes}</span>
              </div>
            </div>
          ) : (
            <div className="neuro-pressed rounded-2xl p-4 mb-6 text-center">
              <p className="text-sm text-[#a08080]">
                You've used all your votes for this month. They'll reset next month!
              </p>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button
            onClick={handleSkip}
            disabled={isSubmitting}
            className="neuro-base active:neuro-pressed rounded-2xl px-8 py-4 flex-1 smooth-transition"
          >
            <span className="text-[#808080]">Skip</span>
          </Button>
          
          {maxVotes > 0 && (
            <Button
              onClick={handleVote}
              disabled={isSubmitting}
              className="neuro-base active:neuro-pressed rounded-2xl px-8 py-4 flex-1 smooth-transition"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  <span className="ml-2 text-[#808080]">Submitting...</span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-5 h-5 text-[#a0a0a0]" />
                  <span className="ml-2 text-[#a0a0a0]">
                    Vote {votesToAllocate > 1 ? `(${votesToAllocate})` : ''}
                  </span>
                </>
              )}
            </Button>
          )}
        </div>

        {/* Message Modal */}
        {showMessageModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-[#d0d0d0]">Message {track.artist_name}</h2>
                <button
                  onClick={() => setShowMessageModal(false)}
                  className="neuro-flat rounded-xl p-2"
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <Textarea
                value={messageContent}
                onChange={(e) => setMessageContent(e.target.value)}
                placeholder="Write your message..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[120px] resize-none mb-4"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowMessageModal(false)}
                  className="flex-1 neuro-flat rounded-2xl py-3"
                >
                  <span className="text-[#808080]">Cancel</span>
                </Button>
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageContent.trim() || sendMessageMutation.isPending}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {sendMessageMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  ) : (
                    <span className="text-[#a0a0a0]">Send</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
