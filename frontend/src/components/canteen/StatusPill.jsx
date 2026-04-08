import { AlertCircle, CheckCircle, Clock, Hourglass, XCircle } from "lucide-react";

const statusConfig = {
  PAID: {
    color: "bg-accent-green/20 text-[#4f3c17] border-accent-green/40",
    icon: CheckCircle,
    label: "Paid",
  },
  PENDING: {
    color: "bg-accent-teal/15 text-[#c86435] border-accent-teal/30",
    icon: Clock,
    label: "Pending",
  },
  UNDER_REVIEW: {
    color: "bg-accent-warning/20 text-[#9a5f1f] border-accent-warning/30",
    icon: Hourglass,
    label: "Under Review",
  },
  REJECTED: {
    color: "bg-accent-danger/15 text-accent-danger border-accent-danger/30",
    icon: XCircle,
    label: "Rejected",
  },
  EXPIRED: {
    color: "bg-slate-500/15 text-slate-600 border-slate-400/30",
    icon: AlertCircle,
    label: "Expired",
  },
};

function StatusPill({ status }) {
  const config = statusConfig[status] || statusConfig.PENDING;
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${config.color}`}
    >
      <Icon size={16} />
      {config.label}
    </span>
  );
}

export default StatusPill;
