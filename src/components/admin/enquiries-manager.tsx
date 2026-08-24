"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Check,
  CheckCircle2,
  Clock,
  Eye,
  Inbox,
  Loader2,
  Mail,
  MessageSquare,
  Phone,
  RefreshCw,
  Search,
  Trash2,
  User,
  X,
} from "lucide-react";

type Enquiry = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  message: string;
  status: string;
  source?: string | null;
  createdAt: string;
  retreat?: {
    id: string;
    title: string;
    slug: string;
    edition?: string | null;
  } | null;
};

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; border: string }> = {
  NEW: { label: "New", color: "#2e7d32", bg: "#e8f5e9", border: "#c8e6c9" },
  CONTACTED: { label: "Contacted", color: "#1565c0", bg: "#e3f2fd", border: "#bbdefb" },
  IN_PROGRESS: { label: "In Progress", color: "#e65100", bg: "#fff3e0", border: "#ffe0b2" },
  CONVERTED: { label: "Booked", color: "#7b3a34", bg: "#fdf3e7", border: "#f2cfab" },
  CLOSED: { label: "Closed", color: "#616161", bg: "#f5f5f5", border: "#e0e0e0" },
};

const ALL_STATUSES = ["NEW", "CONTACTED", "IN_PROGRESS", "CONVERTED", "CLOSED"] as const;

