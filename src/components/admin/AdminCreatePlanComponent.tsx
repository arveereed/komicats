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
    <Card className="rounded-[28px] border border-slate-700/60 bg-slate-950/80 text-slate-100 shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-400/20 bg-cyan-400/10">
            <Coins className="h-5 w-5 text-cyan-300" />
          </div>

          <div>
            <CardTitle className="text-xl font-semibold text-white">
              Create Coin Plan
            </CardTitle>
            <p className="mt-1 text-sm text-slate-400">
              Add a new coin pack for the shop.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-slate-200">
                Plan Name
              </Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Starter Pack"
                className="border-slate-700 bg-slate-900/80 text-white placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug" className="text-slate-200">
                Slug
              </Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={generatedSlug}
                placeholder="starter-pack"
                className="border-slate-700 bg-slate-900/80 text-white placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30"
                required
              />
              <p className="text-xs text-slate-500">
                Suggested: {generatedSlug || "starter-pack"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="coins" className="text-slate-200">
                Coins
              </Label>
              <Input
                id="coins"
                name="coins"
                type="number"
                min={0}
                placeholder="20"
                className="border-slate-700 bg-slate-900/80 text-white placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonusCoins" className="text-slate-200">
                Bonus Coins
              </Label>
              <Input
                id="bonusCoins"
                name="bonusCoins"
                type="number"
                min={0}
                placeholder="2"
                className="border-slate-700 bg-slate-900/80 text-white placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAmount" className="text-slate-200">
                Price Amount (centavos)
              </Label>
              <Input
                id="priceAmount"
                name="priceAmount"
                type="number"
                min={1}
                placeholder="19900"
                className="border-slate-700 bg-slate-900/80 text-white placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features" className="text-slate-200">
              Features
            </Label>
            <Textarea
              id="features"
              name="features"
              rows={5}
              placeholder={`Bonus Coins every month
Ad-free reading in Originals and Browsing
KOMICATS SHOP coupon`}
              className="border-slate-700 bg-slate-900/80 text-white placeholder:text-slate-500 focus-visible:border-cyan-400 focus-visible:ring-cyan-400/30"
            />
            <p className="text-xs text-slate-500">Put one feature per line.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <Checkbox id="isPopular" name="isPopular" />
              <Label
                htmlFor="isPopular"
                className="cursor-pointer text-slate-200"
              >
                Mark as popular
              </Label>
            </div>

            <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/60 px-3 py-2">
              <Checkbox id="isActive" name="isActive" defaultChecked />
              <Label
                htmlFor="isActive"
                className="cursor-pointer text-slate-200"
              >
                Active in shop
              </Label>
            </div>
          </div>

          {state.message && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                state.success
                  ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-300"
                  : "border-rose-500/30 bg-rose-500/10 text-rose-300"
              }`}
            >
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-gradient-to-r from-cyan-400 via-sky-400 to-blue-500 font-medium text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:brightness-110"
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
