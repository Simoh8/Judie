"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [checkingSubscription, setCheckingSubscription] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      if (loading) return;

      if (!user) {
        if (isMounted) {
          setCheckingSubscription(false);
          router.push("/");
        }
        return;
      }

      // Admins and staff have unrestricted access to app features
      if (user.isStaff || user.email === 'admin@focused.com') {
        if (isMounted) {
          setHasAccess(true);
          setCheckingSubscription(false);
        }
        return;
      }

      // Check active packages / trial status for regular users
      try {
        const response = await fetch(`/api/purchases/user_active_packages/?user_id=${user.id}`);
        const data = await response.json();
        
        if (isMounted) {
          if (data.success && Array.isArray(data.activePackages) && data.activePackages.length > 0) {
            setHasAccess(true);
          } else {
            setHasAccess(false);
            // Redirect to pricing page with expired flag if accessing protected features
            if (pathname !== "/pricing") {
              router.push("/pricing?expired=true");
            }
          }
          setCheckingSubscription(false);
        }
      } catch (err) {
        console.error("Failed to verify active package subscription:", err);
        if (isMounted) {
          // On network/API error, default to allowing access to avoid lockouts
          setHasAccess(true);
          setCheckingSubscription(false);
        }
      }
    };

    checkAccess();

    return () => {
      isMounted = false;
    };
  }, [user, loading, router, pathname]);

  if (loading || checkingSubscription) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-ios-gray-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue"></div>
      </div>
    );
  }

  if (!user || (!hasAccess && !(user?.isStaff || user?.email === 'admin@focused.com'))) {
    return null;
  }

  return <>{children}</>;
}
