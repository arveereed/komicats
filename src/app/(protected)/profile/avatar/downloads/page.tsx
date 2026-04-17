import Link from "next/link";
import { Download } from "lucide-react";

import { getMyOfflineDownloads } from "@/actions/comic-offline.action";

export default async function DownloadsPage() {
  const downloads = await getMyOfflineDownloads();

  return (
    <section className="min-h-screen px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-5xl">
        <div className="mb-6 flex items-center gap-3">
          <Download className="h-5 w-5" />
          <h1 className="text-2xl font-semibold">Downloads</h1>
        </div>

        {downloads.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            No offline comics yet.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {downloads.map((item) => (
              <Link
                key={item.id}
                href={`/profile/avatar/downloads/${item.comicId}`}
                className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition hover:bg-white/10"
              >
                <div className="aspect-[16/9] bg-black">
                  {item.coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={item.coverImage}
                      alt={item.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </div>

                <div className="p-4">
                  <h2 className="line-clamp-1 text-base font-semibold">
                    {item.title}
                  </h2>
                  <p className="mt-1 text-sm text-white/60">
                    {item.cachedPages}/{item.totalPages} pages cached
                  </p>
                  <p className="mt-2 text-xs text-emerald-400">{item.status}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
