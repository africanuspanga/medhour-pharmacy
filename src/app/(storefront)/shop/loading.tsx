import { Spinner } from "@/components/ui/feedback";

export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="h-9 w-32 animate-pulse rounded-lg bg-surface" />
      <div className="mt-2 h-4 w-24 animate-pulse rounded bg-surface" />
      <div className="mt-6 grid gap-8 lg:grid-cols-[240px_1fr]">
        <div className="hidden h-96 animate-pulse rounded-2xl bg-surface lg:block" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="overflow-hidden rounded-2xl border border-ink/8 bg-white">
              <div className="aspect-square animate-pulse bg-surface" />
              <div className="space-y-2 p-4">
                <div className="h-3 w-1/2 animate-pulse rounded bg-surface" />
                <div className="h-4 w-3/4 animate-pulse rounded bg-surface" />
                <div className="h-4 w-1/3 animate-pulse rounded bg-surface" />
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="mt-8 flex justify-center" aria-hidden>
        <Spinner />
      </div>
    </div>
  );
}
