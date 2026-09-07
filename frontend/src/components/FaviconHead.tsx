"use client";

import { useEffect } from "react";

export default function FaviconHead() {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        const response = await fetch('/api/settings?category=frontend&public=true', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        const data = await response.json();
        if (data.success && Array.isArray(data.settings)) {
          const faviconSetting = data.settings.find(
            (s: { key: string }) => s.key === 'favicon_url'
          );
          if (faviconSetting && faviconSetting.value) {
            const faviconUrl = faviconSetting.value;
            let link: HTMLLinkElement | null = document.querySelector("link[rel*='icon']");
            if (!link) {
              link = document.createElement('link');
              link.rel = 'icon';
              document.getElementsByTagName('head')[0].appendChild(link);
            }
            link.href = faviconUrl;
          }
        }
      } catch (err) {
        console.error("Failed to load custom favicon:", err);
      }
    };

    updateFavicon();
  }, []);

  return null;
}
