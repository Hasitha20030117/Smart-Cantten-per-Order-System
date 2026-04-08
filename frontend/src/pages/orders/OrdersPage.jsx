import { useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import axios from "../../lib/axios";

function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortType, setSortType] = useState("latest");
  const [statusFilter, setStatusFilter] = useState("all");

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
              </div>
            ))}
          </div>

          {filteredOrders.length === 0 ? (
            <div className="py-16 text-center text-slate-500">No orders found.</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default OrdersPage;
