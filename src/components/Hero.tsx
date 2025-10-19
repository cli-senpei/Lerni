import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.svg";

const Hero = () => {
  return (
    <section className="min-h-[calc(100vh-5rem)] px-6 py-12 md:px-12 md:py-20">
      <div className="mx-auto grid max-w-screen-xl items-center gap-12 lg:grid-cols-2 lg:gap-20">
        {/* Hero Image */}
        <div className="order-2 lg:order-1">
          <img
            src={heroImage}
            alt="Diverse learners celebrating achievements"
            className="w-full"
          />
        </div>
        
        {/* Text Content */}
        <div className="order-1 space-y-8 text-center lg:order-2 lg:text-left">
          <h1 className="text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl">
            Because every mind learns differently—and every win matters.
          </h1>
          
          <div className="flex flex-col gap-4">
            <Button size="lg" className="h-14 w-full rounded-2xl text-base font-bold uppercase tracking-wide lg:w-auto lg:min-w-[320px]">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="h-14 w-full rounded-2xl text-base uppercase tracking-wide lg:w-auto lg:min-w-[320px]">
              I Already Have an Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
