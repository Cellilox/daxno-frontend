'use client'

import { animate, useInView, useMotionValue, useTransform, motion } from "framer-motion";
import { useEffect, useRef } from "react";

type Stat = {
  value: number;
  suffix?: string;
  prefix?: string;
  decimals?: number;
  label: string;
  display?: (v: number) => string;
};

const STATS: Stat[] = [
  { value: 500, suffix: "+", label: "Businesses across East Africa" },
  { value: 2, suffix: "M+", label: "Documents processed" },
  { value: 99.4, suffix: "%", decimals: 1, label: "Extraction accuracy" },
  {
    value: 2,
    label: "Average parse time",
    display: (v) => `<${v.toFixed(0)}s`,
  },
];

function AnimatedNumber({ stat }: { stat: Stat }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const rounded = useTransform(mv, (v) =>
    stat.display ? stat.display(v) : `${stat.prefix ?? ""}${v.toFixed(stat.decimals ?? 0)}${stat.suffix ?? ""}`
  );

  useEffect(() => {
    if (!inView) return;
    const controls = animate(mv, stat.value, {
      duration: 1.4,
      ease: [0.22, 1, 0.36, 1],
    });
    return () => controls.stop();
  }, [inView, mv, stat.value]);

  return <motion.span ref={ref}>{rounded}</motion.span>;
}

export default function StatsStrip() {
  return (
    <section className="border-y border-gray-100 bg-white">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-y-10 px-6 py-14 sm:px-8 lg:grid-cols-4 lg:gap-0 lg:px-12">
        {STATS.map((stat, i) => (
          <div
            key={stat.label}
            className={`px-4 lg:px-8 ${
              i !== STATS.length - 1 ? "lg:border-r lg:border-gray-100" : ""
            }`}
          >
            <div className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
              <AnimatedNumber stat={stat} />
            </div>
            <div className="mt-2 text-xs leading-snug text-gray-500 sm:text-sm">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
