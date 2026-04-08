import { ArrowLeft, CheckCircle, Loader2, QrCode, RefreshCw } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import FileDropzone from "../../components/canteen/FileDropzone";
import StatusPill from "../../components/canteen/StatusPill";
import axiosInstance, { API_BASE_URL } from "../../lib/axios";

function QrPay() {
  return <ProofUploadPage title="QR Payment" icon={QrCode} paymentType="qr" apiBaseUrl={API_BASE_URL} />;
}

export function ProofUploadPage({ title, icon: Icon, paymentType, apiBaseUrl }) {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const fetchPayment = async () => {
    try {
      const response = await axiosInstance.get(`/api/payments/${paymentId}`);
      setPayment(response.data.payment);
      setError("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to fetch payment details.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [paymentId]);

  const handleUploadProof = async () => {
    if (!selectedFile) {
      setError("Please select a file to upload.");
      return;
    }

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append("paymentId", paymentId);
      formData.append("proofFile", selectedFile);
      await axiosInstance.post("/api/payments/upload-proof", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setSelectedFile(null);
      await fetchPayment();
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to upload proof.");
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="canteen-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent-teal" />
      </div>
    );
  }

  const qrData = JSON.stringify({
    paymentId: payment?.paymentId,
    tokenRef: payment?.tokenRef,
    amount: payment?.amount,
    orderId: payment?.orderId,
  });

  return (
    <div className="canteen-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-2xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
          <div className="mb-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-teal to-[#b4532d] text-white">
              <Icon size={28} />
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-900">{title}</h1>
            <p className="mt-2 text-slate-500">Token {payment?.tokenRef}</p>
          </div>

          <div className="mb-6 flex justify-center">
            <StatusPill status={payment?.status} />
          </div>

          <div className="mb-8 rounded-3xl border border-accent-teal/20 bg-accent-teal/10 p-6 text-center">
            <p className="text-sm uppercase tracking-[0.2em] text-slate-600">Amount to Pay</p>
            <p className="mt-2 text-4xl font-black text-accent-teal">Rs {payment?.amount?.toFixed(2)}</p>
          </div>

          {payment?.order && (
            <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Order Summary</p>
                  <p className="mt-2 text-lg font-bold text-slate-900">
                    {payment.order.customerName || "Canteen order"}
                  </p>
                  {payment.order.customerEmail ? (
                    <p className="text-sm text-slate-500">{payment.order.customerEmail}</p>
                  ) : null}
                </div>
                <p className="text-sm font-semibold text-slate-500">
                  {payment.order.items?.length || 0} item{payment.order.items?.length === 1 ? "" : "s"}
                </p>
              </div>

              <div className="mt-4 space-y-3">
                {payment.order.items?.map((item) => (
                  <div
                    key={`${item.name}-${item.qty}`}
                    className="flex items-center justify-between rounded-2xl bg-white px-4 py-3"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">{item.name}</p>
                      <p className="text-sm text-slate-500">Qty {item.qty}</p>
                    </div>
                    <span className="font-semibold text-slate-900">
                      Rs {(item.price * item.qty).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {payment?.status === "PENDING" && (
            <>
              {paymentType === "qr" ? (
                <div className="mb-8 rounded-3xl bg-slate-900 px-6 py-8 text-center">
                  <div className="mx-auto inline-block rounded-2xl bg-white p-5">
                    <QRCodeSVG value={qrData} size={220} />
                  </div>
                  <p className="mt-4 text-sm text-slate-300">
                    Scan this QR in your payment app, then upload the receipt.
                  </p>
                </div>
              ) : (
                <div className="mb-8 rounded-3xl bg-slate-900 p-6 text-white">
                  <h2 className="text-lg font-bold">Bank Transfer Details</h2>
                  <div className="mt-4 space-y-3 text-sm">
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Bank</span>
                      <span>People's Bank</span>
                    </div>
                    <div className="flex justify-between border-b border-white/10 pb-2">
                      <span className="text-slate-300">Account Name</span>
                      <span>University Canteen</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-300">Account Number</span>
                      <span className="font-mono">123-4-567-89012</span>
                    </div>
                  </div>
                </div>
              )}

              <FileDropzone onFileSelect={setSelectedFile} />

              {error && (
                <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleUploadProof}
                disabled={!selectedFile || uploading}
                className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-teal px-6 py-4 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300 hover:enabled:bg-[#c86435]"
              >
                {uploading ? <Loader2 className="animate-spin" size={18} /> : <CheckCircle size={18} />}
                {uploading ? "Uploading..." : "Submit Proof"}
              </button>
            </>
          )}

          {payment?.status === "UNDER_REVIEW" && (
            <>
              <div className="rounded-3xl border border-amber-200 bg-amber-50 p-6 text-center">
                <p className="text-lg font-semibold text-amber-700">Payment is under review</p>
                <p className="mt-2 text-slate-600">An admin needs to verify your uploaded proof.</p>
              </div>
              {payment?.proofUrl && (
                <img
                  src={`${apiBaseUrl}${payment.proofUrl}`}
                  alt="Payment proof"
                  className="mt-6 w-full rounded-3xl border border-slate-200"
                />
              )}
            </>
          )}

          {payment?.status === "PAID" && (
            <div className="rounded-3xl border border-green-200 bg-green-50 p-6 text-center">
              <CheckCircle className="mx-auto h-16 w-16 text-green-600" />
              <p className="mt-4 text-xl font-bold text-green-700">Payment verified</p>
              <button
                type="button"
                onClick={() => navigate(`/canteen/receipt/${paymentId}`)}
                className="mt-5 rounded-2xl bg-accent-teal px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c86435]"
              >
                View Receipt
              </button>
            </div>
          )}

          {payment?.status === "REJECTED" && (
            <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-center">
              <p className="text-xl font-bold text-red-600">Payment rejected</p>
              <p className="mt-2 text-slate-600">{payment.adminNote || "Please try again with a clearer proof."}</p>
            </div>
          )}

          {payment?.status !== "PENDING" && payment?.status !== "PAID" && (
            <button
              type="button"
              onClick={() => {
                setRefreshing(true);
                fetchPayment();
              }}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-300 px-6 py-4 font-semibold text-slate-700 transition-colors hover:border-slate-400"
            >
              <RefreshCw size={18} className={refreshing ? "animate-spin" : ""} />
              Refresh Status
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default QrPay;
