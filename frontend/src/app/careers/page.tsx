"use client";

import { MapPin, DollarSign, Clock, Heart, Rocket, Users, Target, Zap } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function CareersPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const openPositions = [
    {
      title: "Senior Frontend Developer",
      department: "Engineering",
      location: "Remote",
      type: "Full-time",
      salary: "$120k - $160k",
      description: "Join our engineering team to build beautiful, performant user interfaces for our focus platform.",
    },
    {
      title: "Product Designer",
      department: "Design",
      location: "Remote",
      type: "Full-time",
      salary: "$100k - $140k",
      description: "Shape the future of focused work through intuitive design and user-centered thinking.",
    },
    {
      title: "Customer Success Manager",
      department: "Customer Success",
      location: "Remote",
      type: "Full-time",
      salary: "$80k - $110k",
      description: "Help our customers achieve their focus goals and build lasting relationships.",
    },
    {
      title: "Marketing Manager",
      department: "Marketing",
      location: "Remote",
      type: "Full-time",
      salary: "$90k - $130k",
      description: "Drive growth and brand awareness for the leading focus and productivity platform.",
    },
  ];

  const benefits = [
    {
      icon: Heart,
      title: "Health & Wellness",
      description: "Comprehensive health, dental, and vision insurance for you and your family.",
    },
    {
      icon: Clock,
      title: "Flexible Work",
      description: "Work from anywhere with flexible hours that fit your life.",
    },
    {
      icon: DollarSign,
      title: "Competitive Compensation",
      description: "Salary plus equity and performance bonuses.",
    },
    {
      icon: Target,
      title: "Growth Opportunities",
      description: "Learning budget, conference attendance, and career development support.",
    },
    {
      icon: Users,
      title: "Amazing Team",
      description: "Work with passionate, talented people who care about making a difference.",
    },
    {
      icon: Zap,
      title: "Focus-First Culture",
      description: "We practice what we preach with regular team focus sessions.",
    },
  ];

  const values = [
    {
      icon: Rocket,
      title: "Innovation First",
      description: "We constantly push boundaries to help people achieve their best focus.",
    },
    {
      icon: Users,
      title: "Community Driven",
      description: "Our decisions are guided by what's best for our community of focused workers.",
    },
    {
      icon: Heart,
      title: "People Centric",
      description: "We believe in taking care of our team so they can take care of our customers.",
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
              Careers at FLOWN
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Join us in our mission to help millions of people achieve deep focus and meaningful work.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Values Section */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {values.map((value, index) => (
              <div key={index} className="card-ios ios-shadow-lg p-8 text-center">
                <div className="w-16 h-16 rounded-full bg-ios-blue/10 flex items-center justify-center mx-auto mb-6">
                  <value.icon size={32} className="text-ios-blue" />
                </div>
                <h3 className="text-xl font-semibold text-foreground mb-3">
                  {value.title}
                </h3>
                <p className="text-foreground/60">{value.description}</p>
              </div>
            ))}
          </div>

          {/* Benefits Section */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Why Work With Us
            </h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {benefits.map((benefit, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-8">
                  <div className="w-14 h-14 rounded-full bg-purple-500/10 flex items-center justify-center mb-6">
                    <benefit.icon size={28} className="text-purple-500" />
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

          {/* Open Positions */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Open Positions
            </h2>
            <div className="space-y-6">
              {openPositions.map((position, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-8">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                    <div>
                      <h3 className="text-2xl font-bold text-foreground mb-2">
                        {position.title}
                      </h3>
                      <div className="flex flex-wrap gap-4 text-sm text-foreground/60">
                        <span className="flex items-center gap-1">
                          <MapPin size={14} />
                          {position.location}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          {position.type}
                        </span>
                        <span className="flex items-center gap-1">
                          <DollarSign size={14} />
                          {position.salary}
                        </span>
                      </div>
                    </div>
                    <button className="btn-ios btn-primary whitespace-nowrap">
                      Apply Now
                    </button>
                  </div>
                  <p className="text-foreground/60 mb-4">{position.description}</p>
                  <div className="flex gap-2">
                    <span className="px-3 py-1 rounded-full bg-ios-blue/10 text-ios-blue text-sm">
                      {position.department}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Don&apos;t See Your Dream Role?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              We&apos;re always looking for talented people to join our team. Send us your resume and we&apos;ll keep you in mind for future opportunities.
            </p>
            <a
              href="/contact"
              className="btn-ios btn-primary inline-block text-lg"
            >
              Send Resume
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}