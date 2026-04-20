function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const items = Array.from({ length: 4 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="relative overflow-hidden border border-cyan-900/40 bg-gradient-to-b from-[#35535b] via-[#17323a] to-[#02141a] pb-20 text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.03),transparent_22%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(0,0,0,0.4))]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="select-none text-[3.5rem] font-black leading-none text-white/[0.04] sm:text-[5rem] md:text-[7rem] lg:text-[10rem]">
            Komicats
          </span>
        </div>
      </div>

      <div className="relative z-10">
        {items.map((_, index) => (
          <div
            key={index}
            className={index !== 0 ? "border-t border-cyan-200/20" : ""}
          >
            <div className="flex min-h-[220px] flex-col gap-5 px-4 py-6 sm:px-5 sm:py-8 md:flex-row md:items-center md:gap-6 md:px-6 lg:gap-8 lg:px-8 lg:py-10">
              <Skeleton className="h-[170px] w-[122px] shrink-0 rounded-2xl sm:h-[190px] sm:w-[136px] md:h-[208px] md:w-[148px]" />

              <div className="w-full space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <Skeleton className="h-8 w-36 rounded-full" />
                  <div className="h-2.5 w-2.5 rounded-full bg-cyan-300" />
                </div>

                <div>
                  <Skeleton className="h-8 w-3/4 max-w-xl" />
                  <Skeleton className="mt-3 h-5 w-1/2 max-w-sm" />
                </div>

                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-[92%]" />
                <Skeleton className="h-4 w-[80%]" />

                <Skeleton className="pt-1 h-4 w-32" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
