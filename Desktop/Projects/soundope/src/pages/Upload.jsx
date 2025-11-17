
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Upload as UploadIcon, Music, X, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Upload() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [hasWatchedAd, setHasWatchedAd] = useState(false);
  const [showAdModal, setShowAdModal] = useState(false);

  // Form fields
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [genre, setGenre] = useState("");
  const [customGenre, setCustomGenre] = useState("");
  const [motif, setMotif] = useState("");
  const [customMotif, setCustomMotif] = useState("");
  const [description, setDescription] = useState("");
  const [spotifyLink, setSpotifyLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [soundcloudLink, setSoundcloudLink] = useState("");
  const [appleMusicLink, setAppleMusicLink] = useState("");

  // AI Analysis - DISABLED FOR NOW (keeping logic for future use)
  const [enableAI, setEnableAI] = useState(false);
  // const [aiAnalysisEnabled, setAiAnalysisEnabled] = useState(false);

  // Feedback Preferences - DISABLED FOR NOW (keeping logic for future use)
  // const [feedbackType, setFeedbackType] = useState("standard");

  const commonGenres = [
    "Hip Hop", "R&B", "Pop", "Electronic", "Rock", "Jazz", "Soul", 
    "Alternative", "Indie", "Lo-fi", "Trap", "House", "Ambient",
    "Punk", "Metal", "Techno", "Dubstep", "Country"
  ];

  const commonMotifs = [
    "Love & Romance", "Heartbreak", "Party", "Motivation", 
    "Nostalgia", "Social Commentary", "Celebration", "Struggle",
    "Growth", "Freedom", "Nature", "Urban Life"
  ];

  useEffect(() => {
    // Add SEO meta tags
    document.title = "Upload Music & Submit for Review | Share Your Music - Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Upload your music and submit for review. Share your tracks with real listeners, get quality feedback, and promote your music for free. Support for Spotify, SoundCloud, Apple Music, and YouTube." },
      { type: 'name', key: 'keywords', content: "upload music online, submit music for feedback, music submission platform, promote new music, upload demo, submit track for review, soundope" },
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
    
    // Check if user has watched ad in this session
    const watchedAd = sessionStorage.getItem('uploadAdWatched');
    if (watchedAd === 'true') {
      setHasWatchedAd(true);
    } else {
      // Show ad modal when page loads
      setShowAdModal(true);
    }
  }, []);

  // Load Adsterra Banner Ad
  useEffect(() => {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-upload-banner-763b8c85de11ad1c95d4275c8cb17af7');
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

  const handleAdWatched = () => {
    setHasWatchedAd(true);
    setShowAdModal(false);
    sessionStorage.setItem('uploadAdWatched', 'true');
    
    // Trigger popunder ad
    try {
      if (typeof window !== 'undefined' && window.open) {
        const popunder = window.open('about:blank', '_blank', 'width=1,height=1');
        if (popunder) {
          popunder.blur();
          window.focus();
          setTimeout(() => {
            if (popunder && !popunder.closed) {
              popunder.close();
            }
          }, 100);
        }
      }
    } catch (e) {
      // Popunder blocked, continue anyway
    }
  };

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
      navigate(createPageUrl("Home"));
    }
  };

  const handleAudioSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setAudioFile(file);
      const url = URL.createObjectURL(file);
      setAudioPreview(url);
    }
  };

  const handleCoverSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setCoverImage(file);
      const url = URL.createObjectURL(file);
      setCoverPreview(url);
    }
  };

  const handleUpload = async () => {
    // Check if ad has been watched
    if (!hasWatchedAd) {
      setShowAdModal(true);
      setUploadError("Please watch the ad to continue uploading");
      return;
    }

    // Validation
    if (!title.trim()) {
      setUploadError("Track title is required");
      return;
    }

    if (!audioFile) {
      setUploadError("Audio file is required");
      return;
    }

    if (!coverImage) {
      setUploadError("Cover image is required");
      return;
    }

    const finalGenre = genre === "other" ? customGenre : genre;
    if (!finalGenre) {
      setUploadError("Genre is required");
      return;
    }

    const finalMotif = motif === "other" ? customMotif : motif;
    if (!finalMotif) {
      setUploadError("Motif is required");
      return;
    }

    if (!spotifyLink && !youtubeLink && !soundcloudLink && !appleMusicLink) {
      setUploadError("At least one streaming platform link is required");
      return;
    }

    // FUTURE CREDIT DEDUCTION LOGIC (commented out for now)
    /*
    // Check credits based on feedback type
    const creditCost = feedbackType === "premium" ? 50 : 10;
    const totalCredits = (currentUser.standard_credits || 0) + (currentUser.premium_credits || 0);
    
    if (totalCredits < creditCost) {
      setUploadError(`Not enough credits. You need ${creditCost} credits to upload.`);
      return;
    }
    */

    setIsUploading(true);
    setUploadError("");

    try {
      // Upload files
      const audioUploadResult = await api.integrations.Core.UploadFile({ file: audioFile });
      const coverUploadResult = await api.integrations.Core.UploadFile({ file: coverImage });

      // Create track
      const trackData = {
        title: title.trim(),
        artist_name: currentUser.artist_name || currentUser.full_name,
        artist_id: currentUser.id,
        audio_url: audioUploadResult.file_url,
        cover_image_url: coverUploadResult.file_url,
        genres: [finalGenre],
        motifs: [finalMotif],
        description: description.trim(),
        spotify_link: spotifyLink.trim() || null,
        youtube_link: youtubeLink.trim() || null,
        soundcloud_link: soundcloudLink.trim() || null,
        apple_music_link: appleMusicLink.trim() || null,
        status: "active",
        total_reviews: 0,
        avg_rating: 0,
        is_active: true,
        // FUTURE: Add feedback_type field when re-enabling
        // feedback_type: feedbackType,
      };

      const createdTrack = await api.entities.Track.create(trackData);

      // FUTURE AI ANALYSIS LOGIC (commented out for now - uncomment when Cyanite is ready)
      /*
      if (enableAI) {
        try {
          await api.functions.invoke('cyaniteAnalyze', {
            trackId: createdTrack.id,
            audioUrl: audioUploadResult.file_url
          });
        } catch (aiError) {
          console.error("AI analysis failed:", aiError);
          // Don't block upload if AI fails
        }
      }
      */

      // FUTURE CREDIT DEDUCTION (commented out for now)
      /*
      // Deduct credits (prefer premium first, then standard)
      let remaining = creditCost;
      let premiumUsed = 0;
      let standardUsed = 0;

      if (currentUser.premium_credits >= remaining) {
        premiumUsed = remaining;
        remaining = 0;
      } else {
        premiumUsed = currentUser.premium_credits || 0;
        remaining -= premiumUsed;
      }
      
      if (remaining > 0) {
        standardUsed = remaining;
      }

      await api.auth.updateMe({
        premium_credits: (currentUser.premium_credits || 0) - premiumUsed,
        standard_credits: (currentUser.standard_credits || 0) - standardUsed,
        total_tracks: (currentUser.total_tracks || 0) + 1
      });
      */

      // For now, just update track count
      await api.auth.updateMe({
        total_tracks: (currentUser.total_tracks || 0) + 1
      });

      // Create archive log
      await api.entities.ArchiveLog.create({
        user_id: currentUser.id,
        action_type: "track_upload",
        target_id: createdTrack.id,
        target_type: "track",
        metadata: {
          track_title: title.trim(),
          genres: [finalGenre],
          motifs: [finalMotif]
        }
      });

      // Reset ad watch status for next upload
      sessionStorage.removeItem('uploadAdWatched');
      setHasWatchedAd(false);

      // Navigate to success page
      navigate(createPageUrl("MyTracks"));

    } catch (error) {
      console.error("Upload error:", error);
      setUploadError(error.message || "Upload failed. Please try again.");
      setIsUploading(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Music className="w-12 h-12 text-[#707070] animate-pulse" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
      {/* Ad Modal - Must watch before uploading */}
      {showAdModal && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <div className="neuro-base rounded-3xl p-8 max-w-2xl w-full">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light text-[#d0d0d0] mb-2">Watch Ad to Upload</h2>
              <p className="text-sm text-[#808080]">
                Please watch the ad below to continue with your upload. This helps us keep Soundope free for all artists.
              </p>
            </div>
            
            {/* Ad Container */}
            <div className="neuro-pressed rounded-2xl p-6 mb-6 min-h-[400px] flex items-center justify-center">
              <div className="text-center">
                <p className="text-sm text-[#707070] mb-4">Ad will load here</p>
                {/* Ad placeholder - you can replace this with actual ad code */}
                <div id="upload-ad-container" className="w-full h-[400px] bg-[#0a0a0a] rounded-xl flex items-center justify-center">
                  <p className="text-xs text-[#505050]">Ad Space</p>
                </div>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                onClick={() => {
                  setShowAdModal(false);
                  navigate(createPageUrl("Home"));
                }}
                className="flex-1 neuro-flat rounded-2xl py-3"
              >
                <span className="text-[#808080]">Cancel</span>
              </Button>
              <Button
                onClick={handleAdWatched}
                className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
              >
                <span className="text-[#a0a0a0]">I've Watched the Ad</span>
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Upload Track</h1>
          <p className="text-sm text-[#808080]">Share your music with the community</p>
          {!hasWatchedAd && (
            <p className="text-xs text-[#b09090] mt-2">⚠️ Please watch the ad to enable upload</p>
          )}
        </div>

        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div id="container-upload-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {uploadError && (
          <div className="neuro-pressed rounded-2xl p-4 mb-6 bg-[#1a0f0f]">
            <p className="text-sm text-[#d09090] text-center">{uploadError}</p>
          </div>
        )}

        {/* Audio File Upload */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Audio File</h3>
          
          {!audioPreview ? (
            <label className="w-full neuro-flat rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer smooth-transition hover:scale-[1.01] active:neuro-pressed">
              <UploadIcon className="w-12 h-12 text-[#707070]" />
              <p className="text-sm text-[#a0a0a0]">Click to upload audio</p>
              <p className="text-xs text-[#606060]">MP3, WAV, or M4A</p>
              <input
                type="file"
                accept="audio/*,.mp3,.wav,.m4a"
                onChange={handleAudioSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          ) : (
            <div className="neuro-pressed rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#d0d0d0] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#90d090]" />
                  {audioFile.name}
                </p>
                <button
                  onClick={() => {
                    setAudioFile(null);
                    setAudioPreview(null);
                  }}
                  disabled={isUploading}
                  className="neuro-flat rounded-lg p-2"
                >
                  <X className="w-4 h-4 text-[#808080]" />
                </button>
              </div>
              <audio src={audioPreview} controls className="w-full" />
            </div>
          )}
        </div>

        {/* Cover Image Upload */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Cover Image</h3>
          
          {!coverPreview ? (
            <label className="w-full neuro-flat rounded-2xl p-8 flex flex-col items-center gap-3 cursor-pointer smooth-transition hover:scale-[1.01] active:neuro-pressed">
              <UploadIcon className="w-12 h-12 text-[#707070]" />
              <p className="text-sm text-[#a0a0a0]">Click to upload cover</p>
              <p className="text-xs text-[#606060]">JPG or PNG</p>
              <input
                type="file"
                accept="image/*,.jpg,.jpeg,.png"
                onChange={handleCoverSelect}
                disabled={isUploading}
                className="hidden"
              />
            </label>
          ) : (
            <div className="neuro-pressed rounded-2xl p-4">
              <div className="flex items-center justify-between mb-3">
                <p className="text-sm text-[#d0d0d0] flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#90d090]" />
                  Cover uploaded
                </p>
                <button
                  onClick={() => {
                    setCoverImage(null);
                    setCoverPreview(null);
                  }}
                  disabled={isUploading}
                  className="neuro-flat rounded-lg p-2"
                >
                  <X className="w-4 h-4 text-[#808080]" />
                </button>
              </div>
              <img
                src={coverPreview}
                alt="Cover preview"
                className="w-full rounded-xl neuro-pressed"
              />
            </div>
          )}
        </div>

        {/* Track Details */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Track Details</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#707070] mb-2 block">Track Title</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter track title"
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block">Genre</label>
              <Select value={genre} onValueChange={setGenre} disabled={isUploading}>
                <SelectTrigger className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl">
                  <SelectValue placeholder="Select genre" />
                </SelectTrigger>
                <SelectContent>
                  {commonGenres.map((g) => (
                    <SelectItem key={g} value={g}>{g}</SelectItem>
                  ))}
                  <SelectItem value="other">Other (Specify)</SelectItem>
                </SelectContent>
              </Select>
              
              {genre === "other" && (
                <Input
                  value={customGenre}
                  onChange={(e) => setCustomGenre(e.target.value)}
                  placeholder="Enter custom genre"
                  className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl mt-2"
                  disabled={isUploading}
                />
              )}
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block">Motif/Theme</label>
              <Select value={motif} onValueChange={setMotif} disabled={isUploading}>
                <SelectTrigger className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl">
                  <SelectValue placeholder="Select motif" />
                </SelectTrigger>
                <SelectContent>
                  {commonMotifs.map((m) => (
                    <SelectItem key={m} value={m}>{m}</SelectItem>
                  ))}
                  <SelectItem value="other">Other (Specify)</SelectItem>
                </SelectContent>
              </Select>
              
              {motif === "other" && (
                <Input
                  value={customMotif}
                  onChange={(e) => setCustomMotif(e.target.value)}
                  placeholder="Enter custom motif"
                  className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl mt-2"
                  disabled={isUploading}
                />
              )}
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block">Description (Optional)</label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Tell us about your track..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[100px]"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* Streaming Platform Links */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-2">Streaming Platform Links</h3>
          <p className="text-xs text-[#606060] mb-4">At least one link required</p>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#707070] mb-2 block flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/a0741ee01_IMG_2529.jpeg"
                  alt="Spotify"
                  width="20"
                  height="20"
                  className="w-5 h-5 object-contain"
                  loading="lazy"
                />
                Spotify
              </label>
              <Input
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/79d752129_IMG_2531.jpeg"
                  alt="YouTube"
                  width="20"
                  height="20"
                  className="w-5 h-5 object-contain"
                  loading="lazy"
                />
                YouTube
              </label>
              <Input
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/73bc81025_IMG_2530.jpeg"
                  alt="SoundCloud"
                  width="20"
                  height="20"
                  className="w-5 h-5 object-contain"
                  loading="lazy"
                />
                SoundCloud
              </label>
              <Input
                value={soundcloudLink}
                onChange={(e) => setSoundcloudLink(e.target.value)}
                placeholder="https://soundcloud.com/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
                disabled={isUploading}
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block flex items-center gap-2">
                <img 
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/446463b1a_IMG_2532.jpeg"
                  alt="Apple Music"
                  width="20"
                  height="20"
                  className="w-5 h-5 object-contain"
                  loading="lazy"
                />
                Apple Music
              </label>
              <Input
                value={appleMusicLink}
                onChange={(e) => setAppleMusicLink(e.target.value)}
                placeholder="https://music.apple.com/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
                disabled={isUploading}
              />
            </div>
          </div>
        </div>

        {/* FUTURE: AI Analysis Toggle (commented out for now)
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm text-[#808080] mb-1">AI Music Analysis</h3>
              <p className="text-xs text-[#606060]">Get insights on tempo, mood, key, and more</p>
            </div>
            <button
              onClick={() => setEnableAI(!enableAI)}
              disabled={isUploading}
              className={`neuro-base rounded-2xl px-4 py-2 ${enableAI ? 'neuro-pressed' : ''}`}
            >
              <span className={`text-xs ${enableAI ? 'text-[#a0a0a0]' : 'text-[#707070]'}`}>
                {enableAI ? 'Enabled' : 'Disabled'}
              </span>
            </button>
          </div>
        </div>
        */}

        {/* FUTURE: Feedback Preferences (commented out for now)
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Feedback Preferences</h3>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setFeedbackType('standard')}
              disabled={isUploading}
              className={`neuro-base rounded-2xl p-4 ${feedbackType === 'standard' ? 'neuro-pressed' : ''}`}
            >
              <p className="text-sm text-[#a0a0a0] mb-1">Standard</p>
              <p className="text-xs text-[#707070]">10 credits</p>
            </button>
            <button
              onClick={() => setFeedbackType('premium')}
              disabled={isUploading}
              className={`neuro-base rounded-2xl p-4 ${feedbackType === 'premium' ? 'neuro-pressed' : ''}`}
            >
              <p className="text-sm text-[#b0a090] mb-1">Premium</p>
              <p className="text-xs text-[#707070]">50 credits</p>
            </button>
          </div>
        </div>
        */}

        {/* Ad 303: Before upload button */}
        <div className="flex justify-center mb-6">
          <div id="ezoic-pub-ad-placeholder-303"></div>
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={isUploading || !hasWatchedAd || !title.trim() || !audioFile}
          className={`w-full neuro-base active:neuro-pressed rounded-3xl py-6 text-base font-medium smooth-transition hover:scale-[1.01] ${
            !hasWatchedAd ? 'opacity-50 cursor-not-allowed' : 'text-[#d0d0d0]'
          }`}
        >
          {isUploading ? (
            <span className="flex items-center gap-2">
              <Music className="w-5 h-5 animate-pulse" />
              Uploading...
            </span>
          ) : !hasWatchedAd ? (
            "Watch Ad to Upload"
          ) : (
            "Upload Track"
          )}
        </Button>
      </div>

      {/* Initialize Ezoic Ads for Upload page */}
      <script dangerouslySetInnerHTML={{
        __html: `
          if (typeof ezstandalone !== 'undefined') {
            ezstandalone.cmd.push(function () {
              ezstandalone.showAds(303);
            });
          }
        `
      }} />

      {/* Load ad in modal when shown */}
      {showAdModal && (
        <script dangerouslySetInnerHTML={{
          __html: `
            (function() {
              setTimeout(function() {
                const adContainer = document.getElementById('upload-ad-container');
                if (adContainer && typeof ezstandalone !== 'undefined') {
                  ezstandalone.cmd.push(function () {
                    const adDiv = document.createElement('div');
                    adDiv.id = 'ezoic-pub-ad-placeholder-304';
                    adContainer.innerHTML = '';
                    adContainer.appendChild(adDiv);
                    ezstandalone.showAds(304);
                  });
                }
              }, 100);
            })();
          `
        }} />
      )}

    </div>
  );
}
