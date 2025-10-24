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

  const getRankBadge = (index: number) => {
    const badges = [
      { bg: "bg-amber-500/20", text: "text-amber-700", label: "1st" },
      { bg: "bg-slate-400/20", text: "text-slate-600", label: "2nd" },
      { bg: "bg-orange-600/20", text: "text-orange-700", label: "3rd" },
    ];
    
    if (index < 3) {
      return (
        <div className={`${badges[index].bg} ${badges[index].text} px-4 py-2 rounded-full font-bold text-lg flex items-center gap-2 min-w-[70px] justify-center`}>
          {index === 0 && <Trophy className="h-5 w-5" />}
          {badges[index].label}
        </div>
      );
    }
    return (
      <div className="bg-muted px-4 py-2 rounded-full font-semibold text-muted-foreground min-w-[70px] text-center">
        #{index + 1}
      </div>
    );
  };

  const renderStars = (count: number, interactive: boolean = false) => {
    return (
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => interactive && setRating(star)}
            disabled={!interactive}
            className={`transition-all ${interactive ? 'cursor-pointer hover:scale-125' : ''}`}
          >
            <Star
              className={`h-6 w-6 ${
                star <= count
                  ? 'fill-orange-400 text-orange-400'
                  : 'fill-none text-orange-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50/50 via-background to-peach-50/30">
      <div className="max-w-6xl mx-auto space-y-8 p-6">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100/80 via-peach-100/60 to-orange-50/80 p-8 md:p-12 border border-orange-200/50">
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-5xl md:text-6xl font-bold mb-3 bg-gradient-to-r from-orange-600 to-orange-800 bg-clip-text text-transparent">
                Leaderboard
              </h1>
              <p className="text-lg text-orange-900/70 font-medium">
                See how you rank among top learners!
              </p>
            </div>
            <div className="flex-shrink-0">
              <img src={mascotImage} alt="Mascot" className="w-32 h-32 md:w-40 md:h-40 animate-bounce-slow" />
            </div>
          </div>
        </div>

        {/* Submit Score Card */}
        <Card className="p-6 md:p-8 bg-white/80 backdrop-blur-sm border-orange-200/50 shadow-lg">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
                <Sparkles className="h-7 w-7 text-orange-500" />
                Your Score
              </h2>
              <div className="flex items-center gap-2 bg-gradient-to-br from-orange-500 to-orange-600 text-white px-6 py-3 rounded-2xl shadow-lg">
                <TrendingUp className="h-5 w-5" />
                <span className="text-2xl font-bold">{currentScore}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  Your Name *
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full px-4 py-3 rounded-xl border-2 border-orange-200 bg-white focus:outline-none focus:ring-2 focus:ring-orange-400 focus:border-transparent transition-all"
                  maxLength={50}
                />
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block text-foreground">
                  Rate Your Experience *
                </label>
                {renderStars(rating, true)}
              </div>

              <div>
                <label className="text-sm font-semibold mb-2 block flex items-center justify-between text-foreground">
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
                  className="min-h-[100px] border-2 border-orange-200 focus:ring-orange-400 focus:border-transparent rounded-xl"
                  maxLength={500}
                />
                <p className="text-xs text-muted-foreground mt-2">
                  {comment.length}/500 characters
                </p>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting || rating === 0 || !editName.trim()}
                className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold py-6 rounded-xl shadow-lg hover:shadow-xl transition-all"
                size="lg"
              >
                {userEntry ? "Update Entry" : "Submit to Leaderboard"}
              </Button>
            </div>
          </div>
        </Card>

        {/* Leaderboard */}
        <div className="space-y-6">
          <h2 className="text-3xl font-bold flex items-center gap-3">
            <Trophy className="h-8 w-8 text-orange-500" />
            Top Performers
          </h2>
          
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : entries.length === 0 ? (
            <Card className="p-12 text-center bg-white/80 backdrop-blur-sm border-orange-200/50">
              <p className="text-muted-foreground text-lg">No entries yet. Be the first to submit your score!</p>
            </Card>
          ) : (
            <div className="space-y-4">
              {entries.map((entry, index) => (
                <Card
                  key={entry.id}
                  className={`p-6 transition-all hover:shadow-xl hover:-translate-y-1 bg-white/80 backdrop-blur-sm border-orange-200/50 ${
                    entry.user_id === user?.id ? 'ring-2 ring-orange-400 bg-orange-50/50' : ''
                  }`}
                >
                  <div className="flex items-start gap-6">
                    <div className="flex-shrink-0">
                      {getRankBadge(index)}
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold text-xl text-foreground flex items-center gap-2 flex-wrap">
                            {entry.user_name}
                            {entry.user_id === user?.id && (
                              <span className="text-xs bg-orange-500 text-white px-3 py-1 rounded-full font-semibold">
                                You
                              </span>
                            )}
                          </h3>
                          <div className="flex items-center gap-4 mt-2 flex-wrap">
                            <div className="flex items-center gap-2 bg-orange-100 px-3 py-1.5 rounded-lg">
                              <TrendingUp className="h-4 w-4 text-orange-600" />
                              <span className="font-bold text-orange-700">{entry.score} pts</span>
                            </div>
                            {entry.rating && (
                              <div className="flex items-center gap-1">
                                {renderStars(entry.rating)}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {entry.comment && (
                        <div className="flex gap-3 bg-orange-50/50 p-4 rounded-xl border border-orange-100">
                          <MessageSquare className="h-5 w-5 text-orange-500 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-foreground/90 leading-relaxed">
                            {entry.comment}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Leaderboard;
