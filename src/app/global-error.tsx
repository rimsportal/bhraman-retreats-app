"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.toLowerCase().includes("chunk") ||
      error?.message?.toLowerCase().includes("dynamically imported module") ||
      error?.message?.toLowerCase().includes("failed to fetch");

    if (isChunkError) {
      const reloadKey = `global_chunk_reload`;
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  return (
    <html lang="en">
      <body style={{ background: "#fcfbfa", color: "#1d281f", fontFamily: "system-ui, sans-serif", padding: "40px", display: "grid", placeItems: "center", minHeight: "100vh" }}>
        <div style={{ textAlign: "center", maxWidth: "500px" }}>
          <p style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.1em", textTransform: "uppercase", color: "#7b3a34" }}>A quiet pause</p>
          <h1 style={{ fontFamily: "Georgia, serif", fontSize: "28px", margin: "8px 0 16px" }}>The journey could not be opened just now.</h1>
          <p style={{ color: "#667768", fontSize: "14px", lineHeight: "1.6", marginBottom: "24px" }}>
            A newer version of the website was just deployed. Please refresh to load the latest experience.
          </p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            style={{
              padding: "12px 28px",
              background: "#7b3a34",
              color: "#ffffff",
              border: "none",
              borderRadius: "999px",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
            }}
          >
            Refresh &amp; Reload Experience
          </button>
        </div>
      </body>
    </html>
  );
}
