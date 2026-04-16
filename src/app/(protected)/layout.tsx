// src/app/(protected)/layout.tsx
import Navbar from "@/components/Navbar";
import BottomNav from "@/components/BottomNavbar";
import MobileAppHeader from "@/components/MobileAppHeader";
import Image from "next/image";
import { currentUser } from "@clerk/nextjs/server";
import { getProfiles } from "@/actions/profile.action";
import { syncUser } from "@/actions/user.action";
import { getUnreadNotificationCount } from "@/actions/notification.action";

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const clerkUser = await currentUser();

  const adminEmail = process.env.ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  const profiles = await getProfiles();
  const user = await syncUser();
  const notificationsCount = await getUnreadNotificationCount();
  const activeProfileId = user?.activeProfileId ?? null;

  return (
    <main
      className={
        isAdmin
          ? "relative min-h-screen overflow-hidden bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white"
          : "relative min-h-screen overflow-hidden bg-[#07141a] text-white"
      }
    >
      <Navbar />

      <div className="pointer-events-none absolute inset-0 -z-10 flex items-center justify-center -bottom-96 -left-[700px]">
        <Image
          src="/icons/bg-logo.png"
          alt="Background logo"
          fill
          className="object-contain mt-[100px] opacity-[0.05]"
          priority
        />
      </div>

      <MobileAppHeader user={user} notificationsCount={notificationsCount} />

      {children}

      <BottomNav profiles={profiles} activeProfileId={activeProfileId} />
    </main>
  );
}
