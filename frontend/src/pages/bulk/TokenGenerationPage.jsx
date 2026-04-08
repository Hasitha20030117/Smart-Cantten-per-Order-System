import { ArrowLeft, Calendar, CreditCard, Download, Loader2, Utensils, Users } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

function TokenGenerationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [tokens, setTokens] = useState([]);
  const [loading, setLoading] = useState(true);
  const eventDetails = location.state?.eventDetails || null;
  const autoStartedPaymentRef = useRef(false);

  useEffect(() => {
    const createOrders = async () => {
      const members = location.state?.members || [];
      if (members.length === 0) {
        setTokens([]);
        setLoading(false);
        return;
      }

      try {
        const results = await Promise.all(
          members.map(async (member) => {
            const selectedMeal = member.selectedMeal;
            const response = await axios.post("/api/orders", {
              customerName: member.name,
              canteen: "Main Canteen",
              timeSlot: "12:00 - 12:30",
              items: [
                {
                  name: selectedMeal?.name || "Meal",
                  quantity: 1,
                  price: Number(selectedMeal?.price || 0),
                },
              ],
              totalAmount: Number(selectedMeal?.price || 0),
            });

            return {
              id: `ORD-${response.data.tokenNumber}`,
              orderId: response.data.order._id,
              tokenNumber: response.data.tokenNumber,
              name: member.name,
              email: member.email,
              mealSelection: selectedMeal,
              paymentStatus: "pending",
              backendOrder: response.data.order,
            };
          })
        );

        setTokens(results);
      } catch (error) {
        console.error("Token generation error:", error);
        toast.error("Failed to generate real order tokens.");
      } finally {
        setLoading(false);
      }
    };

    createOrders();
  }, [location.state]);

  const totalDue = tokens.reduce(
    (sum, token) => sum + Number(token.mealSelection?.price || 0),
    0
  );

  const handleSinglePayment = (token) => {
    navigate(`/canteen/pay/${token.orderId}`, {
      state: {
        orderData: {
          _id: token.orderId,
          tokenRef: `TOKEN-${token.tokenNumber}`,
          totalAmount: Number(token.backendOrder?.totalAmount || token.mealSelection?.price || 0),
          items: (token.backendOrder?.items || []).map((item) => ({
            name: item.name,
            qty: item.quantity,
            price: item.price,
          })),
          customerName: token.name,
          customerEmail: token.email,
          source: "bulk-single",
        },
      },
    });
  };

  const handlePayAll = () => {
    if (tokens.length === 0) return;

    navigate(`/canteen/pay/bulk-${Date.now()}`, {
      state: {
        orderData: {
          _id: `bulk-group-${Date.now()}`,
          tokenRef: `GROUP-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
          totalAmount: totalDue,
          items: tokens.map((token) => ({
            name: `${token.name} - ${token.mealSelection?.name || "Meal"}`,
            qty: 1,
            price: Number(token.mealSelection?.price || 0),
          })),
          source: "bulk-group",
          eventName: eventDetails?.name || "Bulk Event",
        },
      },
    });
  };

  useEffect(() => {
    if (
      loading ||
      autoStartedPaymentRef.current ||
      !location.state?.autoStartPayment ||
      tokens.length === 0
    ) {
      return;
    }

    autoStartedPaymentRef.current = true;
    handlePayAll();
  }, [loading, tokens, location.state]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-orange-50/40">
        <Loader2 className="h-12 w-12 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-orange-50/40 px-4 py-8">
      <div className="mx-auto max-w-7xl">
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="mb-4 inline-flex items-center gap-2 text-slate-600 hover:text-orange-600"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="overflow-hidden rounded-[2rem] border border-orange-100 bg-white shadow-xl">
          <div className="bg-gradient-to-r from-orange-500 to-amber-600 px-6 py-6 text-white">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl font-black">Individual Tokens</h1>
                <p className="mt-2 text-orange-100">Unique tokens generated for each group member</p>
              </div>
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="rounded-xl bg-white/20 px-4 py-2 font-semibold"
                >
                  <Download className="mr-2 inline" size={18} />
                  Print
                </button>
                <button
                  type="button"
                  onClick={handlePayAll}
                  className="rounded-xl bg-white px-4 py-2 font-semibold text-orange-700"
                >
                  <CreditCard className="mr-2 inline" size={18} />
                  Pay All
                </button>
              </div>
            </div>
          </div>

          <div className="border-b border-orange-100 bg-orange-50 px-6 py-4">
            <div className="flex flex-wrap items-center gap-6 text-slate-700">
              <span className="inline-flex items-center gap-2">
                <Calendar size={18} className="text-orange-600" />
                {eventDetails?.name || "Bulk Event"}
              </span>
              <span className="inline-flex items-center gap-2">
                <Users size={18} className="text-orange-600" />
                {tokens.length} members
              </span>
              <span className="inline-flex items-center gap-2 font-bold text-orange-700">
                <CreditCard size={18} />
                Rs {totalDue.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead className="bg-orange-50/50">
                <tr>
                  {["Member", "Meal", "Token", "Payment", "Action"].map((heading) => (
                    <th
                      key={heading}
                      className="px-6 py-4 text-left text-xs font-bold uppercase tracking-[0.15em] text-orange-800"
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-orange-50">
                {tokens.map((token) => (
                  <tr key={token.id}>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-900">{token.name}</p>
                      <p className="text-sm text-slate-500">{token.email}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="inline-flex items-center gap-2 text-slate-700">
                        <Utensils size={16} className="text-orange-500" />
                        {token.mealSelection?.name || "Not selected"}
                      </p>
                      <p className="mt-1 font-semibold text-orange-600">
                        Rs {Number(token.mealSelection?.price || 0).toFixed(2)}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <code className="rounded-lg border border-orange-200 bg-orange-50 px-3 py-1 font-mono text-sm text-orange-700">
                        #{token.tokenNumber}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
                        Pending
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() => handleSinglePayment(token)}
                        className="rounded-xl bg-orange-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-600"
                      >
                        Pay Now
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default TokenGenerationPage;
