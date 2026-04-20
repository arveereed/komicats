function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const plans = Array.from({ length: 3 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8"
    >
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#233d45] via-[#13262d] to-[#081318]" />
        <div className="absolute left-10 top-16 h-44 w-44 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-6 bottom-10 h-52 w-52 rounded-full bg-teal-400/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="overflow-hidden rounded-3xl border border-white/10 bg-[#375055]/80 text-white shadow-2xl backdrop-blur-xl">
          <div className="p-5 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div className="flex flex-col gap-6">
                <div className="flex items-center gap-4 sm:gap-5">
                  <Skeleton className="h-16 w-16 rounded-2xl sm:h-20 sm:w-20" />
                  <div>
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="mt-3 h-12 w-32 sm:w-40" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 sm:max-w-md sm:gap-4">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="mt-3 h-8 w-16" />
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                    <Skeleton className="h-4 w-16" />
                    <Skeleton className="mt-3 h-8 w-16" />
                  </div>
                </div>
              </div>

              <Skeleton className="hidden h-12 w-72 rounded-2xl md:block" />
            </div>
          </div>
        </div>

        <div>
          <Skeleton className="h-8 w-48" />
          <Skeleton className="mt-2 h-4 w-64 max-w-full" />

          <div className="mt-6 grid gap-6 lg:grid-cols-3">
            {plans.map((_, index) => (
              <div
                key={index}
                className="rounded-3xl border border-white/10 bg-white/[0.05] p-5 shadow-2xl backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <Skeleton className="h-6 w-28" />
                    <Skeleton className="mt-3 h-10 w-36" />
                  </div>
                  <Skeleton className="h-8 w-20 rounded-full" />
                </div>

                <div className="mt-5 space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-[90%]" />
                  <Skeleton className="h-4 w-[82%]" />
                </div>

                <Skeleton className="mt-6 h-12 w-full rounded-2xl bg-cyan-300/30" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
