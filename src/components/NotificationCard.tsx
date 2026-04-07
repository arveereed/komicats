"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Bell,
  MessageCircle,
  ThumbsDown,
  ThumbsUp,
  Sparkles,
} from "lucide-react";
import { getNotifications } from "@/actions/notification.action";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;
type NotificationItem = Notifications[number];

function getNotificationMeta(item: NotificationItem) {
  const comic = item.comic;
  const creatorName = item.creator?.fullname || "Someone";
  const episodeTitle = item.episode?.title || "an episode";
  const commentPreview = item.comment?.content || "";
  const replyPreview = item.reply?.content || "";

  switch (item.type) {
    case "COMIC":
      return {
        title: "New Arrival",
        subtitle: comic?.title || "New comic",
        description: comic?.description || "A new comic is available.",
        icon: <Sparkles className="h-5 w-5" />,
        accent: "border-emerald-400/20 bg-emerald-400/10 text-emerald-200",
      };

    case "COMMENT_LIKE":
      return {
        title: "Comment liked",
        subtitle: `${creatorName} liked your comment`,
        description:
          commentPreview || `Your comment on ${episodeTitle} got a like.`,
        icon: <ThumbsUp className="h-5 w-5" />,
        accent: "border-sky-400/20 bg-sky-400/10 text-sky-200",
      };

    case "COMMENT_DISLIKE":
      return {
        title: "Comment disliked",
        subtitle: `${creatorName} disliked your comment`,
        description:
          commentPreview || `Your comment on ${episodeTitle} got a dislike.`,
        icon: <ThumbsDown className="h-5 w-5" />,
        accent: "border-rose-400/20 bg-rose-400/10 text-rose-200",
      };

    case "COMMENT_REPLY":
      return {
        title: "New reply",
        subtitle: `${creatorName} replied to your comment`,
        description: replyPreview || `You received a reply on ${episodeTitle}.`,
        icon: <MessageCircle className="h-5 w-5" />,
        accent: "border-violet-400/20 bg-violet-400/10 text-violet-200",
      };

    default:
      return {
        title: "Notification",
        subtitle: comic?.title || "Update",
        description: "You have a new notification.",
        icon: <Bell className="h-5 w-5" />,
        accent: "border-white/10 bg-white/10 text-white/80",
      };
  }
}

function getNotificationHref(item: NotificationItem) {
  if (item.type === "COMIC" && item.comic?.id) {
    return `/profile/avatar/comics/${item.comic.id}`;
  }

  if (item.comic?.id && item.episode?.id) {
    return `/profile/avatar/comics/${item.comic.id}/episode/${item.episode.id}/comments`;
  }

  if (item.comic?.id) {
    return `/profile/avatar/comics/${item.comic.id}`;
  }

  return "#";
}

export default function NotificationCard({
  notifications,
}: {
  notifications: Notifications;
}) {
  if (!notifications.length) {
    return (
      <div className="relative z-10 px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 px-6 py-10 text-center backdrop-blur-sm">
          <p className="text-xl font-semibold text-white">
            No notifications yet
          </p>
          <p className="mt-2 text-sm text-white/60">
            When someone interacts with your comments or a new comic arrives, it
            will show up here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10">
      {notifications.map((item, index) => {
        const comic = item.comic;
        const href = getNotificationHref(item);
        const meta = getNotificationMeta(item);

        const content = (
          <div className="group flex min-h-[220px] flex-col gap-5 px-4 py-6 transition hover:bg-white/[0.03] sm:px-5 sm:py-8 md:flex-row md:items-center md:gap-6 md:px-6 lg:gap-8 lg:px-8 lg:py-10">
            <div className="relative h-[170px] w-[122px] shrink-0 overflow-hidden rounded-2xl bg-white/10 shadow-xl sm:h-[190px] sm:w-[136px] md:h-[208px] md:w-[148px]">
              {comic?.thumbnail ? (
                <Image
                  src={comic.thumbnail}
                  alt={comic.title}
                  fill
                  className="object-cover transition duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-white/50">
                  No image
                </div>
              )}
            </div>

            <div className="w-full space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span
                  className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] ${meta.accent}`}
                >
                  {meta.icon}
                  {meta.title}
                </span>

                {!item.read ? (
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-cyan-300" />
                ) : null}
              </div>

              <div>
                <h2 className="text-xl font-extrabold leading-tight text-white sm:text-2xl lg:text-3xl">
                  {meta.subtitle}
                </h2>

                {comic?.title ? (
                  <p className="mt-1 text-base font-semibold text-cyan-100/90 sm:text-lg">
                    {comic.title}
                  </p>
                ) : null}
              </div>

              <p className="max-w-3xl text-sm leading-7 text-white/70 sm:text-base">
                {meta.description}
              </p>

              <p className="pt-1 text-sm text-white/45 sm:text-base">
                {new Date(item.createdAt).toLocaleString("en-PH", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
          </div>
        );

        return (
          <div
            key={item.id}
            className={index !== 0 ? "border-t border-cyan-200/20" : ""}
          >
            {href === "#" ? (
              <div>{content}</div>
            ) : (
              <Link href={href} className="block">
                {content}
              </Link>
            )}
          </div>
        );
      })}
    </div>
  );
}
