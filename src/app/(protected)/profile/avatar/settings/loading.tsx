function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const profileRows = Array.from({ length: 3 });
const emailRows = Array.from({ length: 2 });

export default function Loading() {
  return (
    <div
      aria-busy="true"
      aria-live="polite"
      className="relative z-10 mx-auto flex w-full max-w-5xl flex-col gap-4 px-3 py-6 sm:gap-5 sm:px-4 sm:py-8"
    >
      <div className="rounded-3xl border border-white/10 bg-[#375055] px-4 py-5 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:px-6">
        <Skeleton className="h-8 w-44" />
        <Skeleton className="mt-3 h-4 w-72 max-w-full" />
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#375055] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)] sm:p-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Skeleton className="h-14 w-14 rounded-2xl" />
            <div>
              <Skeleton className="h-5 w-32" />
              <Skeleton className="mt-2 h-4 w-28" />
            </div>
          </div>
          <Skeleton className="h-10 w-28 rounded-2xl" />
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {profileRows.map((_, index) => (
            <Skeleton key={index} className="h-16 w-full rounded-2xl" />
          ))}
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#375055] p-4 shadow-[0_20px_60px_rgba(0,0,0,0.28)] sm:p-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="mt-2 h-4 w-52 max-w-full" />
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div>
            <Skeleton className="h-5 w-28" />
            <Skeleton className="mt-3 h-11 w-full rounded-xl" />
            <Skeleton className="mt-3 h-11 w-full rounded-xl" />
          </div>

          <div>
            <Skeleton className="h-5 w-24" />
            <div className="mt-3 space-y-3">
              {emailRows.map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4"
                >
                  <Skeleton className="h-4 w-40" />
                  <Skeleton className="mt-2 h-3 w-24" />
                  <div className="mt-4 flex gap-2">
                    <Skeleton className="h-9 w-24 rounded-xl" />
                    <Skeleton className="h-9 w-24 rounded-xl" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-3xl border border-white/10 bg-[#375055] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
        <div className="flex items-center justify-between rounded-2xl border border-red-300/15 bg-red-400/10 px-4 py-3">
          <div>
            <Skeleton className="h-4 w-20 bg-red-200/20" />
            <Skeleton className="mt-2 h-3 w-40 bg-red-200/20" />
          </div>
          <Skeleton className="h-10 w-10 rounded-xl bg-red-200/20" />
        </div>
      </div>
    </div>
  );
}
