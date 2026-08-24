export const MEDIA_FOLDERS = Object.freeze([
  "testimonials",
  "images/background/upcoming-retreats",
  "images/background/testimonials",
  "images/background/philosophy",
  "images/background/itinerary",
  "images/background/moments",
  "retreats/ladakh-edition-1/cover",
  "retreats/ladakh-edition-1/gallery",
  "retreats/ladakh-edition-1/videos",
  "retreats/ladakh-edition-1/participants",
  "retreats/ladakh-edition-1/monastery",
  "retreats/ladakh-edition-1/thumbnails",
  "retreats/ladakh-edition-2/cover",
  "retreats/ladakh-edition-2/gallery",
  "retreats/ladakh-edition-2/videos",
  "retreats/ladakh-edition-2/thumbnails",
  "retreats/uttarakhand-december/cover",
  "retreats/uttarakhand-december/gallery",
  "retreats/uttarakhand-december/videos",
  "retreats/uttarakhand-december/thumbnails",
  "retreats/covers",
  "testimonials/written",
  "testimonials/videos",
  "testimonials/portraits",
  "testimonials/posters",
  "founder/profile",
  "founder/journey",
  "founder/videos",
  "site/hero",
  "blog/why-choose-bhraman/cover",
  "blog/why-choose-bhraman/inline",
  "audio/ambient",
  "audio/breathing",
  "audio/bells",
  "audio/chants",
]);

export const MEDIA_LIMITS = Object.freeze({
  IMAGE: 20 * 1024 * 1024,
  VIDEO: 1024 * 1024 * 1024,
  AUDIO: 250 * 1024 * 1024,
});

const MIME_TYPES = Object.freeze({
  IMAGE: new Set(["image/jpeg", "image/png", "image/webp", "image/avif"]),
  VIDEO: new Set(["video/mp4", "video/webm", "video/quicktime"]),
  AUDIO: new Set(["audio/mpeg", "audio/wav", "audio/ogg", "audio/mp4"]),
});

const EXTENSIONS = Object.freeze({
  "image/jpeg": new Set(["jpg", "jpeg"]),
  "image/png": new Set(["png"]),
  "image/webp": new Set(["webp"]),
  "image/avif": new Set(["avif"]),
  "video/mp4": new Set(["mp4", "m4v"]),
  "video/webm": new Set(["webm"]),
  "video/quicktime": new Set(["mov"]),
  "audio/mpeg": new Set(["mp3"]),
  "audio/wav": new Set(["wav"]),
  "audio/ogg": new Set(["ogg", "oga"]),
  "audio/mp4": new Set(["m4a", "mp4"]),
});

const FOLDER_SET = new Set(MEDIA_FOLDERS);

export function mediaKindForMime(mimeType) {
  const normalized = typeof mimeType === "string" ? mimeType.trim().toLowerCase() : "";
  for (const [kind, mimeTypes] of Object.entries(MIME_TYPES)) {
    if (mimeTypes.has(normalized)) return kind;
  }
  return null;
}

export function expectedKindForFolder(folder) {
  if (folder === "testimonials/videos" || folder === "founder/videos" || folder.endsWith("/videos")) {
    return "VIDEO";
  }
  if (folder.startsWith("audio/")) return "AUDIO";
  return "IMAGE";
}

export function isAllowedMediaFolder(folder) {
  if (typeof folder !== "string") return false;
  if (folder.includes("..") || folder.includes("\\") || folder.includes("\0")) return false;
  if (FOLDER_SET.has(folder)) return true;
  if (/^retreats\/[a-z0-9_-]+(?:\/(cover|gallery|videos|participants|monastery|thumbnails))?$/.test(folder.trim())) {
    return true;
  }
  return false;
}

export function sanitizeMediaFileName(fileName) {
  const normalized = String(fileName ?? "")
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9._-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/-+\./g, ".")
    .replace(/^[-.]+|[-.]+$/g, "")
    .toLowerCase();
  return normalized.slice(0, 120) || "media-file";
}

function optionalText(value, maxLength) {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return undefined;
  const clean = value.trim();
  if (!clean || clean.length > maxLength) return undefined;
  return clean;
}

function optionalPositiveInteger(value, maximum) {
  if (value === undefined || value === null || value === "") return null;
  const number = Number(value);
  if (!Number.isInteger(number) || number < 1 || number > maximum) return undefined;
  return number;
}

export function validateMediaUploadRequest(input) {
  const errors = {};
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { valid: false, errors: { body: "A JSON metadata object is required." } };
  }

  const folder = typeof input.folder === "string" ? input.folder.trim() : "";
  if (!isAllowedMediaFolder(folder)) errors.folder = "Select an approved Bhraman media folder.";

  const fileName = typeof input.fileName === "string" ? input.fileName.trim() : "";
  if (!fileName || fileName.length > 180 || /[\\/]/.test(fileName)) {
    errors.fileName = "File name must be 1-180 characters without path separators.";
  }

  const mimeType = typeof input.mimeType === "string" ? input.mimeType.trim().toLowerCase() : "";
  const kind = mediaKindForMime(mimeType);
  if (!kind) errors.mimeType = "Unsupported image, video or audio type.";
  if (kind && folder && isAllowedMediaFolder(folder) && expectedKindForFolder(folder) !== kind) {
    errors.mimeType = `The selected folder accepts ${expectedKindForFolder(folder).toLowerCase()} files.`;
  }

  const extension = fileName.includes(".") ? fileName.split(".").pop().toLowerCase() : "";
  if (kind && (!EXTENSIONS[mimeType] || !EXTENSIONS[mimeType].has(extension))) {
    errors.fileName = "The file extension does not match its media type.";
  }

  const sizeBytes = Number(input.sizeBytes);
  if (!Number.isInteger(sizeBytes) || sizeBytes < 1) {
    errors.sizeBytes = "File size must be a positive integer.";
  } else if (kind && sizeBytes > MEDIA_LIMITS[kind]) {
    errors.sizeBytes = `${kind.toLowerCase()} exceeds the allowed size limit.`;
  }

  const altText = optionalText(input.altText, 300);
  if (kind === "IMAGE" && !altText) errors.altText = "Alt text is required for images.";
  if (altText === undefined) errors.altText = "Alt text must be at most 300 characters.";

  const title = optionalText(input.title, 160);
  const caption = optionalText(input.caption, 1000);
  const credit = optionalText(input.credit, 240);
  if (title === undefined) errors.title = "Title must be at most 160 characters.";
  if (caption === undefined) errors.caption = "Caption must be at most 1000 characters.";
  if (credit === undefined) errors.credit = "Credit must be at most 240 characters.";

  const width = optionalPositiveInteger(input.width, 50000);
  const height = optionalPositiveInteger(input.height, 50000);
  const durationSeconds = optionalPositiveInteger(input.durationSeconds, 24 * 60 * 60);
  if (width === undefined) errors.width = "Width must be a positive integer.";
  if (height === undefined) errors.height = "Height must be a positive integer.";
  if (durationSeconds === undefined) errors.durationSeconds = "Duration must be a positive integer.";

  if (Object.keys(errors).length) return { valid: false, errors };

  return {
    valid: true,
    value: {
      folder,
      fileName,
      safeFileName: sanitizeMediaFileName(fileName),
      mimeType,
      kind,
      sizeBytes,
      altText: altText ?? "",
      title,
      caption,
      credit,
      width,
      height,
      durationSeconds,
    },
  };
}
