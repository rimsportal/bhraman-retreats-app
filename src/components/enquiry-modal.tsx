"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Compass, Loader2, Send, Sparkles, X } from "lucide-react";
import { EditorialHeading, SectionLabel } from "@/components/design-system";
import { COUNTRY_DIAL_CODES, WORLD_COUNTRIES } from "@/lib/country-data";

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
  const [country, setCountry] = useState("India");
  const [countryCode, setCountryCode] = useState("+91");
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
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);
    setError(null);

    const fullPhone = phone.trim() ? `${countryCode} ${phone.trim()}` : "";
    const enrichedMessage = country ? `[Origin: ${country}]\n\n${message.trim()}` : message.trim();

    try {
      const res = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim(),
          phone: fullPhone || undefined,
          country: country || undefined,
          retreatSlug: selectedSlug || undefined,
          message: enrichedMessage,
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
    setCountry("India");
    setCountryCode("+91");
    setMessage("");
    setSubmitted(false);
    setError(null);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="enquiry-modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="enquiry-modal-title"
    >
      <div className="enquiry-modal-card">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="enquiry-modal-close"
          aria-label="Close enquiry modal"
        >
          <X size={18} />
        </button>

        {submitted ? (
          <div className="enquiry-modal-success">
            <div className="success-icon-wrap">
              <CheckCircle2 size={48} color="#7b3a34" />
            </div>
            <SectionLabel>ENQUIRY RECEIVED</SectionLabel>
            <EditorialHeading as="h3" style={{ fontSize: "28px", margin: "12px 0 16px" }}>
              Your seat at the circle is noted.
            </EditorialHeading>
            <p style={{ color: "var(--color-text-muted, #9eb3a8)", fontSize: "15px", lineHeight: "1.7", maxWidth: "480px", margin: "0 auto 28px" }}>
              Thank you for sharing your intentions, {name.trim()}. Dr. Pratiksha Shekhawat and the Bhraman team will review your application and reach out via email and WhatsApp.
            </p>
            <button
              type="button"
              onClick={handleReset}
              className="button button-dark"
            >
              Close Window
            </button>
          </div>
        ) : (
          <div>
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
              {/* Row 1: Full Name & Email Address */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-name">Full Name *</label>
                  <input
                    id="modal-name"
                    type="text"
                    required
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 2: Country Name & Preferred Journey */}
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="modal-country">Country Name *</label>
                  <select
                    id="modal-country"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                  >
                    {WORLD_COUNTRIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
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

              {/* Row 3: Phone Number with Country Code Dropdown */}
              <div className="form-group">
                <label htmlFor="modal-phone">Phone / WhatsApp</label>
                <div style={{ display: "grid", gridTemplateColumns: "170px 1fr", gap: "10px" }}>
                  <select
                    id="modal-country-code"
                    value={countryCode}
                    onChange={(e) => setCountryCode(e.target.value)}
                    style={{
                      padding: "12px 10px",
                      borderRadius: "8px",
                      border: "1px solid var(--color-border, #ded9ce)",
                      fontSize: "13.5px",
                      background: "#faf8f5",
                      color: "#1d281f",
                    }}
                  >
                    {COUNTRY_DIAL_CODES.map((item) => (
                      <option key={`${item.code}-${item.dialCode}`} value={item.dialCode}>
                        {item.dialCode} ({item.name})
                      </option>
                    ))}
                  </select>
                  <input
                    id="modal-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              {/* Row 4: Your Intentions or Questions */}
              <div className="form-group">
                <label htmlFor="modal-message">Your Intentions or Questions *</label>
                <textarea
                  id="modal-message"
                  required
                  rows={3}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
              </div>

              <div className="enquiry-modal-actions">
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-enquiry-submit"
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
