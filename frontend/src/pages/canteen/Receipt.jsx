import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ReceiptCard from "../../components/canteen/ReceiptCard";
import axiosInstance from "../../lib/axios";

function Receipt() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [receipt, setReceipt] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchReceipt = async () => {
      try {
        const response = await axiosInstance.get(`/api/receipts/${paymentId}`);
        setReceipt(response.data.receipt);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to fetch receipt.");
      } finally {
        setLoading(false);
      }
    };

    fetchReceipt();
  }, [paymentId]);

  if (loading) {
    return (
      <div className="canteen-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent-teal" />
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="canteen-shell min-h-screen px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-slate-200 bg-white p-8 text-center shadow-xl">
          <p className="text-xl font-semibold text-red-600">{error || "Receipt not found."}</p>
          <button
            type="button"
            onClick={() => navigate("/canteen/my-payments")}
            className="mt-6 rounded-2xl bg-accent-teal px-6 py-3 font-semibold text-white transition-colors hover:bg-[#c86435]"
          >
            Go to My Payments
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="canteen-shell min-h-screen px-6 py-10">
      <button
        type="button"
        onClick={() => navigate("/canteen/my-payments")}
        className="no-print mx-auto mb-6 flex max-w-3xl items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
      >
        <ArrowLeft size={18} />
        Back to My Payments
      </button>
      <ReceiptCard receipt={receipt} />
    </div>
  );
}

export default Receipt;
