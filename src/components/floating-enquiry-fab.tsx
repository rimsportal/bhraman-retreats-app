"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { HelpCircle, Sparkles } from "lucide-react";
import { EnquiryModal } from "@/components/enquiry-modal";
import { FaqModal } from "@/components/faq-modal";

export function FloatingEnquiryFab() {
  const [isEnquiryOpen, setIsEnquiryOpen] = useState(false);
  const [isFaqOpen, setIsFaqOpen] = useState(false);
  const pathname = usePathname();

  // Do not render floating action buttons in admin dashboard
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="floating-fab-group">
        {/* Floating FAQ Button (Just on top of Enquire Now) */}
        <button
          type="button"
          className="floating-faq-fab"
          onClick={() => setIsFaqOpen(true)}
          aria-label="Open Frequently Asked Questions"
          title="Frequently Asked Questions"
        >
          <HelpCircle size={15} className="fab-faq-icon" />
          <span className="fab-faq-text">FAQ</span>
        </button>

        {/* Floating Enquire Now Button */}
        <button
          type="button"
          className="floating-enquire-fab"
          onClick={() => setIsEnquiryOpen(true)}
          aria-label="Open Enquiry Form"
        >
          <span className="fab-glow" />
          <span className="fab-pulse-dot" />
          <Sparkles size={16} className="fab-icon" />
          <span className="fab-text">Enquire Now</span>
        </button>
      </div>

      <FaqModal
        isOpen={isFaqOpen}
        onClose={() => setIsFaqOpen(false)}
        onOpenEnquiry={() => {
          setIsFaqOpen(false);
          setIsEnquiryOpen(true);
        }}
      />

      <EnquiryModal
        isOpen={isEnquiryOpen}
        onClose={() => setIsEnquiryOpen(false)}
      />
    </>
  );
}
