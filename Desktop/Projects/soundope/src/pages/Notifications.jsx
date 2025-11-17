import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { Loader2, Bell, MessageSquare, Music, Users, Heart, CheckCircle } from "lucide-react";
import { format } from "date-fns";

export default function Notifications() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await api.auth.me();
    setCurrentUser(user);
  };

  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', currentUser?.id],
    queryFn: () => api.entities.Notification.filter(
      { recipient_id: currentUser.id },
      '-created_date'
    ),
    enabled: !!currentUser,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (notifId) => api.entities.Notification.update(notifId, { is_read: true }),
    onSuccess: () => {
      queryClient.invalidateQueries(['notifications']);
    }
  });

  const handleNotificationClick = (notif) => {
    if (!notif.is_read) {
      markAsReadMutation.mutate(notif.id);
    }
    if (notif.action_url) {
      navigate(notif.action_url);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'feedback_received': return MessageSquare;
      case 'collab_request': return Users;
      case 'collab_accepted': return CheckCircle;
      case 'comment': return MessageSquare;
      case 'vote': return Heart;
      case 'message': return Bell;
      default: return Bell;
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const unreadCount = notifications.filter(n => !n.is_read).length;

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Notifications</h1>
          {unreadCount > 0 && (
            <p className="text-sm text-[#808080]">{unreadCount} unread</p>
          )}
        </div>

        <div className="neuro-base rounded-3xl p-6">
          {notifications.length === 0 ? (
            <div className="text-center py-12">
              <Bell className="w-12 h-12 text-[#606060] mx-auto mb-4" />
              <p className="text-sm text-[#808080]">No notifications yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notif) => {
                const Icon = getIcon(notif.type);
                return (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full rounded-2xl p-4 text-left smooth-transition hover:scale-[1.01] ${
                      notif.is_read ? 'neuro-flat' : 'neuro-pressed'
                    }`}
                  >
                    <div className="flex gap-3">
                      <div className="neuro-flat w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon className="w-5 h-5 text-[#808080]" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="text-sm font-medium text-[#d0d0d0]">{notif.title}</h3>
                          <span className="text-xs text-[#707070]">
                            {format(new Date(notif.created_date), 'MMM d, h:mm a')}
                          </span>
                        </div>
                        <p className="text-xs text-[#808080]">{notif.message}</p>
                        {notif.sender_name && (
                          <p className="text-xs text-[#707070] mt-1">from {notif.sender_name}</p>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}