"use client";

import { clearActiveProfile, getProfiles } from "@/actions/profile.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowRightLeft, Loader2, UserCircle2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

type profiles = Awaited<ReturnType<typeof getProfiles>>;

export default function ProfileSettingsActions({
  profiles,
  activeProfileId,
}: {
  profiles: profiles;
  activeProfileId: string | null;
}) {
  const router = useRouter();
  const [isSwitching, setIsSwitching] = useState(false);
  const activeProfile =
    profiles.find((profile) => profile.id === activeProfileId) ?? null;

  const handleSwitchUser = async () => {
    try {
      setIsSwitching(true);
      await clearActiveProfile();
      router.push("/profile/avatar");
    } catch (error) {
      console.error("Failed to switch profile:", error);
      setIsSwitching(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleSwitchUser}
      disabled={isSwitching}
      className="group flex w-full items-center justify-between rounded-3xl border border-white/10 bg-[#375055] px-5 py-4 text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)] transition hover:border-cyan-300/20 hover:bg-[#3d5a60] disabled:cursor-not-allowed disabled:opacity-70"
    >
      <div className="flex min-w-0 items-center gap-4">
        <Avatar className="h-12 w-12 rounded-md ring-2 ring-white/10 transition group-hover:ring-cyan-300/30">
          <AvatarImage
            src={activeProfile?.image}
            alt={activeProfile?.name}
            className="rounded-md object-cover"
          />
          <AvatarFallback className="rounded-md bg-white/10 text-white">
            <UserCircle2 className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>

        <div className="min-w-0 text-left">
          <p className="text-sm font-semibold text-white">
            {isSwitching ? "Switching user..." : "Switch user"}
          </p>
          <p className="text-xs text-white/60">
            {isSwitching
              ? "Please wait while we redirect you"
              : "Go back to avatar selection"}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center rounded-2xl bg-white/10 p-3 transition group-hover:bg-white/15">
        {isSwitching ? (
          <Loader2 className="h-4 w-4 animate-spin text-cyan-200" />
        ) : (
          <ArrowRightLeft className="h-4 w-4 text-cyan-200" />
        )}
      </div>
    </button>
  );
}
