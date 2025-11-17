import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Save, Info } from "lucide-react";

export default function Settings() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [profileImage, setProfileImage] = useState(null);
  const [detestedGenres, setDetestedGenres] = useState([]);
  const [detestedMotifs, setDetestedMotifs] = useState([]);
  const [socialLinks, setSocialLinks] = useState({
    instagram: "",
    tiktok: "",
    youtube: "",
    spotify: "",
    apple_music: "",
    soundcloud: ""
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);

  const commonGenres = [
    "Hip Hop", "R&B", "Pop", "Electronic", "Rock", "Jazz", "Soul", 
    "Alternative", "Indie", "Lo-fi", "Trap", "House", "Ambient",
    "Punk", "Metal", "Techno", "Dubstep", "Country"
  ];

  const commonMotifs = [
    "angry", "happy", "chill", "moody", "sad", "energetic", "depressed", "raging", 
    "uplifting", "anxious", "haunted", "hopeful", "vengeful", "melancholic", "ecstatic", 
    "numb", "paranoid", "defiant", "cathartic", "hypnotic", "explosive", "glitchy", 
    "tense", "bouncy", "chaotic", "dark", "gritty", "raw", "dreamy", "violent", 
    "minimal", "lofi", "distorted"
  ];

  useEffect(() => {
    // Add SEO meta tags
    document.title = "Account Settings - Customize Your Experience | Soundope";
    
    const metaTags = [
      { type: 'name', key: 'description', content: "Customize your Soundope experience. Set genre preferences, manage notifications, update profile information, and control your music discovery settings." },
      { type: 'name', key: 'keywords', content: "account settings, music preferences, genre filters, notification settings, artist settings, customize music feed, profile settings" },
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
      const adContainer = document.getElementById('container-settings-banner-763b8c85de11ad1c95d4275c8cb17af7');
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
      setArtistName(user.artist_name || "");
      setBio(user.bio || "");
      setDetestedGenres(user.detested_genres || []);
      setDetestedMotifs(user.detested_motifs || []);
      setSocialLinks(user.social_links || {
        instagram: "",
        tiktok: "",
        youtube: "",
        spotify: "",
        apple_music: "",
        soundcloud: ""
      });
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  // Calculate profile completion based on current form state
  const calculateProfileCompletion = () => {
    const checks = [
      { field: 'artist_name', label: 'Artist Name', complete: !!artistName && artistName.trim().length > 0, icon: '👤' },
      { field: 'bio', label: 'Bio (20+ characters)', complete: !!bio && bio.trim().length >= 20, icon: '📝' },
      { 
        field: 'profile_image', 
        label: 'Profile Picture', 
        complete: !!profileImage || !!currentUser?.profile_image_url,
        icon: '🖼️'
      },
      { 
        field: 'social_links', 
        label: 'At least one social link', 
        complete: Object.values(socialLinks).some(link => link && link.trim()),
        icon: '🔗'
      }
    ];
    
    const completed = checks.filter(c => c.complete).length;
    const percentage = Math.round((completed / checks.length) * 100);
    
    return { percentage, checks, completed, total: checks.length };
  };

  const profileCompletion = calculateProfileCompletion();

  const saveMutation = useMutation({
    mutationFn: async () => {
      setIsSaving(true);
      
      let profileImageUrl = currentUser.profile_image_url;
      if (profileImage) {
        const upload = await api.integrations.Core.UploadFile({ file: profileImage });
        profileImageUrl = upload.file_url;
      }

      await api.auth.updateMe({
        artist_name: artistName,
        bio,
        profile_image_url: profileImageUrl,
        detested_genres: detestedGenres,
        detested_motifs: detestedMotifs,
        social_links: socialLinks
      });

      setIsSaving(false);
    },
    onSuccess: () => {
      navigate(createPageUrl("Discover"));
    }
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        {/* Page Title with Background */}
        <div className="neuro-base rounded-3xl p-6 text-center mb-8">
          <h1 className="text-3xl font-light text-[#d0d0d0]">
            Profile Settings
          </h1>
        </div>

        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div id="container-settings-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {/* Profile Completion Progress */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-light text-[#d0d0d0]">Profile Completion</h3>
            <div className="neuro-pressed px-4 py-2 rounded-xl">
              <span className="text-xl font-light text-[#a0a0a0]">{profileCompletion.percentage}%</span>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="w-full h-3 bg-[#0a0a0a] rounded-full overflow-hidden neuro-pressed mb-4">
            <div 
              className="h-full bg-gradient-to-r from-[#606060] to-[#909090] transition-all duration-500"
              style={{ width: `${profileCompletion.percentage}%` }}
            />
          </div>

          {/* Checklist */}
          <div className="space-y-2">
            {profileCompletion.checks.map(check => (
              <div
                key={check.field}
                className={`flex items-center gap-3 p-3 rounded-xl transition-all ${
                  check.complete ? 'neuro-pressed bg-[#0a0a0a]' : 'neuro-flat'
                }`}
              >
                <div className={`w-6 h-6 rounded-lg flex items-center justify-center ${
                  check.complete ? 'bg-[#2a2a2a]' : 'bg-[#1a1a1a]'
                }`}>
                  {check.complete ? (
                    <span className="text-[#90d090] text-sm">✓</span>
                  ) : (
                    <span className="text-[#606060] text-xs">{check.icon}</span>
                  )}
                </div>
                <span className={`text-sm ${
                  check.complete ? 'text-[#a0a0a0]' : 'text-[#707070]'
                }`}>
                  {check.label}
                </span>
              </div>
            ))}
          </div>

          {profileCompletion.percentage === 100 && (
            <div className="mt-4 p-3 rounded-xl bg-[#1a2a1a] border border-[#2a3a2a]">
              <p className="text-sm text-[#90d090] text-center flex items-center justify-center gap-2">
                <span>🎉</span>
                Profile Complete! You're all set to make the most of Soundope
              </p>
            </div>
          )}
        </div>

        {/* Basic Info */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="mb-6">
            <label className="text-sm text-[#808080] mb-2 block">Display Name</label>
            <Input
              value={artistName}
              onChange={(e) => setArtistName(e.target.value)}
              placeholder="Artist name, band name, or username"
              className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
            />
          </div>

          <div className="mb-6">
            <label className="text-sm text-[#808080] mb-2 block">Bio</label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us about yourself..."
              className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[100px] resize-none"
            />
          </div>

          <div>
            <label className="text-sm text-[#808080] mb-2 block">Profile Picture</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => setProfileImage(e.target.files[0])}
              className="text-sm text-[#808080]"
            />
          </div>
        </div>

        {/* Detested Genres & Vibes - Combined Box */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          {/* Detested Genres */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm text-[#808080]">Genres I absolutely detest.</h3>
              <div 
                className="relative"
                onMouseEnter={() => setShowTooltip(true)}
                onMouseLeave={() => setShowTooltip(false)}
              >
                <div className="w-5 h-5 rounded-full border-2 border-[#606060] flex items-center justify-center cursor-help">
                  <Info className="w-3 h-3 text-[#606060]" />
                </div>
                {showTooltip && (
                  <div className="absolute right-0 top-8 w-64 neuro-base rounded-2xl p-4 z-50 shadow-xl">
                    <p className="text-xs text-[#a0a0a0] leading-relaxed">
                      IF there's a genre or vibe you cannot stand, we don't wanna serve it to you, so remove yourself from those groups here. keep in mind, the more you restrict, the less opportunity you'll have to earn, and people with 0 restrictions may earn increased points.
                    </p>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {commonGenres.map(genre => (
                <button
                  key={genre}
                  onClick={() => {
                    if (detestedGenres.includes(genre)) {
                      setDetestedGenres(detestedGenres.filter(g => g !== genre));
                    } else {
                      setDetestedGenres([...detestedGenres, genre]);
                    }
                  }}
                  className={`neuro-base rounded-full px-4 py-2 text-xs smooth-transition hover:scale-105 ${
                    detestedGenres.includes(genre) ? 'neuro-pressed text-[#a0a0a0]' : 'text-[#707070]'
                  }`}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>

          {/* Detested Vibes */}
          <div>
            <h3 className="text-sm text-[#808080] mb-4">Vibes that aren't vibing (it's not for me)</h3>
            
            <div className="flex flex-wrap gap-2">
              {commonMotifs.map(motif => (
                <button
                  key={motif}
                  onClick={() => {
                    if (detestedMotifs.includes(motif)) {
                      setDetestedMotifs(detestedMotifs.filter(m => m !== motif));
                    } else {
                      setDetestedMotifs([...detestedMotifs, motif]);
                    }
                  }}
                  className={`neuro-base rounded-full px-4 py-2 text-xs smooth-transition hover:scale-105 ${
                    detestedMotifs.includes(motif) ? 'neuro-pressed text-[#a0a0a0]' : 'text-[#707070]'
                  }`}
                >
                  {motif}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Social Links */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h3 className="text-sm text-[#808080] mb-4">Social Links</h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs text-[#707070] mb-2 block">Instagram</label>
              <Input
                value={socialLinks.instagram}
                onChange={(e) => setSocialLinks({
                  ...socialLinks,
                  instagram: e.target.value
                })}
                placeholder="https://instagram.com/yourusername"
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>
            
            <div>
              <label className="text-xs text-[#707070] mb-2 block">TikTok</label>
              <Input
                value={socialLinks.tiktok}
                onChange={(e) => setSocialLinks({
                  ...socialLinks,
                  tiktok: e.target.value
                })}
                placeholder="https://tiktok.com/@yourusername"
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block">YouTube</label>
              <Input
                value={socialLinks.youtube}
                onChange={(e) => setSocialLinks({
                  ...socialLinks,
                  youtube: e.target.value
                })}
                placeholder="https://youtube.com/@yourchannel"
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block">Spotify</label>
              <Input
                value={socialLinks.spotify}
                onChange={(e) => setSocialLinks({
                  ...socialLinks,
                  spotify: e.target.value
                })}
                placeholder="https://open.spotify.com/artist/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block">Apple Music</label>
              <Input
                value={socialLinks.apple_music}
                onChange={(e) => setSocialLinks({
                  ...socialLinks,
                  apple_music: e.target.value
                })}
                placeholder="https://music.apple.com/artist/..."
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>

            <div>
              <label className="text-xs text-[#707070] mb-2 block">SoundCloud</label>
              <Input
                value={socialLinks.soundcloud}
                onChange={(e) => setSocialLinks({
                  ...socialLinks,
                  soundcloud: e.target.value
                })}
                placeholder="https://soundcloud.com/yourusername"
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <Button
          onClick={() => saveMutation.mutate()}
          disabled={isSaving}
          className="neuro-base active:neuro-pressed rounded-2xl px-8 py-4 w-full smooth-transition hover:scale-[1.02]"
        >
          {isSaving ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin text-[#808080]" />
              <span className="ml-2 text-[#808080]">Saving...</span>
            </>
          ) : (
            <>
              <Save className="w-5 h-5 text-[#a0a0a0]" />
              <span className="ml-2 text-[#a0a0a0]">Save Settings</span>
            </>
          )}
        </Button>
      </div>

    </div>
  );
}