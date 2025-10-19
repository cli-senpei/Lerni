import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import authLogo from "@/assets/auth-logo.png";

const Auth = () => {
  const location = useLocation();
  const [isLogin, setIsLogin] = useState(location.state?.isLogin || false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Check if user is already logged in
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/dashboard");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast({
          title: "Welcome back!",
          description: "You've successfully signed in.",
        });
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/dashboard`,
          },
        });
        if (error) throw error;
        toast({
          title: "Account created!",
          description: "Welcome to Lerni!",
        });
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header hideButton={true} />
      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-md space-y-10">
          <div className="flex justify-center">
            <img 
              src={authLogo} 
              alt="Lerni" 
              className="w-32 h-32 md:w-40 md:h-40"
            />
          </div>

          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-base">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-base">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="h-12 text-base"
              />
            </div>

            <Button
              type="submit"
              className="w-full h-14 rounded-2xl text-base font-bold uppercase tracking-wide"
              disabled={loading}
            >
              {loading ? "Loading..." : isLogin ? "Sign In" : "Get Started"}
            </Button>
          </form>

<div className="text-center">
  <button
    type="button"
    onClick={() => setIsLogin(!isLogin)}
    className="text-base font-medium text-foreground hover:text-[hsl(340,75%,45%)] transition-colors duration-200"
  >
    {isLogin ? "Need an account? Get started" : "Already have an account? Sign in"}
  </button>
</div>



        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Auth;
