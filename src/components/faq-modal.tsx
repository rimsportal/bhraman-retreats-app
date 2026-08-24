"use client";

import { useEffect, useMemo, useState } from "react";
import {
  ChevronDown,
  Compass,
  HelpCircle,
  Loader2,
  Mail,
  MessageCircle,
  Phone,
  Search,
  Sparkles,
  X,
} from "lucide-react";
import { SectionLabel } from "@/components/design-system";
import { FaqItem, PREDEFINED_FAQS } from "@/lib/faqs-data";

interface FaqModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenEnquiry?: () => void;
}

const CATEGORIES = [
  "All Questions",
  "The Journey",
  "Ladakh & Altitude",
  "Inclusions & Comfort",
  "Booking & Preparation",
] as const;

export function FaqModal({ isOpen, onClose, onOpenEnquiry }: FaqModalProps) {
  const [faqs, setFaqs] = useState<FaqItem[]>(PREDEFINED_FAQS);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All Questions");
  const [expandedId, setExpandedId] = useState<string | null>("faq-1");

  useEffect(() => {
    async function loadFaqs() {
      setLoading(true);
      try {
        const res = await fetch("/api/public/faqs");
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.faqs) && data.faqs.length > 0) {
            setFaqs(data.faqs);
          }
        }
      } catch (err) {
        console.error("Failed to load FAQs:", err);
      } finally {
        setLoading(false);
      }
    }

    if (isOpen) {
      loadFaqs();
    }
  }, [isOpen]);

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

  const filteredFaqs = useMemo(() => {
    return faqs.filter((item) => {
      const matchesCategory =
        selectedCategory === "All Questions" || item.category === selectedCategory;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        item.question.toLowerCase().includes(q) ||
        item.answer.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q);
      return matchesCategory && matchesSearch;
    });
  }, [faqs, selectedCategory, search]);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  if (!isOpen) return null;

  return (
    <div
      className="faq-modal-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="faq-modal-title"
      onClick={onClose}
    >
      <div
        className="faq-modal-card"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          type="button"
          className="faq-modal-close"
          onClick={onClose}
          aria-label="Close FAQ dialog"
        >
          <X size={20} />
        </button>

        {/* Modal Header */}
        <div className="faq-modal-header">
          <SectionLabel>QUESTIONS &amp; CLARITY</SectionLabel>
          <h3 id="faq-modal-title" className="faq-modal-title">
            Frequently Asked Questions
          </h3>
          <p className="faq-modal-subtitle">
            Essential insights into our five-element Himalayan sanctuary, high-altitude preparation, and retreat reservations.
          </p>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="faq-filter-wrap">
          <div className="faq-search-box">
            <Search size={15} className="faq-search-icon" />
            <input
              type="text"
              placeholder="Search by topic, altitude, meals, packing..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="faq-search-input"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="faq-search-clear"
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <div className="faq-categories-list">
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`faq-category-pill ${isActive ? "active" : ""}`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* FAQ Accordion List */}
        <div className="faq-list-container">
          {loading ? (
            <div className="faq-loading-state">
              <Loader2 size={24} className="spin" />
              <p>Loading questions &amp; answers...</p>
            </div>
          ) : filteredFaqs.length === 0 ? (
            <div className="faq-empty-state">
              <HelpCircle size={32} />
              <h4>No matching questions found</h4>
              <p>Try refining your search keyword or browse other categories.</p>
            </div>
          ) : (
            filteredFaqs.map((faq, idx) => {
              const isExpanded = expandedId === faq.id;
              return (
                <div
                  key={faq.id || idx}
                  className={`faq-accordion-item ${isExpanded ? "open" : ""}`}
                >
                  <button
                    type="button"
                    className="faq-accordion-trigger"
                    onClick={() => toggleExpand(faq.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="faq-q-left">
                      <span className="faq-category-tag">{faq.category}</span>
                      <h4 className="faq-question-text">{faq.question}</h4>
                    </div>
                    <ChevronDown
                      size={18}
                      className={`faq-chevron ${isExpanded ? "rotated" : ""}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="faq-accordion-content">
                      <p>{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Direct Contact Footer / Bridge to Enquiry */}
        <div className="faq-modal-footer-bridge">
          <div className="faq-bridge-text">
            <h5>Have a personal intention or medical question?</h5>
            <p>Dr. Pratiksha Shekhawat is available for direct consultation.</p>
          </div>

          <div className="faq-bridge-actions">
            <a
              href="https://wa.me/918700402837"
              target="_blank"
              rel="noopener noreferrer"
              className="faq-btn-wa"
            >
              <MessageCircle size={14} /> WhatsApp
            </a>

            {onOpenEnquiry && (
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEnquiry();
                }}
                className="faq-btn-enquire"
              >
                <Sparkles size={14} /> Enquire Now
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
