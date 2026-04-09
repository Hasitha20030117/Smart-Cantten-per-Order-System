import { Eye, Loader2, RefreshCw, Receipt } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StatusPill from "../../components/canteen/StatusPill";
import axiosInstance from "../../lib/axios";

function MyPayments() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payments, setPayments] = useState([]);
  const [error, setError] = useState("");

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get("/api/payments");
      setPayments(response.data.payments || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to fetch payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  if (loading) {
    return (
      <div className="canteen-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent-teal" />
      </div>
    );
  }

  return (
    <div className="canteen-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">My Payments</h1>
            <p className="mt-2 text-slate-600">Track the payments created from the merged canteen flow.</p>
          </div>
          <button
            type="button"
            onClick={fetchPayments}
            className="flex items-center gap-2 rounded-2xl border border-slate-300 bg-white px-5 py-3 font-semibold text-slate-700 transition-colors hover:border-slate-400"
          >
            <RefreshCw size={18} />
            Refresh
          </button>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-slate-50">
                <tr>
                  {["Token", "Order", "Method", "Amount", "Status", "Created", "Action"].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-sm font-bold uppercase tracking-[0.15em] text-slate-500"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {payments.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-16 text-center">
                      <Receipt className="mx-auto h-16 w-16 text-slate-300" />
                      <p className="mt-4 text-lg font-semibold text-slate-700">No payments found</p>
                      <p className="mt-2 text-slate-500">Create one from the canteen payment page.</p>
                    </td>
                  </tr>
                ) : (
                  payments.map((payment) => (
                    <tr key={payment.paymentId} className="border-t border-slate-100">
                      <td className="px-6 py-4 font-mono text-slate-900">{payment.tokenRef}</td>
                      <td className="px-6 py-4 text-slate-600">
                        <p className="font-semibold text-slate-900">
                          {payment.order?.customerName || "Canteen order"}
                        </p>
                        <p className="text-sm text-slate-500">
                          {payment.order?.items?.length || 0} item
                          {payment.order?.items?.length === 1 ? "" : "s"}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-slate-600">{payment.method?.replaceAll("_", " ")}</td>
                      <td className="px-6 py-4 font-semibold text-slate-900">
                        Rs {payment.amount?.toFixed(2)}
                      </td>
                      <td className="px-6 py-4">
                        <StatusPill status={payment.status} />
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {new Date(payment.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() => navigate(`/canteen/receipt/${payment.paymentId}`)}
                          className="inline-flex items-center gap-2 rounded-xl bg-accent-teal/10 px-4 py-2 font-semibold text-accent-teal transition-colors hover:bg-accent-teal/20"
                        >
                          <Eye size={16} />
                          View
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MyPayments;
