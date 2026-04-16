'use client'

import { AnimatePresence, motion, useInView, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Check, Loader2, Sparkles } from "lucide-react";

type Field = { label: string; value: string };

type DocData = {
  type: string;
  title: string;
  meta: string;
  barClass: string;
  badgeLabel: string;
  badgeClass: string;
  fields: Field[];
  query: string;
  answer: string;
};

const DOCS: DocData[] = [
  {
    type: "Tax Invoice",
    title: "Inyange Industries Ltd.",
    meta: "INV-2025-0391 · March 28, 2025",
    barClass: "bg-emerald-500",
    badgeLabel: "Invoice",
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    fields: [
      { label: "Vendor", value: "MTN Rwanda" },
      { label: "Amount", value: "RWF 1,534,000" },
      { label: "Due", value: "Apr 28, 2025" },
      { label: "VAT", value: "RWF 234,000" },
    ],
    query: "Total VAT collected in Q1?",
    answer: "RWF 2.18M across 43 invoices.",
  },
  {
    type: "Purchase Order",
    title: "PO-RW-2025-1148",
    meta: "Rwanda Energy Group · Apr 2, 2025",
    barClass: "bg-amber-500",
    badgeLabel: "Purchase Order",
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-200",
    fields: [
      { label: "Supplier", value: "Sonas Energy" },
      { label: "Items", value: "6 line items" },
      { label: "Delivery", value: "Apr 30, 2025" },
      { label: "Total", value: "RWF 8.05M" },
    ],
    query: "Any duplicate POs this month?",
    answer: "2 flagged — exposure RWF 8.04M.",
  },
  {
    type: "Bank Statement",
    title: "Bank of Kigali",
    meta: "00440-1128-293 · March 2025",
    barClass: "bg-sky-500",
    badgeLabel: "Bank Statement",
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-200",
    fields: [
      { label: "Holder", value: "Rwanda Logistics" },
      { label: "Credits", value: "RWF 20.7M" },
      { label: "Debits", value: "RWF 29.0M" },
      { label: "Balance", value: "RWF 84.3M" },
    ],
    query: "Reconcile March transactions.",
    answer: "84 matched, 2 unmatched — CSV ready.",
  },
  {
    type: "Service Contract",
    title: "Equity Bank Rwanda",
    meta: "Signed Jan 15, 2023 · 3-year term",
    barClass: "bg-purple-500",
    badgeLabel: "Contract",
    badgeClass: "bg-purple-50 text-purple-700 ring-purple-200",
    fields: [
      { label: "Counterparty", value: "Equity Bank" },
      { label: "Value", value: "RWF 18M/yr" },
      { label: "Expires", value: "Jun 3, 2025" },
      { label: "Renewal", value: "Auto" },
    ],
    query: "Contracts expiring in 90 days?",
    answer: "4 expiring by Jul 14 — reminders drafted.",
  },
];

// Beat timings (ms from cycle start)
const BEAT_TIMES = [0, 1200, 2400, 4000];
const CYCLE_MS = 6500;

