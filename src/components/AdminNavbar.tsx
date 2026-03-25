"use client";

import { syncUser } from "@/actions/user.action";
import { useClerk } from "@clerk/nextjs";
import Link from "next/link";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Loader2, UserCircle2 } from "lucide-react";
import { useState } from "react";

type SyncedUserType = Awaited<ReturnType<typeof syncUser>>;

export default function AdminNavbar({ user }: { user: SyncedUserType }) {
  const { signOut } = useClerk();
  const [signingOut, setSigningOut] = useState(false);

  const handleSignOut = async () => {
    setSigningOut(true);

    try {
      await signOut({ redirectUrl: "/auth/sign-in" });
    } catch (error) {
      console.log("Error in handleSignOut fc: ", error);
      setSigningOut(false);
    }
  };

  return (
    /* hidden md:flex */
    <div className="flex items-center justify-between">
      {/* LEFT SIDE */}
      <div className="flex h-16 items-center gap-10">
        {/* hidden md:flex  */}
        <Link
          href="/admin"
          className="font-mono text-xl font-bold tracking-wider text-white"
        >
          Welcome, Admin!
        </Link>
      </div>

      {/* RIGHT SIDE */}
      <div className="flex items-center gap-4">
        {user && (
          <div className="flex justify-center items-center space-x-3">
            <Link href="">
              <Button
                variant="ghost"
                className="h-11 rounded-xl border border-white/10 bg-white/[0.04] cursor-default px-2 hover:bg-white/[0.08]"
              >
                <div className="flex items-center gap-2">
                  <Avatar className="h-9 w-9 rounded-lg">
                    <AvatarImage
                      src={user?.image || ""}
                      alt={user?.fullname || ""}
                    />
                    <AvatarFallback className="rounded-lg bg-zinc-800 text-white">
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
            </Link>

            <Button
              disabled={signingOut}
              onClick={handleSignOut}
              variant="ghost"
              className="rounded-xl text-white/80 hover:bg-white/10 hover:text-white"
            >
              {signingOut ? (
                <>
                  <Loader2 className="animate-spin size-2" /> Loading..
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
