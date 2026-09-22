"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn, SITE_CONFIG } from "@/features/shared";

/**
 * Shared page header panel with primary background, optional image/icon,
 * title/subtitle, and built-in browser navigation buttons.
 *
 * @param {Object} props
 * @param {string} props.title - Main heading text.
 * @param {string} [props.subtitle] - Secondary descriptive text below the title.
 * @param {React.ReactNode} [props.children] - Replaces the default logo image when provided (icon, avatar, etc.).
 * @param {string} [props.imageSrc] - URL for the default logo image. Ignored if children is provided.
 * @param {string} [props.imageAlt] - Alt text for the logo image.
 * @param {boolean} [props.showNav=true] - Whether to show back/forward browser navigation buttons.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.imageClassName] - Additional CSS classes for the image wrapper.
 */
export function PageHeader({
  title,
  subtitle,
  children,
  imageSrc = SITE_CONFIG.PAGE_HEADER.imageSrc,
  imageAlt = SITE_CONFIG.PAGE_HEADER.imageAlt,
  showNav = true,
  className,
  imageClassName,
}) {
  return (
    <div
      className={cn(
        "relative rounded-2xl px-5 pt-10 pb-10 md:col-span-2 overflow-hidden",
        className
      )}
      style={{
        background: `
          linear-gradient(160deg, oklch(0.48 0.04 254) 0%, var(--primary) 50%, oklch(0.34 0.02 250) 100%)
        `,
      }}
    >
      {/* Pulse accent dot — bottom-right */}
      <span className="absolute bottom-3 right-3 z-10 flex size-3" aria-hidden="true">
        <span
          className="absolute inset-0 rounded-full animate-ping opacity-40"
          style={{ background: "oklch(0.88 0.18 90)" }}
        />
        <span
          className="relative size-3 rounded-full"
          style={{
            background: "oklch(0.88 0.18 90)",
            boxShadow: "0 0 10px oklch(0.88 0.18 90 / 0.6)",
          }}
        />
      </span>

      {/* Browser navigation buttons */}
      {showNav && (
        <div className="absolute top-3 right-3 flex gap-2 rounded-lg bg-zinc-600/80 p-1 backdrop-blur-sm">
          <button
            className="rounded-full p-1 transition-colors hover:bg-white/10"
            onClick={() => window.history.back()}
            aria-label="Go back"
            type="button"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <button
            className="rounded-full p-1 transition-colors hover:bg-white/10"
            onClick={() => window.history.forward()}
            aria-label="Go forward"
            type="button"
          >
            <ArrowRight className="h-4 w-4 text-white" />
          </button>
        </div>
      )}

      {/* Content row: image/icon + title block */}
      <div className="flex items-center">
        {/* Left slot: custom children or default image */}
        {children ? (
          <div className={cn("shrink-0", imageClassName)}>{children}</div>
        ) : imageSrc ? (
          <div className={cn("shrink-0", imageClassName)}>
            <img
              className="size-25 rounded-2xl object-cover"
              src={imageSrc}
              alt={imageAlt}
            />
          </div>
        ) : null}

        {/* Title + subtitle */}
        <div
          className={cn(
            "flex flex-col justify-center",
            (children || imageSrc) && "ml-4"
          )}
        >
          <h2 className="text-4xl font-semibold tracking-tight text-white sm:text-4xl">
            {title}
          </h2>
          {subtitle && (
            <p className="text-base/7 font-semibold text-primary-foreground/80">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