function StatusBadge({ beat, doc }: { beat: number; doc: DocData }) {
  if (beat === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-blue-700 ring-1 ring-blue-200">
        <Loader2 size={10} className="animate-spin" />
        Scanning…
      </span>
    );
  }
  if (beat === 1) {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-md bg-indigo-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-indigo-700 ring-1 ring-indigo-200">
        <span className="flex gap-0.5">
          <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-600 [animation-delay:0ms]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-600 [animation-delay:150ms]" />
          <span className="h-1 w-1 animate-bounce rounded-full bg-indigo-600 [animation-delay:300ms]" />
        </span>
        Classifying…
      </span>
    );
  }
  return (
    <motion.span
      initial={{ scale: 0.85, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: "spring", stiffness: 400, damping: 24 }}
      className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[10px] font-semibold uppercase tracking-wider ring-1 ${doc.badgeClass}`}
    >
      <Check size={10} strokeWidth={3} />
      {doc.badgeLabel}
    </motion.span>
  );
}

function Typewriter({ text }: { text: string }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i < text.length) t = setTimeout(tick, 16 + Math.random() * 14);
    };
    t = setTimeout(tick, 100);
    return () => clearTimeout(t);
  }, [text]);
  return (
    <span>
      {shown}
      <span className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[2px] bg-blue-400 align-middle animate-blink" />
    </span>
  );
}

export default function HeroLiveDemo() {
  const [docIdx, setDocIdx] = useState(0);
  // Initial beat = 3 so SSR renders a complete, attractive frame before JS boots.
  const [beat, setBeat] = useState(3);
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { margin: "-100px" });
  const reducedMotion = useReducedMotion();

  useEffect(() => {
    if (reducedMotion) return;
    if (!inView) return;
    setBeat(0);
    const timeouts = BEAT_TIMES.map((t, i) => setTimeout(() => setBeat(i), t));
    const advance = setTimeout(() => setDocIdx((i) => (i + 1) % DOCS.length), CYCLE_MS);
    return () => {
      timeouts.forEach(clearTimeout);
      clearTimeout(advance);
    };
  }, [docIdx, inView, reducedMotion]);

  const doc = DOCS[docIdx];

  return (
    <div ref={containerRef} className="relative mx-auto w-full max-w-lg">
      {/* Glow halo */}
      <div className="pointer-events-none absolute -inset-6 -z-10 rounded-[2rem] bg-gradient-to-br from-blue-100 via-indigo-100 to-purple-100 opacity-60 blur-2xl" />

      {/* Doc card */}
      <div className="relative overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-2xl shadow-gray-900/10">
        <div className={`h-1 transition-colors duration-500 ${doc.barClass}`} />
        <div className="relative overflow-hidden p-5">
          {/* Scanning line (CSS keyframe, only during beat 0) */}
          <AnimatePresence>
            {beat === 0 && !reducedMotion && (
              <motion.div
                key={`scan-${docIdx}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="pointer-events-none absolute inset-0"
              >
                <div
                  className="animate-scanning-line absolute left-0 right-0 h-[2px] bg-red-500"
                  style={{ boxShadow: "0 0 18px 2px rgba(239, 68, 68, 0.7)" }}
                />
                <div className="absolute inset-0 bg-gradient-to-b from-red-500/5 via-transparent to-transparent" />
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-gray-400">
                {doc.type}
              </div>
              <div className="mt-1 truncate text-base font-bold text-gray-900">{doc.title}</div>
              <div className="mt-0.5 truncate text-xs text-gray-400">{doc.meta}</div>
            </div>
            <StatusBadge beat={beat} doc={doc} />
          </div>

          {/* Mock doc body */}
          <div className="mt-5 space-y-2.5">
            {[88, 72, 95, 62, 80, 55].map((w, i) => (
              <div
                key={i}
                className="h-2 rounded-full bg-gradient-to-r from-gray-100 to-gray-50"
                style={{ width: `${w}%` }}
              />
            ))}
          </div>

          {/* AI parse strip — always rendered, fades in at beat >= 2 so the doc card never resizes */}
          <div
            className={`mt-5 flex items-center justify-between rounded-lg bg-gradient-to-r from-blue-50 via-indigo-50 to-purple-50 px-3 py-2 text-[11px] transition-opacity duration-300 ${
              beat >= 2 ? "opacity-100" : "opacity-0"
            }`}
          >
            <div className="flex items-center gap-1.5">
              <Sparkles size={11} className="text-blue-600" />
              <span className="text-gray-500">AI parsed</span>
              <span className="font-semibold text-blue-700">
                {doc.fields.length * 3} fields · {(0.7 + docIdx * 0.1).toFixed(1)}s
              </span>
            </div>
            <span className="text-gray-400">0 errors</span>
          </div>
        </div>
      </div>

      {/* Spreadsheet row slot — height reserved so the demo doesn't jump between beats */}
      <div className="mt-4 min-h-[66px]">
        <AnimatePresence mode="wait">
          {beat >= 2 && (
            <motion.div
              key={`row-${docIdx}`}
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
              className="relative overflow-hidden rounded-xl border border-gray-100 bg-white shadow-xl shadow-gray-900/5"
            >
              <div className="flex items-center gap-2 border-b border-gray-100 bg-gray-50/70 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400">
                <span className="w-28 flex-shrink-0">Document</span>
                {doc.fields.map((f) => (
                  <span key={f.label} className="flex-1 truncate">
                    {f.label}
                  </span>
                ))}
              </div>
              <div className="flex items-center gap-2 px-3 py-2.5 text-[11px]">
                <span className="flex w-28 flex-shrink-0 items-center gap-1.5 truncate font-medium text-gray-900">
                  <span className={`h-1.5 w-1.5 flex-shrink-0 rounded-full ${doc.barClass}`} />
                  <span className="truncate">{doc.title}</span>
                </span>
                {doc.fields.map((f, i) => (
                  <motion.span
                    key={`${docIdx}-${f.label}`}
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.08 * i, duration: 0.25 }}
                    className="relative flex-1 truncate text-gray-700"
                  >
                    {f.value}
                  </motion.span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* AI chat bubble slot — height reserved */}
      <div className="mt-4 min-h-[148px]">
        <AnimatePresence mode="wait">
          {beat >= 3 && (
            <motion.div
              key={`chat-${docIdx}`}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="relative overflow-hidden rounded-xl bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 p-4 text-white shadow-xl shadow-indigo-900/20"
            >
              <div className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full bg-blue-500/20 blur-2xl" />
              <div className="relative">
                <div className="mb-2 text-[10px] font-bold uppercase tracking-wider text-white/40">
                  You asked
                </div>
                <div className="mb-3 text-sm font-medium text-white/90">&ldquo;{doc.query}&rdquo;</div>
                <div className="flex items-start gap-2.5">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-[9px] font-bold">
                    AI
                  </div>
                  <div className="flex-1 text-sm leading-relaxed text-white/80">
                    <Typewriter text={doc.answer} />
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Doc type pager */}
      <div className="mt-4 flex items-center justify-center gap-1.5">
        {DOCS.map((d, i) => (
          <button
            key={d.type}
            onClick={() => setDocIdx(i)}
            aria-label={`Show ${d.type}`}
            className={`h-1.5 rounded-full transition-all ${
              i === docIdx ? "w-8 bg-gradient-to-r from-blue-600 to-indigo-600" : "w-1.5 bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
