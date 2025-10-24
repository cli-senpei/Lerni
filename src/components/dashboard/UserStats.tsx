import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import currentLevelIcon from "@/assets/currentlevel.png";
import learningIcon from "@/assets/learning-2.png";
import leaderboardIcon from "@/assets/leaderboardbtn-2.png";
import { useNavigate } from "react-router-dom";

interface UserProgress {
  total_lessons_completed: number;
  current_streak: number;
  total_points: number;
  level: number;
}

const UserStats = () => {
  const [progress, setProgress] = useState<UserProgress | null>(null);
  const [loading, setLoading] = useState(true);
  const [hoveredProgress, setHoveredProgress] = useState(false);
  const navigate = useNavigate();

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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-8 animate-pulse bg-gradient-to-br from-emerald-50 to-green-50">
            <div className="h-20 bg-emerald-200/50 rounded-xl mb-4" />
            <div className="h-6 bg-emerald-200/50 rounded w-3/4" />
          </Card>
        ))}
      </div>
    );
  }

  const levelProgress = progress ? ((progress.total_points % 1000) / 1000) * 100 : 0;
  const currentPoints = progress?.total_points || 0;
  const nextLevelPoints = (progress?.level || 1) * 1000;

  return (
    <div className="space-y-8">
      {/* Level Progress - Featured Card */}
      <Card 
        className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 via-green-500/10 to-teal-500/10 border-2 border-emerald-500/30 shadow-xl hover:shadow-2xl transition-all duration-500 cursor-pointer group"
        onMouseEnter={() => setHoveredProgress(true)}
        onMouseLeave={() => setHoveredProgress(false)}
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/5 to-teal-400/5 group-hover:from-emerald-400/10 group-hover:to-teal-400/10 transition-all duration-500"></div>
        
        {/* Glow Effect */}
        <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="relative p-8 md:p-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-2xl blur-lg animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-emerald-500/20 to-teal-500/20 rounded-2xl backdrop-blur-sm border border-emerald-400/30 group-hover:scale-110 transition-transform duration-300">
                  <img src={currentLevelIcon} alt="Level" className="w-12 h-12 md:w-16 md:h-16 object-contain" />
                </div>
              </div>
              <div>
                <p className="text-sm font-semibold text-emerald-600 uppercase tracking-wider mb-1">Current Level</p>
                <p className="text-4xl md:text-5xl font-black text-emerald-700 group-hover:text-emerald-600 transition-colors">
                  Level {progress?.level || 1}
                </p>
              </div>
            </div>
            
            {hoveredProgress && (
              <div className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 rounded-xl backdrop-blur-sm border border-emerald-400/30 animate-fade-in">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-bold text-emerald-700">
                  {Math.round(levelProgress)}% Complete
                </span>
              </div>
            )}
          </div>

          {/* Interactive Progress Bar */}
          <div className="space-y-3">
            <div className="relative group/progress">
              <Progress 
                value={levelProgress} 
                className="h-6 bg-emerald-100 border-2 border-emerald-200 shadow-inner [&>div]:bg-gradient-to-r [&>div]:from-emerald-500 [&>div]:via-green-500 [&>div]:to-teal-500 [&>div]:transition-all [&>div]:duration-1000 [&>div]:ease-out [&>div]:shadow-lg group-hover/progress:[&>div]:shadow-emerald-500/50" 
              />
              {/* Progress Indicator */}
              <div 
                className="absolute top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full border-4 border-emerald-500 shadow-lg transition-all duration-1000 ease-out flex items-center justify-center group-hover/progress:scale-125"
                style={{ left: `calc(${levelProgress}% - 16px)` }}
              >
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              </div>
            </div>
            
            <div className="flex items-center justify-between text-sm font-bold">
              <span className="text-emerald-600">{currentPoints} XP</span>
              <span className="text-emerald-500">{nextLevelPoints} XP</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Stats Grid - Symmetrical Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Total Points Card */}
        <Card 
          onClick={() => navigate('/dashboard/leaderboard')}
          className="group relative overflow-hidden bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200/50 hover:border-amber-400/70 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-orange-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/30 to-orange-500/30 rounded-2xl blur-lg group-hover:animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-amber-100 to-orange-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <img src={leaderboardIcon} alt="Points" className="w-12 h-12 object-contain" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-4xl md:text-5xl font-black text-amber-700 group-hover:text-amber-600 transition-colors mb-1">
                  {progress?.total_points || 0}
                </p>
                <p className="text-sm font-bold text-amber-600 uppercase tracking-wider">Total Points</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Lessons Completed Card */}
        <Card 
          onClick={() => navigate('/dashboard/learning')}
          className="group relative overflow-hidden bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200/50 hover:border-emerald-400/70 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer hover:-translate-y-2"
        >
          {/* Glow */}
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          
          <div className="relative p-8">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/30 to-teal-500/30 rounded-2xl blur-lg group-hover:animate-pulse"></div>
                <div className="relative p-4 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-2xl group-hover:scale-110 transition-transform duration-300">
                  <img src={learningIcon} alt="Lessons" className="w-12 h-12 object-contain" />
                </div>
              </div>
              <div className="flex-1">
                <p className="text-4xl md:text-5xl font-black text-emerald-700 group-hover:text-emerald-600 transition-colors mb-1">
                  {progress?.total_lessons_completed || 0}
                </p>
                <p className="text-sm font-bold text-emerald-600 uppercase tracking-wider">Lessons Completed</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default UserStats;
