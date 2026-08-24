"use client";

import { optimizeImageForUpload } from "@/lib/image-optimizer";

type ApiEnvelope<T> = { data: T; error?: never } | { data?: never; error: { message?: string } | string };

type UploadAuthorization = {
  asset: {
    id: string;
    folder: string;
    kind: string;
    uploadStatus: string;
    publicationStatus: string;
    publicUrl: string;
  };
  upload: {
    url: string;
    expiresAt: string;
    requiredHeaders: Record<string, string>;
  };
};

export type ConfirmedMediaAsset = {
  id: string;
  url: string;
  folder: string;
  kind: string;
  title: string | null;
  altText: string;
  mimeType: string;
  sizeBytes: number | null;
  uploadStatus: "CONFIRMED";
  publicationStatus: string;
  uploadedAt: string;
};

async function readApi<T>(response: Response): Promise<T> {
  const payload = await response.json().catch(() => null) as ApiEnvelope<T> | null;
  if (!response.ok || !payload || !("data" in payload)) {
    const error = payload && "error" in payload ? payload.error : null;
    const message = typeof error === "string" ? error : error?.message;
    throw new Error(message || `Request failed with status ${response.status}.`);
  }
  return (payload as { data: T }).data;
}

export async function uploadMediaForReview(
  inputFile: File,
  metadata: { folder: string; altText: string; title?: string },
) {
  const { file, width, height } = await optimizeImageForUpload(inputFile);

  const authorizationResponse = await fetch("/api/admin/media/uploads/authorize", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folder: metadata.folder,
      fileName: file.name,
      mimeType: file.type,
      sizeBytes: file.size,
      altText: metadata.altText,
      title: metadata.title,
      width,
      height,
    }),
  });
  const authorization = await readApi<UploadAuthorization>(authorizationResponse);

  const uploadResponse = await fetch(authorization.upload.url, {
    method: "PUT",
    headers: authorization.upload.requiredHeaders,
    body: file,
  });
  if (!uploadResponse.ok) {
    throw new Error(`Azure Blob upload failed with status ${uploadResponse.status}.`);
  }

  const confirmResponse = await fetch("/api/admin/media/uploads/confirm", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ assetId: authorization.asset.id }),
  });
  return readApi<ConfirmedMediaAsset>(confirmResponse);
}

export async function publishMediaAsset(
  assetId: string,
  slot?:
    | "retreat"
    | "founder"
    | "hero"
    | "bg.upcoming-retreats"
    | "bg.testimonials"
    | "bg.philosophy"
    | "bg.itinerary"
    | "bg.moments"
) {
  const response = await fetch(`/api/admin/media/assets/${encodeURIComponent(assetId)}/publish`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slot }),
  });
  return readApi<{ id: string; url: string; publicationStatus: "PUBLISHED" }>(response);
}
