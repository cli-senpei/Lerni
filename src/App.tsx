import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";
import DashboardLayout from "./components/DashboardLayout";
import DashboardHome from "./pages/dashboard/Home";
import Learning from "./pages/dashboard/Learning";
import Leaderboard from "./pages/dashboard/Leaderboard";
import OurMission from "./pages/OurMission";
import HowItWorks from "./pages/HowItWorks";
import Research from "./pages/Research";
import HelpCenter from "./pages/HelpCenter";
import ContactUs from "./pages/ContactUs";
import Privacy from "./pages/Privacy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/our-mission" element={<OurMission />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/research" element={<Research />} />
          <Route path="/help-center" element={<HelpCenter />} />
          <Route path="/contact-us" element={<ContactUs />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="learning" element={<Learning />} />
            <Route path="leaderboard" element={<Leaderboard />} />
          </Route>
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
