'use client'

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { Upload, Brain, Download } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";

const STEPS = [
  {
    num: "01",
    icon: Upload,
    title: "Upload any document",
    desc: "Drag and drop PDFs, scans, images, or spreadsheets. Forward by email, or connect Google Drive, Dropbox, or your ERP.",
    details: ["PDF, JPEG, PNG, XLSX, DOCX", "Any language, any currency", "Bulk upload supported"],
  },
  {
    num: "02",
    icon: Brain,
    title: "AI extracts and structures",
    desc: "Our extraction engine reads every field, identifies document type, validates data, and stores it in a clean queryable database.",
    details: ["99.4% extraction accuracy", "Under 2 seconds per document", "Automatic duplicate detection"],
  },
  {
    num: "03",
    icon: Download,
    title: "Query, analyse, and export",
    desc: "Ask questions in plain language, generate reports, set alerts for expiring contracts, and export structured data.",
    details: ["Natural language queries", "CSV, Excel, and PDF export", "API access for integrations"],
  },
];

export default function HowItWorks() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <SectionEyebrow>How it works</SectionEyebrow>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            From document chaos to <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">structured clarity</span>
          </h2>
        </motion.div>

        <div ref={ref} className="relative mt-16">
          {/* Animated connector line (desktop) */}
          <svg
            className="pointer-events-none absolute left-0 top-[38px] hidden h-0.5 w-full lg:block"
            preserveAspectRatio="none"
            viewBox="0 0 1000 2"
          >
            <defs>
              <linearGradient id="hiwGrad" x1="0" x2="1">
                <stop offset="0" stopColor="#2563eb" />
                <stop offset="0.5" stopColor="#6366f1" />
                <stop offset="1" stopColor="#9333ea" />
              </linearGradient>
            </defs>
            <motion.line
              x1="180"
              y1="1"
              x2="820"
              y2="1"
              stroke="url(#hiwGrad)"
              strokeWidth="2"
              strokeDasharray="6 6"
              initial={{ pathLength: 0 }}
              animate={inView ? { pathLength: 1 } : { pathLength: 0 }}
              transition={{ duration: 1.6, ease: "easeInOut" }}
            />
          </svg>

          <div className="grid grid-cols-1 gap-10 lg:grid-cols-3 lg:gap-12">
            {STEPS.map((step, i) => (
              <motion.div
                key={step.num}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                className="relative"
              >
                <div
                  className={`mb-5 flex h-16 w-16 items-center justify-center rounded-2xl text-lg font-black ${
                    i === 0
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/30"
                      : "border border-gray-200 bg-white text-gray-900 shadow-sm"
                  }`}
                >
                  <step.icon size={22} />
                </div>
                <div className="mb-2 text-[11px] font-bold uppercase tracking-[0.2em] text-gray-400">
                  Step {step.num}
                </div>
                <h3 className="mb-2 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{step.desc}</p>
                <ul className="mt-4 space-y-2">
                  {step.details.map((d) => (
                    <li key={d} className="flex items-center gap-2 text-xs text-gray-500">
                      <span className="h-1 w-1 rounded-full bg-gray-300" />
                      {d}
                    </li>
                  ))}
                </ul>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
