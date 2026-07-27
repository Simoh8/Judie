"use client";

import { ArrowRight } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-5xl mx-auto">
        <div className="card-ios ios-shadow-lg p-12 md:p-16 text-center relative overflow-hidden animate-slide-up">
          <div className="absolute inset-0 bg-gradient-to-br from-ios-blue/5 via-purple-500/5 to-ios-orange/5" />
          
          <div className="relative z-10">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">
              Ready to find your flow?
            </h2>
            
            <p className="text-xl text-foreground/70 mb-10 max-w-2xl mx-auto leading-relaxed">
              Join thousands of people who have transformed their focus with FLOWN. Start your free trial today.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button className="btn-ios btn-primary text-lg px-8 py-4 flex items-center gap-2">
                Start free trial
                <ArrowRight size={20} />
              </button>
              <button className="btn-ios btn-secondary text-lg px-8 py-4">
                View pricing
              </button>
            </div>
            
            <p className="mt-6 text-sm text-foreground/50">
              No credit card required • Cancel anytime
            </p>
          </div>
          
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-ios-blue/10 rounded-full blur-3xl animate-float" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-ios-purple/10 rounded-full blur-3xl animate-float" style={{ animationDelay: "1.5s" }} />
        </div>
      </div>
    </section>
  );
}
