"use client";

import { useEffect, useState } from "react";
import {
  Award,
  BookOpen,
  Check,
  Image as ImageIcon,
  Loader2,
  Plus,
  Quote,
  Sparkles,
  Trash2,
  Upload,
  User,
} from "lucide-react";
import { defaultFounderChapters, type FounderStoryChapter } from "@/lib/content";
import { publishMediaAsset, uploadMediaForReview } from "@/lib/media-upload-client";

type Credential = {
  label: string;
  value: string;
};

type FounderStoryData = {
  name: string;
  title: string;
  subtitle: string;
  bio: string;
  imageUrl: string;
  quote: string;
  quoteAttribution: string;
  chapters: FounderStoryChapter[];
};

const DEFAULT_FOUNDER_STORY: FounderStoryData = {
  name: "Dr. Pratiksha Shekhawat",
  title: "Founder · Bhraman Retreats",
  subtitle: "Rooted in medicine. Guided by nature.",
  bio: "Doctor, yoga and elemental therapist devoted to restorative Himalayan retreats.",
  imageUrl: "/hero-yoga-lamayuru.jpg",
  quote: "Nature holds everything we need to heal. We only have to learn how to listen again.",
  quoteAttribution: "Dr. Pratiksha Shekhawat",
  chapters: defaultFounderChapters,
};

