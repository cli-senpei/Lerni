import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Target } from "lucide-react";

const OurMission = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <Target className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Our Mission</h1>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              At Lerni, we believe every child deserves access to learning tools that work with their unique mind, not against it.
            </p>
            <p>
              Our mission is to empower dyslexic learners with science-backed, engaging, and adaptive educational experiences that build confidence and unlock potential.
            </p>
            <p>
              We're committed to making learning accessible, joyful, and effective for every student, regardless of how their brain processes information.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OurMission;
