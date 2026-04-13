import PostsCrud from "@/components/admin/PostsCrud";
import prisma from "@/lib/prisma";

export default async function PostsPage() {
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
    }),
  ]);

  return <PostsCrud posts={posts} hero={hero} />;
}
