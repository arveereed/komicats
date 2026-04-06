"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";
import { getDbUserId } from "./user.action";

type RawEpisodeInput = {
  episode?: string;
  description?: string;
  images?: Array<
    | string
    | {
        url?: string | null;
        publicId?: string | null;
      }
    | null
    | undefined
  >;
};

type NormalizedEpisodeInput = {
  episode: string;
  description: string;
  images: {
    imageUrl: string;
    publicId: string | null;
  }[];
};

const FREE_EPISODE_LIMIT = 5;
const COMIC_UNLOCK_PRICE = 50;

function normalizeEpisodes(input: RawEpisodeInput[]): NormalizedEpisodeInput[] {
  return input.map((episode) => {
    const normalizedImages = (episode.images ?? [])
      .map((image) => {
        if (!image) return null;

        if (typeof image === "string") {
          return {
            imageUrl: image.trim(),
            publicId: null,
          };
        }

        const imageUrl = image.url?.trim() ?? "";
        const publicId = image.publicId?.trim() ?? null;

        if (!imageUrl) return null;

        return {
          imageUrl,
          publicId,
        };
      })
      .filter((image): image is { imageUrl: string; publicId: string | null } =>
        Boolean(image?.imageUrl),
      );

    return {
      episode: episode.episode?.trim() ?? "",
      description: episode.description?.trim() ?? "",
      images: normalizedImages,
    };
  });
}

