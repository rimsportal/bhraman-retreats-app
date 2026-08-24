export const CONTENT_STATUSES = ["DRAFT", "PUBLISHED", "ARCHIVED"];
export const RETREAT_STATUSES = ["UPCOMING", "BOOKING_OPEN", "SOLD_OUT", "COMPLETED", "CANCELLED"];
export const ENQUIRY_STATUSES = ["NEW", "IN_PROGRESS", "RESOLVED", "ARCHIVED"];
export const ADMIN_ROLES = ["CONTENT_EDITOR", "BOOKING_MANAGER", "SUPER_ADMIN"];

const slugPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dangerousKeyPattern = /(secret|password|token|private.?key|connection.?string|api.?key)/i;
const richFields = new Set(["description", "content", "bio", "quote", "text", "message", "caption", "summary"]);

const schemas = {
  retreats: {
    required: ["slug", "title", "summary", "description", "location", "startDate", "endDate", "priceInPaise", "capacity"],
    strings: ["slug", "title", "edition", "summary", "description", "location", "venue", "status", "publicationStatus", "heroImageUrl", "highlight", "storyTitle", "storyBody", "coverMediaId"],
    integers: ["priceInPaise", "capacity", "participantCount", "displayOrder"],
    dates: ["startDate", "endDate", "publishedAt"],
  },
  "retreat-days": {
    required: ["retreatId", "dayNumber", "element", "title"],
    strings: ["retreatId", "element", "title", "description", "publicationStatus"],
    integers: ["dayNumber"],
  },
  "itinerary-sections": {
    required: ["retreatDayId", "title"],
    strings: ["retreatDayId", "title", "description", "publicationStatus"],
    integers: ["sortOrder"],
  },
  "itinerary-activities": {
    required: ["itinerarySectionId", "title"],
    strings: ["itinerarySectionId", "title", "description", "startTime", "publicationStatus"],
    integers: ["sortOrder"],
  },
  testimonials: {
    required: ["slug", "name", "quote"],
    strings: ["slug", "name", "location", "quote", "publicationStatus", "imageUrl"],
    integers: ["sortOrder"],
    dates: ["publishedAt"],
  },
  blogs: {
    required: ["slug", "title", "excerpt", "content"],
    strings: ["slug", "title", "excerpt", "content", "coverImageUrl", "authorName", "publicationStatus"],
    dates: ["publishedAt"],
  },
  founders: {
    required: ["slug", "name", "title", "bio"],
    strings: ["slug", "name", "title", "bio", "imageUrl", "credentials", "publicationStatus"],
    dates: ["publishedAt"],
  },
  quotes: {
    required: ["slug", "text"],
    strings: ["slug", "text", "attribution", "context", "publicationStatus"],
    integers: ["sortOrder"],
    dates: ["publishedAt"],
  },
  "media-assets": {
    required: [],
    strings: ["title", "altText", "caption", "credit", "retreatId", "category", "thumbnailUrl", "posterUrl"],
    integers: ["width", "height", "durationSeconds", "displayOrder"],
    booleans: ["isCover", "isFeatured"],
  },
  "site-settings": {
    required: ["key", "value"],
    strings: ["key", "description", "publicationStatus"],
    dates: ["publishedAt"],
    json: ["value"],
  },
  enquiries: {
    required: ["name", "email", "message"],
    strings: ["retreatId", "retreatSlug", "name", "email", "phone", "country", "message", "status", "source"],
  },
};

