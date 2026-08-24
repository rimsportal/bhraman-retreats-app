"use client";

import { useEffect } from "react";

export default function HomepageError({
  error,
  reset,
}: {
  error?: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // If a deployment occurred and chunk hashes changed, auto-reload to fetch fresh bundles
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.toLowerCase().includes("chunk") ||
      error?.message?.toLowerCase().includes("dynamically imported module") ||
      error?.message?.toLowerCase().includes("failed to fetch");

    if (isChunkError) {
      const reloadKey = `chunk_reload_${window.location.pathname}`;
      const lastReload = sessionStorage.getItem(reloadKey);
      const now = Date.now();
      if (!lastReload || now - Number(lastReload) > 10000) {
        sessionStorage.setItem(reloadKey, String(now));
        window.location.reload();
      }
    }
  }, [error]);

  const handleRetry = () => {
    const isChunkError =
      error?.name === "ChunkLoadError" ||
      error?.message?.toLowerCase().includes("chunk") ||
      error?.message?.toLowerCase().includes("dynamically imported module");

    if (isChunkError) {
      window.location.reload();
    } else {
      reset();
    }
  };

  return (
    <main className="page-error">
      <p className="eyebrow">A quiet pause</p>
      <h1>The journey could not be opened just now.</h1>
      <p>Please try again. Your enquiry and retreat information remain safe.</p>
      <button className="button button-dark" type="button" onClick={handleRetry}>
        Try again
      </button>
    </main>
  );
}
