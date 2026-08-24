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
  PhoneCall,
  RefreshCw,
  Search,
  Trash2,
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

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  NEW: { label: "New", color: "#4caf50", bg: "rgba(76, 175, 80, 0.15)" },
  CONTACTED: { label: "Contacted", color: "#2196f3", bg: "rgba(33, 150, 243, 0.15)" },
  IN_PROGRESS: { label: "In Progress", color: "#ff9800", bg: "rgba(255, 152, 0, 0.15)" },
  CONVERTED: { label: "Booked", color: "#c69b49", bg: "rgba(198, 155, 73, 0.2)" },
  CLOSED: { label: "Closed", color: "#9e9e9e", bg: "rgba(158, 158, 158, 0.15)" },
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
    <div className="admin-enquiries-manager" style={{ maxWidth: "1200px", margin: "0 auto" }}>
      {/* Top Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h2 style={{ fontSize: "24px", fontWeight: 600, color: "#fff", display: "flex", alignItems: "center", gap: "10px" }}>
            <Inbox size={24} style={{ color: "var(--color-primary-light, #c69b49)" }} />
            Guest Enquiries & Leads
          </h2>
          <p style={{ color: "var(--color-text-muted, #9eb3a8)", fontSize: "14px", marginTop: "4px" }}>
            Track and respond to traveller requests submitted via the floating enquiry form and website.
          </p>
        </div>

        <button
          type="button"
          onClick={loadEnquiries}
          disabled={loading}
          className="btn btn-secondary"
          style={{ fontSize: "13px", padding: "8px 16px" }}
        >
          <RefreshCw size={14} className={loading ? "spinner" : ""} style={{ marginRight: "6px" }} />
          Refresh
        </button>
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

      {/* Filter Tabs & Search Bar */}
      <div style={{ background: "var(--color-surface-elevated, #16201a)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "16px 20px", marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
        {/* Status Filter Pills */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {["ALL", ...ALL_STATUSES].map((st) => {
            const isActive = filterStatus === st;
            const count = counts[st] || 0;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setFilterStatus(st)}
                style={{
                  padding: "6px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: 500,
                  border: isActive ? "1px solid var(--color-primary-light, #c69b49)" : "1px solid rgba(255,255,255,0.1)",
                  background: isActive ? "rgba(198, 155, 73, 0.2)" : "rgba(255,255,255,0.03)",
                  color: isActive ? "#fff" : "var(--color-text-muted, #9eb3a8)",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  gap: "6px",
                }}
              >
                <span>{st === "ALL" ? "All Enquiries" : STATUS_CONFIG[st]?.label || st}</span>
                <span style={{ fontSize: "11px", background: "rgba(255,255,255,0.1)", padding: "1px 6px", borderRadius: "10px" }}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div style={{ position: "relative", minWidth: "260px" }}>
          <Search size={15} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "#888" }} />
          <input
            type="text"
            placeholder="Search name, email, phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px 8px 34px",
              borderRadius: "6px",
              background: "#0e1511",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "#fff",
              fontSize: "13px",
            }}
          />
        </div>
      </div>

      {/* Enquiries Table */}
      {loading ? (
        <div style={{ padding: "60px 0", textAlign: "center" }}>
          <Loader2 className="spinner" size={32} />
          <p style={{ marginTop: "12px", color: "var(--color-text-muted)" }}>Loading enquiries...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ background: "var(--color-surface-elevated, #16201a)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", padding: "60px 20px", textAlign: "center" }}>
          <Inbox size={40} style={{ color: "rgba(255,255,255,0.2)", margin: "0 auto 12px" }} />
          <h3 style={{ color: "#fff", fontSize: "18px", marginBottom: "6px" }}>No enquiries found</h3>
          <p style={{ color: "var(--color-text-muted)", fontSize: "14px" }}>
            {search ? "Try refining your search terms." : "New guest enquiries submitted on the site will appear here."}
          </p>
        </div>
      ) : (
        <div style={{ background: "var(--color-surface-elevated, #16201a)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "12px", overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "1px solid rgba(255,255,255,0.1)", background: "rgba(255,255,255,0.02)", color: "var(--color-text-muted, #9eb3a8)", fontSize: "12px", textTransform: "uppercase", letterSpacing: "1px" }}>
                <th style={{ padding: "14px 18px" }}>Status</th>
                <th style={{ padding: "14px 18px" }}>Guest Details</th>
                <th style={{ padding: "14px 18px" }}>Journey Requested</th>
                <th style={{ padding: "14px 18px" }}>Date</th>
                <th style={{ padding: "14px 18px" }}>Message Preview</th>
                <th style={{ padding: "14px 18px", textAlign: "right" }}>Actions</th>
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
                      borderBottom: "1px solid rgba(255,255,255,0.06)",
                      transition: "background 0.2s ease",
                    }}
                  >
                    {/* Status Pill & Dropdown */}
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap" }}>
                      <select
                        value={enq.status}
                        onChange={(e) => handleStatusChange(enq.id, e.target.value)}
                        disabled={updatingId === enq.id}
                        style={{
                          padding: "4px 10px",
                          borderRadius: "14px",
                          fontSize: "12px",
                          fontWeight: 600,
                          background: conf.bg,
                          color: conf.color,
                          border: `1px solid ${conf.color}40`,
                          cursor: "pointer",
                        }}
                      >
                        {ALL_STATUSES.map((st) => (
                          <option key={st} value={st} style={{ background: "#16201a", color: "#fff" }}>
                            {STATUS_CONFIG[st]?.label || st}
                          </option>
                        ))}
                      </select>
                    </td>

                    {/* Guest Name & Contact Links */}
                    <td style={{ padding: "14px 18px" }}>
                      <div style={{ fontWeight: 600, color: "#fff", marginBottom: "3px" }}>{enq.name}</div>
                      <div style={{ display: "flex", gap: "10px", alignItems: "center", fontSize: "13px" }}>
                        <a
                          href={`mailto:${enq.email}`}
                          style={{ color: "var(--color-primary-light, #c69b49)", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                          title="Send Email"
                        >
                          <Mail size={12} /> {enq.email}
                        </a>
                        {enq.phone && (
                          <a
                            href={`https://wa.me/${enq.phone.replace(/[^0-9]/g, "")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ color: "#4caf50", display: "flex", alignItems: "center", gap: "4px", textDecoration: "none" }}
                            title="WhatsApp message"
                          >
                            <Phone size={12} /> {enq.phone}
                          </a>
                        )}
                      </div>
                    </td>

                    {/* Preferred Journey */}
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap", color: "var(--color-text-muted, #9eb3a8)" }}>
                      {enq.retreat?.title ? (
                        <span>
                          {enq.retreat.title} <small>({enq.retreat.edition || "Retreat"})</small>
                        </span>
                      ) : (
                        <span>Ladakh Edition 2.0</span>
                      )}
                    </td>

                    {/* Date */}
                    <td style={{ padding: "14px 18px", whiteSpace: "nowrap", fontSize: "13px", color: "var(--color-text-muted, #9eb3a8)" }}>
                      {formattedDate}
                    </td>

                    {/* Message Preview */}
                    <td style={{ padding: "14px 18px", maxWidth: "300px" }}>
                      <p
                        style={{
                          margin: 0,
                          fontSize: "13px",
                          color: "#ccc",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {enq.message}
                      </p>
                    </td>

                    {/* Action buttons */}
                    <td style={{ padding: "14px 18px", textAlign: "right", whiteSpace: "nowrap" }}>
                      <div style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedEnquiry(enq)}
                          style={{
                            background: "rgba(255,255,255,0.06)",
                            border: "1px solid rgba(255,255,255,0.1)",
                            borderRadius: "6px",
                            color: "#fff",
                            padding: "6px 10px",
                            cursor: "pointer",
                            display: "flex",
                            alignItems: "center",
                            gap: "4px",
                            fontSize: "12px",
                          }}
                          title="View Details"
                        >
                          <Eye size={13} /> View
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(enq.id)}
                          style={{
                            background: "transparent",
                            border: "1px solid rgba(244, 67, 54, 0.3)",
                            borderRadius: "6px",
                            color: "#f44336",
                            padding: "6px 10px",
                            cursor: "pointer",
                          }}
                          title="Delete Enquiry"
                        >
                          <Trash2 size={13} />
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

      {/* Detail Modal Overlay */}
      {selectedEnquiry && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.75)",
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
              background: "var(--color-surface-elevated, #16201a)",
              border: "1px solid rgba(255,255,255,0.15)",
              borderRadius: "14px",
              maxWidth: "600px",
              width: "100%",
              padding: "28px",
              position: "relative",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setSelectedEnquiry(null)}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "transparent",
                border: "none",
                color: "#9eb3a8",
                cursor: "pointer",
              }}
            >
              <X size={20} />
            </button>

            <div style={{ marginBottom: "20px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "4px 10px",
                  borderRadius: "12px",
                  fontSize: "12px",
                  fontWeight: 600,
                  background: STATUS_CONFIG[selectedEnquiry.status]?.bg,
                  color: STATUS_CONFIG[selectedEnquiry.status]?.color,
                  marginBottom: "10px",
                }}
              >
                {STATUS_CONFIG[selectedEnquiry.status]?.label || selectedEnquiry.status}
              </span>
              <h3 style={{ fontSize: "22px", color: "#fff", margin: 0 }}>{selectedEnquiry.name}</h3>
              <p style={{ color: "var(--color-text-muted, #9eb3a8)", fontSize: "13px", marginTop: "4px" }}>
                Received on{" "}
                {new Date(selectedEnquiry.createdAt).toLocaleString("en-IN", {
                  dateStyle: "full",
                  timeStyle: "short",
                })}
              </p>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "20px" }}>
              <div>
                <label style={{ fontSize: "12px", color: "#9eb3a8", textTransform: "uppercase" }}>Email</label>
                <div style={{ marginTop: "4px" }}>
                  <a href={`mailto:${selectedEnquiry.email}`} style={{ color: "var(--color-primary-light, #c69b49)" }}>
                    {selectedEnquiry.email}
                  </a>
                </div>
              </div>

              <div>
                <label style={{ fontSize: "12px", color: "#9eb3a8", textTransform: "uppercase" }}>Phone / WhatsApp</label>
                <div style={{ marginTop: "4px", color: "#fff" }}>
                  {selectedEnquiry.phone ? (
                    <a href={`https://wa.me/${selectedEnquiry.phone.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" style={{ color: "#4caf50" }}>
                      {selectedEnquiry.phone}
                    </a>
                  ) : (
                    "Not provided"
                  )}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label style={{ fontSize: "12px", color: "#9eb3a8", textTransform: "uppercase" }}>Preferred Retreat</label>
              <div style={{ color: "#fff", marginTop: "4px", fontWeight: 500 }}>
                {selectedEnquiry.retreat?.title || "The Five Elements · Ladakh Edition 2.0"}
              </div>
            </div>

            <div style={{ marginBottom: "24px" }}>
              <label style={{ fontSize: "12px", color: "#9eb3a8", textTransform: "uppercase" }}>Guest Note & Intentions</label>
              <div style={{ background: "#0e1511", border: "1px solid rgba(255,255,255,0.08)", borderRadius: "8px", padding: "14px", marginTop: "6px", color: "#fff", fontSize: "14px", lineHeight: "1.6", whiteSpace: "pre-wrap" }}>
                {selectedEnquiry.message}
              </div>
            </div>

            {/* Status Selector in Modal */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.08)", paddingTop: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "13px", color: "#9eb3a8" }}>Change Status:</span>
                <select
                  value={selectedEnquiry.status}
                  onChange={(e) => handleStatusChange(selectedEnquiry.id, e.target.value)}
                  style={{ padding: "6px 12px", borderRadius: "6px", background: "#0e1511", border: "1px solid rgba(255,255,255,0.2)", color: "#fff", fontSize: "13px" }}
                >
                  {ALL_STATUSES.map((st) => (
                    <option key={st} value={st}>
                      {STATUS_CONFIG[st]?.label || st}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <a
                  href={`mailto:${selectedEnquiry.email}?subject=Bhraman%20Retreats%20Enquiry`}
                  className="button button-dark"
                  style={{ fontSize: "13px", padding: "8px 16px" }}
                >
                  <Mail size={14} /> Reply via Email
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
