import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { HelpCircle } from "lucide-react";

const HelpCenter = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <HelpCircle className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Help Center</h1>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Need help getting started? We're here to support you every step of the way.
            </p>
            <p>
              Browse our guides, tutorials, and frequently asked questions to get the most out of Lerni.
            </p>
            <p>
              If you can't find what you're looking for, don't hesitate to reach out to our support team.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HelpCenter;
