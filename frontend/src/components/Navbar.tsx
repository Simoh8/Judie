"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Menu, X, User } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import AuthModal from "./AuthModal";

export default function Navbar() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { user, logout } = useAuth();

  const isLandingPage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { name: "How it works", href: "/#how-it-works" },
    { name: "Sessions", href: "/#sessions" },
    { name: "Pricing", href: "/#pricing" },
    { name: "About", href: "/#about" },
  ];

  const userNavItems = [
    { name: "Dashboard", href: "/dashboard" },
    { name: "My Sessions", href: "/my-sessions" },
    { name: "Profile", href: "/profile" },
  ];

  const adminNavItems = [
    { name: "Admin Sessions", href: "/admin/sessions" },
  ];

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? "glass ios-shadow py-3" : "bg-transparent py-5"
        }`}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between">
            <a
              href="/"
              className="text-2xl font-bold tracking-tight text-ios-blue"
            >
              FLOWN
            </a>

            <div className="hidden md:flex items-center space-x-8">
              {user ? (
                <div className="flex items-center gap-4">
                  {user.isStaff ? (
                    <>
                      <a
                        href="/admin/sessions"
                        className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors"
                      >
                        Admin Sessions
                      </a>
                      <a
                        href="/admin/dashboard"
                        className="text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors"
                      >
                        Dashboard
                      </a>
                    </>
                  ) : (
                    <>
                      {userNavItems.map((item) => (
                        <a
                          key={item.name}
                          href={item.href}
                          className="text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors"
                        >
                          {item.name}
                        </a>
                      ))}
                    </>
                  )}
                  <button className="flex items-center gap-2 text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors">
                    <User size={20} />
                    {user.firstName || user.email?.split('@')[0]}
                  </button>
                  <button
                    onClick={logout}
                    className="btn-ios btn-secondary text-sm"
                  >
                    Sign out
                  </button>
                </div>
              ) : (
                <>
                  {isLandingPage && navItems.map((item) => (
                    <a
                      key={item.name}
                      href={item.href}
                      className="text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors duration-300"
                    >
                      {item.name}
                    </a>
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

            <button
              className="md:hidden p-2 rounded-full hover:bg-ios-gray-100 dark:hover:bg-ios-gray-800 transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {isMobileMenuOpen && (
            <div className="md:hidden mt-4 pb-4 animate-slide-down">
              <div className="flex flex-col space-y-4">
                {user ? (
                  <>
                    {user.isStaff ? (
                      <>
                        <a
                          href="/admin/sessions"
                          className="text-sm font-medium text-purple-600 hover:text-purple-700 transition-colors duration-300"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Admin Sessions
                        </a>
                        <a
                          href="/admin/dashboard"
                          className="text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors duration-300"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          Dashboard
                        </a>
                      </>
                    ) : (
                      <>
                        {userNavItems.map((item) => (
                          <a
                            key={item.name}
                            href={item.href}
                            className="text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors duration-300"
                            onClick={() => setIsMobileMenuOpen(false)}
                          >
                            {item.name}
                          </a>
                        ))}
                      </>
                    )}
                    <div className="flex items-center gap-2 text-sm font-medium text-foreground/80">
                      <User size={20} />
                      {user.firstName || user.email?.split('@')[0]}
                    </div>
                    <button
                      onClick={() => {
                        logout();
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-ios btn-secondary text-sm w-full"
                    >
                      Sign out
                    </button>
                  </>
                ) : (
                  <>
                    {isLandingPage && navItems.map((item) => (
                      <a
                        key={item.name}
                        href={item.href}
                        className="text-sm font-medium text-foreground/80 hover:text-ios-blue transition-colors duration-300"
                        onClick={() => setIsMobileMenuOpen(false)}
                      >
                        {item.name}
                      </a>
                    ))}
                    <button
                      onClick={() => {
                        setIsAuthModalOpen(true);
                        setIsMobileMenuOpen(false);
                      }}
                      className="btn-ios btn-primary text-sm w-full"
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
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
}
