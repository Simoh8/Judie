"use client";

import { Shield, Eye, Lock, Cookie, Trash2, User } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function PrivacyPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sections = [
    {
      icon: Eye,
      title: "Information We Collect",
      content: [
        "Account information (name, email, password)",
        "Usage data (session participation, focus hours)",
        "Payment information (processed securely)",
        "Communication preferences",
        "Device and browser information",
      ],
    },
    {
      icon: Lock,
      title: "How We Protect Your Data",
      content: [
        "End-to-end encryption for sensitive data",
        "Regular security audits and penetration testing",
        "Compliance with GDPR and CCPA regulations",
        "Limited access to customer data",
        "Secure data centers with 24/7 monitoring",
      ],
    },
    {
      icon: Cookie,
      title: "Cookies and Tracking",
      content: [
        "Essential cookies for platform functionality",
        "Analytics cookies to improve user experience",
        "Marketing cookies with your consent",
        "You can manage cookie preferences in your settings",
        "Third-party services may use their own cookies",
      ],
    },
    {
      icon: Trash2,
      title: "Your Data Rights",
      content: [
        "Right to access your personal data",
        "Right to correct inaccurate data",
        "Right to delete your account and data",
        "Right to data portability",
        "Right to opt-out of marketing communications",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-ios-gray-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero Section */}
          <div className="text-center mb-16">
            <div className="w-20 h-20 rounded-full bg-ios-blue/10 flex items-center justify-center mx-auto mb-6">
              <Shield size={40} className="text-ios-blue" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              Your privacy is important to us. This policy explains how we collect, use, and protect your personal information.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Introduction */}
          <div className="card-ios ios-shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Our Commitment</h2>
            <p className="text-foreground/60 mb-4">
              At FLOWN, we believe that privacy is a fundamental right. We are committed to protecting your personal information and being transparent about our data practices. This privacy policy applies to our website, mobile applications, and all services we provide.
            </p>
            <p className="text-foreground/60">
              By using FLOWN, you agree to the collection and use of information in accordance with this policy. If you disagree with any part of this policy, please do not use our services.
            </p>
          </div>

          {/* Main Sections */}
          <div className="space-y-8 mb-12">
            {sections.map((section, index) => (
              <div key={index} className="card-ios ios-shadow-lg p-8">
                <div className="flex items-start gap-4 mb-6">
                  <div className="w-12 h-12 rounded-lg bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
                    <section.icon size={24} className="text-ios-blue" />
                  </div>
                  <h2 className="text-2xl font-bold text-foreground">{section.title}</h2>
                </div>
                <ul className="space-y-3">
                  {section.content.map((item, itemIndex) => (
                    <li key={itemIndex} className="flex items-start gap-3">
                      <span className="w-2 h-2 rounded-full bg-ios-blue mt-2 flex-shrink-0" />
                      <span className="text-foreground/60">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* Data Retention */}
          <div className="card-ios ios-shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Data Retention</h2>
            <p className="text-foreground/60 mb-4">
              We retain your personal information only as long as necessary to provide our services and fulfill the purposes outlined in this policy. When you delete your account, we will delete your personal information within 30 days, except where required by law to retain certain data.
            </p>
            <p className="text-foreground/60">
              Analytics and aggregated data may be retained indefinitely for statistical purposes, but this data does not identify individual users.
            </p>
          </div>

          {/* Third-Party Services */}
          <div className="card-ios ios-shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Third-Party Services</h2>
            <p className="text-foreground/60 mb-4">
              We may use third-party services to help operate our business, including payment processing, analytics, and email delivery. These services have access to your personal information only to perform specific tasks on our behalf and are obligated not to disclose or use it for any other purpose.
            </p>
            <p className="text-foreground/60">
              We may also share information with our business partners for joint marketing initiatives, but only with your explicit consent.
            </p>
          </div>

          {/* Contact */}
          <div className="card-ios ios-shadow-lg p-8 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
                <User size={24} className="text-ios-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Questions About Your Privacy?</h2>
                <p className="text-foreground/60 mb-4">
                  If you have any questions about this privacy policy or how we handle your personal information, please contact our privacy team.
                </p>
                <a
                  href="mailto:privacy@flown.com"
                  className="text-ios-blue hover:underline font-medium"
                >
                  privacy@flown.com
                </a>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}