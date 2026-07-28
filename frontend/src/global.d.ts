/// <reference types="react" />
/// <reference types="react-dom" />

declare module "tailwindcss" {
  interface Theme {
    extend: {
      colors: {
        ios: {
          blue: string;
          green: string;
          orange: string;
          red: string;
          gray: {
            50: string;
            100: string;
            200: string;
            300: string;
            400: string;
            500: string;
            600: string;
            700: string;
            800: string;
            900: string;
          };
        };
      };
      backdropBlur: {
        ios: string;
      };
    };
  }
}

declare module "*.css" {
  const content: { [className: string]: string };
  export default content;
}

declare namespace JSX {
  interface IntrinsicAttributes {
    className?: string;
  }
}

// Custom Tailwind component classes
declare global {
  interface Window {
    readonly __TAILOPHILE_CLASSES__: {
      "btn-ios": string;
      "btn-primary": string;
      "btn-secondary": string;
      "card-ios": string;
      "card-ios-dark": string;
      "glass": string;
      "glass-dark": string;
      "ios-shadow": string;
      "ios-shadow-lg": string;
      "text-balance": string;
      "animate-slide-up": string;
      "animate-fade-in": string;
      "animate-slide-down": string;
      "animate-scale-in": string;
      "animate-float": string;
    };
  }
}
