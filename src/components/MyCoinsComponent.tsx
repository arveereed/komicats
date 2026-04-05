"use client";

import { Coins, PlayCircle, ShoppingBag, Gift } from "lucide-react";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const missions = [
  {
    id: 1,
    title: "Love Water - Color Sort Puzzle",
    subtitle: "Multi Reward Mission",
    reward: 123,
    image:
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?q=80&w=1200&auto=format&fit=crop",
  },
  /* {
    id: 2,
    title: "Color Bolts Sort",
    subtitle: "Multi Reward Mission",
    reward: 123,
    image:
      "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1200&auto=format&fit=crop",
  }, */
];

export default function MyCoinsComponent({
  stats,
}: {
  stats: {
    coins: number;
    purchased: number;
    played: number;
  };
}) {
  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();
  const router = useRouter();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0]?.emailAddress === adminEmail;

  useEffect(() => {
    if (userLoaded && !isSignedIn) {
      router.push("/auth/sign-in");
    }

    if (isAdmin) {
      router.push("/admin");
    }
  }, [userLoaded, isSignedIn, router, isAdmin]);

  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <CoinsOverview
          coins={stats.coins}
          purchased={stats.purchased}
          played={stats.played}
        />
        <MissionGrid />
      </div>
    </section>
  );
}

function CoinsOverview({
  coins,
  purchased,
  played,
}: {
  coins: number;
  purchased: number;
  played: number;
}) {
  return (
    <Card className="overflow-hidden rounded-3xl border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-xl">
      <CardContent className="p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-4 sm:gap-5">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 sm:h-20 sm:w-20">
                <Coins className="h-8 w-8 text-teal-300 sm:h-10 sm:w-10" />
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                  Total Coins
                </p>
                <h1 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                  {coins}
                </h1>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:max-w-md sm:gap-4">
              <StatCard
                icon={<ShoppingBag className="h-4 w-4 text-teal-300" />}
                label="Purchased"
                value={purchased.toString()}
              />
              <StatCard
                icon={<PlayCircle className="h-4 w-4 text-teal-300" />}
                label="Played"
                value={played.toString()}
              />
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
            <Gift className="h-4 w-4 text-teal-300" />
            Earn more coins from reward missions
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-2 text-white/60">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function MissionGrid() {
  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-white/45">
            Missions
          </p>
          <h2 className="text-2xl font-semibold tracking-tight text-white">
            Earn more coins
          </h2>
        </div>

        <p className="text-sm text-white/55">
          Complete missions to unlock extra rewards.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {missions.map((mission) => (
          <MissionCard key={mission.id} mission={mission} />
        ))}
      </div>
    </div>
  );
}

function MissionCard({
  mission,
}: {
  mission: {
    id: number;
    title: string;
    subtitle: string;
    reward: number;
    image: string;
  };
}) {
  return (
    <Card className="group overflow-hidden rounded-3xl border-white/10 bg-white/5 text-white shadow-2xl backdrop-blur-xl transition duration-300 hover:-translate-y-1 hover:bg-white/[0.07]">
      <div className="relative aspect-[16/9] w-full overflow-hidden">
        <img
          src={mission.image}
          alt={mission.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#07141a]/90 via-[#07141a]/20 to-transparent" />
      </div>

      <CardContent className="p-4 sm:p-5">
        <div className="flex items-end justify-between gap-4">
          <div className="min-w-0">
            <h3 className="truncate text-lg font-semibold text-white sm:text-xl">
              {mission.title}
            </h3>
            <p className="mt-1 text-sm text-white/60 sm:text-base">
              {mission.subtitle}
            </p>
          </div>

          <div className="shrink-0">
            <Button
              variant="secondary"
              className="h-auto rounded-xl border border-white/10 bg-white/90 px-4 py-2 text-slate-950 hover:bg-white"
            >
              <div className="text-right leading-tight">
                <div className="text-xs font-medium text-slate-600">
                  Earn up to
                </div>
                <div className="mt-1 flex items-center justify-end gap-1 text-sm font-semibold">
                  <Coins className="h-3.5 w-3.5" />
                  {mission.reward}
                </div>
              </div>
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
