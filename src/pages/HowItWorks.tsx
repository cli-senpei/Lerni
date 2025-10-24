import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Lightbulb } from "lucide-react";

const HowItWorks = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <Lightbulb className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">How It Works</h1>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Lerni uses the Orton-Gillingham method, a proven multisensory approach specifically designed for dyslexic learners.
            </p>
            <p>
              Our adaptive AI personalizes the learning experience based on each student's progress, ensuring they're always challenged but never overwhelmed.
            </p>
            <p>
              Through interactive games, visual cues, and structured phonics lessons, students build reading skills step by step in a supportive, engaging environment.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default HowItWorks;
