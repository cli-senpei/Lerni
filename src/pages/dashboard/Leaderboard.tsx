import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, MessageSquare, TrendingUp, Medal, Award } from "lucide-react";
import { User } from "@supabase/supabase-js";

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
      loadLeaderboard();
      loadUserEntry(user.id);
    }
  };

  const getRankIcon = (index: number) => {
    if (index === 0) return <Trophy className="h-6 w-6 text-yellow-500" />;
    if (index === 1) return <Medal className="h-6 w-6 text-gray-400" />;
    if (index === 2) return <Award className="h-6 w-6 text-amber-700" />;
    return <span className="text-lg font-bold text-muted-foreground">#{index + 1}</span>;
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
                  ? 'fill-yellow-500 text-yellow-500'
                  : 'fill-none text-muted-foreground'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold mb-2">Global Leaderboard</h1>
          <p className="text-muted-foreground">Compete with learners worldwide!</p>
        </div>
        <Trophy className="h-16 w-16 text-primary" />
      </div>

      {/* Submit Score Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold">Your Score</h2>
            <div className="flex items-center gap-2 bg-primary/10 px-4 py-2 rounded-full">
              <TrendingUp className="h-5 w-5 text-primary" />
              <span className="text-2xl font-bold">{currentScore}</span>
            </div>
          </div>

          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium mb-2 block">
                Your Name (Required)
              </label>
              <input
                type="text"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-2 rounded-lg border border-border bg-background focus:outline-none focus:ring-2 focus:ring-primary"
                maxLength={50}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                Rate Your Experience (Required)
              </label>
              {renderStars(rating, true)}
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block flex items-center justify-between">
                <span>Share Your Thoughts (Optional)</span>
                {userEntry?.comment && (
                  <button
                    onClick={handleDeleteComment}
                    className="text-xs text-destructive hover:underline"
                  >
                    Delete Comment
                  </button>
                )}
              </label>
              <Textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Tell us about your learning experience..."
                className="min-h-[100px]"
                maxLength={500}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {comment.length}/500 characters
              </p>
            </div>

            <Button
              onClick={handleSubmit}
              disabled={submitting || rating === 0 || !editName.trim()}
              className="w-full"
              size="lg"
            >
              {userEntry ? "Update Entry" : "Submit to Leaderboard"}
            </Button>
          </div>
        </div>
      </Card>

      {/* Leaderboard */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold">Top Performers</h2>
        
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : entries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground">No entries yet. Be the first to submit your score!</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {entries.map((entry, index) => (
              <Card
                key={entry.id}
                className={`p-4 transition-all hover:shadow-lg ${
                  entry.user_id === user?.id ? 'border-2 border-primary bg-primary/5' : ''
                } ${
                  index < 3 ? 'bg-gradient-to-r from-background to-accent/10' : ''
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-12">
                    {getRankIcon(index)}
                  </div>
                  
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-bold text-lg">
                          {entry.user_name}
                          {entry.user_id === user?.id && (
                            <span className="ml-2 text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <TrendingUp className="h-4 w-4" />
                            <span className="font-semibold">{entry.score} points</span>
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
                      <div className="flex gap-2 bg-muted/50 p-3 rounded-lg">
                        <MessageSquare className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-foreground leading-relaxed">
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
  );
};

export default Leaderboard;
