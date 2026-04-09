import { ArrowLeft, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../lib/axios";
import MethodCard from "../../components/canteen/MethodCard";

const mapOrderToPaymentOrder = (order) => ({
  _id: order._id,
  tokenRef: order.tokenRef || `TOKEN-${order.tokenNumber}`,
  totalAmount: Number(order.totalAmount || 0),
  customerName: order.customerName || "",
  customerEmail: order.customerEmail || "",
  source: "order-management",
  items: (order.items || []).map((item) => ({
    name: item.name,
    qty: Number(item.qty || item.quantity || 1),
    price: Number(item.price || 0),
  })),
});

function PayForToken() {
  const { orderId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState(null);
  const [selectedMethod, setSelectedMethod] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const sessionKey = `canteen-order-${orderId}`;

    const resolveOrder = async () => {
      try {
        const orderFromState = location.state?.orderData || null;
        const orderFromStorage = sessionStorage.getItem(sessionKey);
        const storedOrder = orderFromStorage ? JSON.parse(orderFromStorage) : null;
        const resolvedOrder = orderFromState || storedOrder;

        if (resolvedOrder?.items?.length) {
          sessionStorage.setItem(sessionKey, JSON.stringify(resolvedOrder));
          setOrder(resolvedOrder);
          return;
        }

        const response = await axiosInstance.get(`/api/orders/${orderId}`);
        const backendOrder = mapOrderToPaymentOrder(response.data);
        sessionStorage.setItem(sessionKey, JSON.stringify(backendOrder));
        setOrder(backendOrder);
      } catch (requestError) {
        setError(requestError.response?.data?.error || "Failed to load real order details.");
      } finally {
        setLoading(false);
      }
    };

    resolveOrder();
  }, [location.state, orderId]);

  const handlePaymentStart = async () => {
    if (!selectedMethod) {
      setError("Please select a payment method.");
      return;
    }

    try {
      setSubmitting(true);
      setError("");

      const response = await axiosInstance.post("/api/payments/start", {
        orderId,
        method: selectedMethod,
        orderData: order,
      });

      const { paymentId } = response.data.payment;

      if (selectedMethod === "ONLINE_SIM") navigate(`/canteen/pay/online/${paymentId}`);
      if (selectedMethod === "QR_SIM") navigate(`/canteen/pay/qr/${paymentId}`);
      if (selectedMethod === "BANK_SLIP_SIM") navigate(`/canteen/pay/slip/${paymentId}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Failed to start payment.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="canteen-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent-teal" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="canteen-shell min-h-screen px-6 py-10">
        <div className="mx-auto max-w-2xl rounded-[2rem] border border-red-200 bg-white p-8 shadow-xl">
          <h1 className="text-2xl font-black text-slate-900">Order not available</h1>
          <p className="mt-3 text-slate-600">
            {error || "This payment page needs a real order before a payment can start."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="canteen-shell min-h-screen px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 text-slate-600 transition-colors hover:text-slate-900"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
            <h1 className="text-3xl font-black text-slate-900">Pay for your order</h1>
            <div className="mt-6 rounded-3xl bg-slate-900 p-6 text-white">
              <p className="text-sm uppercase tracking-[0.2em] text-accent-green">Token Reference</p>
              <p className="mt-2 font-mono text-4xl font-black">{order.tokenRef}</p>
              {order.customerName ? (
                <p className="mt-4 text-sm text-slate-300">Order for {order.customerName}</p>
              ) : null}
            </div>

            <div className="mt-6 space-y-3">
              {order.items.map((item) => (
                <div
                  key={item.name}
                  className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3"
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

            <div className="mt-6 flex items-center justify-between border-t-2 border-accent-green pt-4">
              <span className="text-xl font-bold text-slate-900">Total</span>
              <span className="text-3xl font-black text-accent-teal">
                Rs {order.totalAmount.toFixed(2)}
              </span>
            </div>
          </section>

          <section className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-xl">
            <h2 className="text-2xl font-black text-slate-900">Choose payment method</h2>
            <div className="mt-6 space-y-4">
              <MethodCard
                method="ONLINE_SIM"
                selected={selectedMethod === "ONLINE_SIM"}
                onClick={() => setSelectedMethod("ONLINE_SIM")}
              />
              <MethodCard
                method="QR_SIM"
                selected={selectedMethod === "QR_SIM"}
                onClick={() => setSelectedMethod("QR_SIM")}
              />
              <MethodCard
                method="BANK_SLIP_SIM"
                selected={selectedMethod === "BANK_SLIP_SIM"}
                onClick={() => setSelectedMethod("BANK_SLIP_SIM")}
              />
            </div>

            {error && (
              <div className="mt-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <button
              type="button"
              onClick={handlePaymentStart}
              disabled={!selectedMethod || submitting}
              className="mt-6 flex w-full items-center justify-center gap-2 rounded-2xl bg-accent-teal px-6 py-4 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300 hover:enabled:bg-[#c86435]"
            >
              {submitting ? <Loader2 className="animate-spin" size={18} /> : null}
              {submitting ? "Processing..." : "Continue to Payment"}
            </button>
          </section>
        </div>
      </div>
    </div>
  );
}

export default PayForToken;
