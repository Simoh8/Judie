"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Heart,
  Brain,
  Users,
  Zap,
  Globe,
  Award,
  ArrowRight,
  Quote,
} from "lucide-react";

const values = [
  {
    icon: Brain,
    title: "Science-first",
    description:
      "Everything we build is rooted in neuroscience. Body doubling has measurable effects on focus — we didn't invent it, we perfected it.",
    color: "text-ios-blue",
    bg: "bg-ios-blue/10",
  },
  {
    icon: Heart,
    title: "Radical empathy",
    description:
      "We built FLOWN for brains that struggle with traditional productivity advice — especially those with ADHD, anxiety, or executive function differences.",
    color: "text-red-500",
    bg: "bg-red-50 dark:bg-red-900/20",
  },
  {
    icon: Users,
    title: "Community-driven",
    description:
      "Our members shape everything from session formats to facilitation style. The community is the product — we just build the space.",
    color: "text-ios-green",
    bg: "bg-ios-green/10",
  },
  {
    icon: Zap,
    title: "Deep work over busy work",
    description:
      "We don't celebrate hustle culture. We celebrate real, sustainable focus that leaves you energised — not burned out.",
    color: "text-ios-orange",
    bg: "bg-ios-orange/10",
  },
];

const team = [
  {
    name: "Dr. Aliya Khatun",
    role: "Co-founder & Head of Science",
    bio: "Cognitive neuroscientist with a decade of research into attention disorders. Built FLOWN after seeing how body doubling transformed her own ADHD patients.",
    initials: "AK",
    gradient: "from-ios-blue to-purple-500",
  },
  {
    name: "Marcus Webb",
    role: "Co-founder & CEO",
    bio: "Former remote team lead who struggled with distraction. Created the first FLOWN sessions in a Zoom call with 12 friends — and never looked back.",
    initials: "MW",
    gradient: "from-ios-green to-teal-400",
  },
  {
    name: "Priya Sharma",
    role: "Head of Community",
    bio: "Community builder and certified ADHD coach. Ensures every FLOWN session feels safe, inclusive, and genuinely productive for all kinds of minds.",
    initials: "PS",
    gradient: "from-ios-orange to-red-400",
  },
  {
    name: "Liam O'Brien",
    role: "Lead Engineer",
    bio: "Full-stack engineer and productivity nerd. Obsessed with building tools that get out of your way and let you focus on what actually matters.",
    initials: "LO",
    gradient: "from-purple-500 to-ios-blue",
  },
];

const milestones = [
  { year: "2021", event: "FLOWN founded after a 12-person body-doubling experiment on Zoom." },
  { year: "2022", event: "Launched beta to 500 users. Waited lists opened within days." },
  { year: "2023", event: "Crossed 10,000 members and 500,000 focus hours completed." },
  { year: "2024", event: "Introduced expert-facilitated deep-work marathons and team plans." },
  { year: "2025", event: "50,000 active members. 2 million+ focus hours and counting." },
];

