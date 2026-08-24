"use client";

import { useEffect, useState } from "react";
import {
  CalendarDays,
  Check,
  ChevronDown,
  ChevronUp,
  Clock,
  Compass,
  Loader2,
  Plus,
  RotateCcw,
  Sparkles,
  Trash2,
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
};

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
    description: "Open the lungs with prāṇāyāma and experience high-altitude expansive stillness.",
    publicationStatus: "PUBLISHED",
    sections: [
      {
        title: "Morning",
        activities: [
          { startTime: "06:00 AM", title: "Morning Vāyu (Air) prāṇāyāma atop the moonland ridge" },
          { startTime: "09:00 AM", title: "Monastery prayer chant observation and spiritual reflection" },
        ],
      },
      {
        title: "Evening",
        activities: [
          { startTime: "04:30 PM", title: "Spacious creative journaling and restorative bodywork" },
          { startTime: "07:30 PM", title: "Community storytelling circle with warm herbal chai" },
        ],
      },
    ],
  },
  {
    dayNumber: 5,
    element: "SPACE",
    title: "Integrate, observe and carry home",
    description: "Deep resting meditation and carrying the quiet mountain presence back into the world.",
    publicationStatus: "PUBLISHED",
    sections: [
      {
        title: "Morning",
        activities: [
          { startTime: "06:30 AM", title: "Dawn Ākāśa (Space) silent meditation overlooking the valley" },
          { startTime: "08:30 AM", title: "Closing gratitude ceremony and intention integration" },
          { startTime: "10:00 AM", title: "Shared farewell breakfast and personal takeaway journals" },
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
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedDay, setExpandedDay] = useState<number | null>(1);

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
            // Default template if no days yet
            setDays(DEFAULT_DAYS_TEMPLATE);
          }
        }
      } catch (err) {
        console.error("Failed to fetch retreat itinerary:", err);
      }
    }

    loadRetreatItinerary();
  }, [selectedRetreatId]);

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

  const handleAddActivity = (dayIndex: number, sectionIndex: number) => {
    setDays((prev) => {
      const next = [...prev];
      const sections = [...next[dayIndex].sections];
      const activities = [...sections[sectionIndex].activities, { startTime: "", title: "" }];
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
  const handleSaveAll = async () => {
    if (!selectedRetreatId) {
      setError("Please select a retreat to save the itinerary for.");
      return;
    }

    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      // 1. Save Itinerary Days to Retreat
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

      // 2. Save Global Itinerary Copy Settings
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

      flash("Itinerary and retreat rhythm successfully saved and published!");
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
      <div className="admin-loading" style={{ padding: "60px 0", textAlign: "center" }}>
        <Loader2 className="spinner" size={32} />
        <p style={{ marginTop: "12px", color: "var(--color-text-muted)" }}>Loading itinerary manager...</p>
      </div>
    );
  }

  return (
    <div className="itinerary-manager-wrap" style={{ maxWidth: "1000px", margin: "0 auto" }}>
      {/* Top Banner & Flash Messages */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Compass size={24} style={{ color: "var(--color-primary-light, #c69b49)" }} />
            Retreat Itinerary Manager
          </h2>
          <p style={{ color: "var(--color-text-muted, #9eb3a8)", fontSize: "14px", marginTop: "4px" }}>
            Control the 5-day elemental rhythm, daily practices, schedule notes, and titles displayed on <code>/itinerary</code> and the homepage.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            type="button"
            onClick={handleResetToTemplate}
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "8px 16px" }}
            title="Reset to 5-day elemental template"
          >
            <RotateCcw size={14} style={{ marginRight: "6px" }} /> Template
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={saving}
            className="btn btn-primary"
            style={{ fontSize: "14px", padding: "8px 20px" }}
          >
            {saving ? <Loader2 className="spinner" size={16} /> : <Check size={16} />}
            {saving ? "Saving..." : "Save & Publish Itinerary"}
          </button>
        </div>
      </div>

      {message && (
        <div style={{ padding: "12px 16px", background: "rgba(46, 125, 50, 0.2)", border: "1px solid #4caf50", borderRadius: "8px", color: "#a5d6a7", marginBottom: "20px" }}>
          {message}
        </div>
      )}

      {error && (
        <div style={{ padding: "12px 16px", background: "rgba(211, 47, 47, 0.2)", border: "1px solid #f44336", borderRadius: "8px", color: "#ef9a9a", marginBottom: "20px" }}>
          {error}
        </div>
      )}

      {/* 1. Target Retreat Selector */}
      <div style={{ background: "var(--color-surface-elevated, #16201a)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "24px" }}>
        <label style={{ display: "block", fontSize: "13px", color: "var(--color-primary-light, #c69b49)", textTransform: "uppercase", letterSpacing: "1px", fontWeight: 600, marginBottom: "8px" }}>
          Target Retreat
        </label>
        <select
          value={selectedRetreatId}
          onChange={(e) => setSelectedRetreatId(e.target.value)}
          style={{ width: "100%", padding: "12px 16px", borderRadius: "8px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff", fontSize: "15px" }}
        >
          {retreats.map((r) => (
            <option key={r.id} value={r.id}>
              {r.title} ({r.edition || r.slug}) [{r.status}]
            </option>
          ))}
        </select>
      </div>

      {/* 2. Global Itinerary Section Copy */}
      <div style={{ background: "var(--color-surface-elevated, #16201a)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "20px", marginBottom: "28px" }}>
        <h3 style={{ fontSize: "16px", fontWeight: 600, color: "#fff", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
          <Sparkles size={16} style={{ color: "var(--color-primary-light, #c69b49)" }} />
          Itinerary Section Headings & Copy
        </h3>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#9eb3a8", marginBottom: "6px" }}>Section Eyebrow / Label</label>
            <input
              type="text"
              value={settings.itineraryLabel}
              onChange={(e) => setSettings({ ...settings, itineraryLabel: e.target.value })}
              style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "12px", color: "#9eb3a8", marginBottom: "6px" }}>Main Title & Emphasis</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input
                type="text"
                value={settings.itineraryTitle}
                onChange={(e) => setSettings({ ...settings, itineraryTitle: e.target.value })}
                placeholder="Title (e.g. A journey that)"
                style={{ flex: 1, padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
              />
              <input
                type="text"
                value={settings.itineraryEmphasis}
                onChange={(e) => setSettings({ ...settings, itineraryEmphasis: e.target.value })}
                placeholder="Emphasis (e.g. unfolds slowly.)"
                style={{ flex: 1, padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: "16px" }}>
          <label style={{ display: "block", fontSize: "12px", color: "#9eb3a8", marginBottom: "6px" }}>Introduction Paragraph</label>
          <textarea
            rows={2}
            value={settings.itineraryIntro}
            onChange={(e) => setSettings({ ...settings, itineraryIntro: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
          />
        </div>

        <div>
          <label style={{ display: "block", fontSize: "12px", color: "#9eb3a8", marginBottom: "6px" }}>Schedule Note / Booking Disclaimer</label>
          <input
            type="text"
            value={settings.itineraryNote}
            onChange={(e) => setSettings({ ...settings, itineraryNote: e.target.value })}
            style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
          />
        </div>
      </div>

      {/* 3. Day by Day Schedule Editor */}
      <div style={{ marginBottom: "32px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <h3 style={{ fontSize: "18px", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "8px" }}>
            <CalendarDays size={18} style={{ color: "var(--color-primary-light, #c69b49)" }} />
            Daily Elemental Schedule ({days.length} Days)
          </h3>

          <button
            type="button"
            onClick={handleAddDay}
            className="btn btn-secondary"
            style={{ fontSize: "13px", padding: "6px 14px" }}
          >
            <Plus size={14} style={{ marginRight: "4px" }} /> Add Day
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {days.map((day, dayIndex) => {
            const isExpanded = expandedDay === day.dayNumber;

            return (
              <div
                key={dayIndex}
                style={{
                  background: "var(--color-surface-elevated, #16201a)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "12px",
                  overflow: "hidden",
                }}
              >
                {/* Day Header Bar */}
                <div
                  style={{
                    padding: "16px 20px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    cursor: "pointer",
                    background: isExpanded ? "rgba(255,255,255,0.03)" : "transparent",
                    borderBottom: isExpanded ? "1px solid rgba(255,255,255,0.08)" : "none",
                  }}
                  onClick={() => setExpandedDay(isExpanded ? null : day.dayNumber)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "4px 10px",
                        background: "rgba(198, 155, 73, 0.15)",
                        color: "var(--color-primary-light, #c69b49)",
                        borderRadius: "6px",
                        fontWeight: 700,
                        fontSize: "13px",
                      }}
                    >
                      DAY 0{day.dayNumber} · {day.element}
                    </span>
                    <strong style={{ color: "#fff", fontSize: "16px" }}>{day.title || "Untitled Day"}</strong>
                  </div>

                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRemoveDay(dayIndex);
                      }}
                      style={{ background: "transparent", border: "none", color: "#f44336", cursor: "pointer", padding: "4px" }}
                      title="Delete Day"
                    >
                      <Trash2 size={16} />
                    </button>
                    {isExpanded ? <ChevronUp size={18} color="#9eb3a8" /> : <ChevronDown size={18} color="#9eb3a8" />}
                  </div>
                </div>

                {/* Day Details Drawer */}
                {isExpanded && (
                  <div style={{ padding: "20px" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "140px 1fr", gap: "16px", marginBottom: "16px" }}>
                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#9eb3a8", marginBottom: "6px" }}>Element</label>
                        <select
                          value={day.element}
                          onChange={(e) => handleUpdateDay(dayIndex, "element", e.target.value)}
                          style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                        >
                          {ELEMENTS.map((el) => (
                            <option key={el} value={el}>
                              {el}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label style={{ display: "block", fontSize: "12px", color: "#9eb3a8", marginBottom: "6px" }}>Day Focus / Title</label>
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => handleUpdateDay(dayIndex, "title", e.target.value)}
                          style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                        />
                      </div>
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <label style={{ display: "block", fontSize: "12px", color: "#9eb3a8", marginBottom: "6px" }}>Day Summary & Reflection</label>
                      <textarea
                        rows={2}
                        value={day.description || ""}
                        onChange={(e) => handleUpdateDay(dayIndex, "description", e.target.value)}
                        placeholder="Brief summary of the day's intention and practices..."
                        style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.15)", color: "#fff" }}
                      />
                    </div>

                    {/* Sections & Activities */}
                    <div style={{ borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "16px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                        <span style={{ fontSize: "13px", fontWeight: 600, color: "#fff", textTransform: "uppercase", letterSpacing: "1px" }}>
                          Timeline & Sessions
                        </span>
                        <button
                          type="button"
                          onClick={() => handleAddSection(dayIndex)}
                          style={{ background: "transparent", border: "none", color: "var(--color-primary-light, #c69b49)", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}
                        >
                          <Plus size={13} /> Add Session Block
                        </button>
                      </div>

                      {day.sections.map((section, sIdx) => (
                        <div
                          key={sIdx}
                          style={{
                            background: "#0c130f",
                            border: "1px solid rgba(255,255,255,0.06)",
                            borderRadius: "8px",
                            padding: "16px",
                            marginBottom: "14px",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => {
                                const next = [...days];
                                next[dayIndex].sections[sIdx].title = e.target.value;
                                setDays(next);
                              }}
                              placeholder="Session Name (e.g. Morning Practice)"
                              style={{ width: "240px", padding: "6px 10px", borderRadius: "4px", background: "transparent", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "13px", fontWeight: 600 }}
                            />

                            <button
                              type="button"
                              onClick={() => handleRemoveSection(dayIndex, sIdx)}
                              style={{ background: "transparent", border: "none", color: "#f44336", cursor: "pointer", fontSize: "12px" }}
                            >
                              Remove Block
                            </button>
                          </div>

                          {/* Activities List */}
                          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                            {section.activities.map((act, aIdx) => (
                              <div key={aIdx} style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                                <div style={{ width: "110px", display: "flex", alignItems: "center", gap: "4px" }}>
                                  <Clock size={13} color="#9eb3a8" />
                                  <input
                                    type="text"
                                    value={act.startTime || ""}
                                    onChange={(e) =>
                                      handleUpdateActivity(dayIndex, sIdx, aIdx, "startTime", e.target.value)
                                    }
                                    placeholder="06:30 AM"
                                    style={{ width: "100%", padding: "6px 8px", borderRadius: "4px", background: "#16201a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "12px" }}
                                  />
                                </div>

                                <input
                                  type="text"
                                  value={act.title}
                                  onChange={(e) =>
                                    handleUpdateActivity(dayIndex, sIdx, aIdx, "title", e.target.value)
                                  }
                                  placeholder="Activity description (e.g. Jala breathwork on terrace)"
                                  style={{ flex: 1, padding: "6px 10px", borderRadius: "4px", background: "#16201a", border: "1px solid rgba(255,255,255,0.1)", color: "#fff", fontSize: "13px" }}
                                />

                                <button
                                  type="button"
                                  onClick={() => handleRemoveActivity(dayIndex, sIdx, aIdx)}
                                  style={{ background: "transparent", border: "none", color: "#888", cursor: "pointer", padding: "4px" }}
                                  title="Delete Activity"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            ))}

                            <button
                              type="button"
                              onClick={() => handleAddActivity(dayIndex, sIdx)}
                              style={{ background: "transparent", border: "none", color: "var(--color-primary-light, #c69b49)", cursor: "pointer", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px", marginTop: "6px", alignSelf: "flex-start" }}
                            >
                              <Plus size={13} /> Add Activity Item
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
