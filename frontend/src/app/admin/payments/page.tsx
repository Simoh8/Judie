"use client";

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { DollarSign, Check, X, Search, Filter, ArrowLeft, Calendar, AlertCircle, Download, RefreshCw, Eye, MoreHorizontal } from "lucide-react";

interface Purchase {
  id: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  package: {
    id: string;
    name: string;
    price: number;
  };
  status: string;
  amount: number;
  currency: string;
  paymentMethod: string;
  paymentDate: string | null;
  invoiceNumber: string | null;
  receiptUrl: string | null;
  paystackReference: string | null;
  paystackTransactionId: string | null;
  reconciliationStatus: string;
  adminNotes: string;
  reconciledBy: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
  reconciledAt: string | null;
  sessionsUsed: number;
  leadRequestsUsed: number;
  createdAt: string;
  validFrom: string;
  validUntil: string;
}

export default function AdminPaymentsPage() {
  const { user } = useAuth();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [reconciliationFilter, setReconciliationFilter] = useState('all');
  const [selectedPurchase, setSelectedPurchase] = useState<Purchase | null>(null);
  const [showReconcileModal, setShowReconcileModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [reconcileData, setReconcileData] = useState({
    status: '',
    reconciliationStatus: '',
    adminNotes: '',
    receiptUrl: '',
    invoiceNumber: ''
  });
  const [processing, setProcessing] = useState(false);

  const isAdmin = user?.isStaff || user?.email === 'admin@focused.com';

  const loadPurchases = useCallback(async () => {
    try {
      const response = await fetch('/api/purchases');
      const data = await response.json();
      if (data.success && data.purchases) {
        setPurchases(data.purchases);
      }
    } catch (error) {
      console.error("Failed to load purchases:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPurchases();
  }, [loadPurchases]);

  const handleReconcile = async (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setReconcileData({
      status: purchase.status,
      reconciliationStatus: purchase.reconciliationStatus,
      adminNotes: purchase.adminNotes || '',
      receiptUrl: purchase.receiptUrl || '',
      invoiceNumber: purchase.invoiceNumber || ''
    });
    setShowReconcileModal(true);
  };

  const handleViewDetails = (purchase: Purchase) => {
    setSelectedPurchase(purchase);
    setShowDetailsModal(true);
  };

  const submitReconciliation = async () => {
    if (!selectedPurchase) return;
    
    setProcessing(true);
    try {
      const response = await fetch(`/api/purchases/${selectedPurchase.id}/reconcile_payment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(reconcileData),
      });
      
      const data = await response.json();
      if (data.success) {
        setShowReconcileModal(false);
        loadPurchases();
      } else {
        alert(data.error || 'Failed to reconcile payment');
      }
    } catch (error) {
      console.error("Failed to reconcile payment:", error);
      alert('Failed to reconcile payment');
    } finally {
      setProcessing(false);
    }
  };

  const handleGenerateInvoice = async (purchase: Purchase) => {
    try {
      const response = await fetch(`/api/purchases/${purchase.id}/generate_invoice`, {
        method: 'POST',
      });
      
      const data = await response.json();
      if (data.success) {
        loadPurchases();
      } else {
        alert(data.error || 'Failed to generate invoice');
      }
    } catch (error) {
      console.error("Failed to generate invoice:", error);
      alert('Failed to generate invoice');
    }
  };

  const filteredPurchases = purchases.filter(purchase => {
    const matchesSearch = 
      purchase.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      `${purchase.user.firstName} ${purchase.user.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      purchase.package.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (purchase.invoiceNumber && purchase.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesStatus = statusFilter === 'all' || purchase.status === statusFilter;
    const matchesReconciliation = reconciliationFilter === 'all' || purchase.reconciliationStatus === reconciliationFilter;
    
    return matchesSearch && matchesStatus && matchesReconciliation;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300';
      case 'failed': return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300';
      case 'refunded': return 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
    }
  };

  const getReconciliationColor = (status: string) => {
    switch (status) {
      case 'matched': return 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300';
      case 'pending': return 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-300';
      case 'disputed': return 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-300';
      case 'resolved': return 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300';
      default: return 'bg-gray-100 dark:bg-gray-900 text-gray-600 dark:text-gray-300';
    }
  };

  if (!isAdmin) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
            <p className="text-foreground/60">This page is for administrators only.</p>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50 dark:bg-ios-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-6 py-8 pt-24">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <a
                href="/admin/dashboard"
                className="p-2 bg-white dark:bg-ios-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-ios-gray-700 transition-colors"
              >
                <ArrowLeft size={20} className="text-foreground" />
              </a>
              <div>
                <h1 className="text-3xl font-bold text-foreground">Payment Management</h1>
                <p className="text-foreground/60 mt-2">View, reconcile, and manage payment transactions</p>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
                  <DollarSign className="text-blue-600 dark:text-blue-300" size={24} />
                </div>
                <span className="text-xs font-medium text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300 px-2 py-1 rounded-full">
                  Total
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">{purchases.length}</div>
              <div className="text-sm text-foreground/60">Total Transactions</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
                  <Check className="text-green-600 dark:text-green-300" size={24} />
                </div>
                <span className="text-xs font-medium text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300 px-2 py-1 rounded-full">
                  Completed
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {purchases.filter(p => p.status === 'completed').length}
              </div>
              <div className="text-sm text-foreground/60">Completed Payments</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-xl">
                  <AlertCircle className="text-yellow-600 dark:text-yellow-300" size={24} />
                </div>
                <span className="text-xs font-medium text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300 px-2 py-1 rounded-full">
                  Pending
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {purchases.filter(p => p.status === 'pending').length}
              </div>
              <div className="text-sm text-foreground/60">Pending Payments</div>
            </div>

            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
                  <RefreshCw className="text-orange-600 dark:text-orange-300" size={24} />
                </div>
                <span className="text-xs font-medium text-orange-600 bg-orange-100 dark:bg-orange-900 dark:text-orange-300 px-2 py-1 rounded-full">
                  Reconciliation
                </span>
              </div>
              <div className="text-3xl font-bold text-foreground mb-1">
                {purchases.filter(p => p.reconciliationStatus === 'pending').length}
              </div>
              <div className="text-sm text-foreground/60">Pending Reconciliation</div>
            </div>
          </div>

          {/* Filters */}
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 shadow-sm mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-foreground/40" size={20} />
                <input
                  type="text"
                  placeholder="Search by email, name, package, or invoice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                />
              </div>
              <div className="flex gap-4">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                >
                  <option value="all">All Statuses</option>
                  <option value="completed">Completed</option>
                  <option value="pending">Pending</option>
                  <option value="failed">Failed</option>
                  <option value="refunded">Refunded</option>
                </select>
                <select
                  value={reconciliationFilter}
                  onChange={(e) => setReconciliationFilter(e.target.value)}
                  className="px-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                >
                  <option value="all">All Reconciliation</option>
                  <option value="pending">Pending Reconciliation</option>
                  <option value="matched">Matched</option>
                  <option value="disputed">Disputed</option>
                  <option value="resolved">Resolved</option>
                </select>
              </div>
            </div>
          </div>

          {/* Purchases Table */}
          <div className="bg-white dark:bg-ios-gray-800 rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="text-center py-12 text-foreground/60">Loading payments...</div>
            ) : filteredPurchases.length === 0 ? (
              <div className="text-center py-12 text-foreground/60">No payments found</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-ios-gray-50 dark:bg-ios-gray-700">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Transaction</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">User</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Package</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Amount</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Status</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Reconciliation</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Date</th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-foreground/60 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-ios-gray-200 dark:divide-ios-gray-700">
                    {filteredPurchases.map((purchase) => (
                      <tr key={purchase.id} className="hover:bg-ios-gray-50 dark:hover:bg-ios-gray-700 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{purchase.invoiceNumber || 'N/A'}</span>
                            {purchase.paystackReference && (
                              <span className="text-xs text-foreground/60">{purchase.paystackReference}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">
                              {purchase.user.firstName} {purchase.user.lastName}
                            </span>
                            <span className="text-sm text-foreground/60">{purchase.user.email}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-col">
                            <span className="font-medium text-foreground">{purchase.package.name}</span>
                            <span className="text-sm text-foreground/60">
                              {purchase.sessionsUsed}/{purchase.package.name.includes('sessions') ? '∞' : purchase.sessionsUsed} sessions used
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <DollarSign size={16} className="text-foreground/40" />
                            <span className="font-medium text-foreground">
                              {Number(purchase.amount).toFixed(2)} {purchase.currency}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(purchase.status)}`}>
                            {purchase.status.charAt(0).toUpperCase() + purchase.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getReconciliationColor(purchase.reconciliationStatus)}`}>
                            {purchase.reconciliationStatus.charAt(0).toUpperCase() + purchase.reconciliationStatus.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-foreground/60">
                            <Calendar size={16} />
                            <span className="text-sm">
                              {new Date(purchase.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewDetails(purchase)}
                              className="p-2 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
                              title="View Details"
                            >
                              <Eye size={16} />
                            </button>
                            <button
                              onClick={() => handleReconcile(purchase)}
                              className="p-2 bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                              title="Reconcile"
                            >
                              <RefreshCw size={16} />
                            </button>
                            {!purchase.invoiceNumber && (
                              <button
                                onClick={() => handleGenerateInvoice(purchase)}
                                className="p-2 bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors"
                                title="Generate Invoice"
                              >
                                <Download size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Reconciliation Modal */}
        {showReconcileModal && selectedPurchase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Reconcile Payment</h2>
                <button
                  onClick={() => setShowReconcileModal(false)}
                  className="p-2 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-foreground" />
                </button>
              </div>

              <div className="space-y-4 mb-6">
                <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-foreground/60">User:</span>
                      <p className="font-medium text-foreground">
                        {selectedPurchase.user.firstName} {selectedPurchase.user.lastName}
                      </p>
                      <p className="text-foreground/60">{selectedPurchase.user.email}</p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Package:</span>
                      <p className="font-medium text-foreground">{selectedPurchase.package.name}</p>
                      <p className="text-foreground/60">${Number(selectedPurchase.amount).toFixed(2)} {selectedPurchase.currency}</p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Current Status:</span>
                      <p className={`font-medium ${getStatusColor(selectedPurchase.status)} px-2 py-1 rounded-full inline-block`}>
                        {selectedPurchase.status}
                      </p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Reconciliation Status:</span>
                      <p className={`font-medium ${getReconciliationColor(selectedPurchase.reconciliationStatus)} px-2 py-1 rounded-full inline-block`}>
                        {selectedPurchase.reconciliationStatus}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Payment Status</label>
                  <select
                    value={reconcileData.status}
                    onChange={(e) => setReconcileData({...reconcileData, status: e.target.value})}
                    className="w-full px-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                  >
                    <option value="pending">Pending</option>
                    <option value="completed">Completed</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Reconciliation Status</label>
                  <select
                    value={reconcileData.reconciliationStatus}
                    onChange={(e) => setReconcileData({...reconcileData, reconciliationStatus: e.target.value})}
                    className="w-full px-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                  >
                    <option value="pending">Pending Reconciliation</option>
                    <option value="matched">Matched</option>
                    <option value="disputed">Disputed</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Invoice Number</label>
                  <input
                    type="text"
                    value={reconcileData.invoiceNumber}
                    onChange={(e) => setReconcileData({...reconcileData, invoiceNumber: e.target.value})}
                    className="w-full px-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                    placeholder="INV-20240101-ABC123"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Receipt URL</label>
                  <input
                    type="url"
                    value={reconcileData.receiptUrl}
                    onChange={(e) => setReconcileData({...reconcileData, receiptUrl: e.target.value})}
                    className="w-full px-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                    placeholder="https://example.com/receipt.pdf"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">Admin Notes</label>
                  <textarea
                    value={reconcileData.adminNotes}
                    onChange={(e) => setReconcileData({...reconcileData, adminNotes: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 bg-ios-gray-50 dark:bg-ios-gray-700 border border-ios-gray-200 dark:border-ios-gray-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 text-foreground"
                    placeholder="Add any notes about this reconciliation..."
                  />
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={submitReconciliation}
                  disabled={processing}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {processing ? 'Processing...' : 'Save Reconciliation'}
                </button>
                <button
                  onClick={() => setShowReconcileModal(false)}
                  className="px-4 py-2 bg-ios-gray-200 dark:bg-ios-gray-700 text-foreground rounded-xl hover:bg-ios-gray-300 dark:hover:bg-ios-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {showDetailsModal && selectedPurchase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-ios-gray-800 rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-foreground">Payment Details</h2>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="p-2 hover:bg-ios-gray-100 dark:hover:bg-ios-gray-700 rounded-lg transition-colors"
                >
                  <X size={20} className="text-foreground" />
                </button>
              </div>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                    <h3 className="text-sm font-medium text-foreground/60 mb-2">Transaction Info</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-foreground/60">Invoice:</span>
                        <p className="font-medium text-foreground">{selectedPurchase.invoiceNumber || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Paystack Reference:</span>
                        <p className="font-medium text-foreground">{selectedPurchase.paystackReference || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Transaction ID:</span>
                        <p className="font-medium text-foreground">{selectedPurchase.paystackTransactionId || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Payment Method:</span>
                        <p className="font-medium text-foreground">{selectedPurchase.paymentMethod}</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                    <h3 className="text-sm font-medium text-foreground/60 mb-2">Amount & Status</h3>
                    <div className="space-y-2 text-sm">
                      <div>
                        <span className="text-foreground/60">Amount:</span>
                        <p className="font-medium text-foreground">${Number(selectedPurchase.amount).toFixed(2)} {selectedPurchase.currency}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Status:</span>
                        <p className={`font-medium ${getStatusColor(selectedPurchase.status)} px-2 py-1 rounded-full inline-block`}>
                          {selectedPurchase.status}
                        </p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Reconciliation:</span>
                        <p className={`font-medium ${getReconciliationColor(selectedPurchase.reconciliationStatus)} px-2 py-1 rounded-full inline-block`}>
                          {selectedPurchase.reconciliationStatus}
                        </p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Payment Date:</span>
                        <p className="font-medium text-foreground">
                          {selectedPurchase.paymentDate ? new Date(selectedPurchase.paymentDate).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                  <h3 className="text-sm font-medium text-foreground/60 mb-2">User Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-foreground/60">Name:</span>
                      <p className="font-medium text-foreground">
                        {selectedPurchase.user.firstName} {selectedPurchase.user.lastName}
                      </p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Email:</span>
                      <p className="font-medium text-foreground">{selectedPurchase.user.email}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                  <h3 className="text-sm font-medium text-foreground/60 mb-2">Package Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-foreground/60">Package:</span>
                      <p className="font-medium text-foreground">{selectedPurchase.package.name}</p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Price:</span>
                      <p className="font-medium text-foreground">${Number(selectedPurchase.package.price).toFixed(2)}</p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Sessions Used:</span>
                      <p className="font-medium text-foreground">{selectedPurchase.sessionsUsed}</p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Lead Requests Used:</span>
                      <p className="font-medium text-foreground">{selectedPurchase.leadRequestsUsed}</p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Valid From:</span>
                      <p className="font-medium text-foreground">{new Date(selectedPurchase.validFrom).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <span className="text-foreground/60">Valid Until:</span>
                      <p className="font-medium text-foreground">{new Date(selectedPurchase.validUntil).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {selectedPurchase.adminNotes && (
                  <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                    <h3 className="text-sm font-medium text-foreground/60 mb-2">Admin Notes</h3>
                    <p className="text-sm text-foreground">{selectedPurchase.adminNotes}</p>
                  </div>
                )}

                {selectedPurchase.reconciledBy && (
                  <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                    <h3 className="text-sm font-medium text-foreground/60 mb-2">Reconciliation Info</h3>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-foreground/60">Reconciled By:</span>
                        <p className="font-medium text-foreground">
                          {selectedPurchase.reconciledBy.firstName} {selectedPurchase.reconciledBy.lastName}
                        </p>
                        <p className="text-foreground/60">{selectedPurchase.reconciledBy.email}</p>
                      </div>
                      <div>
                        <span className="text-foreground/60">Reconciled At:</span>
                        <p className="font-medium text-foreground">
                          {selectedPurchase.reconciledAt ? new Date(selectedPurchase.reconciledAt).toLocaleString() : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {selectedPurchase.receiptUrl && (
                  <div className="p-4 bg-ios-gray-50 dark:bg-ios-gray-700 rounded-xl">
                    <h3 className="text-sm font-medium text-foreground/60 mb-2">Receipt</h3>
                    <a
                      href={selectedPurchase.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      View Receipt
                    </a>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-4">
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleReconcile(selectedPurchase);
                  }}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors"
                >
                  Reconcile Payment
                </button>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 bg-ios-gray-200 dark:bg-ios-gray-700 text-foreground rounded-xl hover:bg-ios-gray-300 dark:hover:bg-ios-gray-600 transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        <Footer />
      </div>
    </ProtectedRoute>
  );
}