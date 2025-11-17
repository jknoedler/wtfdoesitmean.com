import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Trophy, Star, MessageSquare, Heart, TrendingUp, Award, Crown } from "lucide-react";
import { format } from "date-fns";

export default function ReviewerLeaderboard() {
  const [currentUser, setCurrentUser] = useState(null);
  const [timeFilter, setTimeFilter] = useState('all'); // all, month, week

  useEffect(() => {
    loadUser();
    
    // SEO
    document.title = "Top Reviewers & Music Critics Leaderboard | Soundope";
    const metaTags = [
      { type: 'name', key: 'description', content: "Discover the top music reviewers and critics on Soundope. See who's providing the best feedback, earning badges, and helping artists grow." },
      { type: 'name', key: 'keywords', content: "music reviewers leaderboard, top music critics, best feedback givers, music community leaders, reviewer rankings" },
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
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: allUsers = [], isLoading } = useQuery({
    queryKey: ['all-users-leaderboard'],
    queryFn: () => api.entities.User.list(),
  });

  const { data: recentFeedback = [] } = useQuery({
    queryKey: ['recent-feedback-stats'],
    queryFn: () => api.entities.Feedback.list('-created_date', 1000),
  });

  const getTierInfo = (tier) => {
    const tiers = {
      'novice': { icon: '🌱', color: 'text-[#707070]', minPoints: 0 },
      'contributor': { icon: '⭐', color: 'text-[#808080]', minPoints: 100 },
      'critic': { icon: '🎯', color: 'text-[#909090]', minPoints: 500 },
      'connoisseur': { icon: '👑', color: 'text-[#a0a0a0]', minPoints: 1500 },
      'legend': { icon: '🏆', color: 'text-[#b0a090]', minPoints: 5000 }
    };
    return tiers[tier] || tiers['novice'];
  };

  const getBadgeInfo = (badge) => {
    const badges = {
      'early_adopter': { icon: '🌟', name: 'Early Adopter' },
      'feedback_master': { icon: '💬', name: 'Feedback Master' },
      'genre_guru': { icon: '🎵', name: 'Genre Guru' },
      'helpful_critic': { icon: '👍', name: 'Helpful Critic' },
      'community_leader': { icon: '🏆', name: 'Community Leader' },
      'streak_warrior': { icon: '🔥', name: 'Streak Warrior' },
      'collab_connector': { icon: '🤝', name: 'Collab Connector' }
    };
    return badges[badge] || { icon: '🏅', name: badge };
  };

  // Calculate helpful votes for each user
  const userHelpfulVotes = {};
  recentFeedback.forEach(feedback => {
    if (!userHelpfulVotes[feedback.reviewer_id]) {
      userHelpfulVotes[feedback.reviewer_id] = 0;
    }
    userHelpfulVotes[feedback.reviewer_id] += (feedback.helpful_votes || 0);
  });

  // Sort users by points
  const sortedUsers = [...allUsers]
    .filter(user => user.total_feedback_given > 0)
    .sort((a, b) => (b.points || 0) - (a.points || 0));

  // Get top 3 for podium
  const topThree = sortedUsers.slice(0, 3);
  const restOfLeaderboard = sortedUsers.slice(3);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="neuro-base w-24 h-24 rounded-3xl mx-auto mb-6 flex items-center justify-center">
            <Trophy className="w-12 h-12 text-[#d4af37]" />
          </div>
          <h1 className="text-4xl font-light text-[#d0d0d0] mb-3">Reviewer Leaderboard</h1>
          <p className="text-base text-[#808080]">
            Top music reviewers and critics making a difference
          </p>
        </div>

        {/* Tier Progression Info */}
        <div className="neuro-base rounded-3xl p-6 mb-8">
          <h2 className="text-lg font-light text-[#d0d0d0] mb-4 text-center">Reviewer Tiers</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
            {['novice', 'contributor', 'critic', 'connoisseur', 'legend'].map(tier => {
              const info = getTierInfo(tier);
              return (
                <div key={tier} className="neuro-flat rounded-2xl p-4 text-center">
                  <div className="text-3xl mb-2">{info.icon}</div>
                  <p className={`text-sm font-medium capitalize mb-1 ${info.color}`}>{tier}</p>
                  <p className="text-xs text-[#707070]">{info.minPoints}+ pts</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top 3 Podium */}
        {topThree.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-light text-center text-[#d0d0d0] mb-6">Hall of Fame</h2>
            <div className="flex items-end justify-center gap-4 mb-8">
              {/* 2nd Place */}
              {topThree[1] && (
                <Link
                  to={createPageUrl("PublicProfile") + `?userId=${topThree[1].id}`}
                  className="neuro-base rounded-3xl p-6 text-center smooth-transition hover:scale-105 w-48"
                  style={{ marginBottom: '40px' }}
                >
                  <div className="relative mb-4">
                    {topThree[1].profile_image_url ? (
                      <img
                        src={topThree[1].profile_image_url}
                        alt={topThree[1].artist_name}
                        className="w-20 h-20 rounded-2xl object-cover neuro-pressed mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl neuro-pressed mx-auto flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-[#707070]" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 neuro-base rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-lg text-[#c0c0c0]">2</span>
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-[#d0d0d0] mb-1 truncate">
                    {topThree[1].artist_name || topThree[1].full_name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-lg">{getTierInfo(topThree[1].review_tier).icon}</span>
                    <span className="text-xs text-[#a0a0a0] capitalize">{topThree[1].review_tier}</span>
                  </div>
                  <p className="text-xl font-light text-[#c0c0c0] mb-1">{topThree[1].points} pts</p>
                  <p className="text-xs text-[#707070]">{topThree[1].total_feedback_given} reviews</p>
                </Link>
              )}

              {/* 1st Place */}
              <Link
                to={createPageUrl("PublicProfile") + `?userId=${topThree[0].id}`}
                className="neuro-base rounded-3xl p-6 text-center smooth-transition hover:scale-105 w-56 border-2 border-[#d4af37]"
              >
                <div className="relative mb-4">
                  {topThree[0].profile_image_url ? (
                    <img
                      src={topThree[0].profile_image_url}
                      alt={topThree[0].artist_name}
                      className="w-24 h-24 rounded-2xl object-cover neuro-pressed mx-auto"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-2xl neuro-pressed mx-auto flex items-center justify-center">
                      <MessageSquare className="w-12 h-12 text-[#707070]" />
                    </div>
                  )}
                  <div className="absolute -top-3 -right-3 neuro-base rounded-full w-12 h-12 flex items-center justify-center border-2 border-[#d4af37]">
                    <Crown className="w-6 h-6 text-[#d4af37]" />
                  </div>
                </div>
                <h3 className="text-lg font-medium text-[#d0d0d0] mb-1 truncate">
                  {topThree[0].artist_name || topThree[0].full_name}
                </h3>
                <div className="flex items-center justify-center gap-1 mb-2">
                  <span className="text-2xl">{getTierInfo(topThree[0].review_tier).icon}</span>
                  <span className="text-sm text-[#b0a090] capitalize font-medium">{topThree[0].review_tier}</span>
                </div>
                <p className="text-2xl font-light text-[#d4af37] mb-1">{topThree[0].points} pts</p>
                <p className="text-xs text-[#808080]">{topThree[0].total_feedback_given} reviews</p>
              </Link>

              {/* 3rd Place */}
              {topThree[2] && (
                <Link
                  to={createPageUrl("PublicProfile") + `?userId=${topThree[2].id}`}
                  className="neuro-base rounded-3xl p-6 text-center smooth-transition hover:scale-105 w-48"
                  style={{ marginBottom: '40px' }}
                >
                  <div className="relative mb-4">
                    {topThree[2].profile_image_url ? (
                      <img
                        src={topThree[2].profile_image_url}
                        alt={topThree[2].artist_name}
                        className="w-20 h-20 rounded-2xl object-cover neuro-pressed mx-auto"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl neuro-pressed mx-auto flex items-center justify-center">
                        <MessageSquare className="w-10 h-10 text-[#707070]" />
                      </div>
                    )}
                    <div className="absolute -top-2 -right-2 neuro-base rounded-full w-10 h-10 flex items-center justify-center">
                      <span className="text-lg text-[#a08070]">3</span>
                    </div>
                  </div>
                  <h3 className="text-base font-medium text-[#d0d0d0] mb-1 truncate">
                    {topThree[2].artist_name || topThree[2].full_name}
                  </h3>
                  <div className="flex items-center justify-center gap-1 mb-2">
                    <span className="text-lg">{getTierInfo(topThree[2].review_tier).icon}</span>
                    <span className="text-xs text-[#a0a0a0] capitalize">{topThree[2].review_tier}</span>
                  </div>
                  <p className="text-xl font-light text-[#a08070] mb-1">{topThree[2].points} pts</p>
                  <p className="text-xs text-[#707070]">{topThree[2].total_feedback_given} reviews</p>
                </Link>
              )}
            </div>
          </div>
        )}

        {/* Full Leaderboard */}
        <div className="neuro-base rounded-3xl p-6">
          <h2 className="text-xl font-light text-[#d0d0d0] mb-6">All Reviewers</h2>
          <div className="space-y-3">
            {restOfLeaderboard.map((user, index) => {
              const rank = index + 4;
              const tierInfo = getTierInfo(user.review_tier);
              const helpfulCount = userHelpfulVotes[user.id] || 0;
              
              return (
                <Link
                  key={user.id}
                  to={createPageUrl("PublicProfile") + `?userId=${user.id}`}
                  className="neuro-flat rounded-2xl p-4 flex items-center gap-4 smooth-transition hover:scale-[1.01]"
                >
                  {/* Rank */}
                  <div className="neuro-pressed w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                    <span className="text-lg font-light text-[#a0a0a0]">{rank}</span>
                  </div>

                  {/* Profile Image */}
                  <div className="flex-shrink-0">
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.artist_name}
                        className="w-14 h-14 rounded-xl object-cover neuro-pressed"
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-xl neuro-pressed flex items-center justify-center">
                        <MessageSquare className="w-7 h-7 text-[#707070]" />
                      </div>
                    )}
                  </div>

                  {/* User Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-medium text-[#d0d0d0] mb-1 truncate">
                      {user.artist_name || user.full_name}
                    </h3>
                    <div className="flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-1">
                        <span className="text-sm">{tierInfo.icon}</span>
                        <span className={`text-xs capitalize ${tierInfo.color}`}>{user.review_tier}</span>
                      </div>
                      <span className="text-xs text-[#707070]">{user.total_feedback_given} reviews</span>
                      {helpfulCount > 0 && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3 text-[#b09090]" />
                          <span className="text-xs text-[#808080]">{helpfulCount} helpful</span>
                        </div>
                      )}
                      {user.badges && user.badges.length > 0 && (
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-[#808080]" />
                          <span className="text-xs text-[#808080]">{user.badges.length} badges</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div className="neuro-pressed rounded-xl px-4 py-2 flex-shrink-0">
                    <p className="text-lg font-light text-[#b0b0b0]">{user.points}</p>
                    <p className="text-xs text-[#707070]">points</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Current User's Rank */}
        {currentUser && (
          <div className="neuro-base rounded-3xl p-6 mt-6">
            <h3 className="text-lg font-light text-[#d0d0d0] mb-3">Your Ranking</h3>
            <div className="neuro-flat rounded-2xl p-4">
              {(() => {
                const userRank = sortedUsers.findIndex(u => u.id === currentUser.id) + 1;
                const tierInfo = getTierInfo(currentUser.review_tier);
                
                return (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="neuro-pressed w-12 h-12 rounded-xl flex items-center justify-center">
                        <span className="text-lg font-light text-[#a0a0a0]">
                          {userRank > 0 ? `#${userRank}` : 'N/A'}
                        </span>
                      </div>
                      <div>
                        <p className="text-base font-medium text-[#d0d0d0] mb-1">
                          {currentUser.artist_name || currentUser.full_name}
                        </p>
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{tierInfo.icon}</span>
                          <span className={`text-xs capitalize ${tierInfo.color}`}>{currentUser.review_tier}</span>
                          <span className="text-xs text-[#707070]">• {currentUser.total_feedback_given || 0} reviews</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-light text-[#b0b0b0]">{currentUser.points || 0}</p>
                      <p className="text-xs text-[#707070]">points</p>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}