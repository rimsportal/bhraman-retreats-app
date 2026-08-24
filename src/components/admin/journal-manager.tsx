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
      content: "<p>Write your reflective essay here...</p>",
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
    <div style={{ maxWidth: "980px", margin: "0 auto", display: "grid", gap: "28px" }}>
      {/* ── TOP CONTROL & STATS BAR ── */}
      <div
        className="admin-card"
        style={{
          padding: "24px 32px",
          background: "#ffffff",
          border: "1px solid #ded9ce",
          borderRadius: "8px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px" }}>
            <BookOpen size={18} color="#7b3a34" />
            <h2 style={{ margin: 0, fontSize: "22px", color: "#1d281f" }}>
              Himalayan Journal &amp; Editorial
            </h2>
          </div>
          <p style={{ margin: 0, color: "#667768", fontSize: "13px" }}>
            Manage Dr. Pratiksha Shekhawat&apos;s essays and control whether &quot;Thoughts for the journey within&quot; appears on the homepage.
          </p>
        </div>

        {/* Master Homepage Visibility Button */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <button
            type="button"
            onClick={handleToggleHomepage}
            disabled={busy}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "8px",
              padding: "10px 18px",
              background: settings.showBlogSection ? "#e8f5e9" : "#f5f5f5",
              border: `1px solid ${settings.showBlogSection ? "#81c784" : "#cccccc"}`,
              color: settings.showBlogSection ? "#1b5e20" : "#666666",
              borderRadius: "999px",
              fontWeight: 700,
              fontSize: "12px",
              letterSpacing: "0.05em",
              cursor: "pointer",
              transition: "all 0.2s ease",
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
        <div className="admin-card">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "8px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#1d281f" }}>
                Published &amp; Draft Essays
              </h3>
              <p className="admin-note">
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
                style={{ fontSize: "12px", padding: "8px 16px" }}
              >
                <Plus size={14} /> Write New Essay
              </button>
            </div>
          </div>

          {/* Filter & Search Toolbar */}
          <div style={{ display: "flex", gap: "12px", alignItems: "center", flexWrap: "wrap", margin: "16px 0" }}>
            <div style={{ position: "relative", flex: 1, minWidth: "220px" }}>
              <Search size={14} style={{ position: "absolute", left: "12px", top: "14px", color: "#8a8178" }} />
              <input
                type="text"
                placeholder="Search essays by title or excerpt..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{ paddingLeft: "34px", fontSize: "13px" }}
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
                  borderRadius: "8px",
                  background: "#faf8f5",
                  alignItems: "center",
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
          className="admin-card"
          onSubmit={(e) => {
            e.preventDefault();
            handleSaveSettings();
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
            <div>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#1d281f" }}>
                Homepage Section Copy &amp; Visibility
              </h3>
              <p className="admin-note">
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

          <div className="admin-grid" style={{ marginTop: "16px" }}>
            <label>
              Section Eyebrow Label
              <input
                value={settings.blogLabel}
                onChange={(e) => setSettings({ ...settings, blogLabel: e.target.value })}
                placeholder="FROM THE JOURNAL"
              />
            </label>

            <label>
              Section Headline Title
              <input
                value={settings.blogTitle}
                onChange={(e) => setSettings({ ...settings, blogTitle: e.target.value })}
                placeholder="Thoughts for the journey within."
              />
            </label>
          </div>

          <label style={{ display: "block", marginTop: "16px" }}>
            Section Intro Subtitle Paragraph
            <textarea
              rows={3}
              value={settings.blogIntro}
              onChange={(e) => setSettings({ ...settings, blogIntro: e.target.value })}
              placeholder="Reflections on high-altitude medicine, elemental healing, and the transformative power of silence curated by Dr. Pratiksha Shekhawat."
            />
          </label>

          {/* Live Preview Box */}
          <div style={{ marginTop: "20px", padding: "20px", background: "#f5f2eb", border: "1px solid #ded9ce", borderRadius: "8px" }}>
            <span style={{ fontSize: "10px", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#7b3a34", display: "block", marginBottom: "6px" }}>
              HOMEPAGE LIVE PREVIEW
            </span>
            <span style={{ fontSize: "11px", fontWeight: 700, letterSpacing: "0.14em", textTransform: "uppercase", color: "#7b3a34" }}>
              {settings.blogLabel || "FROM THE JOURNAL"}
            </span>
            <h2 style={{ fontFamily: "Georgia, serif", fontSize: "28px", margin: "4px 0 10px", color: "#1d281f" }}>
              {settings.blogTitle || "Thoughts for the journey within."}
            </h2>
            <p style={{ margin: 0, fontSize: "14px", color: "#556658", lineHeight: "1.6", maxWidth: "600px" }}>
              {settings.blogIntro || "Reflections on high-altitude medicine..."}
            </p>
          </div>

          <div style={{ marginTop: "20px" }}>
            <button className="button button-dark" disabled={busy}>
              {busy ? "Saving…" : "Save Homepage Copy"}
            </button>
          </div>
        </form>
      )}

      {/* ── CREATE / EDIT ESSAY MODAL ── */}
      {isModalOpen && editingPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.6)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#ffffff",
              borderRadius: "12px",
              width: "min(860px, 100%)",
              maxHeight: "92vh",
              overflowY: "auto",
              padding: "32px",
              boxShadow: "0 24px 60px rgba(0,0,0,0.25)",
              border: "1px solid #ded9ce",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid #ded9ce", paddingBottom: "16px" }}>
              <div>
                <h3 style={{ margin: 0, fontSize: "22px", color: "#1d281f" }}>
                  {editingPost.id?.startsWith("custom-") ? "Write New Journal Essay" : "Edit Journal Essay"}
                </h3>
                <span style={{ fontSize: "12px", color: "#8a8178" }}>
                  Compose an editorial article by Dr. Pratiksha Shekhawat
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8178" }}
              >
                <X size={22} />
              </button>
            </div>

            <div style={{ display: "grid", gap: "16px" }}>
              <label>
                Essay Title (Headline) *
                <input
                  type="text"
                  value={editingPost.title || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  placeholder="e.g. The Medicine of Stillness: Returning to the Five Elements in Ladakh"
                />
              </label>

              <div className="admin-grid">
                <label>
                  URL Slug (e.g. medicine-of-stillness-ladakh)
                  <input
                    type="text"
                    value={editingPost.slug || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    placeholder="leave blank to auto-generate"
                  />
                </label>

                <label>
                  Author Attribution
                  <input
                    type="text"
                    value={editingPost.authorName || "Dr. Pratiksha Shekhawat"}
                    onChange={(e) => setEditingPost({ ...editingPost, authorName: e.target.value })}
                  />
                </label>
              </div>

              <div className="admin-grid">
                <label>
                  Cover Image URL
                  <input
                    type="text"
                    value={editingPost.coverImageUrl || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImageUrl: e.target.value })}
                    placeholder="/hero-yoga-lamayuru.jpg or https://..."
                  />
                </label>

                <label>
                  Reading Time
                  <input
                    type="text"
                    value={editingPost.readingTime || "6 min read"}
                    onChange={(e) => setEditingPost({ ...editingPost, readingTime: e.target.value })}
                    placeholder="6 min read"
                  />
                </label>
              </div>

              {/* Cover Image Quick Selectors */}
              <div style={{ background: "#faf8f5", padding: "12px 16px", borderRadius: "6px", border: "1px solid #ded9ce" }}>
                <span style={{ fontSize: "11px", fontWeight: 600, color: "#7b3a34", display: "block", marginBottom: "8px" }}>
                  QUICK SELECT SAMPLE HIMALAYAN COVERS:
                </span>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {[
                    { label: "Lamayuru Yoga", url: "/hero-yoga-lamayuru.jpg" },
                    { label: "Himalayan Dawn", url: "/hero-himalayan-dawn.png" },
                    { label: "Monastery Morning", url: "/monastery-morning.png" },
                  ].map((preset) => (
                    <button
                      key={preset.url}
                      type="button"
                      onClick={() => setEditingPost({ ...editingPost, coverImageUrl: preset.url })}
                      style={{
                        padding: "4px 10px",
                        fontSize: "11px",
                        background: editingPost.coverImageUrl === preset.url ? "#7b3a34" : "#ffffff",
                        color: editingPost.coverImageUrl === preset.url ? "#ffffff" : "#1d281f",
                        border: "1px solid #ded9ce",
                        borderRadius: "999px",
                        cursor: "pointer",
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>

              <label>
                Summary / Excerpt (Shown on Homepage Card &amp; Google Search Snippet) *
                <textarea
                  rows={2}
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="A short, evocative summary of the essay's core insight..."
                />
              </label>

              <label>
                Full Article Content (HTML / Paragraphs with &lt;p&gt;, &lt;h2&gt;, &lt;blockquote&gt;) *
                <textarea
                  rows={10}
                  value={editingPost.content || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="<p class='lead-paragraph'>Write opening reflection...</p><h2>Heading</h2><p>Body text...</p>"
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
              </label>

              <label>
                Publication Status
                <select
                  value={editingPost.publicationStatus || "PUBLISHED"}
                  onChange={(e) => setEditingPost({ ...editingPost, publicationStatus: e.target.value as any })}
                >
                  <option value="PUBLISHED">PUBLISHED (Visible to readers)</option>
                  <option value="DRAFT">DRAFT (Hidden from readers)</option>
                </select>
              </label>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px", borderTop: "1px solid #ded9ce", paddingTop: "16px" }}>
              <button
                type="button"
                className="button button-secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={busy}
              >
                Cancel
              </button>
              <button
                type="button"
                className="button button-dark"
                onClick={handleSaveModalPost}
                disabled={busy}
              >
                {busy ? "Saving…" : "Save Essay"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
