function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const profileSlots = Array.from({ length: 5 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-4 py-10 sm:px-6"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-20 h-44 w-44 -translate-x-1/2 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute left-10 top-1/3 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="absolute bottom-16 right-8 h-52 w-52 rounded-full bg-sky-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex w-full max-w-6xl flex-col items-center">
        <div className="mb-10 text-center sm:mb-12">
          <div className="mx-auto mb-4 flex items-center justify-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
              <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
            </span>
            <span className="text-xs font-medium uppercase tracking-[0.28em] text-cyan-100/80">
              Loading Profiles
            </span>
          </div>

          <Skeleton className="mx-auto h-10 w-56 sm:h-12 sm:w-72" />
          <Skeleton className="mx-auto mt-3 h-4 w-40 sm:w-52" />
        </div>

        <div className="grid w-full grid-cols-2 justify-items-center gap-x-5 gap-y-8 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 lg:gap-x-8 lg:gap-y-10">
          {profileSlots.map((_, index) => (
            <div
              key={index}
              className="flex w-full max-w-[150px] flex-col items-center gap-4 sm:max-w-[170px]"
            >
              <div className="relative">
                <Skeleton className="h-28 w-28 rounded-2xl sm:h-32 sm:w-32 md:h-36 md:w-36" />
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-b from-white/10 to-transparent" />
              </div>
              <Skeleton className="h-5 w-20 rounded-full sm:w-24" />
            </div>
          ))}

          <div className="flex w-full max-w-[150px] flex-col items-center gap-4 sm:max-w-[170px]">
            <div className="flex h-28 w-28 items-center justify-center rounded-2xl border-2 border-dashed border-white/15 bg-white/[0.03] sm:h-32 sm:w-32 md:h-36 md:w-36">
              <div className="h-10 w-10 rounded-full bg-white/10" />
            </div>
            <Skeleton className="h-5 w-24 rounded-full" />
          </div>
        </div>

        <div className="mt-14 w-full max-w-xs sm:mt-16">
          <Skeleton className="h-11 w-full rounded-full" />
        </div>

        <div className="mt-6 flex items-center gap-3 text-sm text-white/60">
          <span className="h-2 w-2 animate-pulse rounded-full bg-cyan-300" />
          <span>Preparing your profiles...</span>
        </div>
      </div>
    </section>
  );
}
