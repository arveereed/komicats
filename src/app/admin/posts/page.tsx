import PostsCrud from "@/components/admin/PostsCrud";
import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";

export default async function PostsPage() {
  const clerkUser = await currentUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  if (!isAdmin) {
    return notFound();
  }

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
