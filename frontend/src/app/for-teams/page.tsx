"use client";

import { Building2, Users, TrendingUp, Shield, Clock, MessageSquare, BarChart3, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function ForTeamsPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const benefits = [
    {
      icon: TrendingUp,
      title: "Increased Productivity",
      description: "Teams report 40% increase in focused work hours within the first month of using FLOWN.",
      stat: "40%",
    },
    {
      icon: Users,
      title: "Better Collaboration",
      description: "Shared focus sessions create natural alignment and improve team communication.",
      stat: "3x",
    },
    {
      icon: Shield,
      title: "Reduced Burnout",
      description: "Structured breaks and sustainable focus schedules prevent team exhaustion.",
      stat: "60%",
    },
  ];

  const features = [
    {
      icon: Building2,
      title: "Team Dashboard",
      description: "Centralized view of team focus patterns, session participation, and collective progress.",
    },
    {
      icon: Clock,
      title: "Custom Schedules",
      description: "Create team-specific focus sessions that align with your workflows and time zones.",
    },
    {
      icon: MessageSquare,
      title: "Team Communication",
      description: "Built-in messaging and announcements for seamless coordination during focus sessions.",
    },
    {
      icon: BarChart3,
      title: "Advanced Analytics",
      description: "Deep insights into team performance, focus trends, and productivity patterns.",
    },
    {
      icon: Lock,
      title: "Enterprise Security",
      description: "SSO, data encryption, and compliance with major security standards.",
    },
    {
      icon: Users,
      title: "Dedicated Support",
      description: "Priority support with dedicated account managers for enterprise teams.",
    },
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "VP of Engineering",
      company: "TechFlow Inc.",
      quote: "FLOWN transformed how our engineering team works. We've seen a massive improvement in code quality and shipping speed.",
    },
    {
      name: "Michael Roberts",
      role: "Head of Product",
      company: "Innovate Labs",
      quote: "The team focus sessions have become essential to our sprint planning. Our team alignment has never been better.",
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
              FLOWN for Teams
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Empower your organization with collective focus. Build a culture of deep work and sustainable productivity.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Stats Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {benefits.map((benefit, index) => (
              <div key={index} className="card-ios ios-shadow-lg p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-ios-blue/10 flex items-center justify-center mx-auto mb-6">
                  <benefit.icon size={32} className="text-ios-blue" />
                </div>
                <div className="text-5xl font-bold text-ios-blue mb-2">{benefit.stat}</div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {benefit.title}
                </h3>
                <p className="text-foreground/60">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* Features Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Enterprise-Grade Features
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
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

          {/* Testimonials Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Trusted by Leading Teams
            </h2>
            <div className="grid md:grid-cols-2 gap-8">
              {testimonials.map((testimonial, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-8">
                  <p className="text-foreground/80 mb-6 italic">
                    &ldquo;{testimonial.quote}&rdquo;
                  </p>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center text-white font-bold">
                      {testimonial.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className="font-semibold text-foreground">{testimonial.name}</div>
                      <div className="text-sm text-foreground/60">{testimonial.role}</div>
                      <div className="text-sm text-ios-blue">{testimonial.company}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Ready to Transform Your Team&apos;s Focus?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Schedule a demo to see how FLOWN can help your team achieve deep work at scale.
            </p>
            <div className="flex justify-center gap-4">
              <a
                href="/contact"
                className="btn-ios btn-primary inline-block text-lg"
              >
                Schedule Demo
              </a>
              <a
                href="/pricing"
                className="btn-ios inline-block text-lg bg-ios-gray-100 dark:bg-ios-gray-800"
              >
                View Pricing
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}