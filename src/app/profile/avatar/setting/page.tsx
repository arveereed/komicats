"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function SettingPage() {
  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);
  const router = useRouter();

  const pathname = usePathname() || "";

  const handleConfirmSwitchUser = () => {
    setOpenSwitchDialog(false);
    localStorage.removeItem("komicats_active_profile");
    router.push("/profile/avatar");
  };

  return (
    <>
      <AlertDialog open={openSwitchDialog} onOpenChange={setOpenSwitchDialog}>
        <AlertDialogTrigger asChild>
          <button type="button">
            Switch User
            {pathname === "/profile/avatar" && (
              <span className="absolute -bottom-1 left-0 h-px w-full bg-white/80" />
            )}
          </button>
        </AlertDialogTrigger>

        <AlertDialogContent className="border-white/10 bg-zinc-950 text-white sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-left text-xl">
              Switch user?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-left text-zinc-400">
              You’re about to leave the current avatar profile view and switch
              to another user.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-sm text-zinc-400">
            You can always come back to this profile later.
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-lg border-white/10 bg-transparent text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmSwitchUser}
              className="rounded-lg bg-white text-black hover:bg-white/90"
            >
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
