import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield } from "lucide-react";

const Privacy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <Shield className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Privacy Policy</h1>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Your privacy and your child's safety are our top priorities.
            </p>
            <p>
              We collect only the information necessary to provide a personalized learning experience and never share data with third parties without explicit consent.
            </p>
            <p>
              All data is encrypted and stored securely. We comply with all applicable privacy regulations, including COPPA and GDPR.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Privacy;
