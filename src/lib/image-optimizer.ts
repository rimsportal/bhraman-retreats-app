"use client";

export type OptimizedImageResult = {
  file: File;
  blurDataUrl?: string;
  width?: number;
  height?: number;
};

/**
 * Optimizes an uploaded image file before uploading to Azure/Server:
 * 1. Resizes overly large dimensions (max 2048px).
 * 2. Compresses to high-quality WebP format (typically reducing 5-15MB to ~150-250KB).
 * 3. Generates a tiny (~300 byte) Base64 blur placeholder for instant 0ms preview.
 */
export async function optimizeImageForUpload(
  file: File,
  maxDimension = 2048,
  quality = 0.85
): Promise<OptimizedImageResult> {
  // Only process standard raster images (skip SVG, GIF animations, videos, etc.)
  if (
    !file.type.startsWith("image/") ||
    file.type === "image/svg+xml" ||
    file.type === "image/gif"
  ) {
    return { file };
  }

  return new Promise((resolve) => {
    const objectUrl = URL.createObjectURL(file);
    const img = new Image();

    img.onload = async () => {
      URL.revokeObjectURL(objectUrl);

      const naturalWidth = img.naturalWidth || img.width;
      const naturalHeight = img.naturalHeight || img.height;

      // 1. Calculate downscaled dimensions (max 2048px)
      let targetWidth = naturalWidth;
      let targetHeight = naturalHeight;

      if (naturalWidth > maxDimension || naturalHeight > maxDimension) {
        if (naturalWidth >= naturalHeight) {
          targetWidth = maxDimension;
          targetHeight = Math.round((naturalHeight * maxDimension) / naturalWidth);
        } else {
          targetHeight = maxDimension;
          targetWidth = Math.round((naturalWidth * maxDimension) / naturalHeight);
        }
      }

      // 2. Render to canvas and encode as WebP
      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        resolve({ file });
        return;
      }

      ctx.drawImage(img, 0, 0, targetWidth, targetHeight);

      // 3. Generate tiny LQIP (16x10) Base64 blur placeholder
      const blurCanvas = document.createElement("canvas");
      blurCanvas.width = 16;
      blurCanvas.height = 10;
      const blurCtx = blurCanvas.getContext("2d");
      let blurDataUrl: string | undefined;

      if (blurCtx) {
        blurCtx.drawImage(img, 0, 0, 16, 10);
        try {
          blurDataUrl = blurCanvas.toDataURL("image/jpeg", 0.4);
        } catch {
          // Ignored in non-supporting contexts
        }
      }

      // 4. Convert primary canvas to WebP Blob
      canvas.toBlob(
        (blob) => {
          if (!blob || blob.size >= file.size) {
            // If WebP wasn't smaller (rare), keep original
            resolve({ file, blurDataUrl, width: targetWidth, height: targetHeight });
            return;
          }

          const baseName = file.name.replace(/\.[^/.]+$/, "");
          const optimizedFile = new File([blob], `${baseName}.webp`, {
            type: "image/webp",
            lastModified: Date.now(),
          });

          resolve({
            file: optimizedFile,
            blurDataUrl,
            width: targetWidth,
            height: targetHeight,
          });
        },
        "image/webp",
        quality
      );
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({ file });
    };

    img.src = objectUrl;
  });
}
