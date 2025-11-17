
import React, { useState, useEffect, useRef } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Play, Pause, ArrowLeft, Music, Brain, Edit, X, Plus, Lock, Unlock, Flag, UserCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import CommentSection from "../components/CommentSection";

export default function TrackDetails() {
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef(null);
  const queryClient = useQueryClient();
  
  const [currentUser, setCurrentUser] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  
  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editGenres, setEditGenres] = useState([]);
  const [editMotifs, setEditMotifs] = useState([]);
  const [newGenre, setNewGenre] = useState("");
  const [newMotif, setNewMotif] = useState("");
  const [editSpotifyLink, setEditSpotifyLink] = useState("");
  const [editYoutubeLink, setEditYoutubeLink] = useState("");
  const [editSoundcloudLink, setEditSoundcloudLink] = useState("");
  const [editAppleMusicLink, setEditAppleMusicLink] = useState("");

  const [showCopyrightModal, setShowCopyrightModal] = useState(false);
  const [copyrightDescription, setCopyrightDescription] = useState("");

  // Claim track state
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [claimReason, setClaimReason] = useState("");
  const [claimProofUrl, setClaimProofUrl] = useState("");

  // Delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Add unlock modal state
  const [showUnlockModal, setIsUnlocking] = useState(false);
  // Renaming to avoid conflict with state var 'isUnlocking'
  const [isUnlockingProcess, setIsUnlockingProcess] = useState(false);
  
  const params = new URLSearchParams(location.search);
  const trackId = params.get('trackId');

  const commonGenres = [
    "Hip Hop", "R&B", "Pop", "Electronic", "Rock", "Jazz", "Soul", 
    "Alternative", "Indie", "Lo-fi", "Trap", "House", "Ambient",
    "Punk", "Metal", "Techno", "Dubstep"
  ];

  const commonMotifs = [
    "angry", "happy", "chill", "moody", "sad", "energetic", "depressed", "raging", 
    "uplifting", "anxious", "haunted", "hopeful", "vengeful", "melancholic", "ecstatic", 
    "numb", "paranoid", "defiant", "cathartic", "hypnotic", "explosive", "glitchy", 
    "tense", "bouncy", "chaotic", "dark", "gritty", "raw", "dreamy", "violent", 
    "minimal", "lofi", "distorted"
  ];

  useEffect(() => {
    loadUser();
  }, []);

  // Load Adsterra Banner Ad
  useEffect(() => {
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-trackdetails-banner-763b8c85de11ad1c95d4275c8cb17af7');
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
    const user = await api.auth.me();
    setCurrentUser(user);
  };

  const { data: track, isLoading: trackLoading } = useQuery({
    queryKey: ['track-details', trackId],
    queryFn: async () => {
      const tracks = await api.entities.Track.filter({ id: trackId });
      return tracks[0];
    },
    enabled: !!trackId,
  });

  // Add SEO when track loads
  useEffect(() => {
    if (track) {
      // Dynamic SEO based on track
      document.title = `${track.title} by ${track.artist_name} - Listen & Review | Soundope`;
      
      const metaTagsInfo = [
        { type: 'name', key: 'description', content: `Listen to ${track.title} by ${track.artist_name}. ${track.description || `Discover independent music in ${track.genres?.join(', ')}. Leave feedback, vote, and support emerging artists.`}` },
        { type: 'name', key: 'keywords', content: `${track.title}, ${track.artist_name}, ${track.genres?.join(', ')}, independent music, listen online, music feedback, new music` },
        
        // Open Graph
        { type: 'property', key: 'og:title', content: `${track.title} by ${track.artist_name} | Soundope` },
        { type: 'property', key: 'og:description', content: `Listen to ${track.title} by ${track.artist_name}. ${track.description || 'Discover and support independent music.'}` },
        { type: 'property', key: 'og:image', content: track.cover_image_url },
        { type: 'property', key: 'og:type', content: 'music.song' },
        { type: 'property', key: 'og:url', content: window.location.href },
        
        // Music-specific Open Graph
        { type: 'property', key: 'music:musician', content: track.artist_name },
        { type: 'property', key: 'music:duration', content: track.duration_seconds?.toString() || '0' },
        
        // Twitter
        { type: 'name', key: 'twitter:card', content: 'summary_large_image' },
        { type: 'name', key: 'twitter:title', content: `${track.title} by ${track.artist_name}` },
        { type: 'name', key: 'twitter:description', content: `Listen to ${track.title}. Discover independent music on Soundope.` },
        { type: 'name', key: 'twitter:image', content: track.cover_image_url },
      ];

      const createdMetaTags = []; // Keep track of tags created or modified by this effect

      metaTagsInfo.forEach(({ type, key, content }) => {
        const attribute = type === 'name' ? 'name' : 'property';
        let tag = document.querySelector(`meta[${attribute}="${key}"]`);
        if (tag) {
          tag.setAttribute('content', content);
        } else {
          tag = document.createElement('meta');
          tag.setAttribute(attribute, key);
          tag.setAttribute('content', content);
          document.head.appendChild(tag);
          createdMetaTags.push(tag);
        }
      });

      // Add JSON-LD Schema for Music Recording
      const schemaScript = document.createElement('script');
      schemaScript.type = 'application/ld+json';
      schemaScript.text = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "MusicRecording",
        "name": track.title,
        "byArtist": {
          "@type": "MusicGroup",
          "name": track.artist_name
        },
        "image": track.cover_image_url,
        "url": window.location.href,
        "genre": track.genres?.join(', ') || '',
        "datePublished": track.created_date ? new Date(track.created_date).toISOString() : '',
        "description": track.description || `${track.title} by ${track.artist_name}`,
        "interactionStatistic": [
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/ListenAction",
            "userInteractionCount": track.total_listens || 0
          },
          {
            "@type": "InteractionCounter",
            "interactionType": "https://schema.org/LikeAction",
            "userInteractionCount": track.total_votes || 0
          }
        ]
      });
      
      // Remove old schema if exists
      let oldSchema = document.querySelector('script[type="application/ld+json"]');
      if (oldSchema) {
        oldSchema.remove();
      }
      document.head.appendChild(schemaScript);

      return () => {
        document.title = "Soundope"; // Reset to default title on unmount or track change

        createdMetaTags.forEach(tag => tag.parentNode?.removeChild(tag));

        if (schemaScript.parentNode) {
          schemaScript.parentNode.removeChild(schemaScript);
        }
      };
    }
  }, [track]);

  // Check if user has already unlocked this track
  const { data: unlocked = false } = useQuery({
    queryKey: ['track-unlocked', trackId, currentUser?.id],
    queryFn: async () => {
      if (!currentUser || !trackId) return false;
      const unlocks = await api.entities.SupporterUnlock.filter({
        track_id: trackId,
        supporter_id: currentUser.id
      });
      return unlocks.length > 0;
    },
    enabled: !!trackId && !!currentUser,
  });

  // Check if track has already been claimed
  const { data: trackClaimed = false } = useQuery({
    queryKey: ['track-claimed', trackId],
    queryFn: async () => {
      if (!trackId) return false;
      const claims = await api.entities.TrackClaim.filter({
        track_id: trackId,
        status: { $in: ['pending', 'approved'] }
      });
      return claims.length > 0;
    },
    enabled: !!trackId,
  });

  const reportCopyrightMutation = useMutation({
    mutationFn: async () => {
      // Create report in database
      const user = await api.auth.me();
      await api.entities.Report.create({
        reporter_id: user.id,
        reporter_email: user.email,
        report_type: "Copyright Violation",
        description: copyrightDescription,
        target_type: "track",
        target_id: track.id,
        status: "pending"
      });

      // Format time in Pacific timezone
      const pacificTime = new Date().toLocaleString('en-US', {
        timeZone: 'America/Los_Angeles',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      });

      // Send email notifications
      const emailContent = `
New Copyright Report

Reported by: ${user.email}
Track: ${track.title}
Artist: ${track.artist_name}
Track ID: ${track.id}

Description:
${copyrightDescription}

---
Submitted at: ${pacificTime} PST
View in Moderation Dashboard: ${window.location.origin}/moderation
      `;

      await Promise.all([
        api.integrations.Core.SendEmail({
          to: "jknoedler@soundope.com",
          subject: `[COPYRIGHT REPORT] ${track.title} - Soundope`,
          body: emailContent
        }),
        api.integrations.Core.SendEmail({
          to: "k.debey@soundope.com",
          subject: `[COPYRIGHT REPORT] ${track.title} - Soundope`,
          body: emailContent
        })
      ]);
    },
    onSuccess: () => {
      setShowCopyrightModal(false);
      setCopyrightDescription("");
      alert("Copyright report submitted. Thank you for helping protect creator rights.");
    },
    onError: () => {
      alert("Failed to submit report. Please try again.");
    }
  });

  const claimTrackMutation = useMutation({
    mutationFn: async () => {
      const user = await api.auth.me();
      
      // Create claim in database FIRST
      await api.entities.TrackClaim.create({
        track_id: track.id,
        track_title: track.title,
        original_artist_id: track.artist_id,
        original_artist_name: track.artist_name,
        claimer_id: user.id,
        claimer_name: user.artist_name || user.full_name,
        claimer_email: user.email,
        reason: claimReason,
        proof_url: claimProofUrl || null,
        status: "pending"
      });

      // Try to send email notifications (but don't fail if this fails)
      try {
        // Format time in Pacific timezone
        const pacificTime = new Date().toLocaleString('en-US', {
          timeZone: 'America/Los_Angeles',
          month: 'short',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          hour12: true
        });

        const emailContent = `
New Track Ownership Claim

Track: ${track.title}
Current Artist: ${track.artist_name}

Claimed by: ${user.artist_name || user.full_name}
Email: ${user.email}

Reason:
${claimReason}

${claimProofUrl ? `Proof URL: ${claimProofUrl}` : 'No proof URL provided'}

---
Submitted at: ${pacificTime} PST
View in Moderation Dashboard: ${window.location.origin}${createPageUrl("Moderation")}
        `;

        await Promise.all([
          api.integrations.Core.SendEmail({
            to: "jknoedler@soundope.com",
            subject: `[TRACK CLAIM] ${track.title} - Soundope`,
            body: emailContent
          }),
          api.integrations.Core.SendEmail({
            to: "k.debey@soundope.com",
            subject: `[TRACK CLAIM] ${track.title} - Soundope`,
            body: emailContent
          })
        ]);
      } catch (emailError) {
        console.error("Failed to send claim email, but claim was created:", emailError);
      }
    },
    onSuccess: () => {
      setShowClaimModal(false);
      setClaimReason("");
      setClaimProofUrl("");
      alert("Claim submitted successfully. Moderators will review your request.");
      queryClient.invalidateQueries(['track-claimed', trackId]); // Invalidate to update claim status
    },
    onError: (error) => {
      console.error("Claim error:", error);
      alert("Failed to submit claim. Please try again.");
    }
  });

  const deleteTrackMutation = useMutation({
    mutationFn: async () => {
      setIsDeleting(true);
      
      // Delete the track
      await api.entities.Track.delete(trackId);
      
      // Update user's total tracks count
      await api.auth.updateMe({
        total_tracks: Math.max(0, (currentUser.total_tracks || 0) - 1)
      });
      
      setIsDeleting(false);
    },
    onSuccess: () => {
      setShowDeleteModal(false);
      // Navigate to MyTracks page
      navigate(createPageUrl("MyTracks"));
    },
    onError: (error) => {
      setIsDeleting(false);
      alert("Failed to delete track. Please try again.");
      console.error("Delete error:", error);
    }
  });

  const unlockMutation = useMutation({
    mutationFn: async () => {
      setIsUnlockingProcess(true);
      
      // Check if user has enough credits
      const totalCredits = (currentUser.standard_credits || 0) + (currentUser.premium_credits || 0);
      if (totalCredits < track.unlock_price) {
        throw new Error("Not enough credits. Visit Buy Credits to get more.");
      }

      // Deduct credits (prefer premium first, then standard)
      let remaining = track.unlock_price;
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

      // Create unlock record
      await api.entities.SupporterUnlock.create({
        track_id: track.id,
        supporter_id: currentUser.id,
        artist_id: track.artist_id,
        credits_spent: track.unlock_price,
        content_type: track.exclusive_content_type,
        content_url: track.exclusive_content_url
      });

      // Update user credits
      await api.auth.updateMe({
        premium_credits: (currentUser.premium_credits || 0) - premiumUsed,
        standard_credits: (currentUser.standard_credits || 0) - standardUsed
      });

      // Log the action
      await api.entities.ArchiveLog.create({
        user_id: currentUser.id,
        action_type: "supporter_unlock",
        target_id: track.id,
        target_type: "unlock",
        metadata: {
          track_title: track.title,
          artist_name: track.artist_name,
          content_type: track.exclusive_content_type,
          credits_spent: track.unlock_price
        }
      });

      // Notify artist
      await api.entities.Notification.create({
        recipient_id: track.artist_id,
        type: "unlock",
        title: "Content Unlocked",
        message: `${currentUser.artist_name || currentUser.full_name} unlocked exclusive content for "${track.title}"`,
        sender_id: currentUser.id,
        sender_name: currentUser.artist_name || currentUser.full_name,
        related_id: track.id
      });

      setIsUnlockingProcess(false);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['track-unlocked', trackId, currentUser?.id]);
      queryClient.invalidateQueries(['track-details', trackId]); // Invalidate to get updated currentUser credits.
      setShowUnlockModal(false);
      // Open the exclusive content URL
      if (track.exclusive_content_url) {
        window.open(track.exclusive_content_url, '_blank');
      }
      loadUser(); // Reload user to get updated credit balance
    },
    onError: (error) => {
      setIsUnlockingProcess(false);
      alert(error.message);
    }
  });

  const updateTrackMutation = useMutation({
    mutationFn: async (updates) => {
      await api.entities.Track.update(trackId, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['track-details', trackId]);
      setShowEditModal(false);
    }
  });

  const openEditModal = () => {
    setEditTitle(track.title || "");
    setEditDescription(track.description || "");
    setEditGenres(track.genres || []);
    setEditMotifs(track.motifs || []);
    setEditSpotifyLink(track.spotify_link || "");
    setEditYoutubeLink(track.youtube_link || "");
    setEditSoundcloudLink(track.soundcloud_link || "");
    setEditAppleMusicLink(track.apple_music_link || "");
    setShowEditModal(true);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) {
      alert("Track title is required");
      return;
    }
    if (editGenres.length === 0) {
      alert("At least one genre is required");
      return;
    }
    if (!editSpotifyLink && !editYoutubeLink && !editSoundcloudLink && !editAppleMusicLink) {
      alert("At least one streaming platform link is required");
      return;
    }

    updateTrackMutation.mutate({
      title: editTitle,
      description: editDescription,
      genres: editGenres,
      motifs: editMotifs,
      spotify_link: editSpotifyLink || null,
      youtube_link: editYoutubeLink || null,
      soundcloud_link: editSoundcloudLink || null,
      apple_music_link: editAppleMusicLink || null
    });
  };

  const handleAddGenre = (genre) => {
    if (genre && genre.trim() && !editGenres.includes(genre.trim())) {
      setEditGenres([...editGenres, genre.trim()]);
    }
    setNewGenre("");
  };

  const handleAddMotif = (motif) => {
    if (motif && motif.trim() && !editMotifs.includes(motif.trim())) {
      setEditMotifs([...editMotifs, motif.trim()]);
    }
    setNewMotif("");
  };

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.addEventListener('timeupdate', handleTimeUpdate);
      audioRef.current.addEventListener('loadedmetadata', handleLoadedMetadata);
      
      return () => {
        if (audioRef.current) {
          audioRef.current.removeEventListener('timeupdate', handleTimeUpdate);
          audioRef.current.removeEventListener('loadedmetadata', handleLoadedMetadata);
        }
      };
    }
  }, [track]);

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!trackId) {
    navigate(createPageUrl("MyTracks"));
    return null;
  }

  if (trackLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  if (!track) {
    return (
      <div className="min-h-screen px-4 py-8 flex items-center justify-center">
        <div className="neuro-base rounded-3xl p-8 text-center">
          <p className="text-sm text-[#808080]">Track not found</p>
          <button
            onClick={() => navigate(createPageUrl("MyTracks"))}
            className="mt-4 neuro-flat rounded-2xl px-6 py-3 text-sm text-[#a0a0a0]"
          >
            Back to My Tracks
          </button>
        </div>
      </div>
    );
  }

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
  const isOwner = track.artist_id === currentUser.id;
  const hasExclusiveContent = track.has_exclusive_content && track.exclusive_content_url;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate(-1)}
          className="neuro-flat rounded-xl p-2 mb-6 flex items-center gap-2"
        >
          <ArrowLeft className="w-5 h-5 text-[#808080]" />
          <span className="text-sm text-[#808080]">Back</span>
        </button>

        {/* Delete Confirmation Modal */}
        {showDeleteModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[#d0d0d0]">Delete Track</h2>
                <button
                  onClick={() => setShowDeleteModal(false)}
                  className="neuro-flat rounded-xl p-2"
                  disabled={isDeleting}
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <div className="neuro-pressed rounded-2xl p-4 mb-6">
                <p className="text-sm text-[#a0a0a0] mb-2">
                  Are you sure you want to delete "{track.title}"?
                </p>
                <p className="text-xs text-[#707070]">
                  This action cannot be undone. All feedback, comments, and votes will be permanently removed.
                </p>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowDeleteModal(false)}
                  disabled={isDeleting}
                  className="flex-1 neuro-flat rounded-2xl py-3"
                >
                  <span className="text-[#808080]">Cancel</span>
                </Button>
                <Button
                  onClick={() => deleteTrackMutation.mutate()}
                  disabled={isDeleting}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {isDeleting ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  ) : (
                    <span className="text-[#b09090]">Delete Track</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4 overflow-y-auto">
            <div className="neuro-base rounded-3xl p-6 max-w-2xl w-full my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[#d0d0d0]">Edit Track</h2>
                <button
                  onClick={() => setShowEditModal(false)}
                  className="neuro-flat rounded-xl p-2"
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <div className="space-y-6 max-h-[70vh] overflow-y-auto pr-2">
                {/* Title */}
                <div>
                  <label className="text-sm text-[#808080] mb-2 block">Track Title</label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="text-sm text-[#808080] mb-2 block">Description</label>
                  <Textarea
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl min-h-[100px] resize-none"
                  />
                </div>

                {/* Genres */}
                <div>
                  <label className="text-sm text-[#808080] mb-2 block">Genres</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editGenres.map(genre => (
                      <button
                        key={genre}
                        onClick={() => setEditGenres(editGenres.filter(g => g !== genre))}
                        className="neuro-pressed rounded-full px-4 py-2 text-xs text-[#a0a0a0] flex items-center gap-2"
                      >
                        {genre}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commonGenres.filter(g => !editGenres.includes(g)).map(genre => (
                      <button
                        key={genre}
                        onClick={() => handleAddGenre(genre)}
                        className="neuro-flat rounded-full px-3 py-1 text-xs text-[#707070]"
                      >
                        + {genre}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newGenre}
                      onChange={(e) => setNewGenre(e.target.value)}
                      placeholder="Add custom genre"
                      className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddGenre(newGenre)}
                    />
                    <Button
                      onClick={() => handleAddGenre(newGenre)}
                      disabled={!newGenre.trim()}
                      className="neuro-base active:neuro-pressed rounded-2xl px-4"
                    >
                      <Plus className="w-4 h-4 text-[#808080]" />
                    </Button>
                  </div>
                </div>

                {/* Motifs */}
                <div>
                  <label className="text-sm text-[#808080] mb-2 block">Vibes</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {editMotifs.map(motif => (
                      <button
                        key={motif}
                        onClick={() => setEditMotifs(editMotifs.filter(m => m !== motif))}
                        className="neuro-pressed rounded-full px-4 py-2 text-xs text-[#a0a0a0] flex items-center gap-2"
                      >
                        {motif}
                        <X className="w-3 h-3" />
                      </button>
                    ))}
                  </div>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {commonMotifs.filter(m => !editMotifs.includes(m)).map(motif => (
                      <button
                        key={motif}
                        onClick={() => handleAddMotif(motif)}
                        className="neuro-flat rounded-full px-3 py-1 text-xs text-[#707070]"
                      >
                        + {motif}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Input
                      value={newMotif}
                      onChange={(e) => setNewMotif(e.target.value)}
                      placeholder="Add custom vibe"
                      className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl flex-1"
                      onKeyPress={(e) => e.key === 'Enter' && handleAddMotif(newMotif)}
                    />
                    <Button
                      onClick={() => handleAddMotif(newMotif)}
                      disabled={!newMotif.trim()}
                      className="neuro-base active:neuro-pressed rounded-2xl px-4"
                    >
                      <Plus className="w-4 h-4 text-[#808080]" />
                    </Button>
                  </div>
                </div>

                {/* Streaming Links */}
                <div>
                  <label className="text-sm text-[#808080] mb-2 block">Streaming Platform Links</label>
                  <p className="text-xs text-[#606060] mb-3">At least one link required</p>
                  
                  <div className="space-y-3">
                    <Input
                      value={editSpotifyLink}
                      onChange={(e) => setEditSpotifyLink(e.target.value)}
                      placeholder="Spotify link"
                      className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl"
                    />
                    <Input
                      value={editYoutubeLink}
                      onChange={(e) => setEditYoutubeLink(e.target.value)}
                      placeholder="YouTube link"
                      className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl"
                    />
                    <Input
                      value={editSoundcloudLink}
                      onChange={(e) => setEditSoundcloudLink(e.target.value)}
                      placeholder="SoundCloud link"
                      className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl"
                    />
                    <Input
                      value={editAppleMusicLink}
                      onChange={(e) => setEditAppleMusicLink(e.target.value)}
                      placeholder="Apple Music link"
                      className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  onClick={() => setShowEditModal(false)}
                  className="flex-1 neuro-flat rounded-2xl py-3"
                >
                  <span className="text-[#808080]">Cancel</span>
                </Button>
                <Button
                  onClick={handleSaveEdit}
                  disabled={updateTrackMutation.isPending}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {updateTrackMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  ) : (
                    <span className="text-[#a0a0a0]">Save Changes</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Unlock Modal */}
        {showUnlockModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[#d0d0d0]">Unlock Exclusive Content</h2>
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="neuro-flat rounded-xl p-2"
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <div className="mb-6">
                <div className="neuro-pressed rounded-2xl p-4 mb-4">
                  <p className="text-sm text-[#a0a0a0] mb-2">
                    <span className="capitalize">{track.exclusive_content_type}</span> for "{track.title}"
                  </p>
                  <p className="text-xs text-[#707070]">
                    Support {track.artist_name} and get exclusive access
                  </p>
                </div>

                <div className="flex justify-between items-center neuro-flat rounded-2xl p-4">
                  <span className="text-sm text-[#808080]">Cost</span>
                  <span className="text-lg font-medium text-[#a0a0a0]">{track.unlock_price} credits</span>
                </div>

                <div className="mt-4 neuro-pressed rounded-2xl p-3 text-xs text-[#707070]">
                  Your balance: {(currentUser.standard_credits || 0) + (currentUser.premium_credits || 0)} credits
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={() => setShowUnlockModal(false)}
                  className="flex-1 neuro-flat rounded-2xl py-3"
                >
                  <span className="text-[#808080]">Cancel</span>
                </Button>
                <Button
                  onClick={() => unlockMutation.mutate()}
                  disabled={isUnlockingProcess || ((currentUser.standard_credits || 0) + (currentUser.premium_credits || 0)) < track.unlock_price}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {isUnlockingProcess ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  ) : (
                    <span className="text-[#a0a0a0]">Unlock</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Copyright Report Modal */}
        {showCopyrightModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[#d0d0d0]">Report Copyright Violation</h2>
                <button
                  onClick={() => {
                    setShowCopyrightModal(false);
                    setCopyrightDescription("");
                  }}
                  className="neuro-flat rounded-xl p-2"
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <div className="neuro-pressed rounded-2xl p-4 mb-4">
                <p className="text-sm text-[#a0a0a0] mb-2">Track: {track.title}</p>
                <p className="text-xs text-[#707070]">Artist: {track.artist_name}</p>
              </div>

              <Textarea
                value={copyrightDescription}
                onChange={(e) => setCopyrightDescription(e.target.value)}
                placeholder="Please describe the copyright violation. Include details about the original work, your relationship to it, and any supporting evidence."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[120px] resize-none mb-4"
              />

              <div className="flex gap-3">
                <Button
                  onClick={() => {
                    setShowCopyrightModal(false);
                    setCopyrightDescription("");
                  }}
                  className="flex-1 neuro-flat rounded-2xl py-3"
                >
                  <span className="text-[#808080]">Cancel</span>
                </Button>
                <Button
                  onClick={() => reportCopyrightMutation.mutate()}
                  disabled={!copyrightDescription.trim() || reportCopyrightMutation.isPending}
                  className="flex-1 neuro-base active:neuro-pressed rounded-2xl py-3"
                >
                  {reportCopyrightMutation.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
                  ) : (
                    <span className="text-[#a0a0a0]">Submit Report</span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Claim Track Modal */}
        {showClaimModal && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[100] p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-light text-[#d0d0d0]">Claim Track Ownership</h2>
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setClaimReason("");
                    setClaimProofUrl("");
                  }}
                  className="neuro-flat rounded-xl p-2"
                >
                  <X className="w-5 h-5 text-[#808080]" />
                </button>
              </div>

              <div className="neuro-pressed rounded-2xl p-4 mb-4">
                <p className="text-sm text-[#a0a0a0] mb-2">Track: {track.title}</p>
                <p className="text-xs text-[#707070]">Current Artist: {track.artist_name}</p>
              </div>

              <div className="space-y-4 mb-4">
                <div>
                  <label className="text-xs text-[#808080] mb-2 block">Why are you claiming this track?</label>
                  <Textarea
                    value={claimReason}
                    onChange={(e) => setClaimReason(e.target.value)}
                    placeholder="Explain why you believe you are the rightful owner of this track..."
                    className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[100px] resize-none"
                  />
                </div>

                <div>
                  <label className="text-xs text-[#808080] mb-2 block">Proof URL (optional)</label>
                  <Input
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

        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div id="container-trackdetails-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {/* Track Header */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="flex gap-6 mb-6">
            <img
              src={track.cover_image_url}
              alt={track.title}
              className="w-40 h-40 rounded-2xl object-cover neuro-pressed"
              fetchpriority="high"
              decoding="async"
              width="160"
              height="160"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start mb-2">
                <h1 className="text-3xl font-light text-[#d0d0d0]">{track.title}</h1>
                <div className="flex gap-2">
                  {isOwner && (
                    <>
                      <button
                        onClick={openEditModal}
                        className="neuro-flat rounded-xl p-2 smooth-transition hover:scale-105"
                        title="Edit Track"
                      >
                        <Edit className="w-5 h-5 text-[#808080]" />
                      </button>
                      <button
                        onClick={() => setShowDeleteModal(true)}
                        className="neuro-flat rounded-xl p-2 smooth-transition hover:scale-105"
                        title="Delete Track"
                      >
                        <Trash2 className="w-5 h-5 text-[#808080]" />
                      </button>
                    </>
                  )}
                  {!isOwner && (
                    <>
                      {!trackClaimed && (
                        <button
                          onClick={() => setShowClaimModal(true)}
                          className="neuro-flat rounded-xl p-2 smooth-transition hover:scale-105"
                          title="Claim Track Ownership"
                        >
                          <UserCheck className="w-5 h-5 text-[#808080]" />
                        </button>
                      )}
                      <button
                        onClick={() => setShowCopyrightModal(true)}
                        className="neuro-flat rounded-xl p-2 smooth-transition hover:scale-105"
                        title="Report Copyright"
                      >
                        <Flag className="w-5 h-5 text-[#808080]" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <Link
                to={createPageUrl("PublicProfile") + `?userId=${track.artist_id}`}
                className="text-lg text-[#808080] hover:text-[#a0a0a0] smooth-transition inline-block mb-4"
              >
                {track.artist_name}
              </Link>
              
              {/* Exclusive Content Badge */}
              {hasExclusiveContent && !isOwner && (
                <div className="mb-4">
                  {unlocked ? (
                    <button
                      onClick={() => window.open(track.exclusive_content_url, '_blank')}
                      className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 flex items-center gap-2 smooth-transition hover:scale-105"
                    >
                      <Unlock className="w-4 h-4 text-[#90b090]" />
                      <span className="text-sm text-[#90b090]">View {track.exclusive_content_type}</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsUnlocking(true)} // Use setIsUnlocking here
                      className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 flex items-center gap-2 smooth-transition hover:scale-105"
                    >
                      <Lock className="w-4 h-4 text-[#b0a090]" />
                      <span className="text-sm text-[#b0a090]">Unlock {track.exclusive_content_type} ({track.unlock_price} credits)</span>
                    </button>
                  )}
                </div>
              )}
              
              {/* Genres */}
              <div className="flex flex-wrap gap-2 mb-4">
                {track.genres?.map(genre => (
                  <span
                    key={genre}
                    className="text-xs px-3 py-1 rounded-full bg-[#0a0a0a] text-[#808080]"
                  >
                    {genre}
                  </span>
                ))}
              </div>

              {/* Motifs */}
              {track.motifs && track.motifs.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {track.motifs.map(motif => (
                    <span
                      key={motif}
                      className="text-xs px-3 py-1 rounded-full bg-[#0a0a0a] text-[#707070]"
                    >
                      {motif}
                    </span>
                  ))}
                </div>
              )}
              
              {/* Streaming Platform Links */}
              {(track.spotify_link || track.youtube_link || track.soundcloud_link || track.apple_music_link) && (
                <div className="flex gap-3 mt-4">
                  {track.spotify_link && (
                    <a
                      href={track.spotify_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neuro-flat w-12 h-12 rounded-xl flex items-center justify-center smooth-transition hover:scale-105"
                    >
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/3b09f503f_IMG_2529.jpeg"
                        alt="Spotify"
                        className="w-7 h-7 object-contain"
                      />
                    </a>
                  )}
                  {track.soundcloud_link && (
                    <a
                      href={track.soundcloud_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neuro-flat w-12 h-12 rounded-xl flex items-center justify-center smooth-transition hover:scale-105"
                    >
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/a9db533b2_IMG_2530.jpeg"
                        alt="SoundCloud"
                        className="w-7 h-7 object-contain"
                      />
                    </a>
                  )}
                  {track.youtube_link && (
                    <a
                      href={track.youtube_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neuro-flat w-12 h-12 rounded-xl flex items-center justify-center smooth-transition hover:scale-105"
                    >
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/94d3f77d0_IMG_2531.jpeg"
                        alt="YouTube"
                        className="w-7 h-7 object-contain"
                      />
                    </a>
                  )}
                  {track.apple_music_link && (
                    <a
                      href={track.apple_music_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="neuro-flat w-12 h-12 rounded-xl flex items-center justify-center smooth-transition hover:scale-105"
                    >
                      <img 
                        src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/491144777_IMG_2532.jpeg"
                        alt="Apple Music"
                        className="w-7 h-7 object-contain"
                      />
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Audio Player */}
          <div className="neuro-pressed rounded-2xl p-4">
            <audio ref={audioRef} src={track.audio_url} />
            
            <div className="flex items-center gap-4 mb-3">
              <button
                onClick={togglePlayPause}
                className="neuro-base active:neuro-pressed w-12 h-12 rounded-full flex items-center justify-center"
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 text-[#a0a0a0]" fill="currentColor" />
                ) : (
                  <Play className="w-5 h-5 text-[#a0a0a0] ml-0.5" fill="currentColor" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex justify-between text-xs text-[#707070] mb-2">
                  <span>{formatTime(currentTime)}</span>
                  <span>{formatTime(duration)}</span>
                </div>
                <div className="h-2 bg-[#0a0a0a] rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#505050] to-[#808080] transition-all"
                    style={{ width: `${progressPercentage}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <div className="neuro-flat rounded-2xl p-3 text-center">
              <p className="text-lg font-light text-[#b0b0b0]">{track.total_listens}</p>
              <p className="text-xs text-[#707070]">Listens</p>
            </div>
            <div className="neuro-flat rounded-2xl p-3 text-center">
              <p className="text-lg font-light text-[#b0b0b0]">{track.total_votes}</p>
              <p className="text-xs text-[#707070]">Votes</p>
            </div>
            <div className="neuro-flat rounded-2xl p-3 text-center">
              <p className="text-lg font-light text-[#b0b0b0]">{track.completed_listens}</p>
              <p className="text-xs text-[#707070]">Completed</p>
            </div>
          </div>
        </div>

        {/* Description */}
        {track.description && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h2 className="text-lg font-light text-[#d0d0d0] mb-4 flex items-center gap-2">
              <Music className="w-5 h-5" />
              About This Track
            </h2>
            <p className="text-sm text-[#a0a0a0] leading-relaxed">{track.description}</p>
          </div>
        )}

        {/* FEEDBACK SECTION REMOVED - Feedback is now private */}
        {/* Feedback is only accessible via inbox messages with secure links */}

        {/* Comment Section */}
        <div id="comments">
          <CommentSection trackId={trackId} />
        </div>
      </div>

    </div>
  );
}
