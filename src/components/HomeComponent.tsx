"use client";

import { getAllComics } from "@/actions/comic.action";
import { useUser } from "@clerk/nextjs";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";

type Comics = Awaited<ReturnType<typeof getAllComics>>;
type ComicItem = Comics[number];

export default function HomePageComponent({ comics }: { comics: Comics }) {
  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();
  const router = useRouter();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  useEffect(() => {
    if (userLoaded && isSignedIn && !isAdmin) {
      router.push("/profile/avatar/profile");
    }

    if (isAdmin) {
      router.push("/admin");
    }
  }, [userLoaded, isSignedIn, isAdmin, router]);

  const getEpisodeLabel = (comic: ComicItem) => {
    const firstEpisode = comic.episodes?.[0];
    if (!firstEpisode) return null;
    return `Episode ${firstEpisode.order ?? 1}`;
  };

  return (
    <section className="relative mx-auto w-full max-w-7xl px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-white md:text-3xl">
            Latest Comics
          </h1>
          <p className="text-sm text-white/60">
            Discover newly published stories
          </p>
        </div>
      </div>

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
    </section>
  );
}
