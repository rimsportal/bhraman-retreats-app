"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Loader2, LogOut, Plus, Trash2, Upload, Youtube } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";
import dynamic from "next/dynamic";
import { publishMediaAsset, uploadMediaForReview } from "@/lib/media-upload-client";

const RetreatsManager = dynamic(
  () => import("@/components/admin/retreats-manager").then((mod) => mod.RetreatsManager),
  { ssr: false }
);
const FounderStoryManager = dynamic(
  () => import("@/components/admin/founder-story-manager").then((mod) => mod.FounderStoryManager),
  { ssr: false }
);
const ItineraryManager = dynamic(
  () => import("@/components/admin/itinerary-manager").then((mod) => mod.ItineraryManager),
  { ssr: false }
);
const EnquiriesManager = dynamic(
  () => import("@/components/admin/enquiries-manager").then((mod) => mod.EnquiriesManager),
  { ssr: false }
);
const FaqManager = dynamic(
  () => import("@/components/admin/faq-manager").then((mod) => mod.FaqManager),
  { ssr: false }
);

type Testimonial = { name: string; location: string; imageUrl: string; quote: string };
type Video = { title: string; url: string };
type RetreatContent = {
  slug: string; title: string; edition: string | null; summary: string; location: string;
  startDate: string; endDate: string; priceInPaise: number; capacity: number;
};
type Media = { retreat?: string; founder?: string; hero?: string; "bg.upcoming-retreats"?: string; "bg.testimonials"?: string; "bg.philosophy"?: string };
type PendingMedia = { id: string; url: string };
type Booking = {
  id: string; reference: string; guests: number; totalInPaise: number;
  status: string; paymentStatus: string; dietaryNotes: string | null; healthNotes: string | null;
  createdAt: string; user: { name: string | null; email: string; phone: string | null };
};

const TABS = ["Content", "Enquiries", "Retreats", "Itinerary", "Founder Story", "FAQs", "Testimonials", "Videos", "Images", "Bookings"] as const;
const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

function youtubeEmbedUrl(url: string): string {
  try {
    if (url.includes("youtu.be/")) return url.replace("youtu.be/", "youtube.com/embed/");
    if (url.includes("watch?v=")) return url.replace("watch?v=", "embed/");
    if (url.includes("shorts/")) return url.replace("shorts/", "embed/");
    return url;
  } catch { return url; }
}

interface CropModalProps {
  imageUrl: string;
  onCancel: () => void;
  onApply: (croppedBlob: Blob) => void;
}

