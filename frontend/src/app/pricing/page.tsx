"use client";

import { useState, useEffect } from "react";
import { Check, Crown, Zap, Building2, ArrowRight, CreditCard, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/contexts/AuthContext";

interface Package {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  maxLeadRequests: number;
  maxSessions: number;
  allowedSessionTypes: string[];
  maxSessionDuration: number;
  supportedRegions: string[];
  is_active: boolean;
  isFeatured: boolean;
  sortOrder: number;
}

export default function PricingPage() {
  const { user } = useAuth();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingPurchase, setProcessingPurchase] = useState<string | null>(null);

  useEffect(() => {
    loadPackages();
  }, []);

  const loadPackages = async () => {
    try {
      const response = await fetch('/api/packages?active=true');
      const data = await response.json();
      if (data.success && data.packages) {
        setPackages(data.packages);
      }
    } catch (error) {
      console.error("Failed to load packages:", error);
    } finally {
      setLoading(false);
    }
  };

  const handlePurchase = async (packageId: string) => {
    if (!user) {
      window.location.href = '/auth/login';
      return;
    }

    setProcessingPurchase(packageId);

    try {
      // Create purchase record
      const purchaseResponse = await fetch('/api/purchases', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: user.id,
          package: packageId
        })
      });

      const purchaseData = await purchaseResponse.json();
      
      if (purchaseData.success) {
        // Initiate payment
        const paymentResponse = await fetch(`/api/purchases/${purchaseData.purchase.id}/initiate_payment`, {
          method: 'POST'
        });

        const paymentData = await paymentResponse.json();
        
        if (paymentData.success && paymentData.paymentUrl) {
          // Redirect to Paystack payment page
          window.location.href = paymentData.paymentUrl;
        } else {
          alert('Failed to initiate payment. Please try again.');
        }
      } else {
        alert(purchaseData.error || 'Failed to create purchase. Please try again.');
      }
    } catch (error) {
      console.error("Purchase failed:", error);
      alert('Purchase failed. Please try again.');
    } finally {
      setProcessingPurchase(null);
    }
  };

  const getIconForPackage = (packageName: string) => {
    if (packageName.toLowerCase().includes('basic') || packageName.toLowerCase().includes('free')) return Zap;
    if (packageName.toLowerCase().includes('team') || packageName.toLowerCase().includes('enterprise')) return Building2;
    return Crown;
  };

  const formatDuration = (duration: string) => {
    return duration.charAt(0).toUpperCase() + duration.slice(1);
  };

  const getCtaText = (pkg: Package) => {
    if (!user) return "Sign Up to Purchase";
    if (pkg.price === 0) return "Get Started Free";
    return "Purchase Package";
  };

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
              Choose the plan that fits your focus goals. All prices in USD.
            </p>
          </div>

          {/* Pricing Cards */}
          {loading ? (
            <div className="flex justify-center items-center py-20">
              <Loader2 className="animate-spin text-ios-blue" size={40} />
            </div>
          ) : packages.length === 0 ? (
            <div className="text-center py-20 text-foreground/60">
              No packages available at the moment. Please check back later.
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {packages.map((pkg) => {
                const Icon = getIconForPackage(pkg.name);
                return (
                  <div
                    key={pkg.id}
                    className={`card-ios ios-shadow-lg p-8 relative ${
                      pkg.isFeatured ? "border-2 border-ios-blue" : ""
                    }`}
                  >
                    {pkg.isFeatured && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-ios-blue text-white px-4 py-1 rounded-full text-sm font-medium">
                        Most Popular
                      </div>
                    )}
                    <div className="w-16 h-16 rounded-full bg-ios-blue/10 flex items-center justify-center mb-6">
                      <Icon size={32} className="text-ios-blue" />
                    </div>
                    <h3 className="text-2xl font-bold text-foreground mb-2">
                      {pkg.name}
                    </h3>
                    <p className="text-foreground/60 mb-6">{pkg.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-foreground">
                        ${pkg.price}
                      </span>
                      <span className="text-foreground/60">
                        /{formatDuration(pkg.duration)}
                      </span>
                    </div>
                    
                    <ul className="space-y-3 mb-8">
                      <li className="flex items-start gap-3">
                        <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{pkg.maxSessions} sessions per {pkg.duration}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">{pkg.maxLeadRequests} lead requests per {pkg.duration}</span>
                      </li>
                      <li className="flex items-start gap-3">
                        <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                        <span className="text-foreground/80">Max {pkg.maxSessionDuration} min session duration</span>
                      </li>
                      {pkg.allowedSessionTypes.length > 0 && (
                        <li className="flex items-start gap-3">
                          <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">
                            Session types: {pkg.allowedSessionTypes.join(', ')}
                          </span>
                        </li>
                      )}
                      {pkg.supportedRegions.length > 0 && (
                        <li className="flex items-start gap-3">
                          <Check size={20} className="text-green-500 flex-shrink-0 mt-0.5" />
                          <span className="text-foreground/80">
                            Available in: {pkg.supportedRegions.join(', ')}
                          </span>
                        </li>
                      )}
                    </ul>
                    
                    <button
                      onClick={() => handlePurchase(pkg.id)}
                      disabled={processingPurchase === pkg.id}
                      className={`w-full py-3 rounded-xl font-medium transition-colors flex items-center justify-center gap-2 ${
                        pkg.isFeatured
                          ? "btn-ios btn-primary"
                          : "bg-ios-gray-100 dark:bg-ios-gray-800 text-foreground hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700"
                      } ${processingPurchase === pkg.id ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      {processingPurchase === pkg.id ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Processing...
                        </>
                      ) : (
                        <>
                          {getCtaText(pkg)}
                          <ArrowRight size={20} />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Payment Info */}
          <div className="max-w-3xl mx-auto mb-20">
            <div className="card-ios ios-shadow-lg p-8 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
              <div className="flex items-center gap-4 mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <CreditCard className="text-green-600 dark:text-green-300" size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground">Secure Payment</h3>
                  <p className="text-foreground/60">Powered by Paystack</p>
                </div>
              </div>
              <p className="text-foreground/70">
                We use Paystack to process payments securely. Paystack accepts all major credit cards and 
                supports payments from multiple countries. Your payment information is encrypted and secure.
              </p>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto mb-20">
            <h2 className="text-3xl font-bold text-foreground mb-12 text-center">
              Frequently Asked Questions
            </h2>
            <div className="space-y-6">
              <div className="card-ios ios-shadow-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Can I change packages anytime?
                </h3>
                <p className="text-foreground/60">
                  Yes, you can upgrade or downgrade your package at any time. Changes take effect immediately, 
                  and we'll handle the billing accordingly.
                </p>
              </div>
              <div className="card-ios ios-shadow-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  What payment methods do you accept?
                </h3>
                <p className="text-foreground/60">
                  We accept all major credit cards (Visa, MasterCard, American Express) through Paystack. 
                  Paystack also supports mobile money and bank transfers in supported regions.
                </p>
              </div>
              <div className="card-ios ios-shadow-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Is there a free trial?
                </h3>
                <p className="text-foreground/60">
                  Some packages may include a trial period. Check the specific package details for more information 
                  about trial availability and duration.
                </p>
              </div>
              <div className="card-ios ios-shadow-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">
                  Do you offer refunds?
                </h3>
                <p className="text-foreground/60">
                  Refund policies vary by package. Please contact our support team for assistance with any 
                  refund requests.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center card-ios ios-shadow-lg p-12 bg-gradient-to-br from-ios-blue/5 to-purple-500/5">
            <h2 className="text-3xl font-bold text-foreground mb-4">
              Not Sure Which Package to Choose?
            </h2>
            <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
              Our team can help you find the perfect package for your needs. Get in touch for personalized recommendations.
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