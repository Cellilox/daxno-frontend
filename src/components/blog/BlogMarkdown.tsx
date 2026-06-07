"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

/**
 * Renders blog post Markdown inside Tailwind `prose` typography.
 * Kept as a client component so react-markdown/remark-gfm (ESM) bundle cleanly.
 */
export default function BlogMarkdown({ content }: { content: string }) {
  return (
    <div className="prose prose-lg prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-blue-600 prose-img:rounded-xl">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
