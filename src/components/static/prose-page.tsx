import { cn } from "@/lib/utils";

/**
 * Shared wrapper for static content pages (about, policies, FAQ, etc.).
 * The Tailwind typography plugin is not installed, so prose elements are
 * styled manually via descendant arbitrary variants.
 */
export function ProsePage({
  title,
  intro,
  children,
  className,
}: {
  title: string;
  intro?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className="bg-white">
      <div className={cn("mx-auto max-w-3xl px-4 py-12 sm:px-6 sm:py-16", className)}>
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">{title}</h1>
        {intro && <p className="mt-4 text-lg leading-relaxed text-ink/60">{intro}</p>}
        <div
          className={cn(
            "mt-8",
            "[&_h2]:mt-10 [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-ink",
            "[&_h3]:mt-6 [&_h3]:text-base [&_h3]:font-semibold [&_h3]:text-ink",
            "[&_p]:mt-4 [&_p]:leading-relaxed [&_p]:text-ink/70",
            "[&_ul]:mt-4 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6 [&_ul]:text-ink/70",
            "[&_ol]:mt-4 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_ol]:text-ink/70",
            "[&_li]:leading-relaxed",
            "[&_strong]:font-semibold [&_strong]:text-ink",
            "[&_a]:font-medium [&_a]:break-words [&_a]:text-brand [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-brand-dark"
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}
