"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { cn, SITE_CONFIG } from "@/features/shared";

/**
 * Shared page header panel with the Caimanera brand gradient,
 * optional image/icon, title/subtitle, and optional navigation buttons.
 *
 * @param {Object} props
 * @param {string} props.title - Main heading text.
 * @param {string} [props.subtitle] - Secondary descriptive text below the title.
 * @param {React.ReactNode} [props.children] - Replaces the default logo image when provided (icon, avatar, etc.).
 * @param {string} [props.imageSrc] - URL for the default logo image. Ignored if children is provided.
 * @param {string} [props.imageAlt] - Alt text for the logo image.
 * @param {boolean} [props.showNav=false] - Whether to show back/forward browser navigation buttons.
 * @param {string} [props.className] - Additional CSS classes for the root container.
 * @param {string} [props.imageClassName] - Additional CSS classes for the image wrapper.
 */
export function PageHeader({
  title,
  subtitle,
  children,
  imageSrc = SITE_CONFIG.PAGE_HEADER.imageSrc,
  imageAlt = SITE_CONFIG.PAGE_HEADER.imageAlt,
  showNav = false,
  className,
  imageClassName,
}) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-[oklch(0.42_0.13_157)] to-[oklch(0.28_0.06_165)] px-5 py-6 text-primary-foreground shadow-sm sm:px-6 sm:py-7",
        className
      )}
    >
      <div className="pointer-events-none absolute -right-12 -top-16 size-48 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-20 left-1/4 size-48 rounded-full bg-black/10 blur-2xl" />

      {showNav && (
        <div className="absolute right-3 top-3 z-10 flex gap-1 rounded-lg bg-black/20 p-1 backdrop-blur-sm">
          <button
            className="rounded-full p-1 transition-colors hover:bg-white/15"
            onClick={() => window.history.back()}
            aria-label="Atrás"
            type="button"
          >
            <ArrowLeft className="h-4 w-4 text-white" />
          </button>
          <button
            className="rounded-full p-1 transition-colors hover:bg-white/15"
            onClick={() => window.history.forward()}
            aria-label="Adelante"
            type="button"
          >
            <ArrowRight className="h-4 w-4 text-white" />
          </button>
        </div>
      )}

      <div className="relative z-10 flex items-center gap-4">
        {children ? (
          <div className={cn("shrink-0", imageClassName)}>{children}</div>
        ) : imageSrc ? (
          <div className={cn("shrink-0", imageClassName)}>
            <img
              className="size-14 rounded-2xl bg-white/10 object-contain p-1.5 sm:size-16"
              src={imageSrc}
              alt={imageAlt}
            />
          </div>
        ) : null}

        <div className="min-w-0">
          <h1 className="truncate text-2xl font-bold tracking-tight sm:text-3xl">
            {title}
          </h1>
          {subtitle && (
            <p className="mt-1 line-clamp-2 text-sm text-primary-foreground/80 sm:text-base">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
