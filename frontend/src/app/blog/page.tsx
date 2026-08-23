"use client";

import { useState } from "react";
import { Calendar, User, ArrowRight, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function BlogPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const categories = ["all", "Productivity", "Focus Science", "Company News", "Tips & Tricks"];

  const blogPosts = [
    {
      id: 1,
      title: "The Science of Deep Work: Why Focus Sessions Work",
      excerpt: "Explore the neuroscience behind focused work and how structured sessions can boost your productivity by up to 40%.",
      author: "Dr. Aliya Khatun",
      date: "2024-01-15",
      category: "Focus Science",
      readTime: "8 min read",
      image: "🧠",
    },
    {
      id: 2,
      title: "10 Tips for Your First Focus Session",
      excerpt: "Getting started with focused work? Here are our top tips for making the most of your first FLOWN session.",
      author: "Sarah Chen",
      date: "2024-01-10",
      category: "Tips & Tricks",
      readTime: "5 min read",
      image: "💡",
    },
    {
      id: 3,
      title: "FLOWN 2.0: What's New and Improved",
      excerpt: "We've launched major updates to our platform including new session types, enhanced analytics, and team features.",
      author: "Team FLOWN",
      date: "2024-01-05",
      category: "Company News",
      readTime: "6 min read",
      image: "🚀",
    },
    {
      id: 4,
      title: "Building a Focus-Friendly Remote Culture",
      excerpt: "How distributed teams can maintain productivity and connection through shared focus sessions.",
      author: "Michael Roberts",
      date: "2023-12-28",
      category: "Productivity",
      readTime: "7 min read",
      image: "🏢",
    },
    {
      id: 5,
      title: "The Pomodoro Technique vs. Focus Sessions",
      excerpt: "Comparing traditional time management methods with modern focus session approaches.",
      author: "Dr. Aliya Khatun",
      date: "2023-12-20",
      category: "Focus Science",
      readTime: "10 min read",
      image: "⏱️",
    },
    {
      id: 6,
      title: "How to Handle Distractions During Deep Work",
      excerpt: "Practical strategies for maintaining focus when digital and physical distractions arise.",
      author: "Sarah Chen",
      date: "2023-12-15",
      category: "Tips & Tricks",
      readTime: "6 min read",
      image: "🎯",
    },
  ];

  const filteredPosts = blogPosts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.excerpt.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-white dark:bg-ios-gray-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-7xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              FLOWN Blog
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Insights, tips, and stories about focused work, productivity, and the science of deep concentration.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Search and Filter */}
          <div className="mb-12">
            <div className="flex flex-col md:flex-row gap-4 mb-8">
              <div className="relative flex-1">
                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-foreground/40" />
                <input
                  type="text"
                  placeholder="Search articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                    selectedCategory === category
                      ? "bg-ios-blue text-white"
                      : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground/60 hover:text-foreground"
                  }`}
                >
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Blog Posts Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {filteredPosts.map((post) => (
              <article key={post.id} className="card-ios ios-shadow-lg overflow-hidden">
                <div className="h-48 bg-gradient-to-br from-ios-blue/10 to-purple-500/10 flex items-center justify-center text-6xl">
                  {post.image}
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-4 mb-4 text-sm text-foreground/60">
                    <span className="px-3 py-1 rounded-full bg-ios-blue/10 text-ios-blue">
                      {post.category}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar size={14} />
                      {new Date(post.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </span>
                    <span>{post.readTime}</span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground mb-3 hover:text-ios-blue transition-colors cursor-pointer">
                    {post.title}
                  </h2>
                  <p className="text-foreground/60 mb-4 line-clamp-3">
                    {post.excerpt}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User size={16} className="text-foreground/40" />
                      <span className="text-sm text-foreground/60">{post.author}</span>
                    </div>
                    <button className="text-ios-blue hover:underline flex items-center gap-1 text-sm font-medium">
                      Read more <ArrowRight size={14} />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>

          {/* Newsletter Section */}
          <div className="card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5 text-center">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Stay Focused with Our Newsletter
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Get the latest insights on focused work, productivity tips, and FLOWN updates delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
              />
              <button className="btn-ios btn-primary whitespace-nowrap">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}