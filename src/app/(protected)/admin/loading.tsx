function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const comicCards = Array.from({ length: 6 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-black p-6 text-white"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/80">
                Loading Admin
              </span>
            </div>

            <Skeleton className="h-9 w-32" />
            <Skeleton className="mt-3 h-4 w-56" />
          </div>

          <div className="flex flex-col gap-2">
            <Skeleton className="h-10 w-32 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <Skeleton className="h-7 w-44" />
          <Skeleton className="mt-3 h-4 w-72 max-w-full" />

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>

          <Skeleton className="mt-5 h-12 w-40 rounded-xl bg-cyan-300/30" />
        </div>

        <section className="space-y-5">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <Skeleton className="h-7 w-36" />
              <Skeleton className="mt-2 h-4 w-64" />
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {comicCards.map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 backdrop-blur-md"
              >
                <Skeleton className="aspect-[16/10] w-full rounded-none" />

                <div className="p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-[85%]" />

                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </section>
  );
}
