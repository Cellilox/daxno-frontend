'use client'

import { motion } from "framer-motion";
import {
  Receipt,
  FileText,
  Landmark,
  FileSignature,
  Wallet,
  TrendingUp,
  Truck,
  Package,
} from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";

const DOC_TYPES = [
  {
    icon: Receipt,
    title: "Invoices",
    desc: "Tax invoices, proforma, commercial — any currency, any format.",
    color: "bg-blue-50 text-blue-600",
    wash: "from-blue-50/80 to-transparent",
  },
  {
    icon: FileText,
    title: "Purchase Orders",
    desc: "Supplier POs, blanket orders, and procurement requests.",
    color: "bg-amber-50 text-amber-700",
    wash: "from-amber-50/80 to-transparent",
  },
  {
    icon: Landmark,
    title: "Bank Statements",
    desc: "Monthly statements, transactions, and reconciliation files.",
    color: "bg-sky-50 text-sky-600",
    wash: "from-sky-50/80 to-transparent",
  },
  {
    icon: FileSignature,
    title: "Contracts",
    desc: "Service agreements, NDAs, vendor contracts, and SLAs.",
    color: "bg-purple-50 text-purple-600",
    wash: "from-purple-50/80 to-transparent",
  },
  {
    icon: Wallet,
    title: "Budget Plans",
    desc: "Departmental budgets, cost breakdowns, and forecasts.",
    color: "bg-emerald-50 text-emerald-600",
    wash: "from-emerald-50/80 to-transparent",
  },
  {
    icon: TrendingUp,
    title: "Financial Reports",
    desc: "P&L statements, balance sheets, and management accounts.",
    color: "bg-indigo-50 text-indigo-600",
    wash: "from-indigo-50/80 to-transparent",
  },
  {
    icon: Truck,
    title: "Logistics Documents",
    desc: "Delivery notes, waybills, customs forms, and manifests.",
    color: "bg-teal-50 text-teal-600",
    wash: "from-teal-50/80 to-transparent",
  },
  {
    icon: Package,
    title: "Receipts & Vouchers",
    desc: "Expense receipts, payment vouchers, and cash advances.",
    color: "bg-rose-50 text-rose-600",
    wash: "from-rose-50/80 to-transparent",
  },
];

export default function DocumentTypesGrid() {
  return (
    <section id="documents" className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <SectionEyebrow>What we handle</SectionEyebrow>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            One platform for <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">every business document</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500 sm:text-lg">
            Finance, logistics, supply chain, procurement — if it&apos;s a document your business
            generates or receives, Cellilox understands it.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 overflow-hidden rounded-3xl border border-gray-100 bg-gray-100 sm:grid-cols-2 lg:grid-cols-4">
          {DOC_TYPES.map((dt, i) => (
            <motion.div
              key={dt.title}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.45, delay: i * 0.05 }}
              className="group relative bg-white p-7 transition-all duration-300 hover:-translate-y-0.5"
              style={{ boxShadow: "1px 1px 0 0 rgb(243 244 246)" }}
            >
              <div
                className={`pointer-events-none absolute inset-0 bg-gradient-to-br ${dt.wash} opacity-0 transition-opacity duration-300 group-hover:opacity-100`}
              />
              <div className="relative">
                <div
                  className={`mb-5 flex h-11 w-11 items-center justify-center rounded-xl ${dt.color} transition-transform group-hover:scale-105`}
                >
                  <dt.icon size={20} />
                </div>
                <h3 className="mb-1 text-base font-bold text-gray-900">{dt.title}</h3>
                <p className="text-sm leading-relaxed text-gray-500">{dt.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
