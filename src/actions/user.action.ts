import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function syncUser() {
  const { userId } = await auth();
  const user = await currentUser();

  if (!userId || !user) return;

  const email = user.emailAddresses[0]?.emailAddress?.trim().toLowerCase();
  if (!email) return null;

  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [{ clerkId: userId }, { email }],
    },
  });

  if (existingUser) {
    console.log(existingUser);
    return existingUser;
  }

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

export async function getUserByClerkId(clerkId: string) {
  return await prisma.user.findUnique({
    where: {
      clerkId,
    },
  });
}

export async function getDbUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await getUserByClerkId(clerkId);

  if (!user) throw new Error("User not found");

  return user.id;
}
