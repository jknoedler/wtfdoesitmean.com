import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, ArrowLeft, Flag } from "lucide-react";
import { format } from "date-fns";

export default function Inbox() {
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedThread, setSelectedThread] = useState(null);
  const [messageText, setMessageText] = useState("");

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await api.auth.me();
    setCurrentUser(user);
  };

  const { data: messages = [] } = useQuery({
    queryKey: ['messages', currentUser?.id],
    queryFn: async () => {
      const sent = await api.entities.Message.filter({ sender_id: currentUser.id });
      const received = await api.entities.Message.filter({ recipient_id: currentUser.id });
      return [...sent, ...received].sort((a, b) => 
        new Date(b.created_date) - new Date(a.created_date)
      );
    },
    enabled: !!currentUser,
  });

  // Group messages into threads
  const threads = messages.reduce((acc, msg) => {
    const threadId = msg.thread_id || msg.id;
    if (!acc[threadId]) {
      acc[threadId] = [];
    }
    acc[threadId].push(msg);
    return acc;
  }, {});

  const threadList = Object.entries(threads).map(([threadId, msgs]) => {
    const sorted = msgs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    const latest = sorted[0];
    const otherUserId = latest.sender_id === currentUser?.id ? latest.recipient_id : latest.sender_id;
    const otherUserName = latest.sender_id === currentUser?.id ? latest.recipient_name : latest.sender_name;
    const unreadCount = msgs.filter(m => !m.is_read && m.recipient_id === currentUser?.id).length;
    
    return {
      threadId,
      messages: sorted,
      otherUserId,
      otherUserName,
      latestMessage: latest.content,
      latestDate: latest.created_date,
      unreadCount
    };
  }).sort((a, b) => new Date(b.latestDate) - new Date(a.latestDate));

  const sendMessageMutation = useMutation({
    mutationFn: async () => {
      const thread = selectedThread.messages[0];
      const recipientId = thread.sender_id === currentUser.id ? thread.recipient_id : thread.sender_id;
      const recipientName = thread.sender_id === currentUser.id ? thread.recipient_name : thread.sender_name;
      
      return await api.entities.Message.create({
        sender_id: currentUser.id,
        sender_name: currentUser.artist_name || currentUser.full_name,
        recipient_id: recipientId,
        recipient_name: recipientName,
        content: messageText,
        thread_id: selectedThread.threadId
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['messages']);
      setMessageText("");
    }
  });

  const reportMessageMutation = useMutation({
    mutationFn: async (message) => {
      // Create report in database
      await api.entities.Report.create({
        reporter_id: currentUser.id,
        reporter_email: currentUser.email,
        report_type: "Harassment",
        description: `Message reported by ${currentUser.email}: "${message.content}"`,
        target_type: "message",
        target_id: message.id,
        status: "pending"
      });

      // Send email notifications
      const emailContent = `
New Message Report

Reported by: ${currentUser.email}
Message from: ${message.sender_name}
Message ID: ${message.id}

Content:
"${message.content}"

---
Submitted at: ${new Date().toLocaleString()}
View in Moderation Dashboard: ${window.location.origin}/moderation
      `;

      await Promise.all([
        api.integrations.Core.SendEmail({
          to: "jknoedler@soundope.com",
          subject: `[REPORT] Message - Soundope`,
          body: emailContent
        }),
        api.integrations.Core.SendEmail({
          to: "k.debey@soundope.com",
          subject: `[REPORT] Message - Soundope`,
          body: emailContent
        })
      ]);
    },
    onSuccess: () => {
      alert("Message reported. Thank you for helping keep Soundope safe.");
    },
    onError: () => {
      alert("Failed to submit report. Please try again.");
    }
  });

  const handleReportMessage = (message) => {
    if (confirm("Report this message as inappropriate?")) {
      reportMessageMutation.mutate(message);
    }
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  if (selectedThread) {
    return (
      <div className="min-h-screen flex flex-col">
        <div className="neuro-base p-4 flex items-center gap-3 sticky top-0 z-10">
          <button
            onClick={() => setSelectedThread(null)}
            className="neuro-flat rounded-xl p-2"
          >
            <ArrowLeft className="w-5 h-5 text-[#808080]" />
          </button>
          <h2 className="text-lg font-light text-[#d0d0d0]">{selectedThread.otherUserName}</h2>
        </div>

        <div className="flex-1 p-4 space-y-4 pb-24">
          {selectedThread.messages.map((msg) => {
            const isMine = msg.sender_id === currentUser.id;
            return (
              <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                <div className="max-w-[80%]">
                  <div className={`${isMine ? 'neuro-pressed' : 'neuro-flat'} rounded-2xl p-4`}>
                    <p className="text-sm text-[#d0d0d0] mb-2">{msg.content}</p>
                    <div className="flex justify-between items-center gap-2">
                      <p className="text-xs text-[#707070]">
                        {format(new Date(msg.created_date), 'MMM d, h:mm a')}
                      </p>
                      {!isMine && (
                        <button
                          onClick={() => handleReportMessage(msg)}
                          disabled={reportMessageMutation.isPending}
                          className="text-[#808080] hover:text-[#a08080] smooth-transition"
                          title="Report message"
                        >
                          <Flag className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="fixed bottom-20 left-0 right-0 neuro-base p-4">
          <div className="flex gap-3 max-w-4xl mx-auto">
            <Input
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-2xl"
              onKeyPress={(e) => e.key === 'Enter' && messageText.trim() && sendMessageMutation.mutate()}
            />
            <Button
              onClick={() => sendMessageMutation.mutate()}
              disabled={!messageText.trim()}
              className="neuro-base active:neuro-pressed rounded-2xl px-6"
            >
              <Send className="w-5 h-5 text-[#a0a0a0]" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-light mb-8 text-[#d0d0d0] text-center">Messages</h1>

        <div className="neuro-base rounded-3xl p-6">
          {threadList.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-sm text-[#808080]">No messages yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {threadList.map((thread) => (
                <button
                  key={thread.threadId}
                  onClick={() => setSelectedThread(thread)}
                  className="w-full neuro-flat rounded-2xl p-4 text-left smooth-transition hover:scale-[1.01]"
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-sm font-medium text-[#d0d0d0]">{thread.otherUserName}</h3>
                    <span className="text-xs text-[#707070]">
                      {format(new Date(thread.latestDate), 'MMM d')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-[#808080] truncate flex-1">
                      {thread.latestMessage}
                    </p>
                    {thread.unreadCount > 0 && (
                      <span className="ml-2 w-5 h-5 rounded-full bg-[#505050] text-[#d0d0d0] text-xs flex items-center justify-center">
                        {thread.unreadCount}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}