"use client";

import { Clock, Users, Target, Zap, Shield, Sparkles } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HowItWorksPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const steps = [
    {
      icon: Target,
      title: "Choose Your Focus Session",
      description: "Browse our curated focus sessions and pick one that matches your goals. From 25-minute sprints to 2-hour deep work marathons.",
    },
    {
      icon: Users,
      title: "Join a Live Session",
      description: "Connect with like-minded individuals in live video sessions. Our expert facilitators guide you through structured focus periods.",
    },
    {
      icon: Clock,
      title: "Focus Together",
      description: "Work in a distraction-free environment with built-in accountability. Breaks are scheduled, and progress is tracked automatically.",
    },
    {
      icon: Zap,
      title: "Track Your Progress",
      description: "Monitor your focus hours, streaks, and achievements. Build habits that stick with detailed analytics and insights.",
    },
  ];

  const features = [
    {
      icon: Shield,
      title: "Distraction-Free Environment",
      description: "Our platform is designed to minimize interruptions and maximize your deep work capacity.",
    },
    {
      icon: Sparkles,
      title: "Expert Facilitators",
      description: "Trained facilitators ensure each session runs smoothly and keeps everyone on track.",
    },
    {
      icon: Users,
      title: "Community Accountability",
      description: "Working alongside others creates natural accountability and boosts motivation.",
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-ios-gray-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              How FLOWN Works
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Achieve deep focus in just 4 simple steps. Our science-backed approach helps you build lasting focus habits.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Steps Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Your Journey to Deep Focus
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {steps.map((step, index) => (
                <div key={index} className="relative">
                  <div className="card-ios ios-shadow-lg p-8 h-full">
                    <div className="w-16 h-16 rounded-full bg-ios-blue/10 flex items-center justify-center mb-6">
                      <step.icon size={32} className="text-ios-blue" />
                    </div>
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-ios-blue text-white flex items-center justify-center font-bold text-sm">
                      {index + 1}
                    </div>
                    <h3 className="text-xl font-semibold text-foreground mb-3">
                      {step.title}
                    </h3>
                    <p className="text-foreground/60">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Why FLOWN Works
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {features.map((feature, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-8">
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                    <feature.icon size={28} className="text-purple-500" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-foreground/60">
                    {feature.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Focus?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Join thousands of professionals who have already discovered the power of focused work sessions.
            </p>
            <a
              href="/"
              className="btn-ios btn-primary inline-block text-lg"
            >
              Get Started Free
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}