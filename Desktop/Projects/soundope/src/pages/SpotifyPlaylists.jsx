
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Music, CheckCircle, ExternalLink, AlertCircle, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function SpotifyPlaylists() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [hasFollowed, setHasFollowed] = useState(false);
  const [trackUrl, setTrackUrl] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    // Add comprehensive SEO meta tags
    document.title = "Submit to Spotify Playlists - Free Music Playlist Submission | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Submit your music to curated Spotify playlists for free. Get playlist placements, increase streams, and grow your Spotify presence with Soundope." },
      { type: 'name', key: 'keywords', content: "spotify playlist submission, free playlist promotion, submit to spotify, playlist placement, spotify promotion free, music playlist curators" },
      { type: 'name', key: 'robots', content: 'index, follow' },
      
      // Open Graph
      { type: 'property', key: 'og:title', content: 'Submit to Spotify Playlists - Free Submission | Soundope' },
      { type: 'property', key: 'og:description', content: 'Submit your music to curated Spotify playlists and grow your streams' },
      { type: 'property', key: 'og:type', content: 'website' },
      { type: 'property', key: 'og:url', content: typeof window !== 'undefined' ? window.location.href : '' },
      
      // Twitter
      { type: 'name', key: 'twitter:card', content: 'summary_large_image' },
      { type: 'name', key: 'twitter:title', content: 'Submit to Spotify Playlists - Soundope' },
      { type: 'name', key: 'twitter:description', content: 'Free Spotify playlist submission for independent artists' },
      
      // Canonical URL
      { type: 'link', key: 'canonical', content: typeof window !== 'undefined' ? window.location.origin + window.location.pathname : '' },
    ];

    metaTags.forEach(({ type, key, content }) => {
      if (type === 'link') {
        let tag = document.querySelector(`link[rel="${key}"]`);
        if (tag) {
          tag.setAttribute('href', content);
        } else {
          tag = document.createElement('link');
          tag.setAttribute('rel', key);
          tag.setAttribute('href', content);
          document.head.appendChild(tag);
        }
      } else {
        let tag = document.querySelector(`meta[${type}="${key}"]`);
        if (tag) {
          tag.setAttribute('content', content);
        } else {
          tag = document.createElement('meta');
          tag.setAttribute(type, key);
          tag.setAttribute('content', content);
          document.head.appendChild(tag);
        }
      }
    });

    loadUser();
  }, []);

  // Initialize Ezoic Ads for Playlists page
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    if (typeof ezstandalone !== 'undefined') {
      ezstandalone.cmd.push(function () {
        ezstandalone.showAds(501, 502, 503);
      });
    }
  }, []);


  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: playlists = [], isLoading } = useQuery({
    queryKey: ['spotify-playlists'],
    queryFn: async () => {
      try {
        const response = await api.functions.invoke('spotifyPlaylist', {
          action: 'getPlaylists'
        });
        return response?.data?.playlists || [];
      } catch (error) {
        console.error('Error fetching playlists:', error);
        // Return default playlists if API fails
        return [
          {
            id: '6REhaX1sFDi2oQ9khup5ts',
            name: 'Soundope Fresh',
            description: 'The freshest independent music from Soundope artists',
          },
          {
            id: '6r1m5BFff2w6LdVLGG4PSV',
            name: 'Soundope Underground',
            description: 'Underground gems and hidden tracks from emerging artists',
          },
        ];
      }
    },
  });

  const { data: userSubmissions = [] } = useQuery({
    queryKey: ['user-playlist-submissions', currentUser?.id],
    queryFn: () => api.entities.PlaylistSubmission.filter({ user_id: currentUser.id }),
    enabled: !!currentUser && !!currentUser.id,
  });

  const hasSubmittedToPlaylist = (playlistId) => {
    return userSubmissions.some(sub => sub.playlist_id === playlistId);
  };

  const handleFollowClick = (playlist) => {
    setSelectedPlaylist(playlist);
    // Open Spotify playlist in new tab
    window.open(`https://open.spotify.com/playlist/${playlist.id}`, '_blank');
    
    // After a delay, assume they followed
    setTimeout(() => {
      setHasFollowed(true);
    }, 2000);
  };

  const handleSubmit = async () => {
    if (!currentUser) {
      setSubmitError("Please log in to submit tracks");
      return;
    }
    
    if (!trackUrl.trim()) {
      setSubmitError("Please enter a Spotify track URL");
      return;
    }

    if (!trackUrl.includes('spotify.com/track/')) {
      setSubmitError("Please enter a valid Spotify track URL");
      return;
    }

    setIsSubmitting(true);
    setSubmitError("");

    try {
      const response = await api.functions.invoke('spotifyPlaylist', {
        action: 'submitTrack',
        playlistId: selectedPlaylist.id,
        trackUrl: trackUrl
      });

      if (response.data.success) {
        setSubmitSuccess(true);
        setTrackUrl("");
        setHasFollowed(false);
        setSelectedPlaylist(null);
      }
    } catch (error) {
      setSubmitError(error.response?.data?.error || "Failed to submit track. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
        <div className="flex gap-6 max-w-7xl mx-auto">
          <div className="flex-1 max-w-6xl mx-auto">
        {/* Ad 501: Top of playlists page */}
        <div className="flex justify-center mb-6">
          <div id="ezoic-pub-ad-placeholder-501"></div>
        </div>

        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img
              src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/a0741ee01_IMG_2529.jpeg"
              alt="Spotify"
              className="w-12 h-12 object-contain"
            />
            <h1 className="text-3xl font-light text-[#d0d0d0]">Playlists</h1>
          </div>
          <p className="text-sm text-[#808080]">Follow our playlists and submit your tracks</p>
        </div>

        {/* Two Submission Sections */}
        {currentUser && (
          <div className="space-y-6 mb-8">
            {/* Submit to OUR Playlists - FREE */}
            <div className="neuro-base rounded-3xl p-6">
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-2">Submit to OUR Playlists FREE</h2>
              <p className="text-sm text-[#808080] mb-4">Submit your tracks to Soundope's curated playlists at no cost</p>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#808080] mb-2 block">Select Playlist</label>
                <select
                  value={selectedPlaylist?.id || ''}
                  onChange={(e) => {
                    const playlist = playlists.find(p => p.id === e.target.value);
                    setSelectedPlaylist(playlist);
                    setHasFollowed(false);
                    setTrackUrl("");
                    setSubmitError("");
                  }}
                  className="w-full bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl px-4 py-3"
                >
                  <option value="">Choose a playlist...</option>
                  {playlists.map((playlist) => (
                    <option key={playlist.id} value={playlist.id}>
                      {playlist.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPlaylist && (
                <>
                  <div>
                    <label className="text-sm text-[#808080] mb-2 block">Spotify Track URL</label>
                    <Input
                      value={trackUrl}
                      onChange={(e) => setTrackUrl(e.target.value)}
                      placeholder="https://open.spotify.com/track/..."
                      className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl"
                    />
                  </div>

                  <Button
                    onClick={handleSubmit}
                    disabled={isSubmitting || !trackUrl.trim()}
                    className="w-full neuro-base active:neuro-pressed rounded-xl py-3"
                  >
                    {isSubmitting ? (
                      <Loader2 className="w-4 h-4 animate-spin text-[#808080]" />
                    ) : (
                      "Submit Track"
                    )}
                  </Button>

                  {submitError && (
                    <div className="flex items-center gap-2 text-xs text-[#b09090]">
                      <AlertCircle className="w-4 h-4" />
                      {submitError}
                    </div>
                  )}
                </>
              )}
            </div>
            </div>

            {/* Submit to Curators - 1 Credit */}
            <div className="neuro-base rounded-3xl p-6 border-2 border-[#2a2a2a]">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h2 className="text-xl font-medium text-[#d0d0d0] mb-2">Submit to Our Curators</h2>
                  <p className="text-sm text-[#808080] mb-2">Submit to our curators, and the top playlists in the world</p>
                  <p className="text-xs text-[#707070]">Cost: 1 credit per submission</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-[#808080] mb-1">Your Credits</p>
                  <p className="text-lg font-medium text-[#d0d0d0]">
                    {((currentUser?.standard_credits || 0) + (currentUser?.premium_credits || 0)) || 0}
                  </p>
                </div>
              </div>
              <Button
                onClick={() => navigate(createPageUrl("CuratorSubmission"))}
                disabled={((currentUser?.standard_credits || 0) + (currentUser?.premium_credits || 0)) < 1}
                className="w-full neuro-base active:neuro-pressed rounded-xl py-3 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                Submit to Curators
              </Button>
              {((currentUser?.standard_credits || 0) + (currentUser?.premium_credits || 0)) < 1 && (
                <p className="text-xs text-[#b09090] mt-2 text-center">
                  You need at least 1 credit to submit to curators
                </p>
              )}
            </div>
          </div>
        )}

        {/* Success Message */}
        {submitSuccess && (
          <div className="neuro-base rounded-3xl p-6 mb-6 bg-[#1a2a1a]">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#90b090]" />
              <div>
                <p className="text-sm font-medium text-[#90b090]">Track Submitted!</p>
                <p className="text-xs text-[#808080] mt-1">
                  We'll review your submission and add it to the playlist soon.
                </p>
              </div>
            </div>
            <button
              onClick={() => setSubmitSuccess(false)}
              className="mt-4 neuro-flat rounded-xl px-4 py-2 text-xs text-[#808080]"
            >
              Submit Another Track
            </button>
          </div>
        )}

        {/* Ad 502: Before playlists grid */}
        <div className="flex justify-center mb-6">
          <div id="ezoic-pub-ad-placeholder-502"></div>
        </div>

        {/* Playlists Grid */}
        <div className="grid md:grid-cols-2 gap-6">
          {playlists.map((playlist) => {
            const alreadySubmitted = hasSubmittedToPlaylist(playlist.id);
            const isSelected = selectedPlaylist?.id === playlist.id;
            
            // Use the actual playlist ID for the embed URL
            const embedUrl = `https://open.spotify.com/embed/playlist/${playlist.id}?utm_source=generator`;

            return (
              <div key={playlist.id} className="neuro-base rounded-3xl overflow-hidden">
                {/* Spotify Embed */}
                <div className="relative">
                  <iframe
                    style={{ borderRadius: '12px 12px 0 0' }}
                    src={embedUrl}
                    width="100%"
                    height="352"
                    frameBorder="0"
                    allowFullScreen
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                  />
                </div>

                <div className="p-6">
                  <h3 className="text-lg font-medium text-[#d0d0d0] mb-2">
                    {playlist.name}
                  </h3>
                  <p className="text-sm text-[#808080] mb-4">
                    {playlist.description}
                  </p>

                  {alreadySubmitted ? (
                    <div className="neuro-pressed rounded-2xl p-4 flex items-center gap-3">
                      <CheckCircle className="w-5 h-5 text-[#90b090]" />
                      <div>
                        <p className="text-sm text-[#90b090] font-medium">Track Submitted</p>
                        <p className="text-xs text-[#707070]">Under review</p>
                      </div>
                    </div>
                  ) : !isSelected ? (
                    <Button
                      onClick={() => handleFollowClick(playlist)}
                      className="w-full neuro-base active:neuro-pressed rounded-2xl py-3 flex items-center justify-center gap-2"
                    >
                      <img
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/a0741ee01_IMG_2529.jpeg"
                        alt="Spotify"
                        className="w-5 h-5 object-contain"
                      />
                      <span className="text-[#a0a0a0]">Follow on Spotify</span>
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  ) : (
                    <div className="space-y-4">
                      {/* Step 1: Follow Confirmation */}
                      {!hasFollowed ? (
                        <div className="neuro-pressed rounded-2xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                              <span className="text-xs text-[#808080]">1</span>
                            </div>
                            <p className="text-sm text-[#a0a0a0]">Click to open the playlist on Spotify</p>
                          </div>
                          <Button
                            onClick={() => window.open(`https://open.spotify.com/playlist/${playlist.id}`, '_blank')}
                            className="w-full neuro-flat rounded-xl py-2 flex items-center justify-center gap-2"
                          >
                            <span className="text-[#808080] text-sm">Open Spotify</span>
                            <ExternalLink className="w-4 h-4 text-[#808080]" />
                          </Button>
                          <button
                            onClick={() => setHasFollowed(true)}
                            className="w-full mt-2 text-xs text-[#707070] hover:text-[#a0a0a0]"
                          >
                            I've followed the playlist
                          </button>
                        </div>
                      ) : (
                        <div className="neuro-pressed rounded-2xl p-4 bg-[#1a2a1a]">
                          <div className="flex items-center gap-3">
                            <CheckCircle className="w-5 h-5 text-[#90b090]" />
                            <p className="text-sm text-[#90b090]">Followed!</p>
                          </div>
                        </div>
                      )}

                      {/* Step 2: Submit Track */}
                      {hasFollowed && (
                        <div className="neuro-pressed rounded-2xl p-4">
                          <div className="flex items-center gap-3 mb-3">
                            <div className="w-8 h-8 rounded-full bg-[#1a1a1a] flex items-center justify-center">
                              <span className="text-xs text-[#808080]">2</span>
                            </div>
                            <p className="text-sm text-[#a0a0a0]">Submit your Spotify track</p>
                          </div>

                          {submitError && (
                            <div className="flex items-center gap-2 mb-3 text-xs text-[#b09090]">
                              <AlertCircle className="w-4 h-4" />
                              {submitError}
                            </div>
                          )}

                          <Input
                            value={trackUrl}
                            onChange={(e) => setTrackUrl(e.target.value)}
                            placeholder="https://open.spotify.com/track/..."
                            className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl mb-3"
                          />

                          <div className="flex gap-2">
                            <Button
                              onClick={() => {
                                setSelectedPlaylist(null);
                                setHasFollowed(false);
                                setTrackUrl("");
                                setSubmitError("");
                              }}
                              className="flex-1 neuro-flat rounded-xl py-2"
                            >
                              <span className="text-[#707070] text-sm">Cancel</span>
                            </Button>
                            <Button
                              onClick={handleSubmit}
                              disabled={isSubmitting || !trackUrl.trim()}
                              className="flex-1 neuro-base active:neuro-pressed rounded-xl py-2"
                            >
                              {isSubmitting ? (
                                <Loader2 className="w-4 h-4 animate-spin text-[#808080]" />
                              ) : (
                                <span className="text-[#a0a0a0] text-sm">Submit Track</span>
                              )}
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Instructions */}
        <div className="neuro-base rounded-3xl p-6 mt-8">
          <h3 className="text-sm font-medium text-[#d0d0d0] mb-4">How It Works</h3>
          <div className="space-y-3 text-sm text-[#808080]">
            <div className="flex gap-3">
              <span className="neuro-pressed w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">1</span>
              <p>Click "Follow on Spotify" to open the playlist in a new tab</p>
            </div>
            <div className="flex gap-3">
              <span className="neuro-pressed w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">2</span>
              <p>Follow the playlist on Spotify</p>
            </div>
            <div className="flex gap-3">
              <span className="neuro-pressed w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">3</span>
              <p>Come back and confirm you've followed</p>
            </div>
            <div className="flex gap-3">
              <span className="neuro-pressed w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">4</span>
              <p>Submit your Spotify track URL (limit 1 track per playlist)</p>
            </div>
            <div className="flex gap-3">
              <span className="neuro-pressed w-6 h-6 rounded-full flex items-center justify-center text-xs flex-shrink-0">5</span>
              <p>We'll review your submission and add it to the playlist if it fits</p>
            </div>
          </div>
        </div>

        {/* Ad 503: Bottom of page */}
        <div className="flex justify-center mt-8">
          <div id="ezoic-pub-ad-placeholder-503"></div>
        </div>
        </div>
      </div>
    </div>
  );
}
