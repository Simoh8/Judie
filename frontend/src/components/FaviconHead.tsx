"use client";

import { useEffect } from "react";

export default function FaviconHead() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        // Get the backend URL from environment or use relative path
        const backendUrl = process.env.NEXT__BACKEND_URL || '';
        
        // Generate favicon using the backend endpoint
        const faviconUrl = `${backendUrl}/api/settings/generate_favicon`;
        
        let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
        if (!link) {
          link = document.createElement('link');
          link.rel = 'icon';
          document.getElementsByTagName('head')[0].appendChild(link);
        }
        link.href = faviconUrl;
        
        // Also set apple-touch-icon
        let appleLink: HTMLLinkElement | null = document.querySelector("link[rel='apple-touch-icon']");
        if (!appleLink) {
          appleLink = document.createElement('link');
          appleLink.rel = 'apple-touch-icon';
          document.getElementsByTagName('head')[0].appendChild(appleLink);
        }
        appleLink.href = faviconUrl;
        
      } catch (err) {
        console.error("Failed to load custom favicon:", err);
      }
    };

    updateFavicon();
  }, []);

  return null;
}
