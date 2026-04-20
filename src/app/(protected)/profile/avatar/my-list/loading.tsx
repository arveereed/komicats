function Skeleton({ className = "" }: { className?: string }) {
  return (
    <div
      className={`animate-pulse rounded-xl bg-white/10 ring-1 ring-white/10 ${className}`}
    />
  );
}

const cards = Array.from({ length: 10 });

export default function Loading() {
  return (
    <section
      aria-busy="true"
      aria-live="polite"
      className="min-h-screen px-4 py-6 text-white sm:px-6"
    >
      <div className="mx-auto max-w-6xl">
        <Skeleton className="h-8 w-28" />

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {cards.map((_, index) => (
            <div
              key={index}
              className="overflow-hidden rounded-xl border border-white/10 bg-white/5"
            >
              <Skeleton className="aspect-[2/3] w-full rounded-none" />

              <div className="p-3">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="mt-2 h-3 w-full" />
                <Skeleton className="mt-2 h-3 w-5/6" />
                <Skeleton className="mt-3 h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
