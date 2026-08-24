"use client";

import { useState } from "react";
import { usePathname } from "next/navigation";
import { Compass, Sparkles } from "lucide-react";
import { EnquiryModal } from "@/components/enquiry-modal";

export function FloatingEnquiryFab() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Do not render floating enquiry button in admin dashboard
  if (pathname.startsWith("/admin")) return null;

  return (
    <>
      <div className="floating-enquire-fab-wrap">
        <button
          type="button"
          className="floating-enquire-fab"
          onClick={() => setIsOpen(true)}
          aria-label="Open Enquiry Form"
        >
          <span className="fab-glow" />
          <span className="fab-pulse-dot" />
          <Sparkles size={16} className="fab-icon" />
          <span className="fab-text">Enquire Now</span>
        </button>
      </div>

      <EnquiryModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
    </>
  );
}
