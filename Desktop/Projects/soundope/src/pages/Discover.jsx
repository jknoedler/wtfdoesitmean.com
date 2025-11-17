
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Link, useNavigate } from "react-router-dom";
import { Music, Clock, BarChart2, CheckCircle2, XCircle, AlertCircle, DollarSign, Plus, Minus, ThumbsUp, X, Loader2 } from "lucide-react";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import CommentSection from "@/components/CommentSection";

export default function Discover() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [previousTrack, setPreviousTrack] = useState(null);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(70);
  const [lastVolume, setLastVolume] = useState(70);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hasSeenWarning, setHasSeenWarning] = useState(false);
  const [seenTrackIds, setSeenTrackIds] = useState(new Set());
  const [listenPercentage, setListenPercentage] = useState(0);
  const [canGiveFeedback, setCanGiveFeedback] = useState(false);
  const [tracksViewed, setTracksViewed] = useState(0);
  const [showAd, setShowAd] = useState(false);
  const [adDismissed, setAdDismissed] = useState(false);
  const [votingTrack, setVotingTrack] = useState(null);
  const [votesToAllocate, setVotesToAllocate] = useState(1);
  const [voteInputValue, setVoteInputValue] = useState("1");
  const audioRef = useRef(null);
  const videoRef = useRef(null);

  useEffect(() => {
    loadUser();

    // Add SEO meta tags
    document.title = "Discover New Music & Submit Feedback | Music Discovery Platform - Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Discover new music from independent artists. Listen, review, and earn credits. Find hidden gems across all genres - hip hop, electronic, indie, pop, and more. Join the music discovery community." },
      { type: 'name', key: 'keywords', content: "discover new music, music discovery app, find new artists, listen to independent music, review music online, music feedback community, discover unsigned artists, new music platform" },
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
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
      
      // If not logged in, redirect to Home
      if (!user) {
        navigate(createPageUrl("Home"));
        return;
      }
      
      const warned = localStorage.getItem('hasSeenSkipWarning');
      setHasSeenWarning(warned === 'true');
    } catch (error) {
      console.error("Error loading user:", error);
      // Redirect to Home on error
      navigate(createPageUrl("Home"));
    }
  };

  const { data: nextTrack, isLoading } = useQuery({
    queryKey: ['discover-next-track', currentUser?.id, Array.from(seenTrackIds)],
    queryFn: async () => {
      // Get all tracks and user's archive logs
      const [tracks, archiveLogs] = await Promise.all([
        api.entities.Track.filter({ is_active: true }),
        api.entities.ArchiveLog.filter({ 
          user_id: currentUser.id,
          action_type: "feedback_given"
        })
      ]);
      
      // Get IDs of tracks user has already given feedback on
      const reviewedTrackIds = new Set(
        archiveLogs
          .filter(log => log.metadata?.track_id)
          .map(log => log.metadata.track_id)
      );
      
      // Combine with tracks seen in current session
      const allSeenIds = new Set([...reviewedTrackIds, ...Array.from(seenTrackIds)]);
      
      const eligibleTracks = tracks.filter(track => {
        if (track.artist_id === currentUser.id) return false;
        if (allSeenIds.has(track.id)) return false;
        if (currentUser.detested_genres?.some(g => track.genres?.includes(g))) return false;
        if (currentUser.detested_motifs?.some(m => track.motifs?.includes(m))) return false;
        return true;
      });

      if (eligibleTracks.length === 0) return null;

      // Weighted random selection based on boost pool
      // Higher boost pool = higher chance of being selected, but still random
      const totalWeight = eligibleTracks.reduce((sum, track) => {
        const boostScore = (track.boost_pool || 0) / Math.max((track.total_listens || 0), 1);
        // Base weight of 1, plus boost score (so unboosted tracks still have a chance)
        return sum + 1 + boostScore;
      }, 0);

      let random = Math.random() * totalWeight;
      
      for (const track of eligibleTracks) {
        const boostScore = (track.boost_pool || 0) / Math.max((track.total_listens || 0), 1);
        const weight = 1 + boostScore;
        random -= weight;
        if (random <= 0) {
          return track;
        }
      }

      // Fallback: return random track if weighted selection fails (shouldn't happen if totalWeight > 0)
      return eligibleTracks[Math.floor(Math.random() * eligibleTracks.length)];
    },
    enabled: !!currentUser,
  });

  useEffect(() => {
    if (nextTrack && !currentTrack) {
      // Check if we should show an ad (every 3 tracks)
      if (tracksViewed > 0 && tracksViewed % 3 === 0 && !adDismissed) {
        setShowAd(true);
        setAdDismissed(false);
      } else {
        // Load track immediately if no ad needed
        setCurrentTrack(nextTrack);
        setSeenTrackIds(prev => new Set([...Array.from(prev), nextTrack.id]));
        setAdDismissed(false);
      }
    }
  }, [nextTrack, currentTrack, tracksViewed, adDismissed]);

  // Load Adsterra Ad in modal
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (!showAd) return;

    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('discover-ad-container');
      if (!adContainer || adContainer.dataset.loaded === 'true') return;

      // Load script if not already loaded
      if (!document.querySelector('script[src*="763b8c85de11ad1c95d4275c8cb17af7"]')) {
        const script = document.createElement('script');
        script.async = true;
        script.setAttribute('data-cfasync', 'false');
        script.src = '//laceokay.com/763b8c85de11ad1c95d4275c8cb17af7/invoke.js';
        document.head.appendChild(script);
      }

      // Initialize ad container and mute any audio/video
      setTimeout(() => {
        if (adContainer && !adContainer.dataset.loaded) {
          adContainer.dataset.loaded = 'true';
          adContainer.innerHTML = '<div id="container-763b8c85de11ad1c95d4275c8cb17af7"></div>';
          
          // Mute any audio/video that loads (for live streaming)
          const muteAdContent = () => {
            const videos = adContainer.querySelectorAll('video');
            videos.forEach(v => { v.muted = true; v.volume = 0; });
            const audios = adContainer.querySelectorAll('audio');
            audios.forEach(a => { a.muted = true; a.volume = 0; });
          };
          
          const observer = new MutationObserver(muteAdContent);
          observer.observe(adContainer, { childList: true, subtree: true });
          setInterval(muteAdContent, 500);
        }
      }, 200);
    };

    loadAdsterraAd();
  }, [showAd]);

  // Handle ad dismissal and load next track
  const handleAdDismiss = () => {
    setShowAd(false);
    setAdDismissed(true);
    if (nextTrack) {
      setCurrentTrack(nextTrack);
      setSeenTrackIds(prev => new Set([...Array.from(prev), nextTrack.id]));
    }
  };

  const incrementListenMutation = useMutation({
    mutationFn: async (trackId) => {
      await api.entities.Track.update(trackId, {
        total_listens: (currentTrack?.total_listens || 0) + 1,
      });
    },
  });

  const skipTrackMutation = useMutation({
    mutationFn: async (trackId) => {
      const track = await api.entities.Track.filter({ id: trackId });
      if (track[0]) {
        await api.entities.Track.update(trackId, {
          total_skips: (track[0].total_skips || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      handleSkip();
    },
  });

  const createArchiveMutation = useMutation({
    mutationFn: (trackId) => api.entities.ArchiveLog.create({
      track_id: trackId,
      timestamp: new Date().toISOString(),
    }),
  });

  useEffect(() => {
    const media = currentTrack?.video_url ? videoRef.current : audioRef.current;
    if (media) {
      media.volume = volume / 100;
    }
  }, [volume, currentTrack]);

  useEffect(() => {
    const media = currentTrack?.video_url ? videoRef.current : audioRef.current;
    if (!media || !currentTrack) return;

    const handleTimeUpdate = () => {
      setCurrentTime(media.currentTime);
      
      // Calculate listen percentage
      if (media.duration) {
        const percentage = (media.currentTime / media.duration) * 100;
        setListenPercentage(percentage);
        
        // Enable feedback button at 75%
        if (percentage >= 75) {
          setCanGiveFeedback(true);
        }
      }
    };
    
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleEnded = () => {
      incrementListenMutation.mutate(currentTrack.id);
      setIsPlaying(false);
      // Don't auto-advance - let user give feedback or skip manually
    };

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('play', handlePlay);
    media.addEventListener('pause', handlePause);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('play', handlePlay);
      media.removeEventListener('pause', handlePause);
      media.removeEventListener('ended', handleEnded);
    };
  }, [currentTrack]);

  const handlePlayPause = () => {
    const media = currentTrack?.video_url ? videoRef.current : audioRef.current;
    if (media) {
      if (isPlaying) {
        media.pause();
      } else {
        media.play();
      }
    }
  };

  const handleSkip = () => {
    if (!hasSeenWarning) {
      alert("Skipping tracks frequently may lower their visibility. Consider giving feedback instead!");
      localStorage.setItem('hasSeenSkipWarning', 'true');
      setHasSeenWarning(true);
    }
    
    setPreviousTrack(currentTrack);
    setCurrentTrack(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setListenPercentage(0);
    setCanGiveFeedback(false);
    setTracksViewed(prev => prev + 1);
    queryClient.invalidateQueries(['discover-next-track']);
  };

  const handleNext = () => {
    createArchiveMutation.mutate(currentTrack.id);
    setPreviousTrack(currentTrack);
    setCurrentTrack(null);
    setCurrentTime(0);
    setIsPlaying(false);
    setListenPercentage(0);
    setCanGiveFeedback(false);
    setTracksViewed(prev => prev + 1);
    queryClient.invalidateQueries(['discover-next-track']);
  };

  const handleSeek = (value) => {
    const media = currentTrack?.video_url ? videoRef.current : audioRef.current;
    if (media) {
      media.currentTime = value[0];
      setCurrentTime(value[0]);
    }
  };

  const toggleMute = () => {
    if (volume > 0) {
      setLastVolume(volume);
      setVolume(0);
    } else {
      setVolume(lastVolume || 70);
    }
  };

  const formatTime = (seconds) => {
    if (!seconds || isNaN(seconds)) return "0:00";
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const navigateToFeedback = () => {
    if (!canGiveFeedback) return;
    
    navigate(createPageUrl("Feedback") + `?trackId=${currentTrack.id}`, {
      state: {
        track: currentTrack,
        listenPercentage,
        listenDuration: currentTime
      }
    });
  };

  // Voting functionality
  const submitVoteMutation = useMutation({
    mutationFn: async ({ track, voteCount }) => {
      if (voteCount > 0) {
        // Create vote record
        await api.entities.Vote.create({
          track_id: track.id,
          voter_id: currentUser.id,
          artist_id: track.artist_id,
          vote_count: voteCount,
          vote_type: "discover",
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
      queryClient.invalidateQueries(['discover-next-track']);
      setVotingTrack(null);
      setVotesToAllocate(1);
      setVoteInputValue("1");
      loadUser();
    }
  });

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
    const maxVotes = currentUser?.monthly_votes_remaining || 0;
    
    if (value === "") {
      setVoteInputValue("");
      return;
    }
    
    if (!/^\d+$/.test(value)) {
      return;
    }
    
    const numValue = parseInt(value);
    
    if (numValue > maxVotes) {
      setVoteInputValue(maxVotes.toString());
      setVotesToAllocate(maxVotes);
      return;
    }
    
    if (numValue < 1) {
      setVoteInputValue("1");
      setVotesToAllocate(1);
      return;
    }
    
    setVoteInputValue(value);
    setVotesToAllocate(numValue);
  };

  const handleInputBlur = () => {
    if (voteInputValue === "" || parseInt(voteInputValue) < 1) {
      setVoteInputValue("1");
      setVotesToAllocate(1);
    }
  };

  const submitVote = () => {
    submitVoteMutation.mutate({ track: votingTrack, voteCount: votesToAllocate });
  };

  const handleNextTrackClick = () => {
    handleNext();
  };

  // Show ad modal if needed
  if (showAd && !adDismissed) {
    return (
      <div style={{ 
        position: 'relative', 
        minHeight: '100vh',
        backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/79349b130_ChatGPTImageNov22025at05_17_27PM.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}>
        <div className="min-h-screen px-4 py-8 flex items-center justify-center">
          <div className="w-full max-w-lg">
            <div className="neuro-base rounded-3xl p-6">
              <div className="text-center mb-4">
                <h3 className="text-lg font-light text-[#d0d0d0] mb-2">Thanks for discovering music!</h3>
                <p className="text-xs text-[#808080]">Enjoying Soundope? Check out this:</p>
              </div>
              
              {/* Ad Container - Replace with your Adsterra Banner/Native Banner code */}
              <div className="neuro-pressed rounded-2xl p-4 mb-4 min-h-[250px] flex items-center justify-center bg-[#0a0a0a]">
                <div id="discover-ad-container" className="w-full">
                  {/* Adsterra Banner/Native Banner will load here */}
                  <p className="text-xs text-[#505050] text-center">Ad will load here</p>
                </div>
              </div>

              <button
                onClick={handleAdDismiss}
                className="w-full neuro-base active:neuro-pressed rounded-2xl py-4 text-sm font-medium text-[#d0d0d0] smooth-transition hover:scale-[1.01]"
              >
                Continue Discovering
              </button>
            </div>
          </div>
        </div>

      </div>
    );
  }

  // Show loading state only if user is loaded but track isn't yet
  if (currentUser && !currentTrack) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Music className="w-16 h-16 text-[#606060] mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-[#808080]">Loading next track...</p>
        </div>
      </div>
    );
  }

  // If no user, show nothing (redirect will happen in loadUser)
  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Music className="w-16 h-16 text-[#606060] mx-auto mb-4 animate-pulse" />
          <p className="text-sm text-[#808080]">Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ 
      position: 'relative', 
      minHeight: '100vh',
      backgroundImage: 'url(https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/79349b130_ChatGPTImageNov22025at05_17_27PM.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed'
    }}>
      <div className="min-h-screen px-4 py-8 pb-32">
        <div className="flex gap-6 w-full max-w-7xl mx-auto">
          <div className="flex-1 w-full max-w-lg mx-auto">
          <div className="neuro-base rounded-[40px] overflow-hidden mb-8">
            {currentTrack.video_url ? (
              <div className="relative" style={{ paddingTop: '100%' }}>
                <video
                  ref={videoRef}
                  src={currentTrack.video_url}
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  playsInline
                  onClick={handlePlayPause}
                  preload="none"
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <button
                      onClick={handlePlayPause}
                      className="neuro-flat rounded-full p-8 smooth-transition hover:scale-110"
                    >
                      <svg className="w-12 h-12 text-[#d0d0d0]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="relative" style={{ paddingTop: '100%' }}>
                <img
                  src={currentTrack.cover_image_url}
                  alt={currentTrack.title}
                  width="500"
                  height="500"
                  className="absolute top-0 left-0 w-full h-full object-cover"
                  onClick={handlePlayPause}
                  fetchpriority="high"
                  decoding="async"
                />
                {!isPlaying && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-sm">
                    <button
                      onClick={handlePlayPause}
                      className="neuro-flat rounded-full p-8 smooth-transition hover:scale-110"
                    >
                      <svg className="w-12 h-12 text-[#d0d0d0]" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </button>
                  </div>
                )}
                <audio ref={audioRef} src={currentTrack.audio_url} preload="none" />
              </div>
            )}

            <div className="p-6">
              <h2 className="text-2xl font-light mb-2 text-[#d0d0d0] tracking-wide">
                {currentTrack.title}
              </h2>
              <Link
                to={createPageUrl("PublicProfile") + `?userId=${currentTrack.artist_id}`}
                className="text-sm text-[#808080] hover:text-[#a0a0a0] smooth-transition inline-block mb-4"
              >
                {currentTrack.artist_name}
              </Link>

              {currentTrack.genres?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-3">
                  {currentTrack.genres.map(genre => (
                    <span
                      key={genre}
                      className="text-xs px-3 py-1 rounded-full bg-[#1a1a1a] text-[#909090]"
                    >
                      {genre}
                    </span>
                  ))}
                </div>
              )}

              {currentTrack.motifs?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {currentTrack.motifs.map(motif => (
                    <span
                      key={motif}
                      className="text-xs px-3 py-1 rounded-full border border-[#2a2a2a] text-[#808080]"
                    >
                      {motif}
                    </span>
                  ))}
                </div>
              )}

              {/* Listen Progress Indicator */}
              <div className="mb-4 neuro-pressed rounded-2xl p-3">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-[#707070]">Listen Progress</span>
                  <span className={`text-xs font-medium ${
                    listenPercentage >= 75 ? 'text-[#90b090]' : 'text-[#a0a0a0]'
                  }`}>
                    {Math.round(listenPercentage)}%
                  </span>
                </div>
                <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div 
                    className={`h-full transition-all ${
                      listenPercentage >= 75 ? 'bg-gradient-to-r from-[#506050] to-[#90b090]' : 'bg-gradient-to-r from-[#404040] to-[#707070]'
                    }`}
                    style={{ width: `${Math.min(listenPercentage, 100)}%` }}
                  />
                </div>
                {listenPercentage < 75 && (
                  <p className="text-xs text-[#606060] mt-2 text-center">
                    Listen to 75% to unlock feedback
                  </p>
                )}
              </div>

              {/* Progress Bar - Non-Interactive */}
              <div className="mb-4">
                <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden mb-2">
                  <div 
                    className="h-full bg-gradient-to-r from-[#505050] to-[#808080] transition-all"
                    style={{ width: `${(currentTime / (duration || 1)) * 100}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-[#707070]">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={handlePlayPause}
                  className="neuro-base active:neuro-pressed rounded-full p-4 smooth-transition"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 text-[#d0d0d0]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 text-[#d0d0d0]" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>

                <div className="flex items-center gap-3">
                  <button
                    onClick={toggleMute}
                    onMouseEnter={() => setShowVolumeSlider(true)}
                    onMouseLeave={() => setShowVolumeSlider(false)}
                    className="neuro-base active:neuro-pressed rounded-xl p-2 relative"
                  >
                    <svg className="w-5 h-5 text-[#b0b0b0]" fill="currentColor" viewBox="0 0 24 24">
                      {volume === 0 ? (
                        <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                      ) : volume < 50 ? (
                        <path d="M7 9v6h4l5 5V4l-5 5H7z" />
                      ) : (
                        <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02z" />
                      )}
                    </svg>

                    {showVolumeSlider && (
                      <div
                        className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 neuro-base rounded-2xl p-3"
                        onMouseEnter={() => setShowVolumeSlider(true)}
                        onMouseLeave={() => setShowVolumeSlider(false)}
                      >
                        <div style={{ height: '100px', display: 'flex', alignItems: 'center' }}>
                          <Slider
                            value={[volume]}
                            max={100}
                            step={1}
                            onValueChange={(val) => setVolume(val[0])}
                            orientation="vertical"
                            className="h-full"
                          />
                        </div>
                      </div>
                    )}
                  </button>
                </div>
              </div>

              {currentTrack.streaming_links && Object.values(currentTrack.streaming_links).some(link => link) && (
                <div className="border-t border-[#1a1a1a] pt-4">
                  <p className="text-xs text-[#707070] mb-2">Stream on:</p>
                  <div className="flex flex-wrap gap-2">
                    {currentTrack.streaming_links.spotify && (
                      <a
                        href={currentTrack.streaming_links.spotify}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neuro-flat rounded-xl px-3 py-2 text-xs text-[#a0a0a0] smooth-transition hover:scale-105"
                      >
                        Spotify
                      </a>
                    )}
                    {currentTrack.streaming_links.apple_music && (
                      <a
                        href={currentTrack.streaming_links.apple_music}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neuro-flat rounded-xl px-3 py-2 text-xs text-[#a0a0a0] smooth-transition hover:scale-105"
                      >
                        Apple Music
                      </a>
                    )}
                    {currentTrack.streaming_links.soundcloud && (
                      <a
                        href={currentTrack.streaming_links.soundcloud}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neuro-flat rounded-xl px-3 py-2 text-xs text-[#a0a0a0] smooth-transition hover:scale-105"
                      >
                        SoundCloud
                      </a>
                    )}
                    {currentTrack.streaming_links.youtube && (
                      <a
                        href={currentTrack.streaming_links.youtube}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neuro-flat rounded-xl px-3 py-2 text-xs text-[#a0a0a0] smooth-transition hover:scale-105"
                      >
                        YouTube
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-8">
            <button
              onClick={() => skipTrackMutation.mutate(currentTrack.id)}
              disabled={skipTrackMutation.isPending}
              className="neuro-base active:neuro-pressed rounded-3xl py-6 flex flex-col items-center gap-3 smooth-transition hover:scale-[1.02]"
            >
              <XCircle className="w-8 h-8 text-[#808080]" />
              <span className="text-sm text-[#a0a0a0]">Skip</span>
            </button>

            <button
              onClick={() => handleVote(currentTrack)}
              disabled={!currentUser || !canGiveFeedback || currentUser.monthly_votes_remaining === 0 || currentTrack.artist_id === currentUser.id}
              className={`rounded-3xl py-6 flex flex-col items-center gap-3 smooth-transition ${
                currentUser && canGiveFeedback && currentUser.monthly_votes_remaining > 0 && currentTrack.artist_id !== currentUser.id
                  ? 'neuro-base active:neuro-pressed hover:scale-[1.02] cursor-pointer'
                  : 'neuro-pressed opacity-40 cursor-not-allowed'
              }`}
            >
              <ThumbsUp className={`w-8 h-8 ${
                currentUser && canGiveFeedback && currentUser.monthly_votes_remaining > 0 && currentTrack.artist_id !== currentUser.id
                  ? 'text-[#b0b0b0]' : 'text-[#606060]'
              }`} />
              <span className={`text-sm ${
                currentUser && canGiveFeedback && currentUser.monthly_votes_remaining > 0 && currentTrack.artist_id !== currentUser.id
                  ? 'text-[#c0c0c0]' : 'text-[#606060]'
              }`}>
                Vote
              </span>
            </button>

            <button
              onClick={navigateToFeedback}
              disabled={!canGiveFeedback}
              className={`rounded-3xl py-6 flex flex-col items-center gap-3 smooth-transition ${
                canGiveFeedback
                  ? 'neuro-base active:neuro-pressed hover:scale-[1.02] cursor-pointer'
                  : 'neuro-pressed opacity-40 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className={`w-8 h-8 ${canGiveFeedback ? 'text-[#b0b0b0]' : 'text-[#606060]'}`} />
              <span className={`text-sm ${canGiveFeedback ? 'text-[#c0c0c0]' : 'text-[#606060]'}`}>
                Give Feedback
              </span>
            </button>
          </div>

          <CommentSection trackId={currentTrack.id} />
          </div>
        </div>
      </div>

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
                  {currentUser?.monthly_votes_remaining || 0}
                </span>
              </div>
            </div>

            {currentUser && (currentUser.monthly_votes_remaining || 0) > 0 ? (
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
                    <p className="text-xs text-[#707070] mb-2 text-center">Use slider (1-10) or type any number up to {currentUser.monthly_votes_remaining || 0}</p>
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

      {/* Previous Track Widget - Responsive positioning */}
      {previousTrack && (
        <div className="fixed bottom-24 md:bottom-28 left-4 z-50">
          <button
            onClick={() => navigate(createPageUrl("TrackDetails") + `?trackId=${previousTrack.id}`)}
            className="neuro-base active:neuro-pressed rounded-2xl p-3 flex items-center gap-3 smooth-transition hover:scale-105 shadow-xl max-w-[200px] md:max-w-[280px]"
          >
            <img
              src={previousTrack.cover_image_url}
              alt={previousTrack.title}
              width="56"
              height="56"
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover neuro-pressed flex-shrink-0"
              loading="lazy"
            />
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs text-[#707070] mb-1">Previous Track</p>
              <p className="text-xs md:text-sm font-medium text-[#c0c0c0] truncate">{previousTrack.title}</p>
              <p className="text-[10px] md:text-xs text-[#808080] truncate">{previousTrack.artist_name}</p>
            </div>
          </button>
        </div>
      )}

      {/* Next Track Preview Widget - Responsive positioning - Now clickable */}
      {nextTrack && nextTrack.id !== currentTrack.id && (
        <div className="fixed bottom-24 md:bottom-28 right-4 z-50">
          <button
            onClick={handleNextTrackClick}
            className="neuro-base active:neuro-pressed rounded-2xl p-3 flex items-center gap-3 shadow-xl max-w-[200px] md:max-w-[280px] smooth-transition hover:scale-105 cursor-pointer"
          >
            <img
              src={nextTrack.cover_image_url}
              alt={nextTrack.title}
              width="56"
              height="56"
              className="w-12 h-12 md:w-14 md:h-14 rounded-xl object-cover neuro-pressed flex-shrink-0"
              loading="lazy"
            />
            <div className="text-left min-w-0 flex-1">
              <p className="text-xs text-[#707070] mb-1">Up Next</p>
              <p className="text-xs md:text-sm font-medium text-[#c0c0c0] truncate">{nextTrack.title}</p>
              <p className="text-[10px] md:text-xs text-[#808080] truncate">{nextTrack.artist_name}</p>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}
