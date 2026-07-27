import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";

export const metadata: Metadata = {
  title: "FLOWN | Body Doubling & Virtual Co-working for Focus",
  description: "Get into flow and beat procrastination with online body doubling. Daily focus sessions with built-in accountability, expert facilitation and friendly community.",
  keywords: ["body doubling", "focus", "ADHD", "productivity", "virtual co-working", "flow state"],
  authors: [{ name: "FLOWN" }],
  openGraph: {
    title: "FLOWN | Body Doubling & Virtual Co-working for Focus",
    description: "Get into flow and beat procrastination with online body doubling.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
