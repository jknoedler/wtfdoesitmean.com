import React, { useState, useEffect } from "react";
import { api } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Loader2, Music, CheckCircle, XCircle, Clock, ExternalLink, Settings, Play, Pause } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

export default function CuratorDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedStatus, setSelectedStatus] = useState("pending");
  const [selectedGenre, setSelectedGenre] = useState("all");
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [reviewNotes, setReviewNotes] = useState("");
  const [curatorGenres, setCuratorGenres] = useState([]);
  const [newGenre, setNewGenre] = useState("");
  const [newSubGenres, setNewSubGenres] = useState("");

  useEffect(() => {
    document.title = "Curator Dashboard - Soundope";
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const user = await api.auth.me();
      setCurrentUser(user);
      
      // Check if user is curator, admin, or founder
      if (user.role !== 'curator' && user.role !== 'admin' && user.role !== 'founder') {
        navigate(createPageUrl("Discover"));
      }
      
      // Load curator genres if curator
      if (user.role === 'curator') {
        loadCuratorGenres();
      }
    } catch (error) {
      console.error("Error loading user:", error);
      navigate(createPageUrl("Discover"));
    }
  };

  const loadCuratorGenres = async () => {
    try {
      const genres = await api.request('/curator-genres');
      setCuratorGenres(genres || []);
    } catch (error) {
      console.error("Error loading curator genres:", error);
      setCuratorGenres([]);
    }
  };

  // Fetch curator submissions
  const { data: submissions = [], isLoading, refetch } = useQuery({
    queryKey: ['curator-submissions', selectedStatus, selectedGenre],
    queryFn: async () => {
      const filters = {};
      if (selectedStatus !== 'all') {
        filters.status = selectedStatus;
      }
      if (selectedGenre !== 'all') {
        filters.genre = selectedGenre;
      }
      return await api.entities.CuratorSubmission.filter(filters, '-created_date');
    },
    enabled: !!currentUser,
  });

  const reviewMutation = useMutation({
    mutationFn: async ({ submissionId, status, notes }) => {
      return await api.entities.CuratorSubmission.update(submissionId, {
        status,
        notes,
        curator_id: currentUser.id
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['curator-submissions']);
      setSelectedSubmission(null);
      setReviewNotes("");
      refetch();
    },
  });

  const handleApprove = (submission) => {
    reviewMutation.mutate({
      submissionId: submission.id,
      status: 'approved',
      notes: reviewNotes
    });
  };

  const handleReject = (submission) => {
    reviewMutation.mutate({
      submissionId: submission.id,
      status: 'rejected',
      notes: reviewNotes
    });
  };

  const addGenreMutation = useMutation({
    mutationFn: async (genreData) => {
      return await api.request('/curator-genres', {
        method: 'POST',
        body: genreData,
      });
    },
    onSuccess: () => {
      loadCuratorGenres();
      setNewGenre("");
      setNewSubGenres("");
    },
  });

  const handleAddGenre = () => {
    if (!newGenre.trim()) return;
    
    const subGenresArray = newSubGenres
      .split(',')
      .map(s => s.trim())
      .filter(s => s.length > 0);
    
    addGenreMutation.mutate({
      genre: newGenre.trim(),
      sub_genres: subGenresArray
    });
  };

  if (!currentUser) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
      </div>
    );
  }

  const isCurator = currentUser.role === 'curator';
  const isAdminOrFounder = currentUser.role === 'admin' || currentUser.role === 'founder';

  // Get unique genres from submissions
  const allGenres = new Set();
  submissions.forEach(sub => {
    if (Array.isArray(sub.genres)) {
      sub.genres.forEach(g => {
        // Extract main genre (before " - " if sub-genre)
        const mainGenre = g.includes(' - ') ? g.split(' - ')[0] : g;
        allGenres.add(mainGenre);
      });
    }
  });

  return (
    <div className="min-h-screen px-4 py-8 pb-32">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-light text-[#d0d0d0] mb-2">Curator Dashboard</h1>
          <p className="text-sm text-[#808080]">
            {isCurator ? 'Review submissions for your playlists' : 'Review all curator submissions'}
          </p>
        </div>

        {/* Curator Genre Management (only for curators) */}
        {isCurator && (
          <div className="neuro-base rounded-3xl p-6 mb-6">
            <h2 className="text-lg font-medium text-[#d0d0d0] mb-4 flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Manage Your Genres
            </h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-[#808080] mb-2 block">Add Genre</label>
                <div className="flex gap-2">
                  <Input
                    value={newGenre}
                    onChange={(e) => setNewGenre(e.target.value)}
                    placeholder="e.g., Hip Hop, Rock, Electronic"
                    className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl flex-1"
                  />
                  <Button
                    onClick={handleAddGenre}
                    disabled={!newGenre.trim() || addGenreMutation.isPending}
                    className="neuro-base active:neuro-pressed rounded-xl"
                  >
                    Add
                  </Button>
                </div>
              </div>
              <div>
                <label className="text-sm text-[#808080] mb-2 block">Sub-genres (comma-separated, optional)</label>
                <Input
                  value={newSubGenres}
                  onChange={(e) => setNewSubGenres(e.target.value)}
                  placeholder="e.g., Trap, Drill, Boom Bap"
                  className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl"
                />
              </div>
              
              {curatorGenres.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-[#808080] mb-2">Your Genres:</p>
                  <div className="flex flex-wrap gap-2">
                    {curatorGenres.map((cg) => (
                      <div key={cg.id} className="neuro-pressed rounded-xl px-3 py-1 text-sm text-[#d0d0d0]">
                        {cg.genre}
                        {cg.sub_genres && cg.sub_genres.length > 0 && (
                          <span className="text-xs text-[#707070] ml-2">
                            ({cg.sub_genres.length} sub-genres)
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="neuro-base rounded-3xl p-4 mb-6 flex flex-wrap gap-4 items-center">
          <div>
            <label className="text-xs text-[#707070] mb-1 block">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl px-3 py-2 text-sm"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
          
          {allGenres.size > 0 && (
            <div>
              <label className="text-xs text-[#707070] mb-1 block">Genre</label>
              <select
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl px-3 py-2 text-sm"
              >
                <option value="all">All Genres</option>
                {Array.from(allGenres).sort().map(genre => (
                  <option key={genre} value={genre}>{genre}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Submissions List */}
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-[#707070]" />
          </div>
        ) : submissions.length === 0 ? (
          <div className="neuro-base rounded-3xl p-12 text-center">
            <Music className="w-12 h-12 text-[#707070] mx-auto mb-4" />
            <p className="text-sm text-[#808080]">No submissions found</p>
          </div>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="neuro-base rounded-3xl p-6">
                <div className="flex gap-6">
                  {/* Cover Image */}
                  {submission.cover_image_url && (
                    <img
                      src={submission.cover_image_url}
                      alt={submission.title}
                      className="w-24 h-24 rounded-2xl object-cover"
                    />
                  )}
                  
                  {/* Track Info */}
                  <div className="flex-1">
                    <h3 className="text-lg font-medium text-[#d0d0d0] mb-1">
                      {submission.title || 'Untitled'}
                    </h3>
                    <p className="text-sm text-[#808080] mb-3">{submission.artist_name}</p>
                    
                    {/* Genres */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {Array.isArray(submission.genres) && submission.genres.map((genre, idx) => (
                        <span key={idx} className="text-xs neuro-pressed rounded-lg px-2 py-1 text-[#a0a0a0]">
                          {genre}
                        </span>
                      ))}
                    </div>
                    
                    {/* Streaming Links */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {submission.spotify_link && (
                        <a
                          href={submission.spotify_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#808080] hover:text-[#a0a0a0] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Spotify
                        </a>
                      )}
                      {submission.youtube_link && (
                        <a
                          href={submission.youtube_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#808080] hover:text-[#a0a0a0] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          YouTube
                        </a>
                      )}
                      {submission.soundcloud_link && (
                        <a
                          href={submission.soundcloud_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#808080] hover:text-[#a0a0a0] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          SoundCloud
                        </a>
                      )}
                      {submission.apple_music_link && (
                        <a
                          href={submission.apple_music_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#808080] hover:text-[#a0a0a0] flex items-center gap-1"
                        >
                          <ExternalLink className="w-3 h-3" />
                          Apple Music
                        </a>
                      )}
                    </div>
                    
                    {/* Audio Player */}
                    {submission.audio_url && (
                      <div className="mb-3">
                        <audio controls className="w-full">
                          <source src={submission.audio_url} />
                        </audio>
                      </div>
                    )}
                    
                    {/* Status and Date */}
                    <div className="flex items-center gap-4 text-xs text-[#707070]">
                      <span className={`px-2 py-1 rounded-lg ${
                        submission.status === 'approved' ? 'bg-[#1a2a1a] text-[#90b090]' :
                        submission.status === 'rejected' ? 'bg-[#2a1a1a] text-[#b09090]' :
                        'bg-[#1a1a2a] text-[#9090b0]'
                      }`}>
                        {submission.status}
                      </span>
                      <span>{format(new Date(submission.created_at), 'MMM d, yyyy')}</span>
                    </div>
                    
                    {/* Review Notes */}
                    {submission.notes && (
                      <div className="mt-3 p-3 neuro-pressed rounded-xl">
                        <p className="text-xs text-[#808080]">{submission.notes}</p>
                      </div>
                    )}
                  </div>
                  
                  {/* Action Buttons */}
                  {submission.status === 'pending' && (
                    <div className="flex flex-col gap-2">
                      <Button
                        onClick={() => {
                          setSelectedSubmission(submission);
                          setReviewNotes("");
                        }}
                        className="neuro-base active:neuro-pressed rounded-xl px-4 py-2 text-sm"
                      >
                        Review
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Review Modal */}
        {selectedSubmission && (
          <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[200] p-4">
            <div className="neuro-base rounded-3xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <h2 className="text-xl font-medium text-[#d0d0d0] mb-4">Review Submission</h2>
              
              <div className="space-y-4 mb-6">
                <div>
                  <label className="text-sm text-[#808080] mb-2 block">Review Notes (optional)</label>
                  <Textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    placeholder="Add notes about this submission..."
                    className="bg-[#0a0a0a] border-none text-[#d0d0d0] neuro-pressed rounded-xl min-h-[100px]"
                  />
                </div>
              </div>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => handleApprove(selectedSubmission)}
                  disabled={reviewMutation.isPending}
                  className="flex-1 neuro-base active:neuro-pressed rounded-xl py-3 bg-[#1a2a1a] text-[#90b090]"
                >
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Approve
                </Button>
                <Button
                  onClick={() => handleReject(selectedSubmission)}
                  disabled={reviewMutation.isPending}
                  className="flex-1 neuro-base active:neuro-pressed rounded-xl py-3 bg-[#2a1a1a] text-[#b09090]"
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setSelectedSubmission(null);
                    setReviewNotes("");
                  }}
                  className="neuro-flat rounded-xl px-6 py-3 text-[#808080]"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

