import prisma from "@/lib/prisma";
import AnimeBlogClient from "@/components/AnimeBlogClient";
import { Prisma } from "@/generated/prisma/client";

function isDatabaseUnavailable(error: unknown) {
  return (
    error instanceof Prisma.PrismaClientKnownRequestError &&
    error.code === "P1001"
  );
}

export default async function HomePage() {
  try {
    const [hero, posts] = await Promise.all([
      prisma.heroSection.findFirst({
        orderBy: {
          createdAt: "desc",
        },
      }),
      prisma.post.findMany({
        orderBy: {
          createdAt: "desc",
        },
        take: 6,
      }),
    ]);

    return <AnimeBlogClient posts={posts} hero={hero} />;
  } catch (error) {
    console.error("HomePage database error:", error);

    if (isDatabaseUnavailable(error)) {
      return (
        <main className="min-h-screen grid place-items-center bg-[#07141a] text-white p-6">
          <div className="max-w-md text-center">
            <h1 className="text-2xl font-bold">You are offline</h1>
            <p className="mt-3 text-sm text-zinc-300">
              We could not reach the database right now. Please reconnect and
              try again.
            </p>
          </div>
        </main>
      );
    }

    throw error;
  }
}
