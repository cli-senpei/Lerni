import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Trophy, Star, MessageSquare, TrendingUp, Sparkles, Upload } from "lucide-react";
import { User } from "@supabase/supabase-js";
import mascotImage from "@/assets/mascot.png";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

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
  const [dialogOpen, setDialogOpen] = useState(false);

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
        setDialogOpen(false);
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
        setDialogOpen(false);
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50/30 via-background to-amber-50/20">
      <div className="max-w-5xl mx-auto space-y-6 p-4 md:p-6">
        {/* Hero Banner - Clean & Accessible */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100/60 to-amber-100/50 p-6 md:p-10 border border-orange-200/40 shadow-lg">
          {/* Subtle background pattern */}
          <div className="absolute inset-0 opacity-5">
            <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
          </div>
          
          {/* Content */}
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex-1 text-center md:text-left z-10">
              <div className="inline-flex items-center gap-2 bg-white/60 backdrop-blur-sm px-4 py-2 rounded-full mb-4 border border-orange-200/50">
                <Trophy className="h-4 w-4 text-orange-600" />
                <span className="text-xs font-bold text-orange-900 uppercase tracking-wide">Top Learners</span>
              </div>
              <h1 className="text-4xl md:text-6xl font-black mb-3 text-orange-900 tracking-tight">
                Leaderboard
              </h1>
              <p className="text-base md:text-lg text-orange-800/80 font-medium mb-6">
                See how you compare with other learners
              </p>
              
              {/* CTA Button */}
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" className="bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all">
                    <Upload className="h-5 w-5 mr-2" />
                    Submit Your Score
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      Submit Your Score
                    </DialogTitle>
                    <DialogDescription>
                      Share your achievement with the community
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="space-y-4 py-4">
                    <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-400 to-amber-400 rounded-lg text-white shadow-sm">
                      <span className="font-semibold">Current Score</span>
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        <span className="text-2xl font-bold">{currentScore}</span>
                      </div>
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block">
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
                      <label className="text-sm font-medium mb-2 block">
                        Rate Your Experience *
                      </label>
                      {renderStars(rating, true)}
                    </div>

                    <div>
                      <label className="text-sm font-medium mb-2 block flex items-center justify-between">
                        <span>Share Your Thoughts</span>
                        {userEntry?.comment && (
                          <button
                            onClick={handleDeleteComment}
                            className="text-xs text-destructive hover:underline"
                          >
                            Delete
                          </button>
                        )}
                      </label>
                      <Textarea
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Tell us about your learning experience..."
                        className="min-h-[100px] text-sm"
                        maxLength={500}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {comment.length}/500 characters
                      </p>
                    </div>

                    <Button
                      onClick={handleSubmit}
                      disabled={submitting || rating === 0 || !editName.trim()}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold"
                      size="lg"
                    >
                      {userEntry ? "Update Entry" : "Submit to Leaderboard"}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            {/* Mascot - Integrated */}
            <div className="relative md:absolute md:right-4 md:bottom-0 z-20">
              <img 
                src={mascotImage} 
                alt="Leaderboard mascot" 
                className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-lg" 
              />
            </div>
          </div>
        </div>

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
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-300 to-orange-400 flex items-center justify-center mb-2 shadow-md">
                        <span className="text-2xl font-bold text-white">2</span>
                      </div>
                      <div className="w-full bg-gradient-to-br from-orange-100 to-orange-200 rounded-t-2xl p-4 text-center shadow-sm h-28 flex flex-col justify-between border border-orange-200/50">
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
                    <Trophy className="h-8 w-8 text-amber-600 mb-2" />
                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center mb-2 shadow-lg ring-4 ring-amber-200/70">
                      <span className="text-3xl font-bold text-white">1</span>
                    </div>
                    <div className="w-full bg-gradient-to-br from-amber-200/90 to-amber-300/80 rounded-t-2xl p-4 text-center shadow-md h-36 flex flex-col justify-between border border-amber-300/50">
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
                      <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-300 to-amber-400 flex items-center justify-center mb-2 shadow-md">
                        <span className="text-2xl font-bold text-white">3</span>
                      </div>
                      <div className="w-full bg-gradient-to-br from-amber-100 to-amber-200 rounded-t-2xl p-4 text-center shadow-sm h-24 flex flex-col justify-between border border-amber-200/50">
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
                <Card className="p-4 bg-white/80 backdrop-blur-sm border-orange-100/50">
                  <div className="space-y-2">
                    {entries.slice(3).map((entry, index) => (
                      <div
                        key={entry.id}
                        className={`p-4 rounded-lg transition-all hover:bg-orange-50/50 ${
                          entry.user_id === user?.id ? 'bg-orange-50/70 ring-1 ring-orange-200' : ''
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
                                <span className="text-xs bg-orange-500 text-white px-2 py-0.5 rounded-full font-medium">
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
