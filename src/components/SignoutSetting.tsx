"use client";

import { SignOutButton } from "@clerk/nextjs";
import { LogOut } from "lucide-react";

export default function SignoutSetting() {
  return (
    <div className="rounded-3xl border border-white/10 bg-[#375055] p-4 shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <SignOutButton redirectUrl="/">
        <button
          type="button"
          className="flex w-full items-center justify-between rounded-2xl border border-red-300/15 bg-red-400/10 px-4 py-3 text-left text-red-100 transition hover:bg-red-400/15"
        >
          <div>
            <p className="text-sm font-semibold">Sign out</p>
            <p className="text-xs text-red-100/70">
              End your current session securely
            </p>
          </div>

          <div className="rounded-xl bg-red-400/10 p-2">
            <LogOut className="h-4 w-4" />
          </div>
        </button>
      </SignOutButton>
    </div>
  );
}
