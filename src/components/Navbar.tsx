import DesktopNavbar from "./DesktopNavbar";
import { syncUser } from "@/actions/user.action";
import MobileNavbar from "./MobileNavbar";

export default async function Navbar() {
  const user = await syncUser();

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-white/10 bg-black/95 backdrop-blur-xl supports-[backdrop-filter]:bg-black/80">
      <div className="mx-auto max-w-[1400px]  px-6">
        <DesktopNavbar user={user} />
        <MobileNavbar user={user} />
      </div>
    </nav>
  );
}
