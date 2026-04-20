function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const episodeRows = Array.from({ length: 6 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="relative min-h-screen overflow-hidden text-white"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#264149] via-[#10242b] to-[#061117]" />
        <div className="absolute left-6 top-10 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-0 top-24 h-56 w-56 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-xl">
          <div className="relative h-[320px] sm:h-[420px]">
            <Skeleton className="h-full w-full rounded-none" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#07141a] via-[#07141a]/45 to-transparent" />

            <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8">
              <Skeleton className="h-5 w-24 rounded-full" />
              <Skeleton className="mt-4 h-10 w-2/3 max-w-md" />
              <Skeleton className="mt-3 h-4 w-40" />

              <div className="mt-5 flex flex-wrap gap-3">
                <Skeleton className="h-11 w-28 rounded-full bg-cyan-300/30" />
                <Skeleton className="h-11 w-28 rounded-full" />
                <Skeleton className="h-11 w-28 rounded-full" />
              </div>
            </div>
          </div>

          <div className="grid gap-6 p-5 sm:p-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <Skeleton className="h-6 w-36" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-[92%]" />
              <Skeleton className="mt-2 h-4 w-[80%]" />
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/[0.04] p-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-4 h-4 w-full" />
              <Skeleton className="mt-2 h-4 w-[85%]" />
              <Skeleton className="mt-5 h-10 w-full rounded-xl" />
            </div>
          </div>
        </div>

        <div className="mt-8 rounded-3xl border border-white/10 bg-white/[0.04] p-4 shadow-xl sm:p-6">
          <Skeleton className="h-7 w-40" />

          <div className="mt-5 space-y-4">
            {episodeRows.map((_, index) => (
              <div
                key={index}
                className="flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-3"
              >
                <Skeleton className="h-20 w-16 shrink-0 rounded-xl sm:h-24 sm:w-20" />
                <div className="min-w-0 flex-1">
                  <Skeleton className="h-5 w-2/3" />
                  <Skeleton className="mt-2 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-4/5" />
                </div>
                <Skeleton className="h-10 w-24 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
