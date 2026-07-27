"use client";

import { ArrowRight, Play } from "lucide-react";

export default function Hero() {
  return (
    <section className="min-h-screen flex items-center justify-center pt-20 px-6 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-ios-gray-900 dark:via-black dark:to-ios-gray-800 -z-10" />
      
      <div className="max-w-5xl mx-auto text-center">
        <div className="animate-slide-up">
          <span className="inline-block px-4 py-2 rounded-full bg-ios-blue/10 text-ios-blue text-sm font-medium mb-6">
            Neuroscience-backed focus
          </span>
          
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-foreground">
            Less distraction.
            <br />
            <span className="text-ios-blue">More feel-good focus.</span>
          </h1>
          
          <p className="text-xl md:text-2xl text-foreground/70 mb-10 max-w-3xl mx-auto leading-relaxed">
            Work silently alongside others in virtual body doubling sessions that boost focus and accountability. Especially effective for those with ADHD.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <button className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2">
              Start your free trial
              <ArrowRight size={20} />
            </button>
            <button className="btn-ios btn-secondary text-lg px-8 py-4 flex items-center gap-2">
              <Play size={20} className="fill-current" />
              Watch demo
            </button>
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
