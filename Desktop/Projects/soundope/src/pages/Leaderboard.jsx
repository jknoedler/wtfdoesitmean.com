
import React, { useState, useRef, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2, Trophy, TrendingUp, Play, Pause, ThumbsUp, X, MessageCircle, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import CommentSection from "../components/CommentSection";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";

export default function Leaderboard() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [votingTrack, setVotingTrack] = useState(null);
  const [votesToAllocate, setVotesToAllocate] = useState(1);
  const [voteInputValue, setVoteInputValue] = useState("1");
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [messagingTrack, setMessagingTrack] = useState(null);
  const [messageContent, setMessageContent] = useState("");
  
  // Claim track state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimingTrack, setClaimingTrack] = useState(null);
  const [claimReason, setClaimReason] = useState("");
  const [claimProofUrl, setClaimProofUrl] = useState("");

  const audioRef = useRef(null);

  useEffect(() => {
    // Add SEO meta tags
    document.title = "Music Leaderboard - Top Independent Artists & Tracks | Soundope";
    
    const metaTagsData = [
      { type: 'name', key: 'description', content: "Discover trending independent artists and top-rated music on Soundope's leaderboard. Vote for your favorite tracks, find new music, and support emerging artists. Updated daily with the best submissions." },
      { type: 'name', key: 'keywords', content: "music leaderboard, trending independent artists, top rated music, vote for music, discover new artists, best independent music, music charts, emerging artists, music rankings" },
      
      // Open Graph
      { type: 'property', key: 'og:title', content: 'Music Leaderboard - Top Independent Artists | Soundope' },
      { type: 'property', key: 'og:description', content: 'Vote for the best independent music. Discover trending tracks and support emerging artists on our music leaderboard.' },
      { type: 'property', key: 'og:type', content: 'website' },
    ];

    const addedMetaTags = [];
    metaTagsData.forEach(({ type, key, content }) => {
      let tag = document.querySelector(`meta[${type}="${key}"]`);
      if (tag) {
        tag.setAttribute('content', content);
      } else {
        tag = document.createElement('meta');
        tag.setAttribute(type, key);
        tag.setAttribute('content', content);
        document.head.appendChild(tag);
        addedMetaTags.push(tag);
      }
    });

    // Add JSON-LD Schema
    const schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.text = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      "name": "Soundope Music Leaderboard",
      "description": "Top-rated independent music tracks voted by the community",
      "url": window.location.href
    });
    document.head.appendChild(schemaScript);

    return () => {
      // Clean up added meta tags and schema script
      addedMetaTags.forEach(tag => {
        if (tag.parentNode) {
          tag.parentNode.removeChild(tag);
        }
      });
      if (schemaScript.parentNode) {
        schemaScript.parentNode.removeChild(schemaScript);
      }
    };
  }, []);

  useEffect(() => {
    loadUser();
  }, []);

  // Load Adsterra Banner Ad
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-leaderboard-banner-763b8c85de11ad1c95d4275c8cb17af7');
      if (!adContainer || adContainer.dataset.loaded === 'true') return;

      // Load script if not already loaded
      if (!document.querySelector('script[src*="763b8c85de11ad1c95d4275c8cb17af7"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//laceokay.com/763b8c85de11ad1c95d4275c8cb17af7/invoke.js';
        document.head.appendChild(script);
      }

      // Initialize ad container
      setTimeout(() => {
        if (adContainer && !adContainer.dataset.loaded) {
          adContainer.dataset.loaded = 'true';
          adContainer.innerHTML = '<div id="container-763b8c85de11ad1c95d4275c8cb17af7"></div>';
        }
      }, 300);
    };

    loadAdsterraAd();
  }, []);


  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      
      // Handle case where user is not authenticated
      if (!user) {
        setCurrentUser(null);
        return;
      }
      
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
      setCurrentUser(null);
    }
  };

  const { data: topTracks = [], isLoading } = useQuery({
    queryKey: ['leaderboard-tracks'],
    queryFn: async () => {
      try {
        // Filter for active tracks, sorted by total_votes descending, limit 25
        const tracks = await api.entities.Track.filter({ is_active: true }, '-total_votes', 25);
        // Ensure we return an array and filter out any null/undefined tracks
        const validTracks = (tracks || []).filter(track => track && track.id);
        return validTracks;
      } catch (error) {
        console.error('Error loading leaderboard tracks:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 30000, // Cache for 30 seconds
  });

  // Fetch all track claims to check which tracks have been claimed
  const { data: trackClaims = [] } = useQuery({
    queryKey: ['all-track-claims'],
    queryFn: async () => {
      return await api.entities.TrackClaim.filter({
        status: { $in: ['pending', 'approved'] }
      });
    },
    enabled: !!currentUser,
  });

  const { data: userSubmissions = [] } = useQuery({
    queryKey: ['user-playlist-submissions', currentUser?.id],
    queryFn: () => api.entities.PlaylistSubmission.filter({ user_id: currentUser.id }),
    enabled: !!currentUser,
  });

  const submitVoteMutation = useMutation({
    mutationFn: async ({ track, voteCount }) => {
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
      queryClient.invalidateQueries(['leaderboard-tracks']);
      setVotingTrack(null);
      setVotesToAllocate(1);
      setVoteInputValue("1");
      loadUser();
    }
  });

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const message = await api.entities.Message.create({
        sender_id: currentUser.id,
        sender_name: currentUser.artist_name || currentUser.full_name,
        recipient_id: messagingTrack.artist_id,
        recipient_name: messagingTrack.artist_name,
        content: messageContent,
        thread_id: `${currentUser.id}_${messagingTrack.artist_id}`
      });

      return message;
    },
    onSuccess: () => {
      setShowMessageModal(false);
      setMessagingTrack(null);
      setMessageContent("");
    }
  });

  const claimTrackMutation = useMutation({
    mutationFn: async () => {
      const user = await api.auth.me();
      
      // Create claim in database FIRST
      await api.entities.TrackClaim.create({
        track_id: claimingTrack.id,
        track_title: claimingTrack.title,
        original_artist_id: claimingTrack.artist_id,
        original_artist_name: claimingTrack.artist_name,
        claimer_id: user.id,
        claimer_name: user.artist_name || user.full_name,
        claimer_email: user.email,
        reason: claimReason,
        proof_url: claimProofUrl || null,
        status: "pending"
      });

      // Try to send email notifications (but don't fail if this fails)
      try {
        const emailContent = `
New Track Ownership Claim (from Leaderboard)

Track: ${claimingTrack.title}
Current Artist: ${claimingTrack.artist_name}

Claimed by: ${user.artist_name || user.full_name}
Email: ${user.email}

Reason:
${claimReason}

${claimProofUrl ? `Proof URL: ${claimProofUrl}` : 'No proof URL provided'}

---
Submitted at: ${new Date().toLocaleString()}
View in Moderation Dashboard: ${window.location.origin}${createPageUrl("Moderation")}
        `;

        await Promise.all([
          api.integrations.Core.SendEmail({
            to: "jknoedler@soundope.com",
            subject: `[TRACK CLAIM] ${claimingTrack.title} - Soundope`,
            body: emailContent
          }),
          api.integrations.Core.SendEmail({
            to: "k.debey@soundope.com",
            subject: `[TRACK CLAIM] ${claimingTrack.title} - Soundope`,
            body: emailContent
          })
        ]);
      } catch (emailError) {
        console.error("Failed to send claim email, but claim was created:", emailError);
      }
    },
    onSuccess: () => {
      setShowClaimModal(false);
      setClaimingTrack(null);
      setClaimReason("");
      setClaimProofUrl("");
      alert("Claim submitted successfully. Moderators will review your request.");
      queryClient.invalidateQueries(['all-track-claims']); // Invalidate claims to update UI
    },
    onError: (error) => {
      console.error("Claim error:", error);
      alert("Failed to submit claim. Please try again.");
    }
  });

  const handlePlayPause = (track) => {
    if (currentlyPlaying?.id === track.id) {
      if (isPlaying) {
        audioRef.current?.pause();
        setIsPlaying(false);
      } else {
        audioRef.current?.play();
        setIsPlaying(true);
      }
    } else {
      setCurrentlyPlaying(track);
      setIsPlaying(true);
    }
  };

  const handleVote = (track) => {
    setVotingTrack(track);
    setVotesToAllocate(1);
    setVoteInputValue("1");
  };

  const handleSliderChange = (value) => {
    const newValue = value[0];
    setVotesToAllocate(newValue);
    setVoteInputValue(newValue.toString());
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    const maxVotes = currentUser.monthly_votes_remaining || 0;
    
    // Allow empty string for user to clear and type
    if (value === "") {
      setVoteInputValue("");
      return;
    }
    
    // Only allow numbers
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numValue = parseInt(value);
    
    // Don't allow numbers greater than available votes
    if (numValue > maxVotes) {
      setVoteInputValue(maxVotes.toString());
      setVotesToAllocate(maxVotes);
      return;
    }
    
    // Don't allow 0
    if (numValue < 1) {
      setVoteInputValue("1");
      setVotesToAllocate(1);
      return;
    }
    
    setVoteInputValue(value);
    setVotesToAllocate(numValue);
  };

  const handleInputBlur = () => {
    // If empty on blur, set to 1
    if (voteInputValue === "" || parseInt(voteInputValue) < 1) {
      setVoteInputValue("1");
      setVotesToAllocate(1);
    }
  };

  const submitVote = () => {
    submitVoteMutation.mutate({ track: votingTrack, voteCount: votesToAllocate });
  };

  const handleMessage = (track) => {
    setMessagingTrack(track);
    setShowMessageModal(true);
  };

  const handleSendMessage = () => {
    if (messageContent.trim()) {
      sendMessageMutation.mutate();
    }
  };

  const handleClaimTrack = (track) => {
    setClaimingTrack(track);
    setShowClaimModal(true);
  };

  React.useEffect(() => {
    if (currentlyPlaying && audioRef.current) {
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          setIsPlaying(false);
        });
      }
    }
  }, [currentlyPlaying]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const maxVotes = currentUser?.monthly_votes_remaining || 0;

  return (
      <div className="min-h-screen px-4 py-8 pb-32">
      <div className="flex gap-6 max-w-7xl mx-auto">
        <div className="flex-1 max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="neuro-base w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <Trophy className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Leaderboard</h1>
          <p className="text-sm text-[#808080]">
            Top 25 voted tracks this month{currentUser ? ` • ${currentUser.monthly_votes_remaining || 0} votes remaining` : ''}
          </p>
        </div>

        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div id="container-leaderboard-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {/* Hidden audio element */}
        {currentlyPlaying && (
          <audio
            ref={audioRef}
            src={currentlyPlaying.audio_url}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />
        )}

        {/* Vote Modal */}
        {votingTrack && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-[#d0d0d0]">Vote for Track</h2>
                <button
                  onClick={() => setVotingTrack(null)}
                  className="neuro-flat rounded-xl p-2"
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <div className="neuro-pressed rounded-2xl p-4 mb-4 flex gap-3">
                <img
                  src={votingTrack.cover_image_url}
                  alt={votingTrack.title}
                  className="w-16 h-16 rounded-xl object-cover"
                />
                <div>
                  <p className="text-sm font-medium text-[#d0d0d0]">{votingTrack.title}</p>
                  <p className="text-xs text-[#808080]">{votingTrack.artist_name}</p>
                </div>
              </div>

              <div className="neuro-flat rounded-2xl p-4 mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm text-[#808080]">Your Votes Remaining:</span>
                  <span className="text-2xl font-light text-[#a0a0a0]">
                    {currentUser.monthly_votes_remaining || 0}
                  </span>
                </div>
              </div>

              {maxVotes > 0 ? (
                <>
                  <div className="mb-6">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-sm text-[#808080]">Votes to Give:</span>
                      <Input
                        type="text"
                        value={voteInputValue}
                        onChange={handleInputChange}
                        onBlur={handleInputBlur}
                        className="w-20 text-center bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl py-2 text-lg font-medium"
                      />
                    </div>
                    
                    <div className="mb-2">
                      <p className="text-xs text-[#707070] mb-2 text-center">Use slider (1-10) or type any number up to {maxVotes}</p>
                      <input
                        type="range"
                        min="1"
                        max="10"
                        value={Math.min(votesToAllocate, 10)}
                        onChange={(e) => handleSliderChange([parseInt(e.target.value)])}
                        className="w-full h-2 bg-[#1a1a1a] rounded-lg appearance-none cursor-pointer"
                        style={{
                          background: `linear-gradient(to right, #505050 0%, #505050 ${(Math.min(votesToAllocate, 10) / 10) * 100}%, #1a1a1a ${(Math.min(votesToAllocate, 10) / 10) * 100}%, #1a1a1a 100%)`
                        }}
                      />
                      
                      <div className="flex justify-between mt-2">
                        <span className="text-xs text-[#606060]">1</span>
                        <span className="text-xs text-[#606060]">10</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <Button
                      onClick={() => setVotingTrack(null)}
                      className="flex-1 neuro-flat rounded-2xl py-3"
                    >
                      <span className="text-[#808080]">Cancel</span>
                    </Button>
                    <Button
                      onClick={submitVote}
                      disabled={submitVoteMutation.isPending}
                      className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                    >
                      {submitVoteMutation.isPending ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                        </>
                      ) : (
                        <>
                          <ThumbsUp className="w-5 h-5 text-[#a0a0a0] mr-2" />
                          <span className="text-[#a0a0a0]">Vote</span>
                        </>
                      )}
                    </Button>
                  </div>
                </>
              ) : (
                <div className="neuro-pressed rounded-2xl p-4 text-center">
                  <p className="text-sm text-[#a0a0a0]">
                    You've used all your votes for this month. They'll reset next month!
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Message Modal */}
        {showMessageModal && messagingTrack && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-light text-[#d0d0d0]">Message {messagingTrack.artist_name}</h2>
                <button
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessagingTrack(null);
                    setMessageContent("");
                  }}
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
                  onClick={() => {
                    setShowMessageModal(false);
                    setMessagingTrack(null);
                    setMessageContent("");
                  }}
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

        {/* Claim Track Modal */}
        {showClaimModal && claimingTrack && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[#d0d0d0]">Claim Track Ownership</h2>
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setClaimingTrack(null);
                    setClaimReason("");
                    setClaimProofUrl("");
                  }}
                  className="neuro-flat rounded-xl p-2"
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <div className="neuro-pressed rounded-2xl p-4 mb-4">
                <p className="text-sm text-[#a0a0a0] mb-2">Track: {claimingTrack.title}</p>
                <p className="text-xs text-[#707070]">Current Artist: {claimingTrack.artist_name}</p>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label htmlFor="claimReason" className="text-xs text-[#808080] mb-2 block">Why are you claiming this track?</label>
                  <Textarea
                    id="claimReason"
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    placeholder="Explain why you believe you are the rightful owner of this track..."
                    className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <label htmlFor="claimProofUrl" className="text-xs text-[#808080] mb-2 block">Proof URL (optional)</label>
                  <Input
                    id="claimProofUrl"
                    value={claimProofUrl}
                    onChange={(e) => setClaimProofUrl(e.target.value)}
                    placeholder="Link to streaming platform, social media, etc."
                    className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
                  />
                </div>
              </div>

              <div className="neuro-pressed rounded-2xl p-3 mb-4">
                <p className="text-xs text-[#707070]">
                  Your claim will be reviewed by moderators. You may be contacted for additional verification.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowClaimModal(false);
                    setClaimingTrack(null);
                    setClaimReason("");
                    setClaimProofUrl("");
                  }}
                  className="flex-1 neuro-flat rounded-2xl py-3"
                >
                  <span className="text-[#808080]">Cancel</span>
                </Button>
                <Button
                  onClick={() => claimTrackMutation.mutate()}
                  disabled={!claimReason.trim() || claimTrackMutation.isPending}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {claimTrackMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  ) : (
                    <span className="text-[#a0a0a0]">Submit Claim</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-[1fr,400px] gap-6">
          {/* Leaderboard */}
          <div className="neuro-base rounded-3xl p-4">
            {/* Vertical Banner Ad - 160x300 */}
            <div className="flex justify-center mb-4">
              <div id="container-leaderboard-vertical-775cc79dc80b2e1db1aa0b012d7ce474"></div>
            </div>
            {topTracks.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-[#606060] mx-auto mb-4" />
                <p className="text-sm text-[#808080]">No tracks yet. Be the first!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {topTracks.map((track, index) => {
                  const isCurrentTrack = currentlyPlaying?.id === track.id;
                  const showPlayIcon = isCurrentTrack && isPlaying;
                  
                  return (
                    <div
                      key={track.id}
                      className={`neuro-flat rounded-2xl p-3 smooth-transition hover:scale-[1.01] ${
                        index < 3 ? 'neuro-pressed' : ''
                      }`}
                    >
                      {/* First Row: Rank, Cover, Info, Actions */}
                      <div className="flex items-center gap-2">
                        {/* Rank */}
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 ${
                          index === 0 ? 'bg-[#2a2a1a] text-[#d4af37]' :
                          index === 1 ? 'bg-[#1a1a1a] text-[#c0c0c0]' :
                          index === 2 ? 'bg-[#2a1a1a] text-[#cd7f32]' :
                          'bg-[#0a0a0a] text-[#707070]'
                        } font-light text-xs`}>
                          {index + 1}
                        </div>

                        {/* Cover with Play Button */}
                        <button
                          onClick={() => handlePlayPause(track)}
                          className="relative w-10 h-10 rounded-lg overflow-hidden neuro-pressed group flex-shrink-0"
                        >
                          <img
                            src={track.cover_image_url}
                            alt={track.title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                            width="40"
                            height="40"
                          />
                          <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            {showPlayIcon ? (
                              <Pause className="w-4 h-4 text-white" fill="white" />
                            ) : (
                              <Play className="w-4 h-4 text-white ml-0.5" fill="white" />
                            )}
                          </div>
                          {isCurrentTrack && (
                            <div className="absolute inset-0 border-2 border-[#a0a0a0] rounded-lg" />
                          )}
                        </button>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-xs font-medium text-[#d0d0d0] truncate">
                            {track.title}
                          </h3>
                          <Link
                            to={createPageUrl("PublicProfile") + `?userId=${track.artist_id}`}
                            className="text-[10px] text-[#808080] hover:text-[#a0a0a0] smooth-transition block truncate"
                            onClick={(e) => e.stopPropagation()}
                          >
                            {track.artist_name}
                          </Link>
                        </div>

                        {/* Vote Count & Actions - Compact on the right */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <div className="text-center mr-1">
                            <p className="text-xs font-medium text-[#b0b0b0]">{track.total_votes}</p>
                            <p className="text-[8px] text-[#707070]">votes</p>
                          </div>
                          
                          {currentUser && (
                            <button
                              onClick={() => handleVote(track)}
                              disabled={track.artist_id === currentUser.id || maxVotes === 0}
                              className={`neuro-base active:neuro-pressed rounded-xl px-3 py-1.5 flex items-center gap-1.5 smooth-transition ${
                                track.artist_id === currentUser.id || maxVotes === 0 ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'
                              }`}
                              title="Vote for this track"
                            >
                              <ThumbsUp className="w-4 h-4 text-[#a0a0a0]" />
                              <span className="text-xs text-[#a0a0a0]">Vote</span>
                            </button>
                          )}
                          
                          {currentUser && !trackClaims.some(claim => claim.track_id === track.id) && (
                            <button
                              onClick={() => handleClaimTrack(track)}
                              disabled={track.artist_id === currentUser.id}
                              className={`neuro-base active:neuro-pressed rounded-lg p-1 smooth-transition ${
                                track.artist_id === currentUser.id ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'
                              }`}
                              title="Claim Track Ownership"
                            >
                              <UserCheck className="w-3 h-3 text-[#a0a0a0]" />
                            </button>
                          )}
                          
                          {currentUser && (
                            <button
                              onClick={() => handleMessage(track)}
                              disabled={track.artist_id === currentUser.id}
                              className={`neuro-base active:neuro-pressed rounded-lg p-1 smooth-transition ${
                                track.artist_id === currentUser.id ? 'opacity-40 cursor-not-allowed' : 'hover:scale-105'
                              }`}
                              title={`Message ${track.artist_name}`}
                            >
                              <MessageCircle className="w-3 h-3 text-[#a0a0a0]" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Second Row: Genre Tags Below */}
                      {track.genres?.length > 0 && (
                        <div className="flex gap-1 mt-2 ml-9">
                          {track.genres.slice(0, 2).map(genre => (
                            <span
                              key={genre}
                              className="text-[8px] px-1.5 py-0.5 rounded-full bg-[#0a0a0a] text-[#707070]"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Universal Comment Section */}
          <div className="lg:sticky lg:top-8 lg:self-start">
            <CommentSection isUniversal={true} maxHeight="calc(100vh - 200px)" />
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}
