"use client";

import Image from "next/image";
import Link from "next/link";
import { getNotifications } from "@/actions/notification.action";

type Notifications = Awaited<ReturnType<typeof getNotifications>>;

export default function NotificationCard({
  notifications,
}: {
  notifications: Notifications;
}) {
  return (
    <div className="relative z-10">
      {notifications.map((item, index) => {
        const comic = item.comic;

        if (!comic) return null;

        const content = (
          <div className="group flex min-h-[255px] flex-col items-start gap-5 px-4 py-6 transition hover:bg-white/[0.03] sm:px-5 sm:py-8 md:flex-row md:items-center md:gap-6 md:px-6 lg:gap-8 lg:px-8 lg:py-12">
            <div className="relative h-[180px] w-[128px] shrink-0 overflow-hidden rounded-2xl bg-white/10 shadow-xl sm:h-[200px] sm:w-[140px] md:h-[212px] md:w-[152px]">
              {comic.thumbnail ? (
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

            <div className="w-full space-y-1">
              <p className="text-2xl font-extrabold tracking-tight text-white sm:text-3xl lg:text-4xl">
                {item.type === "COMIC" ? "New Arrival" : "Notification"}
              </p>

              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl lg:text-4xl">
                {comic.title}
              </h2>

              <p className="pt-2 text-base text-white/55 sm:text-lg md:text-xl lg:text-2xl">
                {new Date(item.createdAt).toLocaleDateString("en-PH", {
                  month: "long",
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
            <Link href={`/profile/avatar/comics/${comic.id}`} className="block">
              {content}
            </Link>
          </div>
        );
      })}
    </div>
  );
}
