import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, MessageSquare, TrendingUp, Sparkles } from "lucide-react";
import { User } from "@supabase/supabase-js";
import mascotImage from "@/assets/mascot.png";

interface LeaderboardEntry {
  id: string;
  user_id: string;
  user_name: string;
  score: number;
  comment: string | null;
  rating: number | null;
  created_at: string;
}

const Leaderboard = () => {
  const { toast } = useToast();
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const [userEntry, setUserEntry] = useState<LeaderboardEntry | null>(null);
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);
  const [currentScore, setCurrentScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [editName, setEditName] = useState("");

  useEffect(() => {
    loadUser();
    loadLeaderboard();
  }, []);

  const loadUser = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      setUser(user);
      loadUserScore(user.id);
      loadUserEntry(user.id);
    }
  };

  const loadUserScore = async (userId: string) => {
    const { data, error } = await supabase
      .from('user_learning_profiles')
      .select('total_points, user_name')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setCurrentScore(data.total_points || 0);
      setEditName(data.user_name || "");
    }
  };

  const loadUserEntry = async (userId: string) => {
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (data) {
      setUserEntry(data);
      setComment(data.comment || "");
      setRating(data.rating || 0);
    }
  };

  const loadLeaderboard = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('leaderboard_entries')
      .select('*')
      .order('score', { ascending: false })
      .limit(100);

    if (error) {
      toast({
        title: "Error loading leaderboard",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setEntries(data || []);
    }
    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!user) {
      toast({
        title: "Please log in",
        description: "You need to be logged in to submit to the leaderboard",
        variant: "destructive",
      });
      return;
    }

    if (rating === 0) {
      toast({
        title: "Rating required",
        description: "Please provide a rating before submitting",
        variant: "destructive",
      });
      return;
    }

    if (!editName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter your name before submitting",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);

    // Update user name in profile if changed
    await supabase
      .from('user_learning_profiles')
      .update({ user_name: editName.trim() })
      .eq('user_id', user.id);

    const userName = editName.trim();

    if (userEntry) {
      // Update existing entry
      const { error } = await supabase
        .from('leaderboard_entries')
        .update({
          score: currentScore,
          comment: comment.trim() || null,
          rating,
        })
        .eq('user_id', user.id);

      if (error) {
        toast({
          title: "Error updating entry",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Entry updated!",
          description: "Your leaderboard entry has been updated successfully",
        });
        loadLeaderboard();
        loadUserEntry(user.id);
      }
    } else {
      // Insert new entry
      const { error } = await supabase
        .from('leaderboard_entries')
        .insert({
          user_id: user.id,
          user_name: userName,
          score: currentScore,
          comment: comment.trim() || null,
          rating,
        });

      if (error) {
        toast({
          title: "Error submitting entry",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Submitted to leaderboard!",
          description: "Your score has been added to the leaderboard",
        });
        loadLeaderboard();
        loadUserEntry(user.id);
      }
    }

    setSubmitting(false);
  };

  const handleDeleteComment = async () => {
    if (!user || !userEntry) return;

    const { error } = await supabase
      .from('leaderboard_entries')
      .update({ comment: null })
      .eq('user_id', user.id);

    if (error) {
      toast({
        title: "Error deleting comment",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Comment deleted",
        description: "Your comment has been removed",
      });
      setComment("");
      // Update local state immediately
      setEntries(entries.map(entry => 
        entry.user_id === user.id 
          ? { ...entry, comment: null }
          : entry
      ));
      loadUserEntry(user.id);
    }
  };


  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-110' : ''}`}
          >
            <Star
              className={`h-5 w-5 ${
                star <= count
                  ? 'fill-amber-400 text-amber-400'
                  : 'fill-none text-muted-foreground/30'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50/30 via-background to-slate-50/20">
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        {/* Header */}
        <div className="text-center py-4">
          <div className="flex items-center justify-center gap-3 mb-2">
            <img src={mascotImage} alt="Mascot" className="w-12 h-12" />
            <h1 className="text-3xl font-bold text-foreground">
              Leaderboard
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            See how you rank among top learners
          </p>
        </div>

        {/* Submit Score Card */}
        <Card className="p-6 bg-card border shadow-sm">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary" />
                Your Score
              </h2>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-lg shadow-md">
                <TrendingUp className="h-4 w-4" />
                <span className="text-xl font-bold">{currentScore}</span>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-3 py-2 text-sm rounded-lg border bg-background focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
                  Rate Your Experience *
                </label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block flex items-center justify-between text-muted-foreground">
                  <span>Share Your Thoughts</span>
                  {userEntry?.comment && (
                    <button
                      onClick={handleDeleteComment}
                      className="text-xs text-destructive hover:underline font-medium"
                    >
                      Delete Comment
                    </button>
                  )}
                </label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us about your learning experience..."
                  className="min-h-[80px] text-sm rounded-lg"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-1">
                  {comment.length}/500 characters
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || rating === 0 || !editName.trim()}
                className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold py-5 rounded-lg shadow-md hover:shadow-lg transition-all"
              >
                {userEntry ? "Update Entry" : "Submit to Leaderboard"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : entries.length === 0 ? (
            <Card className="p-12 text-center">
              <p className="text-muted-foreground">No entries yet. Be the first to submit your score!</p>
            </Card>
          ) : (
            <>
              {/* Top 3 Podium */}
              {entries.length >= 1 && (
                <div className="flex items-end justify-center gap-2 mb-6 px-4">
                  {/* 2nd Place */}
                  {entries[1] && (
                    <div className="flex flex-col items-center flex-1 max-w-[120px]">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex items-center justify-center mb-2 shadow-lg">
                        <span className="text-2xl font-bold text-white">2</span>
                      </div>
                      <div className="w-full bg-gradient-to-br from-slate-200 to-slate-300 rounded-t-2xl p-4 text-center shadow-md h-28 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-sm truncate">{entries[1].user_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{entries[1].score} pts</p>
                        </div>
                        {entries[1].rating && (
                          <div className="flex justify-center gap-0.5 mt-1">
                            {[...Array(entries[1].rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* 1st Place */}
                  <div className="flex flex-col items-center flex-1 max-w-[140px]">
                    <Trophy className="h-8 w-8 text-amber-500 mb-2" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-2 shadow-xl ring-4 ring-amber-200">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                    <div className="w-full bg-gradient-to-br from-amber-200 to-amber-300 rounded-t-2xl p-4 text-center shadow-lg h-36 flex flex-col justify-between">
                      <div>
                        <p className="font-bold text-base truncate">{entries[0].user_name}</p>
                        <p className="text-sm text-muted-foreground mt-1">{entries[0].score} pts</p>
                      </div>
                      {entries[0].rating && (
                        <div className="flex justify-center gap-0.5 mt-2">
                          {[...Array(entries[0].rating)].map((_, i) => (
                            <Star key={i} className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 3rd Place */}
                  {entries[2] && (
                    <div className="flex flex-col items-center flex-1 max-w-[120px]">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center mb-2 shadow-lg">
                        <span className="text-2xl font-bold text-white">3</span>
                      </div>
                      <div className="w-full bg-gradient-to-br from-orange-200 to-orange-300 rounded-t-2xl p-4 text-center shadow-md h-24 flex flex-col justify-between">
                        <div>
                          <p className="font-bold text-sm truncate">{entries[2].user_name}</p>
                          <p className="text-xs text-muted-foreground mt-1">{entries[2].score} pts</p>
                        </div>
                        {entries[2].rating && (
                          <div className="flex justify-center gap-0.5 mt-1">
                            {[...Array(entries[2].rating)].map((_, i) => (
                              <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Rest of the list */}
              {entries.length > 3 && (
                <Card className="p-4">
                  <div className="space-y-2">
                    {entries.slice(3).map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-lg transition-all hover:bg-muted/50 ${
                          entry.user_id === user?.id ? 'bg-blue-50 dark:bg-blue-950/20 ring-1 ring-blue-200 dark:ring-blue-800' : ''
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
                            <span className="text-sm font-semibold text-muted-foreground">
                              {index + 4}
                            </span>
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <p className="font-semibold text-sm truncate">{entry.user_name}</p>
                              {entry.user_id === user?.id && (
                                <span className="text-xs bg-blue-500 text-white px-2 py-0.5 rounded-full font-medium">
                                  You
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-3 flex-wrap">
                              <span className="text-xs font-medium text-muted-foreground">
                                {entry.score} pts
                              </span>
                              {entry.rating && (
                                <div className="flex gap-0.5">
                                  {[...Array(entry.rating)].map((_, i) => (
                                    <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                              )}
                            </div>
                            {entry.comment && (
                              <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
                                {entry.comment}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
