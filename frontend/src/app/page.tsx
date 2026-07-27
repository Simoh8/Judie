import Hero from "@/components/Hero";
import Features from "@/components/Features";
import HowItWorks from "@/components/HowItWorks";
import SessionTypes from "@/components/SessionTypes";
import Testimonials from "@/components/Testimonials";
import CTA from "@/components/CTA";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <main className="min-h-screen">
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <SessionTypes />
      <Testimonials />
      <CTA />
      <Footer />
    </main>
  );
}
