"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CheckCircle, XCircle, Loader2 } from "lucide-react";

function PaymentCallbackContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const verifyPayment = async () => {
      const reference = searchParams.get('reference');
      const tokenParam = searchParams.get('token');
      
      // Restore auth token from URL parameter if available
      if (tokenParam && typeof window !== 'undefined') {
        const currentToken = localStorage.getItem('token');
        // Only restore if token is different to avoid infinite reloads
        if (currentToken !== tokenParam) {
          localStorage.setItem('token', tokenParam);
          // Fetch user data with the new token
          try {
            const userResponse = await fetch('/api/users/me', {
              headers: { Authorization: `Bearer ${tokenParam}` }
            });
            if (userResponse.ok) {
              const userData = await userResponse.json();
              if (userData.success && userData.user) {
                localStorage.setItem('user', JSON.stringify(userData.user));
              }
            }
          } catch (error) {
            console.error('Failed to fetch user data:', error);
          }
          // Reload to trigger auth context update
          window.location.reload();
          return;
        }
      }
      
      if (!reference) {
        setStatus('error');
        setMessage('No payment reference found');
        return;
      }

      try {
        // Find the purchase with this reference (no auth required now)
        const response = await fetch(`/api/purchases?paystack_reference=${reference}`);
        const data = await response.json();
        
        if (data.success && data.purchases && data.purchases.length > 0) {
          const purchase = data.purchases[0];
          
          // Verify the payment
          const verifyResponse = await fetch(`/api/purchases/${purchase.id}/verify_payment`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reference })
          });
          
          const verifyData = await verifyResponse.json();
          
          if (verifyData.success) {
            setStatus('success');
            setMessage('Payment completed successfully! Your package is now active.');
          } else {
            setStatus('error');
            setMessage(verifyData.error || 'Payment verification failed');
          }
        } else {
          setStatus('error');
          setMessage('Purchase not found');
        }
      } catch (error) {
        console.error("Payment verification failed:", error);
        setStatus('error');
        setMessage('An error occurred during payment verification');
      }
    };

    verifyPayment();
  }, [searchParams]);

  const handleRedirect = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-ios-gray-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-2xl mx-auto">
          <div className="card-ios ios-shadow-lg p-12 text-center">
            {status === 'loading' && (
              <>
                <div className="flex justify-center mb-6">
                  <Loader2 className="animate-spin text-ios-blue" size={64} />
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Verifying Payment...
                </h1>
                <p className="text-foreground/60">
                  Please wait while we verify your payment with Paystack.
                </p>
              </>
            )}

            {status === 'success' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-green-100 dark:bg-green-900 rounded-full">
                    <CheckCircle className="text-green-600 dark:text-green-300" size={64} />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Payment Successful!
                </h1>
                <p className="text-foreground/60 mb-8">
                  {message}
                </p>
                <button
                  onClick={handleRedirect}
                  className="btn-ios btn-primary"
                >
                  Go to Dashboard
                </button>
              </>
            )}

            {status === 'error' && (
              <>
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-red-100 dark:bg-red-900 rounded-full">
                    <XCircle className="text-red-600 dark:text-red-300" size={64} />
                  </div>
                </div>
                <h1 className="text-2xl font-bold text-foreground mb-4">
                  Payment Failed
                </h1>
                <p className="text-foreground/60 mb-8">
                  {message}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => router.push('/pricing')}
                    className="btn-ios"
                  >
                    Back to Pricing
                  </button>
                  <button
                    onClick={() => router.push('/dashboard')}
                    className="btn-ios btn-primary"
                  >
                    Go to Dashboard
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-white dark:bg-ios-gray-950">
        <Navbar />
        <main className="pt-24 pb-16 px-6">
          <div className="max-w-2xl mx-auto">
            <div className="card-ios ios-shadow-lg p-12 text-center">
              <div className="flex justify-center mb-6">
                <Loader2 className="animate-spin text-ios-blue" size={64} />
              </div>
              <h1 className="text-2xl font-bold text-foreground mb-4">
                Loading...
              </h1>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    }>
      <PaymentCallbackContent />
    </Suspense>
  );
}