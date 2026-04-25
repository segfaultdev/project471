import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, storesAPI } from "../api/api";
import {
  Package,
  CheckCircle,
  Clock,
  Loader2,
  AlertCircle,
  Store,
  ArrowRight,
  Truck,
  RotateCcw,
  ClipboardList,
  Sparkles,
  X,
} from "lucide-react";

const ORDER_STATUSES = [
  { value: "pending", label: "Pending" },
  { value: "confirmed", label: "Confirmed" },
  { value: "shipped", label: "Shipped" },
  { value: "delivered", label: "Delivered" },
  { value: "returned", label: "Returned" },
];

const normalizeStatus = (status) => {
  const value = String(status || "pending").toLowerCase();

  // Backward compatibility with old statuses already saved in DB
  if (value === "processing") return "confirmed";
  if (value === "completed") return "delivered";
  if (value === "cancelled") return "returned";

  return value;
};

const getStatusLabel = (status) => {
  const normalized = normalizeStatus(status);
  return ORDER_STATUSES.find((item) => item.value === normalized)?.label || "Pending";
};

const getStatusColor = (status) => {
  switch (normalizeStatus(status)) {
    case "pending":
      return "bg-amber-200 text-emerald-950";
    case "confirmed":
      return "bg-lime-200 text-emerald-950";
    case "shipped":
      return "bg-sky-100 text-sky-800";
    case "delivered":
      return "bg-lime-300 text-emerald-950";
    case "returned":
      return "bg-red-100 text-red-700";
    default:
      return "bg-emerald-100 text-emerald-800";
  }
};

const getStatusIcon = (status) => {
  switch (normalizeStatus(status)) {
    case "pending":
      return <Clock className="h-4 w-4" />;
    case "confirmed":
      return <CheckCircle className="h-4 w-4" />;
    case "shipped":
      return <Truck className="h-4 w-4" />;
    case "delivered":
      return <CheckCircle className="h-4 w-4" />;
    case "returned":
      return <RotateCcw className="h-4 w-4" />;
    default:
      return <AlertCircle className="h-4 w-4" />;
  }
};

const getNextStatuses = (status) => {
  switch (normalizeStatus(status)) {
    case "pending":
      return ["confirmed", "returned"];
    case "confirmed":
      return ["shipped", "returned"];
    case "shipped":
      return ["delivered", "returned"];
    case "delivered":
      return ["returned"];
    default:
      return [];
  }
};