export async function createComic(formData: FormData) {
  const { userId } = await auth();
  const creatorId = await getDbUserId();

  if (!userId || !creatorId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const thumbnail = formData.get("thumbnail")?.toString().trim() || "";
    const episodesRaw = formData.get("episodes")?.toString() || "[]";
    const thumbnailPublicId =
      formData.get("thumbnailPublicId")?.toString().trim() || "";
    const cloudinaryFolder =
      formData.get("cloudinaryFolder")?.toString().trim() || "";

    // start of Validation
    if (!title) {
      return {
        success: false,
        message: "Comic title is required",
      };
    }

    let parsedEpisodes: RawEpisodeInput[] = [];

    try {
      parsedEpisodes = JSON.parse(episodesRaw) as RawEpisodeInput[];
    } catch {
      return {
        success: false,
        message: "Invalid episodes payload",
      };
    }

    const episodes = normalizeEpisodes(parsedEpisodes);

    if (episodes.length === 0) {
      return {
        success: false,
        message: "At least one episode is required",
      };
    }

    const invalidEpisode = episodes.find(
      (episode) =>
        !episode.episode || !episode.description || episode.images.length === 0,
    );

    if (invalidEpisode) {
      return {
        success: false,
        message: "One or more episodes are incomplete",
      };
    }
    // end of Validation

    const comic = await prisma.comic.create({
      data: {
        title,
        description,
        thumbnail: thumbnail || null,
        thumbnailPublicId: thumbnailPublicId || null,
        cloudinaryFolder: cloudinaryFolder || null,
        userId,
        episodes: {
          create: episodes.map((item, episodeIndex) => ({
            title: item.episode,
            description: item.description,
            order: episodeIndex + 1,
            images: {
              create: item.images.map((image, imageIndex) => ({
                imageUrl: image.imageUrl,
                publicId: image.publicId,
                order: imageIndex + 1,
              })),
            },
          })),
        },
      },
      include: {
        episodes: {
          orderBy: { order: "asc" },
          include: {
            images: {
              orderBy: { order: "asc" },
            },
          },
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/comics");

    // create notification
    const users = await prisma.user.findMany({
      where: {
        id: {
          not: creatorId,
        },
      },
      select: { id: true },
    });

    await prisma.notification.createMany({
      data: users.map((user) => ({
        userId: user.id,
        creatorId,
        comicId: comic.id,
        type: "COMIC",
      })),
    });
    // end of creating notification

    return {
      success: true,
      message: "Comic created successfully",
      comic,
    };
  } catch (error) {
    console.error("CREATE_COMIC_ERROR", error);

    return {
      success: false,
      message: "Failed to create comic",
    };
  }
}

export async function getAllComics() {
  try {
    const comics = await prisma.comic.findMany({
      include: {
        user: {
          select: {
            fullname: true,
            email: true,
            clerkId: true,
          },
        },
        episodes: {
          orderBy: {
            order: "asc",
          },
          include: {
            images: {
              orderBy: {
                order: "asc",
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return comics;
  } catch (error) {
    console.error("GET_ALL_COMICS_ERROR", error);
    return [];
  }
}

export async function getComicById(id: string) {
  const { userId: clerkId } = await auth();

  const dbUser = clerkId
    ? await prisma.user.findUnique({
        where: { clerkId },
        select: { id: true },
      })
    : null;

  const comic = await prisma.comic.findUnique({
    where: { id },
    include: {
      user: true,
      episodes: {
        orderBy: { order: "asc" },
        include: {
          images: {
            orderBy: { order: "asc" },
          },
        },
      },
      unlocks: dbUser
        ? {
            where: {
              userId: dbUser.id,
            },
            select: {
              id: true,
            },
          }
        : false,
    },
  });

  if (!comic) return null;

  return {
    ...comic,
    isUnlocked: Array.isArray(comic.unlocks) && comic.unlocks.length > 0,
  };
}

export async function updateComic(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const comicId = formData.get("comicId")?.toString().trim() || "";
    const title = formData.get("title")?.toString().trim() || "";
    const description = formData.get("description")?.toString().trim() || "";
    const thumbnail = formData.get("thumbnail")?.toString().trim() || "";
    const episodesRaw = formData.get("episodes")?.toString() || "[]";

    if (!comicId || !title) {
      return {
        success: false,
        message: "Missing required fields",
      };
    }

    const episodes = JSON.parse(episodesRaw) as {
      episode: string;
      description: string;
      images: {
        url: string;
        publicId: string | null;
      }[];
    }[];

    await prisma.comic.update({
      where: { id: comicId },
      data: {
        title,
        description,
        thumbnail: thumbnail || null,
        episodes: {
          deleteMany: {},
          create: episodes.map((item, episodeIndex) => ({
            title: item.episode,
            description: item.description,
            order: episodeIndex + 1,
            images: {
              create: item.images.map((image, imageIndex) => ({
                imageUrl: image.url,
                publicId: image.publicId,
                order: imageIndex + 1,
              })),
            },
          })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/admin");
    revalidatePath("/admin/comics");
    revalidatePath(`/admin/comics/${comicId}`);

    return {
      success: true,
      message: "Comic updated successfully",
    };
  } catch (error) {
    console.error("UPDATE_COMIC_ERROR", error);

    return {
      success: false,
      message: "Failed to update comic",
    };
  }
}

export async function deleteComic(comicId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  const comic = await prisma.comic.findUnique({
    where: { id: comicId },
    include: {
      episodes: {
        include: {
          images: true,
        },
      },
      user: {
        select: {
          email: true,
          clerkId: true,
        },
      },
    },
  });

  if (!comic) {
    throw new Error("Comic not found");
  }

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();

  const currentDbUser = await prisma.user.findUnique({
    where: { clerkId: userId },
    select: {
      email: true,
      clerkId: true,
    },
  });

  const isAdmin =
    !!adminEmail &&
    !!currentDbUser?.email &&
    currentDbUser.email.toLowerCase() === adminEmail;

  if (!isAdmin && comic.userId !== userId) {
    throw new Error("Forbidden");
  }

  console.log("DELETE_COMIC_START", {
    comicId,
    currentUserId: userId,
    comicOwnerClerkId: comic.userId,
    currentUserEmail: currentDbUser?.email,
    isAdmin,
  });

  const publicIds = [
    comic.thumbnailPublicId,
    ...comic.episodes.flatMap((episode) =>
      episode.images.map((image) => image.publicId),
    ),
  ].filter((publicId): publicId is string => Boolean(publicId));

  try {
    if (publicIds.length > 0) {
      await cloudinary.api.delete_resources(publicIds);
    }

    if (comic.cloudinaryFolder) {
      await cloudinary.api.delete_resources_by_prefix(comic.cloudinaryFolder);

      const folderPaths = [
        `${comic.cloudinaryFolder}/thumbnail`,
        ...comic.episodes.map(
          (_, episodeIndex) =>
            `${comic.cloudinaryFolder}/episodes/episode-${episodeIndex + 1}/pages`,
        ),
        ...comic.episodes.map(
          (_, episodeIndex) =>
            `${comic.cloudinaryFolder}/episodes/episode-${episodeIndex + 1}`,
        ),
        `${comic.cloudinaryFolder}/episodes`,
        comic.cloudinaryFolder,
      ];

      for (const folderPath of folderPaths) {
        try {
          await cloudinary.api.delete_folder(folderPath);
        } catch (error) {
          console.warn("DELETE_FOLDER_WARNING", folderPath, error);
        }
      }
    }
  } catch (error) {
    console.error("CLOUDINARY_DELETE_ERROR", error);
  }

  await prisma.comic.delete({
    where: { id: comicId },
  });

  console.log("DELETE_COMIC_SUCCESS", { comicId });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/admin/comics");

  return {
    success: true,
  };
}

export async function buyComicUnlock({ comicId }: { comicId: string }) {
  try {
    const { userId: clerkId } = await auth();

    if (!clerkId) {
      return { success: false, message: "You must be logged in." };
    }

    const user = await prisma.user.findUnique({
      where: { clerkId },
      select: {
        id: true,
        coins: true,
      },
    });

    if (!user) {
      return { success: false, message: "User not found." };
    }

    if (user.coins < COMIC_UNLOCK_PRICE) {
      return { success: false, message: "Not enough coins." };
    }

    const comic = await prisma.comic.findUnique({
      where: { id: comicId },
      select: { id: true, title: true },
    });

    if (!comic) {
      return { success: false, message: "Comic not found." };
    }

    const existingUnlock = await prisma.comicUnlock.findUnique({
      where: {
        userId_comicId: {
          userId: user.id,
          comicId,
        },
      },
    });

    if (existingUnlock) {
      return { success: true, message: "Comic already unlocked." };
    }

    await prisma.$transaction(async (tx) => {
      const updatedUser = await tx.user.update({
        where: { id: user.id },
        data: {
          coins: {
            decrement: COMIC_UNLOCK_PRICE,
          },
        },
        select: {
          id: true,
          coins: true,
        },
      });

      await tx.comicUnlock.create({
        data: {
          userId: user.id,
          comicId,
          paidCoins: COMIC_UNLOCK_PRICE,
        },
      });

      await tx.coinTransaction.create({
        data: {
          userId: user.id,
          type: "DEBIT",
          amount: COMIC_UNLOCK_PRICE,
          balanceAfter: updatedUser.coins,
          description: `Unlocked comic: ${comic.title}`,
        },
      });
    });

    revalidatePath(`/profile/avatar/comics/${comicId}`);

    return {
      success: true,
      message: "Comic unlocked successfully.",
    };
  } catch (error) {
    console.error("buyComicUnlock error:", error);
    return { success: false, message: "Something went wrong." };
  }
}
