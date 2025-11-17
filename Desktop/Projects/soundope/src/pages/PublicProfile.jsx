
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Music, MessageSquare, Trophy, Star, Award, ExternalLink, Send, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";

export default function PublicProfile() {
  const location = useLocation();
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);
  const [profileUser, setProfileUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const urlParams = new URLSearchParams(location.search);
  const userId = urlParams.get('userId');

  useEffect(() => {
    loadUsers();
  }, [userId]);

  // Load Adsterra Banner Ad
  useEffect(() => {
    const loadAdsterraAd = () => {
      const adContainer = document.getElementById('container-publicprofile-banner-763b8c85de11ad1c95d4275c8cb17af7');
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

  const loadUsers = async () => {
    try {
      const current = await api.auth.me();
      setCurrentUser(current);

      const allUsers = await api.entities.User.list();
      const profile = allUsers.find(u => u.id === userId);
      setProfileUser(profile);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading users:", error);
      setIsLoading(false);
    }
  };

  const { data: tracks = [] } = useQuery({
    queryKey: ['user-tracks', userId],
    queryFn: () => api.entities.Track.filter({ artist_id: userId }),
    enabled: !!userId,
  });

  const { data: feedbackGiven = [] } = useQuery({
    queryKey: ['user-feedback-given', userId],
    queryFn: () => api.entities.Feedback.filter({ reviewer_id: userId }, '-created_date', 10),
    enabled: !!userId,
  });

  const { data: feedbackReceived = [] } = useQuery({
    queryKey: ['user-feedback-received', userId],
    queryFn: () => api.entities.Feedback.filter({ artist_id: userId }, '-created_date', 10),
    enabled: !!userId,
  });

  const handleMessage = () => {
    navigate(createPageUrl("Inbox"), {
      state: {
        startConversation: {
          recipientId: profileUser.id,
          recipientName: profileUser.artist_name || profileUser.full_name
        }
      }
    });
  };

  const getSocialIcon = (platform) => {
    const icons = {
      spotify: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/a0741ee01_IMG_2529.jpeg",
      youtube: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/79d752129_IMG_2531.jpeg",
      soundcloud: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/73bc81025_IMG_2530.jpeg",
      apple_music: "https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/446463b1a_IMG_2532.jpeg"
    };
    return icons[platform];
  };

  const getBadgeInfo = (badge) => {
    const badges = {
      'early_adopter': { icon: '🌟', name: 'Early Adopter', description: 'Joined in the first month' },
      'feedback_master': { icon: '💬', name: 'Feedback Master', description: '100+ quality reviews' },
      'genre_guru': { icon: '🎵', name: 'Genre Guru', description: 'Expert in specific genre' },
      'helpful_critic': { icon: '👍', name: 'Helpful Critic', description: '50+ helpful votes' },
      'community_leader': { icon: '🏆', name: 'Community Leader', description: 'Top contributor' },
      'streak_warrior': { icon: '🔥', name: 'Streak Warrior', description: '30-day feedback streak' },
      'collab_connector': { icon: '🤝', name: 'Collab Connector', description: 'Facilitated 10+ collaborations' }
    };
    return badges[badge] || { icon: '🏅', name: badge, description: 'Achievement unlocked' };
  };

  const getTierColor = (tier) => {
    const colors = {
      'novice': 'text-[#707070]',
      'contributor': 'text-[#808080]',
      'critic': 'text-[#909090]',
      'connoisseur': 'text-[#a0a0a0]',
      'legend': 'text-[#b0a090]'
    };
    return colors[tier] || 'text-[#707070]';
  };

  const getTierBadge = (tier) => {
    const badges = {
      'novice': '🌱',
      'contributor': '⭐',
      'critic': '🎯',
      'connoisseur': '👑',
      'legend': '🏆'
    };
    return badges[tier] || '🌱';
  };

  if (isLoading || !profileUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const avgRating = feedbackReceived.length > 0
    ? (feedbackReceived.reduce((sum, f) => sum + (f.overall_rating || 0), 0) / feedbackReceived.length).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-5xl mx-auto">
        {/* Adsterra Banner Ad */}
        <div className="flex justify-center mb-6">
          <div className="w-full max-w-4xl">
            <div id="container-publicprofile-banner-763b8c85de11ad1c95d4275c8cb17af7"></div>
          </div>
        </div>

        {/* Profile Header */}
        <div className="neuro-base rounded-3xl p-8 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Profile Image */}
            <div className="flex-shrink-0">
              {profileUser.profile_image_url ? (
                <img
                  src={profileUser.profile_image_url}
                  alt={profileUser.artist_name || profileUser.full_name}
                  className="w-32 h-32 rounded-3xl object-cover neuro-pressed"
                  fetchpriority="high"
                  decoding="async"
                  width="128"
                  height="128"
                />
              ) : (
                <div className="w-32 h-32 rounded-3xl neuro-pressed flex items-center justify-center">
                  <Music className="w-16 h-16 text-[#707070]" />
                </div>
              )}
            </div>

            {/* Profile Info */}
            <div className="flex-1">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">
                    {profileUser.artist_name || profileUser.full_name}
                  </h1>
                  <div className="flex items-center gap-3 mb-3">
                    <div className={`flex items-center gap-2 neuro-pressed rounded-xl px-3 py-1.5 ${getTierColor(profileUser.review_tier)}`}>
                      <span className="text-lg">{getTierBadge(profileUser.review_tier)}</span>
                      <span className="text-sm font-medium capitalize">{profileUser.review_tier || 'novice'}</span>
                    </div>
                    <div className="neuro-pressed rounded-xl px-3 py-1.5">
                      <span className="text-sm text-[#a0a0a0]">{profileUser.points || 0} pts</span>
                    </div>
                  </div>
                </div>

                {currentUser && currentUser.id !== profileUser.id && (
                  <Button
                    onClick={handleMessage}
                    className="neuro-base active:neuro-pressed rounded-2xl px-6 py-3 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4 text-[#a0a0a0]" />
                    <span className="text-[#a0a0a0]">Message</span>
                  </Button>
                )}
              </div>

              {/* Bio */}
              {profileUser.bio && (
                <p className="text-sm text-[#909090] leading-relaxed mb-4">
                  {profileUser.bio}
                </p>
              )}

              {/* Stats Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="neuro-pressed rounded-xl p-3 text-center">
                  <Music className="w-5 h-5 text-[#808080] mx-auto mb-1" />
                  <p className="text-xl font-light text-[#b0b0b0]">{tracks.length}</p>
                  <p className="text-xs text-[#707070]">Tracks</p>
                </div>
                <div className="neuro-pressed rounded-xl p-3 text-center">
                  <MessageSquare className="w-5 h-5 text-[#808080] mx-auto mb-1" />
                  <p className="text-xl font-light text-[#b0b0b0]">{profileUser.total_feedback_given || 0}</p>
                  <p className="text-xs text-[#707070]">Reviews</p>
                </div>
                <div className="neuro-pressed rounded-xl p-3 text-center">
                  <Star className="w-5 h-5 text-[#d4af37] mx-auto mb-1" />
                  <p className="text-xl font-light text-[#b0b0b0]">{avgRating}</p>
                  <p className="text-xs text-[#707070]">Avg Rating</p>
                </div>
                <div className="neuro-pressed rounded-xl p-3 text-center">
                  <Trophy className="w-5 h-5 text-[#808080] mx-auto mb-1" />
                  <p className="text-xl font-light text-[#b0b0b0]">{profileUser.badges?.length || 0}</p>
                  <p className="text-xs text-[#707070]">Badges</p>
                </div>
              </div>

              {/* Social Links */}
              {profileUser.social_links && Object.values(profileUser.social_links).some(link => link) && (
                <div className="flex flex-wrap gap-2">
                  {Object.entries(profileUser.social_links).map(([platform, url]) => {
                    if (!url) return null;
                    const icon = getSocialIcon(platform);
                    return (
                      <a
                        key={platform}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="neuro-flat rounded-xl px-3 py-2 flex items-center gap-2 smooth-transition hover:scale-105"
                      >
                        {icon && (
                          <img src={icon} alt={platform} className="w-4 h-4 object-contain" />
                        )}
                        <span className="text-xs text-[#a0a0a0] capitalize">
                          {platform.replace('_', ' ')}
                        </span>
                        <ExternalLink className="w-3 h-3 text-[#707070]" />
                      </a>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Badges Section */}
        {profileUser.badges && profileUser.badges.length > 0 && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h2 className="text-lg font-light text-[#d0d0d0] mb-4 flex items-center gap-2">
              <Award className="w-5 h-5" />
              Achievements & Badges
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {profileUser.badges.map((badge, index) => {
                const info = getBadgeInfo(badge);
                return (
                  <div key={index} className="neuro-flat rounded-2xl p-4 text-center">
                    <div className="text-3xl mb-2">{info.icon}</div>
                    <p className="text-sm font-medium text-[#d0d0d0] mb-1">{info.name}</p>
                    <p className="text-xs text-[#707070]">{info.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Reviewer Stats */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <h2 className="text-lg font-light text-[#d0d0d0] mb-4">Reviewer Statistics</h2>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="neuro-pressed rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare className="w-5 h-5 text-[#808080]" />
                <span className="text-sm text-[#a0a0a0]">Total Reviews</span>
              </div>
              <p className="text-2xl font-light text-[#d0d0d0]">{profileUser.total_feedback_given || 0}</p>
            </div>
            <div className="neuro-pressed rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <Heart className="w-5 h-5 text-[#b09090]" />
                <span className="text-sm text-[#a0a0a0]">Helpful Votes</span>
              </div>
              <p className="text-2xl font-light text-[#d0d0d0]">
                {feedbackGiven.reduce((sum, f) => sum + (f.helpful_votes || 0), 0)}
              </p>
            </div>
            <div className="neuro-pressed rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-2">
                <span className="text-lg">🔥</span>
                <span className="text-sm text-[#a0a0a0]">Current Streak</span>
              </div>
              <p className="text-2xl font-light text-[#d0d0d0]">{profileUser.current_streak || 0} days</p>
              {profileUser.best_streak > 0 && (
                <p className="text-xs text-[#707070] mt-1">Best: {profileUser.best_streak} days</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Reviews Given */}
        {feedbackGiven.length > 0 && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h2 className="text-lg font-light text-[#d0d0d0] mb-4">Recent Reviews</h2>
            <div className="space-y-3">
              {feedbackGiven.slice(0, 5).map((feedback) => (
                <div key={feedback.id} className="neuro-flat rounded-2xl p-4">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <p className="text-sm font-medium text-[#d0d0d0] mb-1">
                        Review on track
                      </p>
                      {feedback.overall_rating && (
                        <div className="flex items-center gap-2 mb-2">
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 ${
                                  star <= Math.round(feedback.overall_rating)
                                    ? 'text-[#d4af37] fill-[#d4af37]'
                                    : 'text-[#404040]'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-xs text-[#a0a0a0]">{feedback.overall_rating.toFixed(1)}/5</span>
                        </div>
                      )}
                      {feedback.content && (
                        <p className="text-xs text-[#808080] line-clamp-2">{feedback.content}</p>
                      )}
                    </div>
                    <span className="text-xs text-[#707070] flex-shrink-0 ml-3">
                      {format(new Date(feedback.created_date), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-[#707070]">
                    <span className="capitalize">{feedback.tier_achieved} tier</span>
                    {feedback.helpful_votes > 0 && (
                      <>
                        <span>•</span>
                        <span className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-[#b09090]" />
                          {feedback.helpful_votes} helpful
                        </span>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tracks */}
        {tracks.length > 0 && (
          <div className="neuro-base rounded-3xl p-6">
            <h2 className="text-lg font-light text-[#d0d0d0] mb-4">Tracks</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {tracks.map((track) => (
                <Link
                  key={track.id}
                  to={createPageUrl("TrackDetails") + `?trackId=${track.id}`}
                  className="neuro-flat rounded-2xl p-4 smooth-transition hover:scale-[1.01]"
                >
                  <div className="flex gap-3">
                    <img
                      src={track.cover_image_url}
                      alt={track.title}
                      className="w-16 h-16 rounded-xl object-cover neuro-pressed"
                      loading="lazy"
                      width="64"
                      height="64"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-[#d0d0d0] mb-1 truncate">
                        {track.title}
                      </h4>
                      <div className="flex gap-3 text-xs text-[#707070] mb-2">
                        <span>{track.total_listens} listens</span>
                        <span>{track.total_votes} votes</span>
                      </div>
                      {track.genres && track.genres.length > 0 && (
                        <div className="flex gap-1 flex-wrap">
                          {track.genres.slice(0, 2).map(genre => (
                            <span
                              key={genre}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#808080]"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
