import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft, Play } from "lucide-react";

import { getComicById } from "@/actions/comic.action";
import { Button } from "@/components/ui/button";
import { ComicDownloadButton } from "@/app/comic/ComicDownloadButton";
import ComicHeroPreview from "@/app/comic/ComicHeroPreview";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function ComicDetailsPage({ params }: PageProps) {
  const { id } = await params;
  const comic = await getComicById(id);

  if (!comic) {
    notFound();
  }

  const totalEpisodes = comic.episodes.length;
  const heroImage =
    comic.thumbnail || comic.episodes?.[0]?.images?.[0]?.imageUrl || null;

  const firstEpisode = comic.episodes?.[0];
  const readHref = firstEpisode
    ? `/admin/comics/${comic.id}/episode/${firstEpisode.id}`
    : "#";

  return (
    <section className="min-h-screen overflow-hidden bg-[#05090c] text-white">
      <div className="relative">
        <div className="relative min-h-[720px] w-full overflow-hidden bg-black">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_#1b2d34_0%,_#0c1519_45%,_#05090c_100%)]" />

          <div className="relative z-10 flex justify-center px-4 pt-0">
            <ComicHeroPreview
              thumbnail={heroImage}
              previewVideo={comic.previewVideo ?? null}
              title={comic.title}
            />
          </div>

          <div className="absolute left-4 top-4 z-30 sm:left-6 sm:top-6">
            <Link href="/admin">
              <Button
                variant="secondary"
                className="h-10 w-10 rounded-full border-0 bg-black/35 p-0 text-white backdrop-blur hover:bg-black/50"
              >
                <ChevronLeft className="h-5 w-5" />
              </Button>
            </Link>
          </div>

          <div className="absolute inset-x-0 bottom-0 z-20">
            <div className="bg-[linear-gradient(180deg,rgba(19,31,36,0.72)_0%,rgba(8,15,18,0.94)_100%)] px-4 pb-6 pt-4 backdrop-blur-md sm:px-6">
              <div className="mx-auto max-w-5xl">
                <h1 className="text-[18px] font-semibold leading-tight sm:text-[32px]">
                  {comic.title}
                </h1>

                <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-white/80 sm:text-sm">
                  <span>{new Date(comic.createdAt).getFullYear()}</span>
                  <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white sm:text-xs">
                    16+
                  </span>
                  <span>{totalEpisodes} Episodes</span>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  {firstEpisode ? (
                    <Link href={readHref} className="block">
                      <Button className="h-12 w-full rounded-[4px] bg-white text-base font-semibold text-black hover:bg-white/90">
                        <Play className="mr-2 h-4 w-4 fill-current" />
                        Read
                      </Button>
                    </Link>
                  ) : (
                    <Button
                      disabled
                      className="h-12 w-full rounded-[4px] bg-white text-base font-semibold text-black"
                    >
                      <Play className="mr-2 h-4 w-4 fill-current" />
                      Read
                    </Button>
                  )}

                  <div className="[&>button]:h-12 [&>button]:w-full [&>button]:rounded-[4px] [&>button]:border [&>button]:border-white/10 [&>button]:bg-[#39535e] [&>button]:text-base [&>button]:font-semibold [&>button]:text-white [&>button]:hover:bg-[#43616d]">
                    <ComicDownloadButton
                      comicTitle={comic.title}
                      episodes={comic.episodes.map((episode) => ({
                        title: episode.title,
                        images: episode.images.map((image) => ({
                          imageUrl: image.imageUrl,
                        })),
                      }))}
                    />
                  </div>
                </div>

                <p className="mt-4 max-w-4xl text-xs leading-5 text-white/75 sm:text-sm">
                  {comic.description?.trim() ||
                    comic.episodes?.[0]?.description ||
                    "No description available yet."}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 -mt-2 px-4 pb-8 sm:px-6">
          <div className="mx-auto w-full max-w-5xl">
            <div className="w-full">
              <div className="mt-4 flex flex-wrap gap-6 border-b border-white/10 text-sm font-semibold">
                <button className="border-b-2 border-cyan-300 pb-3 text-white">
                  Episodes
                </button>
              </div>

              <div className="mt-5 space-y-4">
                {comic.episodes.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-white/70">
                    No episodes found.
                  </div>
                ) : (
                  comic.episodes.map((episode, index) => {
                    const previewImage = episode.images?.[0]?.imageUrl ?? null;
                    const episodeHref = `/admin/comics/${comic.id}/episode/${episode.id}`;

                    return (
                      <Link
                        key={episode.id}
                        href={episodeHref}
                        className="block"
                      >
                        <div className="group flex items-start gap-4 rounded-2xl p-2 transition hover:bg-white/5">
                          <div className="relative h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-white/10 sm:h-28 sm:w-24">
                            {previewImage ? (
                              <img
                                src={previewImage}
                                alt={episode.title}
                                className="h-full w-full object-cover transition duration-300 group-hover:scale-105"
                              />
                            ) : (
                              <div className="flex h-full items-center justify-center text-xs text-white/50">
                                No image
                              </div>
                            )}
                          </div>

                          <div className="min-w-0 flex-1 pt-1">
                            <h3 className="line-clamp-1 text-xl font-semibold text-white">
                              {index + 1}. {episode.title}
                            </h3>

                            <p className="mt-2 line-clamp-2 text-base leading-7 text-white/85">
                              {episode.description ||
                                "No description available."}
                            </p>

                            <p className="mt-2 text-sm text-white/55">
                              {episode.images?.length || 0} page
                              {(episode.images?.length || 0) > 1 ? "s" : ""}
                            </p>
                          </div>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>

              <div className="mt-8 text-sm text-white/50">
                Added by {comic.user.fullname || comic.user.email}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
