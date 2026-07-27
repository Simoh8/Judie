"use client";

import { createContext, useContext, useEffect, ReactNode } from "react";
import { useUserStore } from "@/stores/userStore";

interface AuthContextType {
  user: any;
  token: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, name: string, password: string) => Promise<boolean>;
  googleLogin: (email: string, name: string, token: string) => Promise<boolean>;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const userStore = useUserStore();

  useEffect(() => {
    userStore.loadUser();
  }, []);

  return (
    <AuthContext.Provider value={{
      user: userStore.user,
      token: userStore.token,
      login: userStore.login,
      signup: userStore.signup,
      googleLogin: userStore.googleLogin,
      logout: userStore.logout,
      loading: userStore.loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
