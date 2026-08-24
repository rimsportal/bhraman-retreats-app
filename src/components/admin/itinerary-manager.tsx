"use client";

import { useEffect, useRef, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Image as ImageIcon,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
  Upload,
  UploadCloud,
} from "lucide-react";

type Activity = {
  title: string;
  description?: string | null;
  startTime?: string | null;
  sortOrder?: number;
};

type Section = {
  title: string;
  description?: string | null;
  sortOrder?: number;
  activities: Activity[];
};

type ItineraryDay = {
  id?: string;
  dayNumber: number;
  element: string;
  title: string;
  description?: string | null;
  publicationStatus?: string;
  sections: Section[];
};

type RetreatOption = {
  id: string;
  title: string;
  slug: string;
  edition?: string | null;
  status: string;
};

type ItineraryContentSettings = {
  itineraryLabel: string;
  itineraryTitle: string;
  itineraryEmphasis: string;
  itineraryIntro: string;
  itineraryNote: string;
  itineraryCoverImage?: string;
};

const ELEMENTS = ["EARTH", "WATER", "FIRE", "AIR", "SPACE"] as const;

const DEFAULT_SETTINGS: ItineraryContentSettings = {
  itineraryLabel: "YOUR FIVE-DAY RHYTHM",
  itineraryTitle: "A journey that",
  itineraryEmphasis: "unfolds slowly.",
  itineraryIntro:
    "Every day honours one element through movement, traditional practice, conscious nourishment and reflection.",
  itineraryNote:
    "The complete time-by-time schedule becomes available after your place is confirmed.",
  itineraryCoverImage: "/hero-himalayan-dawn.png",
};

const HIMALAYAN_COVER_PRESETS = [
  { label: "Himalayan Golden Dawn", url: "/hero-himalayan-dawn.png" },
  { label: "Lamayuru Monastery Yoga", url: "/hero-yoga-lamayuru.jpg" },
  { label: "Ancient Monastery Morning", url: "/monastery-morning.png" },
];

const DEFAULT_DAYS_TEMPLATE: ItineraryDay[] = [
  {
    dayNumber: 1,
    element: "EARTH",
    title: "Arrive, ground and slow down",
    description: "Settle into the ancient valley, ground with the soil, and acclimatize mindfully.",
    publicationStatus: "PUBLISHED",
    sections: [
      {
        title: "Morning & Afternoon",
        activities: [
          { startTime: "12:00 PM", title: "Traditional Ladakhi welcome and herbal tea ceremony" },
          { startTime: "04:30 PM", title: "Gentle restorative yoga for high-altitude acclimatization" },
        ],
      },
      {
        title: "Evening",
        activities: [
          { startTime: "06:30 PM", title: "Prithvi (Earth) grounding walking meditation on monastery grounds" },
          { startTime: "08:00 PM", title: "Nourishing sattvic dinner and opening circle under the stars" },
        ],
      },
    ],
  },
  {
    dayNumber: 2,
    element: "WATER",
    title: "Release emotional tension and soften",
    description: "Flow with breathwork and fluid somatic movement to let go of accumulated stress.",
    publicationStatus: "PUBLISHED",
    sections: [
      {
        title: "Morning",
        activities: [
          { startTime: "06:30 AM", title: "Sunrise Jala (Water) breathwork and somatic fluid movement" },
          { startTime: "09:30 AM", title: "Silent meditative hike along mountain glacial streams" },
        ],
      },
      {
        title: "Evening",
        activities: [
          { startTime: "05:00 PM", title: "Vocal toning and nervous system down-regulation workshop" },
          { startTime: "07:30 PM", title: "Evening reflective tea gathering and restorative sound bath" },
        ],
      },
    ],
  },
  {
    dayNumber: 3,
    element: "FIRE",
    title: "Transform and kindle inner vitality",
    description: "Reconnect with inner strength, digestion, and clear radiant purpose.",
    publicationStatus: "PUBLISHED",
    sections: [
      {
        title: "Morning",
        activities: [
          { startTime: "06:30 AM", title: "Agni (Fire) solar yoga practice and core energy activation" },
          { startTime: "11:00 AM", title: "Mindful nature immersion and Himalayan wisdom discourse" },
        ],
      },
      {
        title: "Evening",
        activities: [
          { startTime: "05:30 PM", title: "Ancient Trātaka (candle flame gazing) concentration ritual" },
          { startTime: "07:30 PM", title: "Sacred fire ceremony (Havan) to release mental burdens" },
        ],
      },
    ],
  },
  {
    dayNumber: 4,
    element: "AIR",
    title: "Expand awareness and invite lightness",
    description: "Open the breath and let lightness clear old mental habits and physical fatigue.",
    publicationStatus: "PUBLISHED",
    sections: [
      {
        title: "Morning",
        activities: [
          { startTime: "06:30 AM", title: "Morning Vāyu (Air) prāṇāyāma atop the moonland ridge" },
          { startTime: "10:00 AM", title: "Monastery prayer chant observation and spiritual reflection" },
        ],
      },
      {
        title: "Evening",
        activities: [
          { startTime: "05:00 PM", title: "Spacious creative journaling and restorative bodywork" },
          { startTime: "07:30 PM", title: "Community storytelling circle with warm herbal chai" },
        ],
      },
    ],
  },
  {
    dayNumber: 5,
    element: "SPACE",
    title: "Integrate, observe and carry home",
    description: "Anchor the silence and clarity into everyday life before returning home.",
    publicationStatus: "PUBLISHED",
    sections: [
      {
        title: "Morning",
        activities: [
          { startTime: "06:00 AM", title: "Dawn Ākāśa (Space) silent meditation overlooking the valley" },
          { startTime: "08:30 AM", title: "Closing gratitude ceremony and intention integration" },
        ],
      },
      {
        title: "Farewell",
        activities: [
          { startTime: "10:00 AM", title: "Shared farewell breakfast and personal takeaway journals" },
          { startTime: "12:00 PM", title: "Departure with renewed clarity and inner silence" },
        ],
      },
    ],
  },
];

