"use client";

export default function Loading() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-[#07141a] font-sans">
      <div className="absolute inset-0">
        <div className="h-full w-full animate-pulse bg-white/10" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-950/25 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 flex min-h-screen items-center px-6 py-12 lg:px-16">
        <div className="max-w-2xl">
          <div className="space-y-4">
            <div className="h-12 w-full max-w-[680px] animate-pulse rounded bg-white/20 md:h-16" />
            <div className="h-12 w-[88%] max-w-[620px] animate-pulse rounded bg-white/20 md:h-16" />
            <div className="h-12 w-[64%] max-w-[420px] animate-pulse rounded bg-white/20 md:h-16" />
          </div>
        </div>
      </div>
    </main>
  );
}
