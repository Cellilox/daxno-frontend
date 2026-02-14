'use client'

import Link from "next/link";
import Demo from "@/components/Demo";
import { motion, Variants } from "framer-motion";
import { Sparkles, Zap, ArrowRight, Brain, Globe, Shield } from "lucide-react";

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

      <main className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-12 sm:pt-24 pb-32">
        <motion.div
          className="text-center"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Revolutionary Badge */}
          <motion.div
            variants={itemVariants}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-100/50 text-blue-700 text-[10px] sm:text-xs font-bold uppercase tracking-[0.15em] mb-8 shadow-sm"
          >
            <Sparkles size={14} className="animate-spin-slow" />
            AI Revolution
          </motion.div>

          {/* Optimized Heading for PWA/App feel */}
          <motion.h1
            variants={itemVariants}
            className="text-[2rem] leading-[1.15] sm:text-6xl lg:text-8xl font-black tracking-tight text-gray-900 mb-6 shrink-0"
          >
            Empower Business with <br className="hidden sm:block" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 px-1 leading-[1.3]">
              Cellilox Intelligence
            </span>
          </motion.h1>

          {/* Balanced Subtext */}
          <motion.p
            variants={itemVariants}
            className="max-w-2xl mx-auto text-base sm:text-xl md:text-2xl text-gray-500 mb-10 leading-relaxed font-medium"
          >
            The intuitive AI extraction engine. Turn unorganized documents into structured data,
            leverage Advanced RAG, and scale 24/7.
          </motion.p>

          {/* Tactile CTA Hub */}
          <motion.div
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 mb-20"
          >
            <Link
              href="/dashboard"
              className="w-full sm:w-auto group relative inline-flex items-center justify-center gap-3 bg-blue-600 text-white font-bold py-4 px-10 rounded-2xl shadow-xl shadow-blue-500/20 hover:bg-blue-700 transition-all hover:scale-[1.02] active:scale-95 text-base sm:text-lg overflow-hidden"
            >
              Get Started Free
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <div className="w-full sm:w-auto">
              <Demo />
            </div>
          </motion.div>

          {/* Grid optimized for App Feel */}
          <motion.div
            variants={itemVariants}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 text-left max-w-6xl mx-auto"
          >
            <div className="group p-6 sm:p-8 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-blue-100 transition-all duration-300">
              <div className="w-11 h-11 bg-blue-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Zap size={22} className="text-blue-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">Instant Extraction</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-500">From scans to spreadsheets in seconds using cutting-edge NLP.</p>
            </div>

            <div className="group p-6 sm:p-8 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300">
              <div className="w-11 h-11 bg-indigo-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Brain size={22} className="text-indigo-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">Advanced RAG</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-500">Retrieval-Augmented Generation to query your documents with speed.</p>
            </div>

            <div className="group p-6 sm:p-8 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-purple-100 transition-all duration-300">
              <div className="w-11 h-11 bg-purple-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Shield size={22} className="text-purple-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">Secure AI</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-500">Bank-level encryption ensures your data stays private and secure.</p>
            </div>

            <div className="group p-6 sm:p-8 rounded-[1.5rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl hover:border-emerald-100 transition-all duration-300">
              <div className="w-11 h-11 bg-emerald-50 rounded-xl flex items-center justify-center mb-5 group-hover:scale-105 transition-transform">
                <Globe size={22} className="text-emerald-600" />
              </div>
              <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-1.5">Global Intake</h3>
              <p className="text-xs sm:text-sm leading-relaxed text-gray-500">Process documents from email and cloud storage automatically.</p>
            </div>
          </motion.div>
        </motion.div>
      </main>

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