import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { auth, currentUser } from "@clerk/nextjs/server";

export async function POST() {
  try {
    const { userId } = await auth();
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        clerkId: userId,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        {
          message: "User already exists",
          user: existingUser,
        },
        { status: 200 },
      );
    }

    const dbUser = await prisma.user.create({
      data: {
        clerkId: userId,
        fullname:
          `${user.firstName || user.unsafeMetadata.fullname || ""} ${user.lastName || ""}`.trim(),
        email: user.emailAddresses[0]?.emailAddress || "",
        image: user.imageUrl,
      },
    });

    return NextResponse.json(
      {
        message: "User synced successfully",
        user: dbUser,
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("SYNC_USER_API_ERROR", error);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
