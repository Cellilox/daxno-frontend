'use client'

import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";
import { ArrowUpRight, ArrowDownRight, Repeat, Sparkles } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";

const TXNS = [
  { type: "cr", desc: "MTN Rwanda PLC — Payment received", date: "Mar 3, 2025", amt: "+ RWF 12,500,000" },
  { type: "db", desc: "Sonas Energy — Supplier payment", date: "Mar 7, 2025", amt: "− RWF 6,820,000" },
  { type: "cr", desc: "Equity Bank Rwanda — Invoice settlement", date: "Mar 14, 2025", amt: "+ RWF 8,200,000" },
  { type: "db", desc: "RRA — Tax remittance Q1", date: "Mar 25, 2025", amt: "− RWF 3,480,000" },
  { type: "tr", desc: "Internal transfer — Payroll account", date: "Mar 28, 2025", amt: "− RWF 18,700,000" },
];

const PO_ITEMS = [
  { desc: "Solar panel — 400W mono", qty: 20, unit: "RWF 185,000", total: "RWF 3,700,000" },
  { desc: "Inverter 5kVA", qty: 4, unit: "RWF 320,000", total: "RWF 1,280,000" },
  { desc: "Battery 200Ah deep cycle", qty: 10, unit: "RWF 140,000", total: "RWF 1,400,000" },
  { desc: "Installation & cabling", qty: 1, unit: "RWF 440,000", total: "RWF 440,000" },
];

export default function DocumentShowcase() {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const yA = useTransform(scrollYProgress, [0, 1], [30, -30]);
  const yB = useTransform(scrollYProgress, [0, 1], [-20, 40]);

  return (
    <section className="border-y border-gray-100 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <SectionEyebrow>Document examples</SectionEyebrow>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            Real documents. <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Real data.</span>
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500 sm:text-lg">
            See how Cellilox renders and structures the exact documents your business works with every day.
          </p>
        </motion.div>

        <div ref={ref} className="mt-14 grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Bank Statement */}
          <motion.div
            style={{ y: yA }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6 }}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40"
          >
            <div className="flex items-start justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <div className="text-base font-bold text-gray-900">Bank of Kigali — Account Statement</div>
                <div className="mt-0.5 text-xs text-gray-400">Account No. 00440-1128-293 · March 2025</div>
              </div>
              <span className="rounded-md bg-sky-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-sky-600">
                Statement
              </span>
            </div>
            <div className="bg-gray-50/40 px-6 py-5">
              <div className="mb-4 flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Account holder</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">Rwanda Logistics Group Ltd.</div>
                  <div className="mt-0.5 text-xs text-gray-500">Kigali Business Centre, KG 7 Ave</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Closing balance</div>
                  <div className="mt-1 text-2xl font-black text-gray-900">RWF 84,320,000</div>
                  <div className="mt-0.5 text-xs text-gray-400">As at Mar 31, 2025</div>
                </div>
              </div>

              <div className="flex flex-col divide-y divide-gray-100">
                {TXNS.map((t) => (
                  <div key={t.desc} className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                          t.type === "cr"
                            ? "bg-emerald-50 text-emerald-600"
                            : t.type === "db"
                            ? "bg-rose-50 text-rose-600"
                            : "bg-sky-50 text-sky-600"
                        }`}
                      >
                        {t.type === "cr" ? (
                          <ArrowUpRight size={14} />
                        ) : t.type === "db" ? (
                          <ArrowDownRight size={14} />
                        ) : (
                          <Repeat size={14} />
                        )}
                      </div>
                      <div>
                        <div className="text-xs font-medium text-gray-900">{t.desc}</div>
                        <div className="text-[11px] text-gray-400">{t.date}</div>
                      </div>
                    </div>
                    <div
                      className={`text-sm font-semibold ${
                        t.type === "cr" ? "text-emerald-600" : t.type === "db" ? "text-rose-600" : "text-gray-700"
                      }`}
                    >
                      {t.amt}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <AIStrip fields="5 transactions · 3 categories identified" time="0.8s" />
          </motion.div>

          {/* Purchase Order */}
          <motion.div
            style={{ y: yB }}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-xl shadow-gray-200/40"
          >
            <div className="flex items-start justify-between border-b border-gray-100 bg-white px-6 py-4">
              <div>
                <div className="text-base font-bold text-gray-900">Purchase Order — PO-RW-2025-1148</div>
                <div className="mt-0.5 text-xs text-gray-400">Rwanda Energy Group · April 2, 2025</div>
              </div>
              <span className="rounded-md bg-amber-50 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-amber-700">
                Pending approval
              </span>
            </div>
            <div className="bg-gray-50/40 px-6 py-5">
              <div className="mb-4 flex items-start justify-between border-b border-gray-100 pb-4">
                <div>
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Issued by</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">Rwanda Energy Group S.A.</div>
                  <div className="mt-0.5 text-xs text-gray-500">KN 3 Rd, Kigali · VAT: 100473958</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Supplier</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">Sonas Energy Ltd.</div>
                  <div className="mt-0.5 text-xs text-gray-500">Delivery by Apr 30, 2025</div>
                </div>
              </div>

              <table className="w-full text-xs">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th className="py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Item</th>
                    <th className="py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Qty</th>
                    <th className="py-2 text-left text-[10px] font-semibold uppercase tracking-wider text-gray-400">Unit</th>
                    <th className="py-2 text-right text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {PO_ITEMS.map((it) => (
                    <tr key={it.desc}>
                      <td className="py-2.5 text-gray-600">{it.desc}</td>
                      <td className="py-2.5 text-gray-600">{it.qty}</td>
                      <td className="py-2.5 text-gray-600">{it.unit}</td>
                      <td className="py-2.5 text-right font-medium text-gray-900">{it.total}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="mt-4 flex justify-end gap-8 pt-2">
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Subtotal</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">RWF 6,820,000</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">VAT (18%)</div>
                  <div className="mt-1 text-sm font-semibold text-gray-900">RWF 1,227,600</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-semibold uppercase tracking-wider text-gray-400">Total</div>
                  <div className="mt-1 text-lg font-black text-gray-900">RWF 8,047,600</div>
                </div>
              </div>
            </div>
            <AIStrip fields="14 fields · 4 line items · VAT verified" time="0.9s" />
          </motion.div>
        </div>
      </div>
    </section>
  );
}

function AIStrip({ fields, time }: { fields: string; time: string }) {
  return (
    <div className="flex items-center justify-between border-t border-gray-100 bg-gradient-to-r from-blue-50/60 via-indigo-50/50 to-purple-50/60 px-6 py-3">
      <div className="flex items-center gap-2 text-xs">
        <Sparkles size={12} className="text-blue-600" />
        <span className="text-gray-500">AI parsed</span>
        <span className="font-medium text-blue-700">{fields}</span>
      </div>
      <div className="text-[11px] text-gray-400">{time}</div>
    </div>
  );
}
