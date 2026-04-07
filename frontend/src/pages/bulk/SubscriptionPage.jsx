import { CheckCircle, Crown, Sparkles } from "lucide-react";
import { useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

function SubscriptionPage() {
  const [loading, setLoading] = useState(false);
  const [activePlan, setActivePlan] = useState("");
  const [form, setForm] = useState({ name: "", email: "" });

  const plans = useMemo(
    () => [
      {
        id: "monthly",
        name: "Monthly",
        price: "Rs 29",
        features: ["Priority prep", "Priority tokens", "30% faster pickup"],
      },
      {
        id: "yearly",
        name: "Yearly",
        price: "Rs 289",
        features: ["All monthly benefits", "15% discount", "Dedicated support"],
      },
    ],
    []
  );

  const handleSubscribe = async (plan) => {
    if (!form.name.trim() || !form.email.trim()) {
      toast.error("Enter your name and email first.");
      return;
    }

    try {
      setLoading(true);
      await axios.post("/api/subscription/subscribe", {
        name: form.name.trim(),
        email: form.email.trim(),
        plan,
      });
      setActivePlan(plan);
      toast.success("Subscription activated!");
    } catch (error) {
      console.error("Subscription error:", error);
      toast.error(error.response?.data?.message || "Failed to activate subscription.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#fff3e0_0%,#ffe0b2_45%,#ffd7a1_100%)] px-4 py-12">
      <div className="mx-auto max-w-5xl">
        <div className="mb-10 text-center">
          <div className="inline-flex rounded-full bg-white/70 p-4 shadow">
            <Crown className="h-8 w-8 text-orange-600" />
          </div>
          <h1 className="mt-4 text-4xl font-black text-slate-900">Subscription Plans</h1>
          <p className="mt-2 text-slate-600">
            Unlock priority preparation for bulk meal events.
          </p>
        </div>

        <div className="mb-8 rounded-[2rem] bg-white/85 p-6 shadow-xl">
          <div className="grid gap-4 md:grid-cols-2">
            <input
              type="text"
              value={form.name}
              onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              placeholder="Your name"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
            />
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              placeholder="Your email"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
            />
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`rounded-[2rem] border p-8 shadow-xl ${
                plan.id === "yearly"
                  ? "border-orange-300 bg-white"
                  : "border-slate-200 bg-white/90"
              }`}
            >
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900">{plan.name}</h2>
                {plan.id === "yearly" ? (
                  <span className="rounded-full bg-orange-500 px-3 py-1 text-xs font-bold text-white">
                    Best Value
                  </span>
                ) : null}
              </div>
              <p className="mt-4 text-4xl font-black text-orange-600">{plan.price}</p>

              <div className="mt-6 space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-3 text-slate-700">
                    <CheckCircle size={18} className="text-green-500" />
                    {feature}
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
                className="mt-8 w-full rounded-2xl bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4 font-semibold text-white disabled:opacity-60"
              >
                {loading ? "Processing..." : activePlan === plan.id ? "Current Plan" : "Subscribe"}
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 rounded-[2rem] bg-white/85 p-6 shadow-xl">
          <div className="flex items-start gap-4">
            <Sparkles className="mt-1 h-6 w-6 text-orange-500" />
            <div>
              <p className="font-bold text-slate-900">Priority preparation means meals are cooked first.</p>
              <p className="mt-2 text-slate-600">
                Subscribed users get faster token readiness and smoother large-group pickup.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SubscriptionPage;
