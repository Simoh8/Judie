"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

export default function AuthCallback() {
  const router = useRouter();
  const { login } = useUserStore();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const userId = urlParams.get("user_id");
      const email = urlParams.get("email");

      if (token && userId && email) {
        // Store the token and user info
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify({
          id: userId,
          email: email,
        }));

        // Update the user store
        useUserStore.setState({
          user: {
            id: userId,
            email: email,
            createdAt: new Date(),
            focusHours: 0,
            sessionsJoined: 0,
          },
          token: token,
          loading: false,
        });

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // If no token, redirect to login with error
        router.push("/?error=oauth_failed");
      }
    };

    handleCallback();
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-ios-blue mx-auto mb-4"></div>
        <p className="text-foreground">Completing authentication...</p>
      </div>
    </div>
  );
}
