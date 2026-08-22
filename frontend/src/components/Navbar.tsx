"use client";

import { useState, useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Menu, X, User, ChevronDown, LayoutDashboard, CalendarDays, UserCircle, LogOut, ShieldCheck } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const userMenuRef = useRef<HTMLDivElement>(null);

  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const checkHash = () => {
      if (typeof window !== "undefined") {
        if (window.location.hash === "#signup") {
          setAuthMode("signup");
          setIsAuthModalOpen(true);
        } else if (window.location.hash === "#login") {
          setAuthMode("login");
          setIsAuthModalOpen(true);
        }
      }
    };
    checkHash();
    window.addEventListener("hashchange", checkHash);
    return () => window.removeEventListener("hashchange", checkHash);
  }, []);

  // Close user dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const navItems = [
    { name: "How it works", href: "/#how-it-works" },
    { name: "Sessions", href: "/#sessions" },
    { name: "Pricing", href: "/#pricing" },
    { name: "About", href: "/about" },
  ];

  const userNavItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "My Sessions", href: "/my-sessions", icon: CalendarDays },
    { name: "Profile", href: "/profile", icon: UserCircle },
  ];

  const adminNavItems = [
    { name: "Admin Sessions", href: "/admin/sessions", icon: ShieldCheck },
    { name: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
  ];

  const displayName = user?.firstName || user?.email?.split("@")[0] || "Account";
  const activeItems = user?.isStaff ? adminNavItems : userNavItems;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass ios-shadow py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link href="/" className="text-2xl font-bold tracking-tight text-ios-blue">
              FLOWN
            </Link>

            {/* Desktop right section */}
            <div className="hidden md:flex items-center gap-4">
              {loading ? (
                <div className="flex items-center gap-3 animate-pulse">
                  <div className="w-8 h-8 bg-foreground/10 rounded-full" />
                  <div className="w-24 h-9 bg-foreground/10 rounded-full" />
                </div>
              ) : user ? (
                /* ── User avatar + dropdown ── */
                <div ref={userMenuRef} className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen((v) => !v)}
                    className="flex items-center gap-2 px-3 py-2 rounded-2xl hover:bg-foreground/5 transition-colors duration-200 group"
                  >
                    {/* Avatar circle */}
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center shadow-sm">
                      <span className="text-xs font-bold text-white uppercase">
                        {displayName[0]}
                      </span>
                    </div>
                    <span className="text-sm font-medium text-foreground/80 group-hover:text-foreground transition-colors max-w-[100px] truncate">
                      {displayName}
                    </span>
                    <ChevronDown
                      size={15}
                      className={`text-foreground/50 transition-transform duration-200 ${
                        isUserMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {/* Dropdown panel */}
                  {isUserMenuOpen && (
                    <div className="absolute right-0 top-full mt-2 w-52 card-ios ios-shadow-lg py-2 animate-scale-in origin-top-right">
                      {/* Header */}
                      <div className="px-4 py-2 border-b border-foreground/5 mb-1">
                        <p className="text-xs text-foreground/40 uppercase tracking-wider font-medium">
                          {user.isStaff ? "Admin" : "My Account"}
                        </p>
                        <p className="text-sm font-semibold text-foreground truncate mt-0.5">
                          {user.email}
                        </p>
                      </div>

                      {/* Nav links */}
                      {activeItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          onClick={() => setIsUserMenuOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors duration-150 hover:bg-ios-blue/5 hover:text-ios-blue ${
                            pathname === item.href ? "text-ios-blue bg-ios-blue/5" : "text-foreground/70"
                          }`}
                        >
                          <item.icon size={16} className="shrink-0" />
                          {item.name}
                        </Link>
                      ))}

                      {/* Divider + sign out */}
                      <div className="border-t border-foreground/5 mt-1 pt-1">
                        <button
                          onClick={() => {
                            logout();
                            setIsUserMenuOpen(false);
                          }}
                          className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 w-full text-left"
                        >
                          <LogOut size={16} className="shrink-0" />
                          Sign out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* ── Guest links ── */
                <>
                  {isLandingPage &&
                    navItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        className="text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors duration-300"
                      >
                        {item.name}
                      </Link>
                    ))}
                  <button
                    onClick={() => setIsAuthModalOpen(true)}
                    className="btn-ios btn-primary text-sm"
                  >
                    Get Started
                  </button>
                </>
              )}
            </div>

            {/* Mobile hamburger */}
            <button
              className="md:hidden p-2 rounded-full hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Mobile drawer */}
          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-slide-down">
              <div className="flex flex-col space-y-1">
                {user ? (
                  <>
                    {/* User header */}
                    <div className="flex items-center gap-3 px-2 py-3 mb-2 border-b border-foreground/10">
                      <div className="w-9 h-9 rounded-full bg-gradient-to-br from-ios-blue to-purple-500 flex items-center justify-center shadow-sm">
                        <span className="text-sm font-bold text-white uppercase">{displayName[0]}</span>
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{displayName}</p>
                        <p className="text-xs text-foreground/50 truncate max-w-[180px]">{user.email}</p>
                      </div>
                    </div>

                    {activeItems.map((item) => (
                      <Link
                        key={item.name}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium transition-colors duration-150 ${
                          pathname === item.href
                            ? "text-ios-blue bg-ios-blue/5"
                            : "text-foreground/70 hover:bg-foreground/5 hover:text-foreground"
                        }`}
                      >
                        <item.icon size={18} />
                        {item.name}
                      </Link>
                    ))}

                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150 w-full text-left mt-1"
                    >
                      <LogOut size={18} />
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    {isLandingPage &&
                      navItems.map((item) => (
                        <Link
                          key={item.name}
                          href={item.href}
                          className="px-3 py-3 text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors duration-300 rounded-xl hover:bg-foreground/5"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {item.name}
                        </Link>
                      ))}
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-ios btn-primary text-sm w-full mt-2"
                    >
                      Get Started
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </nav>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          if (
            typeof window !== "undefined" &&
            (window.location.hash === "#signup" || window.location.hash === "#login")
          ) {
            window.history.replaceState(null, "", window.location.pathname + window.location.search);
          }
        }}
        defaultMode={authMode}
        key={authMode + isAuthModalOpen}
      />
    </>
  );
}
