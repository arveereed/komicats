"use server";

import prisma from "@/lib/prisma";
import { getDbUserId } from "./user.action";

export async function getNotifications() {
  try {
    const userId = await getDbUserId();
    if (!userId) return [];

    const notifications = await prisma.notification.findMany({
      where: {
        userId,
      },
      include: {
        creator: {
          select: {
            id: true,
            fullname: true,
            image: true,
          },
        },
        comic: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return notifications;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw new Error("Failed to fetch notifications");
  }
}

export async function getUnreadNotificationCount() {
  const userId = await getDbUserId();
  if (!userId) return 0;

  return await prisma.notification.count({
    where: {
      userId,
      read: false,
    },
  });
}

export async function markAllNotificationsAsRead() {
  const userId = await getDbUserId();
  if (!userId) return null;

  return await prisma.notification.updateMany({
    where: {
      userId,
      read: false,
    },
    data: {
      read: true,
    },
  });
}
