"use client";

import { useState } from "react";
import { X, Mail, Lock, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: "login" | "signup";
}

export default function AuthModal({
  isOpen,
  onClose,
  defaultMode = "login",
}: AuthModalProps) {
  const [mode, setMode] = useState<"login" | "signup">(defaultMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, signup } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let success = false;
      if (mode === "login") {
        success = await login(email, password);
      } else {
        success = await signup(email, name, password);
      }

      if (success) {
        onClose();
        setEmail("");
        setPassword("");
        setName("");
      } else {
        setError(mode === "login" ? "Invalid credentials" : "Signup failed");
      }
    } catch {
      setError("An error occurred");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    // Redirect directly to the backend's allauth Google login endpoint.
    // This allows allauth to generate the necessary 'state' parameter 
    // and set the session cookie to prevent CSRF errors on callback.
    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL ?? "";
    window.location.href = `${backendUrl}/accounts/google/login/`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative bg-white dark:bg-ios-gray-900 rounded-3xl p-8 w-full max-w-md animate-scale-in">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
        >
          <X size={20} />
        </button>

        <h2 className="text-2xl font-bold mb-6 text-foreground">
          {mode === "login" ? "Welcome back" : "Create account"}
        </h2>

        {/* Google Sign-In — placed above the email form to mirror Google's own UX */}
        <button
          id="google-signin-btn"
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 mb-6 border border-ios-gray-200 dark:border-ios-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-ios-gray-800 transition-colors font-medium text-foreground"
        >
          {/* Official Google G logo */}
          <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Divider */}
        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-ios-gray-200 dark:border-ios-gray-700" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-ios-gray-900 text-foreground/60">
              Or sign in with email
            </span>
          </div>
        </div>

        {/* Email / password form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === "signup" && (
            <div>
              <label className="block text-sm font-medium mb-2 text-foreground">
                Name
              </label>
              <div className="relative">
                <User
                  size={20}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
                />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                  placeholder="Your name"
                  required
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Email
            </label>
            <div className="relative">
              <Mail
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2 text-foreground">
              Password
            </label>
            <div className="relative">
              <Lock
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-ios-gray-200 dark:border-ios-gray-700 bg-transparent focus:outline-none focus:ring-2 focus:ring-ios-blue text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
          </div>

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="btn-ios btn-primary w-full text-lg"
          >
            {loading
              ? "Loading..."
              : mode === "login"
              ? "Sign in"
              : "Create account"}
          </button>
        </form>

        <p className="mt-6 text-center text-foreground/60">
          {mode === "login" ? "Don't have an account? " : "Already have an account? "}
          <button
            onClick={() => setMode(mode === "login" ? "signup" : "login")}
            className="text-ios-blue font-medium hover:underline"
          >
            {mode === "login" ? "Sign up" : "Sign in"}
          </button>
        </p>
      </div>
    </div>
  );
}
