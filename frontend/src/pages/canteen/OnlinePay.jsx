import {
  ArrowLeft,
  CreditCard,
  Loader2,
  Lock,
  Mail,
  MapPin,
  Phone,
  User,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "../../lib/axios";

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phonePattern = /^[+\d\s-]{7,20}$/;

function OnlinePay() {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [formData, setFormData] = useState({
    cardHolder: "",
    cardNumber: "",
    expiry: "",
    cvv: "",
    address: "",
    city: "",
    postalCode: "",
    email: "",
    phone: "",
  });

  useEffect(() => {
    const fetchPayment = async () => {
      try {
        const response = await axiosInstance.get(`/api/payments/${paymentId}`);
        setPayment(response.data.payment);
      } catch (requestError) {
        setError(requestError.response?.data?.message || "Failed to fetch payment details.");
      } finally {
        setLoading(false);
      }
    };

    fetchPayment();
  }, [paymentId]);

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    let formattedValue = value;

    if (name === "cardNumber") {
      formattedValue = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim().slice(0, 19);
    }

    if (name === "expiry") {
      formattedValue = value.replace(/\D/g, "");
      if (formattedValue.length >= 2) {
        formattedValue = `${formattedValue.slice(0, 2)}/${formattedValue.slice(2, 4)}`;
      }
      formattedValue = formattedValue.slice(0, 5);
    }

    if (name === "cvv") {
      formattedValue = value.replace(/\D/g, "").slice(0, 3);
    }

    if (name === "postalCode") {
      formattedValue = value.replace(/\D/g, "").slice(0, 6);
    }

    if (name === "phone") {
      formattedValue = value.replace(/[^\d+\s-]/g, "").slice(0, 20);
    }

    setFormData((current) => ({ ...current, [name]: formattedValue }));
    setFieldErrors((current) => {
      if (!current[name]) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });
  };

  const validateStepOne = () => {
    const nextErrors = {};
    const digitsOnlyCardNumber = formData.cardNumber.replace(/\D/g, "");

    if (!formData.cardHolder.trim()) nextErrors.cardHolder = "Cardholder name is required.";
    if (digitsOnlyCardNumber.length !== 16) nextErrors.cardNumber = "Card number must contain 16 digits.";
    if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) nextErrors.expiry = "Use MM/YY format.";
    if (!/^\d{3}$/.test(formData.cvv)) nextErrors.cvv = "CVV must be 3 digits.";
    return nextErrors;
  };

  const validateStepTwo = () => {
    const nextErrors = {};
    if (!emailPattern.test(formData.email.trim())) nextErrors.email = "Enter a valid email address.";
    if (!phonePattern.test(formData.phone.trim())) nextErrors.phone = "Enter a valid phone number.";
    if (formData.address.trim().length < 8) nextErrors.address = "Enter a complete address.";
    if (!formData.city.trim()) nextErrors.city = "City is required.";
    if (!/^\d{4,6}$/.test(formData.postalCode.trim())) nextErrors.postalCode = "Postal code must be 4 to 6 digits.";
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const nextErrors = step === 1 ? validateStepOne() : validateStepTwo();
    if (Object.keys(nextErrors).length > 0) {
      setFieldErrors(nextErrors);
      setError("Please fix the highlighted fields.");
      return;
    }

    if (step === 1) {
      setFieldErrors({});
      setStep(2);
      return;
    }

    try {
      setProcessing(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      await axiosInstance.post("/api/payments/confirm-online", { paymentId });
      navigate(`/canteen/receipt/${paymentId}`);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Payment failed. Please try again.");
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="canteen-shell flex min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-accent-teal" />
      </div>
    );
  }

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
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-accent-green to-accent-teal text-white">
              <CreditCard size={28} />
            </div>
            <h1 className="mt-4 text-3xl font-black text-slate-900">Online Payment</h1>
            <p className="mt-2 text-slate-500">Token {payment?.tokenRef}</p>
            <p className="mt-3 text-4xl font-black text-accent-teal">Rs {payment?.amount?.toFixed(2)}</p>
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

          <form onSubmit={handleSubmit} className="space-y-5">
            {step === 1 ? (
              <>
                <Field icon={User} label="Cardholder Name" name="cardHolder" value={formData.cardHolder} onChange={handleInputChange} error={fieldErrors.cardHolder} />
                <Field icon={CreditCard} label="Card Number" name="cardNumber" value={formData.cardNumber} onChange={handleInputChange} error={fieldErrors.cardNumber} inputMode="numeric" />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Expiry" name="expiry" value={formData.expiry} onChange={handleInputChange} error={fieldErrors.expiry} inputMode="numeric" />
                  <Field label="CVV" name="cvv" value={formData.cvv} onChange={handleInputChange} error={fieldErrors.cvv} inputMode="numeric" />
                </div>
              </>
            ) : (
              <>
                <Field icon={Mail} label="Email" name="email" value={formData.email} onChange={handleInputChange} error={fieldErrors.email} />
                <Field icon={Phone} label="Phone" name="phone" value={formData.phone} onChange={handleInputChange} error={fieldErrors.phone} />
                <Field icon={MapPin} label="Address" name="address" value={formData.address} onChange={handleInputChange} error={fieldErrors.address} />
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="City" name="city" value={formData.city} onChange={handleInputChange} error={fieldErrors.city} />
                  <Field label="Postal Code" name="postalCode" value={formData.postalCode} onChange={handleInputChange} error={fieldErrors.postalCode} inputMode="numeric" />
                </div>
              </>
            )}

            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {error}
              </div>
            )}

            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Lock size={16} />
              Secure simulated payment flow
            </div>

            <div className="flex gap-4">
              {step === 2 && (
                <button
                  type="button"
                  onClick={() => {
                    setStep(1);
                    setFieldErrors({});
                    setError("");
                  }}
                  className="flex-1 rounded-2xl border border-slate-300 px-6 py-4 font-semibold text-slate-700 transition-colors hover:border-slate-400"
                >
                  Back
                </button>
              )}
              <button
                type="submit"
                disabled={processing}
                className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-accent-teal px-6 py-4 font-semibold text-white transition-colors disabled:cursor-not-allowed disabled:bg-slate-300 hover:enabled:bg-[#c86435]"
              >
                {processing ? <Loader2 className="animate-spin" size={18} /> : null}
                {processing ? "Processing..." : step === 1 ? "Continue to Billing" : "Pay Now"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

function Field({ icon: Icon, label, error, ...props }) {
  return (
    <div>
      <label className="mb-2 block text-sm font-semibold text-slate-700">
        {Icon ? <Icon size={16} className="mr-2 inline" /> : null}
        {label}
      </label>
      <input
        {...props}
        className={`w-full rounded-2xl border bg-slate-50 px-4 py-3 text-slate-900 outline-none transition-colors ${
          error ? "border-red-300" : "border-slate-200 focus:border-accent-teal"
        }`}
      />
      {error && <p className="mt-2 text-sm text-red-500">{error}</p>}
    </div>
  );
}

export default OnlinePay;
