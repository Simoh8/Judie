"use client";

import { Calendar, Video, CheckCircle } from "lucide-react";

const steps = [
  {
    icon: Calendar,
    title: "Choose a session",
    description: "Pick from daily facilitated sessions or join on-demand co-working rooms. Sessions range from 25 to 90 minutes.",
    step: "01",
  },
  {
    icon: Video,
    title: "Join the space",
    description: "Enter the virtual room with camera and mic optional. Set your intention and get ready to focus.",
    step: "02",
  },
  {
    icon: CheckCircle,
    title: "Flow together",
    description: "Work silently alongside others. Gentle check-ins keep you accountable without breaking your flow.",
    step: "03",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            How it works
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            Three simple steps to better focus
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className="relative animate-slide-up"
              style={{ animationDelay: `${index * 0.15}s` }}
            >
              <div className="card-ios h-full">
                <div className="text-6xl font-bold text-ios-blue/20 mb-4">
                  {step.step}
                </div>
                <div className="bg-ios-blue/10 text-ios-blue w-16 h-16 rounded-2xl flex items-center justify-center mb-6">
                  <step.icon size={32} />
                </div>
                <h3 className="text-2xl font-semibold mb-3 text-foreground">
                  {step.title}
                </h3>
                <p className="text-foreground/70 leading-relaxed">
                  {step.description}
                </p>
              </div>
              
              {index < steps.length - 1 && (
                <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 text-ios-blue/30">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
