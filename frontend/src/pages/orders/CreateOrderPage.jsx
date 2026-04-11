import { useState } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "../../lib/axios";

import { useAuthStore } from "../../store/user";

const CANTEENS = ["Juice Bar", "Basement Canteen", "New Canteen", "Anohana Canteen"];

const emptyItem = { name: "", quantity: 1, price: 0 };

function CreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    customerName: "",
    canteen: "New Canteen",
    timeSlot: "",
    items: [emptyItem],
  });

  const handleMainChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
  };

  const addItem = () => {
    setFormData((current) => ({ ...current, items: [...current.items, emptyItem] }));
  };

  const removeItem = (index) => {
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanedItems = formData.items.map((item) => ({
      name: item.name.trim(),
      quantity: Number(item.quantity),
      price: Number(item.price),
    }));

    const totalAmount = cleanedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    try {
      setLoading(true);
      const response = await axios.post("/api/orders", {
        customerName: formData.customerName.trim(),
        canteen: formData.canteen,
        timeSlot: formData.timeSlot.trim(),
        items: cleanedItems,
        totalAmount,
        ...(user?._id && { userId: user._id }),
      });

      toast.success(`Order placed! Token ${response.data.tokenNumber}`);
      navigate(`/canteen/pay/${response.data.order._id}`, {
        state: {
          orderData: {
            _id: response.data.order._id,
            tokenRef: `TOKEN-${response.data.tokenNumber}`,
            totalAmount,
            customerName: formData.customerName.trim(),
            source: "single-order",
            items: cleanedItems.map((item) => ({
              name: item.name,
              qty: item.quantity,
              price: item.price,
            })),
          },
        },
      });
    } catch (error) {
      console.error("Create order error:", error.response?.data || error);
      toast.error(error.response?.data?.message || error.response?.data?.error || error.message || "Failed to create order. Check canteen/timeSlot.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900">Create Order</h1>
        <p className="mt-2 text-slate-600">Generate a real token number from the merged backend.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          <div className="grid gap-4 md:grid-cols-3">
            <input
              name="customerName"
              value={formData.customerName}
              onChange={handleMainChange}
              placeholder="Customer name"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
              required
            />
            <select
              name="canteen"
              value={formData.canteen}
              onChange={handleMainChange}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
            >
              {CANTEENS.map((canteen) => (
                <option key={canteen} value={canteen}>
                  {canteen}
                </option>
              ))}
            </select>
            <input
              name="timeSlot"
              value={formData.timeSlot}
              onChange={handleMainChange}
              placeholder="10:00 - 10:30"
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
              required
            />
          </div>

          <div className="space-y-4">
            {formData.items.map((item, index) => (
              <div key={index} className="grid gap-3 md:grid-cols-[1fr_140px_140px_auto]">
                <input
                  value={item.name}
                  onChange={(event) => handleItemChange(index, "name", event.target.value)}
                  placeholder="Item name"
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
                  required
                />
                <input
                  type="number"
                  min="1"
                  value={item.quantity}
                  onChange={(event) => handleItemChange(index, "quantity", event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
                  required
                />
                <input
                  type="number"
                  min="0"
                  value={item.price}
                  onChange={(event) => handleItemChange(index, "price", event.target.value)}
                  className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none focus:border-orange-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="rounded-2xl border border-red-200 px-4 py-3 text-red-500"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={addItem}
              className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700"
            >
              Add Item
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white disabled:opacity-60"
            >
              {loading ? "Creating..." : "Create Order"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateOrderPage;
