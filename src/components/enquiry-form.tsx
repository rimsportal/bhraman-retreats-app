"use client";

import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";
import { useState } from "react";
import { COUNTRY_DIAL_CODES, WORLD_COUNTRIES } from "@/lib/country-data";

export function EnquiryForm({ retreatId }: { retreatId?: string }) {
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [country, setCountry] = useState("India");
  const [countryCode, setCountryCode] = useState("+91");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const form = event.currentTarget;
      const formData = new FormData(form);
      const name = String(formData.get("name") || "").trim();
      const email = String(formData.get("email") || "").trim();
      const phoneInput = String(formData.get("phone") || "").trim();
      const rawMessage = String(formData.get("message") || "").trim();
      const selectedCountry = String(formData.get("country") || country);
      const selectedCode = String(formData.get("countryCode") || countryCode);

      const fullPhone = phoneInput ? `${selectedCode} ${phoneInput}` : undefined;
      const enrichedMessage = selectedCountry ? `[Origin: ${selectedCountry}]\n\n${rawMessage}` : rawMessage;

      const response = await fetch("/api/public/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: fullPhone,
          country: selectedCountry,
          message: enrichedMessage,
          retreatId,
          source: "homepage",
        }),
      });
      const payload = await response.json().catch(() => null);
      if (!response.ok) throw new Error(payload?.error?.message ?? "We could not send your enquiry.");
      form.reset();
      setSubmitted(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "We could not send your enquiry.");
    } finally {
      setSubmitting(false);
    }
  }

  if (submitted) {
    return (
      <div className="enquiry-success" role="status">
        <CheckCircle2 aria-hidden="true" />
        <strong>Thank you.</strong>
        <span>We will be in touch with thoughtful next steps.</span>
      </div>
    );
  }

  return (
    <form className="enquiry-form" onSubmit={submit}>
      <div className="field-row">
        <label>
          Full Name *
          <input name="name" type="text" required minLength={2} autoComplete="name" />
        </label>
        <label>
          Email Address *
          <input name="email" type="email" required autoComplete="email" />
        </label>
      </div>

      <div className="field-row">
        <label>
          Country Name *
          <select
            name="country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            style={{
              width: "100%",
              padding: "12px 14px",
              border: "1px solid var(--line, #ded9ce)",
              borderRadius: "8px",
              background: "#faf8f5",
              fontSize: "14px",
              color: "#1d281f",
            }}
          >
            {WORLD_COUNTRIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </label>

        <label>
          Phone Number <span>(optional)</span>
          <div style={{ display: "grid", gridTemplateColumns: "150px 1fr", gap: "8px" }}>
            <select
              name="countryCode"
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              style={{
                padding: "12px 8px",
                border: "1px solid var(--line, #ded9ce)",
                borderRadius: "8px",
                background: "#faf8f5",
                fontSize: "13px",
                color: "#1d281f",
              }}
            >
              {COUNTRY_DIAL_CODES.map((item) => (
                <option key={`${item.code}-${item.dialCode}`} value={item.dialCode}>
                  {item.dialCode} ({item.name})
                </option>
              ))}
            </select>
            <input name="phone" type="tel" autoComplete="tel" />
          </div>
        </label>
      </div>

      <label>
        Your Intentions or Questions *
        <textarea name="message" required minLength={10} rows={4} />
      </label>

      {error && <p className="form-error" role="alert">{error}</p>}

      <button className="button button-dark" type="submit" disabled={submitting}>
        {submitting ? (
          <>
            <Loader2 className="spin" aria-hidden="true" /> Sending…
          </>
        ) : (
          <>
            Send enquiry <ArrowRight aria-hidden="true" />
          </>
        )}
      </button>
    </form>
  );
}
