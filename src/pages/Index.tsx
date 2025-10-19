import Header from "@/components/Header";
import Hero from "@/components/Hero";
import Footer from "@/components/Footer";
import readingImage from "@/assets/reading-experience.png";
import ortonGillinghamImage from "@/assets/orton-gillingham.png";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        
        {/* Second Section - Reading Experience */}
        <section className="flex min-h-screen items-center px-6 py-4 md:py-6 md:px-12 animate-fade-in">
          <div className="mx-auto grid w-full max-w-screen-xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Text Content - Left Side */}
            <div className="flex flex-col items-center space-y-6 lg:items-start">
              <h2 className="max-w-xl text-center text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-left lg:text-4xl">
                Finally, a reading experience that works with your brain, not against it.
              </h2>
            </div>
            
            {/* Image - Right Side */}
            <div className="flex justify-center lg:justify-end">
              <div className="w-full max-w-[850px]">
                <img
                  src={readingImage}
                  alt="Interactive learning experience with brain character and learner"
                  className="w-full"
                />
              </div>
            </div>
          </div>
        </section>
        
        {/* Third Section - Orton-Gillingham Method */}
        <section className="flex min-h-screen items-center px-6 py-2 md:py-4 md:px-12 animate-fade-in">
          <div className="mx-auto grid w-full max-w-screen-xl items-center gap-8 lg:grid-cols-2 lg:gap-16">
            {/* Image - Left Side */}
            <div className="order-2 flex justify-center lg:order-1 lg:justify-start">
              <div className="w-full max-w-[850px]">
                <img
                  src={ortonGillinghamImage}
                  alt="Orton-Gillingham Method with multisensory learning symbols"
                  className="w-full"
                />
              </div>
            </div>
            
            {/* Text Content - Right Side */}
            <div className="order-1 flex flex-col items-center space-y-6 lg:order-2 lg:items-start">
              <h2 className="max-w-xl text-center text-2xl font-bold leading-tight text-foreground md:text-3xl lg:text-left lg:text-4xl">
                Every game on LERNI is built on the Orton–Gillingham method—structured, multisensory, and proven to help dyslexic learners succeed.
              </h2>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Index;
