'use client'

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { Bot, Send } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";

type Conversation = {
  q: string;
  a: string;
};

const CONVERSATIONS: Conversation[] = [
  {
    q: "What's our total supplier spend in Q1?",
    a: "Total Q1 supplier spend was RWF 187,450,000 across 43 purchase orders and 61 invoices. Top vendors: Inyange Industries (RWF 34M), Rwanda Energy Group (RWF 28M), and Sonas Ltd. (RWF 19M).",
  },
  {
    q: "Show all overdue invoices above RWF 500k",
    a: "Found 7 overdue invoices totalling RWF 8.2M. Oldest: INV-2025-0214 from MTN Rwanda (62 days overdue, RWF 2.1M). Want me to draft reminder emails for all 7?",
  },
  {
    q: "Which contracts expire in the next 90 days?",
    a: "4 contracts expiring by July 14: Equity Bank service agreement (Jun 3), MTN Rwanda logistics SLA (Jun 19), BK Rwanda data processing (Jul 1), and Sonas maintenance contract (Jul 12). Would you like renewal reminders?",
  },
  {
    q: "Compare our Q1 vs Q2 logistics costs",
    a: "Q2 logistics spend is RWF 24.8M — up 12% from Q1 (RWF 22.1M). The jump comes from 3 extra customs-clearance fees on March imports. Fuel and warehousing stayed flat.",
  },
  {
    q: "Find duplicate purchase orders this month",
    a: "Flagged 2 likely duplicates: PO-RW-2025-1148 and PO-RW-2025-1161 both for Sonas Energy, same line items, issued 6 days apart. Total exposure: RWF 8.04M. Review recommended.",
  },
  {
    q: "Export March bank reconciliation to CSV",
    a: "Reconciled 84 transactions across 3 accounts for March. 2 unmatched items flagged. CSV is ready — 12 columns including source document references. Download starting now.",
  },
];

function Typewriter({ text, onDone }: { text: string; onDone?: () => void }) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    let i = 0;
    const tick = () => {
      i += 1;
      setShown(text.slice(0, i));
      if (i < text.length) {
        timeout = setTimeout(tick, 14 + Math.random() * 18);
      } else {
        onDone?.();
      }
    };
    let timeout = setTimeout(tick, 120);
    return () => clearTimeout(timeout);
  }, [text, onDone]);

  return (
    <span>
      {shown}
      <span className="ml-0.5 inline-block h-[0.95em] w-[2px] translate-y-[2px] bg-blue-400 align-middle animate-blink" />
    </span>
  );
}

export default function AIChatShowcase() {
  const [activeIdx, setActiveIdx] = useState(0);
  const active = CONVERSATIONS[activeIdx];
  const scrollRef = useRef<HTMLDivElement>(null);
  const contentKey = useMemo(() => `${activeIdx}`, [activeIdx]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [activeIdx]);

  return (
    <section className="relative overflow-hidden bg-gray-950 py-24">
      {/* Animated gradient mesh */}
      <div className="pointer-events-none absolute inset-0 opacity-60">
        <div className="absolute -left-20 top-10 h-80 w-80 rounded-full bg-blue-600/20 blur-[120px] animate-mesh-drift" />
        <div className="absolute right-0 top-1/2 h-96 w-96 rounded-full bg-indigo-600/20 blur-[140px] animate-mesh-drift" style={{ animationDelay: "4s" }} />
        <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-purple-600/20 blur-[120px] animate-mesh-drift" style={{ animationDelay: "8s" }} />
      </div>

      <div className="relative mx-auto grid max-w-7xl grid-cols-1 items-start gap-16 px-6 sm:px-8 lg:grid-cols-[1fr_1.15fr] lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
        >
          <SectionEyebrow tone="light">AI-powered queries</SectionEyebrow>
          <h2 className="text-4xl font-black leading-tight tracking-tight text-white sm:text-5xl">
            Ask anything.<br />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Get instant answers
            </span>
            <br />
            across all your documents.
          </h2>
          <p className="mt-6 max-w-md text-base leading-relaxed text-white/55">
            No spreadsheets, no manual search. Type what you need in plain language and Cellilox
            finds, summarises, and acts on it across your entire document library.
          </p>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {CONVERSATIONS.map((c, i) => (
              <button
                key={c.q}
                onClick={() => setActiveIdx(i)}
                className={`rounded-full border px-4 py-2 text-xs font-medium transition-all ${
                  i === activeIdx
                    ? "border-blue-400/40 bg-blue-500/15 text-white shadow-[0_0_24px_rgba(59,130,246,0.25)]"
                    : "border-white/10 bg-white/5 text-white/60 hover:border-white/30 hover:bg-white/10 hover:text-white"
                }`}
              >
                {c.q}
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="overflow-hidden rounded-2xl border border-white/10 bg-[#11131a]/90 shadow-2xl backdrop-blur"
        >
          <div className="flex items-center gap-3 border-b border-white/5 bg-black/30 px-5 py-3.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
              <Bot size={14} className="text-white" />
            </div>
            <div>
              <div className="text-sm font-semibold text-white">Cellilox AI</div>
              <div className="text-[11px] text-white/40">Document assistant</div>
            </div>
            <div className="ml-auto flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2.5 py-1 text-[10px] text-white/50">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              348 documents loaded
            </div>
          </div>

          <div ref={scrollRef} className="flex min-h-[340px] flex-col gap-4 p-5">
            <AnimatePresence mode="wait">
              <motion.div
                key={contentKey}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col gap-4"
              >
                <div className="flex items-end gap-2.5 self-end">
                  <div className="max-w-[80%] rounded-2xl rounded-br-sm bg-gradient-to-br from-blue-600 to-indigo-600 px-4 py-2.5 text-sm text-white shadow-lg shadow-blue-500/20">
                    {active.q}
                  </div>
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-white/10 text-[10px] font-bold text-white/60">
                    U
                  </div>
                </div>
                <div className="flex items-end gap-2.5">
                  <div className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-blue-500 to-indigo-600 text-[10px] font-bold text-white">
                    AI
                  </div>
                  <div className="max-w-[83%] rounded-2xl rounded-bl-sm bg-white/[0.06] px-4 py-2.5 text-sm leading-relaxed text-white/80">
                    <Typewriter text={active.a} />
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="flex items-center gap-3 border-t border-white/5 px-5 py-3.5">
            <input
              type="text"
              readOnly
              placeholder="Ask about any document in your library…"
              className="flex-1 rounded-lg border border-white/10 bg-white/5 px-3.5 py-2 text-sm text-white/70 outline-none placeholder:text-white/25"
            />
            <button className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 text-white transition-opacity hover:opacity-90">
              <Send size={14} />
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
