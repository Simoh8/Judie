"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AddPaymentMethodModal from "@/components/AddPaymentMethodModal";
import UpdateBillingInfoModal from "@/components/UpdateBillingInfoModal";
import { 
  CreditCard, 
  Download, 
  Calendar, 
  DollarSign, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Crown, 
  Clock, 
  Users,
  FileText,
  RefreshCw,
  Package,
  TrendingUp
} from "lucide-react";
import Link from "next/link";

interface ActivePackageInfo {
  package: {
    id: string;
    name: string;
    description: string;
    price: number;
    duration: string;
    maxLeadRequests: number;
    maxSessions: number;
  };
  purchase: {
    id: string;
    status: string;
    created_at: string;
    valid_from: string;
    valid_until: string;
    invoice_number?: string;
  };
  remainingSessions: number;
  remainingLeadRequests: number;
  validUntil: string;
}

interface Invoice {
  id: string;
  invoice_number: string;
  amount: number;
  currency: string;
  status: string;
  payment_date: string | null;
  package_name: string;
  receipt_url: string | null;
  created_at: string;
}

interface PaymentMethod {
  id: string;
  type: string;
  last4: string;
  expiry_month: string;
  expiry_year: string;
  is_default: boolean;
}

export default function BillingPage() {
  const { user, token } = useAuth();
  const [activePackage, setActivePackage] = useState<ActivePackageInfo | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [loadingPackage, setLoadingPackage] = useState(true);
  const [loadingInvoices, setLoadingInvoices] = useState(true);
  const [loadingPaymentMethods, setLoadingPaymentMethods] = useState(true);
  const [toast, setToast] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [addPaymentModalOpen, setAddPaymentModalOpen] = useState(false);
  const [updateBillingModalOpen, setUpdateBillingModalOpen] = useState(false);

  const loadBillingData = useCallback(async () => {
    if (!user?.id) return;

    try {
      const headers: Record<string, string> = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      // Load active package
      const packageResponse = await fetch(`/api/purchases/user_active_packages/?user_id=${user.id}`, {
        headers
      });
      const packageData = await packageResponse.json();
      if (packageData.success && packageData.activePackages && packageData.activePackages.length > 0) {
        setActivePackage(packageData.activePackages[0]);
      } else {
        setActivePackage(null);
      }

      // Load invoices/purchases
      const invoicesResponse = await fetch(`/api/purchases?user=${user.id}`, {
        headers
      });
      const invoicesData = await invoicesResponse.json();
      if (invoicesData.success && invoicesData.purchases) {
        const formattedInvoices = invoicesData.purchases.map((purchase: any) => ({
          id: purchase.id,
          invoice_number: purchase.invoiceNumber || `INV-${purchase.id.slice(0, 8)}`,
          amount: purchase.amount,
          currency: purchase.currency,
          status: purchase.status,
          payment_date: purchase.paymentDate,
          package_name: purchase.package.name,
          receipt_url: purchase.receiptUrl,
          created_at: purchase.createdAt
        }));
        setInvoices(formattedInvoices);
      } else {
        setInvoices([]);
      }

      // Load payment methods
      const paymentMethodsResponse = await fetch('/api/payment-methods', {
        headers
      });
      const paymentMethodsData = await paymentMethodsResponse.json();
      if (paymentMethodsData.success && paymentMethodsData.paymentMethods) {
        const formattedPaymentMethods = paymentMethodsData.paymentMethods.map((method: any) => ({
          id: method.id,
          type: method.paymentType,
          last4: method.cardLast4,
          expiry_month: method.cardExpiryMonth,
          expiry_year: method.cardExpiryYear,
          is_default: method.isDefault
        }));
        setPaymentMethods(formattedPaymentMethods);
      } else {
        setPaymentMethods([]);
      }

    } catch (error) {
      console.error("Failed to load billing data:", error);
    } finally {
      setLoadingPackage(false);
      setLoadingInvoices(false);
      setLoadingPaymentMethods(false);
    }
  }, [user?.id, token]);

  useEffect(() => {
    if (user?.id) {
      loadBillingData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  const handleDownloadInvoice = useCallback(async (invoice: Invoice) => {
    try {
      if (invoice.receipt_url) {
        window.open(invoice.receipt_url, '_blank');
      } else {
        // Generate invoice if not available
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
        };
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }

        const response = await fetch(`/api/purchases/${invoice.id}/generate_invoice`, {
          method: 'POST',
          headers,
        });
        const data = await response.json();
        if (data.success && data.invoice_url) {
          window.open(data.invoice_url, '_blank');
          setToast({ type: "success", message: "Invoice generated successfully" });
        } else {
          setToast({ type: "error", message: "Failed to generate invoice" });
        }
      }
    } catch (error) {
      console.error("Failed to download invoice:", error);
      setToast({ type: "error", message: "Failed to download invoice" });
    }
  }, [token]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300';
      case 'refunded': return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
    }
  };

  useEffect(() => {
    if (toast) {
      const t = setTimeout(() => setToast(null), 3500);
      return () => clearTimeout(t);
    }
  }, [toast]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-ios-gray-900/50">
        <Navbar />

        {/* Toast notification */}
        {toast && (
          <div
            className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg animate-slide-down transition-all duration-300 ${
              toast.type === "success"
                ? "bg-green-50 dark:bg-green-900/40 border border-green-200 dark:border-green-700 text-green-800 dark:text-green-300"
                : "bg-red-50 dark:bg-red-900/40 border border-red-200 dark:border-red-700 text-red-800 dark:text-red-300"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle size={18} className="shrink-0 text-green-500" />
            ) : (
              <AlertCircle size={18} className="shrink-0 text-red-500" />
            )}
            <span className="text-sm font-medium">{toast.message}</span>
          </div>
        )}

        <main className="pt-24 px-6 pb-12">
          <div className="max-w-7xl mx-auto">
            <div className="mb-8 animate-slide-up">
              <h1 className="text-4xl font-bold mb-2 text-foreground">Billing & Subscription</h1>
              <p className="text-foreground/70">Manage your subscription, payments, and invoices</p>
            </div>

            <div className="grid lg:grid-cols-3 gap-6">
              {/* Left Column - Subscription & Payment Methods */}
              <div className="lg:col-span-2 space-y-6">
                {/* Current Subscription */}
                <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.1s" }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-gradient-to-br from-ios-blue to-purple-600 rounded-2xl text-white shadow-md">
                        <Crown size={24} />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Current Subscription</h2>
                        <p className="text-sm text-foreground/60">Your active plan and usage</p>
                      </div>
                    </div>
                    <Link
                      href="/pricing"
                      className="btn-ios btn-primary text-sm flex items-center gap-1.5"
                    >
                      <TrendingUp size={16} />
                      Upgrade
                      <ArrowRight size={16} />
                    </Link>
                  </div>

                  {loadingPackage ? (
                    <div className="text-center py-8 text-foreground/60 animate-pulse">Loading subscription details...</div>
                  ) : activePackage ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                        <div>
                          <h3 className="text-lg font-semibold text-foreground">{activePackage.package.name}</h3>
                          <p className="text-sm text-foreground/60">{activePackage.package.description}</p>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-foreground">
                            ${activePackage.package.price}
                            <span className="text-sm font-normal text-foreground/60">/{activePackage.package.duration}</span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Calendar size={18} className="text-ios-blue" />
                          </div>
                          <p className="text-sm text-foreground/60">Valid Until</p>
                          <p className="font-semibold text-foreground">
                            {new Date(activePackage.validUntil).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Users size={18} className="text-purple-500" />
                          </div>
                          <p className="text-sm text-foreground/60">Sessions Left</p>
                          <p className="font-semibold text-foreground">
                            {activePackage.remainingSessions > 999 ? "Unlimited" : activePackage.remainingSessions}
                          </p>
                        </div>
                        <div className="text-center p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <Clock size={18} className="text-green-500" />
                          </div>
                          <p className="text-sm text-foreground/60">Lead Requests</p>
                          <p className="font-semibold text-foreground">
                            {activePackage.remainingLeadRequests > 999 ? "Unlimited" : activePackage.remainingLeadRequests}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-xl">
                        <CheckCircle size={18} className="text-green-500" />
                        <span className="text-sm text-green-700 dark:text-green-300">
                          Subscription active and in good standing
                        </span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package size={48} className="text-foreground/30 mx-auto mb-4" />
                      <p className="text-foreground/60 mb-4">No active subscription</p>
                      <Link href="/pricing" className="btn-ios btn-primary">
                        View Plans
                      </Link>
                    </div>
                  )}
                </div>

                {/* Payment Methods */}
                <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.2s" }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                        <CreditCard size={24} className="text-blue-600 dark:text-blue-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Payment Methods</h2>
                        <p className="text-sm text-foreground/60">Manage your payment options</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setAddPaymentModalOpen(true)}
                      className="btn-ios btn-secondary text-sm"
                    >
                      Add New
                    </button>
                  </div>

                  {loadingPaymentMethods ? (
                    <div className="text-center py-8 text-foreground/60 animate-pulse">Loading payment methods...</div>
                  ) : paymentMethods.length > 0 ? (
                    <div className="space-y-3">
                      {paymentMethods.map((method) => (
                        <div key={method.id} className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white dark:bg-ios-gray-600 rounded-lg">
                              <CreditCard size={20} className="text-foreground/60" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">
                                  {method.type === 'card' ? 'Card' : method.type}
                                </span>
                                {method.is_default && (
                                  <span className="text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-2 py-0.5 rounded-full">
                                    Default
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-foreground/60">
                                •••• {method.last4} • Expires {method.expiry_month}/{method.expiry_year}
                              </p>
                            </div>
                          </div>
                          <button className="text-sm text-foreground/60 hover:text-foreground">
                            Edit
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground/60">
                      No payment methods added
                    </div>
                  )}
                </div>

                {/* Invoice History */}
                <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.3s" }}>
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
                        <FileText size={24} className="text-purple-600 dark:text-purple-300" />
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-foreground">Invoice History</h2>
                        <p className="text-sm text-foreground/60">View and download your invoices</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => loadBillingData()}
                      className="p-2 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-lg transition-colors"
                      title="Refresh"
                    >
                      <RefreshCw size={18} className="text-foreground/60" />
                    </button>
                  </div>

                  {loadingInvoices ? (
                    <div className="text-center py-8 text-foreground/60 animate-pulse">Loading invoices...</div>
                  ) : invoices.length > 0 ? (
                    <div className="space-y-3">
                      {invoices.map((invoice) => (
                        <div key={invoice.id} className="flex items-center justify-between p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                          <div className="flex items-center gap-4">
                            <div className="p-2 bg-white dark:bg-ios-gray-600 rounded-lg">
                              <FileText size={20} className="text-foreground/60" />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-medium text-foreground">{invoice.invoice_number}</span>
                                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(invoice.status)}`}>
                                  {invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                                </span>
                              </div>
                              <p className="text-sm text-foreground/60">
                                {invoice.package_name} • {new Date(invoice.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <div className="font-semibold text-foreground">
                                ${Number(invoice.amount).toFixed(2)} {invoice.currency}
                              </div>
                              {invoice.payment_date && (
                                <p className="text-xs text-foreground/60">
                                  Paid {new Date(invoice.payment_date).toLocaleDateString()}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => handleDownloadInvoice(invoice)}
                              className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              title="Download Invoice"
                            >
                              <Download size={18} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-foreground/60">
                      No invoices found
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Quick Actions & Billing Info */}
              <div className="space-y-6">
                {/* Quick Stats */}
                <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.4s" }}>
                  <h2 className="text-lg font-bold text-foreground mb-4">Billing Overview</h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <DollarSign size={18} className="text-foreground/40" />
                        <span className="text-sm text-foreground/60">Total Spent</span>
                      </div>
                      <span className="font-semibold text-foreground">
                        ${invoices.reduce((sum, inv) => sum + (inv.status === 'completed' ? Number(inv.amount) : 0), 0).toFixed(2)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FileText size={18} className="text-foreground/40" />
                        <span className="text-sm text-foreground/60">Total Invoices</span>
                      </div>
                      <span className="font-semibold text-foreground">{invoices.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CheckCircle size={18} className="text-foreground/40" />
                        <span className="text-sm text-foreground/60">Active Subscriptions</span>
                      </div>
                      <span className="font-semibold text-foreground">{activePackage ? 1 : 0}</span>
                    </div>
                  </div>
                </div>

                {/* Billing Information */}
                <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.5s" }}>
                  <h2 className="text-lg font-bold text-foreground mb-4">Billing Information</h2>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground/60">Email</label>
                      <p className="text-foreground">{user?.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-1 text-foreground/60">Name</label>
                      <p className="text-foreground">{user?.firstName} {user?.lastName}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setUpdateBillingModalOpen(true)}
                    className="w-full mt-4 btn-ios btn-secondary text-sm"
                  >
                    Update Billing Info
                  </button>
                </div>

                {/* Help & Support */}
                <div className="card-ios p-6 animate-slide-up" style={{ animationDelay: "0.6s" }}>
                  <h2 className="text-lg font-bold text-foreground mb-4">Need Help?</h2>
                  <p className="text-sm text-foreground/60 mb-4">
                    Have questions about your billing or subscription? Our support team is here to help.
                  </p>
                  <div className="space-y-2">
                    <Link href="/help-center" className="block w-full btn-ios btn-secondary text-sm text-center">
                      Visit Help Center
                    </Link>
                    <a href="mailto:support@actuallydoing.com" className="block w-full btn-ios btn-primary text-sm text-center">
                      Contact Support
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>

      {/* Modals */}
      <AddPaymentMethodModal
        isOpen={addPaymentModalOpen}
        onClose={() => setAddPaymentModalOpen(false)}
        onSuccess={() => {
          loadBillingData();
          setToast({ type: "success", message: "Payment method added successfully" });
        }}
      />

      <UpdateBillingInfoModal
        isOpen={updateBillingModalOpen}
        onClose={() => setUpdateBillingModalOpen(false)}
        onSuccess={() => {
          loadBillingData();
          setToast({ type: "success", message: "Billing information updated successfully" });
        }}
        user={user}
      />
    </ProtectedRoute>
  );
}