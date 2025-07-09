'use client';

import Image from "next/image";
import { useState } from "react";

const modelOptions = [
  {
    value: "openai",
    label: "OpenAI",
    src: "/icons/openai-icon.png",
    width: 24,
    height: 24,
  },
  {
    value: "deepseek",
    label: "DeepSeek",
    src: "/icons/deepseek-icon.png", 
    width: 24,
    height: 24,
  },

];

export default function ModelSelector() {
  const [selected, setSelected] = useState(modelOptions[0].value);
  const selectedOption = modelOptions.find((m) => m.value === selected)!;

  return (
    <div className="inline-flex items-center border border-blue-400 rounded-md shadow hover:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500">
      {/* Public‑folder SVG via next/image */}
      <Image
        src={selectedOption.src}
        alt={selectedOption.label}
        width={selectedOption.width}
        height={selectedOption.height}
        className="text-blue-600 mx-2 flex-shrink-0"
      />

      <select
        value={selected}
        onChange={(e) => setSelected(e.target.value)}
        className="appearance-none bg-transparent px-2 py-1 text-sm sm:text-base outline-none cursor-pointer"
      >
        {modelOptions.map(({ value, label }) => (
          <option key={value} value={value}>
            {label}
          </option>
        ))}
      </select>

      <svg
        className="w-4 h-4 text-blue-600 mr-2 pointer-events-none"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </div>
  );
}