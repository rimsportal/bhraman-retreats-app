"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  Eye,
  EyeOff,
  Film,
  Image as ImageIcon,
  Loader2,
  Pencil,
  Plus,
  Star,
  Trash2,
  Upload,
  X,
} from "lucide-react";
import { publishMediaAsset, uploadMediaForReview } from "@/lib/media-upload-client";

type RetreatMedia = {
  id: string;
  url: string;
  kind: string;
  folder: string;
  title: string | null;
  altText: string;
  caption: string | null;
  credit: string | null;
  category: string | null;
  displayOrder: number;
  isCover: boolean;
  isFeatured: boolean;
  publicationStatus: string;
  posterUrl: string | null;
};

type Retreat = {
  id: string;
  slug: string;
  title: string;
  edition: string | null;
  summary: string;
  description: string;
  location: string;
  venue: string | null;
  startDate: string;
  endDate: string;
  priceInPaise: number;
  capacity: number;
  status: string;
  publicationStatus: string;
  highlight: string | null;
  storyTitle: string | null;
  storyBody: string | null;
  participantCount: number | null;
  displayOrder: number;
  heroImageUrl: string | null;
};

type Draft = {
  id?: string;
  slug: string;
  title: string;
  edition: string;
  location: string;
  venue: string;
  status: string;
  startDate: string;
  endDate: string;
  priceRupees: number;
  capacity: number;
  participantCount: number | "";
  displayOrder: number;
  highlight: string;
  storyTitle: string;
  storyBody: string;
  summary: string;
  description: string;
  heroImageUrl: string;
};

const MAX_UPCOMING = 3;
const STATUS_OPTIONS = [
  { value: "UPCOMING", label: "Upcoming (booking soon)" },
  { value: "BOOKING_OPEN", label: "Booking open" },
  { value: "SOLD_OUT", label: "Sold out" },
  { value: "ENQUIRY", label: "By enquiry" },
  { value: "COMPLETED", label: "Completed (Past retreat memory)" },
  { value: "ARCHIVED", label: "Archived" },
] as const;

const MEDIA_CATEGORIES = [
  "Arrival",
  "Practice",
  "Yoga",
  "Meditation",
  "Nature",
  "Monastery",
  "Food",
  "Community",
  "Ceremony",
  "Closing",
  "Other",
] as const;

const DISPLAY_STATUSES = new Set<string>(["UPCOMING", "BOOKING_OPEN", "SOLD_OUT", "ENQUIRY"]);

const EMPTY: Draft = {
  slug: "",
  title: "",
  edition: "",
  location: "",
  venue: "",
  status: "UPCOMING",
  startDate: "",
  endDate: "",
  priceRupees: 29999,
  capacity: 12,
  participantCount: "",
  displayOrder: 0,
  highlight: "",
  storyTitle: "",
  storyBody: "",
  summary: "",
  description: "",
  heroImageUrl: "",
};

const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

function isUpcoming(retreat: Retreat) {
  return (
    retreat.publicationStatus === "PUBLISHED" &&
    DISPLAY_STATUSES.has(retreat.status) &&
    new Date(retreat.endDate).getTime() >= Date.now()
  );
}

function fmtRange(startIso: string, endIso: string) {
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" };
  return `${new Date(startIso).toLocaleDateString("en-IN", opts)} – ${new Date(endIso).toLocaleDateString("en-IN", opts)}`;
}

