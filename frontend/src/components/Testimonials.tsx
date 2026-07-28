"use client";

import { useState } from "react";
import { Star, ChevronLeft, ChevronRight } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Software Engineer",
    content: "FLOWN has completely transformed how I work. The body doubling sessions keep me accountable without feeling pressured. I've never been more productive.",
    rating: 5,
    avatar: "SC",
  },
  {
    name: "Marcus Johnson",
    role: "Writer & ADHD Coach",
    content: "As someone with ADHD, I've tried every productivity tool out there. FLOWN is different - it actually works with my brain, not against it.",
    rating: 5,
    avatar: "MJ",
  },
  {
    name: "Emily Rodriguez",
    role: "Startup Founder",
    content: "The facilitated sessions are incredible. Having a gentle guide keeps me on track without breaking my flow state. Game changer for deep work.",
    rating: 5,
    avatar: "ER",
  },
];

export default function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16 animate-slide-up">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-foreground">
            Loved by thousands
          </h2>
          <p className="text-xl text-foreground/70 max-w-2xl mx-auto">
            See what our community has to say
          </p>
        </div>

        <div className="max-w-4xl mx-auto animate-slide-up" style={{ animationDelay: "0.2s" }}>
          <div className="card-ios ios-shadow-lg p-8 md:p-12 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-ios-blue via-ios-purple to-ios-pink" />
            
            <div className="flex flex-col items-center text-center">
              <div className="flex gap-1 mb-6">
                {[...Array(testimonials[currentIndex].rating)].map((_, i) => (
                  <Star key={i} size={20} className="fill-ios-orange text-ios-orange" />
                ))}
              </div>

              <blockquote className="text-2xl md:text-3xl font-medium text-foreground mb-8 leading-relaxed">
                &ldquo;{testimonials[currentIndex].content}&rdquo;
              </blockquote>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-ios-blue to-ios-purple flex items-center justify-center text-white font-bold text-xl">
                  {testimonials[currentIndex].avatar}
                </div>
                <div className="text-left">
                  <div className="font-semibold text-foreground text-lg">
                    {testimonials[currentIndex].name}
                  </div>
                  <div className="text-foreground/60">
                    {testimonials[currentIndex].role}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <button
                  onClick={prevTestimonial}
                  className="p-3 rounded-full bg-ios-gray-100 dark:bg-ios-gray-800 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700 transition-colors"
                  aria-label="Previous testimonial"
                >
                  <ChevronLeft size={24} />
                </button>

                <div className="flex gap-2">
                  {testimonials.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-all duration-300 ${
                        index === currentIndex
                          ? "bg-ios-blue w-8"
                          : "bg-ios-gray-300 dark:bg-ios-gray-600"
                      }`}
                      aria-label={`Go to testimonial ${index + 1}`}
                    />
                  ))}
                </div>

                <button
                  onClick={nextTestimonial}
                  className="p-3 rounded-full bg-ios-gray-100 dark:bg-ios-gray-800 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700 transition-colors"
                  aria-label="Next testimonial"
                >
                  <ChevronRight size={24} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
