import { useEffect, useState } from "react";
import { useNavigate, Outlet, NavLink, Link } from "react-router-dom";
import { Users, Gamepad2, Settings, Activity, Home, LogOut, Code } from "lucide-react";
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
    { title: "Code Editor", url: "/admin/code-editor", icon: Code },
    { title: "System Controls", url: "/admin/system", icon: Settings },
    { title: "Activity Logs", url: "/admin/logs", icon: Activity },
  ];

  if (!user || loading) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col bg-slate-950">
        {/* Admin Header - Fixed */}
        <header className="w-full border-b border-slate-800 bg-black sticky top-0 z-50 h-16 md:h-20">
          <div className="flex h-full items-center justify-between px-4 md:px-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hover:bg-slate-800 rounded-md transition-colors p-2 text-white" />
              <Link to="/admin" className="flex items-center gap-3">
                <img src={logo} alt="Lerni Admin" className="h-12 md:h-16 w-auto brightness-0 invert" />
                <div className="flex items-center gap-2">
                  <Code className="h-6 w-6 md:h-7 md:w-7 text-white" />
                  <span className="text-white font-bold text-xl md:text-2xl">ADMIN</span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-10 w-10 md:h-12 md:w-12 hover:ring-2 hover:ring-red-500 transition-all">
                <AvatarFallback className="bg-red-500/10 text-red-500">
                  <Code className="h-5 w-5 md:h-6 md:w-6" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs md:text-sm font-medium hidden sm:block text-white">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Sidebar and Content Container - Below Header */}
        <div className="flex flex-1 w-full overflow-hidden">
          {/* Sidebar */}
          <Sidebar collapsible="offcanvas" className="border-r border-slate-900 bg-black h-full" variant="sidebar">
            <SidebarContent className="pt-8 bg-black">
              <SidebarGroup className="bg-black">
                <SidebarGroupLabel className="text-white px-4 mb-2">Admin Panel</SidebarGroupLabel>
                <SidebarGroupContent className="bg-black">
                  <SidebarMenu className="space-y-2 px-2 bg-black">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title} className="bg-black">
                        <SidebarMenuButton asChild className="bg-black hover:bg-slate-900">
                          <NavLink
                            to={item.url}
                            end={item.end}
                            className={({ isActive }) =>
                              `flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all bg-black ${
                                isActive
                                  ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                  : "text-white hover:bg-slate-900 hover:text-white"
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

            <SidebarFooter className="p-4 pb-6 bg-black border-t-0">
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
          
          {/* Footer */}
          <footer className="bg-slate-950 border-t border-slate-800 py-2 px-4">
            <p className="text-xs text-slate-500 text-center">
              coded by ruel mcneil
            </p>
          </footer>
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
