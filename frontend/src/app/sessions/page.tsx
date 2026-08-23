"use client";

import { useState } from "react";
import { Clock, Users, Zap, Target, Flame, Calendar } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function SessionsPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [selectedType, setSelectedType] = useState<string>("all");

  const sessionTypes = [
    {
      id: "sprint",
      name: "Focus Sprint",
      icon: Zap,
      duration: "25 min",
      color: "ios-blue",
      description: "Short, intense focus sessions perfect for quick tasks and maintaining momentum.",
      idealFor: ["Quick tasks", "Email processing", "Short creative bursts"],
    },
    {
      id: "deep-work",
      name: "Deep Work",
      icon: Target,
      duration: "60 min",
      color: "purple-500",
      description: "Extended focus periods for complex projects requiring deep concentration.",
      idealFor: ["Complex problem solving", "Writing", "Code reviews"],
    },
    {
      id: "marathon",
      name: "Focus Marathon",
      icon: Flame,
      duration: "120 min",
      color: "orange-500",
      description: "Extended sessions for major projects that require sustained attention.",
      idealFor: ["Major projects", "Learning new skills", "Strategic planning"],
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Structured Time",
      description: "Built-in breaks and timeboxing prevent burnout and maintain productivity.",
    },
    {
      icon: Users,
      title: "Group Accountability",
      description: "Working alongside others creates natural motivation and commitment.",
    },
    {
      icon: Calendar,
      title: "Expert Facilitation",
      description: "Trained facilitators guide each session for optimal focus conditions.",
    },
  ];

  const filteredSessions = selectedType === "all" 
    ? sessionTypes 
    : sessionTypes.filter(type => type.id === selectedType);

  return (
    <div className="min-h-screen bg-white dark:bg-ios-gray-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Focus Sessions
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Choose the session type that matches your work style and goals. Each is designed for optimal focus.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Filter Tabs */}
          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setSelectedType("all")}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                selectedType === "all"
                  ? "bg-ios-blue text-white"
                  : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground/60 hover:text-foreground"
              }`}
            >
              All Sessions
            </button>
            {sessionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-6 py-3 rounded-full font-medium transition-colors ${
                  selectedType === type.id
                    ? "bg-ios-blue text-white"
                    : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground/60 hover:text-foreground"
                }`}
              >
                {type.name}
              </button>
            ))}
          </div>

          {/* Session Types */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredSessions.map((session) => (
              <div key={session.id} className="card-ios ios-shadow-lg p-8">
                <div className={`w-16 h-16 rounded-full bg-${session.color}/10 flex items-center justify-center mb-6`}>
                  <session.icon size={32} className={`text-${session.color}`} />
                </div>
                <div className="flex items-center gap-2 mb-3">
                  <h3 className="text-2xl font-bold text-foreground">
                    {session.name}
                  </h3>
                  <span className="px-3 py-1 rounded-full bg-ios-gray-100 dark:bg-ios-gray-800 text-sm text-foreground/60">
                    {session.duration}
                  </span>
                </div>
                <p className="text-foreground/60 mb-6">
                  {session.description}
                </p>
                <div className="border-t border-ios-gray-200 dark:border-ios-gray-800 pt-4">
                  <p className="text-sm font-medium text-foreground mb-2">Ideal for:</p>
                  <ul className="space-y-1">
                    {session.idealFor.map((item, index) => (
                      <li key={index} className="text-sm text-foreground/60 flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-ios-blue" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Why Our Sessions Work
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-8">
                  <div className="w-14 h-14 rounded-full bg-ios-blue/10 flex items-center justify-center mb-6">
                    <benefit.icon size={28} className="text-ios-blue" />
                  </div>
                  <h3 className="text-xl font-semibold text-foreground mb-3">
                    {benefit.title}
                  </h3>
                  <p className="text-foreground/60">
                    {benefit.description}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Focus?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Browse upcoming sessions and join one that matches your schedule and goals.
            </p>
            <a
              href="/"
              className="btn-ios btn-primary inline-block text-lg"
            >
              View Upcoming Sessions
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}