export default function Loading() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 lg:px-8">
      <div className="h-4 w-64 animate-pulse rounded bg-surface" />
      <div className="mt-6 grid gap-10 lg:grid-cols-2">
        <div className="aspect-square animate-pulse rounded-2xl bg-surface" />
        <div className="space-y-4">
          <div className="h-4 w-24 animate-pulse rounded bg-surface" />
          <div className="h-9 w-3/4 animate-pulse rounded-lg bg-surface" />
          <div className="h-4 w-1/2 animate-pulse rounded bg-surface" />
          <div className="h-10 w-40 animate-pulse rounded-lg bg-surface" />
          <div className="h-24 animate-pulse rounded-xl bg-surface" />
          <div className="h-12 w-full animate-pulse rounded-full bg-surface sm:w-64" />
        </div>
      </div>
    </div>
  );
}
