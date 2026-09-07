"use client";

import Link from "next/link";
import { ArrowRight, Play } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

export default function Hero() {
  const { user, loading } = useAuth();

  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-ios-gray-900 dark:via-black dark:to-ios-gray-800 -z-10" />

      <div className="max-w-5xl mx-auto text-center">
        <div className="animate-slide-up">
          <span className="inline-block px-4 py-2 rounded-full bg-ios-blue/10 text-ios-blue text-sm font-medium mb-6 transition-all duration-300">
            {!loading && user ? `Welcome back, ${user.firstName || user.email?.split('@')[0]} 👋` : "Neuroscience-backed focus"}
          </span>

          {!loading && user ? (
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground animate-fade-in">
              Welcome back,
              <br />
              <span className="text-ios-blue">{user.firstName || user.email?.split('@')[0]}</span>.
            </h1>
          ) : (
            <h1 className="font-sf-pro text-center tracking-tight leading-[1.05]">
              {/* Primary - Body Doubling */}
              <span className="block text-[clamp(3rem,10vw,5.5rem)] font-semibold bg-gradient-to-b from-[#1c1c1e] to-[#3a3a3c] bg-clip-text text-transparent dark:from-[#f5f5f7] dark:to-[#86868b]">
                Body Doubling
              </span>

              {/* Subhead - Less distraction. */}
              <span className="block mt-1 text-[clamp(1.8rem,5vw,3.2rem)] font-light text-[#86868b] tracking-[0.02em]">
                Less distraction.
              </span>

              {/* Hero - More feel-good focus. - iPhone-style pill */}
              <span className="block mt-2">
                <span className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#007aff]/10 border border-[#007aff]/20 backdrop-blur-sm">
                  <span className="text-[clamp(1.8rem,5vw,3rem)] font-medium text-[#007aff] tracking-tight">
                    More
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#007aff]/30" />
                  <span className="text-[clamp(1.8rem,5vw,3rem)] font-medium text-[#007aff] tracking-tight">
                    feel-good
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#007aff]/30" />
                  <span className="text-[clamp(1.8rem,5vw,3rem)] font-medium text-[#007aff] tracking-tight">
                    focus.
                  </span>
                </span>
              </span>
            </h1>
          )}

          {!loading && user ? (
            <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed animate-fade-in">
              Ready for another productive co-working session? Connect with your virtual body doubling partners and hit your goals today.
            </p>
          ) : (
            <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed">
              Work silently alongside others in virtual body doubling sessions that boost focus and accountability. Especially effective for those with ADHD.
            </p>
          )}

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 h-[60px]">
            {loading ? (
              <>
                <div className="w-52 h-[60px] bg-foreground/5 animate-pulse rounded-2xl" />
                <div className="w-40 h-[60px] bg-foreground/5 animate-pulse rounded-2xl" />
              </>
            ) : user ? (
              <>
                <Link href="/dashboard" className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2">
                  Go to Dashboard
                  <ArrowRight size={20} />
                </Link>
                <Link href="/my-sessions" className="btn-ios btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                  My Sessions
                </Link>
              </>
            ) : (
              <>
                <Link href="/pricing" className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2">
                  Start your free trial
                  <ArrowRight size={20} />
                </Link>
                <Link href="/how-it-works" className="btn-ios btn-secondary text-lg px-8 py-4 flex items-center gap-2">
                  <Play size={20} className="fill-current" />
                  Watch demo
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="relative animate-scale-in" style={{ animationDelay: "0.3s" }}>
          <div className="card-ios ios-shadow-lg p-8 md:p-12 bg-gradient-to-br from-white to-gray-50 dark:from-ios-gray-800 dark:to-ios-gray-900">
            <div className="grid grid-cols-3 gap-8">
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-ios-blue mb-2">50k+</div>
                <div className="text-sm text-foreground/60">Active members</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-ios-green mb-2">2M+</div>
                <div className="text-sm text-foreground/60">Focus hours</div>
              </div>
              <div className="text-center">
                <div className="text-4xl md:text-5xl font-bold text-ios-orange mb-2">4.9★</div>
                <div className="text-sm text-foreground/60">App rating</div>
              </div>
            </div>
          </div>

          <div className="absolute -top-4 -left-4 w-24 h-24 bg-ios-blue/20 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-ios-purple/20 rounded-full blur-3xl animate-float" style={{ animationDelay: "1s" }} />
        </div>
      </div>
    </section>
  );
}
