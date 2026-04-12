"use client";

import {
  clearActiveProfile,
  getProfiles,
  updateProfile,
} from "@/actions/profile.action";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ArrowRightLeft,
  Camera,
  Loader2,
  Pencil,
  Save,
  UserCircle2,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { ChangeEvent, useMemo, useRef, useState, useTransition } from "react";

type Profiles = Awaited<ReturnType<typeof getProfiles>>;

export default function ProfileSettingsActions({
  profiles,
  activeProfileId,
}: {
  profiles: Profiles;
  activeProfileId: string | null;
}) {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSwitching, setIsSwitching] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();

  const activeProfile =
    profiles.find((profile) => profile.id === activeProfileId) ?? null;

  const [name, setName] = useState(activeProfile?.name ?? "");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(
    activeProfile?.image ?? null,
  );

  const hasChanges = useMemo(() => {
    return name.trim() !== (activeProfile?.name ?? "") || selectedFile !== null;
  }, [name, activeProfile?.name, selectedFile]);

  const handleSwitchUser = async () => {
    try {
      setIsSwitching(true);
      await clearActiveProfile();
      router.push("/profile/avatar");
      router.refresh();
    } catch (error) {
      console.error("Failed to switch profile:", error);
      setIsSwitching(false);
    }
  };

  const handlePickImage = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFile(file);
    const localPreview = URL.createObjectURL(file);
    setPreview(localPreview);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setName(activeProfile?.name ?? "");
    setSelectedFile(null);
    setPreview(activeProfile?.image ?? null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSave = async () => {
    if (!activeProfile?.id) return;

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.append("profileId", activeProfile.id);
        formData.append("name", name.trim());

        if (selectedFile) {
          formData.append("image", selectedFile);
        }

        const result = await updateProfile(formData);

        if (!result.success) {
          console.error(result.message);
          return;
        }

        setIsEditing(false);
        setSelectedFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
        router.refresh();
      } catch (error) {
        console.error("Failed to update profile:", error);
      }
    });
  };

  if (!activeProfile) {
    return null;
  }

  return (
    <div className="space-y-4 rounded-[28px] border border-white/10 bg-[#375055] p-5 text-white shadow-[0_16px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-4">
          <div className="relative">
            <Avatar className="h-16 w-16 rounded-2xl ring-2 ring-white/10">
              <AvatarImage
                src={preview ?? activeProfile.image}
                alt={activeProfile.name}
                className="rounded-2xl object-cover"
              />
              <AvatarFallback className="rounded-2xl bg-white/10 text-white">
                <UserCircle2 className="h-7 w-7" />
              </AvatarFallback>
            </Avatar>

            {isEditing && (
              <button
                type="button"
                onClick={handlePickImage}
                className="absolute -bottom-2 -right-2 flex h-9 w-9 items-center justify-center rounded-full border border-white/10 bg-cyan-400 text-slate-900 shadow-lg transition hover:scale-105"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>

          <div className="min-w-0 flex-1">
            {!isEditing ? (
              <>
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-200/70">
                  Active profile
                </p>
                <h3 className="truncate text-lg font-semibold text-white">
                  {activeProfile.name}
                </h3>
                <p className="text-sm text-white/60">
                  Manage your avatar and display name
                </p>
              </>
            ) : (
              <div className="space-y-2">
                <label className="text-xs font-medium uppercase tracking-[0.18em] text-cyan-200/70">
                  Profile name
                </label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter profile name"
                  maxLength={40}
                  className="w-full rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-white outline-none placeholder:text-white/40 focus:border-cyan-300/40"
                />
                <p className="text-xs text-white/50">
                  You can also upload a new avatar image.
                </p>
              </div>
            )}
          </div>
        </div>

        {!isEditing ? (
          <button
            type="button"
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15"
          >
            <Pencil className="h-4 w-4" />
            Edit
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancelEdit}
              disabled={isPending}
              className="flex items-center gap-2 rounded-2xl bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/15 disabled:opacity-60"
            >
              <X className="h-4 w-4" />
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isPending}
              className="flex items-center gap-2 rounded-2xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Save
            </button>
          </div>
        )}
      </div>

      <button
        type="button"
        onClick={handleSwitchUser}
        disabled={isSwitching || isPending}
        className="group flex w-full items-center justify-between rounded-3xl border border-white/10 bg-[#2f454a] px-5 py-4 text-white transition hover:border-cyan-300/20 hover:bg-[#355056] disabled:cursor-not-allowed disabled:opacity-70"
      >
        <div className="flex min-w-0 items-center gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            {isSwitching ? (
              <Loader2 className="h-5 w-5 animate-spin text-cyan-200" />
            ) : (
              <ArrowRightLeft className="h-5 w-5 text-cyan-200" />
            )}
          </div>

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
      </button>
    </div>
  );
}
