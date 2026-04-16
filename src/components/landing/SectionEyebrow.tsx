'use client'

export default function SectionEyebrow({
  children,
  tone = "blue",
}: {
  children: React.ReactNode;
  tone?: "blue" | "light";
}) {
  const isLight = tone === "light";
  return (
    <div
      className={`mb-3 flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.2em] ${
        isLight ? "text-white/60" : "text-blue-600"
      }`}
    >
      <span
        className={`h-px w-6 ${
          isLight ? "bg-white/40" : "bg-gradient-to-r from-blue-600 to-indigo-600"
        }`}
      />
      {children}
    </div>
  );
}
