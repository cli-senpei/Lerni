import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import UserStats from "@/components/dashboard/UserStats";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import lerniImage from "@/assets/lerni-2.png";

const DashboardHome = () => {
  const [userName, setUserName] = useState("");
  const navigate = useNavigate();

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
    <div className="space-y-8 pb-8">
      {/* Hero Section - AAA Gaming Style */}
      <div className="relative overflow-hidden">
        {/* Animated Background Gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 animate-gradient"></div>
        
        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03]">
          <div className="absolute inset-0" style={{ 
            backgroundImage: `radial-gradient(circle at 25% 25%, hsl(var(--primary)) 2px, transparent 2px),
                             radial-gradient(circle at 75% 75%, hsl(var(--accent)) 2px, transparent 2px)`,
            backgroundSize: '50px 50px' 
          }}></div>
        </div>

        {/* Main Content Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-emerald-500/95 via-green-600/95 to-teal-600/95 p-8 md:p-12 border-2 border-emerald-400/50 shadow-2xl backdrop-blur-sm">
          {/* Glow Effect */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-emerald-400/20 to-teal-400/20 blur-xl -z-10"></div>
          
          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Welcome Content */}
            <div className="flex-1 text-center md:text-left z-10 space-y-6">
              <div className="space-y-2">
                <div className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full mb-2">
                  <p className="text-sm font-bold text-white/90 tracking-wider uppercase">Dashboard</p>
                </div>
                <h1 className="text-5xl md:text-7xl font-black text-white tracking-tight leading-none">
                  Welcome{userName && ","} 
                  {userName && <span className="block mt-2 bg-gradient-to-r from-yellow-200 to-amber-200 bg-clip-text text-transparent">{userName}!</span>}
                </h1>
                <p className="text-lg md:text-xl text-emerald-50/90 font-semibold max-w-lg">
                  Continue your learning journey and unlock new achievements
                </p>
              </div>
              
              <Button 
                size="lg" 
                onClick={() => navigate('/dashboard/learning')}
                className="bg-gradient-to-r from-yellow-400 via-amber-500 to-orange-500 hover:from-yellow-500 hover:via-amber-600 hover:to-orange-600 text-white font-black text-lg px-8 py-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:-translate-y-1 border-2 border-yellow-300/50 rounded-2xl group"
              >
                <span className="relative z-10">Start Learning</span>
                <div className="absolute inset-0 bg-white/20 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </Button>
            </div>
            
            {/* Mascot with Animation */}
            <div className="relative z-20 group">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/30 to-orange-400/30 rounded-full blur-2xl animate-pulse"></div>
              <img 
                src={lerniImage} 
                alt="Lerni mascot" 
                className="relative w-40 h-40 md:w-56 md:h-56 object-contain drop-shadow-2xl transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 animate-bounce-slow" 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <UserStats />
    </div>
  );
};

export default DashboardHome;
