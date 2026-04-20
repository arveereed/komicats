function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const planRows = Array.from({ length: 4 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen bg-black p-6 text-white"
    >
      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="mb-3 flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/80">
                Loading Plans
              </span>
            </div>

            <Skeleton className="h-9 w-52" />
            <Skeleton className="mt-3 h-4 w-72 max-w-full" />
          </div>

          <Skeleton className="h-10 w-32 rounded-xl" />
        </div>

        <div className="grid gap-8 xl:grid-cols-[420px,minmax(0,1fr)]">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <Skeleton className="h-7 w-44" />
            <Skeleton className="mt-3 h-4 w-52" />

            <div className="mt-6 space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-24 w-full rounded-2xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-36 rounded-xl bg-cyan-300/30" />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="mt-3 h-4 w-60" />

            <div className="mt-6 space-y-4">
              {planRows.map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <Skeleton className="h-5 w-32" />
                      <Skeleton className="mt-3 h-4 w-24" />
                    </div>
                    <Skeleton className="h-9 w-20 rounded-xl" />
                  </div>

                  <div className="mt-4 space-y-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-4 w-[85%]" />
                    <Skeleton className="h-4 w-[70%]" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
