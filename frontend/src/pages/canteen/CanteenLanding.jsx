import { CreditCard, QrCode, Receipt, Shield } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../store/user";

function CanteenLanding() {
  const { user } = useAuthStore();

  return (
    <div className="canteen-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <section className="rounded-[2.5rem] border border-[#d8c19e] bg-[#fff7eb]/95 px-8 py-12 shadow-[0_30px_80px_rgba(142,101,57,0.18)] md:px-12">
          <p className="text-sm font-black uppercase tracking-[0.35em] text-accent-teal">
            Smart Canteen Checkout
          </p>
          <h1 className="mt-4 max-w-3xl text-5xl font-black leading-tight text-slate-900 md:text-6xl">
            Pay for pre-orders without leaving the main app.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-slate-600">
            The canteen payment flow from your `canteen` project is now merged into the root
            frontend and backend. Start with a demo order or review existing payments.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link
              to="/canteen/pay/demo-order-001"
              className="rounded-2xl bg-accent-teal px-7 py-4 font-semibold text-white transition-colors hover:bg-[#c86435]"
            >
              Start Demo Payment
            </Link>
            <Link
              to="/canteen/my-payments"
              className="rounded-2xl border border-slate-300 bg-white px-7 py-4 font-semibold text-slate-900 transition-colors hover:border-accent-teal hover:text-accent-teal"
            >
              My Payments
            </Link>
            {user?.role === "admin" && (
              <Link
                to="/canteen/admin/payments"
                className="rounded-2xl border border-accent-green/50 bg-accent-green/25 px-7 py-4 font-semibold text-slate-900 transition-colors hover:bg-accent-green/40"
              >
                Admin Verification
              </Link>
            )}
          </div>
        </section>

        <section className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {[
            {
              icon: CreditCard,
              title: "Online Payment",
              desc: "Simulated card checkout with step-by-step validation.",
            },
            {
              icon: QrCode,
              title: "QR Upload",
              desc: "Students can scan a QR and upload proof for review.",
            },
            {
              icon: Receipt,
              title: "Receipts",
              desc: "Approved payments generate printable receipts and tokens.",
            },
            {
              icon: Shield,
              title: "Admin Review",
              desc: "Admins can approve or reject uploaded payment proofs.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-[2rem] border border-slate-200 bg-white/85 p-6 shadow-lg backdrop-blur"
            >
              <div className="mb-4 inline-flex rounded-2xl bg-slate-900 p-4 text-accent-green">
                <Icon size={26} />
              </div>
              <h2 className="text-xl font-bold text-slate-900">{title}</h2>
              <p className="mt-2 text-slate-600">{desc}</p>
            </div>
          ))}
        </section>
      </div>
    </div>
  );
}

export default CanteenLanding;
