"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ArrowDown,
  ArrowUp,
  Check,
  ChevronDown,
  ChevronUp,
  Edit2,
  HelpCircle,
  Loader2,
  Plus,
  RefreshCw,
  RotateCcw,
  Save,
  Search,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";
import { FaqItem, PREDEFINED_FAQS } from "@/lib/faqs-data";

const CATEGORIES = [
  "The Journey",
  "Ladakh & Altitude",
  "Inclusions & Comfort",
  "Booking & Preparation",
] as const;

export function FaqManager() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // New FAQ form state
  const [isAdding, setIsAdding] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [newCategory, setNewCategory] = useState<FaqItem["category"]>("The Journey");

  // Editing state for inline expansion
  const [expandedEditId, setExpandedEditId] = useState<string | null>(null);

  const flash = (msg: string) => {
    setMessage(msg);
    setError(null);
    setTimeout(() => setMessage(null), 3500);
  };

  const loadFaqs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/faqs", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to load FAQs");
      const data = await res.json();
      setFaqs(data.faqs || PREDEFINED_FAQS);
    } catch (err: any) {
      setError(err.message || "Could not load FAQs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFaqs();
  }, []);

  const handleSaveAll = async (itemsToSave: FaqItem[] = faqs) => {
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/faqs", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ faqs: itemsToSave }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Failed to save FAQs");
      }

      setFaqs(itemsToSave);
      flash("Frequently Asked Questions saved & published successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to save FAQs.");
    } finally {
      setSaving(false);
    }
  };

  const handleAddFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestion.trim() || !newAnswer.trim()) {
      setError("Please provide both a question and answer.");
      return;
    }

    const newItem: FaqItem = {
      id: `faq-${Date.now()}`,
      question: newQuestion.trim(),
      answer: newAnswer.trim(),
      category: newCategory,
      order: faqs.length + 1,
    };

    const updated = [...faqs, newItem];
    setFaqs(updated);
    handleSaveAll(updated);
    setNewQuestion("");
    setNewAnswer("");
    setIsAdding(false);
    flash("New FAQ added successfully.");
  };

  const handleDeleteFaq = (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return;
    const updated = faqs.filter((f) => f.id !== id);
    setFaqs(updated);
    handleSaveAll(updated);
    flash("FAQ deleted.");
  };

  const handleUpdateField = (id: string, field: keyof FaqItem, val: any) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, [field]: val } : f))
    );
  };

  const handleMove = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= faqs.length) return;

    const copy = [...faqs];
    const temp = copy[index];
    copy[index] = copy[targetIdx];
    copy[targetIdx] = temp;

    // re-assign orders
    const reordered = copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    setFaqs(reordered);
    handleSaveAll(reordered);
  };

  const handleResetPredefined = () => {
    if (!confirm("Reset all FAQs to the curated default Himalayan retreat questions and answers? Any custom additions will be overwritten.")) {
      return;
    }
    setFaqs(PREDEFINED_FAQS);
    handleSaveAll(PREDEFINED_FAQS);
    flash("FAQs reset to curated defaults.");
  };

  const filtered = useMemo(() => {
    return faqs.filter((f) => {
      const matchesCat = filterCategory === "ALL" || f.category === filterCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        f.question.toLowerCase().includes(q) ||
        f.answer.toLowerCase().includes(q) ||
        f.category.toLowerCase().includes(q);
      return matchesCat && matchesSearch;
    });
  }, [faqs, filterCategory, search]);

  return (
    <div className="admin-card">
      {/* Top Header matching Founder Story */}
      <div className="admin-retreats-head" style={{ marginBottom: "24px" }}>
        <div>
          <h2>Frequently Asked Questions (FAQ) Manager</h2>
          <p className="admin-note">
            Curate questions and answers for travellers regarding the five elements, Ladakh acclimatization, packing, and booking.
          </p>
        </div>
        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleResetPredefined}
            className="button"
            style={{ background: "#f0f4ee", border: "1px solid #ccd6c8", color: "#223024", fontSize: "13px" }}
            title="Reset to predefined questions"
          >
            <RotateCcw size={14} /> Reset Defaults
          </button>
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="button button-dark"
            style={{ fontSize: "13px" }}
          >
            <Plus size={14} /> Add New FAQ
          </button>
        </div>
      </div>

      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {/* ── FILTER & SEARCH BAR ── */}
      <div
        style={{
          background: "#fbfcf9",
          padding: "16px 20px",
          borderRadius: "8px",
          border: "1px solid #e2e8de",
          marginBottom: "24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", ...CATEGORIES].map((cat) => {
            const isActive = filterCategory === cat;
            const count =
              cat === "ALL"
                ? faqs.length
                : faqs.filter((f) => f.category === cat).length;

            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilterCategory(cat)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: isActive ? "1px solid #7b3a34" : "1px solid #ccd6c8",
                  background: isActive ? "#fdf3e7" : "#ffffff",
                  color: isActive ? "#7b3a34" : "#4a5c4e",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{cat === "ALL" ? "All Questions" : cat}</span>
                <span
                  style={{
                    fontSize: "11px",
                    background: isActive ? "rgba(123, 58, 52, 0.15)" : "#f0f4ee",
                    color: isActive ? "#7b3a34" : "#666",
                    padding: "1px 6px",
                    borderRadius: "10px",
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search
            size={14}
            style={{
              position: "absolute",
              left: "10px",
              top: "50%",
              transform: "translateY(-50%)",
              color: "#888",
            }}
          />
          <input
            type="text"
            placeholder="Search FAQs by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "7px 10px 7px 32px",
              fontSize: "13px",
              background: "#ffffff",
              border: "1px solid #ccd6c8",
              borderRadius: "6px",
            }}
          />
        </div>
      </div>

      {/* ── ADD NEW FAQ DIALOG / PANEL ── */}
      {isAdding && (
        <div
          style={{
            background: "#fbfcf9",
            border: "1px solid #7b3a34",
            borderRadius: "8px",
            padding: "24px",
            marginBottom: "24px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ margin: 0, fontSize: "17px", color: "#1d281f", display: "flex", alignItems: "center", gap: "8px" }}>
              <Plus size={16} color="#7b3a34" /> Add New Frequently Asked Question
            </h3>
            <button
              type="button"
              onClick={() => setIsAdding(false)}
              style={{ background: "transparent", border: "none", cursor: "pointer", color: "#666" }}
            >
              <X size={16} />
            </button>
          </div>

          <form onSubmit={handleAddFaq}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "16px", marginBottom: "16px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#4a5c4e", display: "block", marginBottom: "6px" }}>
                  Question *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Is there mobile connectivity or Wi-Fi in Ladakh?"
                  value={newQuestion}
                  onChange={(e) => setNewQuestion(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccd6c8" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "#4a5c4e", display: "block", marginBottom: "6px" }}>
                  Category
                </label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccd6c8" }}
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginBottom: "18px" }}>
              <label style={{ fontSize: "12px", fontWeight: 600, color: "#4a5c4e", display: "block", marginBottom: "6px" }}>
                Answer *
              </label>
              <textarea
                required
                rows={4}
                placeholder="Provide a thorough, comforting, and clear answer for the traveller..."
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", border: "1px solid #ccd6c8" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setIsAdding(false)}
                className="button"
                style={{ background: "#f0f4ee", border: "1px solid #ccd6c8" }}
              >
                Cancel
              </button>
              <button type="submit" className="button button-dark">
                <Check size={14} /> Add &amp; Save FAQ
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── FAQ LIST ACCORDION ── */}
      {loading ? (
        <p className="admin-loading">
          <Loader2 className="spin" size={18} /> Loading FAQs...
        </p>
      ) : filtered.length === 0 ? (
        <div
          style={{
            background: "#fbfcf9",
            border: "1px solid #e2e8de",
            borderRadius: "8px",
            padding: "48px 20px",
            textAlign: "center",
          }}
        >
          <HelpCircle size={36} color="#7b3a34" style={{ margin: "0 auto 12px", opacity: 0.7 }} />
          <h3 style={{ color: "#1d281f", fontSize: "17px", margin: "0 0 6px" }}>No FAQs found</h3>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            {search ? "Try refining your search keyword." : "Add a new FAQ above or click 'Reset Defaults'."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {filtered.map((item, index) => {
            const isEditing = expandedEditId === item.id;

            return (
              <div
                key={item.id}
                style={{
                  background: "#fbfcf9",
                  border: isEditing ? "1px solid #7b3a34" : "1px solid #e2e8de",
                  borderRadius: "8px",
                  overflow: "hidden",
                  transition: "all 0.2s ease",
                }}
              >
                {/* Accordion Item Header */}
                <div
                  style={{
                    padding: "14px 18px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    gap: "12px",
                    cursor: "pointer",
                    background: isEditing ? "#fdf3e7" : "transparent",
                  }}
                  onClick={() => setExpandedEditId(isEditing ? null : item.id)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        background: "#e8ede6",
                        color: "#4a5c4e",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        letterSpacing: "0.04em",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {item.category}
                    </span>
                    <h4 style={{ margin: 0, fontSize: "14px", fontWeight: 600, color: "#1d281f" }}>
                      {item.question}
                    </h4>
                  </div>

                  <div
                    style={{ display: "flex", alignItems: "center", gap: "8px" }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => handleMove(index, "up")}
                      disabled={index === 0}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: index === 0 ? "not-allowed" : "pointer",
                        opacity: index === 0 ? 0.3 : 0.7,
                        padding: "4px",
                      }}
                      title="Move up"
                    >
                      <ArrowUp size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, "down")}
                      disabled={index === faqs.length - 1}
                      style={{
                        background: "transparent",
                        border: "none",
                        cursor: index === faqs.length - 1 ? "not-allowed" : "pointer",
                        opacity: index === faqs.length - 1 ? 0.3 : 0.7,
                        padding: "4px",
                      }}
                      title="Move down"
                    >
                      <ArrowDown size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setExpandedEditId(isEditing ? null : item.id)}
                      style={{
                        background: "#ffffff",
                        border: "1px solid #ccd6c8",
                        borderRadius: "4px",
                        padding: "4px 8px",
                        fontSize: "12px",
                        color: "#1d281f",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Edit2 size={11} /> {isEditing ? "Done" : "Edit"}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteFaq(item.id)}
                      className="admin-delete"
                      style={{ padding: "4px 8px", fontSize: "12px" }}
                      title="Delete FAQ"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                </div>

                {/* Expanded Edit Form */}
                {isEditing && (
                  <div style={{ padding: "18px", borderTop: "1px solid #e2e8de", background: "#ffffff" }}>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 200px", gap: "14px", marginBottom: "14px" }}>
                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#7b3a34", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                          Question
                        </label>
                        <input
                          type="text"
                          value={item.question}
                          onChange={(e) => handleUpdateField(item.id, "question", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccd6c8", fontSize: "13px" }}
                        />
                      </div>

                      <div>
                        <label style={{ fontSize: "11px", fontWeight: 700, color: "#7b3a34", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                          Category
                        </label>
                        <select
                          value={item.category}
                          onChange={(e) => handleUpdateField(item.id, "category", e.target.value)}
                          style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccd6c8", fontSize: "13px" }}
                        >
                          {CATEGORIES.map((c) => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div style={{ marginBottom: "16px" }}>
                      <label style={{ fontSize: "11px", fontWeight: 700, color: "#7b3a34", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                        Answer Text
                      </label>
                      <textarea
                        rows={3}
                        value={item.answer}
                        onChange={(e) => handleUpdateField(item.id, "answer", e.target.value)}
                        style={{ width: "100%", padding: "8px 10px", borderRadius: "6px", border: "1px solid #ccd6c8", fontSize: "13px", lineHeight: "1.6" }}
                      />
                    </div>

                    <div style={{ display: "flex", justifyContent: "flex-end" }}>
                      <button
                        type="button"
                        onClick={() => {
                          handleSaveAll();
                          setExpandedEditId(null);
                        }}
                        disabled={saving}
                        className="button button-dark"
                        style={{ fontSize: "12px", padding: "6px 16px" }}
                      >
                        <Save size={13} /> {saving ? "Saving..." : "Save Changes"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
