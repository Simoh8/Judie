"use client";

import { Twitter, Linkedin, Instagram, Youtube } from "lucide-react";

const currentYear = new Date().getFullYear();

const footerLinks = {
  product: [
    { name: "How it works", href: "/how-it-works" },
    { name: "Sessions", href: "/sessions" },
    { name: "Pricing", href: "/pricing" },
    { name: "For teams", href: "/for-teams" },
  ],
  company: [
    { name: "About", href: "/about" },
    { name: "Blog", href: "/blog" },
    { name: "Careers", href: "/careers" },
    { name: "Press", href: "/press" },
  ],
  support: [
    { name: "Help center", href: "/help-center" },
    { name: "Contact", href: "/contact" },
    { name: "Privacy", href: "/privacy" },
    { name: "Terms", href: "/terms" },
  ],
};

const socialLinks = [
  { icon: Twitter, href: "#", label: "Twitter" },
  { icon: Linkedin, href: "#", label: "LinkedIn" },
  { icon: Instagram, href: "#", label: "Instagram" },
  { icon: Youtube, href: "#", label: "YouTube" },
];

export default function Footer() {
  return (
    <footer className="bg-gray-50 dark:bg-ios-gray-900 py-16 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-12 mb-12">
          <div className="md:col-span-1">
            <a href="/" className="text-3xl font-bold text-ios-blue mb-4 block">
              FLOWN
            </a>
            <p className="text-foreground/60 mb-6">
              Less distraction. More feel-good focus.
            </p>
            <div className="flex gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-full bg-ios-gray-100 dark:bg-ios-gray-800 hover:bg-ios-gray-200 dark:hover:bg-ios-gray-700 transition-colors"
                  aria-label={social.label}
                >
                  <social.icon size={20} className="text-foreground/70" />
                </a>
              ))}
            </div>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Product</h3>
            <ul className="space-y-3">
              {footerLinks.product.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-foreground/60 hover:text-ios-blue transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-foreground/60 hover:text-ios-blue transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-semibold text-foreground mb-4">Support</h3>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <a
                    href={link.href}
                    className="text-foreground/60 hover:text-ios-blue transition-colors"
                  >
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="border-t border-ios-gray-200 dark:border-ios-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-foreground/50 text-sm">
            © {currentYear} FLOWN. All rights reserved.
          </p>
          <p className="text-foreground/50 text-sm">
            Made with ❤️ for focused minds
          </p>
        </div>
      </div>
    </footer>
  );
}
