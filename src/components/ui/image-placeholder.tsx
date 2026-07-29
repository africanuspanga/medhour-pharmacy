import { cn } from "@/lib/utils";

/**
 * Placeholder shown while the pharmacy has not uploaded a real image yet.
 * Keeps layout stable — replace by rendering a real <Image> once
 * product_images / category image_url values exist in Supabase.
 */
export function ImagePlaceholder({
  label,
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-2 bg-surface text-ink/30",
        className
      )}
      role="img"
      aria-label={label ? `Image of ${label} coming soon` : "Image coming soon"}
    >
      <svg className="h-10 w-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <circle cx="9" cy="9" r="2" />
        <path strokeLinecap="round" d="M21 15l-5-5-9 9" />
      </svg>
      {label && <span className="max-w-[80%] truncate text-xs font-medium">{label}</span>}
    </div>
  );
}
