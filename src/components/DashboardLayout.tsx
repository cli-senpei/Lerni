import { useEffect, useState } from "react";
import { useNavigate, Outlet, NavLink, Link } from "react-router-dom";
import { Home, LogOut, User as UserIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import ProfileModal from "@/components/ProfileModal";
import learningIcon from "@/assets/learning-icon.png";
import leaderboardIcon from "@/assets/leaderboard-icon.png";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarFooter,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import logo from "@/assets/logo.png";
import { useToast } from "@/hooks/use-toast";

const DashboardLayout = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [profileOpen, setProfileOpen] = useState(false);

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

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logged out successfully",
    });
    navigate("/");
  };

  const menuItems = [
    { title: "Learning", url: "/dashboard/learning", iconSrc: learningIcon, isLucide: false },
    { title: "Highscore", url: "/dashboard/leaderboard", iconSrc: leaderboardIcon, isLucide: false },
  ];

  if (!user) return null;

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full flex-col">
        {/* Header - Fixed at top */}
        <header className="w-full border-b border-border bg-background sticky top-0 z-50">
          <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="hover:bg-accent rounded-md transition-colors p-2" />
              <Link to="/dashboard" className="flex items-center">
                <img src={logo} alt="Lerni Logo" className="h-12 md:h-16 w-auto" />
              </Link>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <button onClick={() => setProfileOpen(true)} className="cursor-pointer">
                <Avatar className="h-8 w-8 md:h-10 md:w-10 hover:ring-2 hover:ring-primary transition-all">
                  <AvatarFallback className="bg-primary/10 text-primary">
                    <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
                  </AvatarFallback>
                </Avatar>
              </button>
              <span className="text-xs md:text-sm font-medium hidden sm:block">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Sidebar and Content Container */}
        <div className="flex flex-1 w-full overflow-hidden">
          {/* Sidebar */}
          <Sidebar collapsible="offcanvas" className="border-r bg-sidebar" variant="sidebar">
            <SidebarContent className="pt-8">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-6 px-4">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/dashboard"}
                            className={({ isActive }) =>
                              `flex items-center gap-5 px-6 py-6 rounded-3xl text-base font-semibold transition-all ${
                                isActive
                                  ? "bg-gradient-to-br from-pink-100 to-purple-100 text-pink-600 scale-105"
                                  : "bg-white/80 text-gray-700 hover:bg-gradient-to-br hover:from-pink-50 hover:to-purple-50 hover:scale-102"
                              }`
                            }
                          >
                            <img src={item.iconSrc} alt={item.title} className="h-14 w-14 object-contain" />
                            <span className="tracking-wide">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <div className="px-6 mb-4">
              <div className="border-t border-sidebar-border" />
            </div>

            <SidebarFooter className="p-6 pb-8">
              <button
                onClick={handleLogout}
                className="flex items-center gap-5 w-full px-6 py-6 text-base font-semibold rounded-3xl bg-red-50 text-red-600 hover:bg-gradient-to-br hover:from-red-100 hover:to-pink-100 hover:text-red-700 transition-all hover:scale-102"
              >
                <LogOut className="h-14 w-14 stroke-[2.5]" />
                <span className="tracking-wide">Sign Out</span>
              </button>
            </SidebarFooter>
          </Sidebar>

          {/* Main Content */}
          <main className="flex-1 overflow-auto w-full">
            <div className="w-full p-6 md:p-12 max-w-7xl mx-auto">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      {user && <ProfileModal open={profileOpen} onOpenChange={setProfileOpen} user={user} />}
    </SidebarProvider>
  );
};

export default DashboardLayout;
