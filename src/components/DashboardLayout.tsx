import { useEffect, useState } from "react";
import { useNavigate, Outlet, NavLink, Link } from "react-router-dom";
import { Home, BookOpen, Trophy, LogOut, User as UserIcon, Menu } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
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
    { title: "Home", url: "/dashboard", icon: Home },
    { title: "Learning", url: "/dashboard/learning", icon: BookOpen },
    { title: "Leaderboard", url: "/dashboard/leaderboard", icon: Trophy },
  ];

  if (!user) return null;

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full flex-col">
        {/* Header */}
        <header className="w-full border-b border-border bg-background">
          <div className="flex h-16 md:h-20 items-center justify-between px-4 md:px-12">
            <div className="flex items-center gap-2">
              <SidebarTrigger className="lg:hidden">
                <Menu className="h-6 w-6" />
              </SidebarTrigger>
              <Link to="/" className="flex items-center">
                <img src={logo} alt="Lerni Logo" className="h-12 md:h-20 w-auto" />
              </Link>
            </div>
            
            <div className="flex items-center gap-2 md:gap-3">
              <Avatar className="h-8 w-8 md:h-10 md:w-10">
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserIcon className="h-4 w-4 md:h-5 md:w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-xs md:text-sm font-medium hidden sm:block">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex flex-1 w-full">
          <Sidebar className="hidden lg:flex border-r w-72">
            <SidebarContent className="pt-6">
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu className="space-y-3">
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/dashboard"}
                            className={({ isActive }) =>
                              `flex items-center gap-4 px-6 py-4 rounded-xl text-lg font-semibold transition-all ${
                                isActive
                                  ? "bg-primary/10 text-primary shadow-sm"
                                  : "hover:bg-muted/50 text-foreground"
                              }`
                            }
                          >
                            <item.icon className="h-7 w-7 stroke-[2.5]" />
                            <span className="tracking-wide">{item.title}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t p-6">
              <button
                onClick={handleLogout}
                className="flex items-center gap-4 w-full px-6 py-4 text-lg font-semibold rounded-xl hover:bg-destructive/10 hover:text-destructive transition-all"
              >
                <LogOut className="h-7 w-7 stroke-[2.5]" />
                <span className="tracking-wide">Sign Out</span>
              </button>
            </SidebarFooter>
          </Sidebar>

          <main className="flex-1 overflow-auto">
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
