import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

const VALIDATION_RULES = {
  customerName: {
    minLength: 2,
    maxLength: 50,
  },
  timeSlot: {
    pattern: /^\d{1,2}:\d{2}\s*-\s*\d{1,2}:\d{2}$/,
  },
  itemName: {
    minLength: 1,
    maxLength: 100,
  },
};

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");
  const [editingOrder, setEditingOrder] = useState(null);
  const [editFormData, setEditFormData] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const fetchOrders = async () => {
    try {
      const response = await axios.get("/api/orders");
      setOrders(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Fetch orders error:", error);
      toast.error("Failed to fetch orders.");
      setOrders([]);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const validateEditField = (fieldName, value) => {
    const newErrors = { ...errors };

    switch (fieldName) {
      case "customerName":
        if (!value.trim()) {
          newErrors.customerName = "Customer name is required";
        } else if (value.trim().length < VALIDATION_RULES.customerName.minLength) {
          newErrors.customerName = "Customer name must be at least 2 characters";
        } else if (value.length > VALIDATION_RULES.customerName.maxLength) {
          newErrors.customerName = "Customer name must not exceed 50 characters";
        } else {
          delete newErrors.customerName;
        }
        break;

      case "timeSlot":
        if (!value.trim()) {
          newErrors.timeSlot = "Time slot is required";
        } else if (!VALIDATION_RULES.timeSlot.pattern.test(value)) {
          newErrors.timeSlot = "Time slot format should be HH:MM - HH:MM";
        } else {
          delete newErrors.timeSlot;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
  };

  const validateEditItems = () => {
    const itemErrors = {};

    if (editFormData?.items) {
      editFormData.items.forEach((item, index) => {
        if (!item.name.trim()) {
          itemErrors[`item_${index}_name`] = "Item name is required";
        } else if (item.name.trim().length > VALIDATION_RULES.itemName.maxLength) {
          itemErrors[`item_${index}_name`] = "Item name must not exceed 100 characters";
        }

        if (item.quantity < 1) {
          itemErrors[`item_${index}_quantity`] = "Quantity must be at least 1";
        }

        if (item.price < 0) {
          itemErrors[`item_${index}_price`] = "Price cannot be negative";
        }

        if (!item.price) {
          itemErrors[`item_${index}_price`] = "Price is required";
        }
      });
    }

    return itemErrors;
  };

  const isEditFormValid = () => {
    const itemErrors = validateEditItems();
    const hasMainErrors =
      !editFormData?.customerName.trim() ||
      !editFormData?.timeSlot.trim() ||
      !VALIDATION_RULES.timeSlot.pattern.test(editFormData?.timeSlot || "");

    return Object.keys(itemErrors).length === 0 && !hasMainErrors;
  };

  const openEditModal = (order) => {
    setEditingOrder(order);
    setEditFormData({
      customerName: order.customerName,
      canteen: order.canteen,
      timeSlot: order.timeSlot,
      items: order.items || [],
    });
    setErrors({});
  };

  const closeEditModal = () => {
    setEditingOrder(null);
    setEditFormData(null);
    setErrors({});
  };

  const handleEditChange = (field, value) => {
    setEditFormData((prev) => ({ ...prev, [field]: value }));
    validateEditField(field, value);
  };

  const handleEditItemChange = (index, field, value) => {
    setEditFormData((prev) => ({
      ...prev,
      items: prev.items.map((item, i) =>
        i === index ? { ...item, [field]: value } : item
      ),
    }));
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addEditItem = () => {
    setEditFormData((prev) => ({
      ...prev,
      items: [...prev.items, { name: "", quantity: 1, price: 0 }],
    }));
  };

  const removeEditItem = (index) => {
    setEditFormData((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleUpdateOrder = async () => {
    const itemErrors = validateEditItems();
    const isValid =
      editFormData.customerName.trim() &&
      editFormData.timeSlot.trim() &&
      VALIDATION_RULES.timeSlot.pattern.test(editFormData.timeSlot) &&
      Object.keys(itemErrors).length === 0;

    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...itemErrors }));
      toast.error("Please fix all validation errors");
      return;
    }

    try {
      setLoading(true);
      const totalAmount = editFormData.items.reduce(
        (sum, item) => sum + item.quantity * item.price,
        0
      );

      const response = await axios.put(`/api/orders/${editingOrder._id}`, {
        customerName: editFormData.customerName.trim(),
        canteen: editFormData.canteen,
        timeSlot: editFormData.timeSlot,
        items: editFormData.items,
        totalAmount,
      });

      setOrders((prev) =>
        prev.map((order) =>
          order._id === editingOrder._id ? response.data.order : order
        )
      );

      toast.success("Order updated successfully");
      closeEditModal();
    } catch (error) {
      console.error("Update order error:", error);
      toast.error(error.response?.data?.message || "Failed to update order");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteOrder = async (orderId) => {
    if (window.confirm("Are you sure you want to delete this order?")) {
      try {
        await axios.delete(`/api/orders/${orderId}`);
        setOrders((prev) => prev.filter((order) => order._id !== orderId));
        toast.success("Order deleted successfully");
      } catch (error) {
        console.error("Delete order error:", error);
        toast.error(error.response?.data?.message || "Failed to delete order");
      }
    }
  };


  const filteredOrders = useMemo(() => {
    let nextOrders = [...orders];

    nextOrders = nextOrders.filter((order) => {
      const itemsText = Array.isArray(order.items)
        ? order.items.map((item) => `${item.name} ${item.quantity}`).join(" ")
        : "";

      const searchable = `
        ${order.customerName || ""}
        ${order.canteen || ""}
        ${order.timeSlot || ""}
        ${order.tokenNumber || ""}
        ${order.status || ""}
        ${itemsText}
      `
        .toLowerCase()
        .trim();

      return searchable.includes(searchTerm.toLowerCase().trim());
    });

    if (statusFilter !== "all") {
      nextOrders = nextOrders.filter(
        (order) => (order.status || "pending").toLowerCase() === statusFilter
      );
    }

    if (sortType === "latest") {
      nextOrders.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
    }
    if (sortType === "oldest") {
      nextOrders.sort((a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0));
    }
    if (sortType === "name") {
      nextOrders.sort((a, b) => (a.customerName || "").localeCompare(b.customerName || ""));
    }

    return nextOrders;
  }, [orders, searchTerm, sortType, statusFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-12">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-[2rem] bg-white p-6 shadow-xl">
          <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-black text-slate-900">All Orders</h1>
              <p className="mt-2 text-slate-600">Live order list with real generated token numbers.</p>
            </div>
            <button
              type="button"
              onClick={fetchOrders}
              className="rounded-2xl bg-orange-500 px-5 py-3 font-semibold text-white"
            >
              Refresh
            </button>
          </div>

          <div className="mb-6 grid gap-4 md:grid-cols-[180px_1fr_220px]">
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="preparing">Preparing</option>
              <option value="ready">Ready</option>
              <option value="completed">Completed</option>
            </select>

            <input
              type="text"
              placeholder="Search orders"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            />

            <select
              value={sortType}
              onChange={(event) => setSortType(event.target.value)}
              className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 outline-none"
            >
              <option value="latest">Sort by latest</option>
              <option value="oldest">Sort by oldest</option>
              <option value="name">Sort by name</option>
            </select>
          </div>

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredOrders.map((order) => (
              <div key={order._id} className="rounded-2xl border border-slate-200 p-5">
                <h3 className="text-xl font-bold text-slate-900">{order.customerName}</h3>
                <p className="mt-2 text-slate-600">Canteen: {order.canteen}</p>
                <p className="text-slate-600">Time Slot: {order.timeSlot}</p>
                <p className="text-slate-600">Status: {order.status}</p>
                <p className="mt-3 font-mono text-orange-600">Token #{order.tokenNumber}</p>
                <p className="mt-2 font-semibold text-slate-900">Rs {order.totalAmount}</p>

                <ul className="mt-3 space-y-1 text-sm text-slate-600">
                  {order.items?.map((item, index) => (
                    <li key={index}>
                      {item.name} x {item.quantity} @ Rs {item.price}
                    </li>
                  ))}
                </ul>

                <div className="mt-4 flex gap-2">
                  <button
                    type="button"
                    onClick={() => openEditModal(order)}
                    className="flex-1 rounded-2xl border border-blue-200 px-3 py-2 text-sm font-semibold text-blue-600 hover:bg-blue-50"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteOrder(order._id)}
                    className="flex-1 rounded-2xl border border-red-200 px-3 py-2 text-sm font-semibold text-red-600 hover:bg-red-50"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No orders found.</div>
          ) : null}
        </div>

        {editingOrder && editFormData && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="w-full max-w-2xl rounded-2xl bg-white p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">Edit Order</h2>

              {Object.keys(errors).length > 0 && (
                <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4 mb-4">
                  <h3 className="font-semibold text-red-800 mb-2">Validation Errors:</h3>
                  <ul className="space-y-1">
                    {Object.entries(errors).map(([key, message]) => (
                      <li key={key} className="text-sm text-red-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{message}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="space-y-4 max-h-96 overflow-y-auto">
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Customer Name
                    </label>
                    <input
                      value={editFormData.customerName}
                      onChange={(e) => handleEditChange("customerName", e.target.value)}
                      placeholder="Customer name"
                      className={`w-full rounded-2xl border px-4 py-2 outline-none focus:border-blue-500 ${
                        errors.customerName
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    />
                    {errors.customerName && (
                      <p className="mt-1 text-sm text-red-600">{errors.customerName}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Canteen
                    </label>
                    <select
                      value={editFormData.canteen}
                      onChange={(e) => handleEditChange("canteen", e.target.value)}
                      className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-2 outline-none focus:border-blue-500"
                    >
                      <option>Main Canteen</option>
                      <option>Juice Bar</option>
                      <option>New canteen</option>
                      <option>Anohana canteen</option>
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-slate-900 mb-2">
                      Time Slot
                    </label>
                    <input
                      value={editFormData.timeSlot}
                      onChange={(e) => handleEditChange("timeSlot", e.target.value)}
                      placeholder="10:00 - 10:30"
                      className={`w-full rounded-2xl border px-4 py-2 outline-none focus:border-blue-500 ${
                        errors.timeSlot
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                    />
                    {errors.timeSlot && (
                      <p className="mt-1 text-sm text-red-600">{errors.timeSlot}</p>
                    )}
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h3 className="font-semibold text-slate-900 mb-3">Items</h3>
                  <div className="space-y-3">
                    {editFormData.items.map((item, index) => (
                      <div key={index}>
                        <div className="grid gap-2 md:grid-cols-[1fr_100px_100px_auto]">
                          <input
                            value={item.name}
                            onChange={(e) => handleEditItemChange(index, "name", e.target.value)}
                            placeholder="Item name"
                            className={`rounded-2xl border px-3 py-2 outline-none focus:border-blue-500 ${
                              errors[`item_${index}_name`]
                                ? "border-red-500 bg-red-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          />
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleEditItemChange(index, "quantity", e.target.value)}
                            className={`rounded-2xl border px-3 py-2 outline-none focus:border-blue-500 ${
                              errors[`item_${index}_quantity`]
                                ? "border-red-500 bg-red-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          />
                          <input
                            type="number"
                            min="0"
                            value={item.price}
                            onChange={(e) => handleEditItemChange(index, "price", e.target.value)}
                            className={`rounded-2xl border px-3 py-2 outline-none focus:border-blue-500 ${
                              errors[`item_${index}_price`]
                                ? "border-red-500 bg-red-50"
                                : "border-slate-200 bg-slate-50"
                            }`}
                          />
                          <button
                            type="button"
                            onClick={() => removeEditItem(index)}
                            className="rounded-2xl border border-red-200 px-3 py-2 text-red-600"
                          >
                            Remove
                          </button>
                        </div>
                        {(errors[`item_${index}_name`] ||
                          errors[`item_${index}_quantity`] ||
                          errors[`item_${index}_price`]) && (
                          <div className="mt-1 space-y-1">
                            {errors[`item_${index}_name`] && (
                              <p className="text-sm text-red-600">{errors[`item_${index}_name`]}</p>
                            )}
                            {errors[`item_${index}_quantity`] && (
                              <p className="text-sm text-red-600">{errors[`item_${index}_quantity`]}</p>
                            )}
                            {errors[`item_${index}_price`] && (
                              <p className="text-sm text-red-600">{errors[`item_${index}_price`]}</p>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={addEditItem}
                    className="mt-3 rounded-2xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700"
                  >
                    Add Item
                  </button>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={closeEditModal}
                  className="flex-1 rounded-2xl border border-slate-300 px-4 py-3 font-semibold text-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleUpdateOrder}
                  disabled={loading || !isEditFormValid()}
                  className="flex-1 rounded-2xl bg-blue-500 px-4 py-3 font-semibold text-white disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {loading ? "Updating..." : "Update Order"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default OrdersPage;
