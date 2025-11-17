import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { Button } from "@/components/ui/button";
import { Loader2, Download, User, Music, MessageSquare, ExternalLink, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function UserExport() {
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({}); // Store full data for each user
  const [isLoading, setIsLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUsers, setExpandedUsers] = useState(new Set());

  useEffect(() => {
    document.title = "User Export - Soundope";
    loadAllUsers();
  }, []);

  const loadAllUsers = async () => {
    try {
      setIsLoading(true);
      const allUsers = await api.entities.User.list();
      setUsers(allUsers);
      
      // Load detailed data for each user
      const detailedData = {};
      for (const user of allUsers) {
        try {
          const [tracks, comments, feedbackGiven, feedbackReceived] = await Promise.all([
            api.entities.Track.filter({ artist_id: user.id }).catch(() => []),
            api.entities.Comment.filter({ user_id: user.id }).catch(() => []),
            api.entities.Feedback.filter({ reviewer_id: user.id }).catch(() => []),
            api.entities.Feedback.filter({ artist_id: user.id }).catch(() => [])
          ]);
          
          detailedData[user.id] = {
            tracks,
            comments,
            feedbackGiven,
            feedbackReceived
          };
        } catch (error) {
          console.error(`Error loading data for user ${user.id}:`, error);
          detailedData[user.id] = {
            tracks: [],
            comments: [],
            feedbackGiven: [],
            feedbackReceived: []
          };
        }
      }
      
      setUserData(detailedData);
      setIsLoading(false);
    } catch (error) {
      console.error("Error loading users:", error);
      setIsLoading(false);
    }
  };

  const toggleUserExpansion = (userId) => {
    const newExpanded = new Set(expandedUsers);
    if (newExpanded.has(userId)) {
      newExpanded.delete(userId);
    } else {
      newExpanded.add(userId);
    }
    setExpandedUsers(newExpanded);
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

  const exportToJSON = () => {
    setIsExporting(true);
    
    try {
      const exportData = users.map(user => {
        const data = userData[user.id] || {
          tracks: [],
          comments: [],
          feedbackGiven: [],
          feedbackReceived: []
        };
        
        return {
          user: {
            id: user.id,
            email: user.email,
            artist_name: user.artist_name,
            full_name: user.full_name,
            profile_image_url: user.profile_image_url,
            bio: user.bio,
            social_links: user.social_links,
            points: user.points,
            review_tier: user.review_tier,
            badges: user.badges,
            total_feedback_given: user.total_feedback_given,
            total_tracks: user.total_tracks,
            standard_credits: user.standard_credits,
            premium_credits: user.premium_credits,
            monthly_votes_remaining: user.monthly_votes_remaining,
            current_streak: user.current_streak,
            best_streak: user.best_streak,
            created_date: user.created_date,
            updated_date: user.updated_date,
            // Include all other user properties
            ...Object.keys(user).reduce((acc, key) => {
              if (!acc[key]) acc[key] = user[key];
              return acc;
            }, {})
          },
          tracks: data.tracks,
          comments: data.comments,
          feedbackGiven: data.feedbackGiven,
          feedbackReceived: data.feedbackReceived
        };
      });

      const jsonString = JSON.stringify(exportData, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `soundope-users-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      setIsExporting(false);
    } catch (error) {
      console.error("Export error:", error);
      alert("Failed to export data. Please try again.");
      setIsExporting(false);
    }
  };

  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const artistName = (user.artist_name || '').toLowerCase();
    const fullName = (user.full_name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return artistName.includes(query) || fullName.includes(query) || email.includes(query);
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#707070] mx-auto mb-4" />
          <p className="text-sm text-[#808080]">Loading all users and their data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="neuro-base rounded-3xl p-6 mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">User Export</h1>
              <p className="text-sm text-[#808080]">
                View and export all user profiles, tracks, comments, and feedback
              </p>
            </div>
            <Button
              onClick={exportToJSON}
              disabled={isExporting}
              className="neuro-base active:neuro-pressed rounded-2xl px-6 py-3 flex items-center gap-2"
            >
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-[#a0a0a0]" />
                  <span className="text-[#a0a0a0]">Exporting...</span>
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 text-[#a0a0a0]" />
                  <span className="text-[#a0a0a0]">Export All Data (JSON)</span>
                </>
              )}
            </Button>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-[#707070]" />
            <Input
              type="text"
              placeholder="Search by artist name, full name, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 neuro-pressed rounded-2xl border-none bg-[#0a0a0a] text-[#d0d0d0] placeholder:text-[#505050]"
            />
          </div>

          <div className="mt-4 text-sm text-[#707070]">
            Showing {filteredUsers.length} of {users.length} users
          </div>
        </div>

        {/* Users List */}
        <div className="space-y-4">
          {filteredUsers.map((user) => {
            const data = userData[user.id] || {
              tracks: [],
              comments: [],
              feedbackGiven: [],
              feedbackReceived: []
            };
            const isExpanded = expandedUsers.has(user.id);

            return (
              <div key={user.id} className="neuro-base rounded-3xl p-6">
                {/* User Header */}
                <div className="flex items-start gap-4 mb-4">
                  <div className="flex-shrink-0">
                    {user.profile_image_url ? (
                      <img
                        src={user.profile_image_url}
                        alt={user.artist_name || user.full_name}
                        className="w-20 h-20 rounded-2xl object-cover neuro-pressed"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-2xl neuro-pressed flex items-center justify-center">
                        <User className="w-10 h-10 text-[#707070]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div>
                        <h3 className="text-xl font-light text-[#d0d0d0] mb-1">
                          {user.artist_name || user.full_name || 'Unnamed User'}
                        </h3>
                        {user.full_name && user.artist_name && (
                          <p className="text-sm text-[#808080]">{user.full_name}</p>
                        )}
                        <p className="text-xs text-[#606060] mt-1">{user.email}</p>
                      </div>
                      <Button
                        onClick={() => toggleUserExpansion(user.id)}
                        className="neuro-flat rounded-xl px-4 py-2 text-xs"
                      >
                        {isExpanded ? 'Collapse' : 'Expand'}
                      </Button>
                    </div>

                    {/* Quick Stats */}
                    <div className="flex flex-wrap gap-3 mb-3">
                      <div className="neuro-pressed rounded-xl px-3 py-1.5 flex items-center gap-2">
                        <Music className="w-4 h-4 text-[#808080]" />
                        <span className="text-xs text-[#a0a0a0]">{data.tracks.length} tracks</span>
                      </div>
                      <div className="neuro-pressed rounded-xl px-3 py-1.5 flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-[#808080]" />
                        <span className="text-xs text-[#a0a0a0]">{data.comments.length} comments</span>
                      </div>
                      <div className="neuro-pressed rounded-xl px-3 py-1.5">
                        <span className="text-xs text-[#a0a0a0]">{data.feedbackGiven.length} reviews given</span>
                      </div>
                      <div className="neuro-pressed rounded-xl px-3 py-1.5">
                        <span className="text-xs text-[#a0a0a0]">{data.feedbackReceived.length} reviews received</span>
                      </div>
                      {user.points !== undefined && (
                        <div className="neuro-pressed rounded-xl px-3 py-1.5">
                          <span className="text-xs text-[#a0a0a0]">{user.points} points</span>
                        </div>
                      )}
                      {user.review_tier && (
                        <div className="neuro-pressed rounded-xl px-3 py-1.5">
                          <span className="text-xs text-[#a0a0a0] capitalize">{user.review_tier} tier</span>
                        </div>
                      )}
                    </div>

                    {/* Bio */}
                    {user.bio && (
                      <p className="text-sm text-[#909090] mb-3 line-clamp-2">{user.bio}</p>
                    )}

                    {/* Social Links */}
                    {user.social_links && Object.values(user.social_links).some(link => link) && (
                      <div className="flex flex-wrap gap-2 mb-3">
                        {Object.entries(user.social_links).map(([platform, url]) => {
                          if (!url) return null;
                          const icon = getSocialIcon(platform);
                          return (
                            <a
                              key={platform}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="neuro-flat rounded-xl px-3 py-1.5 flex items-center gap-2 smooth-transition hover:scale-105"
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

                {/* Expanded Details */}
                {isExpanded && (
                  <div className="mt-4 space-y-4 border-t border-[#1a1a1a] pt-4">
                    {/* User Details */}
                    <div className="neuro-pressed rounded-2xl p-4">
                      <h4 className="text-sm font-medium text-[#d0d0d0] mb-3">User Details</h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                        <div>
                          <span className="text-[#707070]">ID:</span>
                          <p className="text-[#a0a0a0] font-mono">{user.id}</p>
                        </div>
                        <div>
                          <span className="text-[#707070]">Email:</span>
                          <p className="text-[#a0a0a0]">{user.email}</p>
                        </div>
                        <div>
                          <span className="text-[#707070]">Created:</span>
                          <p className="text-[#a0a0a0]">
                            {user.created_date ? new Date(user.created_date).toLocaleDateString() : 'N/A'}
                          </p>
                        </div>
                        {user.standard_credits !== undefined && (
                          <div>
                            <span className="text-[#707070]">Standard Credits:</span>
                            <p className="text-[#a0a0a0]">{user.standard_credits || 0}</p>
                          </div>
                        )}
                        {user.premium_credits !== undefined && (
                          <div>
                            <span className="text-[#707070]">Premium Credits:</span>
                            <p className="text-[#a0a0a0]">{user.premium_credits || 0}</p>
                          </div>
                        )}
                        {user.badges && user.badges.length > 0 && (
                          <div className="col-span-2 md:col-span-3">
                            <span className="text-[#707070]">Badges:</span>
                            <div className="flex flex-wrap gap-2 mt-1">
                              {user.badges.map((badge, idx) => (
                                <span key={idx} className="text-xs px-2 py-1 rounded-full bg-[#1a1a1a] text-[#808080]">
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Tracks */}
                    {data.tracks.length > 0 && (
                      <div className="neuro-pressed rounded-2xl p-4">
                        <h4 className="text-sm font-medium text-[#d0d0d0] mb-3">
                          Tracks ({data.tracks.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {data.tracks.map((track) => (
                            <div key={track.id} className="neuro-flat rounded-xl p-3 flex gap-3">
                              {track.cover_image_url && (
                                <img
                                  src={track.cover_image_url}
                                  alt={track.title}
                                  className="w-12 h-12 rounded-lg object-cover"
                                />
                              )}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-[#d0d0d0] truncate">{track.title}</p>
                                <div className="flex gap-3 text-xs text-[#707070] mt-1">
                                  <span>{track.total_listens || 0} listens</span>
                                  <span>{track.total_votes || 0} votes</span>
                                  {track.genres && track.genres.length > 0 && (
                                    <span>{track.genres.join(', ')}</span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Comments */}
                    {data.comments.length > 0 && (
                      <div className="neuro-pressed rounded-2xl p-4">
                        <h4 className="text-sm font-medium text-[#d0d0d0] mb-3">
                          Comments ({data.comments.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {data.comments.slice(0, 10).map((comment) => (
                            <div key={comment.id} className="neuro-flat rounded-xl p-3">
                              <p className="text-xs text-[#a0a0a0] mb-1 line-clamp-2">{comment.content}</p>
                              <p className="text-xs text-[#606060]">
                                {comment.track_id ? `Track: ${comment.track_id}` : 'Universal'} •{' '}
                                {comment.created_date
                                  ? new Date(comment.created_date).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          ))}
                          {data.comments.length > 10 && (
                            <p className="text-xs text-[#606060] text-center">
                              ...and {data.comments.length - 10} more comments
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Feedback Given */}
                    {data.feedbackGiven.length > 0 && (
                      <div className="neuro-pressed rounded-2xl p-4">
                        <h4 className="text-sm font-medium text-[#d0d0d0] mb-3">
                          Reviews Given ({data.feedbackGiven.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {data.feedbackGiven.slice(0, 5).map((feedback) => (
                            <div key={feedback.id} className="neuro-flat rounded-xl p-3">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs text-[#a0a0a0] line-clamp-2">
                                  {feedback.content || 'No content'}
                                </p>
                                {feedback.overall_rating && (
                                  <span className="text-xs text-[#808080] ml-2">
                                    {feedback.overall_rating}/5
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#606060]">
                                Track: {feedback.track_id} •{' '}
                                {feedback.created_date
                                  ? new Date(feedback.created_date).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          ))}
                          {data.feedbackGiven.length > 5 && (
                            <p className="text-xs text-[#606060] text-center">
                              ...and {data.feedbackGiven.length - 5} more reviews
                            </p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Feedback Received */}
                    {data.feedbackReceived.length > 0 && (
                      <div className="neuro-pressed rounded-2xl p-4">
                        <h4 className="text-sm font-medium text-[#d0d0d0] mb-3">
                          Reviews Received ({data.feedbackReceived.length})
                        </h4>
                        <div className="space-y-2 max-h-64 overflow-y-auto">
                          {data.feedbackReceived.slice(0, 5).map((feedback) => (
                            <div key={feedback.id} className="neuro-flat rounded-xl p-3">
                              <div className="flex justify-between items-start mb-1">
                                <p className="text-xs text-[#a0a0a0] line-clamp-2">
                                  {feedback.content || 'No content'}
                                </p>
                                {feedback.overall_rating && (
                                  <span className="text-xs text-[#808080] ml-2">
                                    {feedback.overall_rating}/5
                                  </span>
                                )}
                              </div>
                              <p className="text-xs text-[#606060]">
                                From: {feedback.reviewer_id} • Track: {feedback.track_id} •{' '}
                                {feedback.created_date
                                  ? new Date(feedback.created_date).toLocaleDateString()
                                  : 'N/A'}
                              </p>
                            </div>
                          ))}
                          {data.feedbackReceived.length > 5 && (
                            <p className="text-xs text-[#606060] text-center">
                              ...and {data.feedbackReceived.length - 5} more reviews
                            </p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <p className="text-sm text-[#808080]">No users found matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}