const stats = [
  { value: "50k+", label: "Active Members", color: "text-ios-blue" },
  { value: "2M+", label: "Focus Hours Logged", color: "text-ios-green" },
  { value: "94%", label: "Members feel more productive", color: "text-ios-orange" },
  { value: "4.9★", label: "Average session rating", color: "text-purple-500" },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen">
      <Navbar />

      {/* ── Hero ── */}
      <section className="min-h-[60vh] flex items-center justify-center pt-24 pb-16 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-ios-gray-900 dark:via-black dark:to-ios-gray-800 -z-10" />
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-ios-blue/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-20 -right-20 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl" />

        <div className="max-w-4xl mx-auto text-center animate-slide-up relative z-10">
          <span className="inline-block px-4 py-2 rounded-full bg-ios-blue/10 text-ios-blue text-sm font-medium mb-6">
            Our story
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
            We believe in
            <br />
            <span className="text-ios-blue">focused humans.</span>
          </h1>
          <p className="text-xl md:text-2xl text-foreground/70 max-w-3xl mx-auto leading-relaxed">
            FLOWN was built for people who know they&apos;re capable of great
            work — but keep getting in their own way. We exist to change that,
            one session at a time.
          </p>
        </div>
      </section>

      {/* ── Stats ── */}
      <section className="py-16 px-6 bg-gray-50 dark:bg-ios-gray-900/50">
        <div className="max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.map((stat, i) => (
              <div
                key={stat.label}
                className="card-ios text-center animate-slide-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className={`text-4xl md:text-5xl font-bold mb-2 ${stat.color}`}>
                  {stat.value}
                </div>
                <div className="text-sm text-foreground/60">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Mission ── */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="card-ios ios-shadow-lg p-10 md:p-16 relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-500/5 to-transparent" />
            <div className="relative z-10">
              <Quote size={48} className="text-ios-blue/30 mb-6" />
              <blockquote className="text-2xl md:text-3xl font-semibold text-foreground leading-relaxed mb-8">
                "The hardest part of any task isn&apos;t the work itself — it&apos;s
                getting started and staying present. FLOWN exists to solve
                exactly that."
              </blockquote>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  AK
                </div>
                <div>
                  <div className="font-semibold text-foreground">Dr. Aliya Khatun</div>
                  <div className="text-foreground/60 text-sm">Co-founder & Head of Science</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Values ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-ios-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              What we stand for
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              Four beliefs that shape every decision we make
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {values.map((v, i) => (
              <div
                key={v.title}
                className="card-ios animate-slide-up hover:scale-[1.02] transition-transform duration-300"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`${v.bg} ${v.color} w-14 h-14 rounded-2xl flex items-center justify-center mb-5`}
                >
                  <v.icon size={28} />
                </div>
                <h3 className="text-xl font-semibold mb-3 text-foreground">{v.title}</h3>
                <p className="text-foreground/70 leading-relaxed">{v.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Timeline ── */}
      <section className="py-24 px-6">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              How we got here
            </h2>
            <p className="text-xl text-foreground/70">From a Zoom experiment to a global focus community</p>
          </div>

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-ios-blue via-purple-500 to-ios-orange hidden sm:block" />

            <div className="space-y-8">
              {milestones.map((m, i) => (
                <div
                  key={m.year}
                  className="flex gap-6 animate-slide-up"
                  style={{ animationDelay: `${i * 0.1}s` }}
                >
                  {/* Year bubble */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center shadow-md z-10 relative">
                      <span className="text-white text-xs font-bold">{m.year}</span>
                    </div>
                  </div>
                  {/* Card */}
                  <div className="card-ios flex-1 hover:scale-[1.01] transition-transform duration-200">
                    <p className="text-foreground/80 leading-relaxed">{m.event}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-ios-gray-900/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16 animate-slide-up">
            <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
              Meet the team
            </h2>
            <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
              A small, passionate crew obsessed with helping people do their best work
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {team.map((member, i) => (
              <div
                key={member.name}
                className="card-ios animate-slide-up hover:scale-[1.03] transition-transform duration-300 text-center"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div
                  className={`w-20 h-20 rounded-full bg-gradient-to-br ${member.gradient} flex items-center justify-center text-white text-2xl font-bold mx-auto mb-5 shadow-lg`}
                >
                  {member.initials}
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-1">{member.name}</h3>
                <p className="text-ios-blue text-sm font-medium mb-3">{member.role}</p>
                <p className="text-foreground/60 text-sm leading-relaxed">{member.bio}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Press / Awards ── */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex items-center justify-center gap-3 mb-10">
            <Award size={24} className="text-ios-orange" />
            <h2 className="text-2xl font-bold text-foreground">As featured in</h2>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
            {["Forbes", "TechCrunch", "The Guardian", "Wired", "Fast Company"].map((outlet) => (
              <span key={outlet} className="text-xl font-bold text-foreground tracking-tight">
                {outlet}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-24 px-6 bg-gray-50 dark:bg-ios-gray-900/50">
        <div className="max-w-4xl mx-auto">
          <div className="card-ios ios-shadow-lg p-12 md:p-16 text-center relative overflow-hidden animate-slide-up">
            <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-500/5 to-ios-orange/5" />
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-ios-blue/10 rounded-full blur-3xl animate-float" />
            <div
              className="absolute -bottom-10 -right-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl animate-float"
              style={{ animationDelay: "1.5s" }}
            />
            <div className="relative z-10">
              <Globe size={40} className="text-ios-blue mx-auto mb-6" />
              <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
                Join the community
              </h2>
              <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
                Thousands of people are already doing their best work with FLOWN.
                Your spot is waiting.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link
                  href="#signup"
                  className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2"
                >
                  Start for free
                  <ArrowRight size={20} />
                </Link>
                <Link href="/#how-it-works" className="btn-ios btn-secondary text-lg px-8 py-4">
                  How it works
                </Link>
              </div>
              <p className="mt-6 text-sm text-foreground/50">No credit card required • Cancel anytime</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
