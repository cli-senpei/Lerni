import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const usePointsTracker = () => {
  const { toast } = useToast();

  const addPoints = async (points: number) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: profile } = await supabase
      .from('user_learning_profiles')
      .select('total_points')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentPoints = profile?.total_points || 0;
    const newTotal = currentPoints + points;

    const { error } = await supabase
      .from('user_learning_profiles')
      .update({ total_points: newTotal })
      .eq('user_id', user.id);

    if (!error) {
      // Also update user_progress table
      const { data: progress } = await supabase
        .from('user_progress')
        .select('total_points')
        .eq('user_id', user.id)
        .maybeSingle();

      const progressPoints = progress?.total_points || 0;
      
      await supabase
        .from('user_progress')
        .update({ total_points: progressPoints + points })
        .eq('user_id', user.id);
    }
  };

  const incrementLesson = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: progress } = await supabase
      .from('user_progress')
      .select('total_lessons_completed')
      .eq('user_id', user.id)
      .maybeSingle();

    const currentLessons = progress?.total_lessons_completed || 0;

    await supabase
      .from('user_progress')
      .update({ total_lessons_completed: currentLessons + 1 })
      .eq('user_id', user.id);
  };

  const updateStreak = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: progress } = await supabase
      .from('user_progress')
      .select('current_streak, updated_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!progress) return;

    const lastUpdate = new Date(progress.updated_at);
    const today = new Date();
    const daysDiff = Math.floor((today.getTime() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24));

    let newStreak = progress.current_streak || 0;

    if (daysDiff === 0) {
      // Same day, no change
      return;
    } else if (daysDiff === 1) {
      // Consecutive day, increment
      newStreak += 1;
    } else {
      // Streak broken, reset to 1
      newStreak = 1;
    }

    await supabase
      .from('user_progress')
      .update({ current_streak: newStreak })
      .eq('user_id', user.id);
  };

  return { addPoints, incrementLesson, updateStreak };
};
