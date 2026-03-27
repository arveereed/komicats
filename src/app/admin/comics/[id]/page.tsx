import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { getComicById } from "@/actions/comic.action";
import { Button } from "@/components/ui/button";

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

  return (
    <section className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold">{comic.title}</h1>
          <p className="text-sm text-muted-foreground">
            {comic.episodes.length} episode
            {comic.episodes.length > 1 ? "s" : ""}
          </p>
        </div>

        <Link href="/admin">
          <Button variant="outline">Back to Comics</Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-white shadow-sm">
        <div className="relative h-64 w-full bg-muted md:h-80">
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

        <div className="space-y-3 p-6">
          <h2 className="text-xl font-semibold">{comic.title}</h2>

          <div className="space-y-1 text-sm text-muted-foreground">
            <p>Added by: {comic.user.fullname || comic.user.email}</p>
            <p>
              Created:{" "}
              {new Date(comic.createdAt).toLocaleDateString("en-PH", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold">Episodes</h2>
          <p className="text-sm text-muted-foreground">
            All episodes for this comic
          </p>
        </div>

        {comic.episodes.length === 0 ? (
          <div className="rounded-xl border p-6 text-sm text-muted-foreground">
            No episodes found.
          </div>
        ) : (
          <div className="space-y-4">
            {comic.episodes.map((episode, index) => {
              const previewImage = episode.images?.[0]?.imageUrl ?? null;

              return (
                <Link
                  key={episode.id}
                  href={`/admin/comics/${comic.id}/episode/${episode.id}`}
                >
                  <div
                    key={episode.id}
                    className="flex gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                  >
                    <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-muted sm:h-28 sm:w-28">
                      {previewImage ? (
                        <Image
                          src={previewImage}
                          alt={episode.title}
                          fill
                          className="object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-xs text-muted-foreground">
                          No image
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1 space-y-2">
                      <div>
                        <h3 className="text-lg font-semibold">
                          {index + 1}. {episode.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {episode.images?.length || 0} page
                          {(episode.images?.length || 0) > 1 ? "s" : ""}
                        </p>
                      </div>

                      <p className="text-sm text-muted-foreground">
                        {episode.description}
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
