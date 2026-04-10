"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  getProfiles,
  createProfile,
  deleteProfile,
  setActiveProfile,
} from "@/actions/profile.action";
import { ProfileListItem } from "@/components/ProfileListItem";
import { useUser } from "@clerk/nextjs";

type Profile = { id: string; name: string; image: string };

export default function ProfileSelection() {
  const router = useRouter();

  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // FIX: Change boolean to string/null to track the specific ID
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;

  // Move the navigation logic here
  useEffect(() => {
    if (userLoaded && isSignedIn && !isAdmin) {
      router.push("/profile/avatar");
    }
    if (isAdmin) {
      router.push("/admin");
    }
  }, [userLoaded, isSignedIn, router, isAdmin]);

  useEffect(() => {
    async function load() {
      const data = await getProfiles();
      setProfiles(data);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleSelect = async (profileId: string) => {
    await setActiveProfile(profileId);
    router.replace("/profile/avatar/home");
  };

  const handleAddProfile = async () => {
    if (!newName.trim() || isSubmitting) return;
    setIsSubmitting(true);

    try {
      const randomSeed = `${newName}-${Date.now()}`;
      const avatarUrl = `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomSeed}`;

      const res = await createProfile(newName, avatarUrl);
      setProfiles((prev) => [...prev, res]);
      setNewName("");
      setAddOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!id) return;

    // FIX: Set the specific ID we are working on
    setDeletingId(id);

    try {
      await deleteProfile(id);
      setProfiles((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error(err);
    } finally {
      // FIX: Reset after finished
      setDeletingId(null);
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 ">
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-12">Who's Reading?</h1>

        <div className="flex flex-wrap justify-center gap-10">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="group flex flex-col items-center gap-4"
            >
              <button
                onClick={() => handleSelect(profile.id, profile.name)}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden ring-offset-4 ring-offset-black transition-all hover:ring-2 hover:ring-white"
              >
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </button>
              <span className="text-lg text-zinc-400 group-hover:text-white">
                {profile.name}
              </span>
            </div>
          ))}

          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setAddOpen(true)}
              className="flex w-32 h-32 md:w-40 md:h-40 items-center justify-center rounded-md border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 transition-all"
            >
              <Plus className="w-12 h-12 text-zinc-600" />
            </button>
            <span className="text-lg text-zinc-500 italic">Add Profile</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setManageOpen(true)}
          className="mt-20 border-zinc-700 text-zinc-500 hover:text-white hover:border-white uppercase tracking-widest"
        >
          Manage Profiles
        </Button>
      </div>

      {/* Add Profile Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
          </DialogHeader>
          <Input
            placeholder="Profile Name"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            disabled={isSubmitting}
            className="bg-zinc-900 border-zinc-800"
            onKeyDown={(e) => e.key === "Enter" && handleAddProfile()}
          />
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddProfile} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="animate-spin w-4 h-4" />
              ) : (
                "Create"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Edit Profiles</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-2 py-4">
              {profiles.map((p) => (
                <ProfileListItem
                  key={p.id}
                  profile={p}
                  onDelete={handleDelete}
                  isDeleting={deletingId === p.id} // FIX: Now correctly comparing strings
                />
              ))}
            </div>
          </ScrollArea>
          <DialogFooter>
            <Button
              onClick={() => setManageOpen(false)}
              className="w-full bg-zinc-800 hover:bg-zinc-700"
            >
              Done
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
