import { Card, CardContent } from "@/components/ui/card";
import prisma from "@/lib/prisma";
import Image from "next/image";
import Link from "next/link";

export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q = "" } = await searchParams;

  const comics = await prisma.comic.findMany({
    where: q
      ? {
          OR: [
            {
              title: {
                contains: q,
                mode: "insensitive",
              },
            },
            {
              description: {
                contains: q,
                mode: "insensitive",
              },
            },
          ],
        }
      : {},
    include: {
      episodes: {
        orderBy: {
          order: "asc",
        },
        take: 1,
      },
    },
  });

  const getEpisodeLabel = (comic: (typeof comics)[number]) => {
    const firstEpisode = comic.episodes[0];
    if (!firstEpisode) return null;
    return `Episode ${firstEpisode.order ?? 1}`;
  };

  return (
    <div className="relative z-10 mx-auto max-w-7xl px-4 py-8">
      {comics.length === 0 ? (
        <Card className="border border-white/10 bg-white/[0.03]">
          <CardContent className="flex min-h-[240px] items-center justify-center">
            <p className="text-sm text-white/60">No comics found.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
          {comics.map((comic) => {
            const episodeLabel = getEpisodeLabel(comic);

            return (
              <Link
                key={comic.id}
                href={`/profile/avatar/comics/${comic.id}`}
                className="group block"
              >
                <Card className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.05] p-0 shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/[0.08] hover:shadow-2xl">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] overflow-hidden">
                      {comic.thumbnail && (
                        <Image
                          src={comic.thumbnail}
                          alt={comic.title}
                          fill
                          className="object-cover transition-transform duration-500 group-hover:scale-105"
                          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 16vw"
                        />
                      )}

                      <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/25 to-transparent" />

                      <div className="absolute inset-x-0 bottom-0 p-3">
                        <h2
                          className="line-clamp-2 text-sm font-extrabold uppercase leading-tight text-white md:text-base"
                          style={{
                            textShadow:
                              "0 2px 10px rgba(0,0,0,0.9), 0 1px 2px rgba(0,0,0,0.8)",
                          }}
                        >
                          {comic.title}
                        </h2>

                        {episodeLabel && (
                          <p className="mt-1 text-xs font-medium text-white/80">
                            {episodeLabel}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
