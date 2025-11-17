import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Music, Play, TrendingUp, Clock, Zap } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function FreshDopeSounds() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    // Add SEO meta tags
    document.title = "Fresh Dope Sounds - Newest Music Uploads | Discover New Artists - Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Discover the freshest music uploads on Soundope. Listen to the 50 newest tracks from independent artists across all genres. Be the first to discover emerging talent." },
      { type: 'name', key: 'keywords', content: "new music uploads, fresh tracks, latest music, new artists, discover new music, newest songs, independent music uploads, latest releases" },
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

    
    // Ensure all video/audio elements in ad containers are muted (for live streaming)
    const muteAdMedia = () => {
      const adContainer = document.getElementById('container-fresh-banner-763b8c85de11ad1c95d4275c8cb17af7');
      if (adContainer) {
        const videos = adContainer.querySelectorAll('video');
        videos.forEach(v => { v.muted = true; v.volume = 0; });
        const audios = adContainer.querySelectorAll('audio');
        audios.forEach(a => { a.muted = true; a.volume = 0; });
      }
    };
    
    // Run immediately and set up interval
    muteAdMedia();
    const muteInterval = setInterval(muteAdMedia, 1000);
    
    // Also set up a MutationObserver to catch dynamically loaded content
    const checkAdContainer = () => {
      const adContainer = document.getElementById('container-fresh-banner-763b8c85de11ad1c95d4275c8cb17af7');
      if (adContainer) {
        const observer = new MutationObserver(() => {
          muteAdMedia();
        });
        observer.observe(adContainer, {
          childList: true,
          subtree: true
        });
        
        return () => observer.disconnect();
      }
    };
    
    // Check for ad container periodically (it might load after page load)
    const checkInterval = setInterval(() => {
      checkAdContainer();
    }, 500);
    
    return () => {
      clearInterval(muteInterval);
      clearInterval(checkInterval);
    };
  }, []);

  // Load Adsterra Banner Ad (main banner)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-fresh-banner-763b8c85de11ad1c95d4275c8cb17af7');
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

  // Load Adsterra Banner Ad (upload area ad)
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const loadUploadAd = () => {
      const adContainer = document.getElementById('container-fresh-upload-ad-763b8c85de11ad1c95d4275c8cb17af7');
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

    loadUploadAd();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  // Get the 50 most recent tracks
  const { data: freshTracks = [], isLoading } = useQuery({
    queryKey: ['fresh-tracks'],
    queryFn: async () => {
      try {
        const tracks = await api.entities.Track.list('-created_at', 50);
        return tracks || [];
      } catch (error) {
        console.error('Error loading fresh tracks:', error);
        return [];
      }
    },
    retry: 2,
    staleTime: 30000,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
        <div className="flex gap-6 max-w-7xl mx-auto">
          <div className="flex-1">
        {/* Upload Area - Behind Ad */}
        <div className="mb-8">
          {/* Ad Container - Behind Upload Area */}
          <div className="flex justify-center mb-4">
            <div className="w-full max-w-4xl">
              <div 
                id="container-fresh-upload-ad-763b8c85de11ad1c95d4275c8cb17af7"
                style={{ pointerEvents: 'auto' }}
                onMouseEnter={(e) => {
                  // Ensure any video/audio in ad is muted on hover
                  const videos = e.currentTarget.querySelectorAll('video');
                  videos.forEach(v => { v.muted = true; v.volume = 0; });
                  const audios = e.currentTarget.querySelectorAll('audio');
                  audios.forEach(a => { a.muted = true; a.volume = 0; });
                }}
              ></div>
            </div>
          </div>
          
          {/* Upload Button */}
          <div className="mb-8 flex justify-center">
            <Link
              to={createPageUrl("Upload")}
              className="neuro-base active:neuro-pressed rounded-2xl px-6 py-3 smooth-transition hover:scale-105"
              onClick={(e) => {
                // Ensure the link works - don't let any ad intercept
                e.stopPropagation();
              }}
            >
              <span className="text-sm text-[#a0a0a0]">Upload Your Track</span>
            </Link>
          </div>
        </div>

        {/* Header */}
        <div className="text-center mb-12">
          <div className="neuro-base w-24 h-24 rounded-[32px] mx-auto mb-6 flex items-center justify-center">
            <Zap className="w-12 h-12 text-[#a0a0a0]" fill="currentColor" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extralight mb-4 text-[#d0d0d0] tracking-tight">
            Fresh Dope Sounds
          </h1>
          <p className="text-lg text-[#808080] max-w-2xl mx-auto">
            The 50 newest tracks uploaded to Soundope. Be the first to discover emerging artists.
          </p>
        </div>

        {/* Adsterra Banner Ad - SILENT ONLY (for live streaming) */}
        <div className="flex justify-center mb-8">
          <div className="w-full max-w-4xl">
            <div 
              id="container-fresh-banner-763b8c85de11ad1c95d4275c8cb17af7"
              style={{ pointerEvents: 'auto' }}
              onMouseEnter={(e) => {
                // Ensure any video/audio in ad is muted on hover
                const videos = e.currentTarget.querySelectorAll('video');
                videos.forEach(v => { v.muted = true; v.volume = 0; });
                const audios = e.currentTarget.querySelectorAll('audio');
                audios.forEach(a => { a.muted = true; a.volume = 0; });
              }}
            ></div>
          </div>
        </div>

        {/* Tracks Grid */}
        {freshTracks.length === 0 ? (
          <div className="neuro-base rounded-3xl p-12 text-center">
            <Music className="w-16 h-16 text-[#606060] mx-auto mb-4" />
            <p className="text-sm text-[#808080]">No tracks uploaded yet</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {freshTracks.map((track, index) => (
              <Link
                key={track.id}
                to={createPageUrl("TrackDetails") + `?trackId=${track.id}`}
                className="neuro-base rounded-2xl overflow-hidden smooth-transition hover:scale-[1.02] group"
              >
                {/* Position Badge */}
                <div className="absolute top-3 left-3 z-10 neuro-pressed rounded-xl px-3 py-1">
                  <span className="text-sm font-medium text-[#a0a0a0]">#{index + 1}</span>
                </div>

                {/* Cover Image */}
                <div className="relative aspect-square">
                  <img
                    src={track.cover_image_url}
                    alt={track.title}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    width="300"
                    height="300"
                  />
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <div className="neuro-flat w-16 h-16 rounded-full flex items-center justify-center">
                      <Play className="w-8 h-8 text-[#a0a0a0] ml-1" />
                    </div>
                  </div>

                  {/* Time Badge */}
                  <div className="absolute bottom-3 right-3 neuro-base rounded-xl px-3 py-1 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#808080]" />
                    <span className="text-xs text-[#808080]">
                      {formatDistanceToNow(new Date(track.created_date), { addSuffix: true })}
                    </span>
                  </div>
                </div>

                {/* Track Info */}
                <div className="p-4">
                  <h3 className="text-base font-medium text-[#d0d0d0] mb-1 truncate">
                    {track.title}
                  </h3>
                  <p className="text-sm text-[#808080] mb-3 truncate">
                    {track.artist_name}
                  </p>

                  {/* Genres */}
                  <div className="flex flex-wrap gap-1 mb-3">
                    {track.genres?.slice(0, 2).map(genre => (
                      <span
                        key={genre}
                        className="text-xs px-2 py-0.5 rounded-full bg-[#0a0a0a] text-[#707070]"
                      >
                        {genre}
                      </span>
                    ))}
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="neuro-pressed rounded-lg p-2 text-center">
                      <p className="text-xs font-medium text-[#a0a0a0]">{track.total_listens || 0}</p>
                      <p className="text-[10px] text-[#606060]">Listens</p>
                    </div>
                    <div className="neuro-pressed rounded-lg p-2 text-center">
                      <p className="text-xs font-medium text-[#a0a0a0]">
                        {(track.praise_count || 0) + (track.neutral_count || 0) + (track.constructive_count || 0)}
                      </p>
                      <p className="text-[10px] text-[#606060]">Reviews</p>
                    </div>
                    <div className="neuro-pressed rounded-lg p-2 text-center">
                      <p className="text-xs font-medium text-[#a0a0a0]">{track.total_votes || 0}</p>
                      <p className="text-[10px] text-[#606060]">Votes</p>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Info Section */}
        <div className="neuro-base rounded-3xl p-8 mt-12 text-center">
          <h2 className="text-2xl font-light text-[#d0d0d0] mb-4">
            How Fresh Dope Sounds Works
          </h2>
          <div className="max-w-3xl mx-auto space-y-4 text-sm text-[#808080] leading-relaxed">
            <p>
              This page showcases the <span className="text-[#a0a0a0] font-medium">50 most recently uploaded tracks</span> on Soundope. 
              Every time an artist uploads new music, it appears at the top of this list.
            </p>
            <p>
              As new tracks are uploaded, older tracks move down the list. Once a track reaches position #50 and 
              a new track is uploaded, it graduates from Fresh Dope Sounds and becomes part of the main discovery rotation.
            </p>
            <p className="text-[#a0a0a0]">
              Be an early supporter! Discover artists before they blow up. 🚀
            </p>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}