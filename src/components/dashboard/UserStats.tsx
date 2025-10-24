import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { Trophy, BookOpen, TrendingUp } from "lucide-react";
import { toast } from "sonner";

interface UserProgress {
  total_lessons_completed: number;
  current_streak: number;
  total_points: number;
  level: number;
}

const UserStats = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProgress();
  }, []);

  const fetchUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("Please log in to view your progress");
        return;
      }

      const { data, error } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create initial progress for new users
        const { data: newProgress, error: insertError } = await supabase
          .from("user_progress")
          .insert({
            user_id: user.id,
            total_lessons_completed: 0,
            current_streak: 0,
            total_points: 0,
            level: 1,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setProgress(newProgress);
      } else {
        setProgress(data);
      }
    } catch (error: any) {
      console.error("Error fetching progress:", error);
      toast.error("Failed to load your progress");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <Card className="p-6 animate-pulse">
          <div className="h-8 bg-muted rounded w-3/4 mb-4" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </Card>
      </div>
    );
  }

  const levelProgress = progress ? ((progress.total_points % 1000) / 1000) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="grid lg:grid-cols-[1fr,auto] gap-6">
        <div className="space-y-4">
          {/* Level Card with Interactive Animated Progress */}
          <Card className="p-8 bg-gradient-to-br from-pink-50 to-rose-50 border-2 border-pink-200/40 group cursor-pointer hover:shadow-lg transition-all duration-300">
            <div className="flex items-center gap-4 mb-6">
              <div className="p-4 bg-pink-200/50 rounded-full group-hover:scale-110 transition-transform duration-300">
                <TrendingUp className="w-8 h-8 text-pink-500" />
              </div>
              <div>
                <p className="text-sm font-semibold text-pink-500 mb-1">Current Level</p>
                <p className="text-5xl font-black text-pink-500">Level {progress?.level || 1}</p>
              </div>
            </div>
            <div className="relative group/progress">
              <Progress 
                value={levelProgress} 
                className="h-4 bg-pink-200/50 cursor-pointer hover:h-5 transition-all duration-300 [&>div]:bg-gradient-to-r [&>div]:from-pink-400 [&>div]:to-pink-500 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-out group-hover/progress:[&>div]:shadow-lg group-hover/progress:[&>div]:shadow-pink-400/50" 
              />
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 opacity-0 group-hover/progress:opacity-100 transition-opacity bg-pink-500 text-white px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap">
                {Math.round(levelProgress)}% Complete
              </div>
            </div>
            <p className="text-sm text-pink-600/70 mt-3 font-medium">
              {progress?.total_points || 0} / {((progress?.level || 1) * 1000)} XP
            </p>
          </Card>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6 bg-gradient-to-br from-pink-50/80 to-rose-50/60 border-2 border-pink-200/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-200/40 rounded-full">
                  <Trophy className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <p className="text-3xl font-black text-pink-500">{progress?.total_points || 0}</p>
                  <p className="text-sm font-semibold text-pink-500/70">Total Points</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-pink-50/80 to-rose-50/60 border-2 border-pink-200/30">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-pink-200/40 rounded-full">
                  <BookOpen className="w-6 h-6 text-pink-500" />
                </div>
                <div>
                  <p className="text-3xl font-black text-pink-500">{progress?.total_lessons_completed || 0}</p>
                  <p className="text-sm font-semibold text-pink-500/70">Lessons Completed</p>
                </div>
              </div>
            </Card>
          </div>
        </div>

        {/* Avatar Section - Placeholder for future avatar system */}
        <div className="flex items-center justify-center">
          <div className="relative group">
            <div className="w-64 h-64 bg-gradient-to-br from-pink-200 to-pink-300 rounded-[3rem] flex items-center justify-center cursor-pointer transition-all duration-500 group-hover:scale-110 group-hover:rotate-3 group-hover:shadow-2xl group-hover:shadow-pink-400/50">
              <div className="text-center space-y-2 group-hover:scale-110 transition-transform duration-300">
                <div className="text-6xl animate-bounce">👤</div>
                <p className="text-pink-600 font-bold text-sm">Your Avatar</p>
                <p className="text-pink-500/70 text-xs px-4">Customize & earn items!</p>
              </div>
            </div>
            {/* Future: This will be replaced with actual avatar component with items */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserStats;
