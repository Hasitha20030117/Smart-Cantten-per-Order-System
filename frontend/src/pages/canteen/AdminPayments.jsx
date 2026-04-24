import { CheckCircle, Eye, Loader2, RefreshCw, XCircle } from "lucide-react";
import { useEffect, useState } from "react";
import StatusPill from "../../components/canteen/StatusPill";
import axiosInstance, { API_BASE_URL } from "../../lib/axios";

function AdminPayments() {
  const [payments, setPayments] = useState([]);
  const [selectedStatus, setSelectedStatus] = useState("UNDER_REVIEW");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [actionModal, setActionModal] = useState(null);
  const [adminNote, setAdminNote] = useState("");
  const [actionLoading, setActionLoading] = useState(false);

  const statusTabs = [
    { value: "UNDER_REVIEW", label: "Under Review" },
    { value: "PENDING", label: "Pending" },
    { value: "PAID", label: "Paid" },
    { value: "REJECTED", label: "Rejected" },
  ];

  const fetchPayments = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get(`/api/admin/payments?status=${selectedStatus}`);
      setPayments(response.data.payments || []);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to fetch admin payments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, [selectedStatus]);

  const handleAction = async (action) => {
    if (!actionModal) return;
    if (action === "reject" && !adminNote.trim()) {
      setError("Please provide a reason before rejecting a payment.");
      return;
    }

    try {
      setActionLoading(true);
      await axiosInstance.patch(`/api/admin/payments/${actionModal.paymentId}/${action}`, {
        adminNote: adminNote || undefined,
      });
      setActionModal(null);
      setAdminNote("");
      await fetchPayments();
    } catch (requestError) {
      setError(requestError.response?.data?.message || `Failed to ${action} payment.`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="canteen-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900">Payment Verification</h1>
            <p className="mt-2 text-slate-600">Approve or reject canteen proof uploads.</p>
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

        <div className="mb-6 flex flex-wrap gap-3">
          {statusTabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setSelectedStatus(tab.value)}
              className={`rounded-2xl px-5 py-3 font-semibold transition-colors ${
                selectedStatus === tab.value
                  ? "bg-accent-teal text-white"
                  : "border border-slate-300 bg-white text-slate-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-12 w-12 animate-spin text-accent-teal" />
          </div>
        ) : payments.length === 0 ? (
          <div className="rounded-[2rem] border border-slate-200 bg-white p-12 text-center shadow-xl">
            <CheckCircle className="mx-auto h-16 w-16 text-slate-300" />
            <p className="mt-4 text-lg font-semibold text-slate-700">No payments in this status</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {payments.map((payment) => (
              <div
                key={payment.paymentId}
                className="rounded-[2rem] border border-slate-200 bg-white p-6 shadow-xl"
              >
                <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
                  <div>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <h2 className="text-2xl font-black text-slate-900">{payment.tokenRef}</h2>
                        <p className="mt-1 text-slate-600">
                          {payment.studentName} • {payment.studentEmail}
                        </p>
                      </div>
                      <StatusPill status={payment.status} />
                    </div>

                    <div className="mt-5 grid gap-4 sm:grid-cols-2">
                      <Info label="Amount" value={`Rs ${payment.amount?.toFixed(2)}`} />
                      <Info label="Method" value={payment.method?.replaceAll("_", " ")} />
                      <Info label="Created" value={new Date(payment.createdAt).toLocaleString()} />
                      <Info label="Payment ID" value={payment.paymentId} mono />
                    </div>

                    {payment.orderSummary?.items?.length ? (
                      <div className="mt-5 rounded-2xl bg-slate-50 p-4">
                        <p className="font-semibold text-slate-900">Order Items</p>
                        <div className="mt-3 space-y-2">
                          {payment.orderSummary.items.map((item, index) => (
                            <div key={`${item.name}-${index}`} className="flex justify-between text-sm">
                              <span className="text-slate-700">
                                {item.name} x{item.qty}
                              </span>
                              <span className="text-slate-500">
                                Rs {(item.price * item.qty).toFixed(2)}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {payment.adminNote ? (
                      <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
                        {payment.adminNote}
                      </div>
                    ) : null}

                    {(payment.status === "UNDER_REVIEW" || payment.status === "PENDING") && (
                      <div className="mt-6 flex gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setActionModal(payment);
                            setAdminNote("");
                          }}
                          className="flex-1 rounded-2xl bg-accent-teal px-5 py-3 font-semibold text-white transition-colors hover:bg-[#c86435]"
                        >
                          Review Payment
                        </button>
                      </div>
                    )}
                  </div>

                  <div>
                    {payment.proofUrl ? (
                      (() => {
                        const proofUrl = payment.proofUrl.startsWith("http")
                          ? payment.proofUrl
                          : `${API_BASE_URL}${payment.proofUrl}`;
                        return (
                          <div className="rounded-3xl border border-slate-200 bg-slate-50 p-3">
                            <img src={proofUrl} alt="Payment proof" className="w-full rounded-2xl" />
                            <button
                              type="button"
                              onClick={() => window.open(proofUrl, "_blank")}
                              className="mt-3 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700 transition-colors hover:border-slate-400"
                            >
                              <Eye size={18} />
                              View Full Proof
                            </button>
                          </div>
                        );
                      })()
                    ) : (
                      <div className="flex h-full min-h-[220px] items-center justify-center rounded-3xl border border-dashed border-slate-300 bg-slate-50 text-center text-slate-500">
                        No proof uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {actionModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-6">
            <div className="w-full max-w-lg rounded-[2rem] bg-white p-6 shadow-2xl">
              <h2 className="text-2xl font-black text-slate-900">Review {actionModal.tokenRef}</h2>
              <p className="mt-2 text-slate-600">Add an optional note for approval or a required reason for rejection.</p>
              <textarea
                value={adminNote}
                onChange={(event) => setAdminNote(event.target.value)}
                rows="5"
                className="mt-5 w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none transition-colors focus:border-accent-teal"
                placeholder="Admin note"
              />
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={() => setActionModal(null)}
                  className="flex-1 rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("reject")}
                  disabled={actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-red-500 px-5 py-3 font-semibold text-white disabled:opacity-70"
                >
                  <XCircle size={18} />
                  Reject
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("approve")}
                  disabled={actionLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-teal px-5 py-3 font-semibold text-white disabled:opacity-70"
                >
                  {actionLoading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                  Approve
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Info({ label, value, mono = false }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-sm font-semibold uppercase tracking-[0.15em] text-slate-500">{label}</p>
      <p className={`mt-2 text-slate-900 ${mono ? "font-mono text-sm" : "font-semibold"}`}>{value}</p>
    </div>
  );
}

export default AdminPayments;
