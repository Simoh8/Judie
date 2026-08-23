"use client";

import { Download, Mail, ExternalLink, FileText, TrendingUp, Award, Globe, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PressPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const pressKit = [
    {
      title: "Logo Pack",
      description: "High-resolution logos in various formats and color schemes.",
      size: "2.4 MB",
      format: "ZIP",
    },
    {
      title: "Brand Guidelines",
      description: "Complete brand book with usage guidelines and examples.",
      size: "1.8 MB",
      format: "PDF",
    },
    {
      title: "Product Screenshots",
      description: "Professional screenshots of the FLOWN platform.",
      size: "4.2 MB",
      format: "ZIP",
    },
    {
      title: "Executive Bios",
      description: "Biographies and headshots of the leadership team.",
      size: "0.8 MB",
      format: "PDF",
    },
  ];

  const pressCoverage = [
    {
      publication: "TechCrunch",
      title: "FLOWN raises $10M to help remote teams focus",
      date: "2024-01-10",
      excerpt: "The platform uses science-backed methods to improve productivity for distributed teams.",
      link: "#",
    },
    {
      publication: "Forbes",
      title: "The Future of Remote Work: Deep Focus Sessions",
      date: "2023-12-15",
      excerpt: "How FLOWN is pioneering a new approach to productivity in the remote work era.",
      link: "#",
    },
    {
      publication: "Wired",
      title: "Can Group Focus Sessions Fix Remote Work Burnout?",
      date: "2023-11-20",
      excerpt: "An in-depth look at the science behind FLOWN's approach to sustainable productivity.",
      link: "#",
    },
  ];

  const companyFacts = [
    {
      icon: Users,
      value: "50,000+",
      label: "Active Users",
    },
    {
      icon: Globe,
      value: "120+",
      label: "Countries",
    },
    {
      icon: TrendingUp,
      value: "300%",
      label: "YoY Growth",
    },
    {
      icon: Award,
      value: "15+",
      label: "Industry Awards",
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
              Press & Media
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Latest news, resources, and information about FLOWN for journalists and media professionals.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Company Facts */}
          <div className="grid md:grid-cols-4 gap-8 mb-20">
            {companyFacts.map((fact, index) => (
              <div key={index} className="card-ios ios-shadow-lg p-8 text-center">
                <div className="w-14 h-14 rounded-full bg-ios-blue/10 flex items-center justify-center mx-auto mb-4">
                  <fact.icon size={28} className="text-ios-blue" />
                </div>
                <div className="text-3xl font-bold text-foreground mb-2">{fact.value}</div>
                <div className="text-foreground/60">{fact.label}</div>
              </div>
            ))}
          </div>

          {/* Press Kit */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Press Kit
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              {pressKit.map((item, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-ios-blue/10 flex items-center justify-center">
                        <FileText size={24} className="text-ios-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{item.title}</h3>
                        <p className="text-sm text-foreground/60">{item.size} • {item.format}</p>
                      </div>
                    </div>
                    <button className="p-2 rounded-lg hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors">
                      <Download size={20} className="text-foreground/60" />
                    </button>
                  </div>
                  <p className="text-foreground/60 text-sm">{item.description}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Press Coverage */}
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Recent Coverage
            </h2>
            <div className="space-y-6">
              {pressCoverage.map((article, index) => (
                <div key={index} className="card-ios ios-shadow-lg p-8">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-ios-blue/10 text-ios-blue text-sm font-medium">
                          {article.publication}
                        </span>
                        <span className="text-sm text-foreground/60">
                          {new Date(article.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{article.title}</h3>
                      <p className="text-foreground/60">{article.excerpt}</p>
                    </div>
                    <a
                      href={article.link}
                      className="p-2 rounded-lg hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink size={20} className="text-foreground/60" />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contact Section */}
          <div className="card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <div className="max-w-2xl mx-auto text-center">
              <h2 className="text-3xl font-bold text-foreground mb-4">
                Press Inquiries
              </h2>
              <p className="text-foreground/60 mb-8">
                For press inquiries, interview requests, or media partnerships, please reach out to our press team.
              </p>
              <a
                href="mailto:press@flown.com"
                className="btn-ios btn-primary inline-flex items-center gap-2 text-lg"
              >
                <Mail size={20} />
                press@flown.com
              </a>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}