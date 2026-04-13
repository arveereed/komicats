import { getAllComics } from "@/actions/comic.action";
import ComicPreviewCard from "../../app/comic/ComicPreviewCard";

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
            <ComicPreviewCard key={comic.id} comic={comic} />
          ))}
        </div>
      )}
    </section>
  );
}
