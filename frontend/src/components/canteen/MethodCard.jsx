import { Check, CreditCard, FileText, QrCode } from "lucide-react";

const methodConfig = {
  ONLINE_SIM: {
    title: "Online Payment",
    description: "Instant simulated card payment",
    icon: CreditCard,
    gradient: "from-accent-green to-accent-teal",
  },
  QR_SIM: {
    title: "QR Payment",
    description: "Scan and upload payment proof",
    icon: QrCode,
    gradient: "from-accent-teal to-[#b4532d]",
  },
  BANK_SLIP_SIM: {
    title: "Bank Slip",
    description: "Upload transfer confirmation",
    icon: FileText,
    gradient: "from-[#ad6a42] to-[#6b3a2a]",
  },
};

function MethodCard({ method, selected, onClick }) {
  const config = methodConfig[method];
  const Icon = config.icon;

  return (
    <button
      type="button"
      onClick={onClick}
      className={`relative w-full rounded-3xl border-2 p-6 text-left transition-all ${
        selected
          ? "border-accent-green bg-white shadow-xl"
          : "border-slate-200 bg-white/80 hover:border-accent-teal/40 hover:shadow-lg"
      }`}
    >
      <div className="flex items-center gap-4">
        <div className={`rounded-2xl bg-gradient-to-br p-4 text-white ${config.gradient}`}>
          <Icon size={28} />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">{config.title}</h3>
          <p className="text-sm text-slate-500">{config.description}</p>
        </div>
      </div>
      {selected && (
        <span className="absolute right-4 top-4 flex h-7 w-7 items-center justify-center rounded-full bg-accent-green text-slate-900">
          <Check size={16} />
        </span>
      )}
    </button>
  );
}

export default MethodCard;
