import prisma from "@/lib/prisma";
import AnimeBlogClient from "@/components/AnimeBlogClient";

export default async function HomePage() {
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
}
