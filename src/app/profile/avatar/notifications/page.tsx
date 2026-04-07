export const dynamic = "force-dynamic";

import { getNotifications } from "@/actions/notification.action";
import NotificationCard from "@/components/NotificationCard";

export default async function NewArrivalList() {
  const notifications = await getNotifications();

  return (
    <section className="relative overflow-hidden border border-cyan-900/40 bg-gradient-to-b from-[#35535b] via-[#17323a] to-[#02141a] text-white">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_25%,rgba(255,255,255,0.06),transparent_28%),radial-gradient(circle_at_75%_20%,rgba(255,255,255,0.03),transparent_22%),linear-gradient(to_bottom,rgba(255,255,255,0.02),rgba(0,0,0,0.4))]" />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="select-none text-[3.5rem] font-black leading-none text-white/[0.04] sm:text-[5rem] md:text-[7rem] lg:text-[10rem]">
            Komicats
          </span>
        </div>
      </div>

      <NotificationCard notifications={notifications} />
    </section>
  );
}
