"use server";

import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import prisma from "@/lib/prisma";
import cloudinary from "@/lib/cloudinary";

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

async function deleteFolderIfEmpty(path: string) {
  try {
    await cloudinary.api.delete_folder(path);
  } catch (error) {
    console.warn(`Could not delete folder: ${path}`, error);
  }
}

export async function deleteComic(comicId: string) {
  const { userId } = await auth();

  if (!userId) {
    throw new Error("Unauthorized");
  }

  try {
    const comic = await prisma.comic.findUnique({
      where: { id: comicId },
      include: {
        episodes: {
          include: {
            images: true,
          },
        },
      },
    });

    if (!comic) {
      throw new Error("Comic not found");
    }

    const publicIds = [
      comic.thumbnailPublicId,
      ...comic.episodes.flatMap((episode) =>
        episode.images.map((image) => image.publicId),
      ),
    ].filter((publicId): publicId is string => Boolean(publicId));

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
          console.warn(`Failed to delete folder: ${folderPath}`, error);
        }
      }
    }

    await prisma.comic.delete({
      where: { id: comicId },
    });

    revalidatePath("/admin");
    revalidatePath("/");
  } catch (error) {
    console.error("DELETE_COMIC_ERROR", error);
    throw new Error("Failed to delete comic");
  }
}
