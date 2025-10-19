import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserStats from "@/components/dashboard/UserStats";
import { Card } from "@/components/ui/card";
import { BookOpen, Target, Zap, TrendingUp } from "lucide-react";

const DashboardHome = () => {
  const [userName, setUserName] = useState("");

  useEffect(() => {
    loadUserName();
  }, []);

  const loadUserName = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data } = await supabase
      .from('user_learning_profiles')
      .select('user_name')
      .eq('user_id', user.id)
      .maybeSingle();

    if (data?.user_name) {
      setUserName(data.user_name);
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">
          Welcome{userName ? `, ${userName}` : ""}! 🎉
        </h1>
        <p className="text-muted-foreground text-lg">
          Track your progress and continue your learning journey
        </p>
      </div>

      <UserStats />

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="p-6 bg-gradient-to-br from-primary/5 to-accent/5 border-2">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <Target className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Daily Goals</h3>
              <p className="text-sm text-muted-foreground">
                Complete lessons daily to maintain your streak and earn bonus points!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-accent/5 to-primary/5 border-2">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-accent/10 rounded-lg">
              <Zap className="h-6 w-6 text-accent" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Level Up</h3>
              <p className="text-sm text-muted-foreground">
                Keep earning XP to unlock new levels and advanced learning materials!
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-success/5 to-primary/5 border-2">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-success/10 rounded-lg">
              <BookOpen className="h-6 w-6 text-success" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Learning Path</h3>
              <p className="text-sm text-muted-foreground">
                Your personalized curriculum adapts to your strengths and weaknesses.
              </p>
            </div>
          </div>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-primary/5 to-success/5 border-2">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-primary/10 rounded-lg">
              <TrendingUp className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-2">Compete</h3>
              <p className="text-sm text-muted-foreground">
                Check the leaderboard to see how you rank against other learners!
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardHome;