export function RetreatsManager() {
  const [items, setItems] = useState<Retreat[] | null>(null);
  const [activeFilter, setActiveFilter] = useState<"ALL" | "UPCOMING" | "COMPLETED">("ALL");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [managingMediaRetreat, setManagingMediaRetreat] = useState<Retreat | null>(null);
  const [retreatMediaList, setRetreatMediaList] = useState<RetreatMedia[]>([]);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const [uploadCategory, setUploadCategory] = useState<string>("Community");
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
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

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/cms/retreats?page=1&pageSize=100&sort=startDate&order=desc");
      if (!res.ok) {
        fail("Could not load retreats.");
        return;
      }
      const json = await res.json();
      setItems(Array.isArray(json.data) ? json.data : []);
    } catch {
      fail("Could not load retreats.");
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const loadRetreatMedia = useCallback(async (retreatId: string) => {
    setLoadingMedia(true);
    try {
      const res = await fetch(`/api/admin/cms/media-assets?parentId=${retreatId}&page=1&pageSize=200&sort=createdAt&order=asc`);
      if (res.ok) {
        const json = await res.json();
        setRetreatMediaList(Array.isArray(json.data) ? json.data : []);
      }
    } catch {
      fail("Failed to load retreat media assets.");
    } finally {
      setLoadingMedia(false);
    }
  }, []);

  useEffect(() => {
    if (managingMediaRetreat) {
      loadRetreatMedia(managingMediaRetreat.id);
    }
  }, [managingMediaRetreat, loadRetreatMedia]);

  const publishedUpcomingCount = useMemo(
    () => (items ?? []).filter(isUpcoming).length,
    [items],
  );

  const filteredItems = useMemo(() => {
    if (!items) return [];
    if (activeFilter === "UPCOMING") {
      return items.filter((r) => r.status !== "COMPLETED" && r.status !== "ARCHIVED");
    }
    if (activeFilter === "COMPLETED") {
      return items.filter((r) => r.status === "COMPLETED");
    }
    return items;
  }, [items, activeFilter]);

  function startCreate() {
    setError(null);
    setDraft({ ...EMPTY });
  }

  function startEdit(retreat: Retreat) {
    setError(null);
    setDraft({
      id: retreat.id,
      slug: retreat.slug,
      title: retreat.title,
      edition: retreat.edition ?? "",
      location: retreat.location,
      venue: retreat.venue ?? "",
      status: retreat.status,
      startDate: retreat.startDate.slice(0, 10),
      endDate: retreat.endDate.slice(0, 10),
      priceRupees: Math.round(retreat.priceInPaise / 100),
      capacity: retreat.capacity,
      participantCount: retreat.participantCount ?? "",
      displayOrder: retreat.displayOrder ?? 0,
      highlight: retreat.highlight ?? "",
      storyTitle: retreat.storyTitle ?? "",
      storyBody: retreat.storyBody ?? "",
      summary: retreat.summary,
      description: retreat.description,
      heroImageUrl: retreat.heroImageUrl ?? "",
    });
  }

  async function uploadCover(file: File) {
    if (!draft) return;
    setBusy(true);
    setError(null);
    try {
      const slug = (draft.slug || slugify(draft.title) || "general").trim();
      const label = `${draft.title || "Bhraman retreat"} cover`;
      const asset = await uploadMediaForReview(file, {
        folder: `retreats/${slug}/cover`,
        altText: label,
        title: label,
      });
      await publishMediaAsset(asset.id);
      setDraft((current) => (current ? { ...current, heroImageUrl: asset.url } : current));
      flash("Cover image uploaded. Save the retreat to apply it.");
    } catch (uploadError) {
      fail(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleBatchMediaUpload(files: FileList | null) {
    if (!files || files.length === 0 || !managingMediaRetreat) return;

    setBusy(true);
    setError(null);

    const total = files.length;
    let completed = 0;
    const slug = (managingMediaRetreat.slug || slugify(managingMediaRetreat.title) || "general").trim();

    for (let i = 0; i < total; i++) {
      const file = files[i];
      const isVideo = file.type.startsWith("video/");
      const kind = isVideo ? "videos" : "gallery";
      const folder = `retreats/${slug}/${kind}`;
      const defaultTitle = `${managingMediaRetreat.title} — ${uploadCategory} ${i + 1}`;

      setUploadProgress(`Uploading ${i + 1} of ${total}: ${file.name}…`);

      try {
        const asset = await uploadMediaForReview(file, {
          folder,
          altText: defaultTitle,
          title: defaultTitle,
        });

        // Publish and associate with retreat
        await publishMediaAsset(asset.id);

        await fetch(`/api/admin/cms/media-assets/${asset.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            retreatId: managingMediaRetreat.id,
            category: uploadCategory,
            caption: `${uploadCategory} moment from ${managingMediaRetreat.edition || managingMediaRetreat.title}`,
            displayOrder: retreatMediaList.length + completed + 1,
          }),
        });

        completed++;
      } catch (err) {
        console.error("Upload error on file", file.name, err);
        fail(err instanceof Error ? err.message : `Failed to upload ${file.name}`);
      }
    }

    setUploadProgress(null);
    setBusy(false);
    if (completed > 0) {
      flash(`Uploaded and linked ${completed} of ${total} media assets!`);
    }
    loadRetreatMedia(managingMediaRetreat.id);
  }

  async function updateMediaField(mediaId: string, updates: Record<string, unknown>) {
    try {
      const res = await fetch(`/api/admin/cms/media-assets/${mediaId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updates),
      });
      if (res.ok) {
        if (managingMediaRetreat) loadRetreatMedia(managingMediaRetreat.id);
      }
    } catch {
      fail("Failed to update media item.");
    }
  }

  async function setMediaAsCover(asset: RetreatMedia) {
    if (!managingMediaRetreat) return;
    try {
      // Set all other media for this retreat to isCover: false
      for (const m of retreatMediaList) {
        if (m.isCover && m.id !== asset.id) {
          await updateMediaField(m.id, { isCover: false });
        }
      }
      await updateMediaField(asset.id, { isCover: true });
      await fetch(`/api/admin/cms/retreats/${managingMediaRetreat.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ heroImageUrl: asset.url }),
      });
      flash("Cover image updated for retreat!");
      load();
      if (managingMediaRetreat) loadRetreatMedia(managingMediaRetreat.id);
    } catch {
      fail("Failed to set cover image.");
    }
  }

  async function deleteMediaItem(mediaId: string) {
    if (!window.confirm("Delete this media asset?")) return;
    try {
      const res = await fetch(`/api/admin/cms/media-assets/${mediaId}`, { method: "DELETE" });
      if (res.ok) {
        flash("Media asset removed.");
        if (managingMediaRetreat) loadRetreatMedia(managingMediaRetreat.id);
      }
    } catch {
      fail("Failed to delete media asset.");
    }
  }

  async function save() {
    if (!draft) return;
    if (!draft.title.trim() || !draft.location.trim() || !draft.startDate || !draft.endDate || !draft.summary.trim()) {
      fail("Title, location, dates and summary are required.");
      return;
    }
    setBusy(true);
    setError(null);
    const payload = {
      slug: (draft.slug || slugify(draft.title)).trim(),
      title: draft.title.trim(),
      edition: draft.edition.trim() || null,
      location: draft.location.trim(),
      venue: draft.venue.trim() || null,
      status: draft.status,
      startDate: draft.startDate,
      endDate: draft.endDate,
      priceInPaise: Math.round(Number(draft.priceRupees) * 100),
      capacity: Math.round(Number(draft.capacity)),
      participantCount: draft.participantCount !== "" ? Number(draft.participantCount) : null,
      displayOrder: Number(draft.displayOrder) || 0,
      highlight: draft.highlight.trim() || null,
      storyTitle: draft.storyTitle.trim() || null,
      storyBody: draft.storyBody.trim() || null,
      summary: draft.summary.trim(),
      description: draft.description.trim() || draft.summary.trim(),
      heroImageUrl: draft.heroImageUrl.trim() || null,
    };
    const url = draft.id ? `/api/admin/cms/retreats/${draft.id}` : "/api/admin/cms/retreats";
    const method = draft.id ? "PATCH" : "POST";
    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      setBusy(false);
      if (!res.ok) {
        const body = await res.json().catch(() => null);
        const detail =
          body?.error?.message ??
          (typeof body?.error === "string" ? body.error : null) ??
          (body?.errors ? Object.values(body.errors).join(" ") : null);
        fail(detail ?? "Save failed. Please check the fields.");
        return;
      }
      setDraft(null);
      flash(draft.id ? "Retreat updated." : "Retreat created as a draft. Publish it to show it on the site.");
      load();
    } catch {
      setBusy(false);
      fail("Save failed. Please try again.");
    }
  }

  async function remove(retreat: Retreat) {
    if (!window.confirm(`Delete "${retreat.title}"? This permanently removes the retreat.`)) return;
    try {
      const res = await fetch(`/api/admin/cms/retreats/${retreat.id}`, { method: "DELETE" });
      if (!res.ok) {
        fail("Delete failed.");
        return;
      }
      flash("Retreat deleted.");
      load();
    } catch {
      fail("Delete failed.");
    }
  }

  async function setPublication(retreat: Retreat, action: "publish" | "draft") {
    if (action === "publish" && isUpcoming(retreat) && publishedUpcomingCount >= MAX_UPCOMING) {
      fail(`You can have at most ${MAX_UPCOMING} upcoming retreats published. Move one to draft first.`);
      return;
    }
    try {
      const res = await fetch(`/api/admin/cms/retreats/${retreat.id}/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) {
        fail("Could not update publication status.");
        return;
      }
      flash(action === "publish" ? "Published — now visible on the site." : "Moved to draft — hidden from the site.");
      load();
    } catch {
      fail("Could not update publication status.");
    }
  }

  if (items === null) {
    return (
      <div className="admin-card">
        <p className="admin-loading">
          <Loader2 className="spin" size={18} /> Loading retreats…
        </p>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-retreats-head">
        <div>
          <h2>Retreats &amp; Past Memories</h2>
          <p className="admin-note">
            Manage upcoming journeys and completed retreat memories dynamically with high-resolution photo journals and video films.
          </p>
        </div>
        {!draft && (
          <button type="button" className="button button-dark" onClick={startCreate}>
            <Plus size={15} /> Add retreat
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="admin-filter-bar" style={{ display: "flex", gap: "10px", margin: "16px 0" }}>
        <button
          type="button"
          className={`button ${activeFilter === "ALL" ? "button-dark" : "button-secondary"}`}
          onClick={() => setActiveFilter("ALL")}
        >
          All ({items.length})
        </button>
        <button
          type="button"
          className={`button ${activeFilter === "UPCOMING" ? "button-dark" : "button-secondary"}`}
          onClick={() => setActiveFilter("UPCOMING")}
        >
          Upcoming &amp; Open ({items.filter((r) => r.status !== "COMPLETED" && r.status !== "ARCHIVED").length})
        </button>
        <button
          type="button"
          className={`button ${activeFilter === "COMPLETED" ? "button-dark" : "button-secondary"}`}
          onClick={() => setActiveFilter("COMPLETED")}
        >
          Past Memories ({items.filter((r) => r.status === "COMPLETED").length})
        </button>
      </div>

      {message && <p className="admin-flash">{message}</p>}
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}

      {/* Edit / Create Form */}
      {draft && (
        <form
          className="admin-retreat-form"
          onSubmit={(event) => {
            event.preventDefault();
            save();
          }}
        >
          <h3>{draft.id ? "Edit retreat" : "New retreat"}</h3>
          <div className="admin-grid">
            <label>
              Title
              <input
                value={draft.title}
                onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                placeholder="e.g. Ladakh Elemental Retreat"
              />
            </label>
            <label>
              Edition
              <input
                value={draft.edition}
                onChange={(e) => setDraft({ ...draft, edition: e.target.value })}
                placeholder="e.g. Ladakh Edition 1.0"
              />
            </label>
            <label>
              Slug (URL)
              <input
                value={draft.slug}
                placeholder={slugify(draft.title) || "auto"}
                onChange={(e) => setDraft({ ...draft, slug: e.target.value })}
              />
            </label>
            <label>
              Location / Region
              <input
                value={draft.location}
                onChange={(e) => setDraft({ ...draft, location: e.target.value })}
                placeholder="e.g. Sham Valley, Ladakh"
              />
            </label>
            <label>
              Venue / Monastery
              <input
                value={draft.venue}
                onChange={(e) => setDraft({ ...draft, venue: e.target.value })}
                placeholder="e.g. Lamayuru Monastery"
              />
            </label>
            <label>
              Status
              <select
                value={draft.status}
                onChange={(e) => setDraft({ ...draft, status: e.target.value })}
              >
                {STATUS_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Capacity / Total spots
              <input
                type="number"
                min={1}
                value={draft.capacity}
                onChange={(e) => setDraft({ ...draft, capacity: Number(e.target.value) })}
              />
            </label>
            <label>
              Participant Count (Past Retreats)
              <input
                type="number"
                min={1}
                value={draft.participantCount}
                onChange={(e) =>
                  setDraft({
                    ...draft,
                    participantCount: e.target.value ? Number(e.target.value) : "",
                  })
                }
                placeholder="e.g. 18"
              />
            </label>
            <label>
              Display Order
              <input
                type="number"
                value={draft.displayOrder}
                onChange={(e) => setDraft({ ...draft, displayOrder: Number(e.target.value) })}
              />
            </label>
            <label>
              Start date
              <input
                type="date"
                value={draft.startDate}
                onChange={(e) => setDraft({ ...draft, startDate: e.target.value })}
              />
            </label>
            <label>
              End date
              <input
                type="date"
                value={draft.endDate}
                onChange={(e) => setDraft({ ...draft, endDate: e.target.value })}
              />
            </label>
            <label>
              Price per person (₹)
              <input
                type="number"
                min={0}
                value={draft.priceRupees}
                onChange={(e) => setDraft({ ...draft, priceRupees: Number(e.target.value) })}
              />
            </label>
          </div>

          <div className="admin-retreat-cover">
            <span className="admin-cover-label">Cover image</span>
            {draft.heroImageUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={draft.heroImageUrl} alt="Retreat cover preview" loading="lazy" decoding="async" />
            ) : (
              <div className="admin-image-empty">No cover image yet</div>
            )}
            <label className="admin-upload">
              <Upload size={15} /> {draft.heroImageUrl ? "Replace cover image" : "Upload cover image"}
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) uploadCover(file);
                  e.target.value = "";
                }}
              />
            </label>
          </div>

          <label>
            Highlight Quote
            <input
              value={draft.highlight}
              onChange={(e) => setDraft({ ...draft, highlight: e.target.value })}
              placeholder="e.g. The mountains became our classroom, silence became our practice."
            />
          </label>

          <label>
            Summary
            <textarea
              rows={2}
              value={draft.summary}
              onChange={(e) => setDraft({ ...draft, summary: e.target.value })}
            />
          </label>

          <label>
            Story Title (Past Retreats)
            <input
              value={draft.storyTitle}
              onChange={(e) => setDraft({ ...draft, storyTitle: e.target.value })}
              placeholder="e.g. Five days in the mountains. A thousand small moments."
            />
          </label>

          <label>
            Story Body (Past Retreats Narrative)
            <textarea
              rows={4}
              value={draft.storyBody}
              onChange={(e) => setDraft({ ...draft, storyBody: e.target.value })}
              placeholder="Write the editorial narrative for this retreat memory..."
            />
          </label>

          <label>
            Full Description
            <textarea
              rows={3}
              value={draft.description}
              onChange={(e) => setDraft({ ...draft, description: e.target.value })}
            />
          </label>

          <div className="admin-retreat-form-actions">
            <button type="submit" className="button button-dark" disabled={busy}>
              {busy ? "Saving…" : draft.id ? "Save changes" : "Create retreat"}
            </button>
            <button type="button" className="admin-cancel" onClick={() => setDraft(null)}>
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Retreats List Table */}
      <div className="admin-retreat-list">
        {filteredItems.length === 0 && (
          <p className="admin-note">No retreats found in this category.</p>
        )}
        {filteredItems.map((retreat) => {
          const published = retreat.publicationStatus === "PUBLISHED";
          const isCompleted = retreat.status === "COMPLETED";

          return (
            <div className="admin-retreat-row" key={retreat.id}>
              <div className="admin-retreat-info">
                <div className="admin-retreat-title">
                  <strong>{retreat.title}</strong>
                  {retreat.edition && <small style={{ color: "#7b3a34", fontWeight: 600 }}>({retreat.edition})</small>}
                  <span className={`pill ${published ? "pill-paid" : "pill-unpaid"}`}>
                    {published ? "Published" : "Draft"}
                  </span>
                  <span className={`pill ${isCompleted ? "pill-confirmed" : "pill-neutral"}`}>
                    {retreat.status}
                  </span>
                </div>
                <p className="admin-note">
                  {fmtRange(retreat.startDate, retreat.endDate)} · {retreat.location}
                  {retreat.venue ? ` (${retreat.venue})` : ""} · {inr(retreat.priceInPaise)}
                  {retreat.participantCount ? ` · ${retreat.participantCount} guests` : ""}
                </p>
              </div>
              <div className="admin-retreat-actions">
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => setManagingMediaRetreat(retreat)}
                  title="Manage Photos & Videos"
                >
                  <ImageIcon size={14} /> Gallery Media
                </button>
                <button type="button" onClick={() => startEdit(retreat)}>
                  <Pencil size={14} /> Edit
                </button>
                {published ? (
                  <button type="button" onClick={() => setPublication(retreat, "draft")}>
                    <EyeOff size={14} /> Unpublish
                  </button>
                ) : (
                  <button type="button" onClick={() => setPublication(retreat, "publish")}>
                    <Eye size={14} /> Publish
                  </button>
                )}
                <button type="button" className="danger" onClick={() => remove(retreat)}>
                  <Trash2 size={14} /> Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Retreat Media Gallery Manager */}
      {managingMediaRetreat && (
        <div
          className="admin-modal-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(20, 28, 22, 0.75)",
            zIndex: 10000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "24px",
          }}
        >
          <div
            className="admin-modal-content"
            style={{
              background: "#fff",
              borderRadius: "8px",
              width: "100%",
              maxWidth: "1100px",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "32px",
              color: "#1c2e1c",
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "24px",
                borderBottom: "1px solid #eee",
                paddingBottom: "16px",
              }}
            >
              <div>
                <h3 style={{ margin: "0 0 6px", fontSize: "22px" }}>
                  Media Journal — {managingMediaRetreat.title}
                </h3>
                <p className="admin-note" style={{ margin: 0 }}>
                  Upload photographs and films for this retreat. Set cover photos, categories, captions, and display order.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManagingMediaRetreat(null)}
                style={{ background: "none", border: "none", cursor: "pointer" }}
              >
                <X size={24} />
              </button>
            </div>

            {/* Upload Section */}
            <div
              style={{
                background: "#f7f9f5",
                padding: "20px",
                borderRadius: "6px",
                marginBottom: "28px",
                border: "1px dashed #ced6c8",
              }}
            >
              <h4 style={{ margin: "0 0 12px" }}>Upload Media Assets</h4>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center" }}>
                <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: 500 }}>
                  Assign Category:
                  <select
                    value={uploadCategory}
                    onChange={(e) => setUploadCategory(e.target.value)}
                    style={{ padding: "6px 12px", borderRadius: "4px", border: "1px solid #ccc" }}
                  >
                    {MEDIA_CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="button button-dark" style={{ cursor: "pointer" }}>
                  <Upload size={15} /> Select Photos / Videos (Multiple)
                  <input
                    type="file"
                    multiple
                    accept="image/jpeg,image/png,image/webp,image/avif,video/mp4,video/webm,video/quicktime"
                    hidden
                    disabled={busy}
                    onChange={(e) => {
                      handleBatchMediaUpload(e.target.files);
                      e.target.value = "";
                    }}
                  />
                </label>

                {uploadProgress && (
                  <span style={{ color: "#7b3a34", fontWeight: 600, fontSize: "13px" }}>
                    <Loader2 size={14} className="spin" style={{ display: "inline", marginRight: "6px" }} />
                    {uploadProgress}
                  </span>
                )}
              </div>
            </div>

            {/* Media Items Grid */}
            {loadingMedia ? (
              <p className="admin-loading">
                <Loader2 size={18} className="spin" /> Loading retreat media…
              </p>
            ) : retreatMediaList.length === 0 ? (
              <p className="admin-note" style={{ textAlign: "center", padding: "40px" }}>
                No media assets uploaded for this retreat yet. Select files above to upload.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
                  gap: "20px",
                }}
              >
                {retreatMediaList.map((asset, idx) => {
                  const isVideo = asset.kind === "VIDEO";

                  return (
                    <div
                      key={asset.id}
                      style={{
                        border: asset.isCover ? "2px solid #7b3a34" : "1px solid #e2e8de",
                        borderRadius: "6px",
                        overflow: "hidden",
                        background: "#fff",
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div
                        style={{
                          position: "relative",
                          aspectRatio: "16/10",
                          background: "#000",
                        }}
                      >
                        {isVideo ? (
                          <div style={{ width: "100%", height: "100%", position: "relative" }}>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={asset.posterUrl || asset.url}
                              alt={asset.altText || "Video thumbnail"}
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                (e.currentTarget as HTMLImageElement).src = "/uploads/images/background/hero-himalayan-dawn.jpg";
                              }}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            />
                            <Film
                              size={24}
                              style={{
                                position: "absolute",
                                top: "50%",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                color: "#fff",
                              }}
                            />
                          </div>
                        ) : (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={asset.url}
                            alt={asset.altText || "Retreat moment"}
                            loading="lazy"
                            decoding="async"
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = "/uploads/images/background/hero-himalayan-dawn.jpg";
                            }}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                          />
                        )}

                        {asset.isCover && (
                          <span
                            style={{
                              position: "absolute",
                              top: "8px",
                              left: "8px",
                              background: "#7b3a34",
                              color: "#fff",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "10px",
                              fontWeight: 700,
                              textTransform: "uppercase",
                            }}
                          >
                            Cover Photo
                          </span>
                        )}

                        <span
                          style={{
                            position: "absolute",
                            bottom: "8px",
                            left: "8px",
                            background: "rgba(0,0,0,0.6)",
                            color: "#fff",
                            padding: "2px 6px",
                            borderRadius: "4px",
                            fontSize: "10px",
                          }}
                        >
                          {asset.category || "General"}
                        </span>
                      </div>

                      {/* Metadata Edit Form */}
                      <div style={{ padding: "14px", flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                        <label style={{ fontSize: "11px", fontWeight: 600 }}>
                          Category
                          <select
                            value={asset.category || "Community"}
                            onChange={(e) => updateMediaField(asset.id, { category: e.target.value })}
                            style={{ width: "100%", padding: "4px 8px", fontSize: "12px", marginTop: "2px" }}
                          >
                            {MEDIA_CATEGORIES.map((c) => (
                              <option key={c} value={c}>
                                {c}
                              </option>
                            ))}
                          </select>
                        </label>

                        <label style={{ fontSize: "11px", fontWeight: 600 }}>
                          Caption
                          <input
                            defaultValue={asset.caption || ""}
                            onBlur={(e) => updateMediaField(asset.id, { caption: e.target.value })}
                            style={{ width: "100%", padding: "4px 8px", fontSize: "12px", marginTop: "2px" }}
                            placeholder="Optional caption"
                          />
                        </label>

                        <label style={{ fontSize: "11px", fontWeight: 600 }}>
                          Alt Text (Accessibility)
                          <input
                            defaultValue={asset.altText || ""}
                            onBlur={(e) => updateMediaField(asset.id, { altText: e.target.value })}
                            style={{ width: "100%", padding: "4px 8px", fontSize: "12px", marginTop: "2px" }}
                            placeholder="Image description"
                          />
                        </label>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: "10px" }}>
                          {!asset.isCover && (
                            <button
                              type="button"
                              onClick={() => setMediaAsCover(asset)}
                              style={{
                                background: "#f0f4ee",
                                border: "1px solid #ced6c8",
                                borderRadius: "4px",
                                padding: "4px 8px",
                                fontSize: "11px",
                                cursor: "pointer",
                              }}
                            >
                              <Star size={12} style={{ verticalAlign: "middle", marginRight: "4px" }} /> Set Cover
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => deleteMediaItem(asset.id)}
                            style={{
                              background: "none",
                              border: "none",
                              color: "#a33",
                              fontSize: "12px",
                              cursor: "pointer",
                              marginLeft: "auto",
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div style={{ marginTop: "32px", textAlign: "right" }}>
              <button
                type="button"
                className="button button-dark"
                onClick={() => setManagingMediaRetreat(null)}
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
