import DesktopNavbar from "./DesktopNavbar";
import { syncUser } from "@/actions/user.action";
import MobileNavbar from "./MobileNavbar";
import { currentUser } from "@clerk/nextjs/server";
import AdminNavbar from "./AdminNavbar";
import { getUnreadNotificationCount } from "@/actions/notification.action";
import { getActiveProfileId, getProfiles } from "@/actions/profile.action";

export default async function Navbar() {
  const clerkUser = await currentUser();
  const notificationsCount = await getUnreadNotificationCount();

  const user = await syncUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress
    ?.trim()
    .toLowerCase();

  const isAdmin = Boolean(adminEmail && userEmail === adminEmail);

  const profiles = await getProfiles();
  const activeProfileId = await getActiveProfileId();

  return (
    <nav className="fixed top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-6">
        {isAdmin ? (
          <AdminNavbar user={user} />
        ) : (
          <>
            <DesktopNavbar
              profiles={profiles}
              activeProfileId={activeProfileId}
              user={user}
              notificationsCount={notificationsCount}
            />
            <MobileNavbar
              profiles={profiles}
              activeProfileId={activeProfileId}
              user={user}
              notificationsCount={notificationsCount}
            />
          </>
        )}
      </div>
    </nav>
  );
}
