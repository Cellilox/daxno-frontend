import { ImageResponse } from "next/og";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";

export const runtime = "nodejs";

export const alt = "Cellilox — AI agent for every document you handle";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Read colocated assets from disk. `fetch(file://...)` is unsupported in the
// Node runtime, so resolve the bundled path and read it synchronously.
function asset(path: string) {
  return readFileSync(fileURLToPath(new URL(path, import.meta.url)));
}

export default async function OpengraphImage() {
  const regular = asset("./_og/Inter-400.woff");
  const bold = asset("./_og/Inter-700.woff");
  const extra = asset("./_og/Inter-800.woff");
  const logoSrc = `data:image/png;base64,${asset("./_og/logo.png").toString("base64")}`;
  const logoMarkSrc = `data:image/png;base64,${asset("./_og/logo-mark.png").toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          fontFamily: "Inter",
          backgroundImage:
            "linear-gradient(125deg, #d6ece7 0%, #cdd9e4 42%, #d29bb0 78%, #c1758f 100%)",
        }}
      >
        {/* diagonal sheen */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            backgroundImage:
              "linear-gradient(115deg, rgba(255,255,255,0) 38%, rgba(255,255,255,0.35) 52%, rgba(255,255,255,0) 66%)",
          }}
        />

        {/* left: copy */}
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            width: 660,
            padding: "64px 0 64px 70px",
          }}
        >
          <img
            src={logoMarkSrc}
            width={104}
            height={104}
            style={{ marginBottom: 30 }}
          />
          <div
            style={{
              display: "flex",
              fontSize: 62,
              fontWeight: 800,
              color: "#11294a",
              lineHeight: 1.04,
              letterSpacing: -1.5,
              marginBottom: 22,
            }}
          >
            AI agent for every document you handle.
          </div>
          <div
            style={{
              display: "flex",
              fontSize: 25,
              fontWeight: 400,
              color: "#3f5168",
              lineHeight: 1.35,
              maxWidth: 520,
              marginBottom: 36,
            }}
          >
            Pick a document type and spin up an agent that reads every file you
            drop in.
          </div>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              alignSelf: "flex-start",
              backgroundColor: "#11294a",
              color: "#ffffff",
              fontSize: 22,
              fontWeight: 700,
              padding: "15px 30px",
              borderRadius: 999,
            }}
          >
            Create your first Agent (free)
          </div>
        </div>

        {/* right: brand illustration */}
        <div
          style={{
            display: "flex",
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            paddingRight: 36,
          }}
        >
          <img src={logoSrc} width={440} height={440} />
        </div>
      </div>
    ),
    {
      ...size,
      fonts: [
        { name: "Inter", data: regular, weight: 400, style: "normal" },
        { name: "Inter", data: bold, weight: 700, style: "normal" },
        { name: "Inter", data: extra, weight: 800, style: "normal" },
      ],
    }
  );
}
