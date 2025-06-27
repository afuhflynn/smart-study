"use client";

import { Header } from "@/components/layout/header";
import { Hero } from "@/components/sections/hero";
import { Footer } from "@/components/layout/footer";
import { Features } from "@/components/sections/features";
import { HowItWorks } from "@/components/layout/how-it-works";
import { CTA } from "@/components/layout/cta";
import { Testimonials } from "@/components/layout/testimonials";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Enhanced Navbar */}
      <Header />

      {/* Enhanced Hero Section */}
      <Hero />

      {/* Enhanced Features Section */}
      <Features />

      {/* How It Works */}
      <HowItWorks />

      {/* Testimonials */}
      <Testimonials />
      {/* CTA Section */}
      <CTA />

      {/* Enhanced Footer */}
      <Footer />
    </div>
  );
}
