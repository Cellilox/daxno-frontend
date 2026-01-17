"use client";

import { useEffect, useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist/webpack";
import type { PDFDocumentProxy, RenderTask } from "pdfjs-dist";

// serve the worker from /public
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.js";
const cMapUrl = `https://cdn.jsdelivr.net/npm/pdfjs-dist@${pdfjsLib.version}/cmaps/`;

interface Geometry { left: number; top: number; width: number; height: number }
interface Answer { text: string; geometry: Geometry; page: number }
interface PdfViewerProps {
  fileUrl: string;
  activeItem: string | null;
  answers: Record<string, Answer>;
  totalPages?: number;
}

export default function PdfViewer({
  fileUrl,
  activeItem,
  answers,
  totalPages,
}: PdfViewerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [pdf, setPdf] = useState<PDFDocumentProxy | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageDimensions, setPageDimensions] = useState<Record<number, { width: number; height: number }>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renderScale, setRenderScale] = useState(1);
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });

  const renderTaskRef = useRef<RenderTask | null>(null);
  const isMountedRef = useRef(true);
  const pendingRenderRef = useRef(false);

  // 1) Load PDF & preload dims
  useEffect(() => {
    isMountedRef.current = true;
    setIsLoading(true);
    setError(null);

    const loadingTask = pdfjsLib.getDocument({ url: fileUrl, cMapUrl, cMapPacked: true });
    loadingTask.promise
      .then((pdfDoc: any) => {
        if (!isMountedRef.current) return;
        setPdf(pdfDoc);

        const dims: Record<number, { width: number; height: number }> = {};
        return Promise.all(
          Array.from({ length: pdfDoc.numPages }, (_, i) => i + 1).map(i =>
            pdfDoc.getPage(i).then((page: any) => {
              const vp = page.getViewport({ scale: 1 });
              dims[i] = { width: vp.width, height: vp.height };
            })
          )
        ).then(() => {
          if (!isMountedRef.current) return;
          setPageDimensions(dims);
          setIsLoading(false);
        });
      })
      .catch((err: any) => {
        if (!isMountedRef.current) return;
        console.error("PDF loading error:", err);
        setError("Failed to load PDF document. Please check the file URL.");
        setIsLoading(false);
      });

    return () => {
      isMountedRef.current = false;
      renderTaskRef.current?.cancel();
      pdf?.destroy();
    };
  }, [fileUrl]);

  // 2) Track container size
  useEffect(() => {
    if (!containerRef.current) return;
    const update = () => {
      if (!isMountedRef.current) return;
      const { width, height } = containerRef.current!.getBoundingClientRect();
      setContainerSize({ width, height });
    };
    update();
    const ro = new ResizeObserver(update);
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  // 3) Compute renderScale (tighter zoom)
  useEffect(() => {
    if (!pdf) return;
    const { width, height } = containerSize;
    if (width === 0 || height === 0) return;

    pdf.getPage(currentPage).then(page => {
      const vp = page.getViewport({ scale: 1 });
      const scale = Math.min(width / vp.width, height / vp.height, 2);
      setRenderScale(Math.max(scale, 1));
    });
  }, [pdf, currentPage, containerSize]);

  // 4) Render page + highlights (no tooltips)
  useEffect(() => {
    if (!pdf || !canvasRef.current) return;
    if (currentPage < 1 || currentPage > pdf.numPages) return;
    if (pendingRenderRef.current) return;
    pendingRenderRef.current = true;

    const doRender = async () => {
      renderTaskRef.current?.cancel();
      try {
        const page = await pdf.getPage(currentPage);
        const viewport = page.getViewport({ scale: renderScale });
        const canvas = canvasRef.current!;
        const ctx = canvas.getContext("2d", { willReadFrequently: true })!;

        canvas.width = viewport.width;
        canvas.height = viewport.height;
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;
        await task.promise;

        if (isMountedRef.current) {
          // draw highlights with "Premium Highlighter" look
          const canvas = canvasRef.current!;
          const ctx = canvas.getContext("2d")!;

          Object.entries(answers).forEach(([key, ans]) => {
            if (ans.page !== currentPage) return;
            const left = ans.geometry.left * viewport.width;
            const top = ans.geometry.top * viewport.height;
            const w = ans.geometry.width * viewport.width;
            const h = ans.geometry.height * viewport.height;

            const isActive = key === activeItem;

            if (isActive) {
              // ACTIVE: Vibrant Blue with Glow & Fill
              ctx.shadowColor = "rgba(37, 99, 235, 0.4)"; // Blue-600 shadow
              ctx.shadowBlur = 10;
              ctx.fillStyle = "rgba(59, 130, 246, 0.2)"; // Blue-500 fill (20%)
              ctx.strokeStyle = "#2563EB"; // Blue-600 border
              ctx.lineWidth = 2;

              // Draw fill then stroke
              ctx.fillRect(left, top, w, h);
              ctx.strokeRect(left, top, w, h);

              // Reset shadow for next items
              ctx.shadowColor = "transparent";
              ctx.shadowBlur = 0;
            } else {
              // INACTIVE: Subtle Gray/Blue
              ctx.fillStyle = "rgba(226, 232, 240, 0.1)"; // Slate-200 fill (10%)
              ctx.strokeStyle = "#94a3b8"; // Slate-400
              ctx.lineWidth = 1;
              // Optional: setLineDash([4, 2]) for dashed look? 
              // Let's keep it solid but thin for cleaner look.
              ctx.strokeRect(left, top, w, h);
            }
          });
        }
      } catch (err: any) {
        if (!err.message.includes("cancelled")) {
          console.error("Page rendering error:", err);
        }
      } finally {
        pendingRenderRef.current = false;
        renderTaskRef.current = null;
      }
    };

    doRender();
    return () => {
      renderTaskRef.current?.cancel();
      pendingRenderRef.current = false;
    };
  }, [pdf, currentPage, activeItem, answers, renderScale]);

  // 5) Hover jumps only valid pages
  useEffect(() => {
    if (!pdf || !activeItem) return;
    const ans = answers[activeItem];
    if (!ans) return;
    const p = ans.page;
    if (p >= 1 && p <= pdf.numPages && p !== currentPage) {
      setCurrentPage(p);
    }
  }, [activeItem, answers, pdf]);

  // Keyboard nav
  const goToPage = (p: number) => {
    if (!pdf || p < 1 || p > pdf.numPages) return;
    setCurrentPage(p);
  };
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPage(currentPage - 1);
      if (e.key === "ArrowRight") goToPage(currentPage + 1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [currentPage, pdf]);

  return (
    <div className="flex flex-col w-full h-full">
      {/* navigation */}
      <div className="hidden md:flex justify-between items-center mb-2 bg-gray-100 p-2 rounded-t">
        <button
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          ← Prev
        </button>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">
            Page {currentPage} {pdf ? `of ${pdf.numPages}` : ""}
          </span>
          {totalPages && <span className="text-xs text-gray-500">(Original: {totalPages} pages)</span>}
        </div>
        <button
          onClick={() => goToPage(currentPage + 1)}
          disabled={pdf ? currentPage >= pdf.numPages : false}
          className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 transition disabled:opacity-50"
        >
          Next →
        </button>
      </div>

      {/* PDF canvas */}
      <div
        ref={containerRef}
        className="relative flex-grow border border-gray-200 rounded-b bg-gray-50 overflow-hidden"
        style={{ minHeight: "500px" }}
      >
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-90 z-30">
            {/* spinner */}
          </div>
        )}
        {error && (
          <div className="absolute inset-0 flex items-center justify-center z-30 p-4 bg-white">
            {/* error UI */}
          </div>
        )}
        {!isLoading && !error && (
          <div className="absolute inset-0 flex justify-center items-center overflow-auto">
            <canvas
              ref={canvasRef}
              className="shadow-lg bg-white"
              style={{ maxWidth: "100%", maxHeight: "100%", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