const formatCurrency = (amount) => `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const MyOrders = () => {
  const { user, isVendor } = useAuth();
  const vendor = isVendor();

  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (vendor) {
      fetchStores();
    } else {
      fetchCustomerOrders();
    }
  }, [vendor]);

  useEffect(() => {
    if (vendor && stores.length > 0) {
      if (!selectedStore) {
        setSelectedStore(stores[0].id);
      } else {
        fetchOrders();
      }
    }
  }, [stores, selectedStore, statusFilter, vendor]);

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await storesAPI.getMyStores();
      const storesData = response.data || response || [];
      setStores(storesData);

      if (storesData.length > 0) {
        setSelectedStore((current) => current || storesData[0].id);
      }
    } catch (err) {
      setError("Failed to load your stores.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomerOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // If your backend has a customer-orders endpoint, wire it in api.js as ordersAPI.getMyOrders().
      if (ordersAPI.getMyOrders) {
        const response = await ordersAPI.getMyOrders();
        let ordersData = response.data || response || [];

        if (statusFilter !== "all") {
          ordersData = ordersData.filter(
            (order) => normalizeStatus(order.status) === statusFilter,
          );
        }

        ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setOrders(ordersData);
      } else {
        setOrders([]);
      }
    } catch (err) {
      setError("Failed to load your orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!selectedStore) return;

    try {
      setLoading(true);
      setError("");

      const response = await ordersAPI.getByStore(selectedStore);
      let ordersData = response.data || response || [];

      if (statusFilter !== "all") {
        ordersData = ordersData.filter(
          (order) => normalizeStatus(order.status) === statusFilter,
        );
      }

      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(ordersData);
    } catch (err) {
      setError("Failed to load orders.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      setError("");
      setSuccess("");

      await ordersAPI.updateStatus(orderId, newStatus);

      setOrders((currentOrders) =>
        currentOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );

      setSuccess(`Order updated to ${getStatusLabel(newStatus)}.`);
      setTimeout(() => setSuccess(""), 2500);
    } catch (err) {
      setError("Failed to update order status. Please try again.");
      console.error(err);
    } finally {
      setUpdatingOrder(null);
    }
  };

  if (loading && stores.length === 0 && vendor) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-950" />
          <p className="mt-4 font-black text-emerald-950">Loading orders...</p>
        </div>
      </div>
    );
  }

  if (vendor && !loading && stores.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f1e7] px-6 py-10 text-emerald-950 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] bg-emerald-950 p-8 text-center text-white shadow-[0_30px_100px_rgba(8,28,21,0.22)] md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em]">
              Create a store before managing orders.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
              Orders belong to stores. Set up your storefront first, then customer orders will appear here.
            </p>
            <Link
              to="/my-stores"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
            >
              Create Store
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <Sparkles className="h-4 w-4" />
                {vendor ? "Order Management" : "My Purchases"}
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                {vendor ? "Manage store orders" : `Your orders, ${user?.firstName || "customer"}`}
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                {vendor
                  ? "Update orders through Pending, Confirmed, Shipped, Delivered, and Returned."
                  : "Track your purchases, delivery progress, returns, and review-ready orders."}
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-4 text-emerald-950">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Total orders
              </p>
              <p className="mt-2 text-4xl font-black">{orders.length}</p>
            </div>
          </div>
        </section>

        {(error || success) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="font-semibold">{error}</p>
                <button onClick={() => setError("")} className="rounded-full p-1 hover:bg-red-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-between rounded-2xl border border-lime-300 bg-lime-100 p-4 text-emerald-950">
                <p className="font-black">{success}</p>
                <button onClick={() => setSuccess("")} className="rounded-full p-1 hover:bg-lime-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur">
          <div className="grid gap-4 md:grid-cols-2">
            {vendor && (
              <div>
                <label className="mb-2 block text-sm font-black text-emerald-950">
                  Select Store
                </label>
                <select
                  value={selectedStore}
                  onChange={(e) => setSelectedStore(e.target.value)}
                  className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="mb-2 block text-sm font-black text-emerald-950">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
              >
                <option value="all">All Orders</option>
                {ORDER_STATUSES.map((status) => (
                  <option key={status.value} value={status.value}>
                    {status.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </section>

        {loading ? (
          <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-950" />
            <p className="mt-4 font-black text-emerald-950">Loading orders...</p>
          </section>
        ) : orders.length === 0 ? (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <ClipboardList className="h-10 w-10" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-emerald-950">
              No orders found
            </h3>
            <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-emerald-950/60">
              {vendor
                ? statusFilter === "all"
                  ? "You have not received any orders for this store yet."
                  : `No ${getStatusLabel(statusFilter)} orders found for this store.`
                : "You have not placed any orders yet."}
            </p>
            {!vendor && (
              <Link
                to="/products"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-950 px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                Browse Products
                <ArrowRight className="h-5 w-5" />
              </Link>
            )}
          </section>
        ) : (
          <section className="mt-8 space-y-6">
            {orders.map((order) => {
              const normalizedStatus = normalizeStatus(order.status);
              const nextStatuses = vendor ? getNextStatuses(normalizedStatus) : [];

              return (
                <article
                  key={order.id}
                  className="overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/85 shadow-sm backdrop-blur transition hover:shadow-xl"
                >
                  <div className="flex flex-col gap-4 border-b border-emerald-950/10 p-6 md:flex-row md:items-center md:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                        <Package className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="text-xl font-black text-emerald-950">
                          Order #{order.orderNumber || order.id}
                        </h3>
                        <p className="text-sm font-semibold text-emerald-950/60">
                          {order.createdAt
                            ? new Date(order.createdAt).toLocaleString()
                            : "Date unavailable"}
                        </p>
                      </div>
                    </div>

                    <span
                      className={`inline-flex w-fit items-center gap-2 rounded-full px-4 py-2 text-sm font-black capitalize ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {getStatusLabel(order.status)}
                    </span>
                  </div>

                  <div className="grid gap-4 p-6 lg:grid-cols-2">
                    <div className="rounded-2xl bg-[#f6f1e7] p-5">
                      <h4 className="font-black text-emerald-950">
                        {vendor ? "Customer Information" : "Delivery Information"}
                      </h4>
                      <div className="mt-3 space-y-1 text-sm font-semibold text-emerald-950/70">
                        <p>
                          <strong>Name:</strong>{" "}
                          {order.customerInfo?.firstName || "Unknown"}{" "}
                          {order.customerInfo?.lastName || ""}
                        </p>
                        {order.customerInfo?.email && (
                          <p><strong>Email:</strong> {order.customerInfo.email}</p>
                        )}
                        {order.customerInfo?.phone && (
                          <p><strong>Phone:</strong> {order.customerInfo.phone}</p>
                        )}
                        {order.customerInfo?.address && (
                          <p>
                            <strong>Address:</strong>{" "}
                            {order.customerInfo.address}
                            {order.customerInfo.city ? `, ${order.customerInfo.city}` : ""}
                            {order.customerInfo.postalCode ? `, ${order.customerInfo.postalCode}` : ""}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="rounded-2xl bg-[#f6f1e7] p-5">
                      <h4 className="font-black text-emerald-950">Order Summary</h4>
                      <div className="mt-3 space-y-1 text-sm font-semibold text-emerald-950/70">
                        <p><strong>Items:</strong> {order.items?.length || 0}</p>
                        <p>
                          <strong>Payment:</strong>{" "}
                          {order.paymentMethod ? String(order.paymentMethod).toUpperCase() : "Not set"}
                        </p>
                        <p><strong>Total:</strong> {formatCurrency(order.total)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="px-6 pb-6">
                    <h4 className="mb-3 font-black text-emerald-950">Order Items</h4>
                    <div className="space-y-3">
                      {(order.items || []).map((item, index) => (
                        <div
                          key={`${item.id || item.name}-${index}`}
                          className="flex items-center gap-4 rounded-2xl bg-[#f6f1e7] p-4"
                        >
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.name}
                              className="h-14 w-14 rounded-xl object-cover"
                            />
                          ) : (
                            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-lime-200 text-emerald-950">
                              <Package className="h-6 w-6" />
                            </div>
                          )}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-black text-emerald-950">
                              {item.name}
                            </p>
                            <p className="text-sm font-semibold text-emerald-950/60">
                              Quantity: {item.quantity}
                            </p>
                          </div>
                          <p className="font-black text-emerald-950">
                            {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col gap-4 border-t border-emerald-950/10 bg-[#f6f1e7]/70 p-6 lg:flex-row lg:items-center lg:justify-between">
                    <div className="text-sm font-semibold text-emerald-950/70">
                      <strong>Subtotal:</strong> {formatCurrency(order.subtotal)}{" "}
                      <span className="mx-2">•</span>
                      <strong>Shipping:</strong> {formatCurrency(order.shipping)}{" "}
                      <span className="mx-2">•</span>
                      <strong>Tax:</strong> {formatCurrency(order.tax)}
                    </div>

                    {vendor && nextStatuses.length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {nextStatuses.map((status) => (
                          <button
                            key={status}
                            onClick={() => updateOrderStatus(order.id, status)}
                            disabled={updatingOrder === order.id}
                            className={`inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-60 ${getStatusColor(status)}`}
                          >
                            {updatingOrder === order.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              getStatusIcon(status)
                            )}
                            Mark {getStatusLabel(status)}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyOrders;
