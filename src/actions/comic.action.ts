"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";

export type EpisodeInput = {
  episode: string;
  description: string;
  images: string[];
};

export async function createComic(formData: FormData) {
  const { userId } = await auth();

  if (!userId) {
    return {
      success: false,
      message: "Unauthorized",
    };
  }

  try {
    const title = formData.get("title")?.toString().trim() || "";
    const thumbnail = formData.get("thumbnail")?.toString().trim() || "";
    const episodesRaw = formData.get("episodes")?.toString() || "[]";

    if (!title) {
      return {
        success: false,
        message: "Comic title is required",
      };
    }

    const episodes = JSON.parse(episodesRaw) as EpisodeInput[];

    const comic = await prisma.comic.create({
      data: {
        title,
        thumbnail: thumbnail || null,
        userId,
        episodes: {
          create: episodes.map((item, episodeIndex) => ({
            title: item.episode,
            description: item.description,
            order: episodeIndex + 1,
            images: {
              create: item.images.map((imageUrl, imageIndex) => ({
                imageUrl,
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
    revalidatePath("/admin/comics");

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

export async function getComicById(comicId: string) {
  try {
    const comic = await prisma.comic.findUnique({
      where: {
        id: comicId,
      },
      include: {
        user: true,
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
    });

    return comic;
  } catch (error) {
    console.error("GET_COMIC_BY_ID_ERROR", error);
    return null;
  }
}

export async function deleteComic(comicId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    await prisma.comic.delete({
      where: {
        id: comicId,
      },
    });

    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    console.error("DELETE_COMIC_ERROR", error);
    throw new Error("Failed to delete comic");
  }
}
