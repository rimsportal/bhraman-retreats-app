"use client";

import {
  type AnchorHTMLAttributes,
  type BlockquoteHTMLAttributes,
  type HTMLAttributes,
  type ImgHTMLAttributes,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import { ArrowRight } from "lucide-react";

const classes = (...values: Array<string | undefined | false>) => values.filter(Boolean).join(" ");

export function SectionContainer({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={classes("section-container", className)} {...props} />;
}

export function SectionLabel({ className, ...props }: HTMLAttributes<HTMLParagraphElement>) {
  return <p className={classes("eyebrow", className)} {...props} />;
}

type EditorialHeadingProps = HTMLAttributes<HTMLHeadingElement> & {
  as?: "h1" | "h2" | "h3";
};

export function EditorialHeading({ as: Heading = "h2", className, ...props }: EditorialHeadingProps) {
  return <Heading className={classes("editorial-heading", className)} {...props} />;
}

type ElementBadgeProps = {
  number: string;
  label?: string;
  className?: string;
};

export function ElementBadge({ number, label, className }: ElementBadgeProps) {
  return (
    <span className={classes("element-badge", className)}>
      <span>{number}</span>
      {label && <small>{label}</small>}
    </span>
  );
}

type ButtonLinkProps = AnchorHTMLAttributes<HTMLAnchorElement> & {
  children: ReactNode;
  showArrow?: boolean;
  onDark?: boolean;
};

export function PrimaryButton({ className, children, showArrow = true, onDark = false, ...props }: ButtonLinkProps) {
  return (
    <a className={classes("button", onDark ? "button-light" : "button-dark", className)} {...props}>
      {children}
      {showArrow && <ArrowRight size={18} aria-hidden="true" />}
    </a>
  );
}

export function SecondaryButton({ className, children, showArrow = false, onDark = false, ...props }: ButtonLinkProps) {
  return (
    <a className={classes("text-link", onDark && "light", className)} {...props}>
      {children}
      {showArrow && <ArrowRight size={17} aria-hidden="true" />}
    </a>
  );
}

type RetreatDateBadgeProps = {
  start: Date;
  end: Date;
  className?: string;
};

export function RetreatDateBadge({ start, end, className }: RetreatDateBadgeProps) {
  return (
    <div className={classes("date-stamp", className)} aria-label={`${start.getDate()} to ${end.getDate()} ${end.toLocaleDateString("en-GB", { month: "long", year: "numeric" })}`}>
      <span>{start.getDate()}—{end.getDate()}</span>
      <small>{end.toLocaleDateString("en-GB", { month: "short" }).toUpperCase()}<br />{end.getFullYear()}</small>
    </div>
  );
}

type QuoteBlockProps = BlockquoteHTMLAttributes<HTMLQuoteElement> & {
  attribution?: ReactNode;
};

export function QuoteBlock({ className, children, attribution, ...props }: QuoteBlockProps) {
  return (
    <figure className={classes("quote-block", className)}>
      <blockquote {...props}>{children}</blockquote>
      {attribution && <figcaption>{attribution}</figcaption>}
    </figure>
  );
}

type ResponsiveMediaProps = Omit<ImgHTMLAttributes<HTMLImageElement>, "src"> & {
  src?: string | null;
  fallbackTitle: string;
  fallbackHint?: string;
  priority?: boolean;
  blurDataUrl?: string;
};

export function ResponsiveMedia({
  src,
  alt,
  className,
  fallbackTitle,
  fallbackHint = "Image reference not configured",
  priority = false,
  blurDataUrl,
  style,
  onError,
  ...props
}: ResponsiveMediaProps) {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  if (!src || hasError) {
    return (
      <span className="image-placeholder" role="img" aria-label={`${fallbackTitle}. ${fallbackHint}`}>
        {fallbackTitle}<br /><small>{fallbackHint}</small>
      </span>
    );
  }

  const combinedStyle = blurDataUrl
    ? {
        backgroundImage: `url("${blurDataUrl}")`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        ...style,
      }
    : style;

  return (
    <img
      className={classes("slot-img", "responsive-media", className)}
      src={src}
      alt={alt ?? ""}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : undefined}
      decoding="async"
      style={combinedStyle}
      onError={(e) => {
        setHasError(true);
        onError?.(e);
      }}
      {...props}
    />
  );
}
