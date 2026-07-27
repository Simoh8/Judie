"use client";

import { Users, Clock, Brain, Shield } from "lucide-react";

const features = [
  {
    icon: Users,
    title: "Body Doubling",
    description: "Work alongside others in silent co-working sessions. The presence of focused people creates natural accountability.",
    color: "text-ios-blue",
    bgColor: "bg-ios-blue/10",
  },
  {
    icon: Clock,
    title: "Structured Sessions",
    description: "25, 50, and 90-minute focus sessions with built-in breaks. Follow the Pomodoro technique without the timer anxiety.",
    color: "text-ios-green",
    bgColor: "bg-ios-green/10",
  },
  {
    icon: Brain,
    title: "Expert Facilitation",
    description: "Professional hosts guide sessions with gentle prompts and check-ins to keep you on track.",
    color: "text-ios-orange",
    bgColor: "bg-ios-orange/10",
  },
  {
    icon: Shield,
    title: "ADHD-Friendly",
    description: "Designed with neurodivergent brains in mind. External structure meets internal motivation.",
    color: "text-ios-red",
    bgColor: "bg-ios-red/10",
  },
];

export default function Features() {
  return (
    <section className="py-24 px-6 bg-gray-50 dark:bg-ios-gray-900/50">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Why FLOWN works
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Backed by neuroscience and designed for real human focus
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="card-ios animate-slide-up hover:scale-105 transition-transform duration-300"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`${feature.bgColor} ${feature.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-4`}>
                <feature.icon size={28} />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-foreground">
                {feature.title}
              </h3>
              <p className="text-foreground/70 leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
