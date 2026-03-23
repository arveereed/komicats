"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Plus, Pencil, Trash, X, Loader2 } from "lucide-react";
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

type Profile = { id: string; name: string; image: string };

const STORAGE_KEY = "komicats_profiles";
const ACTIVE_KEY = "komicats_active_profile";

const DEFAULT_PROFILES: Profile[] = [
  {
    id: "1",
    name: "Stefi",
    image: "https://api.dicebear.com/7.x/avataaars/svg?seed=Stefi",
  },
];

export default function ProfileSelection() {
  const router = useRouter();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // State for Modals
  const [manageOpen, setManageOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newName, setNewName] = useState("");

  // 1. Initial Load
  useEffect(() => {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      try {
        setProfiles(JSON.parse(raw));
      } catch {
        setProfiles(DEFAULT_PROFILES);
      }
    } else {
      setProfiles(DEFAULT_PROFILES);
    }
    setIsLoaded(true);
  }, []);

  // 2. Persist Changes
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
    }
  }, [profiles, isLoaded]);

  const handleSelect = (profileId: string) => {
    localStorage.setItem(ACTIVE_KEY, profileId);
    router.push("/");
  };

  const handleAddProfile = () => {
    if (!newName.trim()) return;

    // Generates a random fun avatar based on the name + timestamp
    const randomSeed = `${newName}-${Date.now()}`;
    const newProfile: Profile = {
      id: crypto.randomUUID(),
      name: newName,
      image: `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${randomSeed}`,
    };

    setProfiles((prev) => [...prev, newProfile]);
    setNewName("");
    setAddOpen(false);
  };

  const deleteProfile = (id: string) => {
    setProfiles((prev) => prev.filter((p) => p.id !== id));
    if (localStorage.getItem(ACTIVE_KEY) === id) {
      localStorage.removeItem(ACTIVE_KEY);
    }
  };

  if (!isLoaded)
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Loader2 className="animate-spin" />
      </div>
    );

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center p-6 overflow-hidden">
      <div className="relative z-10 w-full max-w-5xl flex flex-col items-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-12 tracking-tight">
          Who's Reading?
        </h1>

        <div className="flex flex-wrap justify-center gap-10">
          {profiles.map((profile) => (
            <div
              key={profile.id}
              className="group flex flex-col items-center gap-4"
            >
              <button
                onClick={() => handleSelect(profile.id)}
                className="relative w-32 h-32 md:w-40 md:h-40 rounded-md overflow-hidden ring-offset-4 ring-offset-black transition-all hover:ring-2 hover:ring-white focus:outline-none focus:ring-2 focus:ring-white"
              >
                <Image
                  src={profile.image}
                  alt={profile.name}
                  fill
                  unoptimized // <--- Add this property
                  className="object-cover transition-transform group-hover:scale-105"
                  sizes="(max-width: 768px) 128px, 160px"
                />
              </button>
              <span className="text-lg text-zinc-400 group-hover:text-white transition-colors">
                {profile.name}
              </span>
            </div>
          ))}

          {/* Add Profile Button */}
          <div className="flex flex-col items-center gap-4">
            <button
              onClick={() => setAddOpen(true)}
              className="flex w-32 h-32 md:w-40 md:h-40 items-center justify-center rounded-md border-2 border-dashed border-zinc-700 bg-zinc-900/50 hover:bg-zinc-800 hover:border-zinc-500 transition-all group"
            >
              <Plus className="w-12 h-12 text-zinc-600 group-hover:text-zinc-300" />
            </button>
            <span className="text-lg text-zinc-500 italic">Add Profile</span>
          </div>
        </div>

        <Button
          variant="outline"
          onClick={() => setManageOpen(true)}
          className="mt-20 border-zinc-700 text-zinc-500 hover:bg-zinc-900 hover:text-white uppercase tracking-[0.2em] px-8"
        >
          Manage Profiles
        </Button>
      </div>

      {/* --- MODALS --- */}

      {/* Add Profile Dialog */}
      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white">
          <DialogHeader>
            <DialogTitle>Create New Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <Input
              placeholder="Profile Name"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="bg-zinc-900 border-zinc-800 focus-visible:ring-white"
              onKeyDown={(e) => e.key === "Enter" && handleAddProfile()}
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleAddProfile}
              className="bg-white text-black hover:bg-zinc-200"
            >
              Create
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage Profiles Dialog */}
      <Dialog open={manageOpen} onOpenChange={setManageOpen}>
        <DialogContent className="bg-zinc-950 border-zinc-800 text-white max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Profiles</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <div className="space-y-4 py-4">
              {profiles.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-900/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded bg-zinc-800 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.name}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <span className="font-medium">{p.name}</span>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => deleteProfile(p.id)}
                    className="text-zinc-500 hover:text-red-500"
                  >
                    <Trash className="w-4 h-4" />
                  </Button>
                </div>
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
