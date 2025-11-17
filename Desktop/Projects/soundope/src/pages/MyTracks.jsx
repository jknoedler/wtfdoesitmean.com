
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Music, Play, MessageSquare, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import BoostModal from "../components/BoostModal";

export default function MyTracks() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [showBoostModal, setShowBoostModal] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);

  useEffect(() => {
    // Add SEO meta tags
    document.title = "My Tracks - Manage Your Music Uploads | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Manage your uploaded music tracks. View statistics, track performance, see feedback received, and monitor your music promotion efforts." },
      { type: 'name', key: 'keywords', content: "manage music uploads, track statistics, music analytics, uploaded tracks, music performance, track feedback, promotion dashboard" },
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

  // Load Adsterra Banner Ad
  useEffect(() => {
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-mytracks-banner-763b8c85de11ad1c95d4275c8cb17af7');
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
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: tracks = [], isLoading } = useQuery({
    queryKey: ['my-tracks', currentUser?.id],
    queryFn: () => api.entities.Track.filter({ artist_id: currentUser.id }, '-created_date'),
    enabled: !!currentUser,
  });

  // Get comment counts for tracks
  const { data: commentCounts = {} } = useQuery({
    queryKey: ['track-comments-counts', currentUser?.id],
    queryFn: async () => {
      const allComments = await api.entities.Comment.filter({ is_universal: false });
      const counts = {};
      allComments.forEach(comment => {
        if (comment.track_id) {
          counts[comment.track_id] = (counts[comment.track_id] || 0) + 1;
        }
      });
      return counts;
    },
    enabled: !!currentUser && tracks.length > 0,
  });

  const boostMutation = useMutation({
    mutationFn: async ({ trackId, boostData }) => {
      const { hours, multiplier, useStandardCredits, creditsToSpend } = boostData;
      
      // Calculate expiry time
      const expiresAt = new Date();
      expiresAt.setHours(expiresAt.getHours() + hours);

      // Update track with boost
      await api.entities.Track.update(trackId, {
        boost_expires: expiresAt.toISOString(),
        boost_pool: (selectedTrack.boost_pool || 0) + creditsToSpend
      });

      // Create boost record
      await api.entities.Boost.create({
        track_id: trackId,
        artist_id: currentUser.id,
        credits_spent: creditsToSpend,
        boost_duration_hours: hours,
        boost_multiplier: multiplier,
        expires_at: expiresAt.toISOString()
      });

      // Deduct credits from user
      const creditField = useStandardCredits ? 'standard_credits' : 'premium_credits';
      const currentCredits = currentUser[creditField] || 0;
      await api.auth.updateMe({
        [creditField]: currentCredits - creditsToSpend
      });

      // Log to archive
      await api.entities.ArchiveLog.create({
        user_id: currentUser.id,
        action_type: "boost_applied",
        target_id: trackId,
        target_type: "boost",
        metadata: {
          track_title: selectedTrack.title,
          credits_spent: creditsToSpend,
          duration_hours: hours,
          multiplier: multiplier
        }
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['my-tracks']);
      setShowBoostModal(false);
      setSelectedTrack(null);
      loadUser(); // Reload user to get updated credits
    },
    onError: (error) => {
      console.error("Boost error:", error);
      alert("Failed to apply boost. Please try again.");
    }
  });

  const handleBoostClick = (track, e) => {
    e.stopPropagation(); // Prevent navigation to track details
    setSelectedTrack(track);
    setShowBoostModal(true);
  };

  const handleBoostConfirm = async (boostData) => {
    await boostMutation.mutateAsync({
      trackId: selectedTrack.id,
      boostData
    });
  };

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
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-light text-[#d0d0d0]">My Tracks</h1>
          <Button
            onClick={() => navigate(createPageUrl("Upload"))}
            className="neuro-base active:neuro-pressed rounded-2xl px-6 py-3"
          >
            <span className="text-[#a0a0a0]">Upload New Track</span>
          </Button>
        </div>

        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div id="container-mytracks-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {/* Boost Modal */}
        {showBoostModal && selectedTrack && (
          <BoostModal
            track={selectedTrack}
            standardCredits={currentUser.standard_credits || 0}
            premiumCredits={currentUser.premium_credits || 0}
            onBoost={handleBoostConfirm}
            onClose={() => {
              setShowBoostModal(false);
              setSelectedTrack(null);
            }}
          />
        )}

        {tracks.length === 0 ? (
          <div className="neuro-base rounded-3xl p-12 text-center">
            <Music className="w-16 h-16 text-[#606060] mx-auto mb-4" />
            <p className="text-sm text-[#808080] mb-6">No tracks uploaded yet</p>
            <Button
              onClick={() => navigate(createPageUrl("Upload"))}
              className="neuro-base active:neuro-pressed rounded-2xl px-6 py-3"
            >
              <span className="text-[#a0a0a0]">Upload Your First Track</span>
            </Button>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-4">
            {tracks.map((track) => {
              const commentCount = commentCounts[track.id] || 0;
              const isBoostActive = track.boost_expires && new Date(track.boost_expires) > new Date();
              
              return (
                <div
                  key={track.id}
                  className="neuro-base rounded-2xl overflow-hidden smooth-transition hover:scale-[1.02]"
                >
                  <button
                    onClick={() => navigate(createPageUrl("TrackDetails") + `?trackId=${track.id}`)}
                    className="w-full text-left"
                  >
                    <div className="relative aspect-square">
                      <img
                        src={track.cover_image_url}
                        alt={track.title}
                        className="w-full h-48 object-cover rounded-t-2xl"
                        loading="lazy"
                        width="300"
                        height="192"
                      />
                      {isBoostActive && (
                        <div className="absolute top-3 right-3 neuro-base rounded-xl px-3 py-1 flex items-center gap-1">
                          <Zap className="w-3 h-3 text-[#b0a090]" fill="currentColor" />
                          <span className="text-xs text-[#b0a090]">Boosted</span>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent flex items-end p-4">
                        <div className="flex items-center gap-2">
                          <div className="neuro-flat w-10 h-10 rounded-full flex items-center justify-center">
                            <Play className="w-5 h-5 text-[#a0a0a0] ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </button>

                  <div className="p-4">
                    <h3 className="text-lg font-medium text-[#d0d0d0] mb-2 truncate">
                      {track.title}
                    </h3>

                    <div className="flex gap-2 mb-3">
                      {track.genres?.slice(0, 2).map(genre => (
                        <span
                          key={genre}
                          className="text-xs px-2 py-1 rounded-full bg-[#0a0a0a] text-[#808080]"
                        >
                          {genre}
                        </span>
                      ))}
                    </div>

                    <div className="grid grid-cols-3 gap-3 mb-3">
                      <div className="neuro-pressed rounded-xl p-2 text-center">
                        <p className="text-sm font-light text-[#a0a0a0]">{track.total_listens}</p>
                        <p className="text-xs text-[#707070]">Listens</p>
                      </div>
                      <div className="neuro-pressed rounded-xl p-2 text-center">
                        <p className="text-sm font-light text-[#a0a0a0]">{track.praise_count + track.neutral_count + track.constructive_count}</p>
                        <p className="text-xs text-[#707070]">Reviews</p>
                      </div>
                      <div className="neuro-pressed rounded-xl p-2 text-center">
                        <p className="text-sm font-light text-[#a0a0a0]">{track.total_votes}</p>
                        <p className="text-xs text-[#707070]">Votes</p>
                      </div>
                    </div>

                    <div className="flex gap-2">
                      {commentCount > 0 && (
                        <button
                          onClick={() => navigate(createPageUrl("TrackDetails") + `?trackId=${track.id}#comments`)}
                          className="flex-1 neuro-flat rounded-xl p-3 flex items-center justify-between smooth-transition hover:scale-[1.02]"
                        >
                          <div className="flex items-center gap-2">
                            <MessageSquare className="w-4 h-4 text-[#808080]" />
                            <span className="text-xs text-[#808080]">Comments</span>
                          </div>
                          <span className="text-xs text-[#a0a0a0] font-medium">{commentCount}</span>
                        </button>
                      )}
                      
                      <button
                        onClick={(e) => handleBoostClick(track, e)}
                        className={`${commentCount > 0 ? 'flex-1' : 'w-full'} neuro-flat rounded-xl p-3 flex items-center justify-center gap-2 smooth-transition hover:scale-[1.02]`}
                      >
                        <Zap className="w-4 h-4 text-[#b0a090]" />
                        <span className="text-xs text-[#b0a090]">Boost</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
