function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const heroCards = Array.from({ length: 4 });
const postCards = Array.from({ length: 6 });
const bottomItems = Array.from({ length: 6 });

export default function Loading() {
  return (
    <main
      aria-busy="true"
      aria-live="polite"
      className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#27484e] via-[#11262b] to-[#020507] text-white"
    >
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-10 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute right-[-6%] top-1/3 h-72 w-72 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-52 w-52 rounded-full bg-white/5 blur-3xl" />
      </div>

      <div className="relative z-10 min-h-screen pb-24 md:pb-0">
        <header className="sticky top-0 z-40 border-b border-white/10 bg-black/95 backdrop-blur-xl">
          <div className="mx-auto max-w-[1400px] px-4 sm:px-6">
            <div className="hidden h-20 items-center justify-between md:flex">
              <div className="flex items-center gap-4">
                <Skeleton className="h-11 w-11 rounded-xl" />
                <Skeleton className="h-6 w-32" />
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-32 rounded-full" />
                <Skeleton className="h-11 w-32 rounded-full" />
                <Skeleton className="h-11 w-32 rounded-full" />
              </div>

              <div className="flex items-center gap-3">
                <Skeleton className="h-11 w-56 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-10 w-10 rounded-full" />
                <Skeleton className="h-11 w-11 rounded-xl" />
              </div>
            </div>

            <div className="flex h-16 items-center justify-between md:hidden">
              <div className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <Skeleton className="h-5 w-28" />
              </div>

              <div className="flex items-center gap-2">
                <Skeleton className="h-10 w-40 rounded-xl" />
                <Skeleton className="h-9 w-9 rounded-full" />
              </div>
            </div>
          </div>
        </header>

        <section className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          <div className="overflow-hidden rounded-3xl border border-white/10 bg-white/[0.05] shadow-2xl backdrop-blur-xl">
            <div className="relative min-h-[360px] sm:min-h-[460px]">
              <Skeleton className="absolute inset-0 rounded-none" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#07141a] via-[#07141a]/45 to-transparent" />

              <div className="absolute bottom-0 left-0 right-0 p-5 sm:p-8 lg:p-10">
                <div className="mb-4 flex items-center gap-2">
                  <span className="relative flex h-3 w-3">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-cyan-300 opacity-75" />
                    <span className="relative inline-flex h-3 w-3 rounded-full bg-cyan-300" />
                  </span>
                  <span className="text-xs font-medium uppercase tracking-[0.24em] text-cyan-100/80">
                    Loading
                  </span>
                </div>

                <Skeleton className="h-10 w-2/3 max-w-xl sm:h-12" />
                <Skeleton className="mt-4 h-4 w-full max-w-2xl" />
                <Skeleton className="mt-2 h-4 w-[88%] max-w-xl" />

                <div className="mt-6 flex flex-wrap gap-3">
                  <Skeleton className="h-11 w-28 rounded-full bg-cyan-300/30" />
                  <Skeleton className="h-11 w-28 rounded-full" />
                  <Skeleton className="h-11 w-28 rounded-full" />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <Skeleton className="h-7 w-44" />
                <Skeleton className="mt-2 h-4 w-56" />
              </div>
              <Skeleton className="hidden h-10 w-28 rounded-full sm:block" />
            </div>

            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {heroCards.map((_, index) => (
                <div
                  key={index}
                  className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] shadow-lg"
                >
                  <Skeleton className="aspect-[4/5] w-full rounded-none" />
                  <div className="p-4">
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="mt-2 h-4 w-full" />
                    <Skeleton className="mt-2 h-4 w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-10">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <Skeleton className="h-7 w-36" />
                <Skeleton className="mt-2 h-4 w-48" />
              </div>
              <Skeleton className="hidden h-10 w-24 rounded-full sm:block" />
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {postCards.map((_, index) => (
                <div
                  key={index}
                  className="rounded-2xl border border-white/10 bg-white/[0.04] p-4 shadow-xl"
                >
                  <Skeleton className="aspect-[16/9] w-full rounded-2xl" />
                  <Skeleton className="mt-4 h-5 w-3/4" />
                  <Skeleton className="mt-3 h-4 w-full" />
                  <Skeleton className="mt-2 h-4 w-[90%]" />
                  <Skeleton className="mt-4 h-10 w-28 rounded-full" />
                </div>
              ))}
            </div>
          </div>
        </section>

        <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-black/95 backdrop-blur md:hidden">
          <div className="mx-auto flex h-20 max-w-md items-stretch px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            {bottomItems.map((_, index) => (
              <div
                key={index}
                className="flex min-w-0 flex-1 items-center justify-center"
              >
                <div className="flex w-full max-w-[96px] flex-col items-center justify-center gap-2 rounded-2xl px-3 py-2">
                  <Skeleton className="h-6 w-6 rounded-md" />
                  <Skeleton className="h-3 w-12 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </nav>
      </div>
    </main>
  );
}
