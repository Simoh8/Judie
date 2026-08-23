"use client";

import { useState } from "react";
import { Check, Crown, Zap, Users, Building2, HeadphonesIcon } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PricingPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  const plans = [
    {
      name: "Free",
      icon: Zap,
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started with focused work.",
      features: [
        "5 focus sessions per month",
        "Basic session types",
        "Community access",
        "Progress tracking",
        "Email support",
      ],
      cta: "Get Started",
      popular: false,
    },
    {
      name: "Pro",
      icon: Crown,
      price: { monthly: 19, yearly: 15 },
      description: "For serious focus practitioners and professionals.",
      features: [
        "Unlimited focus sessions",
        "All session types",
        "Priority booking",
        "Advanced analytics",
        "Custom focus goals",
        "Priority support",
        "Mobile app access",
      ],
      cta: "Start Pro Trial",
      popular: true,
    },
    {
      name: "Teams",
      icon: Building2,
      price: { monthly: 49, yearly: 39 },
      description: "For teams and organizations that need to focus together.",
      features: [
        "Everything in Pro",
        "Team dashboard",
        "Admin controls",
        "Team analytics",
        "Custom branding",
        "Dedicated support",
        "SLA guarantee",
        "API access",
      ],
      cta: "Contact Sales",
      popular: false,
    },
  ];

  const faqs = [
    {
      question: "Can I change plans anytime?",
      answer: "Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately, and we'll prorate your billing accordingly.",
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, MasterCard, American Express) and PayPal. For enterprise plans, we also accept bank transfers.",
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "Yes, we offer a 14-day free trial for both Pro and Teams plans. No credit card required to start your trial.",
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. If you're not satisfied, contact our support team for a full refund.",
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
              Simple, Transparent Pricing
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Choose the plan that fits your focus goals. Start free, upgrade when you're ready.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Billing Toggle */}
          <div className="flex justify-center items-center gap-4 mb-12">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-6 py-3 rounded-full font-medium transition-colors ${
                billingPeriod === "monthly"
                  ? "bg-ios-blue text-white"
                  : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground/60 hover:text-foreground"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-6 py-3 rounded-full font-medium transition-colors relative ${
                billingPeriod === "yearly"
                  ? "bg-ios-blue text-white"
                  : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground/60 hover:text-foreground"
              }`}
            >
              Yearly
              <span className="absolute -top-2 -right-2 bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                Save 20%
              </span>
            </button>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-3 gap-8 mb-20">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`card-ios ios-shadow-lg p-8 relative ${
                  plan.popular ? "border-2 border-ios-blue" : ""
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ios-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                    Most Popular
                  </div>
                )}
                <div className="w-16 h-16 rounded-full bg-ios-blue/10 flex items-center justify-center mb-6">
                  <plan.icon size={32} className="text-ios-blue" />
                </div>
                <h3 className="text-2xl font-bold text-foreground mb-2">
                  {plan.name}
                </h3>
                <p className="text-foreground/60 mb-6">{plan.description}</p>
                <div className="mb-6">
                  <span className="text-4xl font-bold text-foreground">
                    ${plan.price[billingPeriod]}
                  </span>
                  <span className="text-foreground/60">
                    /{billingPeriod === "monthly" ? "month" : "month (billed yearly)"}
                  </span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                      <span className="text-foreground/80">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  className={`w-full py-3 rounded-xl font-medium transition-colors ${
                    plan.popular
                      ? "btn-ios btn-primary"
                      : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              {faqs.map((faq, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-foreground/60">{faq.answer}</p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Not Sure Which Plan to Choose?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Our team can help you find the perfect plan for your needs. Get in touch for personalized recommendations.
            </p>
            <a
              href="/contact"
              className="btn-ios btn-primary inline-block text-lg"
            >
              Contact Sales
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}