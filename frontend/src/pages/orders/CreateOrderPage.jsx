import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import axios from "../../lib/axios";
import { useAuthStore } from "../../store/user";

const CANTEENS = ["Juice Bar", "Basement Canteen", "New Canteen", "Anohana Canteen"];

const emptyItem = { name: "", quantity: 1, price: 0 };

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

function CreateOrderPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [menusLoading, setMenusLoading] = useState(false);
  const [canteenMenus, setCanteenMenus] = useState({});
  const [formData, setFormData] = useState({
    customerName: "",
    canteen: "New Canteen",
    timeSlot: "",
    items: [{ ...emptyItem }],
  });
  const [errors, setErrors] = useState({});

  // Debug - log when component mounts
  useEffect(() => {
    console.log("CreateOrderPage mounted");
    console.log("User from auth:", user);
  }, [user]);

  // Fetch menus for all canteens
  useEffect(() => {
    const fetchAllMenus = async () => {
      setMenusLoading(true);
      const menus = {};

      for (const canteen of CANTEENS) {
        try {
          const response = await axios.get(`/api/menu/canteen/${encodeURIComponent(canteen)}`);
          menus[canteen] = response.data.data || [];
        } catch (error) {
          console.error(`Error fetching menu for ${canteen}:`, error);
          menus[canteen] = [];
        }
      }

      setCanteenMenus(menus);
      setMenusLoading(false);
    };

    fetchAllMenus();
  }, []);

  const validateField = (fieldName, value) => {
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

      case "canteen":
        if (!value) {
          newErrors.canteen = "Please select a canteen";
        } else {
          delete newErrors.canteen;
        }
        break;

      default:
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateItems = () => {
    const itemErrors = {};

    formData.items.forEach((item, index) => {
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

    return itemErrors;
  };

  const isFormValid = () => {
    const itemErrors = validateItems();
    const hasMainErrors =
      !formData.customerName.trim() ||
      !formData.timeSlot.trim() ||
      !VALIDATION_RULES.timeSlot.pattern.test(formData.timeSlot || "");

    return Object.keys(itemErrors).length === 0 && !hasMainErrors;
  };

  const getAllValidationMessages = () => {
    const messages = [];
    const itemErrors = validateItems();

    // Main field errors
    if (errors.customerName) messages.push(`Customer Name: ${errors.customerName}`);
    if (errors.canteen) messages.push(`Canteen: ${errors.canteen}`);
    if (errors.timeSlot) messages.push(`Time Slot: ${errors.timeSlot}`);

    // Item errors
    Object.entries(itemErrors).forEach(([key, value]) => {
      const [, itemIndex, field] = key.match(/item_(\d+)_(.+)/) || [];
      if (itemIndex !== undefined) {
        messages.push(`Item ${parseInt(itemIndex) + 1} - ${field.charAt(0).toUpperCase() + field.slice(1)}: ${value}`);
      }
    });

    return messages;
  };

  const handleMainChange = (event) => {
    const { name, value } = event.target;
    setFormData((current) => ({ ...current, [name]: value }));
    validateField(name, value);
  };

  const handleItemChange = (index, field, value) => {
    setFormData((current) => ({
      ...current,
      items: current.items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      ),
    }));
    // Clear item error when user starts typing
    const errorKey = `item_${index}_${field}`;
    if (errors[errorKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[errorKey];
        return newErrors;
      });
    }
  };

  const addItem = () => {
    setFormData((current) => ({ ...current, items: [...current.items, { ...emptyItem }] }));
  };

  const removeItem = (index) => {
    if (formData.items.length === 1) {
      toast.error("At least one item is required");
      return;
    }
    setFormData((current) => ({
      ...current,
      items: current.items.filter((_, itemIndex) => itemIndex !== index),
    }));
  };

  const addMenuItemToOrder = (menuItem) => {
    const existingItemIndex = formData.items.findIndex(
      (item) => item.name.toLowerCase() === menuItem.name.toLowerCase()
    );

    if (existingItemIndex !== -1) {
      // Item exists, increase quantity
      setFormData((current) => ({
        ...current,
        items: current.items.map((item, i) =>
          i === existingItemIndex
            ? { ...item, quantity: (item.quantity || 0) + 1, price: menuItem.price }
            : item
        ),
      }));
      toast.success(`${menuItem.name} quantity increased`);
    } else {
      // Remove empty placeholder if it exists
      const filteredItems = formData.items.filter((item) => item.name !== "");
      
      setFormData((current) => ({
        ...current,
        items: [
          ...filteredItems,
          {
            name: menuItem.name,
            quantity: 1,
            price: menuItem.price,
          },
        ],
      }));
      toast.success(`${menuItem.name} added to order`);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    console.log("Form submitted", formData);

    // Validate all fields
    const itemErrors = validateItems();
    const isValid =
      formData.customerName.trim() &&
      formData.timeSlot.trim() &&
      VALIDATION_RULES.timeSlot.pattern.test(formData.timeSlot) &&
      Object.keys(itemErrors).length === 0;

    if (!isValid) {
      setErrors((prev) => ({ ...prev, ...itemErrors }));
      toast.error("Please fix all validation errors");
      return;
    }

    const cleanedItems = formData.items
      .filter((item) => item.name.trim() !== "")
      .map((item) => ({
        name: item.name.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

    const totalAmount = cleanedItems.reduce(
      (sum, item) => sum + item.quantity * item.price,
      0
    );

    if (cleanedItems.length === 0) {
      toast.error("Please add at least one item");
      return;
    }

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

      console.log("Order created:", response.data);
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

  // Fix: Fixed the select options - they were showing wrong values
  const canteenOptions = [
    { value: "Main Canteen", label: "Main Canteen" },
    { value: "Basement Canteen", label: "Basement Canteen" },
    { value: "New Canteen", label: "New Canteen" },
    { value: "Anohana Canteen", label: "Anohana Canteen" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-amber-50 px-4 py-12">
      <div className="mx-auto max-w-4xl rounded-[2rem] bg-white p-8 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900">Create Order</h1>
        <p className="mt-2 text-slate-600">Generate a real token number from the merged backend.</p>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {Object.keys(errors).length > 0 && (
            <div className="rounded-2xl border-l-4 border-red-500 bg-red-50 p-4">
              <h3 className="font-semibold text-red-800 mb-2">Validation Errors:</h3>
              <ul className="space-y-1">
                {getAllValidationMessages().map((message, index) => (
                  <li key={index} className="text-sm text-red-700 flex items-start">
                    <span className="mr-2">•</span>
                    <span>{message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

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
              {canteenOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
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
              <div key={index}>
                <div className="grid gap-3 md:grid-cols-[1fr_140px_140px_auto]">
                  <div>
                    <input
                      value={item.name}
                      onChange={(event) => handleItemChange(index, "name", event.target.value)}
                      placeholder="Item name"
                      className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-orange-500 ${
                        errors[`item_${index}_name`]
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="1"
                      value={item.quantity}
                      onChange={(event) => handleItemChange(index, "quantity", event.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-orange-500 ${
                        errors[`item_${index}_quantity`]
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  <div>
                    <input
                      type="number"
                      min="0"
                      step="10"
                      value={item.price}
                      onChange={(event) => handleItemChange(index, "price", event.target.value)}
                      className={`w-full rounded-2xl border px-4 py-3 outline-none focus:border-orange-500 ${
                        errors[`item_${index}_price`]
                          ? "border-red-500 bg-red-50"
                          : "border-slate-200 bg-slate-50"
                      }`}
                      required
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeItem(index)}
                    className="rounded-2xl border border-red-200 px-4 py-3 text-red-500 hover:bg-red-50 transition"
                  >
                    Remove
                  </button>
                </div>
                {(errors[`item_${index}_name`] || errors[`item_${index}_quantity`] || errors[`item_${index}_price`]) && (
                  <div className="mt-2 space-y-1">
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

          <div className="flex gap-3">
            <button
              type="button"
              onClick={addItem}
              className="rounded-2xl border border-slate-300 px-5 py-3 font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Add Item
            </button>
            <button
              type="submit"
              disabled={loading || !isFormValid()}
              className="rounded-2xl bg-orange-500 px-6 py-3 font-semibold text-white hover:bg-orange-600 transition disabled:opacity-60 disabled:cursor-not-allowed"
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