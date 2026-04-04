"use client";

import Image from "next/image";
import { Coins, Check, Sparkles } from "lucide-react";
import { useFormStatus } from "react-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buyCoinsAction } from "@/actions/shop.action";

type Plan = {
  id: string;
  name: string;
  coins: number;
  bonusCoins: number;
  priceAmount: number;
  isPopular: boolean;
  features: {
    id: string;
    label: string;
    order: number;
  }[];
};

type Props = {
  stats: {
    coins: number;
    purchased: number;
    played: number;
  };
  plans: Plan[];
};

function formatPhp(cents: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

export default function ShopComponent({ stats, plans }: Props) {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <ShopStats
          coins={stats.coins}
          purchased={stats.purchased}
          played={stats.played}
        />
        <PricingSection plans={plans} />
      </div>
    </section>
  );
}

function ShopStats({
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
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/10 bg-white/10 sm:h-20 sm:w-20">
              <Coins className="h-8 w-8 text-teal-300 sm:h-10 sm:w-10" />
            </div>

            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-white/50">
                Total Coins
              </p>
              <h2 className="mt-1 text-4xl font-bold tracking-tight sm:text-5xl">
                {coins}
              </h2>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            <StatBox label="Purchased" value={String(purchased)} />
            <StatBox label="Played" value={String(played)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-[120px] rounded-2xl border border-white/10 bg-white/5 px-4 py-4 text-center">
      <p className="text-sm text-white/60">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
    </div>
  );
}

function PricingSection({ plans }: { plans: Plan[] }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {plans.map((plan) => (
        <PlanCard key={plan.id} plan={plan} />
      ))}
    </div>
  );
}

function SubmitButton({ priceAmount }: { priceAmount: number }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={pending}
      className="mt-6 h-10 w-full rounded-md bg-[linear-gradient(90deg,#7468ff_0%,#6fd7ff_50%,#7468ff_100%)] py-2 text-[18px] font-medium text-[#2f2f2f] shadow-md"
    >
      {pending ? "Redirecting..." : `Buy for ${formatPhp(priceAmount)}`}
    </Button>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  return (
    <Card
      className={`relative rounded-3xl border text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
        plan.isPopular
          ? "border-teal-300/30 bg-gradient-to-br from-teal-400/10 via-white/5 to-cyan-400/10"
          : "border-white/10 bg-white/5"
      }`}
    >
      <CardHeader className="space-y-4 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Image src="/coin-pack.png" alt="Coin" width={35} height={35} />
              <CardTitle className="text-lg font-semibold sm:text-xl">
                {plan.name}
              </CardTitle>
            </div>

            <div className="mt-3 flex items-end gap-2">
              <span className="text-3xl font-bold tracking-tight sm:text-4xl">
                {plan.coins}
              </span>
              <span className="pb-1 text-base text-white/70">
                + {plan.bonusCoins}
              </span>
            </div>
          </div>

          {plan.isPopular && (
            <div className="inline-flex items-center gap-1 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-medium text-teal-200">
              <Sparkles className="h-3.5 w-3.5" />
              Most Popular
            </div>
          )}
        </div>

        <div className="h-px w-full bg-white/10" />
      </CardHeader>

      <CardContent className="space-y-6">
        <ul className="space-y-3">
          {plan.features.map((feature) => (
            <li
              key={feature.id}
              className="flex items-start gap-3 text-sm text-white/85 sm:text-base"
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
              <span>{feature.label}</span>
            </li>
          ))}
        </ul>

        <form action={buyCoinsAction}>
          <input type="hidden" name="planId" value={plan.id} />
          <SubmitButton priceAmount={plan.priceAmount} />
        </form>
      </CardContent>
    </Card>
  );
}
