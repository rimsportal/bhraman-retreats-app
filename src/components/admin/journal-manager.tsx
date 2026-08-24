"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Check,
  Edit3,
  Eye,
  EyeOff,
  Globe,
  Image as ImageIcon,
  LayoutTemplate,
  Loader2,
  Plus,
  Quote,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  ToggleLeft,
  ToggleRight,
  Trash2,
  X,
} from "lucide-react";
import { JournalPost, PREDEFINED_JOURNAL_POSTS } from "@/lib/journal-data";

interface JournalSettings {
  showBlogSection: boolean;
  blogLabel: string;
  blogTitle: string;
  blogIntro: string;
}

const HIMALAYAN_IMAGE_PRESETS = [
  { label: "Lamayuru Yoga", url: "/hero-yoga-lamayuru.jpg" },
  { label: "Himalayan Dawn", url: "/hero-himalayan-dawn.png" },
  { label: "Monastery Morning", url: "/monastery-morning.png" },
];

export function JournalManager() {
  const [activeSubTab, setActiveSubTab] = useState<"stories" | "settings">("stories");
  const [settings, setSettings] = useState<JournalSettings>({
    showBlogSection: true,
    blogLabel: "FROM THE JOURNAL",
    blogTitle: "Thoughts for the journey within.",
    blogIntro:
      "Reflections on high-altitude medicine, elemental healing, and the transformative power of silence curated by Dr. Pratiksha Shekhawat.",
  });
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PUBLISHED" | "DRAFT">("ALL");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit / Create Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Partial<JournalPost> | null>(null);

  const flash = (msg: string) => {
    setMessage(msg);
    setError(null);
    setTimeout(() => setMessage(null), 3500);
  };

  const loadJournalData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/journal", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load journal data");
      const data = await res.json();
      if (data.settings) setSettings(data.settings);
      if (Array.isArray(data.posts)) setPosts(data.posts);
    } catch (err: any) {
      setError(err.message || "Could not fetch journal data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadJournalData();
  }, []);

  const handleSaveSettings = async (overrideSettings?: Partial<JournalSettings>) => {
    setBusy(true);
    const updatedSettings = { ...settings, ...(overrideSettings || {}) };
    try {
      const res = await fetch("/api/admin/journal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ settings: updatedSettings }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save settings");
      setSettings(updatedSettings);
      flash(
        updatedSettings.showBlogSection
          ? "✓ Journal is now ACTIVE and VISIBLE on the homepage."
          : "✓ Journal is now HIDDEN from the homepage."
      );
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setBusy(false);
    }
  };

  const handleToggleHomepage = () => {
    const nextVal = !settings.showBlogSection;
    setSettings((prev) => ({ ...prev, showBlogSection: nextVal }));
    handleSaveSettings({ showBlogSection: nextVal });
  };

  const handleToggleStatus = async (post: JournalPost) => {
    const nextStatus = post.publicationStatus === "DRAFT" ? "PUBLISHED" : "DRAFT";
    const updatedPosts = posts.map((p) =>
      p.id === post.id || p.slug === post.slug ? { ...p, publicationStatus: nextStatus as any } : p
    );
    setPosts(updatedPosts);

    try {
      const res = await fetch("/api/admin/journal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posts: [{ ...post, publicationStatus: nextStatus }],
        }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to update status");
      flash(`"${post.title}" is now ${nextStatus}.`);
    } catch (err: any) {
      setError(err.message || "Failed to update status");
      loadJournalData();
    }
  };

  const handleDeletePost = async (post: JournalPost) => {
    if (!confirm(`Are you sure you want to delete the essay "${post.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/journal?id=${post.id || ""}&slug=${post.slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete");
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug && p.id !== post.id));
      flash(`Essay "${post.title}" deleted.`);
    } catch (err: any) {
      setError(err.message || "Failed to delete essay");
    }
  };

  const handleOpenAddModal = () => {
    setEditingPost({
      id: `custom-${Date.now()}`,
      slug: "",
      title: "",
      excerpt: "",
      content: `<p class="lead-paragraph">In the quiet heights of Ladakh, where the air is pure and silence reigns, healing begins naturally...</p>\n\n<h2>The Healing Elements</h2>\n<p>When we align our rhythm with nature, our mind and body restore their innate balance.</p>\n\n<blockquote>"Nature holds everything we need to heal. We only have to learn how to listen again."</blockquote>`,
      authorName: "Dr. Pratiksha Shekhawat",
      coverImageUrl: "/hero-yoga-lamayuru.jpg",
      readingTime: "6 min read",
      category: "Elemental Medicine",
      publicationStatus: "PUBLISHED",
      publishedAt: new Date().toISOString(),
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (post: JournalPost) => {
    setEditingPost({ ...post });
    setIsModalOpen(true);
  };

  const handleInsertSnippet = (snippet: string) => {
    if (!editingPost) return;
    setEditingPost({
      ...editingPost,
      content: (editingPost.content || "") + "\n\n" + snippet,
    });
  };

  const handleSaveModalPost = async () => {
    if (!editingPost || !editingPost.title?.trim()) {
      alert("Please enter a title for the essay.");
      return;
    }
    const slug =
      editingPost.slug?.trim() ||
      editingPost.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)+/g, "");

    const postToSave: JournalPost = {
      id: editingPost.id || `post-${Date.now()}`,
      slug,
      title: editingPost.title.trim(),
      excerpt: editingPost.excerpt?.trim() || "",
      content: editingPost.content || "",
      coverImageUrl: editingPost.coverImageUrl || "/hero-yoga-lamayuru.jpg",
      authorName: editingPost.authorName || "Dr. Pratiksha Shekhawat",
      readingTime: editingPost.readingTime || "6 min read",
      category: editingPost.category || "Himalayan Wisdom",
      publicationStatus: editingPost.publicationStatus || "PUBLISHED",
      publishedAt: editingPost.publishedAt || new Date().toISOString(),
    };

    setBusy(true);
    try {
      const res = await fetch("/api/admin/journal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: [postToSave] }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save essay");

      setPosts((prev) => {
        const index = prev.findIndex((p) => p.slug === postToSave.slug || p.id === postToSave.id);
        if (index >= 0) {
          const clone = [...prev];
          clone[index] = postToSave;
          return clone;
        }
        return [postToSave, ...prev];
      });

      setIsModalOpen(false);
      setEditingPost(null);
      flash(`Essay "${postToSave.title}" saved successfully.`);
    } catch (err: any) {
      setError(err.message || "Failed to save essay");
    } finally {
      setBusy(false);
    }
  };

  const handleResetDefaults = async () => {
    if (!confirm("Reset journal to the 3 original Himalayan essays by Dr. Pratiksha Shekhawat?")) return;
    try {
      const res = await fetch("/api/admin/journal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: PREDEFINED_JOURNAL_POSTS }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to reset");
      setPosts(PREDEFINED_JOURNAL_POSTS);
      flash("Journal stories reset to original Himalayan essays.");
    } catch (err: any) {
      setError(err.message || "Failed to reset");
    }
  };

  const filteredPosts = useMemo(() => {
    return posts.filter((p) => {
      const matchesSearch =
        !search.trim() ||
        p.title.toLowerCase().includes(search.toLowerCase()) ||
        p.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        p.slug.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "PUBLISHED" && p.publicationStatus !== "DRAFT") ||
        (statusFilter === "DRAFT" && p.publicationStatus === "DRAFT");

      return matchesSearch && matchesStatus;
    });
  }, [posts, search, statusFilter]);

  const publishedCount = posts.filter((p) => p.publicationStatus !== "DRAFT").length;
  const draftCount = posts.filter((p) => p.publicationStatus === "DRAFT").length;

  if (loading) {
    return (
      <div className="admin-loading">
        <Loader2 className="animate-spin" size={20} />
        <span>Loading Journal &amp; Editorial Manager…</span>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "980px", margin: "0 auto", display: "grid", gap: "24px" }}>
      {/* ── TOP CONTROL & STATS BAR ── */}
      <div
        style={{
          padding: "24px 32px",
          background: "#ffffff",
          border: "1px solid #ded9ce",
          borderRadius: "12px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
          boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <BookOpen size={20} color="#7b3a34" />
            <h2 style={{ margin: 0, fontSize: "22px", color: "#1d281f", fontWeight: 600 }}>
              Himalayan Journal &amp; Editorial
            </h2>
          </div>
          <p style={{ margin: 0, color: "#667768", fontSize: "13px" }}>
            Manage Dr. Pratiksha Shekhawat&apos;s essays and control whether &quot;Thoughts for the journey within&quot; appears on the homepage.
          </p>
        </div>

        {/* Master Homepage Visibility Button */}
        <div>
          <button
            type="button"
            onClick={handleToggleHomepage}
            disabled={busy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 20px",
              background: settings.showBlogSection ? "#e8f5e9" : "#f5f5f5",
              border: `1.5px solid ${settings.showBlogSection ? "#81c784" : "#cccccc"}`,
              color: settings.showBlogSection ? "#1b5e20" : "#666666",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.06em",
              cursor: "pointer",
              transition: "all 0.2s ease",
              boxShadow: settings.showBlogSection ? "0 2px 6px rgba(46,125,50,0.15)" : "none",
            }}
          >
            {settings.showBlogSection ? (
              <>
                <ToggleRight size={18} color="#2e7d32" />
                <span>HOMEPAGE: VISIBLE (ON)</span>
              </>
            ) : (
              <>
                <ToggleLeft size={18} color="#888888" />
                <span>HOMEPAGE: HIDDEN (OFF)</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* ── NOTIFICATIONS ── */}
      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {/* ── SUB-NAVIGATION TABS ── */}
      <div style={{ display: "flex", gap: "10px", borderBottom: "1px solid #ded9ce", paddingBottom: "12px" }}>
        <button
          type="button"
          onClick={() => setActiveSubTab("stories")}
          style={{
            padding: "8px 20px",
            border: "1px solid",
            borderColor: activeSubTab === "stories" ? "#7b3a34" : "#ded9ce",
            background: activeSubTab === "stories" ? "#7b3a34" : "#ffffff",
            color: activeSubTab === "stories" ? "#ffffff" : "#1d281f",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <BookOpen size={14} />
          <span>Journal Stories ({posts.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveSubTab("settings")}
          style={{
            padding: "8px 20px",
            border: "1px solid",
            borderColor: activeSubTab === "settings" ? "#7b3a34" : "#ded9ce",
            background: activeSubTab === "settings" ? "#7b3a34" : "#ffffff",
            color: activeSubTab === "settings" ? "#ffffff" : "#1d281f",
            borderRadius: "999px",
            fontSize: "12px",
            fontWeight: 600,
            cursor: "pointer",
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <LayoutTemplate size={14} />
          <span>Homepage Section Copy &amp; Toggle</span>
        </button>
      </div>

      {/* ── SUB-TAB 1: JOURNAL STORIES ── */}
      {activeSubTab === "stories" && (
        <div
          style={{
            background: "#ffffff",
            border: "1px solid #ded9ce",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "19px", color: "#1d281f", fontWeight: 600 }}>
                Published &amp; Draft Essays
              </h3>
              <p style={{ margin: 0, color: "#667768", fontSize: "13px" }}>
                The first 3 published essays appear in the homepage magazine layout. All published essays are viewable at their permanent URL.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={handleResetDefaults}
                style={{ fontSize: "11px", padding: "8px 14px" }}
              >
                <RotateCcw size={13} /> Reset 3 Default Essays
              </button>
              <button
                type="button"
                className="button button-dark"
                onClick={handleOpenAddModal}
                style={{ fontSize: "12px", padding: "8px 18px" }}
              >
                <Plus size={14} /> Write New Essay
              </button>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", margin: "16px 0 20px" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "14px", color: "#8a8178" }} />
              <input
                type="text"
                placeholder="Search essays by title or excerpt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px 10px 34px",
                  border: "1px solid #ded9ce",
                  borderRadius: "8px",
                  fontSize: "13px",
                  background: "#faf8f5",
                }}
              />
            </div>

            {/* Status Pills */}
            <div style={{ display: "flex", gap: "6px" }}>
              {(["ALL", "PUBLISHED", "DRAFT"] as const).map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setStatusFilter(st)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "999px",
                    border: "1px solid",
                    borderColor: statusFilter === st ? "#7b3a34" : "#ded9ce",
                    background: statusFilter === st ? "rgba(123, 58, 52, 0.1)" : "#ffffff",
                    color: statusFilter === st ? "#7b3a34" : "#667768",
                    fontSize: "11px",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  {st === "ALL" ? `All (${posts.length})` : st === "PUBLISHED" ? `Published (${publishedCount})` : `Drafts (${draftCount})`}
                </button>
              ))}
            </div>
          </div>

          {/* Stories List */}
          <div style={{ display: "grid", gap: "14px" }}>
            {filteredPosts.map((post, idx) => (
              <div
                key={post.id || post.slug}
                style={{
                  display: "flex",
                  gap: "18px",
                  padding: "18px",
                  border: "1px solid #ded9ce",
                  borderRadius: "10px",
                  background: "#faf8f5",
                  alignItems: "center",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.02)",
                }}
              >
                {/* Number & Cover Thumbnail */}
                <span style={{ fontSize: "14px", fontWeight: 700, color: "#8a8178", width: "20px" }}>
                  #{idx + 1}
                </span>

                <div
                  style={{
                    width: "110px",
                    height: "75px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#000",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl || "/hero-yoga-lamayuru.jpg"}
                    alt={post.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Essay Meta & Headline */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "999px",
                        fontSize: "9px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        background: post.publicationStatus === "DRAFT" ? "#fef3c7" : "#dcfce7",
                        color: post.publicationStatus === "DRAFT" ? "#92400e" : "#166534",
                      }}
                    >
                      {post.publicationStatus || "PUBLISHED"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#8a8178" }}>·</span>
                    <span style={{ fontSize: "11px", color: "#7b3a34", fontWeight: 600 }}>{post.authorName}</span>
                    <span style={{ fontSize: "11px", color: "#8a8178" }}>·</span>
                    <span style={{ fontSize: "11px", color: "#8a8178" }}>{post.readingTime || "5 min read"}</span>
                  </div>

                  <h4 style={{ margin: "0 0 4px", fontSize: "16px", color: "#1d281f", fontWeight: 600 }}>
                    {post.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "12.5px",
                      color: "#667768",
                      lineHeight: "1.4",
                      display: "-webkit-box",
                      WebkitLineClamp: 1,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {post.excerpt}
                  </p>
                </div>

                {/* Actions */}
                <div style={{ display: "flex", gap: "8px", alignItems: "center", flexShrink: 0 }}>
                  <button
                    type="button"
                    title={post.publicationStatus === "DRAFT" ? "Publish Story" : "Move to Draft"}
                    onClick={() => handleToggleStatus(post)}
                    style={{
                      padding: "7px 12px",
                      border: "1px solid #ded9ce",
                      borderRadius: "999px",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: post.publicationStatus === "DRAFT" ? "#166534" : "#92400e",
                    }}
                  >
                    {post.publicationStatus === "DRAFT" ? <Eye size={12} /> : <EyeOff size={12} />}
                    <span>{post.publicationStatus === "DRAFT" ? "Publish" : "Draft"}</span>
                  </button>

                  <button
                    type="button"
                    title="Edit Story"
                    onClick={() => handleOpenEditModal(post)}
                    style={{
                      padding: "7px 14px",
                      border: "1px solid #ded9ce",
                      borderRadius: "999px",
                      background: "#ffffff",
                      cursor: "pointer",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#1d281f",
                    }}
                  >
                    <Edit3 size={12} /> Edit
                  </button>

                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    style={{
                      padding: "7px 12px",
                      border: "1px solid #ded9ce",
                      borderRadius: "999px",
                      background: "#ffffff",
                      textDecoration: "none",
                      fontSize: "11px",
                      fontWeight: 600,
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#7b3a34",
                    }}
                  >
                    <ArrowUpRight size={12} /> Preview
                  </Link>

                  <button
                    type="button"
                    title="Delete Story"
                    onClick={() => handleDeletePost(post)}
                    style={{
                      padding: "7px 10px",
                      border: "1px solid #fecaca",
                      borderRadius: "999px",
                      background: "#fff1f2",
                      cursor: "pointer",
                      color: "#b91c1c",
                    }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            ))}

            {filteredPosts.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#8a8178", background: "#fcfbfa", borderRadius: "8px", border: "1px dashed #ded9ce" }}>
                No essays found. Click <strong>&quot;Write New Essay&quot;</strong> above to create one.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── SUB-TAB 2: HOMEPAGE SECTION SETTINGS ── */}
      {activeSubTab === "settings" && (
        <form
          style={{
            background: "#ffffff",
            border: "1px solid #ded9ce",
            borderRadius: "12px",
            padding: "28px",
            boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
            display: "grid",
            gap: "20px",
          }}
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveSettings();
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3 style={{ margin: "0 0 4px", fontSize: "19px", color: "#1d281f", fontWeight: 600 }}>
                Homepage Section Copy &amp; Visibility
              </h3>
              <p style={{ margin: 0, color: "#667768", fontSize: "13px" }}>
                Configure the headline, subtitle, and toggle whether the Journal section is shown on the homepage.
              </p>
            </div>

            <button
              type="button"
              onClick={handleToggleHomepage}
              disabled={busy}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 16px",
                background: settings.showBlogSection ? "#e8f5e9" : "#f5f5f5",
                border: `1px solid ${settings.showBlogSection ? "#81c784" : "#cccccc"}`,
                color: settings.showBlogSection ? "#1b5e20" : "#666666",
                borderRadius: "999px",
                fontWeight: 700,
                fontSize: "11.5px",
                cursor: "pointer",
              }}
            >
              {settings.showBlogSection ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
              <span>{settings.showBlogSection ? "ACTIVE ON HOMEPAGE" : "HIDDEN FROM HOMEPAGE"}</span>
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                Section Eyebrow Label
              </label>
              <input
                value={settings.blogLabel}
                onChange={(e) => setSettings({ ...settings, blogLabel: e.target.value })}
                placeholder="FROM THE JOURNAL"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #ded9ce",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#faf8f5",
                }}
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                Section Headline Title
              </label>
              <input
                value={settings.blogTitle}
                onChange={(e) => setSettings({ ...settings, blogTitle: e.target.value })}
                placeholder="Thoughts for the journey within."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #ded9ce",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#faf8f5",
                }}
              />
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
              Section Intro Subtitle Paragraph
            </label>
            <textarea
              rows={3}
              value={settings.blogIntro}
              onChange={(e) => setSettings({ ...settings, blogIntro: e.target.value })}
              placeholder="Reflections on high-altitude medicine, elemental healing, and the transformative power of silence curated by Dr. Pratiksha Shekhawat."
              style={{
                width: "100%",
                padding: "12px 14px",
                border: "1px solid #ded9ce",
                borderRadius: "8px",
                fontSize: "14px",
                background: "#faf8f5",
                lineHeight: "1.6",
              }}
            />
          </div>

          {/* Live Preview Box */}
          <div style={{ padding: "20px 24px", background: "#f5f2eb", border: "1px solid #ded9ce", borderRadius: "10px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7b3a34", display: "block", marginBottom: "4px" }}>
              HOMEPAGE LIVE PREVIEW
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7b3a34" }}>
              {settings.blogLabel || "FROM THE JOURNAL"}
            </span>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "26px", margin: "4px 0 8px", color: "#1d281f" }}>
              {settings.blogTitle || "Thoughts for the journey within."}
            </h2>
            <p style={{ margin: 0, fontSize: "13.5px", color: "#556658", lineHeight: "1.6", maxWidth: "600px" }}>
              {settings.blogIntro || "Reflections on high-altitude medicine..."}
            </p>
          </div>

          <div>
            <button className="button button-dark" disabled={busy}>
              {busy ? "Saving…" : "Save Homepage Copy"}
            </button>
          </div>
        </form>
      )}

      {/* ── LUXURY REDESIGNED ESSAY MODAL ── */}
      {isModalOpen && editingPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(18, 26, 20, 0.65)",
            backdropFilter: "blur(6px)",
            WebkitBackdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "16px",
              width: "min(880px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "36px",
              boxShadow: "0 25px 60px -10px rgba(0,0,0,0.3)",
              border: "1px solid #ded9ce",
              display: "flex",
              flexDirection: "column",
              gap: "22px",
            }}
          >
            {/* Modal Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", borderBottom: "1px solid #ded9ce", paddingBottom: "18px" }}>
              <div>
                <h3 style={{ margin: "0 0 4px", fontSize: "24px", color: "#1d281f", fontFamily: "Georgia, serif", fontWeight: 600 }}>
                  {editingPost.id?.startsWith("custom-") ? "Write New Journal Essay" : "Edit Journal Essay"}
                </h3>
                <span style={{ fontSize: "13px", color: "#667768" }}>
                  Compose an authentic Himalayan reflection authored by Dr. Pratiksha Shekhawat.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "#f5f2eb",
                  border: "1px solid #ded9ce",
                  borderRadius: "50%",
                  width: "34px",
                  height: "34px",
                  display: "grid",
                  placeItems: "center",
                  cursor: "pointer",
                  color: "#1d281f",
                }}
              >
                <X size={18} />
              </button>
            </div>

            {/* 1. Essay Title */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                Essay Title (Headline) *
              </label>
              <input
                type="text"
                value={editingPost.title || ""}
                onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                placeholder="e.g. The Medicine of Stillness: Returning to the Five Elements in Ladakh"
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  border: "1px solid #ded9ce",
                  borderRadius: "8px",
                  fontSize: "15px",
                  background: "#faf8f5",
                  fontWeight: 500,
                  color: "#1d281f",
                }}
              />
            </div>

            {/* 2. URL Slug & Author Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                  URL Slug
                </label>
                <input
                  type="text"
                  value={editingPost.slug || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                  placeholder="leave blank to auto-generate from title"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #ded9ce",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    background: "#faf8f5",
                    color: "#1d281f",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                  Author Attribution
                </label>
                <input
                  type="text"
                  value={editingPost.authorName || "Dr. Pratiksha Shekhawat"}
                  onChange={(e) => setEditingPost({ ...editingPost, authorName: e.target.value })}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #ded9ce",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    background: "#faf8f5",
                    color: "#1d281f",
                  }}
                />
              </div>
            </div>

            {/* 3. Category & Reading Time Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                  Category Tag
                </label>
                <input
                  type="text"
                  value={editingPost.category || "Elemental Medicine"}
                  onChange={(e) => setEditingPost({ ...editingPost, category: e.target.value })}
                  placeholder="e.g. Elemental Medicine, High Altitude Nutrition"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #ded9ce",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    background: "#faf8f5",
                    color: "#1d281f",
                  }}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                  Estimated Reading Time
                </label>
                <input
                  type="text"
                  value={editingPost.readingTime || "6 min read"}
                  onChange={(e) => setEditingPost({ ...editingPost, readingTime: e.target.value })}
                  placeholder="6 min read"
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    border: "1px solid #ded9ce",
                    borderRadius: "8px",
                    fontSize: "13.5px",
                    background: "#faf8f5",
                    color: "#1d281f",
                  }}
                />
              </div>
            </div>

            {/* 4. Cover Image with Live Photo Preview */}
            <div
              style={{
                background: "#faf8f5",
                border: "1px solid #ded9ce",
                borderRadius: "10px",
                padding: "18px",
                display: "flex",
                flexDirection: "column",
                gap: "12px",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34", margin: 0 }}>
                  Cover Image URL
                </label>
                <span style={{ fontSize: "11px", color: "#667768" }}>Choose sample or enter custom URL</span>
              </div>

              <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
                {/* Live Preview Box */}
                <div
                  style={{
                    width: "120px",
                    height: "75px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    background: "#000",
                    flexShrink: 0,
                    border: "1px solid #ded9ce",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editingPost.coverImageUrl || "/hero-yoga-lamayuru.jpg"}
                    alt="Cover preview"
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "8px" }}>
                  <input
                    type="text"
                    value={editingPost.coverImageUrl || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImageUrl: e.target.value })}
                    placeholder="/hero-yoga-lamayuru.jpg or https://..."
                    style={{
                      width: "100%",
                      padding: "10px 14px",
                      border: "1px solid #ded9ce",
                      borderRadius: "8px",
                      fontSize: "13.5px",
                      background: "#ffffff",
                    }}
                  />

                  {/* Preset Pills */}
                  <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                    {HIMALAYAN_IMAGE_PRESETS.map((preset) => (
                      <button
                        key={preset.url}
                        type="button"
                        onClick={() => setEditingPost({ ...editingPost, coverImageUrl: preset.url })}
                        style={{
                          padding: "4px 12px",
                          fontSize: "11px",
                          fontWeight: 600,
                          background: editingPost.coverImageUrl === preset.url ? "#7b3a34" : "#ffffff",
                          color: editingPost.coverImageUrl === preset.url ? "#ffffff" : "#1d281f",
                          border: "1px solid",
                          borderColor: editingPost.coverImageUrl === preset.url ? "#7b3a34" : "#ded9ce",
                          borderRadius: "999px",
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

            {/* 5. Summary Excerpt */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                Summary / Excerpt (Shown on Homepage Card &amp; Google Search Snippet) *
              </label>
              <textarea
                rows={3}
                value={editingPost.excerpt || ""}
                onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                placeholder="A short, evocative summary of the essay's core insight..."
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #ded9ce",
                  borderRadius: "8px",
                  fontSize: "14px",
                  background: "#faf8f5",
                  lineHeight: "1.6",
                }}
              />
            </div>

            {/* 6. Article Body with Formatting Snippets */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px" }}>
                <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34", margin: 0 }}>
                  Article Body (HTML / Paragraphs) *
                </label>
                <div style={{ display: "flex", gap: "6px" }}>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet("<h2>New Section Heading</h2>\n<p>Add narrative text here...</p>")}
                    style={{ padding: "3px 8px", fontSize: "10px", fontWeight: 600, border: "1px solid #ded9ce", background: "#f5f2eb", borderRadius: "4px", cursor: "pointer" }}
                  >
                    + Add &lt;h2&gt;
                  </button>
                  <button
                    type="button"
                    onClick={() => handleInsertSnippet("<blockquote>\"Add reflective quote or Sanskrit passage here...\"</blockquote>")}
                    style={{ padding: "3px 8px", fontSize: "10px", fontWeight: 600, border: "1px solid #ded9ce", background: "#f5f2eb", borderRadius: "4px", cursor: "pointer" }}
                  >
                    + Add &lt;blockquote&gt;
                  </button>
                </div>
              </div>

              <textarea
                rows={9}
                value={editingPost.content || ""}
                onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                placeholder="<p class='lead-paragraph'>Write opening reflection...</p><h2>Heading</h2><p>Body text...</p>"
                style={{
                  width: "100%",
                  padding: "12px 14px",
                  border: "1px solid #ded9ce",
                  borderRadius: "8px",
                  fontFamily: "monospace",
                  fontSize: "13px",
                  background: "#faf8f5",
                  lineHeight: "1.7",
                }}
              />
            </div>

            {/* 7. Publication Status */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              <label style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase", color: "#7b3a34" }}>
                Publication Status
              </label>
              <select
                value={editingPost.publicationStatus || "PUBLISHED"}
                onChange={(e) => setEditingPost({ ...editingPost, publicationStatus: e.target.value as any })}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  border: "1px solid #ded9ce",
                  borderRadius: "8px",
                  background: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  color: "#1d281f",
                }}
              >
                <option value="PUBLISHED">PUBLISHED (Visible on website and homepage)</option>
                <option value="DRAFT">DRAFT (Saved privately, hidden from readers)</option>
              </select>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #ded9ce", paddingTop: "18px" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={busy}
                style={{ padding: "10px 22px", fontSize: "12px" }}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-dark"
                onClick={handleSaveModalPost}
                disabled={busy}
                style={{ padding: "10px 24px", fontSize: "12px" }}
              >
                {busy ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                <span>Save Essay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
