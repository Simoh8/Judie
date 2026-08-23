"use client";

import { useState } from "react";
import { Search, Book, MessageSquare, Users, Clock, ChevronRight, Zap, Shield, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function HelpCenterPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = [
    { id: "getting-started", name: "Getting Started", icon: Zap },
    { id: "sessions", name: "Sessions", icon: Clock },
    { id: "account", name: "Account & Billing", icon: Shield },
    { id: "technical", name: "Technical Support", icon: Lock },
  ];

  const helpArticles = [
    {
      id: 1,
      title: "How to join your first focus session",
      category: "getting-started",
      content: "Learn how to browse sessions, book your spot, and join live focus sessions.",
    },
    {
      id: 2,
      title: "Understanding session types",
      category: "sessions",
      content: "Compare Focus Sprints, Deep Work, and Marathon sessions to find what works for you.",
    },
    {
      id: 3,
      title: "Resetting your password",
      category: "account",
      content: "Step-by-step guide to recovering your account if you've forgotten your password.",
    },
    {
      id: 4,
      title: "Managing your subscription",
      category: "account",
      content: "How to upgrade, downgrade, or cancel your FLOWN subscription.",
    },
    {
      id: 5,
      title: "Troubleshooting video issues",
      category: "technical",
      content: "Common video problems and how to fix them for smooth session participation.",
    },
    {
      id: 6,
      title: "Using the mobile app",
      category: "getting-started",
      content: "Guide to using FLOWN on your mobile device for focus on the go.",
    },
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         article.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const quickLinks = [
    { title: "Getting Started Guide", href: "#", icon: Book },
    { title: "Session FAQ", href: "#", icon: Clock },
    { title: "Contact Support", href: "/contact", icon: MessageSquare },
    { title: "Community Forum", href: "#", icon: Users },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-ios-gray-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Help Center
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Find answers to your questions and get the most out of FLOWN.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Search */}
          <div className="max-w-2xl mx-auto mb-12">
            <div className="relative">
              <Search size={24} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
              <input
                type="text"
                placeholder="Search for help..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-14 pr-4 py-4 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground text-lg"
              />
            </div>
          </div>

          {/* Quick Links */}
          <div className="grid md:grid-cols-4 gap-6 mb-16">
            {quickLinks.map((link, index) => (
              <a
                key={index}
                href={link.href}
                className="card-ios ios-shadow-lg p-6 flex items-center gap-4 hover:border-ios-blue transition-colors"
              >
                <div className="w-12 h-12 rounded-lg bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
                  <link.icon size={24} className="text-ios-blue" />
                </div>
                <span className="font-medium text-foreground">{link.title}</span>
                <ChevronRight size={20} className="text-foreground/40 ml-auto" />
              </a>
            ))}
          </div>

          {/* Categories */}
          <div className="mb-12">
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  selectedCategory === "all"
                    ? "bg-ios-blue text-white"
                    : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground/60 hover:text-foreground"
                }`}
              >
                All Topics
              </button>
              {categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                    selectedCategory === category.id
                      ? "bg-ios-blue text-white"
                      : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground/60 hover:text-foreground"
                  }`}
                >
                  <category.icon size={16} />
                  {category.name}
                </button>
              ))}
            </div>
          </div>

          {/* Help Articles */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-20">
            {filteredArticles.map((article) => (
              <div key={article.id} className="card-ios ios-shadow-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  {article.title}
                </h3>
                <p className="text-foreground/60 mb-4">{article.content}</p>
                <button className="text-ios-blue hover:underline flex items-center gap-1 text-sm font-medium">
                  Read more <ChevronRight size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Contact Support */}
          <div className="card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Still Need Help?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Our support team is here to help you get the most out of FLOWN.
            </p>
            <a
              href="/contact"
              className="btn-ios btn-primary inline-block text-lg"
            >
              Contact Support
            </a>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}