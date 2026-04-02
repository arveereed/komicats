import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) return;

  const existingUser = await prisma.user.findUnique({
    where: {
      clerkId: userId,
    },
  });
  if (existingUser) return existingUser;

  const dbUser = await prisma.user.create({
    data: {
      clerkId: userId,
      fullname:
        (user.unsafeMetadata.fullname as string) ||
        `${user.firstName} ${user.lastName}`,
      email: user.emailAddresses[0].emailAddress,
      image: user.imageUrl,
    },
  });

  return dbUser;
}
