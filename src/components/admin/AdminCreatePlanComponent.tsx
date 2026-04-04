"use client";

import { ChevronDown } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
// import your existing form internals here

export default function AdminCreatePlanComponent() {
  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="create-plan"
      className="w-full"
    >
      <AccordionItem
        value="create-plan"
        className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 px-0 backdrop-blur-sm"
      >
        <AccordionTrigger className="px-5 py-4 text-left text-white hover:no-underline">
          <div className="flex w-full items-center justify-between pr-2">
            <div>
              <h3 className="text-lg font-semibold text-white">
                Create New Plan
              </h3>
              <p className="text-sm text-zinc-400">
                Add a new coin plan for your users
              </p>
            </div>
          </div>
        </AccordionTrigger>

        <AccordionContent className="border-t border-white/10 px-5 py-5">
          <form className="space-y-4">
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Plan Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="Starter Pack"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/40"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-200">
                Slug
              </label>
              <input
                name="slug"
                type="text"
                placeholder="starter-pack"
                className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/40"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Coins
                </label>
                <input
                  name="coins"
                  type="number"
                  placeholder="20"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Bonus Coins
                </label>
                <input
                  name="bonusCoins"
                  type="number"
                  placeholder="2"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/40"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm font-medium text-zinc-200">
                  Price (centavos)
                </label>
                <input
                  name="priceAmount"
                  type="number"
                  placeholder="19900"
                  className="w-full rounded-xl border border-white/10 bg-white/10 px-4 py-3 text-white placeholder:text-zinc-500 outline-none transition focus:border-teal-400/40"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input type="checkbox" name="isPopular" className="h-4 w-4" />
                Popular
              </label>

              <label className="flex items-center gap-2 text-sm text-zinc-300">
                <input
                  type="checkbox"
                  name="isActive"
                  defaultChecked
                  className="h-4 w-4"
                />
                Active
              </label>
            </div>

            <button
              type="submit"
              className="w-full rounded-xl bg-[linear-gradient(90deg,#7468ff_0%,#6fd7ff_50%,#7468ff_100%)] px-4 py-3 text-sm font-semibold text-[#2f2f2f] shadow-md"
            >
              Create Plan
            </button>
          </form>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
