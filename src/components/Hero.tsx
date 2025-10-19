import { Button } from "@/components/ui/button";
import heroImage from "@/assets/hero.svg";

const Hero = () => {
  return (
    <section className="flex min-h-[600px] items-center px-6 py-16 md:min-h-[calc(100vh-10rem)] md:px-12">
      <div className="mx-auto grid w-full max-w-screen-xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
        {/* Hero Image - Left Side */}
        <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
          <div className="w-full max-w-[500px]">
            <img
              src={heroImage}
              alt="Diverse learners celebrating achievements"
              className="w-full"
            />
          </div>
        </div>
        
        {/* Text Content - Right Side */}
        <div className="order-1 flex flex-col items-center space-y-10 lg:order-2 lg:items-start">
          <h1 className="max-w-xl text-center text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-left lg:text-5xl">
            The free, fun, and effective way to learn—designed for every mind!
          </h1>
          
          <div className="flex w-full max-w-md flex-col gap-4">
            <Button 
              size="lg" 
              className="h-12 w-full rounded-2xl text-base font-bold uppercase tracking-wide md:h-14"
            >
              Get Started
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              className="h-12 w-full rounded-2xl text-base font-bold uppercase tracking-wide md:h-14"
            >
              I Already Have an Account
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
