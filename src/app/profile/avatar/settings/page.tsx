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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function page() {
  const [openSwitchDialog, setOpenSwitchDialog] = useState(false);
  const router = useRouter();

  const handleConfirmSwitchUser = () => {
    setOpenSwitchDialog(false);
    localStorage.removeItem("komicats_active_profile");
    router.push("/profile/avatar");
  };

  return (
    <div className="relative z-10 max-w-7xl mx-auto px-4 py-8">
      settings page
      {/* Switch User Dialog */}
      <AlertDialog open={openSwitchDialog} onOpenChange={setOpenSwitchDialog}>
        <AlertDialogTrigger asChild>
          <button type="button" className="group">
            <Avatar className="h-9 w-9 rounded-full ring-1 ring-white/10 transition group-hover:ring-cyan-300/30">
              <AvatarImage src={"profileImage"} alt={"profileName"} />
              <AvatarFallback className="rounded-full bg-white/10 text-white">
                <UserCircle2 className="h-4 w-4" />
              </AvatarFallback>
            </Avatar>
          </button>
        </AlertDialogTrigger>

        {/* CHANGED: bg-[#08161c] -> bg-black */}
        <AlertDialogContent className="overflow-hidden border border-white/10 bg-black p-0 text-white shadow-2xl shadow-black/40 sm:max-w-md">
          <div className="relative">
            {/* Keep the fancy gradients but slightly toned down for black bg */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(86,153,160,0.08),transparent_30%),radial-gradient(circle_at_top_right,rgba(72,117,126,0.05),transparent_32%),linear-gradient(135deg,#000_0%,#000_40%,#000_100%)]" />
            <div className="absolute -left-10 top-6 h-32 w-32 rounded-full bg-teal-300/10 blur-3xl" />
            <div className="absolute right-0 top-0 h-28 w-28 rounded-full bg-cyan-400/10 blur-3xl" />
            <div className="absolute bottom-0 left-1/3 h-24 w-24 rounded-full bg-emerald-300/10 blur-3xl" />
            <div className="absolute inset-0 opacity-[0.05] [background-image:linear-gradient(rgba(255,255,255,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.12)_1px,transparent_1px)] [background-size:56px_56px]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_35%,rgba(0,0,0,0.4)_70%,rgba(0,0,0,0.7)_100%)]" />

            <div className="relative z-10 px-6 py-6">
              <AlertDialogHeader className="space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/5 shadow-inner shadow-white/5">
                  <UserCircle2 className="h-6 w-6 text-cyan-200" />
                </div>

                <AlertDialogTitle className="text-left text-2xl font-semibold tracking-tight text-white">
                  Switch user?
                </AlertDialogTitle>

                <AlertDialogDescription className="text-left leading-6 text-zinc-300">
                  You’re about to leave the current avatar profile view and
                  switch to another user.
                </AlertDialogDescription>
              </AlertDialogHeader>

              <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.04] p-4 text-sm leading-6 text-zinc-300 backdrop-blur-sm">
                You can always come back to this profile later.
              </div>

              <AlertDialogFooter className="mt-6 flex-col gap-3 sm:flex-row">
                <AlertDialogCancel className="rounded-xl border border-white/10 bg-white/[0.03] text-white hover:bg-white/10">
                  Cancel
                </AlertDialogCancel>

                <AlertDialogAction
                  onClick={handleConfirmSwitchUser}
                  className="rounded-xl border border-cyan-300/20 bg-gradient-to-r from-[#5699a0] via-[#48757e] to-[#2f5c63] text-white hover:opacity-90"
                >
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </div>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
