"use client";

import { useActionState, useMemo, useState } from "react";
import { Coins, PlusCircle, Sparkles } from "lucide-react";
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
    <Card className="rounded-[28px] border border-white/10 bg-black/30 text-white shadow-2xl backdrop-blur-xl">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-white/10 bg-white/10">
            <Coins className="h-5 w-5 text-teal-300" />
          </div>

          <div>
            <CardTitle className="text-xl font-semibold">
              Create Coin Plan
            </CardTitle>
            <p className="mt-1 text-sm text-white/60">
              Add a new coin pack for the shop.
            </p>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <form action={formAction} className="space-y-5">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Plan Name</Label>
              <Input
                id="name"
                name="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Starter Pack"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                defaultValue={generatedSlug}
                placeholder="starter-pack"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
              <p className="text-xs text-white/45">
                Suggested: {generatedSlug || "starter-pack"}
              </p>
            </div>
          </div>

          <div className="grid gap-5 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="coins">Coins</Label>
              <Input
                id="coins"
                name="coins"
                type="number"
                min={0}
                placeholder="20"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bonusCoins">Bonus Coins</Label>
              <Input
                id="bonusCoins"
                name="bonusCoins"
                type="number"
                min={0}
                placeholder="2"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priceAmount">Price Amount (centavos)</Label>
              <Input
                id="priceAmount"
                name="priceAmount"
                type="number"
                min={1}
                placeholder="19900"
                className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="features">Features</Label>
            <Textarea
              id="features"
              name="features"
              rows={5}
              placeholder={`Bonus Coins every month
Ad-free reading in Originals and Browsing
KOMICATS SHOP coupon`}
              className="border-white/10 bg-white/5 text-white placeholder:text-white/40"
            />
            <p className="text-xs text-white/45">Put one feature per line.</p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <div className="flex items-center gap-3">
              <Checkbox id="isPopular" name="isPopular" />
              <Label htmlFor="isPopular" className="cursor-pointer">
                Mark as popular
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Checkbox id="isActive" name="isActive" defaultChecked />
              <Label htmlFor="isActive" className="cursor-pointer">
                Active in shop
              </Label>
            </div>
          </div>

          {state.message && (
            <div
              className={`rounded-2xl border px-4 py-3 text-sm ${
                state.success
                  ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
                  : "border-red-400/20 bg-red-400/10 text-red-200"
              }`}
            >
              {state.message}
            </div>
          )}

          <Button
            type="submit"
            disabled={pending}
            className="w-full rounded-xl bg-[linear-gradient(90deg,#7468ff_0%,#6fd7ff_50%,#7468ff_100%)] text-[#2f2f2f]"
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
