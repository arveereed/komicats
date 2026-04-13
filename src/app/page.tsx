import prisma from "@/lib/prisma";
import AnimeBlogClient from "@/components/AnimeBlogClient";

export default async function HomePage() {
  const posts = await prisma.post.findMany({
    orderBy: {
      createdAt: "desc",
    },
    take: 6,
  });

  return <AnimeBlogClient posts={posts} />;
}
