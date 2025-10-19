import { useEffect, useState } from "react";
import { useNavigate, Outlet, NavLink, Link } from "react-router-dom";
import { Home, BookOpen, Trophy, LogOut, User as UserIcon } from "lucide-react";
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
  SidebarHeader,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
          <div className="flex h-20 items-center justify-between px-6 md:px-12">
            <Link to="/" className="flex items-center gap-2">
              <img src={logo} alt="Lerni Logo" className="h-20 w-auto" />
            </Link>
            
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary/10 text-primary">
                  <UserIcon className="h-5 w-5" />
                </AvatarFallback>
              </Avatar>
              <span className="text-sm font-medium">{user.email}</span>
            </div>
          </div>
        </header>

        {/* Main Content with Sidebar */}
        <div className="flex flex-1 w-full">
          <Sidebar className="border-r">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
                      <SidebarMenuItem key={item.title}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/dashboard"}
                            className={({ isActive }) =>
                              isActive
                                ? "bg-primary/10 text-primary font-medium"
                                : "hover:bg-muted/50"
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

            <SidebarFooter className="border-t p-4">
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 w-full px-3 py-2 text-sm rounded-md hover:bg-muted/50 transition-colors"
              >
                <LogOut className="h-5 w-5" />
                <span>Sign Out</span>
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
