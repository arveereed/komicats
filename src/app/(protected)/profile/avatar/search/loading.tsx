function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const cards = Array.from({ length: 12 });

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="relative z-10 mx-auto max-w-7xl px-4 py-8"
    >
      <div className="mb-6 flex items-center justify-between gap-4">
        <div>
          <Skeleton className="h-7 w-36" />
          <Skeleton className="mt-2 h-4 w-48" />
        </div>
        <Skeleton className="hidden h-11 w-64 rounded-full sm:block" />
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {cards.map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Skeleton className="h-full w-full rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
