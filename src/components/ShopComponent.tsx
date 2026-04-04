"use client";

import Image from "next/image";
import Link from "next/link";
import {
  Coins,
  Check,
  Sparkles,
  CheckCircle2,
  CircleX,
  ArrowRight,
} from "lucide-react";
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
  paymentStatus?: string;
  referenceNumber?: string;
};

function formatPhp(cents: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(cents / 100);
}

export default function ShopComponent({
  stats,
  plans,
  paymentStatus,
  referenceNumber,
}: Props) {
  return (
    <section className="relative min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <PaymentStatusBanner
          status={paymentStatus}
          referenceNumber={referenceNumber}
        />

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

function PaymentStatusBanner({
  status,
  referenceNumber,
}: {
  status?: string;
  referenceNumber?: string;
}) {
  if (status !== "success" && status !== "cancelled") {
    return null;
  }

  const isSuccess = status === "success";

  return (
    <Card
      className={`overflow-hidden rounded-3xl border text-white shadow-2xl backdrop-blur-xl ${
        isSuccess
          ? "border-emerald-300/20 bg-gradient-to-br from-emerald-400/15 via-white/5 to-cyan-400/10"
          : "border-rose-300/20 bg-gradient-to-br from-rose-400/15 via-white/5 to-orange-400/10"
      }`}
    >
      <CardContent className="p-5 sm:p-6 lg:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-start gap-4 sm:gap-5">
            <div
              className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border sm:h-16 sm:w-16 ${
                isSuccess
                  ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                  : "border-rose-300/20 bg-rose-300/10 text-rose-200"
              }`}
            >
              {isSuccess ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <CircleX className="h-7 w-7" />
              )}
            </div>

            <div className="space-y-2">
              <div
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium ${
                  isSuccess
                    ? "border-emerald-300/20 bg-emerald-300/10 text-emerald-200"
                    : "border-rose-300/20 bg-rose-300/10 text-rose-200"
                }`}
              >
                {isSuccess ? <Sparkles className="h-3.5 w-3.5" /> : null}
                {isSuccess ? "Payment Submitted" : "Payment Cancelled"}
              </div>

              <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
                {isSuccess
                  ? "Payment received successfully"
                  : "Your checkout was cancelled"}
              </h1>

              <p className="max-w-2xl text-sm leading-6 text-white/70 sm:text-base">
                {isSuccess
                  ? "We’re now verifying your payment. Your coins will appear in your account once confirmation is completed."
                  : "No payment was completed. You can return to the shop and try again anytime."}
              </p>

              {referenceNumber ? (
                <p className="text-xs text-white/50">
                  Reference:{" "}
                  <span className="font-mono font-medium text-white/80">
                    {referenceNumber}
                  </span>
                </p>
              ) : null}

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link
                  href="/shop"
                  className="inline-flex h-10 items-center justify-center rounded-xl border border-white/10 bg-white/10 px-4 text-sm font-medium text-white transition hover:bg-white/15"
                >
                  {isSuccess ? "Buy more coins" : "Return to shop"}
                </Link>

                <Link
                  href={isSuccess ? "/library" : "/support"}
                  className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-[linear-gradient(90deg,#7468ff_0%,#6fd7ff_50%,#7468ff_100%)] px-4 text-sm font-medium text-[#2f2f2f] shadow-md"
                >
                  {isSuccess ? "Go to Library" : "Contact support"}
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>

          <div className="min-w-[220px] rounded-2xl border border-white/10 bg-white/5 p-4">
            <p className="text-sm font-semibold text-white">
              {isSuccess ? "What happens next?" : "Need help?"}
            </p>
            <p className="mt-2 text-sm leading-6 text-white/60">
              {isSuccess
                ? "Your purchase will be confirmed by your payment webhook before coins are credited."
                : "If you were charged but landed here, wait for payment confirmation or contact support with your reference number."}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
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
