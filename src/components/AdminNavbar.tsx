"use client";

import { syncUser } from "@/actions/user.action";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2, Shield, UserCircle2 } from "lucide-react";
import { useState } from "react";
import { usePathname } from "next/navigation";

type SyncedUserType = Awaited<ReturnType<typeof syncUser>>;

export default function AdminNavbar({ user }: { user: SyncedUserType }) {
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);
  const pathname = usePathname();

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut({ redirectUrl: "/auth/sign-in" });
    } catch (error) {
      console.log("Error in handleSignOut fc: ", error);
      setSigningOut(false);
    }
  };

  const isOnRead = pathname.includes("/admin/comics");
  if (isOnRead) return null;

  return (
    <div className="flex h-16 items-center justify-between">
      <div className="flex items-center gap-10">
        <Link
          href="/admin"
          className="inline-flex items-center gap-2 font-mono text-xl font-bold tracking-wider text-white"
        >
          <Shield className="h-5 w-5 text-cyan-300" />
          <span>Welcome, Admin!</span>
        </Link>
      </div>

      <div className="flex items-center gap-4">
        {user && (
          <div className="flex items-center justify-center space-x-3">
            <div>
              <Button
                variant="ghost"
                className="h-11 cursor-default rounded-xl border border-white/10 bg-white/[0.04] px-2 hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.fullname || ""}
                    />
                    <AvatarFallback className="rounded-lg bg-white/10 text-white">
                      {typeof user?.fullname === "string" &&
                      user.fullname.length > 0 ? (
                        user.fullname.slice(0, 1).toUpperCase()
                      ) : (
                        <UserCircle2 className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <span className="hidden max-w-[120px] truncate text-sm font-medium text-white md:inline-block">
                    {user?.fullname}
                  </span>
                </div>
              </Button>
            </div>

            <Button
              disabled={signingOut}
              onClick={handleSignOut}
              variant="ghost"
              className="rounded-xl border border-transparent text-white/80 hover:border-white/10 hover:bg-white/10 hover:text-white"
            >
              {signingOut ? (
                <>
                  <Loader2 className="size-4 animate-spin" /> Loading...
                </>
              ) : (
                "Sign out"
              )}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
