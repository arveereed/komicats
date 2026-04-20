"use client";

import Link from "next/link";
import CoinPlanListSection from "@/components/admin/CoinPlanListSection";
import AdminCreatePlanComponent from "@/components/admin/AdminCreatePlanComponent";
import { useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { notFound, useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

export default function CoinPlan({ plans }: { plans: any }) {
  const { isSignedIn, isLoaded: userLoaded, user: clerkUser } = useUser();

  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL;
  const router = useRouter();

  const isAdmin =
    !!adminEmail && clerkUser?.emailAddresses[0].emailAddress === adminEmail;
  const isGuest = !clerkUser && !isSignedIn;

  useEffect(() => {
    if (!userLoaded) return;

    if (isGuest) {
      router.replace("/auth/sign-in");
      return;
    }

    if (isAdmin) {
      router.replace("/admin/plans");
    } else {
      return notFound();
    }
  }, [userLoaded, isGuest, isAdmin, router]);

  return (
    <section className="space-y-8 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Coin Plan Admin</h1>
          <p className="text-sm text-zinc-400">
            Create, edit, and manage your coin plans.
          </p>
        </div>

        <Link
          href="/admin"
          className="inline-flex items-center  mx-4 mt-4 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10"
        >
          <ArrowLeft className="size-4 mr-2" />
          Back to Admin
        </Link>
      </div>

      <div className="grid gap-8 xl:grid-cols-[420px,minmax(0,1fr)]">
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <div className="mb-4">
            <h2 className="text-2xl font-bold text-white">Create New Plan</h2>
            <p className="text-sm text-zinc-400">
              Add a new coin plan for your users.
            </p>
          </div>

          <AdminCreatePlanComponent />
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-sm">
          <CoinPlanListSection plans={plans} />
        </div>
      </div>
    </section>
  );
}
