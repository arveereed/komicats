"use client";

export default function Loading() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#07141a] font-sans">
      <div className="absolute inset-0 z-0">
        <div className="h-full w-full animate-pulse bg-gradient-to-br from-[#13232b] via-[#0d1a20] to-[#07141a]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/25 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen flex-col justify-between px-6 py-12 lg:px-16">
        <div />

        <div className="flex w-full flex-col items-center justify-between lg:flex-row">
          <div className="max-w-2xl animate-pulse">
            <div className="h-6 w-24 rounded bg-white/20" />

            <div className="mt-4 space-y-3">
              <div className="h-12 w-full max-w-[680px] rounded bg-white/15 md:h-16" />
              <div className="h-12 w-[92%] max-w-[620px] rounded bg-white/15 md:h-16" />
              <div className="h-12 w-[70%] max-w-[420px] rounded bg-white/15 md:h-16" />
            </div>
          </div>
        </div>

        <div className="mt-12 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <div
              key={idx}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-xl backdrop-blur-sm"
            >
              <div className="aspect-[16/10] animate-pulse bg-white/10" />

              <div className="space-y-3 p-4">
                <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
                <div className="h-6 w-full animate-pulse rounded bg-white/15" />
                <div className="h-6 w-4/5 animate-pulse rounded bg-white/15" />
                <div className="pt-2">
                  <div className="h-3 w-16 animate-pulse rounded bg-red-500/20" />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="pointer-events-none absolute left-0 top-0 h-1/3 w-1/3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-red-600/10 blur-[120px]" />
    </main>
  );
}
