import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Bell, MessageSquare, MessageCircle, Music, CheckCircle, XCircle, Clock, TrendingUp } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function Dashboard() {
  const navigate = useNavigate();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    document.title = "Dashboard - Soundope";
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      if (!user) {
        navigate(createPageUrl("Login"));
        return;
      }
      setCurrentUser(user);
    } catch (error) {
      navigate(createPageUrl("Login"));
    }
  };

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['dashboard-notifications', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return await api.entities.Notification.filter(
        { recipient_id: currentUser.id },
        '-created_date',
        20
      );
    },
    enabled: !!currentUser,
  });

  // Fetch messages
  const { data: messages = [] } = useQuery({
    queryKey: ['dashboard-messages', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      const sent = await api.entities.Message.filter({ sender_id: currentUser.id });
      const received = await api.entities.Message.filter({ recipient_id: currentUser.id });
      return [...sent, ...received].sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      ).slice(0, 20);
    },
    enabled: !!currentUser,
  });

  // Fetch feedback received
  const { data: feedback = [] } = useQuery({
    queryKey: ['dashboard-feedback', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return await api.entities.Feedback.filter(
        { artist_id: currentUser.id },
        '-created_date',
        20
      );
    },
    enabled: !!currentUser,
  });

  // Fetch playlist submissions
  const { data: submissions = [] } = useQuery({
    queryKey: ['dashboard-submissions', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return await api.entities.PlaylistSubmission.filter(
        { user_id: currentUser.id },
        '-created_date',
        50
      );
    },
    enabled: !!currentUser,
  });

  // Fetch tracks
  const { data: tracks = [] } = useQuery({
    queryKey: ['dashboard-tracks', currentUser?.id],
    queryFn: async () => {
      if (!currentUser) return [];
      return await api.entities.Track.filter(
        { artist_id: currentUser.id },
        '-created_at',
        50
      );
    },
    enabled: !!currentUser,
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-32 pt-24 md:pt-32">
      <div className="max-w-6xl mx-auto">
        <div className="flex gap-6">
          <div className="flex-1">
            {/* Profile Picture Header */}
            {currentUser?.profile_image_url && (
              <div className="flex justify-center mb-6">
                <img
                  src={currentUser.profile_image_url}
                  alt={currentUser.artist_name || currentUser.full_name}
                  className="w-24 h-24 rounded-full object-cover neuro-pressed border-4 border-[#1a1a1a]"
                />
              </div>
            )}
            
            <div className="text-center mb-8">
              <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Dashboard</h1>
              <p className="text-sm text-[#808080]">Your activity and updates</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
          {/* Notifications */}
          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#d0d0d0] flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Notifications
              </h2>
              <Link
                to={createPageUrl("Notifications")}
                className="text-xs text-[#808080] hover:text-[#a0a0a0]"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <p className="text-sm text-[#707070] text-center py-4">No notifications</p>
              ) : (
                notifications.map((notif) => (
                  <div key={notif.id} className="neuro-flat rounded-xl p-3">
                    <p className="text-sm text-[#d0d0d0]">{notif.message || notif.content}</p>
                    <p className="text-xs text-[#707070] mt-1">
                      {formatDistanceToNow(new Date(notif.created_date), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages */}
          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#d0d0d0] flex items-center gap-2">
                <MessageSquare className="w-5 h-5" />
                Messages
              </h2>
              <Link
                to={createPageUrl("Inbox")}
                className="text-xs text-[#808080] hover:text-[#a0a0a0]"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-sm text-[#707070] text-center py-4">No messages</p>
              ) : (
                messages.map((msg) => (
                  <div key={msg.id} className="neuro-flat rounded-xl p-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <p className="text-xs text-[#a0a0a0] mb-1">
                          {msg.sender_id === currentUser.id ? 'To' : 'From'}: {msg.sender_id === currentUser.id ? msg.recipient_name : msg.sender_name}
                        </p>
                        <p className="text-sm text-[#d0d0d0] line-clamp-2">{msg.content}</p>
                      </div>
                      {!msg.is_read && msg.recipient_id === currentUser.id && (
                        <div className="w-2 h-2 rounded-full bg-[#a0a0a0] ml-2 mt-1"></div>
                      )}
                    </div>
                    <p className="text-xs text-[#707070] mt-1">
                      {formatDistanceToNow(new Date(msg.created_date), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Feedback Received */}
          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#d0d0d0] flex items-center gap-2">
                <MessageCircle className="w-5 h-5" />
                Feedback Received
              </h2>
              <Link
                to={createPageUrl("ReceivedFeedback")}
                className="text-xs text-[#808080] hover:text-[#a0a0a0]"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {feedback.length === 0 ? (
                <p className="text-sm text-[#707070] text-center py-4">No feedback yet</p>
              ) : (
                feedback.map((fb) => (
                  <div key={fb.id} className="neuro-flat rounded-xl p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className={`text-xs px-2 py-1 rounded ${
                        fb.feedback_type === 'praise' ? 'bg-[#1a2a1a] text-[#90b090]' :
                        fb.feedback_type === 'constructive' ? 'bg-[#2a1a1a] text-[#b09090]' :
                        'bg-[#1a1a1a] text-[#808080]'
                      }`}>
                        {fb.feedback_type}
                      </span>
                    </div>
                    <p className="text-sm text-[#d0d0d0] line-clamp-2">{fb.comment || fb.feedback_text}</p>
                    <p className="text-xs text-[#707070] mt-1">
                      {formatDistanceToNow(new Date(fb.created_date), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Playlist Submissions */}
          <div className="neuro-base rounded-3xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#d0d0d0] flex items-center gap-2">
                <Music className="w-5 h-5" />
                Playlist Submissions
              </h2>
              <Link
                to={createPageUrl("SpotifyPlaylists")}
                className="text-xs text-[#808080] hover:text-[#a0a0a0]"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {submissions.length === 0 ? (
                <p className="text-sm text-[#707070] text-center py-4">No submissions yet</p>
              ) : (
                submissions.map((sub) => (
                  <div key={sub.id} className="neuro-flat rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <p className="text-sm font-medium text-[#d0d0d0]">{sub.playlist_name || 'Playlist'}</p>
                      {sub.status === 'approved' ? (
                        <CheckCircle className="w-4 h-4 text-[#90b090]" />
                      ) : sub.status === 'rejected' ? (
                        <XCircle className="w-4 h-4 text-[#b09090]" />
                      ) : (
                        <Clock className="w-4 h-4 text-[#808080]" />
                      )}
                    </div>
                    <p className="text-xs text-[#707070]">
                      {sub.status === 'approved' ? 'Approved' : 
                       sub.status === 'rejected' ? 'Rejected' : 
                       'Pending Review'}
                    </p>
                    <p className="text-xs text-[#707070] mt-1">
                      {formatDistanceToNow(new Date(sub.created_date), { addSuffix: true })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Your Tracks */}
          <div className="neuro-base rounded-3xl p-6 md:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-[#d0d0d0] flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Your Tracks
              </h2>
              <Link
                to={createPageUrl("MyTracks")}
                className="text-xs text-[#808080] hover:text-[#a0a0a0]"
              >
                View All
              </Link>
            </div>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {tracks.length === 0 ? (
                <p className="text-sm text-[#707070] text-center py-4">No tracks uploaded yet</p>
              ) : (
                tracks.map((track) => (
                  <Link
                    key={track.id}
                    to={createPageUrl("TrackDetails") + `?trackId=${track.id}`}
                    className="neuro-flat rounded-xl p-3 block smooth-transition hover:scale-[1.01]"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#d0d0d0]">{track.title}</p>
                        <p className="text-xs text-[#707070] mt-1">
                          {track.total_votes || 0} votes • {track.total_listens || 0} listens
                        </p>
                      </div>
                      <div className="text-xs text-[#606060]">
                        {formatDistanceToNow(new Date(track.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