export function FounderStoryManager() {
  const [data, setData] = useState<FounderStoryData>(DEFAULT_FOUNDER_STORY);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (msg: string) => {
    setMessage(msg);
    setError(null);
    setTimeout(() => setMessage(null), 3500);
  };

  const fail = (msg: string) => {
    setError(msg);
    setMessage(null);
  };

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch("/api/admin/content");
        if (res.ok) {
          const json = await res.json();
          if (json.founderStory) {
            setData({
              name: json.founderStory.name || DEFAULT_FOUNDER_STORY.name,
              title: json.founderStory.title || DEFAULT_FOUNDER_STORY.title,
              subtitle: json.founderStory.subtitle || DEFAULT_FOUNDER_STORY.subtitle,
              bio: json.founderStory.bio || DEFAULT_FOUNDER_STORY.bio,
              imageUrl: json.founderStory.imageUrl || DEFAULT_FOUNDER_STORY.imageUrl,
              quote: json.founderStory.quote || DEFAULT_FOUNDER_STORY.quote,
              quoteAttribution: json.founderStory.quoteAttribution || DEFAULT_FOUNDER_STORY.quoteAttribution,
              chapters:
                Array.isArray(json.founderStory.chapters) && json.founderStory.chapters.length > 0
                  ? json.founderStory.chapters
                  : DEFAULT_FOUNDER_STORY.chapters,
            });
          }
        }
      } catch {
        fail("Failed to load founder story content.");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleUploadImage(file: File, target: "profile" | { chapterIndex: number }) {
    setBusy(true);
    setError(null);
    const slotKey = typeof target === "string" ? "profile" : `chapter-${target.chapterIndex}`;
    setUploadingSlot(slotKey);

    try {
      const folder = typeof target === "string" ? "founder/profile" : "founder/journey";
      const label =
        typeof target === "string"
          ? `${data.name} profile portrait`
          : `Founder Story chapter image ${target.chapterIndex + 1}`;

      const asset = await uploadMediaForReview(file, {
        folder,
        altText: label,
        title: label,
      });

      await publishMediaAsset(asset.id);

      if (typeof target === "string") {
        setData((prev) => ({ ...prev, imageUrl: asset.url }));
        flash("Founder portrait uploaded successfully!");
      } else {
        const idx = target.chapterIndex;
        setData((prev) => {
          const updated = [...prev.chapters];
          if (updated[idx]) {
            updated[idx] = { ...updated[idx], imageSlot: asset.url };
          }
          return { ...prev, chapters: updated };
        });
        flash(`Chapter ${idx + 1} image uploaded successfully!`);
      }
    } catch (err) {
      fail(err instanceof Error ? err.message : "Image upload failed.");
    } finally {
      setBusy(false);
      setUploadingSlot(null);
    }
  }

  function updateChapter(index: number, field: keyof FounderStoryChapter, value: unknown) {
    setData((prev) => {
      const updated = [...prev.chapters];
      if (updated[index]) {
        updated[index] = { ...updated[index], [field]: value };
      }
      return { ...prev, chapters: updated };
    });
  }

  function addCredential(chapterIndex: number) {
    setData((prev) => {
      const updated = [...prev.chapters];
      const ch = updated[chapterIndex];
      if (ch) {
        const creds = Array.isArray(ch.credentials) ? [...ch.credentials] : [];
        creds.push({ label: "Credential", value: "Description" });
        updated[chapterIndex] = { ...ch, credentials: creds };
      }
      return { ...prev, chapters: updated };
    });
  }

  function updateCredential(chapterIndex: number, credIndex: number, field: "label" | "value", val: string) {
    setData((prev) => {
      const updated = [...prev.chapters];
      const ch = updated[chapterIndex];
      if (ch && Array.isArray(ch.credentials)) {
        const creds = [...ch.credentials];
        if (creds[credIndex]) {
          creds[credIndex] = { ...creds[credIndex], [field]: val };
          updated[chapterIndex] = { ...ch, credentials: creds };
        }
      }
      return { ...prev, chapters: updated };
    });
  }

  function removeCredential(chapterIndex: number, credIndex: number) {
    setData((prev) => {
      const updated = [...prev.chapters];
      const ch = updated[chapterIndex];
      if (ch && Array.isArray(ch.credentials)) {
        const creds = ch.credentials.filter((_, i) => i !== credIndex);
        updated[chapterIndex] = { ...ch, credentials: creds };
      }
      return { ...prev, chapters: updated };
    });
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);

    try {
      const res = await fetch("/api/admin/content", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ founderStory: data }),
      });

      if (!res.ok) {
        const json = await res.json().catch(() => null);
        fail(json?.error || "Failed to save founder story.");
        return;
      }

      flash("Founder story and profile saved successfully! The live site and story overlay are now updated.");
    } catch {
      fail("Failed to save changes. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  if (loading) {
    return (
      <div className="admin-card">
        <p className="admin-loading">
          <Loader2 className="spin" size={18} /> Loading founder story...
        </p>
      </div>
    );
  }

  return (
    <form className="admin-card" onSubmit={handleSave}>
      <div className="admin-retreats-head" style={{ marginBottom: "24px" }}>
        <div>
          <h2>Founder Profile &amp; Editorial Story</h2>
          <p className="admin-note">
            Manage Dr. Pratiksha&apos;s story on the homepage, quote, credentials, and all 4 chapters of the full-screen editorial story overlay.
          </p>
        </div>
        <button type="submit" className="button button-dark" disabled={busy}>
          {busy ? "Saving…" : "Save Founder Story"}
        </button>
      </div>

      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {/* ── SECTION 1: PROFILE & HOMEPAGE INTRO ── */}
      <div style={{ background: "#fbfcf9", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8de", marginBottom: "32px" }}>
        <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "18px" }}>
          <User size={18} color="#7b3a34" /> 1. Founder Profile &amp; Homepage Teaser
        </h3>

        <div className="admin-grid">
          <label>
            Founder Name
            <input
              value={data.name}
              onChange={(e) => setData({ ...data, name: e.target.value })}
              placeholder="e.g. Dr. Pratiksha Shekhawat"
              required
            />
          </label>

          <label>
            Professional Title / Role
            <input
              value={data.title}
              onChange={(e) => setData({ ...data, title: e.target.value })}
              placeholder="e.g. Founder · Bhraman Retreats"
              required
            />
          </label>
        </div>

        <div className="admin-grid" style={{ marginTop: "16px" }}>
          <label>
            Section Subtitle
            <input
              value={data.subtitle}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
              placeholder="e.g. Rooted in medicine. Guided by nature."
            />
          </label>

          <label>
            Short Bio
            <input
              value={data.bio}
              onChange={(e) => setData({ ...data, bio: e.target.value })}
              placeholder="e.g. Doctor, yoga and elemental therapist devoted to restorative Himalayan retreats."
            />
          </label>
        </div>

        {/* Portrait Upload */}
        <div style={{ marginTop: "20px", display: "flex", gap: "24px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ width: "120px", height: "140px", borderRadius: "6px", overflow: "hidden", background: "#e8ede6", flexShrink: 0, position: "relative" }}>
            {data.imageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={data.imageUrl}
                alt="Founder portrait preview"
                loading="lazy"
                decoding="async"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "/hero-yoga-lamayuru.jpg";
                }}
              />
            ) : (
              <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#888", fontSize: "11px" }}>No photo</div>
            )}
          </div>

          <div style={{ flex: 1, minWidth: "260px" }}>
            <label style={{ fontWeight: 600, fontSize: "13px", display: "block", marginBottom: "6px" }}>
              Main Portrait Photograph
            </label>
            <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
              <input
                value={data.imageUrl}
                onChange={(e) => setData({ ...data, imageUrl: e.target.value })}
                placeholder="https://... or upload below"
                style={{ flex: 1 }}
              />
              <label className="button button-dark" style={{ cursor: "pointer", flexShrink: 0, margin: 0 }}>
                <Upload size={14} /> {uploadingSlot === "profile" ? "Uploading…" : "Upload Photo"}
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/avif"
                  hidden
                  disabled={busy}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleUploadImage(file, "profile");
                    e.target.value = "";
                  }}
                />
              </label>
            </div>
            <p className="admin-note" style={{ margin: "6px 0 0" }}>
              High-resolution portrait of Dr. Pratiksha used on the homepage and opening chapter.
            </p>
          </div>
        </div>

        {/* Quote Block */}
        <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid #e8ede6" }}>
          <h4 style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: "6px", fontSize: "15px", color: "#7b3a34" }}>
            <Quote size={15} /> Prominent Quote
          </h4>
          <div className="admin-grid">
            <label>
              Quote Text
              <textarea
                rows={2}
                value={data.quote}
                onChange={(e) => setData({ ...data, quote: e.target.value })}
                placeholder="e.g. Nature holds everything we need to heal. We only have to learn how to listen again."
              />
            </label>
            <label>
              Attribution
              <input
                value={data.quoteAttribution}
                onChange={(e) => setData({ ...data, quoteAttribution: e.target.value })}
                placeholder="e.g. Dr. Pratiksha Shekhawat"
              />
            </label>
          </div>
        </div>
      </div>

      {/* ── SECTION 2: EDITORIAL CHAPTERS ── */}
      <div style={{ marginBottom: "32px" }}>
        <h3 style={{ margin: "0 0 8px", display: "flex", alignItems: "center", gap: "8px", fontSize: "20px" }}>
          <BookOpen size={20} color="#7b3a34" /> 2. Full-Screen Story Overlay Narrative (4 Chapters)
        </h3>
        <p className="admin-note" style={{ marginBottom: "20px" }}>
          These four chapters unfold sequentially when visitors click &quot;Discover her journey →&quot;. Each chapter features a headline, story narrative, and high-resolution photograph.
        </p>

        {data.chapters.map((chapter, cIdx) => (
          <div
            key={cIdx}
            style={{
              background: "#fff",
              border: "1px solid #dce4d8",
              borderRadius: "8px",
              padding: "24px",
              marginBottom: "24px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", borderBottom: "1px solid #eee", paddingBottom: "12px" }}>
              <span style={{ font: "700 13px var(--font-sans)", letterSpacing: "0.14em", color: "#7b3a34" }}>
                CHAPTER {chapter.number || `0${cIdx + 1}`}
              </span>
              <span style={{ fontSize: "12px", color: "#666" }}>
                Slot: <code>{chapter.imageSlot || "default"}</code>
              </span>
            </div>

            <div className="admin-grid" style={{ marginBottom: "16px" }}>
              <label>
                Chapter Label / Tag
                <input
                  value={chapter.label}
                  onChange={(e) => updateChapter(cIdx, "label", e.target.value)}
                  placeholder="e.g. THE BEGINNING"
                />
              </label>
              <label>
                Headline Title (Roman)
                <input
                  value={chapter.headlineTitle}
                  onChange={(e) => updateChapter(cIdx, "headlineTitle", e.target.value)}
                  placeholder="e.g. Before Bhraman,"
                />
              </label>
              <label>
                Headline Emphasis (Italic)
                <input
                  value={chapter.headlineEmphasis}
                  onChange={(e) => updateChapter(cIdx, "headlineEmphasis", e.target.value)}
                  placeholder="e.g. there was a search for another way."
                />
              </label>
            </div>

            <label style={{ display: "block", marginBottom: "16px" }}>
              Story Narrative Paragraphs (Separate paragraphs with blank lines)
              <textarea
                rows={4}
                value={Array.isArray(chapter.paragraphs) ? chapter.paragraphs.join("\n\n") : ""}
                onChange={(e) =>
                  updateChapter(
                    cIdx,
                    "paragraphs",
                    e.target.value
                      .split("\n\n")
                      .map((p) => p.trim())
                      .filter(Boolean)
                  )
                }
                placeholder="Write the narrative text for this chapter..."
              />
            </label>

            {/* Chapter Image */}
            <div style={{ background: "#f8faf6", padding: "16px", borderRadius: "6px", border: "1px solid #e0e8db", marginBottom: "16px" }}>
              <h4 style={{ margin: "0 0 10px", fontSize: "13px", color: "#2d4a2d", display: "flex", alignItems: "center", gap: "6px" }}>
                <ImageIcon size={14} /> Chapter Photograph
              </h4>

              <div style={{ display: "flex", gap: "16px", alignItems: "center", flexWrap: "wrap" }}>
                <div style={{ width: "100px", height: "70px", borderRadius: "4px", overflow: "hidden", background: "#000", flexShrink: 0 }}>
                  {chapter.imageSlot ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={chapter.imageSlot}
                      alt={chapter.imageAlt || "Chapter preview"}
                      loading="lazy"
                      decoding="async"
                      style={{ width: "100%", height: "100%", objectFit: "cover" }}
                      onError={(e) => {
                        (e.currentTarget as HTMLImageElement).src = "/uploads/images/background/hero-himalayan-dawn.jpg";
                      }}
                    />
                  ) : (
                    <div style={{ height: "100%", display: "grid", placeItems: "center", color: "#fff", fontSize: "10px" }}>No photo</div>
                  )}
                </div>

                <div style={{ flex: 1, minWidth: "220px" }}>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <input
                      value={chapter.imageSlot}
                      onChange={(e) => updateChapter(cIdx, "imageSlot", e.target.value)}
                      placeholder="Image URL or upload"
                      style={{ fontSize: "12px" }}
                    />
                    <label className="button button-secondary" style={{ cursor: "pointer", fontSize: "12px", padding: "6px 12px", margin: 0, flexShrink: 0 }}>
                      <Upload size={12} /> {uploadingSlot === `chapter-${cIdx}` ? "Uploading…" : "Upload"}
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/avif"
                        hidden
                        disabled={busy}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) handleUploadImage(file, { chapterIndex: cIdx });
                          e.target.value = "";
                        }}
                      />
                    </label>
                  </div>
                  <input
                    value={chapter.imageAlt || ""}
                    onChange={(e) => updateChapter(cIdx, "imageAlt", e.target.value)}
                    placeholder="Image Alt text (Accessibility description)"
                    style={{ fontSize: "12px", marginTop: "6px" }}
                  />
                </div>
              </div>
            </div>

            {/* Credentials Matrix (if Chapter 3 or exists) */}
            {(cIdx === 2 || (chapter.credentials && chapter.credentials.length > 0)) && (
              <div style={{ background: "#fdfdfa", padding: "16px", borderRadius: "6px", border: "1px dashed #ced6c8" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                  <h4 style={{ margin: 0, fontSize: "14px", color: "#7b3a34", display: "flex", alignItems: "center", gap: "6px" }}>
                    <Award size={15} /> Credentials &amp; Lineage Matrix
                  </h4>
                  <button
                    type="button"
                    className="button button-secondary"
                    style={{ fontSize: "11px", padding: "4px 8px" }}
                    onClick={() => addCredential(cIdx)}
                  >
                    <Plus size={12} /> Add Credential
                  </button>
                </div>

                <div style={{ display: "grid", gap: "8px" }}>
                  {(chapter.credentials || []).map((cred, credIdx) => (
                    <div key={credIdx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                      <input
                        value={cred.label}
                        onChange={(e) => updateCredential(cIdx, credIdx, "label", e.target.value)}
                        placeholder="Label (e.g. Background)"
                        style={{ width: "160px", fontSize: "12px" }}
                      />
                      <input
                        value={cred.value}
                        onChange={(e) => updateCredential(cIdx, credIdx, "value", e.target.value)}
                        placeholder="Value (e.g. Medical & Therapeutic Practice)"
                        style={{ flex: 1, fontSize: "12px" }}
                      />
                      <button
                        type="button"
                        onClick={() => removeCredential(cIdx, credIdx)}
                        style={{ background: "none", border: "none", color: "#a33", cursor: "pointer" }}
                        title="Remove credential"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px" }}>
        <button type="submit" className="button button-dark" disabled={busy}>
          {busy ? "Saving…" : "Save Founder Story"}
        </button>
      </div>
    </form>
  );
}
