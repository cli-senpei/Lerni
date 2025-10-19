import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.svg";
import { ArrowRight, Sparkles } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative overflow-hidden px-6 py-20 md:py-32">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text Content */}
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-accent/10 px-4 py-2 text-sm font-medium text-accent-foreground">
              <Sparkles className="h-4 w-4" />
              <span>Personalized Learning for Every Mind</span>
            </div>
            
            <h1 className="text-4xl font-bold leading-tight tracking-tight md:text-5xl lg:text-6xl">
              Learning That{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Celebrates
              </span>{" "}
              Your Journey
            </h1>
            
            <p className="text-xl leading-relaxed text-muted-foreground md:text-2xl">
              Because every mind learns differently—and every win matters.
            </p>
            
            <p className="text-lg leading-relaxed text-muted-foreground">
              A learning platform designed specifically for people with dyslexia and ADHD. 
              Experience education that adapts to your unique strengths and learning style.
            </p>
            
            <div className="flex flex-col gap-4 sm:flex-row">
              <Button variant="hero" size="lg" className="text-base">
                Start Your Journey
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" className="text-base">
                Learn More
              </Button>
            </div>
          </div>
          
          {/* Hero Image */}
          <div className="relative">
            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-primary/20 to-secondary/20 blur-3xl" />
            <img
              src={heroImage}
              alt="Illustration of diverse learners celebrating achievements"
              className="relative w-full drop-shadow-2xl"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
