import { Check, Sparkles, Trash2 } from "lucide-react";
import { deleteCoinPlan } from "@/actions/plan.action";

type PlanFeature = {
  id: string;
  label: string;
  order: number;
  planId: string;
};

type CoinPlan = {
  id: string;
  name: string;
  slug: string;
  coins: number;
  bonusCoins: number;
  priceAmount: number;
  isPopular: boolean;
  isActive: boolean;
  features: PlanFeature[];
};

type Props = {
  plans: CoinPlan[];
};

function formatPHP(priceAmount: number) {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: "PHP",
  }).format(priceAmount / 100);
}

export default function CoinPlanListSection({ plans }: Props) {
  return (
    <section className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Created Plans</h2>
        <p className="text-sm text-white/60">
          Edit, disable, or delete your coin plans.
        </p>
      </div>

      {plans.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/10 bg-white/5 p-6 text-sm text-white/60 backdrop-blur-xl">
          No plans created yet.
        </div>
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {plans.map((plan) => {
            const orderedFeatures = [...plan.features].sort(
              (a, b) => a.order - b.order,
            );

            return (
              <div
                key={plan.id}
                className={`relative rounded-3xl border p-5 text-white shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 ${
                  plan.isPopular
                    ? "border-teal-300/30 bg-gradient-to-br from-teal-400/10 via-white/5 to-cyan-400/10"
                    : "border-white/10 bg-white/5"
                }`}
              >
                <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-xl font-semibold sm:text-2xl">
                        {plan.name}
                      </h3>

                      {plan.isPopular && (
                        <span className="inline-flex items-center gap-1 rounded-full border border-teal-300/20 bg-teal-300/10 px-3 py-1 text-xs font-medium text-teal-200">
                          <Sparkles className="h-3.5 w-3.5" />
                          Most Popular
                        </span>
                      )}

                      {plan.isActive ? (
                        <span className="rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-xs font-medium text-emerald-200">
                          Active
                        </span>
                      ) : (
                        <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-medium text-white/70">
                          Inactive
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-white/50">slug: {plan.slug}</p>

                    <div className="flex flex-wrap items-end gap-2">
                      <span className="text-3xl font-bold tracking-tight">
                        {plan.coins}
                      </span>
                      <span className="pb-1 text-base text-white/70">
                        + {plan.bonusCoins} bonus
                      </span>
                    </div>

                    <p className="text-sm font-medium text-teal-200">
                      {formatPHP(plan.priceAmount)}
                    </p>
                  </div>

                  <form action={deleteCoinPlan}>
                    <input type="hidden" name="id" value={plan.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center gap-2 rounded-xl border border-red-400/20 bg-red-500/10 px-4 py-2 text-sm font-medium text-red-200 transition hover:bg-red-500/20"
                    >
                      <Trash2 className="h-4 w-4" />
                      Delete
                    </button>
                  </form>
                </div>

                <div className="mb-5 h-px w-full bg-white/10" />

                <div className="space-y-3">
                  <p className="text-sm font-medium uppercase tracking-[0.18em] text-white/45">
                    Current Features
                  </p>

                  {orderedFeatures.length > 0 ? (
                    <ul className="space-y-3">
                      {orderedFeatures.map((feature) => (
                        <li
                          key={feature.id}
                          className="flex items-start gap-3 text-sm text-white/85 sm:text-base"
                        >
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-teal-300" />
                          <span>{feature.label}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-white/50">No features added.</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
