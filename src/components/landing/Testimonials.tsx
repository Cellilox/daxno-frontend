'use client'

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { Star } from "lucide-react";
import { MouseEvent, useRef } from "react";
import SectionEyebrow from "./SectionEyebrow";

const ITEMS = [
  {
    initials: "AM",
    avatarBg: "bg-gradient-to-br from-blue-500 to-indigo-600",
    quote:
      "We process over 400 supplier invoices a month. Cellilox cut our data entry time by 90% and we caught three duplicate payments in the first week.",
    name: "Amina Murekatete",
    role: "CFO · Rwanda Logistics Group",
  },
  {
    initials: "JN",
    avatarBg: "bg-gradient-to-br from-purple-500 to-pink-500",
    quote:
      "The contract expiry alerts alone saved us from missing two critical renewals. Having all our procurement documents in one searchable place is transformative.",
    name: "Jean-Pierre Nkurunziza",
    role: "Head of Procurement · Inyange Industries",
  },
  {
    initials: "SK",
    avatarBg: "bg-gradient-to-br from-emerald-500 to-teal-500",
    quote:
      "Our auditors used to spend days gathering bank statements and reconciliations. Now it's one export and 20 minutes. Cellilox understands our documents perfectly.",
    name: "Solange Kabera",
    role: "Finance Manager · Equity Bank Rwanda",
  },
];

function TiltCard({ item }: { item: (typeof ITEMS)[number] }) {
  const ref = useRef<HTMLDivElement>(null);
  const rx = useMotionValue(0);
  const ry = useMotionValue(0);
  const rotateX = useSpring(useTransform(ry, (v) => -v), { stiffness: 180, damping: 20 });
  const rotateY = useSpring(rx, { stiffness: 180, damping: 20 });

  const onMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width - 0.5;
    const y = (e.clientY - r.top) / r.height - 0.5;
    rx.set(x * 8);
    ry.set(y * 8);
  };
  const onLeave = () => {
    rx.set(0);
    ry.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={onLeave}
      style={{ rotateX, rotateY, transformPerspective: 800 }}
      className="group rounded-2xl border border-gray-100 bg-white p-7 shadow-sm transition-shadow duration-300 hover:shadow-xl hover:shadow-blue-100/50"
    >
      <div className="mb-4 flex gap-1">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star key={i} size={14} className="fill-amber-400 text-amber-400" />
        ))}
      </div>
      <p className="mb-6 text-sm italic leading-relaxed text-gray-600">&ldquo;{item.quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold text-white ${item.avatarBg}`}>
          {item.initials}
        </div>
        <div>
          <div className="text-sm font-bold text-gray-900">{item.name}</div>
          <div className="text-xs text-gray-400">{item.role}</div>
        </div>
      </div>
    </motion.div>
  );
}

export default function Testimonials() {
  return (
    <section className="bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <SectionEyebrow>From our customers</SectionEyebrow>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            Trusted by <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">finance and operations</span> teams
          </h2>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 md:grid-cols-3">
          {ITEMS.map((item, i) => (
            <motion.div
              key={item.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <TiltCard item={item} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
