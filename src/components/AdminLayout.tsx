import { useEffect, useState } from "react";
import { useNavigate, Outlet, NavLink, Link } from "react-router-dom";
import { Users, Gamepad2, Settings, Activity, Shield, LogOut, Home } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { useAdmin } from "@/hooks/useAdmin";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import logo from "@/assets/logo.png";
import { useToast } from "@/hooks/use-toast";

const AdminLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [signOutDialogOpen, setSignOutDialogOpen] = useState(false);
  const { isAdmin, loading } = useAdmin();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setUser(session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (!loading && !isAdmin && user) {
      toast({
        title: "Access Denied",
        description: "You don't have admin privileges",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  }, [isAdmin, loading, user, navigate, toast]);

  const handleLogout = async () => {
    setSignOutDialogOpen(false);
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
    });
    navigate("/");
  };

  const menuItems = [
    { title: "Dashboard", url: "/admin", icon: Home, end: true },
    { title: "User Management", url: "/admin/users", icon: Users },
    { title: "Game Management", url: "/admin/games", icon: Gamepad2 },
    { title: "System Controls", url: "/admin/system", icon: Settings },
    { title: "Activity Logs", url: "/admin/logs", icon: Activity },
  ];

  if (!user || loading) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-slate-950">
        {/* Admin Header */}
        <header className="w-full border-b border-slate-800 bg-slate-900 sticky top-0 z-50">
          <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hover:bg-slate-800 rounded-md transition-colors p-2 text-slate-300" />
              <Link to="/admin" className="flex items-center gap-3">
                <img src={logo} alt="Lerni Admin" className="h-12 md:h-16 w-auto" />
                <div className="flex items-center gap-2">
                  <Shield className="h-5 w-5 text-red-500" />
                  <span className="text-red-500 font-bold text-lg">ADMIN</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10 hover:ring-2 hover:ring-red-500 transition-all">
                <AvatarFallback className="bg-red-500/10 text-red-500">
                  <Shield className="h-4 w-4 md:h-5 md:w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs md:text-sm font-medium hidden sm:block text-slate-300">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Sidebar and Content Container */}
        <div className="flex flex-1 w-full overflow-hidden">
          {/* Sidebar */}
          <Sidebar collapsible="offcanvas" className="border-r border-slate-800 bg-slate-900" variant="sidebar">
            <SidebarContent className="pt-8">
              <SidebarGroup>
                <SidebarGroupLabel className="text-slate-400">Admin Panel</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-2 px-2">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.end}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                                isActive
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                              }`
                            }
                          >
                            <item.icon className="h-5 w-5" />
                            <span>{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <div className="px-6 mb-4">
              <div className="border-t border-slate-800" />
            </div>

            <SidebarFooter className="p-4 pb-6">
              <button
                onClick={() => setSignOutDialogOpen(true)}
                className="flex items-center gap-3 w-full px-4 py-3 text-sm font-medium rounded-lg bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
              </button>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-auto w-full bg-slate-950">
            <div className="w-full p-6 md:p-12 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      <AlertDialog open={signOutDialogOpen} onOpenChange={setSignOutDialogOpen}>
        <AlertDialogContent className="bg-slate-900 border-slate-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-slate-100">Are you sure you want to sign out?</AlertDialogTitle>
            <AlertDialogDescription className="text-slate-400">
              You will be logged out of the admin panel and redirected to the home page.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-slate-800 text-slate-300 hover:bg-slate-700">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleLogout} className="bg-red-600 hover:bg-red-700">
              Sign Out
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default AdminLayout;
