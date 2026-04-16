'use client'

const ITEMS = [
  "Invoices",
  "Purchase Orders",
  "Bank Statements",
  "Contracts",
  "Budget Plans",
  "Logistics Reports",
  "Supply Chain Docs",
  "Receipts",
  "Financial Statements",
  "Delivery Notes",
];

export default function DocMarquee() {
  const track = [...ITEMS, ...ITEMS];
  return (
    <div className="relative overflow-hidden border-y border-white/5 bg-gray-900 py-4">
      <div className="flex w-max animate-marquee gap-12">
        {track.map((label, i) => (
          <span
            key={`${label}-${i}`}
            className="flex flex-shrink-0 items-center gap-3 text-xs font-medium uppercase tracking-[0.18em] text-white/45"
          >
            {label}
            <span className="h-1 w-1 rounded-full bg-white/25" />
          </span>
        ))}
      </div>
      <div className="pointer-events-none absolute inset-y-0 left-0 w-16 bg-gradient-to-r from-gray-900 to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-16 bg-gradient-to-l from-gray-900 to-transparent" />
    </div>
  );
}
