import DesktopNavbar from "./DesktopNavbar";
import { syncUser } from "@/actions/user.action";
import MobileNavbar from "./MobileNavbar";
import { currentUser } from "@clerk/nextjs/server";
import AdminNavbar from "./AdminNavbar";

export default async function Navbar() {
  const clerkUser = await currentUser();
  const user = await syncUser();

  const adminEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const userEmail = clerkUser?.primaryEmailAddress?.emailAddress
    ?.trim()
    .toLowerCase();

  const isAdmin = Boolean(adminEmail && userEmail === adminEmail);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-xl">
      <div className="mx-auto max-w-[1400px] px-6">
        {isAdmin ? (
          <AdminNavbar user={user} />
        ) : (
          <>
            <DesktopNavbar user={user} />
            <MobileNavbar user={user} />
          </>
        )}
      </div>
    </nav>
  );
}
