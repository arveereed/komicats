import { getDbUserId } from "@/actions/user.action";
import PostsCrud from "@/components/admin/PostsCrud";
import PostCard from "@/components/PostCard";
import prisma from "@/lib/prisma";

export default async function PostsPage() {
  const userId = await getDbUserId();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const posts = await prisma.post.findMany({
    where: {
      userId,
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return <PostsCrud posts={posts} />;
}