function CropModal({ imageUrl, onCancel, onApply }: CropModalProps) {
  const [zoom, setZoom] = useState(1.0);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    setZoom(1.0);
    setOffset({ x: 0, y: 0 });
  }, [imageUrl]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    setOffset({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - offset.x, y: touch.clientY - offset.y });
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || e.touches.length !== 1) return;
    const touch = e.touches[0];
    setOffset({
      x: touch.clientX - dragStart.x,
      y: touch.clientY - dragStart.y,
    });
  };

  const handleApply = () => {
    const img = imageRef.current;
    const container = containerRef.current;
    if (!img || !container) return;

    const outputSize = 300; 
    const canvas = document.createElement("canvas");
    canvas.width = outputSize;
    canvas.height = outputSize;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, outputSize, outputSize);
    ctx.beginPath();
    ctx.arc(outputSize / 2, outputSize / 2, outputSize / 2, 0, Math.PI * 2);
    ctx.clip();

    const cropWindowSize = 200; 
    const nw = img.naturalWidth;
    const nh = img.naturalHeight;
    const aspect = nw / nh;
    let dw = 200;
    let dh = 200;
    if (aspect > 1) {
      dh = cropWindowSize;
      dw = cropWindowSize * aspect;
    } else {
      dw = cropWindowSize;
      dh = cropWindowSize / aspect;
    }

    const zw = dw * zoom;
    const zh = dh * zoom;

    const imgLeft = (cropWindowSize - zw) / 2 + offset.x;
    const imgTop = (cropWindowSize - zh) / 2 + offset.y;

    const scaleX = nw / zw;
    const scaleY = nh / zh;

    const sx = -imgLeft * scaleX;
    const sy = -imgTop * scaleY;
    const sWidth = cropWindowSize * scaleX;
    const sHeight = cropWindowSize * scaleY;

    ctx.drawImage(img, sx, sy, sWidth, sHeight, 0, 0, outputSize, outputSize);

    canvas.toBlob((blob) => {
      if (blob) onApply(blob);
    }, "image/png");
  };

  return (
    <div className="crop-modal-overlay">
      <div className="crop-modal-content">
        <h3>Crop Profile Picture</h3>
        <p className="admin-note" style={{ marginBottom: "16px" }}>Drag the image to position, and use the slider to zoom.</p>
        
        <div 
          className="crop-container" 
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleMouseUp}
        >
          <div className="crop-circle-overlay" />
          
          <img
            src={imageUrl}
            alt="To crop"
            ref={imageRef}
            style={{
              transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`,
              cursor: isDragging ? "grabbing" : "grab",
              touchAction: "none",
            }}
            onMouseDown={handleMouseDown}
            onTouchStart={handleTouchStart}
            draggable={false}
          />
        </div>

        <div className="crop-slider-container">
          <span>Zoom:</span>
          <input
            type="range"
            min="1"
            max="3"
            step="0.05"
            value={zoom}
            onChange={(e) => setZoom(parseFloat(e.target.value))}
          />
        </div>

        <div className="crop-actions">
          <button type="button" className="button-cancel" onClick={onCancel}>Cancel</button>
          <button type="button" className="button-crop" onClick={handleApply}>Crop &amp; Upload</button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [authed, setAuthed] = useState<boolean | null>(null);
  const [password, setPassword] = useState("");
  const [tab, setTab] = useState<(typeof TABS)[number]>("Content");
  const [retreat, setRetreat] = useState<RetreatContent | null>(null);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [media, setMedia] = useState<Media>({});
  const [philosophyParagraphs, setPhilosophyParagraphs] = useState<[string, string]>(["", ""]);
  const [pendingMedia, setPendingMedia] = useState<Partial<Record<"retreat" | "founder" | "hero" | "bg.upcoming-retreats" | "bg.testimonials" | "bg.philosophy", PendingMedia>>>({});
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [cropTarget, setCropTarget] = useState<{ file: File; testimonialIndex: number; imageUrl: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (msg: string) => { setMessage(msg); setError(null); setTimeout(() => setMessage(null), 3000); };
  const fail = (msg: string) => { setError(msg); setMessage(null); };

  const loadContent = useCallback(async () => {
    const res = await fetch("/api/admin/content");
    if (res.status === 401) { setAuthed(false); return; }
    const data = await res.json();
    setRetreat({
      ...data.retreat,
      startDate: String(data.retreat.startDate).slice(0, 10),
      endDate: String(data.retreat.endDate).slice(0, 10),
    });
    setTestimonials(data.testimonials.map((t: Testimonial) => ({ ...t, imageUrl: t.imageUrl ?? "" })));
    setVideos(Array.isArray(data.videos) ? data.videos : []);
    setMedia(data.media);
    if (Array.isArray(data.philosophyParagraphs) && data.philosophyParagraphs.length >= 2) {
      setPhilosophyParagraphs([data.philosophyParagraphs[0] ?? "", data.philosophyParagraphs[1] ?? ""]);
    }
    setAuthed(true);
  }, []);

  const loadBookings = useCallback(async () => {
    const res = await fetch("/api/admin/bookings");
    if (res.ok) setBookings((await res.json()).bookings);
  }, []);

  useEffect(() => { loadContent(); }, [loadContent]);
  useEffect(() => { if (authed && tab === "Bookings") loadBookings(); }, [authed, tab, loadBookings]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    setBusy(false);
    if (!res.ok) { fail((await res.json()).error ?? "Login failed"); return; }
    setPassword("");
    loadContent();
  }

  async function handleLogout() {
    await fetch("/api/admin/login", { method: "DELETE" });
    setAuthed(false);
  }

  async function save(payload: object, okMsg: string) {
    setBusy(true); setError(null);
    const res = await fetch("/api/admin/content", {
      method: "PUT", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    setBusy(false);
    if (!res.ok) { fail((await res.json()).error ?? "Save failed"); return; }
    flash(okMsg);
  }

  type SlotType = "retreat" | "founder" | "hero" | "bg.upcoming-retreats" | "bg.testimonials" | "bg.philosophy";

  function mediaFolderFor(slot: SlotType) {
    if (slot === "bg.upcoming-retreats") return "images/background/upcoming-retreats";
    if (slot === "bg.testimonials") return "images/background/testimonials";
    if (slot === "bg.philosophy") return "images/background/philosophy";
    if (slot === "founder") return "founder/profile";
    if (slot === "hero") return "site/hero";
    if (retreat?.slug.includes("uttarakhand")) return "retreats/uttarakhand-december/cover";
    if (retreat?.slug.includes("edition-1")) return "retreats/ladakh-edition-1/cover";
    return "retreats/ladakh-edition-2/cover";
  }

  async function uploadImage(slot: SlotType, file: File) {
    setBusy(true); setError(null);
    try {
      const label = slot === "founder"
        ? "Bhraman founder portrait"
        : slot === "hero"
          ? "Bhraman homepage hero"
          : slot === "bg.upcoming-retreats"
            ? "Upcoming retreats background"
            : slot === "bg.testimonials"
              ? "Guest voices background"
              : slot === "bg.philosophy"
              ? "Philosophy section image"
              : `${retreat?.title ?? "Bhraman retreat"} cover`;
      const asset = await uploadMediaForReview(file, {
        folder: mediaFolderFor(slot),
        altText: label,
        title: label,
      });
      setPendingMedia((current) => ({ ...current, [slot]: { id: asset.id, url: asset.url } }));
      setMedia((current) => ({ ...current, [slot]: asset.url }));
      flash("Upload confirmed. Review and publish it to make it live.");
    } catch (uploadError) {
      fail(uploadError instanceof Error ? uploadError.message : "Upload failed");
    } finally {
      setBusy(false);
    }
  }

  async function uploadPortrait(file: File, index: number) {
    setBusy(true); setError(null);
    try {
      const name = testimonials[index]?.name || "guest";
      const label = `${name} portrait`;
      const asset = await uploadMediaForReview(file, {
        folder: "testimonials",
        altText: label,
        title: label,
      });
      await publishMediaAsset(asset.id);
      setTestimonials((current) => current.map((x, j) => j === index ? { ...x, imageUrl: asset.url } : x));
      flash("Portrait image uploaded. Save testimonials to apply it.");
    } catch (uploadError) {
      fail(uploadError instanceof Error ? uploadError.message : "Image upload failed.");
    } finally {
      setBusy(false);
    }
  }

  async function publishImage(slot: SlotType) {
    const pending = pendingMedia[slot];
    if (!pending) return;
    setBusy(true); setError(null);
    try {
      const asset = await publishMediaAsset(pending.id, slot);
      setMedia((current) => ({ ...current, [slot]: asset.url }));
      setPendingMedia((current) => ({ ...current, [slot]: undefined }));
      flash("Media reviewed and published.");
    } catch (publishError) {
      fail(publishError instanceof Error ? publishError.message : "Publish failed");
    } finally {
      setBusy(false);
    }
  }

  async function updateBooking(id: string, patch: { status?: string; paymentStatus?: string }) {
    const res = await fetch("/api/admin/bookings", {
      method: "PATCH", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, ...patch }),
    });
    if (res.ok) loadBookings(); else fail("Update failed");
  }

  if (authed === null) return <main className="admin-shell"><p className="admin-loading"><Loader2 className="spin" size={18} /> Loading…</p></main>;

  if (!authed) {
    return (
      <main className="admin-shell">
        <form className="admin-login" onSubmit={handleLogin}>
          <BrandLogo />
          <h1>Admin</h1>
          <p>Bhraman Retreats content manager</p>
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} autoFocus />
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button button-dark" disabled={busy || !password}>{busy ? "Checking…" : "Sign in"}</button>
        </form>
      </main>
    );
  }

  return (
    <main className="admin-shell">
      <header className="admin-header">
        <Link className="brand" href="/"><BrandLogo context="admin" /></Link>
        <nav>{TABS.map((t) => <button key={t} className={tab === t ? "active" : ""} onClick={() => setTab(t)}>{t}</button>)}</nav>
        <button className="admin-logout" onClick={handleLogout}><LogOut size={15} /> Sign out</button>
      </header>

      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {tab === "Content" && retreat && (
        <form className="admin-card" onSubmit={(e) => { e.preventDefault(); save({ retreat }, "Retreat content saved"); }}>
          <h2>Upcoming retreat</h2>
          <p className="admin-note">Editing the next retreat selected automatically from its dates: {retreat.title}.</p>
          <div className="admin-grid">
            <label>Title<input value={retreat.title} onChange={(e) => setRetreat({ ...retreat, title: e.target.value })} /></label>
            <label>Edition<input value={retreat.edition ?? ""} onChange={(e) => setRetreat({ ...retreat, edition: e.target.value })} /></label>
            <label>Location<input value={retreat.location} onChange={(e) => setRetreat({ ...retreat, location: e.target.value })} /></label>
            <label>Capacity<input type="number" min={1} value={retreat.capacity} onChange={(e) => setRetreat({ ...retreat, capacity: Number(e.target.value) })} /></label>
            <label>Start date<input type="date" value={retreat.startDate} onChange={(e) => setRetreat({ ...retreat, startDate: e.target.value })} /></label>
            <label>End date<input type="date" value={retreat.endDate} onChange={(e) => setRetreat({ ...retreat, endDate: e.target.value })} /></label>
            <label>Price per person (₹)<input type="number" min={0} value={retreat.priceInPaise / 100} onChange={(e) => setRetreat({ ...retreat, priceInPaise: Number(e.target.value) * 100 })} /></label>
          </div>
          <label>Summary<textarea rows={3} value={retreat.summary} onChange={(e) => setRetreat({ ...retreat, summary: e.target.value })} /></label>
          <button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Save content"}</button>
        </form>
      )}

      {tab === "Content" && (
        <form className="admin-card" onSubmit={(e) => { e.preventDefault(); save({ philosophyParagraphs }, "Philosophy text saved"); }}>
          <h2>Philosophy section text</h2>
          <p className="admin-note">The first paragraph is always visible. The second appears after the "Show more" link.</p>
          <label>
            First paragraph (always visible — ends with "renewal")
            <textarea rows={4} value={philosophyParagraphs[0]} onChange={(e) => setPhilosophyParagraphs([e.target.value, philosophyParagraphs[1]])} />
          </label>
          <label>
            Second paragraph (hidden behind "Show more")
            <textarea rows={4} value={philosophyParagraphs[1]} onChange={(e) => setPhilosophyParagraphs([philosophyParagraphs[0], e.target.value])} />
          </label>
          <button className="button button-dark" disabled={busy}>{busy ? "Saving…" : "Save philosophy text"}</button>
        </form>
      )}

      {tab === "Enquiries" && <EnquiriesManager />}
      {tab === "Retreats" && <RetreatsManager />}
      {tab === "Itinerary" && <ItineraryManager />}
      {tab === "Founder Story" && <FounderStoryManager />}
      {tab === "FAQs" && <FaqManager />}

      {/* ── TESTIMONIALS TAB ── */}
      {tab === "Testimonials" && (
        <div className="admin-card">
          <h2>Written Testimonials <span className="admin-count">{testimonials.length} / 12</span></h2>
          <p className="admin-note">Add up to 12 written testimonials. Each can optionally include a portrait photo URL.</p>
          {testimonials.map((t, i) => (
            <div className="admin-testimonial" key={i}>
              <div className="admin-grid">
                <label>Name<input value={t.name} onChange={(e) => setTestimonials(testimonials.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} /></label>
                <label>Location<input value={t.location} onChange={(e) => setTestimonials(testimonials.map((x, j) => j === i ? { ...x, location: e.target.value } : x))} /></label>
              </div>
              <div style={{ display: "flex", gap: "16px", alignItems: "flex-end", flexWrap: "wrap" }}>
                <div style={{ flex: 1, display: "flex", gap: "16px", alignItems: "flex-end", minWidth: "280px" }}>
                  {t.imageUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={t.imageUrl}
                      alt={t.name}
                      className="admin-portrait-preview"
                      loading="lazy"
                      decoding="async"
                      style={{ flexShrink: 0, marginBottom: "2px" }}
                    />
                  )}
                  <label style={{ flex: 1 }}>
                    Portrait photo URL
                    <input
                      value={t.imageUrl}
                      placeholder="https://... (or upload using the button on the right)"
                      onChange={(e) => setTestimonials(testimonials.map((x, j) => j === i ? { ...x, imageUrl: e.target.value } : x))}
                    />
                  </label>
                </div>
                <label className="admin-upload" style={{ marginBottom: "2px", height: "42px", display: "inline-flex", alignItems: "center", justifySelf: "stretch" }}>
                  <Upload size={13} /> Upload photo
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/avif"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (event) => {
                          if (typeof event.target?.result === "string") {
                            setCropTarget({
                              file,
                              testimonialIndex: i,
                              imageUrl: event.target.result,
                            });
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>
              <label>Quote<textarea rows={3} value={t.quote} onChange={(e) => setTestimonials(testimonials.map((x, j) => j === i ? { ...x, quote: e.target.value } : x))} /></label>
              <button type="button" className="admin-delete" onClick={() => setTestimonials(testimonials.filter((_, j) => j !== i))}><Trash2 size={14} /> Remove</button>
            </div>
          ))}
          <div className="admin-testi-actions">
            {testimonials.length < 12 && (
              <button type="button" className="admin-add" onClick={() => setTestimonials([...testimonials, { name: "", location: "", imageUrl: "", quote: "" }])}><Plus size={15} /> Add testimonial</button>
            )}
            <button className="button button-dark" disabled={busy} onClick={() => save({ testimonials }, "Testimonials saved")}>{busy ? "Saving…" : "Save testimonials"}</button>
          </div>
        </div>
      )}

      {/* ── VIDEOS TAB ── */}
      {tab === "Videos" && (
        <div className="admin-card">
          <h2>YouTube Videos / Shorts <span className="admin-count">{videos.length} / 9</span></h2>
          <p className="admin-note">
            Add up to 9 YouTube video or Shorts URLs. These appear on the Guest Voices page in a 3×3 portrait grid.
            Paste the full YouTube URL (e.g. <code>https://youtube.com/shorts/abc123</code> or <code>https://youtu.be/abc123</code>).
          </p>
          {videos.map((v, i) => (
            <div className="admin-video-entry" key={i}>
              <div className="admin-video-entry-header">
                <Youtube size={16} color="#ff0000" />
                <span className="admin-video-num">Video {i + 1}</span>
                <button type="button" className="admin-delete admin-delete-sm" onClick={() => setVideos(videos.filter((_, j) => j !== i))}><Trash2 size={13} /> Remove</button>
              </div>
              <div className="admin-grid">
                <label>
                  Video Title
                  <input value={v.title} placeholder="e.g. A journey from stress to serenity" onChange={(e) => setVideos(videos.map((x, j) => j === i ? { ...x, title: e.target.value } : x))} />
                </label>
                <label>
                  YouTube URL
                  <input value={v.url} placeholder="https://youtube.com/shorts/... or https://youtu.be/..." onChange={(e) => setVideos(videos.map((x, j) => j === i ? { ...x, url: e.target.value } : x))} />
                </label>
              </div>
              {v.url && (
                <div className="admin-video-preview">
                  <iframe
                    src={youtubeEmbedUrl(v.url)}
                    title={v.title || `Video ${i + 1}`}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    loading="lazy"
                  />
                </div>
              )}
            </div>
          ))}
          <div className="admin-testi-actions">
            {videos.length < 9 && (
              <button type="button" className="admin-add" onClick={() => setVideos([...videos, { title: "", url: "" }])}><Plus size={15} /> Add video</button>
            )}
            <button className="button button-dark" disabled={busy} onClick={() => save({ videos }, "Videos saved")}>{busy ? "Saving…" : "Save videos"}</button>
          </div>
          {videos.length === 0 && (
            <p className="admin-note" style={{ marginTop: 12 }}>No videos added yet. Click "Add video" to get started.</p>
          )}
        </div>
      )}

      {tab === "Images" && (
        <div className="admin-card">
          <h2>Site images</h2>
          <div className="admin-images">
            {([
              ["hero", "Hero / homepage background"],
              ["retreat", "Retreat image"],
              ["founder", "Founder portrait"],
              ["bg.philosophy", "Philosophy section image"],
              ["bg.upcoming-retreats", "Upcoming Retreats background"],
              ["bg.testimonials", "Guest Voices background"]
            ] as const).map(([slot, label]) => (
              <div className="admin-image-slot" key={slot}>
                <h3>{label}</h3>
                {media[slot] ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={media[slot]} alt={label} loading="lazy" decoding="async" />
                ) : (
                  <div className="admin-image-empty">No image yet</div>
                )}
                <label className="admin-upload">
                  <Upload size={15} /> {media[slot] ? "Replace image" : "Upload image"}
                  <input type="file" accept="image/jpeg,image/png,image/webp,image/avif" hidden
                    onChange={(e) => { const file = e.target.files?.[0]; if (file) uploadImage(slot, file); e.target.value = ""; }} />
                </label>
                {pendingMedia[slot] && (
                  <div className="admin-media-review">
                    <p className="admin-note">Uploaded to Azure Blob Storage as a draft.</p>
                    <button type="button" className="admin-add" disabled={busy} onClick={() => publishImage(slot)}>
                      Publish to site
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
          <p className="admin-note">JPEG, PNG, WebP or AVIF, up to 20 MB. Files upload directly to Azure and remain draft until reviewed and published.</p>
        </div>
      )}

      {tab === "Bookings" && (
        <div className="admin-card">
          <h2>Bookings <span className="admin-count">{bookings.length}</span></h2>
          {bookings.length === 0 && <p className="admin-note">No bookings yet.</p>}
          <div className="admin-bookings">
            {bookings.map((b) => (
              <div className="admin-booking" key={b.id}>
                <div className="admin-booking-head">
                  <strong>{b.reference}</strong>
                  <span className={`pill pill-${b.status.toLowerCase()}`}>{b.status}</span>
                  <span className={`pill pill-${b.paymentStatus === "PAID" ? "paid" : "unpaid"}`}>{b.paymentStatus === "PAID" ? "Paid" : "Payment pending"}</span>
                  <em>{new Date(b.createdAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</em>
                </div>
                <p>{b.user.name ?? "—"} · {b.user.email} · {b.user.phone ?? "—"} · {b.guests} {b.guests === 1 ? "guest" : "guests"} · {inr(b.totalInPaise)}</p>
                {(b.dietaryNotes || b.healthNotes) && <p className="admin-note">{[b.dietaryNotes && `Diet: ${b.dietaryNotes}`, b.healthNotes && `Health: ${b.healthNotes}`].filter(Boolean).join(" · ")}</p>}
                <div className="admin-booking-actions">
                  {b.status !== "CONFIRMED" && <button onClick={() => updateBooking(b.id, { status: "CONFIRMED" })}>Confirm</button>}
                  {b.paymentStatus !== "PAID" && <button onClick={() => updateBooking(b.id, { paymentStatus: "PAID" })}>Mark paid</button>}
                  {b.status !== "CANCELLED" && <button className="danger" onClick={() => updateBooking(b.id, { status: "CANCELLED" })}>Cancel</button>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {cropTarget && (
        <CropModal
          imageUrl={cropTarget.imageUrl}
          onCancel={() => setCropTarget(null)}
          onApply={async (blob) => {
            const index = cropTarget.testimonialIndex;
            const file = cropTarget.file;
            setCropTarget(null);
            
            const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf(".")) || file.name;
            const croppedFile = new File([blob], `${nameWithoutExt}-circle.png`, {
              type: "image/png",
            });
            
            await uploadPortrait(croppedFile, index);
          }}
        />
      )}
    </main>
  );
}
