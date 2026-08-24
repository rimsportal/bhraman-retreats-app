"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Compass, Loader2, Send, Sparkles, X } from "lucide-react";
import { EditorialHeading, SectionLabel } from "@/components/design-system";

type RetreatOption = {
  id: string;
  title: string;
  slug: string;
  edition?: string | null;
  location?: string | null;
};

interface EnquiryModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultRetreatSlug?: string;
}

export function EnquiryModal({ isOpen, onClose, defaultRetreatSlug }: EnquiryModalProps) {
  const [retreats, setRetreats] = useState<RetreatOption[]>([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [selectedSlug, setSelectedSlug] = useState(defaultRetreatSlug || "");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load upcoming retreats for dropdown
  useEffect(() => {
    async function loadRetreats() {
      try {
        const res = await fetch("/api/public/retreats/upcoming");
        if (res.ok) {
          const payload = await res.json();
          const list: RetreatOption[] = payload.data || [];
          setRetreats(list);
          if (!selectedSlug && list.length > 0) {
            setSelectedSlug(list[0].slug);
          }
        }
      } catch (err) {
        console.error("Failed to load retreat options for modal:", err);
      }
    }

    if (isOpen) {
      loadRetreats();
      setError(null);
    }
  }, [isOpen, selectedSlug]);

  // Handle ESC key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email, and message.");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: phone.trim() || undefined,
          retreatSlug: selectedSlug || undefined,
          message: message.trim(),
          source: "floating_fab_modal",
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error?.message || "Failed to submit enquiry. Please try again.");
      }

      setSubmitted(true);
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setName("");
    setEmail("");
    setPhone("");
    setMessage("");
    setSubmitted(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="enquiry-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
      onClick={onClose}
    >
      <div
        className="enquiry-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="enquiry-modal-close"
          onClick={onClose}
          aria-label="Close enquiry modal"
        >
          <X size={20} />
        </button>

        {submitted ? (
          <div className="enquiry-modal-success">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} className="success-icon" />
            </div>
            <SectionLabel>ENQUIRY RECEIVED</SectionLabel>
            <h3 id="enquiry-modal-title">Thank you, {name || "traveller"}.</h3>
            <p>
              Your note has been received with warmth. Dr. Pratiksha and our retreat circle will reach out to you within 24 hours to discuss dates, health notes, and preparations.
            </p>
            <button
              type="button"
              className="button button-dark"
              onClick={handleReset}
              style={{ marginTop: "24px", minWidth: "180px" }}
            >
              Close
            </button>
          </div>
        ) : (
          <div className="enquiry-modal-body">
            <div className="enquiry-modal-header">
              <SectionLabel>BEGIN YOUR JOURNEY</SectionLabel>
              <h3 id="enquiry-modal-title" style={{ fontSize: "24px", margin: "6px 0 8px" }}>
                Reserve your Himalayan place.
              </h3>
              <p style={{ fontSize: "14px", color: "var(--color-text-muted, #9eb3a8)", margin: 0 }}>
                Every circle is limited to 12 travellers to preserve depth and stillness. Share your details below.
              </p>
            </div>

            {error && <div className="enquiry-modal-error">{error}</div>}

            <form onSubmit={handleSubmit} className="enquiry-modal-form">
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-name">Full Name *</label>
                  <input
                    id="modal-name"
                    type="text"
                    required
                    placeholder="e.g. Maya Sharma"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-email">Email Address *</label>
                  <input
                    id="modal-email"
                    type="email"
                    required
                    placeholder="maya@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-phone">Phone / WhatsApp</label>
                  <input
                    id="modal-phone"
                    type="tel"
                    placeholder="+91 98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="modal-retreat">Preferred Journey</label>
                  <select
                    id="modal-retreat"
                    value={selectedSlug}
                    onChange={(e) => setSelectedSlug(e.target.value)}
                  >
                    {retreats.length > 0 ? (
                      retreats.map((r) => (
                        <option key={r.id} value={r.slug}>
                          {r.title} ({r.edition || r.location || "Himalayas"})
                        </option>
                      ))
                    ) : (
                      <option value="ladakh-five-elements">
                        The Five Elements · Ladakh Edition 2.0
                      </option>
                    )}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="modal-message">Your Intentions or Questions *</label>
                <textarea
                  id="modal-message"
                  required
                  rows={3}
                  placeholder="Tell us what you hope to experience, any dietary requirements, or questions for Dr. Pratiksha..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="enquiry-modal-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="button button-dark"
                  style={{ width: "100%", justifyContent: "center" }}
                >
                  {loading ? (
                    <>
                      <Loader2 size={16} className="spinner" /> Sending enquiry...
                    </>
                  ) : (
                    <>
                      <Send size={15} /> Send Sacred Enquiry
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
