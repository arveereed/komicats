function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const downloadCards = Array.from({ length: 12 });

export default function Loading() {
  return (
    <>
      <div
        aria-busy="true"
        aria-live="polite"
        className="sticky top-0 z-50 mb-6 flex h-16 w-full items-center justify-between gap-3 border-b border-white/10 bg-black/95 px-4 backdrop-blur-xl"
      >
        <Skeleton className="h-9 w-9 rounded-full sm:h-10 sm:w-10" />

        <div className="flex items-center justify-center space-x-4">
          <Skeleton className="h-5 w-5 rounded-md" />
          <Skeleton className="h-6 w-28" />
        </div>

        <div className="w-9 sm:w-10" />
      </div>

      <section className="relative mx-auto w-full max-w-7xl px-4 py-6 text-white md:px-6 md:py-8">
        <div className="mb-4 rounded-xl border border-yellow-400/20 bg-yellow-400/10 px-4 py-3">
          <Skeleton className="h-4 w-3/4 bg-yellow-200/20 ring-yellow-100/10" />
        </div>

        <div className="mb-6">
          <div className="mb-3 flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/80">
              Loading Downloads
            </span>
          </div>

          <Skeleton className="h-8 w-44" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {downloadCards.map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg"
            >
              <div className="relative aspect-[3/4] overflow-hidden">
                <Skeleton className="h-full w-full rounded-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

                <div className="absolute inset-x-0 bottom-0 p-3">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="mt-2 h-3 w-1/2" />
                  <Skeleton className="mt-3 h-3 w-24 bg-emerald-300/20 ring-emerald-100/10" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}
