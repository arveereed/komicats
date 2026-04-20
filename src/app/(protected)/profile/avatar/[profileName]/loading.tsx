function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const comicCards = Array.from({ length: 12 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8"
    >
      <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute left-0 top-8 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-0 top-1/3 h-52 w-52 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-44 w-44 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="mb-6 flex items-center justify-between">
        <div>
          <Skeleton className="h-8 w-44 sm:h-9 sm:w-56" />
          <Skeleton className="mt-3 h-4 w-40 sm:w-56" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {comicCards.map((_, index) => (
          <div
            key={index}
            className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-0 shadow-lg"
          >
            <div className="relative aspect-[3/4] overflow-hidden">
              <Skeleton className="h-full w-full rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-1/2" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
