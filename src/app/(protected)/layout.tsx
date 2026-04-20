export const dynamic = "force-dynamic";

import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNavbar";
import MobileAppHeader from "@/components/MobileAppHeader";
import { auth } from "@clerk/nextjs/server";
import { getProfiles } from "@/actions/profile.action";
import { syncUser } from "@/actions/user.action";
import { getUnreadNotificationCount } from "@/actions/notification.action";
import Image from "next/image";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authData = await auth();
  let userId: string | null = null;

  try {
    userId = authData.userId;
  } catch (error) {
    console.error("Clerk auth failed in protected layout:", error);
    userId = null;
  }

  type Profiles = Awaited<ReturnType<typeof getProfiles>>;
  type UserData = Awaited<ReturnType<typeof syncUser>>;
  type NotificationCount = Awaited<
    ReturnType<typeof getUnreadNotificationCount>
  >;

  let profiles: Profiles = [];
  let user: UserData = null;
  let notificationsCount: NotificationCount = 0;

  if (userId) {
    try {
      profiles = await getProfiles();
    } catch (error) {
      console.error("getProfiles failed:", error);
    }

    try {
      user = await syncUser();
    } catch (error) {
      console.error("syncUser failed:", error);
    }

    try {
      notificationsCount = await getUnreadNotificationCount();
    } catch (error) {
      console.error("getUnreadNotificationCount failed:", error);
    }
  }

  const activeProfileId = user?.activeProfileId ?? null;

  return (
    <main className="relative min-h-screen overflow-hidden bg-gradient-to-b from-[#27484e] via-[#11262b] to-[#020507] text-white">
      <div className="relative z-10 min-h-screen">
        <Navbar />
        <MobileAppHeader user={user} notificationsCount={notificationsCount} />

        <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center -bottom-12 -left-[700px]  ">
          <Image
            src="/icons/bg-logo.png"
            alt="Background logo"
            fill
            className="object-contain opacity-[0.05] "
            priority
          />
        </div>

        {children}
        <BottomNav profiles={profiles} activeProfileId={activeProfileId} />
      </div>
    </main>
  );
}
