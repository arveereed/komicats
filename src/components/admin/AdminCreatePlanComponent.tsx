"use client";

import { useActionState, useMemo, useState } from "react";
import { Coins, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { createCoinPlan } from "@/actions/plan.action";

const initialState = {
  success: false,
  message: "",
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

export default function AdminCreatePlanComponent() {
  const [name, setName] = useState("");

  const [state, formAction, pending] = useActionState(
    createCoinPlan,
    initialState,
  );

  const generatedSlug = useMemo(() => slugify(name), [name]);

  return (
    <Card className="relative overflow-hidden rounded-[32px] border border-white/10 bg-[#375055]/80 text-white shadow-[0_24px_80px_rgba(0,0,0,0.35)] backdrop-blur-2xl">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 top-0 h-40 w-40 rounded-full bg-cyan-400/10 blur-3xl" />
        <div className="absolute -right-10 bottom-0 h-44 w-44 rounded-full bg-teal-400/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.015)_100%)]" />
      </div>

      <CardHeader className="relative z-10 border-b border-white/10 pb-6">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 shadow-inner shadow-cyan-200/10">
            <Coins className="h-5 w-5 text-cyan-200" />
          </div>

          <div>
            <CardTitle className="text-2xl font-semibold tracking-tight text-white">
              Create Coin Plan
            </CardTitle>
            <p className="mt-1 text-sm text-white/65">
              Add a new coin pack that matches the Komicats shop theme.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent className="relative z-10 pt-6">
        <form action={formAction} className="space-y-6">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white/85">
                Plan Name
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Starter Pack"
                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-white/85">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={generatedSlug}
                placeholder="starter-pack"
                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
                required
              />
              <p className="text-xs text-white/45">
                Suggested: {generatedSlug || "starter-pack"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="coins" className="text-white/85">
                Coins
              </Label>
              <Input
                id="coins"
                name="coins"
                type="number"
                min={0}
                placeholder="20"
                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonusCoins" className="text-white/85">
                Bonus Coins
              </Label>
              <Input
                id="bonusCoins"
                name="bonusCoins"
                type="number"
                min={0}
                placeholder="2"
                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAmount" className="text-white/85">
                Price Amount (centavos)
              </Label>
              <Input
                id="priceAmount"
                name="priceAmount"
                type="number"
                min={1}
                placeholder="199"
                className="h-12 rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features" className="text-white/85">
              Features
            </Label>
            <Textarea
              id="features"
              name="features"
              rows={5}
              placeholder={`Bonus Coins every month
Ad-free reading in Originals and Browsing
KOMICATS SHOP coupon`}
              className="min-h-[132px] rounded-2xl border-white/10 bg-black/20 text-white placeholder:text-white/35 focus-visible:border-cyan-300/50 focus-visible:ring-2 focus-visible:ring-cyan-300/20"
            />
            <p className="text-xs text-white/45">Put one feature per line.</p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Checkbox
                id="isPopular"
                name="isPopular"
                className="border-white/30 data-[state=checked]:border-cyan-300 data-[state=checked]:bg-cyan-300 data-[state=checked]:text-slate-950"
              />
              <Label
                htmlFor="isPopular"
                className="cursor-pointer text-sm font-medium text-white/85"
              >
                Mark as popular
              </Label>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
              <Checkbox
                id="isActive"
                name="isActive"
                defaultChecked
                className="border-white/30 data-[state=checked]:border-cyan-300 data-[state=checked]:bg-cyan-300 data-[state=checked]:text-slate-950"
              />
              <Label
                htmlFor="isActive"
                className="cursor-pointer text-sm font-medium text-white/85"
              >
                Active in shop
              </Label>
            </div>
          </div>

          {state.message && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                state.success
                  ? "border-emerald-400/25 bg-emerald-400/10 text-emerald-200"
                  : "border-rose-400/25 bg-rose-400/10 text-rose-200"
              }`}
            >
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="h-12 w-full rounded-2xl bg-gradient-to-r from-cyan-300 via-sky-300 to-teal-300 font-semibold text-slate-950 shadow-[0_16px_40px_rgba(34,211,238,0.22)] transition hover:brightness-110 disabled:opacity-70"
          >
            {pending ? (
              "Creating plan..."
            ) : (
              <span className="flex items-center gap-2">
                <PlusCircle className="h-4 w-4" />
                Create Plan
              </span>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
