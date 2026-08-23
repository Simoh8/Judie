"use client";

import { FileText, AlertCircle, CheckCircle, XCircle, Scale } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function TermsPage() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const sections = [
    {
      icon: CheckCircle,
      title: "Acceptance of Terms",
      content: [
        "By accessing and using FLOWN, you accept and agree to be bound by these Terms of Service",
        "If you do not agree to these terms, please do not use our services",
        "We reserve the right to modify these terms at any time",
        "Continued use of the service constitutes acceptance of modified terms",
      ],
    },
    {
      icon: AlertCircle,
      title: "User Responsibilities",
      content: [
        "You must be at least 18 years old to use our services",
        "You are responsible for maintaining the confidentiality of your account",
        "You agree to provide accurate and complete information",
        "You must not use the service for any illegal or unauthorized purpose",
        "You must not interfere with or disrupt the service or servers",
      ],
    },
    {
      icon: FileText,
      title: "Service Description",
      content: [
        "FLOWN provides focus sessions and productivity tools",
        "We strive to maintain service availability but cannot guarantee uninterrupted access",
        "We may update or discontinue features with or without notice",
        "Third-party services integrated into FLOWN have their own terms",
        "Session recordings and content may be stored for quality improvement",
      ],
    },
    {
      icon: XCircle,
      title: "Prohibited Activities",
      content: [
        "Sharing account credentials with others",
        "Harassing or abusing other participants in sessions",
        "Recording or sharing session content without permission",
        "Attempting to gain unauthorized access to our systems",
        "Using automated tools to scrape or harvest data",
      ],
    },
    {
      icon: Scale,
      title: "Intellectual Property",
      content: [
        "All content, features, and functionality are owned by FLOWN",
        "You retain ownership of content you create during sessions",
        "You grant us a license to use your content for service improvement",
        "You may not reproduce, modify, or distribute our proprietary content",
        "Our trademarks and branding may not be used without permission",
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
              <FileText size={40} className="text-ios-blue" />
            </div>
            <h1 className="text-5xl md:text-6xl font-bold text-foreground mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-foreground/60 max-w-2xl mx-auto">
              These terms govern your use of FLOWN services. Please read them carefully before using our platform.
            </p>
            <p className="text-sm text-foreground/40 mt-4">
              Last updated: {currentDate}
            </p>
          </div>

          {/* Introduction */}
          <div className="card-ios ios-shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Agreement to Terms</h2>
            <p className="text-foreground/60 mb-4">
              These Terms of Service (&quot;Terms&quot;) govern your use of the FLOWN website, mobile applications, and related services (collectively, the &quot;Service&quot;). By accessing or using the Service, you agree to be bound by these Terms.
            </p>
            <p className="text-foreground/60">
              If you are using the Service on behalf of a company or organization, you represent and warrant that you have the authority to bind that entity to these Terms.
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

          {/* Payment Terms */}
          <div className="card-ios ios-shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Payment and Subscription Terms</h2>
            <p className="text-foreground/60 mb-4">
              Paid subscriptions are billed in advance on a monthly or yearly basis. By subscribing to a paid plan, you authorize us to charge your payment method for the subscription fee and any applicable taxes.
            </p>
            <p className="text-foreground/60 mb-4">
              You may cancel your subscription at any time. Cancellation will take effect at the end of the current billing period. We do not provide refunds for partial months or unused portions of your subscription.
            </p>
            <p className="text-foreground/60">
              We reserve the right to change our pricing at any time. Any price changes will apply to new subscriptions and will be communicated to existing subscribers at least 30 days in advance.
            </p>
          </div>

          {/* Limitation of Liability */}
          <div className="card-ios ios-shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Limitation of Liability</h2>
            <p className="text-foreground/60 mb-4">
              To the maximum extent permitted by law, FLOWN shall not be liable for any indirect, incidental, special, consequential, or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
            </p>
            <p className="text-foreground/60">
              Our total liability to you for all claims under these Terms shall not exceed the amount you paid to us in the twelve months preceding the claim.
            </p>
          </div>

          {/* Governing Law */}
          <div className="card-ios ios-shadow-lg p-8 mb-12">
            <h2 className="text-2xl font-bold text-foreground mb-4">Governing Law</h2>
            <p className="text-foreground/60">
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which FLOWN is headquartered, without regard to its conflict of law provisions. Any disputes arising under these Terms shall be resolved through binding arbitration.
            </p>
          </div>

          {/* Contact */}
          <div className="card-ios ios-shadow-lg p-8 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <div className="flex items-start gap-4 mb-4">
              <div className="w-12 h-12 rounded-lg bg-ios-blue/10 flex items-center justify-center flex-shrink-0">
                <Scale size={24} className="text-ios-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-foreground mb-2">Questions About These Terms?</h2>
                <p className="text-foreground/60 mb-4">
                  If you have any questions about these Terms of Service, please contact our legal team.
                </p>
                <a
                  href="mailto:legal@flown.com"
                  className="text-ios-blue hover:underline font-medium"
                >
                  legal@flown.com
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