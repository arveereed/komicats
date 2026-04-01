import Image from "next/image";
import Link from "next/link";
import { BookOpen, CalendarDays, UserRound } from "lucide-react";

import { deleteComic, getAllComics } from "@/actions/comic.action";
import { DeleteComicDialog } from "./DeleteComic";
import EditComicDialog from "./EditComicDialog";

export default async function ComicListSection() {
  const comics = await getAllComics();

  return (
    <section className="space-y-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-2xl font-semibold text-white">All Comics</h2>
          <p className="text-sm text-white/60">
            Browse and manage every comic in your library
          </p>
        </div>
      </div>

      {comics.length === 0 ? (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/60 backdrop-blur-md">
          No comics added yet.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {comics.map((comic) => (
            <div
              key={comic.id}
              className="overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]"
            >
              <Link href={`/admin/comics/${comic.id}`} className="block">
                <div className="relative h-56 w-full overflow-hidden bg-white/5">
                  {comic.thumbnail ? (
                    <>
                      <Image
                        src={comic.thumbnail}
                        alt={comic.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                        className="object-cover transition duration-500 hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    </>
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm text-white/40">
                      No thumbnail
                    </div>
                  )}

                  <div className="absolute bottom-4 left-4 right-4">
                    <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1 text-xs font-medium text-white/80 backdrop-blur-md">
                      <BookOpen className="h-3.5 w-3.5" />
                      {comic.episodes.length} episode
                      {comic.episodes.length > 1 ? "s" : ""}
                    </div>
                  </div>
                </div>

                <div className="space-y-4 p-5">
                  <div>
                    <h3 className="line-clamp-1 text-xl font-semibold text-white">
                      {comic.title}
                    </h3>
                    <p className="mt-1 text-sm text-white/50">
                      Open comic details and manage episodes
                    </p>
                  </div>

                  <div className="space-y-3 text-sm text-white/65">
                    <div className="flex items-center gap-2">
                      <UserRound className="h-4 w-4 text-white/40" />
                      <span>{comic.user.fullname || comic.user.email}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-4 w-4 text-white/40" />
                      <span>
                        {new Date(comic.createdAt).toLocaleDateString("en-PH", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>

              <div className="border-t border-white/10 p-4">
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="rounded-2xl bg-white/5 p-1">
                    <EditComicDialog comic={comic} />
                  </div>

                  <div className="rounded-2xl bg-white/5 p-1">
                    <DeleteComicDialog
                      comicId={comic.id}
                      comicTitle={comic.title}
                      action={deleteComic.bind(null, comic.id)}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
