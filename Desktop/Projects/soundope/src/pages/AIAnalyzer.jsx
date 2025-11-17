
import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Loader2, Sparkles, Music, Brain } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";

export default function AIAnalyzer() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState(null);

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    const user = await api.auth.me();
    setCurrentUser(user);
  };

  const { data: myTracks = [] } = useQuery({
    queryKey: ['my-tracks-analyzer', currentUser?.id],
    queryFn: () => api.entities.Track.filter({ artist_id: currentUser.id }, '-created_date'),
    enabled: !!currentUser,
  });

  const analyzeMutation = useMutation({
    mutationFn: async (track) => {
      // Check if track is MP3
      if (!track.audio_url?.endsWith('.mp3')) {
        throw new Error('Only MP3 files can be analyzed. Please upload an MP3 version of this track.');
      }
      
      setIsAnalyzing(true);
      const response = await api.functions.invoke('cyaniteAnalyze', {
        trackId: track.id,
        audioUrl: track.audio_url
      });
      return response.data;
    },
    onSuccess: (data) => {
      setIsAnalyzing(false);
      setAnalysisResult(data);
      queryClient.invalidateQueries(['my-tracks-analyzer']);
    },
    onError: (error) => {
      setIsAnalyzing(false);
      alert(`Analysis failed: ${error.message}`);
    }
  });

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <div className="neuro-base w-20 h-20 rounded-3xl mx-auto mb-4 flex items-center justify-center">
            <Brain className="w-10 h-10 text-[#a0a0a0]" />
          </div>
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">AI Track Analyzer</h1>
          <p className="text-sm text-[#808080]">Get AI-powered analysis of your tracks (MP3 only)</p>
        </div>

        {analysisResult && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <div className="flex items-center gap-3 mb-4">
              <Sparkles className="w-6 h-6 text-[#90b090]" />
              <h3 className="text-lg font-light text-[#d0d0d0]">Analysis Submitted!</h3>
            </div>
            <p className="text-sm text-[#909090] mb-2">
              {analysisResult.message}
            </p>
            <p className="text-xs text-[#707070]">
              Results will appear on your track page in about 30 seconds via webhook.
            </p>
          </div>
        )}

        <div className="neuro-base rounded-3xl p-6">
          <h2 className="text-lg font-light text-[#d0d0d0] mb-6">Your Tracks</h2>

          {myTracks.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-12 h-12 text-[#606060] mx-auto mb-4" />
              <p className="text-sm text-[#808080]">No tracks uploaded yet</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {myTracks.map((track) => {
                const isMp3 = track.audio_url?.endsWith('.mp3');
                
                return (
                  <div key={track.id} className="neuro-flat rounded-2xl p-4">
                    <button
                      onClick={() => navigate(createPageUrl("TrackDetails") + `?trackId=${track.id}`)}
                      className="flex gap-3 mb-4 w-full text-left hover:opacity-80 transition-opacity"
                    >
                      <img
                        src={track.cover_image_url}
                        alt={track.title}
                        className="w-20 h-20 rounded-xl object-cover neuro-pressed"
                      />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-[#d0d0d0] truncate mb-1">
                          {track.title}
                        </h3>
                        <div className="flex gap-2 flex-wrap mb-2">
                          {track.genres?.slice(0, 2).map(genre => (
                            <span
                              key={genre}
                              className="text-[10px] px-2 py-1 rounded-full bg-[#0a0a0a] text-[#707070]"
                            >
                              {genre}
                            </span>
                          ))}
                        </div>
                        {!isMp3 && (
                          <p className="text-[10px] text-[#a08080]">Not MP3 - cannot analyze</p>
                        )}
                      </div>
                    </button>

                    {track.ai_analysis ? (
                      <div className="neuro-pressed rounded-xl p-3 mb-3">
                        <div className="flex items-center gap-2 mb-2">
                          <Sparkles className="w-4 h-4 text-[#90b090]" />
                          <span className="text-xs text-[#90b090]">Already Analyzed</span>
                        </div>
                        <div className="text-xs text-[#808080] space-y-1">
                          {track.ai_analysis.genres?.length > 0 && (
                            <p>AI Genres: {track.ai_analysis.genres.slice(0, 3).join(', ')}</p>
                          )}
                          {track.ai_analysis.moods?.length > 0 && (
                            <p>AI Moods: {track.ai_analysis.moods.slice(0, 3).join(', ')}</p>
                          )}
                          {track.ai_analysis.tempo && (
                            <p>Tempo: {Math.round(track.ai_analysis.tempo)} BPM</p>
                          )}
                        </div>
                      </div>
                    ) : null}

                    <Button
                      onClick={() => {
                        setSelectedTrack(track);
                        analyzeMutation.mutate(track);
                      }}
                      disabled={!isMp3 || (isAnalyzing && selectedTrack?.id === track.id)}
                      className={`w-full neuro-base active:neuro-pressed rounded-2xl py-3 ${
                        !isMp3 ? 'opacity-40 cursor-not-allowed' : ''
                      }`}
                    >
                      {isAnalyzing && selectedTrack?.id === track.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-[#808080] mr-2" />
                          <span className="text-sm text-[#808080]">Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 text-[#a0a0a0] mr-2" />
                          <span className="text-sm text-[#a0a0a0]">
                            {!isMp3 ? 'MP3 Required' : track.ai_analysis ? 'Re-analyze' : 'Analyze Track'}
                          </span>
                        </>
                      )}
                    </Button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="neuro-pressed rounded-3xl p-6 mt-6">
          <h3 className="text-sm font-medium text-[#d0d0d0] mb-3">About AI Analysis</h3>
          <ul className="space-y-2 text-xs text-[#808080]">
            <li>• AI analyzes tempo, key, energy, danceability, and more</li>
            <li>• Detects genres and moods automatically</li>
            <li>• Analysis takes ~30 seconds to complete</li>
            <li>• Results are saved to your track page</li>
            <li>• Only MP3 files can be analyzed</li>
            <li>• You can re-analyze tracks anytime</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
