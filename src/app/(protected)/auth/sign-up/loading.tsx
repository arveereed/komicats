function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="relative flex min-h-svh items-center justify-center overflow-hidden bg-cover bg-center bg-no-repeat px-4 py-12 text-white"
      style={{ backgroundImage: "url('/BACKGROUND.png')" }}
    >
      <div className="absolute inset-0 bg-black/55" />

      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -left-20 top-20 h-48 w-48 rounded-full bg-teal-400/15 blur-3xl sm:h-72 sm:w-72" />
        <div className="absolute -right-20 bottom-12 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl sm:h-80 sm:w-80" />
        <div className="absolute left-1/2 top-1/3 h-32 w-32 -translate-x-1/2 rounded-full bg-white/5 blur-2xl" />
      </div>

      <div className="relative z-10 w-full max-w-[480px]">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex items-center justify-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-teal-300 opacity-70" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-teal-300" />
              </span>
              <span className="text-xs font-medium uppercase tracking-[0.24em] text-teal-200/90">
                Loading
              </span>
            </div>

            <Skeleton className="mx-auto h-8 w-48 sm:h-9 sm:w-56" />
            <Skeleton className="mx-auto mt-3 h-4 w-44 sm:w-52" />
          </div>

          <div className="space-y-5">
            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div>
              <Skeleton className="mb-2 h-4 w-20" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div>
              <Skeleton className="mb-2 h-4 w-16" />
              <Skeleton className="h-12 w-full rounded-xl" />
            </div>

            <div className="flex items-center gap-2">
              <Skeleton className="h-4 w-4 rounded-md" />
              <Skeleton className="h-4 w-40 sm:w-52" />
            </div>

            <Skeleton className="mt-2 h-12 w-full rounded-xl bg-teal-300/30" />

            <div className="pt-2 text-center">
              <Skeleton className="mx-auto h-4 w-52 sm:w-60" />
            </div>
          </div>

          <div className="mt-8 flex items-center justify-center gap-3 text-sm text-white/60">
            <span className="h-2 w-2 animate-pulse rounded-full bg-teal-300" />
            <span>Preparing your sign-up experience...</span>
          </div>
        </div>
      </div>
    </div>
  );
}
