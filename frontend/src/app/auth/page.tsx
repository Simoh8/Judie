"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import AuthModal from "@/components/AuthModal";
import { useAuth } from "@/contexts/AuthContext";

function AuthContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { user } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(true);
  const redirectPath = searchParams.get('redirect') || '/dashboard';

  useEffect(() => {
    // If user is already logged in, redirect immediately
    if (user) {
      router.push(redirectPath);
    }
  }, [user, router, redirectPath]);

  const handleAuthClose = () => {
    // If modal is closed without auth, go to home
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-white dark:bg-ios-gray-950">
      <Navbar />
      
      <main className="pt-24 pb-16 px-6">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Sign In Required
            </h1>
            <p className="text-foreground/60">
              Please sign in to continue
            </p>
          </div>
        </div>
      </main>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={handleAuthClose}
      />
      
      <Footer />
    </div>
  );
}

export default function AuthPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white dark:bg-ios-gray-950" />}>
      <AuthContent />
    </Suspense>
  );
}
