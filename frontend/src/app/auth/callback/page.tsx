"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useUserStore } from "@/stores/userStore";

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    const handleCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get("token");
      const userId = urlParams.get("user_id");
      const email = urlParams.get("email");
      const name = urlParams.get("name") ?? "";

      if (token && userId && email) {
        const user = {
          id: userId,
          email: email,
          first_name: name.split(" ")[0] ?? "",
          last_name: name.split(" ").slice(1).join(" ") ?? "",
          createdAt: new Date(),
          focusHours: 0,
          sessionsJoined: 0,
        };

        // Persist to localStorage
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        // Update the Zustand store
        useUserStore.setState({ user, token, loading: false });

        // Redirect to dashboard
        router.push("/dashboard");
      } else {
        // OAuth failed — redirect to home with error flag
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

