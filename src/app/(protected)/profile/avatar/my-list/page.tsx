import Image from "next/image";
import Link from "next/link";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";

export default async function MyListPage() {
  const { userId: clerkId } = await auth();

  if (!clerkId) {
    redirect("/");
  }

  const user = await prisma.user.findUnique({
    where: { clerkId },
    select: {
      activeProfileId: true,
    },
  });

  if (!user?.activeProfileId) {
    redirect("/");
  }

  const savedComics = await prisma.comicMyList.findMany({
    where: {
      profileId: user.activeProfileId,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      comic: {
        select: {
          id: true,
          title: true,
          description: true,
          thumbnail: true,
          createdAt: true,
          episodes: {
            select: { id: true },
          },
        },
      },
    },
  });

  return (
    <section className="min-h-screen px-4 py-6 text-white sm:px-6">
      <div className="mx-auto max-w-6xl">
        <h1 className="text-2xl font-semibold">My List</h1>

        {savedComics.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5 text-white/70">
            No comics in your list yet.
          </div>
        ) : (
          <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
            {savedComics.map(({ comic }) => (
              <Link
                key={comic.id}
                href={`/profile/avatar/comics/${comic.id}`}
                className="group"
              >
                <div className="overflow-hidden rounded-xl bg-white/5">
                  <div className="relative aspect-[2/3] w-full bg-[#9a7a49]">
                    {comic.thumbnail ? (
                      <Image
                        src={comic.thumbnail}
                        alt={comic.title}
                        fill
                        className="object-cover transition group-hover:scale-[1.02]"
                      />
                    ) : null}
                  </div>

                  <div className="p-3">
                    <h2 className="line-clamp-1 text-sm font-semibold">
                      {comic.title}
                    </h2>
                    <p className="mt-1 line-clamp-2 text-xs text-white/70">
                      {comic.description}
                    </p>
                    <p className="mt-2 text-[11px] text-white/50">
                      {comic.episodes.length} Episodes
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
