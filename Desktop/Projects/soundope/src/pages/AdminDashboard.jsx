import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Shield, Music, CheckCircle, XCircle, Clock, ExternalLink, Download, User, MessageSquare, Search, Flag, AlertTriangle, FileText, UserCheck, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { format } from "date-fns";

// Helper function to format dates in Pacific timezone
const formatPacificTime = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleString('en-US', {
    timeZone: 'America/Los_Angeles',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
};

export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("all");
  const [activeTab, setActiveTab] = useState("playlists"); // 'playlists', 'reports', 'claims', 'export', 'roles'
  const [selectedTab, setSelectedTab] = useState("reports");
  const [roleSearchQuery, setRoleSearchQuery] = useState("");
  const [roleUsers, setRoleUsers] = useState([]);
  const [isLoadingRoles, setIsLoadingRoles] = useState(false);
  const [users, setUsers] = useState([]);
  const [userData, setUserData] = useState({});
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
      
      // Check if user is admin or founder
      if (user.role !== 'admin' && user.role !== 'founder') {
        navigate(createPageUrl("Discover"));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      navigate(createPageUrl("Discover"));
    }
  };

  // Playlist Submissions
  const { data: submissions = [], isLoading: submissionsLoading, refetch: refetchSubmissions } = useQuery({
    queryKey: ['admin-playlist-submissions', selectedStatus],
    queryFn: async () => {
      if (selectedStatus === "all") {
        return await api.entities.PlaylistSubmission.list('-created_date');
      } else {
        return await api.entities.PlaylistSubmission.filter(
          { status: selectedStatus },
          '-created_date'
        );
      }
    },
    enabled: !!currentUser && activeTab === "playlists",
  });

  // Reports
  const { data: reports = [], isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['admin-reports', selectedStatus],
    queryFn: async () => {
      if (selectedStatus === "all") {
        return await api.entities.Report.list('-created_date');
      } else {
        return await api.entities.Report.filter(
          { status: selectedStatus },
          '-created_date'
        );
      }
    },
    enabled: !!currentUser && activeTab === "reports",
  });

  // Track Claims
  const { data: claims = [], isLoading: claimsLoading, refetch: refetchClaims } = useQuery({
    queryKey: ['admin-track-claims', selectedStatus],
    queryFn: async () => {
      if (selectedStatus === "all") {
        return await api.entities.TrackClaim.list('-created_date');
      } else if (selectedStatus === "pending") {
        return await api.entities.TrackClaim.filter({ status: "pending" }, '-created_date');
      } else if (selectedStatus === "reviewed") {
        return await api.entities.TrackClaim.filter({ status: "approved" }, '-created_date');
      } else if (selectedStatus === "resolved") {
        return await api.entities.TrackClaim.filter({ status: "rejected" }, '-created_date');
      }
      return [];
    },
    enabled: !!currentUser && activeTab === "claims",
  });

  const handleStatusUpdate = async (submissionId, newStatus) => {
    try {
      await api.entities.PlaylistSubmission.update(submissionId, {
        status: newStatus
      });
      refetchSubmissions();
    } catch (error) {
      console.error("Error updating submission:", error);
      alert("Failed to update submission status");
    }
  };

  const resolveReportMutation = useMutation({
    mutationFn: (reportId) => api.entities.Report.update(reportId, {
      status: "resolved",
      reviewed_by: currentUser.id,
      reviewed_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports']);
      refetchReports();
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (report) => {
      await api.entities.Comment.delete(report.target_id);
      await api.entities.Report.update(report.id, {
        status: "resolved",
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports']);
      refetchReports();
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async (report) => {
      await api.entities.User.update(report.reporter_id, { disabled: true });
      if (report.target_type === "comment") {
        await api.entities.Comment.delete(report.target_id);
      }
      await api.entities.Report.update(report.id, {
        status: "resolved",
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-reports']);
      refetchReports();
    }
  });

  const handleClaimAction = async (claimId, action, adminNotes = '') => {
    try {
      const claim = claims.find(c => c.id === claimId);
      if (!claim) return;

      if (action === 'approved') {
        await api.entities.Notification.create({
          recipient_id: claim.claimer_id,
          type: 'track_claim_approved',
          title: "Track Claim Approved",
          message: `Your ownership claim for "${claim.track_title}" has been approved!`,
        });
      } else if (action === 'rejected') {
        await api.entities.Notification.create({
          recipient_id: claim.claimer_id,
          type: 'track_claim_rejected',
          title: "Track Claim Rejected",
          message: `Your ownership claim for "${claim.track_title}" has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`,
        });
      }

      await api.entities.TrackClaim.update(claimId, {
        status: action,
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString(),
        admin_notes: adminNotes || null
      });

      refetchClaims();
    } catch (error) {
      console.error("Error handling claim:", error);
      alert("Failed to process claim. Please try again.");
    }
  };

  // User Export Functions
  const loadAllUsers = async () => {
    try {
      setIsLoadingUsers(true);
      const allUsers = await api.entities.User.list();
      setUsers(allUsers);
      
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
      setIsLoadingUsers(false);
    } catch (error) {
      console.error("Error loading users:", error);
      setIsLoadingUsers(false);
    }
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

  useEffect(() => {
    if (activeTab === 'export' && users.length === 0 && !isLoadingUsers) {
      loadAllUsers();
    }
  }, [activeTab]);

  const filteredUsers = users.filter(user => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    const artistName = (user.artist_name || '').toLowerCase();
    const fullName = (user.full_name || '').toLowerCase();
    const email = (user.email || '').toLowerCase();
    return artistName.includes(query) || fullName.includes(query) || email.includes(query);
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const submissionStatusCounts = {
    all: submissions.length,
    pending: submissions.filter(s => s.status === 'pending').length,
    approved: submissions.filter(s => s.status === 'approved').length,
    rejected: submissions.filter(s => s.status === 'rejected').length,
  };

  const reportStatusCounts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  const claimStatusCounts = {
    all: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    reviewed: claims.filter(c => c.status === 'approved').length,
    resolved: claims.filter(c => c.status === 'rejected').length,
  };

  return (
    <div className="min-h-screen px-4 py-8 pb-32 pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="neuro-base w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Admin Dashboard</h1>
          <p className="text-sm text-[#808080]">Manage submissions, reports, and platform content</p>
        </div>

        {/* Main Tabs */}
        <div className="neuro-base rounded-3xl p-2 mb-6 flex gap-2">
          <button
            onClick={() => {
              setActiveTab("playlists");
              setSelectedStatus("pending");
            }}
            className={`flex-1 rounded-2xl px-4 py-3 smooth-transition ${
              activeTab === "playlists" ? "neuro-pressed" : "neuro-flat"
            }`}
          >
            <span className={`text-sm ${activeTab === "playlists" ? "text-[#d0d0d0]" : "text-[#808080]"}`}>
              Playlist Submissions
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("reports");
              setSelectedStatus("pending");
            }}
            className={`flex-1 rounded-2xl px-4 py-3 smooth-transition ${
              activeTab === "reports" ? "neuro-pressed" : "neuro-flat"
            }`}
          >
            <span className={`text-sm ${activeTab === "reports" ? "text-[#d0d0d0]" : "text-[#808080]"}`}>
              Reports
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("claims");
              setSelectedStatus("pending");
            }}
            className={`flex-1 rounded-2xl px-4 py-3 smooth-transition ${
              activeTab === "claims" ? "neuro-pressed" : "neuro-flat"
            }`}
          >
            <span className={`text-sm ${activeTab === "claims" ? "text-[#d0d0d0]" : "text-[#808080]"}`}>
              Track Claims
            </span>
          </button>
          <button
            onClick={() => {
              setActiveTab("export");
            }}
            className={`flex-1 rounded-2xl px-4 py-3 smooth-transition ${
              activeTab === "export" ? "neuro-pressed" : "neuro-flat"
            }`}
          >
            <span className={`text-sm ${activeTab === "export" ? "text-[#d0d0d0]" : "text-[#808080]"}`}>
              User Export
            </span>
          </button>
        </div>

        {/* Playlist Submissions Tab */}
        {activeTab === "playlists" && (
          <>
            {/* Status Filter */}
            <div className="neuro-base rounded-3xl p-4 mb-6">
              <div className="flex gap-3">
                {[
                  { key: 'all', label: 'All', icon: Music },
                  { key: 'pending', label: 'Pending', icon: Clock },
                  { key: 'approved', label: 'Approved', icon: CheckCircle },
                  { key: 'rejected', label: 'Rejected', icon: XCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`flex-1 rounded-2xl p-3 flex flex-col items-center gap-2 smooth-transition ${
                      selectedStatus === key ? 'neuro-pressed' : 'neuro-flat'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      key === 'pending' ? 'text-[#a0a090]' :
                      key === 'approved' ? 'text-[#90b090]' :
                      key === 'rejected' ? 'text-[#b09090]' :
                      'text-[#808080]'
                    }`} />
                    <div className="text-center">
                      <p className="text-sm text-[#d0d0d0]">{label}</p>
                      <p className="text-xs text-[#707070]">{submissionStatusCounts[key]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Submissions List */}
            <div className="neuro-base rounded-3xl p-6">
              <h2 className="text-lg font-light text-[#d0d0d0] mb-6">
                Playlist Submissions
              </h2>

              {submissionsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
                </div>
              ) : submissions.length === 0 ? (
                <div className="text-center py-12">
                  <Music className="w-12 h-12 text-[#606060] mx-auto mb-4" />
                  <p className="text-sm text-[#808080]">No submissions yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {submissions.map((submission) => (
                    <div key={submission.id} className="neuro-flat rounded-2xl p-4">
                      <div className="flex items-start gap-4">
                        <div className="neuro-pressed w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                          <img
                            src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/6904b6d46257f14ce2e4440b/a0741ee01_IMG_2529.jpeg"
                            alt="Spotify"
                            className="w-6 h-6 object-contain"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-[#d0d0d0] truncate">
                                {submission.user_name}
                              </p>
                              <p className="text-xs text-[#808080]">
                                {submission.playlist_name}
                              </p>
                            </div>
                            <span className={`text-xs px-3 py-1 rounded-full flex-shrink-0 ml-2 ${
                              submission.status === 'pending' ? 'bg-[#1a1a1a] text-[#a0a090]' :
                              submission.status === 'approved' ? 'bg-[#1a2a1a] text-[#90b090]' :
                              'bg-[#2a1a1a] text-[#b09090]'
                            }`}>
                              {submission.status}
                            </span>
                          </div>

                          <a
                            href={submission.spotify_track_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-[#808080] hover:text-[#a0a0a0] flex items-center gap-1 mb-3 w-fit"
                          >
                            <span className="truncate">{submission.spotify_track_url}</span>
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                          </a>

                          <p className="text-xs text-[#606060] mb-3">
                            Submitted: {new Date(submission.created_date).toLocaleDateString()} at {new Date(submission.created_date).toLocaleTimeString()}
                          </p>

                          {submission.status === 'pending' && (
                            <div className="flex gap-2">
                              <Button
                                onClick={() => handleStatusUpdate(submission.id, 'approved')}
                                className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 flex items-center gap-2"
                              >
                                <CheckCircle className="w-4 h-4 text-[#90b090]" />
                                <span className="text-xs text-[#90b090]">Approve</span>
                              </Button>
                              <Button
                                onClick={() => handleStatusUpdate(submission.id, 'rejected')}
                                className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 flex items-center gap-2"
                              >
                                <XCircle className="w-4 h-4 text-[#b09090]" />
                                <span className="text-xs text-[#b09090]">Reject</span>
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Reports Tab */}
        {activeTab === "reports" && (
          <>
            <div className="neuro-base rounded-3xl p-4 mb-6">
              <div className="grid grid-cols-3 gap-3">
                {[
                  { key: 'all', label: 'All', icon: FileText },
                  { key: 'pending', label: 'Pending', icon: AlertTriangle },
                  { key: 'resolved', label: 'Resolved', icon: CheckCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`flex-1 rounded-2xl p-3 flex flex-col items-center gap-2 smooth-transition ${
                      selectedStatus === key ? 'neuro-pressed' : 'neuro-flat'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      key === 'pending' ? 'text-[#a0a090]' :
                      key === 'resolved' ? 'text-[#90b090]' :
                      'text-[#808080]'
                    }`} />
                    <div className="text-center">
                      <p className="text-sm text-[#d0d0d0]">{label}</p>
                      <p className="text-xs text-[#707070]">{reportStatusCounts[key]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="neuro-base rounded-3xl p-6">
              <h2 className="text-lg font-light text-[#d0d0d0] mb-6">Content Reports</h2>

              {reportsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
                </div>
              ) : reports.length === 0 ? (
                <div className="text-center py-12">
                  <Flag className="w-12 h-12 text-[#606060] mx-auto mb-4" />
                  <p className="text-sm text-[#808080]">No reports to display</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div key={report.id} className="neuro-flat rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#d0d0d0] mb-1">{report.report_type}</p>
                          <p className="text-xs text-[#808080]">
                            From: {report.reporter_email} • {formatPacificTime(report.created_date)}
                          </p>
                        </div>
                        {report.status === 'pending' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={() => {
                                if (confirm('Mark this report as resolved?')) {
                                  resolveReportMutation.mutate(report.id);
                                }
                              }}
                              className="neuro-base active:neuro-pressed rounded-xl p-2"
                            >
                              <CheckCircle className="w-4 h-4 text-[#90b090]" />
                            </Button>
                            
                            {report.target_type === "comment" && (
                              <>
                                <Button
                                  onClick={() => {
                                    if (confirm(`Delete this comment permanently?\n\nComment: "${report.description.substring(0, 100)}..."\n\nThis action cannot be undone.`)) {
                                      deleteCommentMutation.mutate(report);
                                    }
                                  }}
                                  disabled={deleteCommentMutation.isPending}
                                  className="neuro-base active:neuro-pressed rounded-xl p-2"
                                >
                                  <Trash2 className="w-4 h-4 text-[#b09090]" />
                                </Button>
                                <Button
                                  onClick={() => {
                                    if (confirm(`Ban user ${report.reporter_email}?\n\nThis will:\n- Ban the user from the platform\n- Delete the reported comment (if applicable)\n- Mark this report as resolved\n\nThis action cannot be easily undone.`)) {
                                      banUserMutation.mutate(report);
                                    }
                                  }}
                                  disabled={banUserMutation.isPending}
                                  className="neuro-base active:neuro-pressed rounded-xl p-2"
                                >
                                  <Ban className="w-4 h-4 text-[#b09090]" />
                                </Button>
                              </>
                            )}
                          </div>
                        )}
                      </div>
                      <p className="text-sm text-[#d0d0d0] mb-2">{report.description}</p>
                      <p className="text-xs text-[#707070]">
                        Status: <span className={report.status === 'pending' ? 'text-[#a0a090]' : 'text-[#90b090]'}>{report.status}</span>
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Track Claims Tab */}
        {activeTab === "claims" && (
          <>
            <div className="neuro-base rounded-3xl p-4 mb-6">
              <div className="grid grid-cols-4 gap-3">
                {[
                  { key: 'all', label: 'All', icon: FileText },
                  { key: 'pending', label: 'Pending', icon: AlertTriangle },
                  { key: 'reviewed', label: 'Approved', icon: CheckCircle },
                  { key: 'resolved', label: 'Rejected', icon: XCircle },
                ].map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setSelectedStatus(key)}
                    className={`flex-1 rounded-2xl p-3 flex flex-col items-center gap-2 smooth-transition ${
                      selectedStatus === key ? 'neuro-pressed' : 'neuro-flat'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      key === 'pending' ? 'text-[#a0a090]' :
                      key === 'reviewed' ? 'text-[#90b090]' :
                      key === 'resolved' ? 'text-[#b09090]' :
                      'text-[#808080]'
                    }`} />
                    <div className="text-center">
                      <p className="text-sm text-[#d0d0d0]">{label}</p>
                      <p className="text-xs text-[#707070]">{claimStatusCounts[key]}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="neuro-base rounded-3xl p-6">
              <h2 className="text-lg font-light text-[#d0d0d0] mb-6">Track Ownership Claims</h2>

              {claimsLoading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
                </div>
              ) : claims.length === 0 ? (
                <div className="text-center py-12">
                  <UserCheck className="w-12 h-12 text-[#606060] mx-auto mb-4" />
                  <p className="text-sm text-[#808080]">No claims to display</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {claims.map((claim) => (
                    <div key={claim.id} className="neuro-flat rounded-2xl p-5">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <p className="text-sm font-medium text-[#d0d0d0] mb-1">{claim.track_title}</p>
                          <p className="text-xs text-[#808080]">
                            Claimed by: {claim.claimer_name} ({claim.claimer_email})
                          </p>
                          <p className="text-xs text-[#808080]">
                            Original artist: {claim.original_artist_name}
                          </p>
                          {claim.reason && (
                            <p className="text-sm text-[#d0d0d0] mt-2">{claim.reason}</p>
                          )}
                          {claim.proof_url && (
                            <a
                              href={claim.proof_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-xs text-[#808080] hover:text-[#a0a0a0] flex items-center gap-1 mt-1"
                            >
                              <span>Proof: {claim.proof_url}</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                        {claim.status === 'pending' && (
                          <div className="flex gap-2 flex-shrink-0">
                            <Button
                              onClick={() => {
                                if (confirm(`Approve this ownership claim for "${claim.track_title}"?`)) {
                                  handleClaimAction(claim.id, 'approved');
                                }
                              }}
                              className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 flex items-center gap-2"
                            >
                              <CheckCircle className="w-4 h-4 text-[#90b090]" />
                              <span className="text-xs text-[#90b090]">Approve</span>
                            </Button>
                            <Button
                              onClick={() => {
                                const reason = prompt('Rejection reason (optional):');
                                handleClaimAction(claim.id, 'rejected', reason || '');
                              }}
                              className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 flex items-center gap-2"
                            >
                              <XCircle className="w-4 h-4 text-[#b09090]" />
                              <span className="text-xs text-[#b09090]">Reject</span>
                            </Button>
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[#707070]">
                        Status: <span className={claim.status === 'pending' ? 'text-[#a0a090]' : claim.status === 'approved' ? 'text-[#90b090]' : 'text-[#b09090]'}>{claim.status}</span>
                        {' • '}
                        Submitted: {formatPacificTime(claim.created_date)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* User Export Tab */}
        {activeTab === "export" && (
          <div className="space-y-6">
            <div className="neuro-base rounded-3xl p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
                <div>
                  <h2 className="text-xl font-light text-[#d0d0d0] mb-2">User Data Export</h2>
                  <p className="text-sm text-[#808080]">
                    Export all user profiles, tracks, comments, and feedback to JSON
                  </p>
                </div>
                <Button
                  onClick={exportToJSON}
                  disabled={isExporting || isLoadingUsers || users.length === 0}
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
                {isLoadingUsers ? (
                  <span>Loading users...</span>
                ) : (
                  <span>Showing {filteredUsers.length} of {users.length} users</span>
                )}
              </div>
            </div>

            {isLoadingUsers ? (
              <div className="text-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-[#707070] mx-auto mb-4" />
                <p className="text-sm text-[#808080]">Loading all users and their data...</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredUsers.map((user) => {
                  const data = userData[user.id] || {
                    tracks: [],
                    comments: [],
                    feedbackGiven: [],
                    feedbackReceived: []
                  };

                  return (
                    <div key={user.id} className="neuro-base rounded-3xl p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0">
                          {user.profile_image_url ? (
                            <img
                              src={user.profile_image_url}
                              alt={user.artist_name || user.full_name}
                              className="w-16 h-16 rounded-2xl object-cover neuro-pressed"
                            />
                          ) : (
                            <div className="w-16 h-16 rounded-2xl neuro-pressed flex items-center justify-center">
                              <User className="w-8 h-8 text-[#707070]" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-light text-[#d0d0d0] mb-1">
                            {user.artist_name || user.full_name || 'Unnamed User'}
                          </h3>
                          {user.full_name && user.artist_name && (
                            <p className="text-sm text-[#808080]">{user.full_name}</p>
                          )}
                          <p className="text-xs text-[#606060] mt-1">{user.email}</p>

                          <div className="flex flex-wrap gap-2 mt-3">
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
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {!isLoadingUsers && filteredUsers.length === 0 && (
              <div className="text-center py-12">
                <p className="text-sm text-[#808080]">No users found matching your search.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

