function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const episodeRows = Array.from({ length: 5 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen overflow-hidden bg-[#05090c] text-white"
    >
      <div className="relative min-h-[720px] overflow-hidden bg-black">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1a2f36_0%,_#0d171b_42%,_#05080b_100%)]" />
        <div className="absolute inset-0 bg-black/20" />

        <div className="relative min-h-[720px]">
          <Skeleton className="absolute inset-0 rounded-none" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#07141a] via-[#07141a]/45 to-transparent" />
        </div>

        <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
          <Skeleton className="h-10 w-10 rounded-full" />
        </div>

        <div className="absolute inset-x-0 bottom-5 z-20">
          <div className="bg-[linear-gradient(180deg,rgba(19,31,36,0.72)_0%,rgba(8,15,18,0.94)_100%)] px-4 pb-6 pt-4 backdrop-blur-md sm:px-6">
            <div className="mx-auto max-w-5xl">
              <Skeleton className="h-9 w-2/3 max-w-md" />

              <div className="mt-3 flex flex-wrap gap-2">
                <Skeleton className="h-4 w-16 rounded-full" />
                <Skeleton className="h-4 w-12 rounded-full" />
                <Skeleton className="h-4 w-24 rounded-full" />
              </div>

              <div className="mt-5 flex flex-col gap-2">
                <Skeleton className="h-12 w-full rounded-[4px] bg-white/30" />
                <Skeleton className="h-12 w-full rounded-[4px]" />
              </div>

              <div className="mt-5 space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-[80%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative z-10 -mt-2 px-4 pb-8 sm:px-6">
        <div className="mx-auto w-full max-w-5xl">
          <div className="mt-4 flex flex-wrap gap-6 border-b border-white/10 text-sm font-semibold">
            <Skeleton className="h-5 w-20 rounded-full" />
          </div>

          <div className="mt-5 space-y-4">
            {episodeRows.map((_, index) => (
              <div
                key={index}
                className="flex items-start gap-4 rounded-2xl p-2"
              >
                <Skeleton className="h-24 w-20 shrink-0 rounded-xl sm:h-28 sm:w-24" />

                <div className="min-w-0 flex-1 pt-1">
                  <Skeleton className="h-6 w-2/3" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-[88%]" />
                  <Skeleton className="mt-3 h-4 w-20" />
                </div>
              </div>
            ))}
          </div>

          <Skeleton className="mt-8 h-4 w-44" />
        </div>
      </div>
    </section>
  );
}
