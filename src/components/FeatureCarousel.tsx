import { Brain, Heart, Zap, Target, Star, Trophy } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning",
    color: "bg-blue-100 text-blue-600",
  },
  {
    icon: Heart,
    title: "Built with Care",
    color: "bg-pink-100 text-pink-600",
  },
  {
    icon: Zap,
    title: "Focus-Friendly",
    color: "bg-yellow-100 text-yellow-600",
  },
  {
    icon: Target,
    title: "Goal-Oriented",
    color: "bg-green-100 text-green-600",
  },
  {
    icon: Star,
    title: "Celebrate Wins",
    color: "bg-purple-100 text-purple-600",
  },
  {
    icon: Trophy,
    title: "Track Progress",
    color: "bg-orange-100 text-orange-600",
  },
];

const FeatureCarousel = () => {
  return (
    <section className="border-t border-border bg-background py-12">
      <div className="mx-auto max-w-screen-2xl overflow-hidden px-6">
        <div className="flex items-center justify-center gap-8 overflow-x-auto pb-4 md:gap-12">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="flex min-w-[140px] flex-col items-center gap-3 md:min-w-[180px]"
              >
                <div className={`flex h-16 w-16 items-center justify-center rounded-2xl ${feature.color} md:h-20 md:w-20`}>
                  <Icon className="h-8 w-8 md:h-10 md:w-10" />
                </div>
                <span className="text-center text-sm font-bold uppercase tracking-wide text-muted-foreground md:text-base">
                  {feature.title}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeatureCarousel;
