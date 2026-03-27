import Image from "next/image";
import Link from "next/link";

import { deleteComic, getAllComics } from "@/actions/comic.action";
import { Button } from "@/components/ui/button";
import { DeleteComicDialog } from "./DeleteComic";

export default async function ComicListSection() {
  const comics = await getAllComics();

  return (
    <section className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold">All Comics</h2>
        <p className="text-sm text-muted-foreground">
          List of all comics added
        </p>
      </div>

      {comics.length === 0 ? (
        <div className="rounded-xl border p-6 text-sm text-muted-foreground">
          No comics added yet.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {comics.map((comic) => (
            <div
              key={comic.id}
              className="overflow-hidden rounded-2xl border bg-white shadow-sm"
            >
              <div className="relative h-48 w-full bg-muted">
                {comic.thumbnail ? (
                  <Image
                    src={comic.thumbnail}
                    alt={comic.title}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
                    No thumbnail
                  </div>
                )}
              </div>

              <div className="space-y-3 p-4">
                <div>
                  <h3 className="line-clamp-1 text-lg font-semibold">
                    {comic.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {comic.episodes.length} episode
                    {comic.episodes.length > 1 ? "s" : ""}
                  </p>
                </div>

                <div className="space-y-1 text-sm text-muted-foreground">
                  <p>Added by: {comic.user.fullname || comic.user.email}</p>
                  <p>
                    Created:{" "}
                    {new Date(comic.createdAt).toLocaleDateString("en-PH", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Link href={`/admin/comics/${comic.id}`} className="flex-1">
                    <Button variant="outline" className="w-full">
                      View
                    </Button>
                  </Link>

                  <DeleteComicDialog
                    comicId={comic.id}
                    comicTitle={comic.title}
                    action={deleteComic.bind(null, comic.id)}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
