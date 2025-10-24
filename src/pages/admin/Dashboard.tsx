import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Gamepad2, Activity, TrendingUp } from "lucide-react";

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGames: 0,
    activeGames: 0,
    totalActions: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch all users using edge function
        const { data: userData } = await supabase.functions.invoke('fetch-all-users');
        const userCount = userData?.users?.length || 0;

        // Fetch games stats
        const { data: games } = await supabase.from("games").select("is_active");
        
        // Fetch admin actions count
        const { count: actionsCount } = await supabase
          .from("admin_actions")
          .select("*", { count: "exact", head: true });

        setStats({
          totalUsers: userCount,
          totalGames: games?.length || 0,
          activeGames: games?.filter(g => g.is_active).length || 0,
          totalActions: actionsCount || 0,
        });
      } catch (error) {
        console.error("Error fetching stats:", error);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers,
      icon: Users,
      description: "Registered users",
      color: "text-blue-400",
    },
    {
      title: "Total Games",
      value: stats.totalGames,
      icon: Gamepad2,
      description: "Games in system",
      color: "text-purple-400",
    },
    {
      title: "Active Games",
      value: stats.activeGames,
      icon: TrendingUp,
      description: "Currently active",
      color: "text-green-400",
    },
    {
      title: "Admin Actions",
      value: stats.totalActions,
      icon: Activity,
      description: "Total logged actions",
      color: "text-orange-400",
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-100">Admin Dashboard</h1>
        <p className="text-slate-400 mt-2">Overview of your learning platform</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat) => (
          <Card key={stat.title} className="bg-slate-900 border-slate-800">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-slate-300">
                {stat.title}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
              <p className="text-xs text-slate-500 mt-1">{stat.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="bg-slate-900 border-slate-800">
        <CardHeader>
          <CardTitle className="text-slate-100">Quick Actions</CardTitle>
          <CardDescription className="text-slate-400">
            Common administrative tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button 
              onClick={() => navigate('/admin/users')}
              className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer text-left"
            >
              <h3 className="font-semibold text-slate-200">View Users</h3>
              <p className="text-sm text-slate-400 mt-1">Manage user accounts and roles</p>
            </button>
            <button 
              onClick={() => navigate('/admin/games')}
              className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer text-left"
            >
              <h3 className="font-semibold text-slate-200">Manage Games</h3>
              <p className="text-sm text-slate-400 mt-1">Add, edit, or remove games</p>
            </button>
            <button 
              onClick={() => navigate('/admin/system')}
              className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer text-left"
            >
              <h3 className="font-semibold text-slate-200">System Settings</h3>
              <p className="text-sm text-slate-400 mt-1">Configure system parameters</p>
            </button>
            <button 
              onClick={() => navigate('/admin/logs')}
              className="p-4 bg-slate-800 rounded-lg hover:bg-slate-700 transition-colors cursor-pointer text-left"
            >
              <h3 className="font-semibold text-slate-200">View Logs</h3>
              <p className="text-sm text-slate-400 mt-1">Check recent admin activities</p>
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;
