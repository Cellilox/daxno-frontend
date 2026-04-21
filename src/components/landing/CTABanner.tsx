'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { REQUEST_DEMO_EVENT } from "@/components/Demo";

export default function CTABanner() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7 }}
          className="relative overflow-hidden rounded-[2rem] bg-gray-950 px-8 py-16 sm:px-16 sm:py-20"
        >
          {/* Animated mesh blobs */}
          <div className="pointer-events-none absolute inset-0 opacity-70">
            <div className="absolute -left-16 top-0 h-72 w-72 rounded-full bg-blue-600/30 blur-[100px] animate-mesh-drift" />
            <div
              className="absolute right-0 top-1/3 h-80 w-80 rounded-full bg-indigo-600/30 blur-[120px] animate-mesh-drift"
              style={{ animationDelay: "4s" }}
            />
            <div
              className="absolute bottom-0 left-1/2 h-64 w-64 rounded-full bg-purple-600/30 blur-[100px] animate-mesh-drift"
              style={{ animationDelay: "8s" }}
            />
          </div>

          {/* Grid texture */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.04]"
            style={{
              backgroundImage:
                "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
              backgroundSize: "56px 56px",
            }}
          />

          <div className="relative grid grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_auto]">
            <div>
              <div className="mb-3 text-[11px] font-bold uppercase tracking-[0.2em] text-white/40">
                Get started today
              </div>
              <h2 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
                Stop managing <br className="hidden sm:block" />
                <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
                  documents manually.
                </span>
              </h2>
              <p className="mt-5 max-w-lg text-base leading-relaxed text-white/55">
                Join 500+ businesses across East Africa that turned document chaos into structured,
                queryable, actionable data. Free to start — no setup, no credit card.
              </p>
            </div>

            <div className="flex flex-col items-start gap-3 lg:items-end">
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-blue-500 to-indigo-500 px-8 py-4 text-sm font-bold text-white shadow-lg shadow-blue-500/30 transition-all hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/40"
              >
                Create your free account
                <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
              </Link>
              <button
                type="button"
                onClick={() => window.dispatchEvent(new CustomEvent(REQUEST_DEMO_EVENT))}
                className="text-sm text-white/50 transition-colors hover:text-white"
              >
                Schedule a demo →
              </button>
              <div className="text-xs text-white/30">
                No credit card · Cancel anytime · GDPR compliant
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
