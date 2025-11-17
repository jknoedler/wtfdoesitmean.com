import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation } from "@tanstack/react-query";
import { createPageUrl } from "@/utils";
import { Loader2, Music, ArrowLeft, Upload, CheckCircle, AlertCircle } from "lucide-react";
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
import GenreSelector from "@/components/GenreSelector";

export default function CuratorSubmission() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [submissionType, setSubmissionType] = useState("existing"); // "existing" or "new"
  const [selectedTrackId, setSelectedTrackId] = useState("");
  const [title, setTitle] = useState("");
  const [audioFile, setAudioFile] = useState(null);
  const [coverImage, setCoverImage] = useState(null);
  const [audioPreview, setAudioPreview] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);
  const [spotifyLink, setSpotifyLink] = useState("");
  const [youtubeLink, setYoutubeLink] = useState("");
  const [soundcloudLink, setSoundcloudLink] = useState("");
  const [appleMusicLink, setAppleMusicLink] = useState("");
  const [selectedGenres, setSelectedGenres] = useState([]);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  useEffect(() => {
    document.title = "Submit to Curators - Soundope";
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
      if (!user) {
        navigate(createPageUrl("Login"));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      navigate(createPageUrl("Login"));
    }
  };

  // Fetch user's existing tracks
  const { data: userTracks = [], isLoading: tracksLoading } = useQuery({
    queryKey: ['user-tracks', currentUser?.id],
    queryFn: async () => {
      if (!currentUser?.id) return [];
      const tracks = await api.entities.Track.filter({ artist_id: currentUser.id });
      return tracks || [];
    },
    enabled: !!currentUser?.id && submissionType === "existing",
  });

  // When a track is selected, populate the form
  useEffect(() => {
    if (selectedTrackId && userTracks.length > 0) {
      const track = userTracks.find(t => t.id === selectedTrackId);
      if (track) {
        setTitle(track.title);
        setSpotifyLink(track.streaming_links?.spotify || "");
        setYoutubeLink(track.streaming_links?.youtube || "");
        setSoundcloudLink(track.streaming_links?.soundcloud || "");
        setAppleMusicLink(track.streaming_links?.apple_music || "");
        setSelectedGenres(track.genres || []);
      }
    }
  }, [selectedTrackId, userTracks]);

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

  const submitMutation = useMutation({
    mutationFn: async (submissionData) => {
      return api.entities.CuratorSubmission.create(submissionData);
    },
    onSuccess: () => {
      setSubmitSuccess(true);
      // Deduct 1 credit
      const totalCredits = (currentUser?.standard_credits || 0) + (currentUser?.premium_credits || 0);
      let premiumUsed = 0;
      let standardUsed = 0;
      
      if (currentUser?.premium_credits >= 1) {
        premiumUsed = 1;
      } else {
        standardUsed = 1;
      }
      
      api.auth.updateMe({
        premium_credits: (currentUser?.premium_credits || 0) - premiumUsed,
        standard_credits: (currentUser?.standard_credits || 0) - standardUsed,
      });
      
      setTimeout(() => {
        navigate(createPageUrl("SpotifyPlaylists"));
      }, 2000);
    },
    onError: (error) => {
      setSubmitError(error.message || "Failed to submit. Please try again.");
    },
  });

  const handleSubmit = async () => {
    setSubmitError("");

    // Validation
    if (selectedGenres.length === 0) {
      setSubmitError("Please select at least one genre");
      return;
    }

    if (submissionType === "existing") {
      if (!selectedTrackId) {
        setSubmitError("Please select a track");
        return;
      }
    } else {
      if (!title.trim()) {
        setSubmitError("Track title is required");
        return;
      }
      if (!audioFile) {
        setSubmitError("Audio file is required");
        return;
      }
      if (!coverImage) {
        setSubmitError("Cover image is required");
        return;
      }
    }

    if (!spotifyLink && !youtubeLink && !soundcloudLink && !appleMusicLink) {
      setSubmitError("At least one streaming platform link is required");
      return;
    }

    // Check credits
    const totalCredits = (currentUser?.standard_credits || 0) + (currentUser?.premium_credits || 0);
    if (totalCredits < 1) {
      setSubmitError("You need at least 1 credit to submit to curators");
      return;
    }

    try {
      let submissionData = {
        genres: selectedGenres,
        spotify_link: spotifyLink.trim() || null,
        youtube_link: youtubeLink.trim() || null,
        soundcloud_link: soundcloudLink.trim() || null,
        apple_music_link: appleMusicLink.trim() || null,
        credits_deducted: 1,
      };

      if (submissionType === "existing") {
        submissionData.track_id = selectedTrackId;
      } else {
        // Upload new files
        const audioUploadResult = await api.integrations.Core.UploadFile({ file: audioFile });
        const coverUploadResult = await api.integrations.Core.UploadFile({ file: coverImage });

        submissionData.title = title.trim();
        submissionData.audio_url = audioUploadResult.file_url;
        submissionData.cover_image_url = coverUploadResult.file_url;
      }

      submitMutation.mutate(submissionData);
    } catch (error) {
      setSubmitError(error.message || "Failed to submit. Please try again.");
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const totalCredits = (currentUser?.standard_credits || 0) + (currentUser?.premium_credits || 0);
  const canSubmit = totalCredits >= 1 && selectedGenres.length > 0;

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(createPageUrl("SpotifyPlaylists"))}
          className="flex items-center gap-2 text-sm text-[#808080] hover:text-[#a0a0a0] mb-6"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Playlists
        </button>

        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Submit to Curators</h1>
          <p className="text-sm text-[#808080]">Submit your music to top playlist curators worldwide</p>
          <p className="text-xs text-[#707070] mt-2">Cost: 1 credit per submission</p>
        </div>

        {/* Credits Display */}
        <div className="neuro-base rounded-3xl p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-sm text-[#808080]">Your Credits:</span>
            <span className="text-lg font-medium text-[#d0d0d0]">{totalCredits}</span>
          </div>
        </div>

        {/* Submission Type Selection */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Submission Type</h3>
          <div className="flex gap-4">
            <button
              onClick={() => {
                setSubmissionType("existing");
                setSelectedTrackId("");
                setTitle("");
                setAudioFile(null);
                setCoverImage(null);
                setAudioPreview(null);
                setCoverPreview(null);
              }}
              className={`flex-1 neuro-flat rounded-2xl p-4 text-sm ${
                submissionType === "existing"
                  ? "neuro-pressed text-[#d0d0d0]"
                  : "text-[#808080]"
              }`}
            >
              Use Existing Track
            </button>
            <button
              onClick={() => {
                setSubmissionType("new");
                setSelectedTrackId("");
              }}
              className={`flex-1 neuro-flat rounded-2xl p-4 text-sm ${
                submissionType === "new"
                  ? "neuro-pressed text-[#d0d0d0]"
                  : "text-[#808080]"
              }`}
            >
              Upload New Track
            </button>
          </div>
        </div>

        {/* Existing Track Selector */}
        {submissionType === "existing" && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h3 className="text-sm text-[#808080] mb-4">Select Track</h3>
            {tracksLoading ? (
              <Loader2 className="w-6 h-6 animate-spin text-[#707070] mx-auto" />
            ) : userTracks.length === 0 ? (
              <p className="text-sm text-[#808080] text-center py-4">
                You haven't uploaded any tracks yet. Switch to "Upload New Track" to submit.
              </p>
            ) : (
              <Select value={selectedTrackId} onValueChange={setSelectedTrackId}>
                <SelectTrigger className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl">
                  <SelectValue placeholder="Choose a track..." />
                </SelectTrigger>
                <SelectContent>
                  {userTracks.map((track) => (
                    <SelectItem key={track.id} value={track.id}>
                      {track.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        )}

        {/* New Track Upload Form */}
        {submissionType === "new" && (
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
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-[#707070] mb-2 block">Audio File</label>
                  <label className="block">
                    <input
                      type="file"
                      accept="audio/*"
                      onChange={handleAudioSelect}
                      className="hidden"
                    />
                    <div className="neuro-pressed rounded-2xl p-4 cursor-pointer hover:opacity-80 text-center">
                      {audioPreview ? (
                        <div className="space-y-2">
                          <Music className="w-8 h-8 text-[#808080] mx-auto" />
                          <p className="text-xs text-[#808080]">Audio selected</p>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-[#808080] mx-auto" />
                          <p className="text-xs text-[#808080]">Upload Audio</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>

                <div>
                  <label className="text-xs text-[#707070] mb-2 block">Cover Image</label>
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleCoverSelect}
                      className="hidden"
                    />
                    <div className="neuro-pressed rounded-2xl p-4 cursor-pointer hover:opacity-80 text-center">
                      {coverPreview ? (
                        <img
                          src={coverPreview}
                          alt="Cover preview"
                          className="w-full h-20 object-cover rounded-xl"
                        />
                      ) : (
                        <div className="space-y-2">
                          <Upload className="w-8 h-8 text-[#808080] mx-auto" />
                          <p className="text-xs text-[#808080]">Upload Cover</p>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Streaming Links */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Streaming Links</h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#707070] mb-2 block">Spotify</label>
              <Input
                value={spotifyLink}
                onChange={(e) => setSpotifyLink(e.target.value)}
                placeholder="https://open.spotify.com/track/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>
            <div>
              <label className="text-xs text-[#707070] mb-2 block">YouTube</label>
              <Input
                value={youtubeLink}
                onChange={(e) => setYoutubeLink(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>
            <div>
              <label className="text-xs text-[#707070] mb-2 block">SoundCloud</label>
              <Input
                value={soundcloudLink}
                onChange={(e) => setSoundcloudLink(e.target.value)}
                placeholder="https://soundcloud.com/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>
            <div>
              <label className="text-xs text-[#707070] mb-2 block">Apple Music</label>
              <Input
                value={appleMusicLink}
                onChange={(e) => setAppleMusicLink(e.target.value)}
                placeholder="https://music.apple.com/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Genre Selection */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <GenreSelector
            selectedGenres={selectedGenres}
            onChange={setSelectedGenres}
          />
        </div>

        {/* Submit Button */}
        <Button
          onClick={handleSubmit}
          disabled={!canSubmit || submitMutation.isPending}
          className="w-full neuro-base active:neuro-pressed rounded-xl py-4 text-lg"
        >
          {submitMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            `Submit to Curators (1 Credit)`
          )}
        </Button>

        {submitError && (
          <div className="mt-4 flex items-center gap-2 text-sm text-[#b09090]">
            <AlertCircle className="w-4 h-4" />
            {submitError}
          </div>
        )}

        {submitSuccess && (
          <div className="mt-4 neuro-base rounded-3xl p-6 bg-[#1a2a1a]">
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-[#90b090]" />
              <div>
                <p className="text-sm font-medium text-[#90b090]">Submission Successful!</p>
                <p className="text-xs text-[#808080] mt-1">
                  Your track has been submitted to curators. Redirecting...
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

