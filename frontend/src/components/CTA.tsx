"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";

export default function CTA() {
  const { user, loading } = useAuth();

  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="card-ios ios-shadow-lg p-12 md:p-16 text-center relative overflow-hidden animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-500/5 to-ios-orange/5" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              {!loading && user ? `Ready to get back in the zone, ${user.firstName || user.email?.split('@')[0]}?` : "Ready to find your flow?"}
            </h2>
            
            <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              {!loading && user 
                ? "Your next breakthrough is just one session away. Join your focus community and boost your productivity today."
                : "Join thousands of people who have transformed their focus with FLOWN. Start your free trial today."}
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 h-[60px]">
              {loading ? (
                <>
                  <div className="w-48 h-[60px] bg-foreground/5 animate-pulse rounded-2xl" />
                  <div className="w-40 h-[60px] bg-foreground/5 animate-pulse rounded-2xl" />
                </>
              ) : user ? (
                <>
                  <Link href="/dashboard" className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2">
                    Enter Dashboard
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/my-sessions" className="btn-ios btn-secondary text-lg px-8 py-4">
                    My Sessions
                  </Link>
                </>
              ) : (
                <>
                  <Link href="#signup" className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2">
                    Start free trial
                    <ArrowRight size={20} />
                  </Link>
                  <Link href="/#pricing" className="btn-ios btn-secondary text-lg px-8 py-4">
                    View pricing
                  </Link>
                </>
              )}
            </div>
            
            <p className="mt-6 text-sm text-foreground/50">
              {!loading && user ? "Keep up the momentum • Your focus group is waiting" : "No credit card required • Cancel anytime"}
            </p>
          </div>
          
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-ios-blue/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-ios-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>
      </div>
    </section>
  );
}
