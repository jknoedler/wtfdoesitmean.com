
import React, { useEffect, useState } from "react";
import { api } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Archive as ArchiveIcon } from "lucide-react";
import { format } from "date-fns";

export default function Archive() {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
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

  const { data: logs = [], isLoading } = useQuery({
    queryKey: ['archive-logs', currentUser?.id],
    queryFn: () => api.entities.ArchiveLog.filter({ user_id: currentUser.id }, '-created_date'),
    enabled: !!currentUser,
  });

  const getActionIcon = (actionType) => {
    return "•";
  };

  const getActionLabel = (actionType) => {
    const labels = {
      track_upload: "Uploaded Track",
      feedback_given: "Left Feedback",
      vote_cast: "Voted",
      collab_request: "Sent Collab Request",
      collab_accepted: "Accepted Collab",
      supporter_unlock: "Unlocked Content",
      boost_applied: "Boosted Track",
      badge_earned: "Earned Badge",
      tier_upgrade: "Tier Upgrade"
    };
    return labels[actionType] || actionType;
  };

  if (isLoading || !currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <div className="neuro-base w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <ArchiveIcon className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Activity Archive</h1>
          <p className="text-sm text-[#808080]">Your complete interaction history</p>
        </div>

        <div className="neuro-base rounded-3xl p-6">
          {logs.length === 0 ? (
            <div className="text-center py-12">
              <ArchiveIcon className="w-12 h-12 text-[#606060] mx-auto mb-4" />
              <p className="text-sm text-[#808080]">No activity yet. Start engaging with music!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log, index) => (
                <div key={log.id} className="relative">
                  {index < logs.length - 1 && (
                    <div className="absolute left-5 top-12 bottom-0 w-px bg-[#1a1a1a]" />
                  )}
                  
                  <div className="neuro-flat rounded-2xl p-4 relative z-10">
                    <div className="flex gap-4">
                      <div className="neuro-pressed w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0">
                        <span className="text-[#808080]">{getActionIcon(log.action_type)}</span>
                      </div>
                      
                      <div className="flex-1">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-sm font-medium text-[#d0d0d0]">
                            {getActionLabel(log.action_type)}
                          </h3>
                          <span className="text-xs text-[#707070]">
                            {format(new Date(log.created_date), 'MMM d, h:mm a')}
                          </span>
                        </div>

                        {log.metadata && (
                          <div className="text-xs text-[#808080] space-y-1">
                            {log.metadata.track_title && (
                              <p>Track: {log.metadata.track_title}</p>
                            )}
                            {log.metadata.artist_name && (
                              <p>Artist: {log.metadata.artist_name}</p>
                            )}
                            {log.metadata.sentiment && (
                              <p className="capitalize">Sentiment: {log.metadata.sentiment}</p>
                            )}
                            {log.metadata.tier && (
                              <p className="capitalize">Tier: {log.metadata.tier}</p>
                            )}
                          </div>
                        )}

                        {log.points_earned > 0 && (
                          <div className="mt-2 inline-block px-3 py-1 rounded-full bg-[#1a1a1a]">
                            <span className="text-xs text-[#a0a0a0]">
                              +{log.points_earned} points
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
