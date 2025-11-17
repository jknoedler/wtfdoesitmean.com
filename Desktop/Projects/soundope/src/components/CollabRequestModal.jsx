import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Music } from "lucide-react";

export default function CollabRequestModal({ track, onSend, onClose }) {
  const [collabType, setCollabType] = useState("any");
  const [message, setMessage] = useState("");

  const collabTypes = [
    { value: "remix", label: "Remix" },
    { value: "feature", label: "Feature" },
    { value: "production", label: "Production" },
    { value: "any", label: "Any" }
  ];

  const handleSend = () => {
    if (message.trim()) {
      onSend({ collabType, message });
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="neuro-base rounded-3xl p-6 max-w-md w-full">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-light text-[#d0d0d0]">Collab Request</h2>
          <button onClick={onClose} className="neuro-flat rounded-xl p-2">
            <X className="w-5 h-5 text-[#808080]" />
          </button>
        </div>

        {track && (
          <div className="neuro-pressed rounded-2xl p-4 mb-6 flex gap-3">
            <img
              src={track.cover_image_url}
              alt={track.title}
              className="w-16 h-16 rounded-xl object-cover"
            />
            <div>
              <p className="text-sm font-medium text-[#d0d0d0]">{track.title}</p>
              <p className="text-xs text-[#808080]">{track.artist_name}</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <p className="text-sm text-[#808080] mb-3">Collaboration Type</p>
          <div className="grid grid-cols-2 gap-3">
            {collabTypes.map(type => (
              <button
                key={type.value}
                onClick={() => setCollabType(type.value)}
                className={`neuro-base rounded-2xl p-3 text-sm smooth-transition ${
                  collabType === type.value ? 'neuro-pressed text-[#a0a0a0]' : 'text-[#707070]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mb-6">
          <p className="text-sm text-[#808080] mb-3">Your Pitch</p>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell the artist why you'd love to collaborate..."
            className="bg-[#0a0a0a] border-none text-[#d0d0d0] placeholder:text-[#505050] neuro-pressed rounded-2xl min-h-[120px] resize-none"
          />
        </div>

        <Button
          onClick={handleSend}
          disabled={!message.trim()}
          className="w-full neuro-base active:neuro-pressed rounded-2xl py-4"
        >
          <Music className="w-5 h-5 text-[#a0a0a0] mr-2" />
          <span className="text-[#a0a0a0]">Send Request</span>
        </Button>
      </div>
    </div>
  );
}