export function EnquiriesManager() {
  const [enquiries, setEnquiries] = useState<Enquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [selectedEnquiry, setSelectedEnquiry] = useState<Enquiry | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const flash = (msg: string) => {
    setMessage(msg);
    setError(null);
    setTimeout(() => setMessage(null), 3500);
  };

  const loadEnquiries = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/enquiries", { credentials: "include" });
      if (!res.ok) {
        throw new Error("Failed to load guest enquiries");
      }
      const data = await res.json();
      setEnquiries(data.enquiries || []);
    } catch (err: any) {
      setError(err.message || "Could not load enquiries.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEnquiries();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch("/api/admin/enquiries", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (!res.ok) {
        throw new Error("Failed to update status");
      }

      setEnquiries((prev) =>
        prev.map((e) => (e.id === id ? { ...e, status: newStatus } : e))
      );
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
      flash(`Status updated to ${STATUS_CONFIG[newStatus]?.label || newStatus}`);
    } catch (err: any) {
      setError(err.message || "Failed to update status.");
    } finally {
      setUpdatingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this enquiry?")) return;

    try {
      const res = await fetch(`/api/admin/enquiries?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!res.ok) {
        throw new Error("Failed to delete enquiry");
      }

      setEnquiries((prev) => prev.filter((e) => e.id !== id));
      if (selectedEnquiry?.id === id) {
        setSelectedEnquiry(null);
      }
      flash("Enquiry deleted successfully.");
    } catch (err: any) {
      setError(err.message || "Failed to delete enquiry.");
    }
  };

  const filtered = useMemo(() => {
    return enquiries.filter((e) => {
      const matchesStatus = filterStatus === "ALL" || e.status === filterStatus;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        e.name.toLowerCase().includes(q) ||
        e.email.toLowerCase().includes(q) ||
        (e.phone && e.phone.toLowerCase().includes(q)) ||
        e.message.toLowerCase().includes(q) ||
        (e.retreat?.title && e.retreat.title.toLowerCase().includes(q));
      return matchesStatus && matchesSearch;
    });
  }, [enquiries, filterStatus, search]);

  const counts = useMemo(() => {
    const res: Record<string, number> = { ALL: enquiries.length };
    ALL_STATUSES.forEach((s) => (res[s] = 0));
    enquiries.forEach((e) => {
      res[e.status] = (res[e.status] || 0) + 1;
    });
    return res;
  }, [enquiries]);

  return (
    <div className="admin-card">
      {/* Top Header matching Founder Story */}
      <div className="admin-retreats-head" style={{ marginBottom: "24px" }}>
        <div>
          <h2>Guest Enquiries &amp; Circle Requests</h2>
          <p className="admin-note">
            Review and respond to guest applications submitted from the website floating button and enquiry forms.
          </p>
        </div>
        <button
          type="button"
          onClick={loadEnquiries}
          disabled={loading}
          className="button"
          style={{ background: "#f0f4ee", border: "1px solid #ccd6c8", color: "#223024" }}
        >
          <RefreshCw size={14} className={loading ? "spin" : ""} /> Refresh
        </button>
      </div>

      {message && <p className="admin-flash">{message}</p>}
      {error && <p className="form-error" role="alert">{error}</p>}

      {/* ── FILTER TABS & SEARCH BAR ── */}
      <div style={{ background: "#fbfcf9", padding: "18px 20px", borderRadius: "8px", border: "1px solid #e2e8de", marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        {/* Status Filter Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", ...ALL_STATUSES].map((st) => {
            const isActive = filterStatus === st;
            const count = counts[st] || 0;
            const conf = STATUS_CONFIG[st];

            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: isActive
                    ? "1px solid #7b3a34"
                    : "1px solid #ccd6c8",
                  background: isActive
                    ? "#fdf3e7"
                    : "#ffffff",
                  color: isActive ? "#7b3a34" : "#4a5c4e",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.2s ease",
                }}
              >
                <span>{st === "ALL" ? "All Enquiries" : conf?.label || st}</span>
                <span style={{ fontSize: "11px", background: isActive ? "rgba(123, 58, 52, 0.15)" : "#f0f4ee", color: isActive ? "#7b3a34" : "#666", padding: "1px 6px", borderRadius: "10px" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
          <input
            type="text"
            placeholder="Search by name, email, phone..."
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

      {/* ── ENQUIRIES TABLE ── */}
      {loading ? (
        <p className="admin-loading">
          <Loader2 className="spin" size={18} /> Loading enquiries...
        </p>
      ) : filtered.length === 0 ? (
        <div style={{ background: "#fbfcf9", border: "1px solid #e2e8de", borderRadius: "8px", padding: "48px 20px", textAlign: "center" }}>
          <Inbox size={36} color="#7b3a34" style={{ margin: "0 auto 12px", opacity: 0.7 }} />
          <h3 style={{ color: "#1d281f", fontSize: "17px", margin: "0 0 6px" }}>No enquiries found</h3>
          <p style={{ color: "#666", fontSize: "13px", margin: 0 }}>
            {search ? "Try refining your search keyword." : "Guest enquiries submitted on the site will appear here."}
          </p>
        </div>
      ) : (
        <div style={{ border: "1px solid #e2e8de", borderRadius: "8px", overflow: "hidden", background: "#ffffff" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ background: "#f4f7f2", borderBottom: "1px solid #e2e8de", color: "#4a5c4e", fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.06em" }}>
                <th style={{ padding: "12px 16px" }}>Status</th>
                <th style={{ padding: "12px 16px" }}>Guest Details</th>
                <th style={{ padding: "12px 16px" }}>Journey Requested</th>
                <th style={{ padding: "12px 16px" }}>Date</th>
                <th style={{ padding: "12px 16px" }}>Message Preview</th>
                <th style={{ padding: "12px 16px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((enq) => {
                const conf = STATUS_CONFIG[enq.status] || STATUS_CONFIG.NEW;
                const formattedDate = new Date(enq.createdAt).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <tr
                    key={enq.id}
                    style={{
                      borderBottom: "1px solid #eef2ec",
                      transition: "background 0.15s ease",
                    }}
                  >
                    {/* Status Pill & Dropdown */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap" }}>
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        disabled={updatingId === enq.id}
                        style={{
                          padding: "4px 8px",
                          borderRadius: "4px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: conf.bg,
                          color: conf.color,
                          border: `1px solid ${conf.border}`,
                          cursor: "pointer",
                        }}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {STATUS_CONFIG[st]?.label || st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Guest Name & Contact Links */}
                    <td style={{ padding: "12px 16px" }}>
                      <div style={{ fontWeight: 600, color: "#1d281f", marginBottom: "2px" }}>{enq.name}</div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "12px" }}>
                        <a
                          href={`mailto:${enq.email}`}
                          style={{ color: "#7b3a34", display: "flex", alignItems: "center", gap: "3px", textDecoration: "none", fontWeight: 500 }}
                          title="Send Email"
                        >
                          <Mail size={12} /> {enq.email}
                        </a>
                        {enq.phone && (
                          <a
                            href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#2e7d32", display: "flex", alignItems: "center", gap: "3px", textDecoration: "none", fontWeight: 500 }}
                            title="WhatsApp message"
                          >
                            <Phone size={12} /> {enq.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Preferred Journey */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap", color: "#4a5c4e" }}>
                      {enq.retreat?.title ? (
                        <span>
                          {enq.retreat.title} <small style={{ color: "#888" }}>({enq.retreat.edition || "Retreat"})</small>
                        </span>
                      ) : (
                        <span>Ladakh Edition 2.0</span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "12px 16px", whiteSpace: "nowrap", fontSize: "12px", color: "#666" }}>
                      {formattedDate}
                    </td>

                    {/* Message Preview */}
                    <td style={{ padding: "12px 16px", maxWidth: "280px" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "12px",
                          color: "#555",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {enq.message}
                      </p>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: "12px 16px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(enq)}
                          className="button"
                          style={{
                            padding: "4px 8px",
                            fontSize: "12px",
                            background: "#f0f4ee",
                            border: "1px solid #ccd6c8",
                            color: "#1d281f",
                          }}
                          title="View Details"
                        >
                          <Eye size={12} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(enq.id)}
                          className="admin-delete"
                          style={{ padding: "4px 8px", fontSize: "12px" }}
                          title="Delete Enquiry"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── DETAIL MODAL OVERLAY ── */}
      {selectedEnquiry && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(10, 20, 12, 0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 1000,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
          onClick={() => setSelectedEnquiry(null)}
        >
          <div
            style={{
              background: "#ffffff",
              border: "1px solid #e2e8de",
              borderRadius: "10px",
              maxWidth: "560px",
              width: "100%",
              padding: "28px",
              position: "relative",
              boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedEnquiry(null)}
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                background: "#f0f4ee",
                border: "none",
                borderRadius: "50%",
                width: "28px",
                height: "28px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#666",
                cursor: "pointer",
              }}
            >
              <X size={16} />
            </button>

            <div style={{ marginBottom: "18px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: "4px",
                  fontSize: "11px",
                  fontWeight: 700,
                  background: STATUS_CONFIG[selectedEnquiry.status]?.bg,
                  color: STATUS_CONFIG[selectedEnquiry.status]?.color,
                  border: `1px solid ${STATUS_CONFIG[selectedEnquiry.status]?.border}`,
                  marginBottom: "8px",
                  letterSpacing: "0.05em",
                }}
              >
                {STATUS_CONFIG[selectedEnquiry.status]?.label || selectedEnquiry.status}
              </span>
              <h3 style={{ fontSize: "22px", color: "#1d281f", margin: 0, fontWeight: 600 }}>{selectedEnquiry.name}</h3>
              <p style={{ color: "#777", fontSize: "12px", marginTop: "3px" }}>
                Received on{" "}
                {new Date(selectedEnquiry.createdAt).toLocaleString("en-IN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "16px" }}>
              <div style={{ background: "#fbfcf9", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8de" }}>
                <label style={{ fontSize: "11px", color: "#7b3a34", textTransform: "uppercase", fontWeight: 700 }}>Email</label>
                <div style={{ marginTop: "4px" }}>
                  <a href={`mailto:${selectedEnquiry.email}`} style={{ color: "#1d281f", fontWeight: 500, fontSize: "13px" }}>
                    {selectedEnquiry.email}
                  </a>
                </div>
              </div>

              <div style={{ background: "#fbfcf9", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8de" }}>
                <label style={{ fontSize: "11px", color: "#7b3a34", textTransform: "uppercase", fontWeight: 700 }}>Phone / WhatsApp</label>
                <div style={{ marginTop: "4px", color: "#1d281f", fontSize: "13px", fontWeight: 500 }}>
                  {selectedEnquiry.phone ? (
                    <a href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#2e7d32" }}>
                      {selectedEnquiry.phone}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </div>
              </div>
            </div>

            <div style={{ background: "#fbfcf9", padding: "12px", borderRadius: "6px", border: "1px solid #e2e8de", marginBottom: "16px" }}>
              <label style={{ fontSize: "11px", color: "#7b3a34", textTransform: "uppercase", fontWeight: 700 }}>Preferred Retreat</label>
              <div style={{ color: "#1d281f", marginTop: "3px", fontWeight: 500, fontSize: "13px" }}>
                {selectedEnquiry.retreat?.title || "The Five Elements · Ladakh Edition 2.0"}
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "11px", color: "#7b3a34", textTransform: "uppercase", fontWeight: 700 }}>Guest Note &amp; Intentions</label>
              <div style={{ background: "#fbfcf9", border: "1px solid #e2e8de", borderRadius: "6px", padding: "12px", marginTop: "4px", color: "#223024", fontSize: "13px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Modal Actions */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #e8ede6", paddingTop: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "12px", color: "#666" }}>Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  style={{ padding: "4px 8px", borderRadius: "4px", fontSize: "12px" }}
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_CONFIG[st]?.label || st}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "8px" }}>
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Bhraman%20Retreats%20Enquiry`}
                  className="button button-dark"
                  style={{ fontSize: "12px", padding: "6px 14px" }}
                >
                  <Mail size={13} /> Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