export function sanitizeRichContent(value) {
  if (typeof value !== "string") return value;
  return value
    .replace(/<\s*(script|style|iframe|object|embed|form)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, "")
    .replace(/\son[a-z]+\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/\s(href|src)\s*=\s*(["'])\s*javascript:[\s\S]*?\2/gi, "")
    .replace(/javascript\s*:/gi, "")
    .trim();
}

export function isSensitiveSettingKey(key) {
  return typeof key === "string" && dangerousKeyPattern.test(key);
}

export function isRoleAllowed(role, allowedRoles) {
  return ADMIN_ROLES.includes(role) && allowedRoles.includes(role);
}

export function validateCmsEntity(entity, payload, options = {}) {
  const schema = schemas[entity];
  if (!schema) return { valid: false, data: {}, errors: { entity: "Unsupported CMS entity." } };
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    return { valid: false, data: {}, errors: { body: "A JSON object is required." } };
  }

  const partial = options.partial === true;
  const errors = {};
  const data = {};
  const allowed = new Set([
    ...(schema.strings ?? []),
    ...(schema.integers ?? []),
    ...(schema.dates ?? []),
    ...(schema.json ?? []),
    ...(schema.booleans ?? []),
  ]);

  if (!partial) {
    for (const field of schema.required) {
      if (payload[field] === undefined || payload[field] === null || payload[field] === "") {
        errors[field] = "This field is required.";
      }
    }
  }

  for (const [field, rawValue] of Object.entries(payload)) {
    if (!allowed.has(field)) continue;
    if (rawValue === null) {
      data[field] = null;
      continue;
    }

    if (schema.strings?.includes(field)) {
      if (typeof rawValue !== "string") {
        errors[field] = "Must be a string.";
        continue;
      }
      const value = richFields.has(field) ? sanitizeRichContent(rawValue) : rawValue.trim();
      if ((schema.required.includes(field) || rawValue.length > 0) && value.length === 0) {
        errors[field] = "Must not be empty.";
        continue;
      }
      const maximum = richFields.has(field) ? 20000 : field === "email" ? 254 : 500;
      if (value.length > maximum) {
        errors[field] = `Must be ${maximum} characters or fewer.`;
        continue;
      }
      data[field] = value;
    } else if (schema.integers?.includes(field)) {
      if (!Number.isInteger(rawValue) || rawValue < 0) {
        errors[field] = "Must be a non-negative integer.";
        continue;
      }
      data[field] = rawValue;
    } else if (schema.booleans?.includes(field)) {
      data[field] = Boolean(rawValue);
    } else if (schema.dates?.includes(field)) {
      const date = new Date(rawValue);
      if (Number.isNaN(date.getTime())) {
        errors[field] = "Must be a valid date.";
        continue;
      }
      data[field] = date;
    } else if (schema.json?.includes(field)) {
      if (rawValue === undefined) {
        errors[field] = "Must be valid JSON.";
        continue;
      }
      data[field] = rawValue;
    }
  }

  if (typeof data.slug === "string" && !slugPattern.test(data.slug)) {
    errors.slug = "Use lowercase letters, numbers and single hyphens only.";
  }
  if (typeof data.email === "string" && !emailPattern.test(data.email)) {
    errors.email = "Must be a valid email address.";
  }
  if (typeof data.publicationStatus === "string" && !CONTENT_STATUSES.includes(data.publicationStatus)) {
    errors.publicationStatus = `Must be one of: ${CONTENT_STATUSES.join(", ")}.`;
  }
  if (entity === "retreats" && typeof data.status === "string" && !RETREAT_STATUSES.includes(data.status)) {
    errors.status = `Must be one of: ${RETREAT_STATUSES.join(", ")}.`;
  }
  if (entity === "enquiries" && typeof data.status === "string" && !ENQUIRY_STATUSES.includes(data.status)) {
    errors.status = `Must be one of: ${ENQUIRY_STATUSES.join(", ")}.`;
  }
  if (entity === "site-settings" && typeof data.key === "string" && isSensitiveSettingKey(data.key)) {
    errors.key = "Secret or credential values cannot be stored as public site settings.";
  }
  if (entity === "retreats" && data.startDate && data.endDate && data.endDate < data.startDate) {
    errors.endDate = "End date must be on or after the start date.";
  }

  return { valid: Object.keys(errors).length === 0, data, errors };
}

export function normalizePublication(data) {
  if (data.publicationStatus === "PUBLISHED" && !data.publishedAt) {
    return { ...data, publishedAt: new Date() };
  }
  if (data.publicationStatus === "DRAFT") {
    return { ...data, publishedAt: null };
  }
  return data;
}
