import Header from "@/components/Header";
import Hero from "@/components/Hero";
import FeatureCarousel from "@/components/FeatureCarousel";
import Footer from "@/components/Footer";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main>
        <Hero />
        <FeatureCarousel />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
