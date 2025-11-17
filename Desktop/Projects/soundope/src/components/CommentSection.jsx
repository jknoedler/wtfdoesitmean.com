import React, { useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, MessageSquare, Send, Flag } from "lucide-react";
import { format } from "date-fns";

export default function CommentSection({ trackId = null, isUniversal = false, maxHeight = "600px" }) {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [commentText, setCommentText] = useState("");

  React.useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
    } catch (error) {
      console.error("Error loading user:", error);
    }
  };

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ['comments', trackId, isUniversal],
    queryFn: async () => {
      if (isUniversal) {
        return await api.entities.Comment.filter({ is_universal: true }, '-created_date');
      } else if (trackId) {
        return await api.entities.Comment.filter({ track_id: trackId, is_universal: false }, '-created_date');
      }
      return [];
    },
    enabled: !!currentUser,
  });

  const postCommentMutation = useMutation({
    mutationFn: async () => {
      const comment = await api.entities.Comment.create({
        track_id: trackId || null,
        user_id: currentUser.id,
        user_name: currentUser.artist_name || currentUser.full_name,
        user_image: currentUser.profile_image_url || null,
        content: commentText,
        is_universal: isUniversal
      });

      // If track-specific comment, notify the artist
      if (trackId && !isUniversal) {
        const tracks = await api.entities.Track.filter({ id: trackId });
        const track = tracks[0];
        
        if (track && track.artist_id !== currentUser.id) {
          await api.entities.Notification.create({
            recipient_id: track.artist_id,
            type: "comment",
            title: "New Comment",
            message: `${currentUser.artist_name || currentUser.full_name} commented on "${track.title}"`,
            sender_id: currentUser.id,
            sender_name: currentUser.artist_name || currentUser.full_name,
            related_id: trackId
          });
        }
      }

      return comment;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['comments']);
      setCommentText("");
    }
  });

  const reportCommentMutation = useMutation({
    mutationFn: async (comment) => {
      // Create report in database FIRST
      await api.entities.Report.create({
        reporter_id: currentUser.id,
        reporter_email: currentUser.email,
        report_type: "Inappropriate Content",
        description: `Comment reported by ${currentUser.email}: "${comment.content}"`,
        target_type: "comment",
        target_id: comment.id,
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
New Comment Report

Reported by: ${currentUser.email}
Comment by: ${comment.user_name}
Comment ID: ${comment.id}

Content:
"${comment.content}"

---
Submitted at: ${pacificTime} PST
View in Moderation Dashboard: ${window.location.origin}/moderation
        `;

        await Promise.all([
          api.integrations.Core.SendEmail({
            to: "jknoedler@soundope.com",
            subject: `[REPORT] Comment - Soundope`,
            body: emailContent
          }),
          api.integrations.Core.SendEmail({
            to: "k.debey@soundope.com",
            subject: `[REPORT] Comment - Soundope`,
            body: emailContent
          })
        ]);
      } catch (emailError) {
        console.error("Failed to send report email, but report was created:", emailError);
      }
    },
    onSuccess: () => {
      alert("Comment reported. Thank you for helping keep Soundope safe.");
    },
    onError: (error) => {
      console.error("Report error:", error);
      alert("Failed to submit report. Please try again.");
    }
  });

  const handlePostComment = () => {
    if (commentText.trim() && commentText.length <= 180) {
      postCommentMutation.mutate();
    }
  };

  const handleReportComment = (comment) => {
    if (confirm("Report this comment as inappropriate?")) {
      reportCommentMutation.mutate(comment);
    }
  };

  if (!currentUser) return null;

  return (
    <div className="neuro-base rounded-3xl p-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="w-5 h-5 text-[#808080]" />
        <h3 className="text-sm font-medium text-[#d0d0d0]">
          {isUniversal ? "Community Chat" : "Comments"}
        </h3>
        <span className="text-xs text-[#606060]">({comments.length})</span>
      </div>

      {/* Comment Input */}
      <div className="mb-4">
        <Textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value.slice(0, 180))}
          placeholder={isUniversal ? "Share your thoughts with the community..." : "Leave a comment..."}
          className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[80px] resize-none mb-2"
        />
        <div className="flex justify-between items-center">
          <span className={`text-xs ${commentText.length >= 180 ? 'text-[#a08080]' : 'text-[#606060]'}`}>
            {commentText.length}/180
          </span>
          <Button
            onClick={handlePostComment}
            disabled={!commentText.trim() || commentText.length > 180 || postCommentMutation.isPending}
            className="neuro-base active:neuro-pressed rounded-2xl px-4 py-2 text-xs"
          >
            {postCommentMutation.isPending ? (
              <Loader2 className="w-4 h-4 animate-spin text-[#808080]" />
            ) : (
              <>
                <Send className="w-4 h-4 text-[#a0a0a0] mr-2" />
                <span className="text-[#a0a0a0]">Post</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Comments List */}
      <div className="space-y-3" style={{ maxHeight, overflowY: 'auto' }}>
        {isLoading ? (
          <div className="text-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-[#707070] mx-auto" />
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-xs text-[#707070]">
              {isUniversal ? "Be the first to comment!" : "No comments yet"}
            </p>
          </div>
        ) : (
          comments.map((comment) => (
            <div key={comment.id} className="neuro-flat rounded-2xl p-3">
              <div className="flex gap-3">
                {comment.user_image ? (
                  <img
                    src={comment.user_image}
                    alt={comment.user_name}
                    width="32"
                    height="32"
                    className="w-8 h-8 rounded-full object-cover neuro-pressed"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full neuro-pressed flex items-center justify-center">
                    <span className="text-xs text-[#707070]">
                      {comment.user_name?.[0]?.toUpperCase() || '?'}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-1">
                    <p className="text-xs font-medium text-[#d0d0d0]">{comment.user_name}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-[#606060]">
                        {format(new Date(comment.created_date), 'MMM d, h:mm a')}
                      </span>
                      {comment.user_id !== currentUser.id && (
                        <button
                          onClick={() => handleReportComment(comment)}
                          disabled={reportCommentMutation.isPending}
                          className="text-[#808080] hover:text-[#a08080] smooth-transition"
                          title="Report comment"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                  <p className="text-xs text-[#a0a0a0] leading-relaxed break-words">
                    {comment.content}
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}