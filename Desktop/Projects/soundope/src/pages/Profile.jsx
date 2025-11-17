
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { Loader2, Settings, LogOut, Music, MessageSquare, Trophy, DollarSign, Trash, X, Zap, Vote, Archive, User } from "lucide-react";

export default function Profile() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [tracksToDelete, setTracksToDelete] = useState([]);
  const [selectedTrackIds, setSelectedTrackIds] = useState([]);

  useEffect(() => {
    document.title = "Profile - Soundope";
    loadUser();
  }, []);

  // Load Adsterra Banner Ad
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-profile-banner-763b8c85de11ad1c95d4275c8cb17af7');
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

  const { data: tracks = [] } = useQuery({
    queryKey: ['user-tracks', currentUser?.id],
    queryFn: () => api.entities.Track.filter({ artist_id: currentUser.id }),
    enabled: !!currentUser,
  });

  const calculateProfileCompletion = () => {
    if (!currentUser) return { percentage: 0, missing: [] };
    
    const checks = [
      { field: 'artist_name', label: 'Artist Name', complete: !!currentUser.artist_name },
      { field: 'bio', label: 'Bio', complete: !!currentUser.bio && currentUser.bio.length > 20 },
      { field: 'profile_image_url', label: 'Profile Picture', complete: !!currentUser.profile_image_url },
      { 
        field: 'social_links', 
        label: 'Social Links', 
        complete: currentUser.social_links && Object.values(currentUser.social_links).some(link => link && link.trim())
      }
    ];
    
    const completed = checks.filter(c => c.complete).length;
    const percentage = Math.round((completed / checks.length) * 100);
    const missing = checks.filter(c => !c.complete).map(c => c.label);
    
    return { percentage, missing, completed, total: checks.length };
  };

  const profileCompletion = currentUser ? calculateProfileCompletion() : { percentage: 0, missing: [] };

  const handleLogout = () => {
    api.auth.logout(window.location.origin + createPageUrl("Home"));
  };

  const openDeleteModal = async () => {
    try {
      const tracks = await api.entities.Track.filter({ artist_id: currentUser.id });
      setTracksToDelete(tracks);
      setShowDeleteModal(true);
    } catch (error) {
      alert("Failed to load tracks. Please try again.");
    }
  };

  const handleDeleteTracks = async () => {
    try {
      for (const trackId of selectedTrackIds) {
        await api.entities.Track.delete(trackId);
      }
      
      await api.auth.updateMe({
        total_tracks: Math.max(0, (currentUser.total_tracks || 0) - selectedTrackIds.length)
      });
      
      setShowDeleteModal(false);
      setSelectedTrackIds([]);
      setTracksToDelete([]);
      window.location.reload();
    } catch (error) {
      alert("Failed to delete tracks. Please try again.");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
      {/* Adsterra Banner Ad - Top of profile */}
      <div className="flex justify-center mb-6">
        <div className="w-full max-w-4xl">
          <div id="container-profile-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
        </div>
      </div>
      
      <div className="max-w-4xl mx-auto">
        {/* Profile Header */}
        <div className="neuro-base rounded-3xl p-8 mb-6">

          <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-light text-[#d0d0d0]">Profile</h1>
            <div className="flex gap-3">
              <Button
                onClick={() => navigate(createPageUrl("Analytics"))}
                className="neuro-base active:neuro-pressed rounded-2xl px-4 py-2"
              >
                <img
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/8f108b18a_Screenshot2025-11-01at100541AM.png"
                  alt="Analytics"
                  className="w-4 h-4"
                />
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("BuyCredits"))}
                className="neuro-base active:neuro-pressed rounded-2xl px-4 py-2"
              >
                <DollarSign className="w-4 h-4 text-[#808080]" />
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("ReceivedFeedback"))}
                className="neuro-base active:neuro-pressed rounded-2xl px-4 py-2"
              >
                <MessageSquare className="w-4 h-4 text-[#808080]" />
              </Button>
              <Button
                onClick={openDeleteModal}
                className="neuro-base active:neuro-pressed rounded-2xl px-4 py-2"
              >
                <Trash className="w-4 h-4 text-[#808080]" />
              </Button>
              <Button
                onClick={() => navigate(createPageUrl("Settings"))}
                className="neuro-base active:neuro-pressed rounded-2xl px-4 py-2"
              >
                <Settings className="w-4 h-4 text-[#808080]" />
              </Button>
              <Button
                onClick={handleLogout}
                className="neuro-base active:neuro-pressed rounded-2xl px-4 py-2"
              >
                <LogOut className="w-4 h-4 text-[#808080]" />
              </Button>
            </div>
          </div>

          {profileCompletion.percentage < 100 && (
            <div className="neuro-base rounded-3xl p-6 mb-6 border-2 border-[#2a2a2a]">
              <div className="flex items-start gap-4">
                <div className="neuro-pressed w-16 h-16 rounded-2xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl font-light text-[#a0a0a0]">{profileCompletion.percentage}%</span>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-light text-[#d0d0d0] mb-2">Complete Your Profile</h3>
                  <p className="text-sm text-[#808080] mb-3">
                    A complete profile helps you connect with other artists and get more engagement
                  </p>
                  
                  <div className="w-full h-2 bg-[#0a0a0a] rounded-full overflow-hidden neuro-pressed mb-3">
                    <div 
                      className="h-full bg-gradient-to-r from-[#606060] to-[#909090] transition-all duration-500"
                      style={{ width: `${profileCompletion.percentage}%` }}
                    />
                  </div>

                  <div className="flex flex-wrap gap-2 mb-3">
                    {profileCompletion.missing.map(item => (
                      <span key={item} className="text-xs px-3 py-1 rounded-full bg-[#1a1a1a] text-[#808080]">
                        Missing: {item}
                      </span>
                    ))}
                  </div>

                  <Button
                    onClick={() => navigate(createPageUrl("Settings"))}
                    className="neuro-base active:neuro-pressed rounded-2xl px-6 py-2"
                  >
                    <Settings className="w-4 h-4 text-[#a0a0a0] mr-2" />
                    <span className="text-[#a0a0a0]">Complete Profile</span>
                  </Button>
                </div>
              </div>
            </div>
          )}

          {showDeleteModal && (
            <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 overflow-y-auto">
              <div className="neuro-base rounded-3xl p-6 max-w-2xl w-full my-8">
                <h2 className="text-xl font-light text-[#d0d0d0] mb-4 text-center">Delete Tracks</h2>
                <p className="text-sm text-[#808080] mb-6 text-center">
                  Select tracks to delete permanently
                </p>
                
                {tracksToDelete.length === 0 ? (
                  <p className="text-sm text-[#707070] text-center py-8">No tracks to delete</p>
                ) : (
                  <div className="space-y-3 mb-6 max-h-96 overflow-y-auto">
                    {tracksToDelete.map((track) => (
                      <button
                        key={track.id}
                        onClick={() => {
                          if (selectedTrackIds.includes(track.id)) {
                            setSelectedTrackIds(selectedTrackIds.filter(id => id !== track.id));
                          } else {
                            setSelectedTrackIds([...selectedTrackIds, track.id]);
                          }
                        }}
                        className={`w-full neuro-flat rounded-2xl p-4 flex gap-3 items-center smooth-transition hover:scale-[1.01] ${
                          selectedTrackIds.includes(track.id) ? 'neuro-pressed' : ''
                        }`}
                      >
                        <img
                          src={track.cover_image_url}
                          alt={track.title}
                          className="w-16 h-16 rounded-xl object-cover"
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-[#d0d0d0] truncate">
                            {track.title}
                          </p>
                          <p className="text-xs text-[#707070]">
                            {track.total_listens} listens • {track.total_votes} votes
                          </p>
                        </div>
                        {selectedTrackIds.includes(track.id) && (
                          <div className="w-6 h-6 rounded-full bg-[#a08080] flex items-center justify-center">
                            <span className="text-xs text-white">✓</span>
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setSelectedTrackIds([]);
                      setTracksToDelete([]);
                    }}
                    className="flex-1 neuro-flat rounded-2xl py-3"
                  >
                    <span className="text-[#808080]">Cancel</span>
                  </Button>
                  <Button
                    onClick={handleDeleteTracks}
                    disabled={selectedTrackIds.length === 0}
                    className={`flex-1 rounded-2xl py-3 ${
                      selectedTrackIds.length === 0
                        ? 'neuro-pressed opacity-40 cursor-not-allowed text-[#606060]'
                        : 'neuro-base active:neuro-pressed text-[#a08080]'
                    }`}
                  >
                    Delete {selectedTrackIds.length > 0 ? `(${selectedTrackIds.length})` : ''}
                  </Button>
                </div>
              </div>
            </div>
          )}

          <div className="neuro-base rounded-3xl p-6 mb-6">
            <div className="flex items-start gap-6 mb-6">
              <div className="flex flex-col items-center gap-3">
                {currentUser.profile_image_url ? (
                  <img
                    src={currentUser.profile_image_url}
                    alt={currentUser.artist_name || currentUser.full_name}
                    className="w-32 h-32 rounded-3xl object-cover neuro-pressed"
                    fetchpriority="high"
                    decoding="async"
                    width="128"
                    height="128"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-3xl neuro-pressed flex items-center justify-center">
                    <User className="w-16 h-16 text-[#707070]" />
                  </div>
                )}
                
                <Button
                  onClick={() => navigate(createPageUrl("Archive"))}
                  className="neuro-flat rounded-2xl px-4 py-2 flex items-center gap-2 smooth-transition hover:scale-105"
                >
                  <Archive className="w-4 h-4 text-[#808080]" />
                  <span className="text-xs text-[#808080]">Archive</span>
                </Button>
              </div>
              
              <div className="flex-1">
                <h2 className="text-2xl font-light text-[#d0d0d0] mb-3">
                  {currentUser.artist_name || currentUser.full_name}
                </h2>
                
                <div className="flex flex-wrap gap-3 mb-3">
                  <div className="neuro-pressed rounded-xl px-3 py-2 flex items-center gap-2">
                    <Vote className="w-4 h-4 text-[#808080]" />
                    <span className="text-xs text-[#a0a0a0]">{currentUser.monthly_votes_remaining || 0} votes</span>
                  </div>
                  <div className="neuro-pressed rounded-xl px-3 py-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#909090]" />
                    <span className="text-xs text-[#a0a0a0]">{currentUser.standard_credits || 0} standard</span>
                  </div>
                  <div className="neuro-pressed rounded-xl px-3 py-2 flex items-center gap-2">
                    <Zap className="w-4 h-4 text-[#b0a090]" />
                    <span className="text-xs text-[#b0a090]">{currentUser.premium_credits || 0} premium</span>
                  </div>
                </div>
                
                {currentUser.bio && (
                  <p className="text-sm text-[#909090]">{currentUser.bio}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <button
                onClick={() => navigate(createPageUrl("MyTracks"))}
                className="neuro-pressed rounded-2xl p-4 text-center smooth-transition hover:scale-[1.02]"
              >
                <Music className="w-5 h-5 text-[#808080] mx-auto mb-2" />
                <p className="text-2xl font-light text-[#b0b0b0]">{tracks.length || 0}</p>
                <p className="text-xs text-[#707070]">Tracks</p>
              </button>
              <button
                onClick={() => navigate(createPageUrl("MyReviews"))}
                className="neuro-pressed rounded-2xl p-4 text-center smooth-transition hover:scale-[1.02]"
              >
                <MessageSquare className="w-5 h-5 text-[#808080] mx-auto mb-2" />
                <p className="text-2xl font-light text-[#b0b0b0]">{currentUser.total_feedback_given || 0}</p>
                <p className="text-xs text-[#707070]">Reviews Given</p>
              </button>
              <div className="neuro-pressed rounded-2xl p-4 text-center">
                <Trophy className="w-5 h-5 text-[#808080] mx-auto mb-2" />
                <p className="text-2xl font-light text-[#b0b0b0]">{currentUser.points || 0}</p>
                <p className="text-xs text-[#707070]">Points</p>
              </div>
              <div className="neuro-pressed rounded-2xl p-4 text-center">
                <div className="w-5 h-5 bg-[#606060] rounded-full mx-auto mb-2" />
                <p className="text-xs font-medium text-[#a0a0a0] uppercase tracking-wide">
                  {currentUser.review_tier || 'novice'}
                </p>
                <p className="text-xs text-[#707070]">Tier</p>
              </div>
            </div>
          </div>

          <div className="neuro-base rounded-3xl p-6">
            <h3 className="text-lg font-light text-[#d0d0d0] mb-6">My Tracks</h3>
            
            {tracks.length === 0 ? (
              <div className="text-center py-12">
                <Music className="w-12 h-12 text-[#606060] mx-auto mb-4" />
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
                {tracks.map((track) => (
                  <button
                    key={track.id}
                    onClick={() => navigate(createPageUrl("MyTracks"))}
                    className="neuro-flat rounded-2xl p-4 smooth-transition hover:scale-[1.02] text-left"
                  >
                    <div className="flex flex-col">
                      <img
                        src={track.cover_image_url}
                        alt={track.title}
                        className="w-full h-48 object-cover rounded-t-2xl"
                        loading="lazy"
                        width="300"
                        height="192"
                      />
                      <div className="p-3">
                        <h4 className="text-sm font-medium text-[#d0d0d0] mb-1 truncate">
                          {track.title}
                        </h4>
                        <div className="flex gap-4 text-xs text-[#707070] mb-2">
                          <span>{track.total_listens} listens</span>
                          <span>{track.total_votes} votes</span>
                        </div>
                        <div className="flex gap-2">
                          {track.genres?.slice(0, 2).map(genre => (
                            <span
                              key={genre}
                              className="text-[10px] px-2 py-1 rounded-full bg-[#1a1a1a] text-[#808080]"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
