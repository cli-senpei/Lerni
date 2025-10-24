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
    <div className="space-y-8">
      {/* Hero Title Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-orange-100/60 to-amber-100/50 p-6 md:p-10 border border-orange-200/40 shadow-lg">
        {/* Subtle background pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '24px 24px' }}></div>
        </div>
        
        {/* Content */}
        <div className="relative flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex-1 text-center md:text-left z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-3 text-orange-900 tracking-tight">
              Welcome{userName ? `, ${userName}` : ""}!
            </h1>
            <p className="text-base md:text-lg text-orange-800/80 font-medium mb-6">
              Continue your learning journey
            </p>
            
            <Button 
              size="lg" 
              onClick={() => navigate('/dashboard/learning')}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-white font-bold shadow-md hover:shadow-lg transition-all hover:scale-105"
            >
              Start Learning
            </Button>
          </div>
          
          {/* Mascot */}
          <div className="relative md:absolute md:right-4 md:bottom-0 z-20">
            <img 
              src={lerniImage} 
              alt="Lerni mascot" 
              className="w-32 h-32 md:w-48 md:h-48 object-contain drop-shadow-lg" 
            />
          </div>
        </div>
      </div>

      <UserStats />
    </div>
  );
};

export default DashboardHome;
