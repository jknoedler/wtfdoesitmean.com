import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Shield, AlertTriangle, CheckCircle, XCircle, Music, MessageSquare, Flag, User, FileText, UserCheck, Trash2, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
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

export default function Moderation() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTab, setSelectedTab] = useState("reports");
  const [selectedStatus, setSelectedStatus] = useState("pending");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);

      // Check localStorage for dev access (avoids database caching issues)
      const hasDevAccess = localStorage.getItem('has_dev_access') === 'true';
      
      // Check if user has dev access OR is an admin
      if (!hasDevAccess && user.role !== 'admin') {
        navigate(createPageUrl("Discover"));
      }
    } catch (error) {
      console.error("Error loading user:", error);
      navigate(createPageUrl("Discover"));
    }
  };

  const { data: reports = [], isLoading: reportsLoading, refetch: refetchReports } = useQuery({
    queryKey: ['moderation-reports', selectedStatus],
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
    enabled: !!currentUser && selectedTab === "reports",
  });

  const { data: claims = [], isLoading: claimsLoading, refetch: refetchClaims } = useQuery({
    queryKey: ['track-claims', selectedStatus],
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
    enabled: !!currentUser && selectedTab === "claims",
  });

  const resolveReportMutation = useMutation({
    mutationFn: (reportId) => api.entities.Report.update(reportId, {
      status: "resolved",
      reviewed_by: currentUser.id,
      reviewed_at: new Date().toISOString()
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-reports']);
      refetchReports();
    }
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (report) => {
      // Delete the comment
      await api.entities.Comment.delete(report.target_id);
      
      // Mark report as resolved
      await api.entities.Report.update(report.id, {
        status: "resolved",
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-reports']);
      refetchReports();
      alert("Comment deleted successfully.");
    },
    onError: (error) => {
      console.error("Delete comment error:", error);
      alert("Failed to delete comment. Please try again.");
    }
  });

  const banUserMutation = useMutation({
    mutationFn: async (report) => {
      // Get all users to find the reporter
      const allUsers = await api.entities.User.list();
      const userToBan = allUsers.find(u => u.id === report.reporter_id);
      
      if (!userToBan) {
        throw new Error("User not found");
      }

      // Update user role to 'banned' or add a banned flag
      // Since we can't modify built-in role field directly in a custom way,
      // we'll add a custom field 'is_banned'
      await api.entities.User.update(report.reporter_id, {
        is_banned: true
      });

      // Also delete the comment if it's a comment report
      if (report.target_type === "comment") {
        try {
          await api.entities.Comment.delete(report.target_id);
        } catch (e) {
          console.error("Failed to delete comment:", e);
        }
      }
      
      // Mark report as resolved
      await api.entities.Report.update(report.id, {
        status: "resolved",
        reviewed_by: currentUser.id,
        reviewed_at: new Date().toISOString()
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['moderation-reports']);
      refetchReports();
      alert("User banned successfully.");
    },
    onError: (error) => {
      console.error("Ban user error:", error);
      alert("Failed to ban user. Please try again.");
    }
  });

  const handleClaimAction = async (claimId, action, adminNotes = "") => {
    try {
      const claim = claims.find(c => c.id === claimId);
      if (!claim) return;

      if (action === "approved") {
        // Update track ownership
        await api.entities.Track.update(claim.track_id, {
          artist_id: claim.claimer_id,
          artist_name: claim.claimer_name
        });

        // Notify the claimer
        await api.entities.Notification.create({
          recipient_id: claim.claimer_id,
          type: "other",
          title: "Track Claim Approved",
          message: `Your ownership claim for "${claim.track_title}" has been approved.`,
          action_url: createPageUrl("TrackDetails") + `?trackId=${claim.track_id}`
        });

        // Notify original artist
        // Only if original artist is different from the claimer
        if (claim.original_artist_id && claim.original_artist_id !== claim.claimer_id) {
          await api.entities.Notification.create({
            recipient_id: claim.original_artist_id,
            type: "other",
            title: "Track Ownership Changed",
            message: `Ownership of "${claim.track_title}" has been transferred to ${claim.claimer_name}.`,
          });
        }
      } else if (action === "rejected") {
        // Notify the claimer
        await api.entities.Notification.create({
          recipient_id: claim.claimer_id,
          type: "other",
          title: "Track Claim Rejected",
          message: `Your ownership claim for "${claim.track_title}" has been rejected.${adminNotes ? ` Reason: ${adminNotes}` : ''}`,
        });
      }

      // Update claim status
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

  const handleDeleteComment = (report) => {
    if (confirm(`Delete this comment permanently?\n\nComment: "${report.description.substring(0, 100)}..."\n\nThis action cannot be undone.`)) {
      deleteCommentMutation.mutate(report);
    }
  };

  const handleBanUser = (report) => {
    if (confirm(`Ban user ${report.reporter_email}?\n\nThis will:\n- Ban the user from the platform\n- Delete the reported comment (if applicable)\n- Mark this report as resolved\n\nThis action cannot be easily undone.`)) {
      banUserMutation.mutate(report);
    }
  };

  const statusCounts = {
    all: reports.length,
    pending: reports.filter(r => r.status === 'pending').length,
    reviewed: reports.filter(r => r.status === 'resolved').length,
    resolved: reports.filter(r => r.status === 'resolved').length,
  };

  const claimStatusCounts = {
    all: claims.length,
    pending: claims.filter(c => c.status === 'pending').length,
    reviewed: claims.filter(c => c.status === 'approved').length,
    resolved: claims.filter(c => c.status === 'rejected').length,
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <div className="neuro-base w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <Shield className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Moderation Dashboard</h1>
          <p className="text-sm text-[#808080]">Review reports and manage content</p>
        </div>

        {/* Back to Dev Dashboard */}
        <div className="flex justify-center mb-8">
          <Button
            onClick={() => navigate(createPageUrl("DevDashboard"))}
            className="neuro-flat rounded-2xl px-6 py-2 text-sm text-[#808080]"
          >
            ← Back to Dashboard
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="neuro-base rounded-3xl p-2 mb-6 flex gap-2">
          <button
            onClick={() => {
              setSelectedTab("reports");
              setSelectedStatus("pending");
            }}
            className={`flex-1 rounded-2xl py-3 flex items-center justify-center gap-2 smooth-transition ${
              selectedTab === "reports" ? 'neuro-pressed' : 'neuro-flat'
            }`}
          >
            <Flag className="w-5 h-5 text-[#808080]" />
            <span className="text-sm text-[#d0d0d0]">Reports</span>
            {reportsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#808080]" />
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#808080]">
                {statusCounts.pending}
              </span>
            )}
          </button>
          <button
            onClick={() => {
              setSelectedTab("claims");
              setSelectedStatus("pending");
            }}
            className={`flex-1 rounded-2xl py-3 flex items-center justify-center gap-2 smooth-transition ${
              selectedTab === "claims" ? 'neuro-pressed' : 'neuro-flat'
            }`}
          >
            <UserCheck className="w-5 h-5 text-[#808080]" />
            <span className="text-sm text-[#d0d0d0]">Track Claims</span>
            {claimsLoading ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#808080]" />
            ) : (
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#1a1a1a] text-[#808080]">
                {claimStatusCounts.pending}
              </span>
            )}
          </button>
        </div>

        {/* Status Filter */}
        <div className="neuro-base rounded-3xl p-4 mb-6">
          <div className="grid grid-cols-4 gap-3">
            {[
              { key: 'all', label: 'All', icon: FileText },
              { key: 'pending', label: 'Pending', icon: AlertTriangle },
              { key: 'reviewed', label: selectedTab === "reports" ? 'Resolved' : 'Approved', icon: CheckCircle },
              { key: 'resolved', label: selectedTab === "reports" ? 'Resolved' : 'Rejected', icon: XCircle },
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
                  key === 'reviewed' && selectedTab === 'reports' ? 'text-[#90b090]' :
                  key === 'reviewed' && selectedTab === 'claims' ? 'text-[#90b090]' :
                  key === 'resolved' && selectedTab === 'reports' ? 'text-[#90b090]' :
                  key === 'resolved' && selectedTab === 'claims' ? 'text-[#b09090]' :
                  'text-[#808080]'
                }`} />
                <div className="text-center">
                  <p className="text-sm text-[#d0d0d0]">{label}</p>
                  <p className="text-xs text-[#707070]">
                    {selectedTab === "reports" ? statusCounts[key] : claimStatusCounts[key]}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Content Area */}
        {selectedTab === "reports" ? (
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
                            title="Mark as Resolved"
                          >
                            <CheckCircle className="w-4 h-4 text-[#90b090]" />
                          </Button>
                          
                          {/* Only show Delete and Ban for comment reports */}
                          {report.target_type === "comment" && (
                            <>
                              <Button
                                onClick={() => handleDeleteComment(report)}
                                disabled={deleteCommentMutation.isPending}
                                className="neuro-base active:neuro-pressed rounded-xl p-2"
                                title="Delete Comment"
                              >
                                {deleteCommentMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-[#808080]" />
                                ) : (
                                  <Trash2 className="w-4 h-4 text-[#b09090]" />
                                )}
                              </Button>
                              <Button
                                onClick={() => handleBanUser(report)}
                                disabled={banUserMutation.isPending}
                                className="neuro-base active:neuro-pressed rounded-xl p-2"
                                title="Ban User"
                              >
                                {banUserMutation.isPending ? (
                                  <Loader2 className="w-4 h-4 animate-spin text-[#808080]" />
                                ) : (
                                  <Ban className="w-4 h-4 text-[#a08080]" />
                                )}
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                    <p className="text-sm text-[#a0a0a0] mb-2">{report.description}</p>
                    {report.target_type !== 'general' && (
                      <p className="text-xs text-[#707070]">
                        Target: {report.target_type} ({report.target_id})
                      </p>
                    )}
                    {report.status !== 'pending' && report.reviewed_at && (
                      <p className="text-xs text-[#606060] mt-2">
                        Status: {report.status} {report.reviewed_by && `by ${report.reviewed_by}`} on {formatPacificTime(report.reviewed_at)}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
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
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="neuro-pressed w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                          <UserCheck className="w-5 h-5 text-[#808080]" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <p className="text-sm font-medium text-[#d0d0d0]">
                              {claim.claimer_name}
                            </p>
                            <span className={`text-xs px-3 py-1 rounded-full capitalize ${
                              claim.status === 'pending' ? 'bg-[#1a1a1a] text-[#a0a090]' :
                              claim.status === 'approved' ? 'bg-[#1a2a1a] text-[#90b090]' :
                              'bg-[#2a1a1a] text-[#b09090]'
                            }`}>
                              {claim.status}
                            </span>
                          </div>
                          <p className="text-xs text-[#808080] mb-1">
                            Email: {claim.claimer_email}
                          </p>
                        </div>
                      </div>
                      <p className="text-xs text-[#707070]">
                        {formatPacificTime(claim.created_date)}
                      </p>
                    </div>

                    <div className="neuro-pressed rounded-xl p-4 mb-4">
                      <div className="mb-3">
                        <p className="text-xs text-[#707070] mb-1">Track:</p>
                        <p className="text-sm text-[#d0d0d0]">{claim.track_title}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-[#707070] mb-1">Current Artist:</p>
                        <p className="text-sm text-[#d0d0d0]">{claim.original_artist_name || 'N/A'}</p>
                      </div>
                      <div className="mb-3">
                        <p className="text-xs text-[#707070] mb-1">Reason:</p>
                        <p className="text-sm text-[#a0a0a0]">{claim.reason}</p>
                      </div>
                      {claim.proof_url && (
                        <div>
                          <p className="text-xs text-[#707070] mb-1">Proof:</p>
                          <a
                            href={claim.proof_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[#808080] hover:text-[#a0a0a0] underline"
                          >
                            {claim.proof_url}
                          </a>
                        </div>
                      )}
                    </div>

                    {claim.status === 'pending' && (
                      <div className="flex gap-3">
                        <Button
                          onClick={() => {
                            const notes = prompt("Add admin notes (optional):");
                            handleClaimAction(claim.id, "approved", notes || "");
                          }}
                          className="flex-1 neuro-base active:neuro-pressed rounded-xl py-3 flex items-center justify-center gap-2"
                        >
                          <CheckCircle className="w-4 h-4 text-[#90b090]" />
                          <span className="text-sm text-[#90b090]">Approve & Transfer</span>
                        </Button>
                        <Button
                          onClick={() => {
                            const notes = prompt("Rejection reason:");
                            if (notes) handleClaimAction(claim.id, "rejected", notes);
                            else alert("Rejection reason is required.");
                          }}
                          className="flex-1 neuro-base active:neuro-pressed rounded-xl py-3 flex items-center justify-center gap-2"
                        >
                          <XCircle className="w-4 h-4 text-[#b09090]" />
                          <span className="text-sm text-[#b09090]">Reject</span>
                        </Button>
                      </div>
                    )}

                    {claim.admin_notes && (
                      <div className="mt-4 neuro-pressed rounded-xl p-3">
                        <p className="text-xs text-[#707070] mb-1">Admin Notes:</p>
                        <p className="text-sm text-[#a0a0a0]">{claim.admin_notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}