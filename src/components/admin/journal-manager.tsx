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
  const [settings, setSettings] = useState<JournalSettings>({
    showBlogSection: true,
    blogLabel: "FROM THE JOURNAL",
    blogTitle: "Thoughts for the journey within.",
    blogIntro:
      "Reflections on high-altitude medicine, elemental healing, and the transformative power of silence curated by Dr. Pratiksha Shekhawat.",
  });
  const [posts, setPosts] = useState<JournalPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingPost, setSavingPost] = useState(false);
  const [search, setSearch] = useState("");
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
    setSavingSettings(true);
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
          ? "Journal is now ACTIVE on the homepage."
          : "Journal section is now HIDDEN on the homepage."
      );
    } catch (err: any) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSavingSettings(false);
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
      if (!res.ok) throw new Error("Failed to update publication status");
      flash(`"${post.title}" is now ${nextStatus}.`);
    } catch (err: any) {
      setError(err.message || "Failed to update post status");
      loadJournalData();
    }
  };

  const handleDeletePost = async (post: JournalPost) => {
    if (!confirm(`Are you sure you want to delete "${post.title}"?`)) return;
    try {
      const res = await fetch(`/api/admin/journal?id=${post.id || ""}&slug=${post.slug}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to delete story");
      setPosts((prev) => prev.filter((p) => p.slug !== post.slug && p.id !== post.id));
      flash(`Story "${post.title}" deleted.`);
    } catch (err: any) {
      setError(err.message || "Failed to delete post");
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
      readingTime: "5 min read",
      category: "Himalayan Wisdom",
      publicationStatus: "PUBLISHED" as any,
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
      alert("Please enter a title for the story.");
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
      readingTime: editingPost.readingTime || "5 min read",
      category: editingPost.category || "Himalayan Wisdom",
      publicationStatus: (editingPost.publicationStatus as any) || "PUBLISHED",
      publishedAt: editingPost.publishedAt || new Date().toISOString(),
    };

    setSavingPost(true);
    try {
      const res = await fetch("/api/admin/journal", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ posts: [postToSave] }),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to save story");

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
      flash(`Story "${postToSave.title}" saved successfully.`);
    } catch (err: any) {
      setError(err.message || "Failed to save story");
    } finally {
      setSavingPost(false);
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
    if (!search.trim()) return posts;
    const q = search.toLowerCase();
    return posts.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q)
    );
  }, [posts, search]);

  if (loading) {
    return (
      <div className="admin-faq-loading">
        <Loader2 className="animate-spin" size={24} />
        <span>Loading Himalayan Journal & Editorial...</span>
      </div>
    );
  }

  return (
    <div className="admin-founder-story-v2">
      {/* Header Banner */}
      <div className="admin-founder-header">
        <div className="header-badge">
          <BookOpen size={14} />
          <span>EDITORIAL & ESSAYS</span>
        </div>
        <h2>Himalayan Journal Manager</h2>
        <p>
          Control the <strong>&quot;Thoughts for the journey within&quot;</strong> section, toggle its visibility on the homepage, and manage Dr. Pratiksha Shekhawat&apos;s essays.
        </p>
      </div>

      {/* Notifications */}
      {message && (
        <div className="admin-alert admin-alert-success">
          <Check size={16} />
          <span>{message}</span>
        </div>
      )}
      {error && (
        <div className="admin-alert admin-alert-error">
          <X size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Section 1: Homepage Visibility & Section Heading Card */}
      <div className="admin-card-v2">
        <div className="card-header-v2">
          <div>
            <h3>Homepage Display & Section Copy</h3>
            <p>Customize the headline, subtitle, and choose whether to show or hide the entire Journal on the homepage.</p>
          </div>
        </div>

        <div className="card-body-v2">
          {/* Master Toggle */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "16px 20px",
              background: settings.showBlogSection ? "rgba(123, 58, 52, 0.06)" : "#f5f5f5",
              border: `1px solid ${settings.showBlogSection ? "rgba(123, 58, 52, 0.25)" : "#e0e0e0"}`,
              borderRadius: "12px",
              marginBottom: "24px",
            }}
          >
            <div>
              <strong style={{ display: "block", fontSize: "15px", color: "#1d281f", marginBottom: "4px" }}>
                Show Journal Section on Homepage
              </strong>
              <span style={{ fontSize: "13px", color: "#667768" }}>
                {settings.showBlogSection
                  ? "Section is currently VISIBLE on the homepage above the enquiry form."
                  : "Section is currently HIDDEN from the homepage."}
              </span>
            </div>

            <button
              type="button"
              onClick={handleToggleHomepage}
              disabled={savingSettings}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "8px",
                padding: "8px 18px",
                background: settings.showBlogSection ? "#7b3a34" : "#e0e0e0",
                color: settings.showBlogSection ? "#ffffff" : "#666666",
                border: "none",
                borderRadius: "999px",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {settings.showBlogSection ? (
                <>
                  <ToggleRight size={18} /> ACTIVE ON HOMEPAGE
                </>
              ) : (
                <>
                  <ToggleLeft size={18} /> HIDDEN
                </>
              )}
            </button>
          </div>

          {/* Section Inputs Grid */}
          <div className="form-grid-v2">
            <div className="form-group-v2">
              <label>Section Eyebrow Label</label>
              <input
                type="text"
                value={settings.blogLabel}
                onChange={(e) => setSettings({ ...settings, blogLabel: e.target.value })}
                placeholder="FROM THE JOURNAL"
              />
            </div>

            <div className="form-group-v2">
              <label>Section Title (Headline)</label>
              <input
                type="text"
                value={settings.blogTitle}
                onChange={(e) => setSettings({ ...settings, blogTitle: e.target.value })}
                placeholder="Thoughts for the journey within."
              />
            </div>
          </div>

          <div className="form-group-v2" style={{ marginTop: "16px" }}>
            <label>Section Intro / Subtitle</label>
            <textarea
              rows={2}
              value={settings.blogIntro}
              onChange={(e) => setSettings({ ...settings, blogIntro: e.target.value })}
              placeholder="Reflections on high-altitude medicine, elemental healing, and the transformative power of silence curated by Dr. Pratiksha Shekhawat."
            />
          </div>

          <div style={{ marginTop: "20px", display: "flex", justifyContent: "flex-end" }}>
            <button
              type="button"
              className="admin-btn admin-btn-primary"
              onClick={() => handleSaveSettings()}
              disabled={savingSettings}
            >
              {savingSettings ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              <span>Save Section Copy</span>
            </button>
          </div>
        </div>
      </div>

      {/* Section 2: Manage Journal Stories */}
      <div className="admin-card-v2" style={{ marginTop: "32px" }}>
        <div className="card-header-v2">
          <div>
            <h3>Journal Stories & Essays ({posts.length})</h3>
            <p>Publish, draft, edit or add essays. The top 3 published essays appear in the homepage magazine grid.</p>
          </div>

          <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
            <button type="button" className="admin-btn admin-btn-secondary" onClick={handleResetDefaults}>
              <RotateCcw size={14} /> Reset Defaults
            </button>
            <button type="button" className="admin-btn admin-btn-primary" onClick={handleOpenAddModal}>
              <Plus size={15} /> Write New Essay
            </button>
          </div>
        </div>

        <div className="card-body-v2">
          {/* Search bar */}
          <div style={{ marginBottom: "20px", position: "relative" }}>
            <Search size={16} style={{ position: "absolute", left: "14px", top: "12px", color: "#8a8178" }} />
            <input
              type="text"
              placeholder="Search essays by title or excerpt..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                width: "100%",
                padding: "10px 14px 10px 38px",
                border: "1px solid #e2ddd3",
                borderRadius: "10px",
                background: "#ffffff",
                fontSize: "14px",
              }}
            />
          </div>

          {/* Posts List */}
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {filteredPosts.map((post, idx) => (
              <div
                key={post.id || post.slug}
                style={{
                  display: "flex",
                  gap: "18px",
                  padding: "16px",
                  background: "#ffffff",
                  border: "1px solid #e2ddd3",
                  borderRadius: "14px",
                  alignItems: "center",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                }}
              >
                {/* Thumb */}
                <div
                  style={{
                    width: "90px",
                    height: "70px",
                    borderRadius: "8px",
                    overflow: "hidden",
                    flexShrink: 0,
                    background: "#e8e5de",
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={post.coverImageUrl || "/hero-yoga-lamayuru.jpg"}
                    alt={post.title}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                  />
                </div>

                {/* Details */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                    <span
                      style={{
                        fontSize: "10px",
                        fontWeight: 700,
                        letterSpacing: "0.08em",
                        textTransform: "uppercase",
                        padding: "2px 8px",
                        borderRadius: "999px",
                        background: post.publicationStatus === "DRAFT" ? "#fef3c7" : "#dcfce7",
                        color: post.publicationStatus === "DRAFT" ? "#92400e" : "#166534",
                      }}
                    >
                      {post.publicationStatus || "PUBLISHED"}
                    </span>
                    <span style={{ fontSize: "11px", color: "#8a8178" }}>·</span>
                    <span style={{ fontSize: "11px", color: "#8a8178" }}>{post.authorName}</span>
                    <span style={{ fontSize: "11px", color: "#8a8178" }}>·</span>
                    <span style={{ fontSize: "11px", color: "#8a8178" }}>{post.readingTime || "5 min read"}</span>
                  </div>

                  <h4 style={{ margin: "0 0 4px", fontSize: "16px", color: "#1d281f", fontWeight: 600 }}>
                    {post.title}
                  </h4>
                  <p
                    style={{
                      margin: 0,
                      fontSize: "13px",
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
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <button
                    type="button"
                    title={post.publicationStatus === "DRAFT" ? "Publish Story" : "Move to Draft"}
                    onClick={() => handleToggleStatus(post)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ded9ce",
                      borderRadius: "8px",
                      background: "#fdfbf7",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: post.publicationStatus === "DRAFT" ? "#166534" : "#92400e",
                    }}
                  >
                    {post.publicationStatus === "DRAFT" ? <Eye size={13} /> : <EyeOff size={13} />}
                    <span>{post.publicationStatus === "DRAFT" ? "Publish" : "Draft"}</span>
                  </button>

                  <button
                    type="button"
                    title="Edit Story"
                    onClick={() => handleOpenEditModal(post)}
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ded9ce",
                      borderRadius: "8px",
                      background: "#fdfbf7",
                      cursor: "pointer",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#1d281f",
                    }}
                  >
                    <Edit3 size={13} /> Edit
                  </button>

                  <Link
                    href={`/blog/${post.slug}`}
                    target="_blank"
                    style={{
                      padding: "8px 12px",
                      border: "1px solid #ded9ce",
                      borderRadius: "8px",
                      background: "#fdfbf7",
                      textDecoration: "none",
                      fontSize: "12px",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      color: "#7b3a34",
                    }}
                  >
                    <ArrowUpRight size={13} /> Preview
                  </Link>

                  <button
                    type="button"
                    title="Delete Story"
                    onClick={() => handleDeletePost(post)}
                    style={{
                      padding: "8px",
                      border: "1px solid #fecaca",
                      borderRadius: "8px",
                      background: "#fff1f2",
                      cursor: "pointer",
                      color: "#b91c1c",
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}

            {filteredPosts.length === 0 && (
              <div style={{ textAlign: "center", padding: "32px", color: "#8a8178" }}>
                No essays found matching &quot;{search}&quot;.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && editingPost && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.55)",
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
              borderRadius: "16px",
              width: "min(850px, 100%)",
              maxHeight: "90vh",
              overflowY: "auto",
              padding: "28px",
              boxShadow: "0 20px 50px rgba(0,0,0,0.2)",
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <h3 style={{ margin: 0, fontSize: "20px", color: "#1d281f" }}>
                {editingPost.id?.startsWith("custom-") ? "Write New Journal Essay" : "Edit Journal Essay"}
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#8a8178" }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div className="form-group-v2">
                <label>Story Headline / Title *</label>
                <input
                  type="text"
                  value={editingPost.title || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                  placeholder="e.g. The Medicine of Stillness: Returning to the Five Elements in Ladakh"
                />
              </div>

              <div className="form-grid-v2">
                <div className="form-group-v2">
                  <label>URL Slug (e.g. medicine-of-stillness-ladakh)</label>
                  <input
                    type="text"
                    value={editingPost.slug || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, slug: e.target.value })}
                    placeholder="leave blank to auto-generate"
                  />
                </div>

                <div className="form-group-v2">
                  <label>Author Attribution</label>
                  <input
                    type="text"
                    value={editingPost.authorName || "Dr. Pratiksha Shekhawat"}
                    onChange={(e) => setEditingPost({ ...editingPost, authorName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-grid-v2">
                <div className="form-group-v2">
                  <label>Cover Image URL</label>
                  <input
                    type="text"
                    value={editingPost.coverImageUrl || ""}
                    onChange={(e) => setEditingPost({ ...editingPost, coverImageUrl: e.target.value })}
                    placeholder="/hero-yoga-lamayuru.jpg or https://..."
                  />
                </div>

                <div className="form-group-v2">
                  <label>Estimated Reading Time</label>
                  <input
                    type="text"
                    value={editingPost.readingTime || "5 min read"}
                    onChange={(e) => setEditingPost({ ...editingPost, readingTime: e.target.value })}
                    placeholder="6 min read"
                  />
                </div>
              </div>

              <div className="form-group-v2">
                <label>Excerpt / Abstract (Appears in Card and Google Snippet) *</label>
                <textarea
                  rows={2}
                  value={editingPost.excerpt || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, excerpt: e.target.value })}
                  placeholder="A short, evocative summary of the essay's core insight..."
                />
              </div>

              <div className="form-group-v2">
                <label>Article Body (HTML / Paragraphs) *</label>
                <textarea
                  rows={10}
                  value={editingPost.content || ""}
                  onChange={(e) => setEditingPost({ ...editingPost, content: e.target.value })}
                  placeholder="<p>Write your article content with paragraphs, <h2> headings, and <blockquote> reflections...</p>"
                  style={{ fontFamily: "monospace", fontSize: "13px" }}
                />
              </div>

              <div className="form-group-v2">
                <label>Publication Status</label>
                <select
                  value={editingPost.publicationStatus || "PUBLISHED"}
                  onChange={(e) => setEditingPost({ ...editingPost, publicationStatus: e.target.value as any })}
                  style={{
                    padding: "10px 14px",
                    border: "1px solid #ded9ce",
                    borderRadius: "8px",
                    background: "#ffffff",
                  }}
                >
                  <option value="PUBLISHED">PUBLISHED (Visible to readers)</option>
                  <option value="DRAFT">DRAFT (Hidden from readers)</option>
                </select>
              </div>
            </div>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "flex-end", gap: "12px" }}>
              <button
                type="button"
                className="admin-btn admin-btn-secondary"
                onClick={() => setIsModalOpen(false)}
                disabled={savingPost}
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-btn admin-btn-primary"
                onClick={handleSaveModalPost}
                disabled={savingPost}
              >
                {savingPost ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                <span>Save Essay</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
