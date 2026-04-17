'use client'

import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import SectionEyebrow from "./SectionEyebrow";

type Plan = {
  name: string;
  desc: string;
  price: string;
  period?: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
};

const PLANS: Plan[] = [
  {
    name: "Free",
    desc: "Kick the tyres on Cellilox — no card, no commitment.",
    price: "Free",
    period: "forever",
    features: [
      "25 pages every 30 days",
      "Up to 3 documents per day",
      "Curated trusted AI models",
      "AI extraction + natural-language queries",
      "Team collaboration & shared links",
    ],
    cta: "Start for free",
    href: "/dashboard",
  },
  {
    name: "Managed (GYOK)",
    desc: "Pay-as-you-go credits. We manage the AI key and rotation.",
    price: "Credits",
    period: "pay-as-you-go",
    features: [
      "~100 pages per $1 of credits",
      "No monthly commitment",
      "Trusted premium models (OpenAI, Anthropic, Google, DeepSeek)",
      "Transparent per-request usage dashboard",
      "Automatic key rotation & security",
      "OCR $0.01/page + real-time AI token rate",
    ],
    cta: "Buy credits",
    href: "/billing?tab=configuration&option=managed",
    featured: true,
  },
  {
    name: "BYOK",
    desc: "Bring your own provider key — you only pay Cellilox's platform fee.",
    price: "$10",
    period: "/month · or $100/yr",
    features: [
      "1,000 pages every 30 days",
      "Bring your own OpenAI, Anthropic, DeepSeek or Google key",
      "Direct AI billing with your provider",
      "Full control over model selection",
      "Yearly plan saves $20",
      "Same extraction, queries & collaboration",
    ],
    cta: "Subscribe to BYOK",
    href: "/billing?tab=configuration&option=byok",
  },
];

export default function PricingSection() {
  return (
    <section id="pricing" className="border-y border-gray-100 bg-white py-24">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="max-w-2xl"
        >
          <SectionEyebrow>Pricing</SectionEyebrow>
          <h2 className="text-4xl font-black tracking-tight text-gray-900 sm:text-5xl">
            Simple, <span className="bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">transparent</span> pricing
          </h2>
          <p className="mt-4 text-base leading-relaxed text-gray-500 sm:text-lg">
            Start free. Top up credits when you need more, or bring your own key.
            Every tier includes full AI extraction, natural-language queries and team collaboration.
          </p>
        </motion.div>

        <div className="mt-14 grid grid-cols-1 gap-6 lg:grid-cols-3">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-60px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className={`relative overflow-hidden rounded-3xl p-8 ${
                plan.featured
                  ? "bg-gradient-to-br from-gray-900 via-gray-900 to-indigo-950 text-white shadow-2xl shadow-blue-500/20"
                  : "border border-gray-100 bg-gray-50/60 text-gray-900"
              }`}
            >
              {plan.featured && (
                <>
                  <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-blue-500/20 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-purple-500/20 blur-3xl" />
                  <span className="relative mb-3 inline-block rounded-md bg-gradient-to-r from-blue-500 to-indigo-500 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                    Most popular
                  </span>
                </>
              )}
              <h3 className={`relative text-lg font-black ${plan.featured ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h3>
              <p className={`relative mt-1 text-sm ${plan.featured ? "text-white/50" : "text-gray-500"}`}>
                {plan.desc}
              </p>
              <div className="relative mt-6 flex items-baseline gap-1">
                <span className={`text-4xl font-black tracking-tight ${plan.featured ? "text-white" : "text-gray-900"}`}>
                  {plan.price}
                </span>
                {plan.period && (
                  <span className={`text-sm ${plan.featured ? "text-white/50" : "text-gray-400"}`}>
                    {plan.period}
                  </span>
                )}
              </div>
              <ul className="relative mt-6 space-y-3">
                {plan.features.map((f) => (
                  <li
                    key={f}
                    className={`flex items-start gap-2.5 text-sm ${
                      plan.featured ? "text-white/70" : "text-gray-600"
                    }`}
                  >
                    <span
                      className={`mt-0.5 flex h-4 w-4 flex-shrink-0 items-center justify-center rounded ${
                        plan.featured ? "bg-white/10" : "bg-emerald-50"
                      }`}
                    >
                      <Check size={10} className={plan.featured ? "text-white" : "text-emerald-600"} />
                    </span>
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`relative mt-8 flex w-full items-center justify-center rounded-xl py-3 text-sm font-bold transition-all ${
                  plan.featured
                    ? "bg-white text-gray-900 hover:bg-gray-100"
                    : "border border-gray-200 bg-white text-gray-900 hover:border-blue-500 hover:text-blue-600"
                }`}
              >
                {plan.cta}
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
