'use client'

import { motion } from "framer-motion";
import { FileText, Search, TrendingUp, Mail, ShieldCheck, ArrowUp, ArrowDown } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";

const FEATURES = [
  {
    icon: FileText,
    color: "bg-blue-50 text-blue-600",
    title: "Universal extraction",
    desc: "Reads any document format — PDF, image, scan, or spreadsheet — with 99.4% field accuracy across 20+ document types.",
  },
  {
    icon: Search,
    color: "bg-amber-50 text-amber-700",
    title: "Natural language queries",
    desc: "Ask questions in plain English, Kinyarwanda, or French. Get precise answers sourced from all uploaded documents.",
  },
  {
    icon: TrendingUp,
    color: "bg-indigo-50 text-indigo-600",
    title: "Cross-document analytics",
    desc: "Compare spend across vendors, track budget vs actuals, spot payment trends, and flag anomalies automatically.",
  },
  {
    icon: Mail,
    color: "bg-purple-50 text-purple-600",
    title: "Automated intake",
    desc: "Forward documents by email, or connect Google Drive, Dropbox, or your ERP for zero-touch ingestion.",
  },
  {
    icon: ShieldCheck,
    color: "bg-rose-50 text-rose-600",
    title: "Enterprise security",
    desc: "AES-256 encryption, role-based access, audit logs, and full GDPR compliance. Your data never trains any model.",
  },
];

const BARS = [
  { label: "Invoices", pct: 78, value: "RWF 847M", color: "bg-blue-500" },
  { label: "POs", pct: 54, value: "RWF 412M", color: "bg-amber-500" },
  { label: "Bank stmts", pct: 41, value: "128 docs", color: "bg-sky-500" },
  { label: "Contracts", pct: 27, value: "84 active", color: "bg-purple-500" },
];

export default function FeaturesDeepDive() {
  return (
    <section id="features" className="bg-gray-50 py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 gap-16 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
          >
            <SectionEyebrow>Platform capabilities</SectionEyebrow>
            <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              Built for how <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">finance and operations</span> teams actually work
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-gray-500">
              Every feature is designed for real document workflows — from receipt to reconciliation,
              from PO to payment.
            </p>

            <div className="mt-8 overflow-hidden rounded-2xl border border-gray-100 bg-white">
              {FEATURES.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, x: -10 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true, margin: "-40px" }}
                  transition={{ duration: 0.4, delay: i * 0.06 }}
                  className={`flex items-start gap-4 px-5 py-5 transition-colors hover:bg-gray-50 ${
                    i !== FEATURES.length - 1 ? "border-b border-gray-100" : ""
                  }`}
                >
                  <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${f.color}`}>
                    <f.icon size={16} />
                  </div>
                  <div>
                    <h4 className="mb-1 text-sm font-bold text-gray-900">{f.title}</h4>
                    <p className="text-sm leading-relaxed text-gray-500">{f.desc}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Metrics panel */}
          <div className="flex flex-col gap-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5 }}
              className="rounded-2xl border border-gray-100 bg-white p-6"
            >
              <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                Total documents processed
              </div>
              <div className="mt-1 flex items-baseline gap-3">
                <div className="text-4xl font-black tracking-tight text-gray-900">2,841</div>
                <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-600">
                  <ArrowUp size={10} className="mb-0.5 mr-0.5 inline" />
                  +18%
                </span>
              </div>
              <div className="mt-4 flex flex-col gap-3">
                {BARS.map((b, i) => (
                  <div key={b.label} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-gray-500">{b.label}</span>
                    <div className="flex-1 overflow-hidden rounded-full bg-gray-100">
                      <motion.div
                        initial={{ width: 0 }}
                        whileInView={{ width: `${b.pct}%` }}
                        viewport={{ once: true, margin: "-40px" }}
                        transition={{ duration: 1, delay: 0.1 * i, ease: [0.22, 1, 0.36, 1] }}
                        className={`h-1.5 rounded-full ${b.color}`}
                      />
                    </div>
                    <span className="w-20 text-right text-xs text-gray-400">{b.value}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.1 }}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Avg. extraction time
                </div>
                <div className="mt-1 text-3xl font-black tracking-tight text-gray-900">1.4s</div>
                <div className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600">
                  <ArrowDown size={10} />
                  <span className="font-semibold">−0.3s</span>
                  <span className="text-gray-400">vs last mo.</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.15 }}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Anomalies flagged
                </div>
                <div className="mt-1 text-3xl font-black tracking-tight text-gray-900">12</div>
                <div className="mt-1 text-xs text-rose-600">
                  <span className="font-semibold">3 unresolved</span>
                  <span className="ml-1 text-gray-400">· need review</span>
                </div>
              </motion.div>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="rounded-2xl border border-gray-100 bg-white p-5"
              >
                <div className="text-[11px] font-semibold uppercase tracking-wider text-gray-400">
                  Expiring contracts
                </div>
                <div className="mt-1 text-3xl font-black tracking-tight text-gray-900">4</div>
                <div className="mt-1 text-xs text-gray-400">
                  Reminders sent for <span className="font-semibold text-gray-700">2</span>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
