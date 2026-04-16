'use client'

import Link from "next/link";
import Demo from "@/components/Demo";
import { motion, Variants } from "framer-motion";
import { Sparkles, ArrowRight, Check } from "lucide-react";
import HeroLiveDemo from "@/components/landing/HeroLiveDemo";
import DocMarquee from "@/components/landing/DocMarquee";
import StatsStrip from "@/components/landing/StatsStrip";
import DocumentTypesGrid from "@/components/landing/DocumentTypesGrid";
import AIChatShowcase from "@/components/landing/AIChatShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import DocumentShowcase from "@/components/landing/DocumentShowcase";
import FeaturesDeepDive from "@/components/landing/FeaturesDeepDive";
import Testimonials from "@/components/landing/Testimonials";
import PricingSection from "@/components/landing/PricingSection";
import CTABanner from "@/components/landing/CTABanner";

export default function Home() {
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 15
      }
    }
  };

  return (
    <div className="relative min-h-screen bg-white overflow-hidden selection:bg-blue-100 selection:text-blue-900">
      {/* Dynamic Background Elements - Optimized for PWA/Mobile Fancy */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-5%] left-[-5%] sm:w-[50%] sm:h-[50%] w-[70%] h-[30%] bg-blue-50/80 rounded-full blur-[60px] sm:blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-5%] right-[-5%] sm:w-[50%] sm:h-[50%] w-[70%] h-[30%] bg-indigo-50/80 rounded-full blur-[60px] sm:blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-10 sm:pt-20 pb-20 sm:pb-28">
        <div className="grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-16 lg:items-start">
          <motion.div
            className="text-left"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {/* Pill badge */}
            <motion.div
              variants={itemVariants}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/60 text-blue-700 text-[10px] sm:text-[11px] font-bold uppercase tracking-[0.15em] mb-6 shadow-sm"
            >
              <Sparkles size={13} className="animate-spin-slow" />
              Document intelligence platform
            </motion.div>

            {/* Headline */}
            <motion.h1
              variants={itemVariants}
              className="text-[2.25rem] leading-[1.05] sm:text-6xl lg:text-7xl font-black tracking-tight text-gray-900 mb-5"
            >
              Every document.{" "}
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600">
                Understood.
              </span>{" "}
              Instantly.
            </motion.h1>

            {/* Concrete subhead */}
            <motion.p
              variants={itemVariants}
              className="max-w-xl text-base sm:text-lg text-gray-500 mb-8 leading-relaxed"
            >
              Upload invoices, contracts, purchase orders, bank statements, or budgets. Cellilox
              scans, classifies, and extracts every field — then makes it all queryable in plain
              language.
            </motion.p>

            {/* CTAs */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-6"
            >
              <Link
                href="/dashboard"
                className="group relative inline-flex items-center justify-center gap-2.5 bg-gray-900 text-white font-semibold py-3.5 px-7 rounded-xl shadow-xl shadow-gray-900/15 hover:bg-blue-600 transition-all hover:scale-[1.02] active:scale-95 text-sm sm:text-base"
              >
                Start for free
                <ArrowRight size={17} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <div>
                <Demo />
              </div>
            </motion.div>

            {/* Trust row */}
            <motion.div
              variants={itemVariants}
              className="flex flex-wrap items-center gap-x-5 gap-y-2"
            >
              {[
                "No credit card required",
                "Any document format",
                "GDPR compliant",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-center gap-1.5 text-xs text-gray-500"
                >
                  <Check size={13} className="text-emerald-600" strokeWidth={3} />
                  {item}
                </div>
              ))}
            </motion.div>
          </motion.div>

          {/* Right column: live product demo */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
          >
            <HeroLiveDemo />
          </motion.div>
        </div>
      </main>

      <DocMarquee />
      <StatsStrip />
      <DocumentTypesGrid />
      <AIChatShowcase />
      <HowItWorks />
      <DocumentShowcase />
      <FeaturesDeepDive />
      <Testimonials />
      <PricingSection />
      <CTABanner />

      <style jsx global>{`
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-spin-slow {
          animation: spin-slow 12s linear infinite;
        }
      `}</style>
    </div>
  );
}