import { Brain, Trophy, Zap, Heart } from "lucide-react";

const features = [
  {
    icon: Brain,
    title: "Adaptive Learning",
    description: "Lessons that adjust to your pace and learning style, making every session feel just right.",
  },
  {
    icon: Trophy,
    title: "Celebrate Progress",
    description: "Every step forward is a win. Track achievements and build confidence with each milestone.",
  },
  {
    icon: Zap,
    title: "Focus-Friendly",
    description: "Bite-sized lessons designed to work with your attention span, not against it.",
  },
  {
    icon: Heart,
    title: "Built with Care",
    description: "Designed by experts who understand neurodivergent learning, with empathy at every step.",
  },
];

const Features = () => {
  return (
    <section className="px-6 py-20 md:py-32" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="mb-4 text-3xl font-bold md:text-4xl lg:text-5xl">
            Learning That Works{" "}
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              With You
            </span>
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
            Features designed to support your unique learning journey
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="group rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-soft)] transition-all duration-300 hover:shadow-[var(--shadow-elevated)]"
              >
                <div className="mb-4 inline-flex rounded-xl bg-primary/10 p-3 transition-transform duration-300 group-hover:scale-110">
                  <Icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="mb-2 text-xl font-semibold">{feature.title}</h3>
                <p className="leading-relaxed text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Features;
