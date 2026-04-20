function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const pages = Array.from({ length: 4 });

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-[#05090c] text-white"
    >
      <header className="sticky top-0 z-40 border-b border-white/10 bg-black/90 backdrop-blur-xl">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div>
              <Skeleton className="h-5 w-40" />
              <Skeleton className="mt-2 h-3 w-28" />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-10 rounded-xl" />
            <Skeleton className="h-10 w-24 rounded-xl" />
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-4 py-6">
        <div className="mb-6 rounded-3xl border border-white/10 bg-white/[0.04] p-5">
          <Skeleton className="h-8 w-2/3 max-w-md" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-4 w-[90%]" />

          <div className="mt-5 flex flex-wrap gap-3">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>

        <div className="space-y-8">
          {pages.map((_, index) => (
            <div key={index} className="overflow-hidden rounded-3xl">
              <Skeleton className="aspect-[3/4] w-full rounded-3xl" />
            </div>
          ))}
        </div>

        <div className="mt-8 flex items-center justify-between gap-4">
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>
    </main>
  );
}
