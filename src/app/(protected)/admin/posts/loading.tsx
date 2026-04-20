function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const postCards = Array.from({ length: 4 });

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-black font-sans text-white"
    >
      <div className="mx-auto max-w-[1600px] px-4 py-4 lg:px-6">
        <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 backdrop-blur-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Skeleton className="h-3 w-24 rounded-full" />
            <Skeleton className="mt-3 h-7 w-40" />
          </div>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl" />
            <Skeleton className="h-10 w-36 rounded-xl bg-cyan-300/30" />
          </div>
        </div>

        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-2xl">
          <Skeleton className="aspect-[18/7] w-full rounded-none" />

          <div className="p-5 sm:p-6">
            <Skeleton className="h-9 w-2/3 max-w-xl" />
            <Skeleton className="mt-3 h-4 w-48" />
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-4 flex items-end justify-between gap-4">
            <div>
              <Skeleton className="h-7 w-32" />
              <Skeleton className="mt-2 h-4 w-56" />
            </div>
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            {postCards.map((_, index) => (
              <div
                key={index}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05]"
              >
                <Skeleton className="aspect-[4/5] w-full rounded-none" />

                <div className="p-4">
                  <Skeleton className="h-5 w-3/4" />
                  <Skeleton className="mt-2 h-4 w-24" />

                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-9 w-20 rounded-xl" />
                    <Skeleton className="h-9 w-20 rounded-xl" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
