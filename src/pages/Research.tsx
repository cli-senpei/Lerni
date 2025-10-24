import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { BookOpen } from "lucide-react";

const Research = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="px-6 py-16 md:px-12 md:py-24">
        <div className="mx-auto max-w-4xl">
          <div className="mb-8 flex items-center gap-3">
            <BookOpen className="h-12 w-12 text-primary" />
            <h1 className="text-4xl font-bold text-foreground md:text-5xl">Research</h1>
          </div>
          <div className="space-y-6 text-lg text-muted-foreground">
            <p>
              Our approach is grounded in decades of research on dyslexia and evidence-based teaching methods.
            </p>
            <p>
              The Orton-Gillingham method has been scientifically validated as one of the most effective interventions for students with dyslexia, focusing on systematic, explicit, and multisensory instruction.
            </p>
            <p>
              We continuously incorporate the latest findings in educational neuroscience and learning technology to ensure Lerni remains at the forefront of dyslexia support.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Research;