export function ItineraryManager() {
  const [retreats, setRetreats] = useState<RetreatOption[]>([]);
  const [selectedRetreatId, setSelectedRetreatId] = useState<string>("");
  const [days, setDays] = useState<ItineraryDay[]>(DEFAULT_DAYS_TEMPLATE);
  const [settings, setSettings] = useState<ItineraryContentSettings>(DEFAULT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingCover, setUploadingCover] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  const flash = (msg: string) => {
    setMessage(msg);
    setError(null);
    setTimeout(() => setMessage(null), 3500);
  };

  // 1. Fetch available retreats and site settings on mount
  useEffect(() => {
    async function loadInitialData() {
      setLoading(true);
      try {
        const [retreatsRes, settingsRes] = await Promise.all([
          fetch("/api/admin/cms/retreats", { credentials: "include" }),
          fetch("/api/public/site-settings"),
        ]);

        if (retreatsRes.ok) {
          const payload = await retreatsRes.json();
          const list: RetreatOption[] = (payload.data || []).map((r: any) => ({
            id: r.id,
            title: r.title,
            slug: r.slug,
            edition: r.edition,
            status: r.status,
          }));
          setRetreats(list);
          if (list.length > 0) {
            setSelectedRetreatId(list[0].id);
          }
        }

        if (settingsRes.ok) {
          const settingsPayload = await settingsRes.json();
          const content = settingsPayload.data?.["home.content"] || {};
          setSettings({
            itineraryLabel: content.itineraryLabel || DEFAULT_SETTINGS.itineraryLabel,
            itineraryTitle: content.itineraryTitle || DEFAULT_SETTINGS.itineraryTitle,
            itineraryEmphasis: content.itineraryEmphasis || DEFAULT_SETTINGS.itineraryEmphasis,
            itineraryIntro: content.itineraryIntro || DEFAULT_SETTINGS.itineraryIntro,
            itineraryNote: content.itineraryNote || DEFAULT_SETTINGS.itineraryNote,
            itineraryCoverImage: content.itineraryCoverImage || DEFAULT_SETTINGS.itineraryCoverImage,
          });
        }
      } catch (err) {
        console.error("Failed to load itinerary initial data:", err);
      } finally {
        setLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // 2. Load retreat-specific itinerary when selected retreat changes
  useEffect(() => {
    if (!selectedRetreatId) return;

    async function loadRetreatItinerary() {
      try {
        const res = await fetch(`/api/admin/cms/retreats/${selectedRetreatId}`, {
          credentials: "include",
        });
        if (res.ok) {
          const retreat = (await res.json()).data;
          if (Array.isArray(retreat?.itinerary) && retreat.itinerary.length > 0) {
            setDays(
              retreat.itinerary.map((d: any) => ({
                id: d.id,
                dayNumber: d.dayNumber,
                element: (d.element || "EARTH").toUpperCase(),
                title: d.title || "",
                description: d.description || "",
                publicationStatus: d.publicationStatus || "PUBLISHED",
                sections: Array.isArray(d.sections) && d.sections.length > 0
                  ? d.sections.map((s: any) => ({
                      title: s.title || "Activities",
                      description: s.description || "",
                      activities: Array.isArray(s.activities)
                        ? s.activities.map((a: any) => ({
                            startTime: a.startTime || "",
                            title: a.title || "",
                            description: a.description || "",
                          }))
                        : [],
                    }))
                  : [
                      {
                        title: "Daily Flow",
                        activities: [],
                      },
                    ],
              }))
            );
          } else {
            setDays(DEFAULT_DAYS_TEMPLATE);
          }
        }
      } catch (err) {
        console.error("Failed to fetch retreat itinerary:", err);
      }
    }

    loadRetreatItinerary();
  }, [selectedRetreatId]);

  // Handle Cover Photo Upload
  const handleCoverUpload = async (file: File) => {
    if (!file) return;
    setUploadingCover(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("slot", "itinerary");
      formData.append("altText", "Itinerary Cover Image");

      const res = await fetch("/api/admin/upload", {
        method: "POST",
        body: formData,
        credentials: "include",
      });
      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || "Failed to upload cover image");
      }
      const data = await res.json();
      if (data.url) {
        setSettings((prev) => ({ ...prev, itineraryCoverImage: data.url }));
        flash("✓ Itinerary cover photo uploaded successfully. Click Save to publish.");
      }
    } catch (err: any) {
      alert("Cover image upload failed: " + (err.message || "Please try again."));
    } finally {
      setUploadingCover(false);
    }
  };

  // Day handlers
  const handleAddDay = () => {
    const nextNum = days.length + 1;
    const nextElement = ELEMENTS[(nextNum - 1) % ELEMENTS.length];
    setDays((prev) => [
      ...prev,
      {
        dayNumber: nextNum,
        element: nextElement,
        title: `Day ${nextNum} Practice & Immersion`,
        description: "",
        publicationStatus: "PUBLISHED",
        sections: [
          {
            title: "Morning & Evening",
            activities: [{ startTime: "07:00 AM", title: "Morning session" }],
          },
        ],
      },
    ]);
    setExpandedDay(nextNum);
  };

  const handleRemoveDay = (index: number) => {
    if (days.length <= 1) {
      setError("An itinerary must contain at least 1 day.");
      return;
    }
    setDays((prev) =>
      prev.filter((_, idx) => idx !== index).map((d, idx) => ({ ...d, dayNumber: idx + 1 }))
    );
  };

  const handleUpdateDay = (index: number, field: keyof ItineraryDay, value: any) => {
    setDays((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  // Section & Activity handlers
  const handleAddSection = (dayIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      const sections = [...(next[dayIndex].sections || [])];
      sections.push({
        title: "Afternoon Session",
        activities: [{ startTime: "02:00 PM", title: "New activity" }],
      });
      next[dayIndex] = { ...next[dayIndex], sections };
      return next;
    });
  };

  const handleRemoveSection = (dayIndex: number, sectionIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      const sections = next[dayIndex].sections.filter((_, idx) => idx !== sectionIndex);
      next[dayIndex] = { ...next[dayIndex], sections };
      return next;
    });
  };

  const handleUpdateSectionTitle = (dayIndex: number, sectionIndex: number, title: string) => {
    setDays((prev) => {
      const next = [...prev];
      const sections = [...next[dayIndex].sections];
      sections[sectionIndex] = { ...sections[sectionIndex], title };
      next[dayIndex] = { ...next[dayIndex], sections };
      return next;
    });
  };

  const handleAddActivity = (dayIndex: number, sectionIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      const sections = [...next[dayIndex].sections];
      const activities = [...sections[sectionIndex].activities];
      activities.push({ startTime: "10:00 AM", title: "New activity" });
      sections[sectionIndex] = { ...sections[sectionIndex], activities };
      next[dayIndex] = { ...next[dayIndex], sections };
      return next;
    });
  };

  const handleRemoveActivity = (dayIndex: number, sectionIndex: number, activityIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      const sections = [...next[dayIndex].sections];
      const activities = sections[sectionIndex].activities.filter((_, idx) => idx !== activityIndex);
      sections[sectionIndex] = { ...sections[sectionIndex], activities };
      next[dayIndex] = { ...next[dayIndex], sections };
      return next;
    });
  };

  const handleUpdateActivity = (
    dayIndex: number,
    sectionIndex: number,
    activityIndex: number,
    field: keyof Activity,
    value: string
  ) => {
    setDays((prev) => {
      const next = [...prev];
      const sections = [...next[dayIndex].sections];
      const activities = [...sections[sectionIndex].activities];
      activities[activityIndex] = { ...activities[activityIndex], [field]: value };
      sections[sectionIndex] = { ...sections[sectionIndex], activities };
      next[dayIndex] = { ...next[dayIndex], sections };
      return next;
    });
  };

  // Save changes
  const handleSaveAll = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedRetreatId) {
      setError("Please select a retreat to save the itinerary for.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      const itineraryPayload = {
        days: days.map((d, dIdx) => ({
          dayNumber: d.dayNumber || dIdx + 1,
          element: d.element || "EARTH",
          title: d.title || `Day ${dIdx + 1}`,
          description: d.description || null,
          publicationStatus: "PUBLISHED",
          sections: (d.sections || []).map((s, sIdx) => ({
            title: s.title || "Session",
            description: s.description || null,
            sortOrder: sIdx + 1,
            publicationStatus: "PUBLISHED",
            activities: (s.activities || [])
              .filter((a) => a.title.trim().length > 0)
              .map((a, aIdx) => ({
                title: a.title.trim(),
                description: a.description || null,
                startTime: a.startTime?.trim() || null,
                sortOrder: aIdx + 1,
                publicationStatus: "PUBLISHED",
              })),
          })),
        })),
      };

      const itineraryRes = await fetch(`/api/admin/cms/retreats/${selectedRetreatId}/itinerary`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(itineraryPayload),
      });

      if (!itineraryRes.ok) {
        const errPayload = await itineraryRes.json().catch(() => ({}));
        throw new Error(errPayload.error?.message || "Failed to update retreat itinerary.");
      }

      const settingsRes = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          key: "home.content",
          value: settings,
        }),
      });

      if (!settingsRes.ok) {
        console.warn("Could not persist home.content itinerary settings directly");
      }

      flash("Itinerary rhythm, cover photo, and daily elemental sessions successfully saved and published!");
    } catch (err: any) {
      setError(err.message || "Failed to save itinerary.");
    } finally {
      setSaving(false);
    }
  };

  const handleResetToTemplate = () => {
    if (confirm("Reset itinerary to the 5-element classical template?")) {
      setDays(DEFAULT_DAYS_TEMPLATE);
      setSettings(DEFAULT_SETTINGS);
      flash("Reset to 5-element template.");
    }
  };

  if (loading) {
    return (
      <div className="admin-card">
        <p className="admin-loading">
          <Loader2 className="spin" size={18} /> Loading itinerary manager...
        </p>
      </div>
    );
  }

  return (
    <form className="admin-card" onSubmit={handleSaveAll}>
      {/* Head Banner matching Founder Story */}
      <div className="admin-retreats-head" style={{ marginBottom: "24px" }}>
        <div>
          <h2>Retreat Itinerary &amp; Daily Rhythm</h2>
          <p className="admin-note">
            Control the 5-day elemental schedule, daily practices, cover photography, and copy displayed on <code>/itinerary</code> and the homepage.
          </p>
        </div>

        <div className="admin-retreats-actions">
          <button
            type="button"
            className="button button-secondary"
            onClick={handleResetToTemplate}
            disabled={saving}
          >
            <RotateCcw size={14} /> Reset Template
          </button>
          <button
            type="submit"
            className="button button-dark"
            disabled={saving}
          >
            {saving ? <Loader2 className="spin" size={14} /> : <Check size={14} />}
            <span>{saving ? "Saving Changes..." : "Save & Publish Itinerary"}</span>
          </button>
        </div>
      </div>

      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {/* ── SECTION 1: TARGET RETREAT SELECTOR ── */}
      <div style={{ background: "#fbfcf9", padding: "20px", borderRadius: "8px", border: "1px solid #e2e8de", marginBottom: "24px" }}>
        <h3 style={{ margin: "0 0 12px", display: "flex", alignItems: "center", gap: "8px", fontSize: "16px", color: "#1d281f" }}>
          <Compass size={18} color="#7b3a34" /> 1. Select Retreat Edition
        </h3>
        <label>
          Retreat to link this Itinerary to:
          <select
            value={selectedRetreatId}
            onChange={(e) => setSelectedRetreatId(e.target.value)}
            style={{ width: "100%", padding: "10px 14px", marginTop: "6px" }}
          >
            {retreats.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title} ({r.edition || r.slug}) · {r.status}
              </option>
            ))}
          </select>
        </label>
        <p className="admin-note" style={{ margin: "6px 0 0" }}>
          The itinerary days below will be saved and published for this retreat edition.
        </p>
      </div>

      {/* ── SECTION 2: ITINERARY HERO COVER PAGE STUDIO ── */}
      <div style={{ background: "#fbfcf9", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8de", marginBottom: "32px" }}>
        <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", color: "#1d281f" }}>
          <ImageIcon size={18} color="#7b3a34" /> 2. Itinerary Hero Cover Page Photography
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr", gap: "24px", alignItems: "center" }}>
          {/* 16:9 Live Preview Canvas */}
          <div
            style={{
              width: "100%",
              aspectRatio: "16/10",
              borderRadius: "10px",
              overflow: "hidden",
              background: "#111",
              border: "1px solid #ded9ce",
              position: "relative",
              cursor: "pointer",
            }}
            onClick={() => coverFileInputRef.current?.click()}
            title="Click to upload new cover image"
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.itineraryCoverImage || "/hero-himalayan-dawn.png"}
              alt="Itinerary Cover"
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <div
              style={{
                position: "absolute",
                inset: 0,
                background: "rgba(0,0,0,0.4)",
                opacity: 0,
                transition: "opacity 0.2s ease",
                display: "grid",
                placeItems: "center",
                color: "#fff",
                fontSize: "12px",
                fontWeight: 600,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.opacity = "1";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.opacity = "0";
              }}
            >
              <Upload size={16} /> Click to Upload Cover
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#1d281f", display: "block", marginBottom: "4px" }}>
                Hero Cover Image URL (Displayed at top of <code>/itinerary</code>)
              </span>
              <input
                type="text"
                value={settings.itineraryCoverImage || ""}
                onChange={(e) => setSettings({ ...settings, itineraryCoverImage: e.target.value })}
                placeholder="/hero-himalayan-dawn.png or https://..."
                style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #ded9ce" }}
              />
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <input
                type="file"
                ref={coverFileInputRef}
                accept="image/jpeg,image/png,image/webp,image/avif"
                hidden
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverUpload(file);
                  e.target.value = "";
                }}
              />
              <button
                type="button"
                className="button button-dark"
                onClick={() => coverFileInputRef.current?.click()}
                disabled={uploadingCover}
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                {uploadingCover ? (
                  <>
                    <Loader2 size={13} className="spin" /> Uploading to Cloud…
                  </>
                ) : (
                  <>
                    <UploadCloud size={14} /> Upload New Cover Photo
                  </>
                )}
              </button>

              <span style={{ fontSize: "11px", color: "#8a8178", fontWeight: 600 }}>OR SELECT PRESET:</span>
              {HIMALAYAN_COVER_PRESETS.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => setSettings({ ...settings, itineraryCoverImage: preset.url })}
                  style={{
                    padding: "4px 12px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: settings.itineraryCoverImage === preset.url ? "#7b3a34" : "#ded9ce",
                    background: settings.itineraryCoverImage === preset.url ? "#7b3a34" : "#ffffff",
                    color: settings.itineraryCoverImage === preset.url ? "#ffffff" : "#1d281f",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION 3: GLOBAL ITINERARY HEADINGS & COPY ── */}
      <div style={{ background: "#fbfcf9", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8de", marginBottom: "32px" }}>
        <h3 style={{ margin: "0 0 16px", display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", color: "#1d281f" }}>
          <Sparkles size={18} color="#7b3a34" /> 3. Section Headings &amp; Intro Copy
        </h3>

        <div className="admin-grid">
          <label>
            Section Label / Eyebrow
            <input
              value={settings.itineraryLabel}
              onChange={(e) => setSettings({ ...settings, itineraryLabel: e.target.value })}
              placeholder="e.g. YOUR FIVE-DAY RHYTHM"
            />
          </label>

          <label>
            Main Title &amp; Emphasis
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                value={settings.itineraryTitle}
                onChange={(e) => setSettings({ ...settings, itineraryTitle: e.target.value })}
                placeholder="Title (e.g. A journey that)"
                style={{ flex: 1 }}
              />
              <input
                value={settings.itineraryEmphasis}
                onChange={(e) => setSettings({ ...settings, itineraryEmphasis: e.target.value })}
                placeholder="Emphasis (e.g. unfolds slowly.)"
                style={{ flex: 1 }}
              />
            </div>
          </label>
        </div>

        <div style={{ marginTop: "16px" }}>
          <label>
            Introduction Paragraph
            <textarea
              rows={2}
              value={settings.itineraryIntro}
              onChange={(e) => setSettings({ ...settings, itineraryIntro: e.target.value })}
            />
          </label>
        </div>

        <div style={{ marginTop: "16px" }}>
          <label>
            Schedule Note / Booking Disclaimer
            <input
              value={settings.itineraryNote}
              onChange={(e) => setSettings({ ...settings, itineraryNote: e.target.value })}
              placeholder="e.g. The complete time-by-time schedule becomes available after your place is confirmed."
            />
          </label>
        </div>
      </div>

      {/* ── SECTION 4: DAILY ELEMENTAL SCHEDULE ── */}
      <div style={{ background: "#fbfcf9", padding: "24px", borderRadius: "8px", border: "1px solid #e2e8de", marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h3 style={{ margin: 0, display: "flex", alignItems: "center", gap: "8px", fontSize: "18px", color: "#1d281f" }}>
            <CalendarDays size={18} color="#7b3a34" /> 4. Daily Elemental Schedule ({days.length} Days)
          </h3>
          <button
            type="button"
            className="admin-add"
            onClick={handleAddDay}
          >
            <Plus size={15} /> Add Day
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {days.map((day, dayIndex) => {
            const isExpanded = expandedDay === day.dayNumber;

            return (
              <div
                key={dayIndex}
                style={{
                  background: "#ffffff",
                  border: "1px solid #ccd6c8",
                  borderRadius: "8px",
                  overflow: "hidden",
                }}
              >
                {/* Day Header Row */}
                <div
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    background: isExpanded ? "#f4f7f2" : "#ffffff",
                    borderBottom: isExpanded ? "1px solid #e2e8de" : "none",
                  }}
                  onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "3px 9px",
                        background: "#fdf3e7",
                        color: "#7b3a34",
                        border: "1px solid #f2cfab",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "12px",
                        letterSpacing: "0.05em",
                      }}
                    >
                      DAY 0{day.dayNumber} · {day.element}
                    </span>
                    <strong style={{ color: "#1d281f", fontSize: "15px" }}>
                      {day.title || "Untitled Day"}
                    </strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDay(dayIndex);
                      }}
                      title="Remove Day"
                      style={{
                        background: "none",
                        border: "none",
                        cursor: "pointer",
                        color: "#c2410c",
                        padding: "4px",
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </div>
                </div>

                {/* Day Expanded Form */}
                {isExpanded && (
                  <div style={{ padding: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <div className="admin-grid">
                      <label>
                        Element Pillar:
                        <select
                          value={day.element}
                          onChange={(e) => handleUpdateDay(dayIndex, "element", e.target.value)}
                        >
                          {ELEMENTS.map((el) => (
                            <option key={el} value={el}>
                              {el}
                            </option>
                          ))}
                        </select>
                      </label>

                      <label>
                        Day Title (Theme):
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleUpdateDay(dayIndex, "title", e.target.value)}
                          placeholder="e.g. Arrive, ground and slow down"
                        />
                      </label>
                    </div>

                    <label>
                      Day Description / Intention:
                      <textarea
                        rows={2}
                        value={day.description || ""}
                        onChange={(e) => handleUpdateDay(dayIndex, "description", e.target.value)}
                        placeholder="Brief summary of the day's focus..."
                      />
                    </label>

                    {/* Sections & Activities in Day */}
                    <div style={{ marginTop: "12px", borderTop: "1px dashed #e2e8de", paddingTop: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 700, color: "#1d281f" }}>
                          Sessions / Time Blocks:
                        </span>
                        <button
                          type="button"
                          className="button button-secondary"
                          onClick={() => handleAddSection(dayIndex)}
                          style={{ fontSize: "11px", padding: "4px 10px" }}
                        >
                          <Plus size={12} /> Add Session Block
                        </button>
                      </div>

                      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                        {(day.sections || []).map((section, sIdx) => (
                          <div
                            key={sIdx}
                            style={{
                              background: "#fbfcf9",
                              border: "1px solid #e2e8de",
                              borderRadius: "6px",
                              padding: "14px",
                            }}
                          >
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
                              <input
                                type="text"
                                value={section.title}
                                onChange={(e) => handleUpdateSectionTitle(dayIndex, sIdx, e.target.value)}
                                placeholder="Session Title (e.g. Morning, Afternoon, Evening)"
                                style={{ fontWeight: 600, fontSize: "13px", width: "60%" }}
                              />
                              <div style={{ display: "flex", gap: "8px" }}>
                                <button
                                  type="button"
                                  className="button button-secondary"
                                  onClick={() => handleAddActivity(dayIndex, sIdx)}
                                  style={{ fontSize: "11px", padding: "4px 8px" }}
                                >
                                  <Plus size={11} /> Add Activity
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveSection(dayIndex, sIdx)}
                                  style={{ background: "none", border: "none", color: "#c2410c", cursor: "pointer" }}
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            {/* Activities list */}
                            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                              {(section.activities || []).map((act, aIdx) => (
                                <div key={aIdx} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                                  <input
                                    type="text"
                                    value={act.startTime || ""}
                                    onChange={(e) =>
                                      handleUpdateActivity(dayIndex, sIdx, aIdx, "startTime", e.target.value)
                                    }
                                    placeholder="07:00 AM"
                                    style={{ width: "100px", fontSize: "12px", padding: "6px 8px" }}
                                  />
                                  <input
                                    type="text"
                                    value={act.title}
                                    onChange={(e) =>
                                      handleUpdateActivity(dayIndex, sIdx, aIdx, "title", e.target.value)
                                    }
                                    placeholder="Activity description (e.g. Morning prāṇāyāma on ridge)"
                                    style={{ flex: 1, fontSize: "12px", padding: "6px 8px" }}
                                  />
                                  <button
                                    type="button"
                                    onClick={() => handleRemoveActivity(dayIndex, sIdx, aIdx)}
                                    style={{ background: "none", border: "none", color: "#8a9686", cursor: "pointer" }}
                                  >
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #ded9ce", paddingTop: "20px" }}>
        <button
          type="submit"
          className="button button-dark"
          disabled={saving}
          style={{ padding: "12px 28px" }}
        >
          {saving ? <Loader2 className="spin" size={16} /> : <Check size={16} />}
          <span>{saving ? "Saving Changes..." : "Save & Publish All Itinerary Changes"}</span>
        </button>
      </div>
    </form>
  );
}
