import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ordersAPI, storesAPI } from "../api/api";
import {
  ArrowRight,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  Store,
  ShoppingCart,
} from "lucide-react";

const MyOrders = () => {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchOrders(selectedStoreId);
    }
  }, [selectedStoreId, statusFilter]);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getMyStores();
      const storesData = response.data || response;
      setStores(storesData);

      if (storesData.length === 0) {
        setSelectedStoreId("");
        setOrders([]);
        setLoading(false);
        return;
      }

      setSelectedStoreId((currentSelectedStoreId) =>
        storesData.some((store) => store.id === currentSelectedStoreId)
          ? currentSelectedStoreId
          : storesData.at(0)?.id || "",
      );
    } catch (error) {
      console.error("Failed to fetch stores:", error);
      setLoading(false);
    }
  };

  const fetchOrders = async (storeId = selectedStoreId) => {
    if (!storeId) return;

    try {
      setLoading(true);
      const response = await ordersAPI.getByStore(storeId);
      let ordersData = response.data || response;

      // Filter by status if needed
      if (statusFilter !== "all") {
        ordersData = ordersData.filter(
          (order) => order.status === statusFilter,
        );
      }

      // Sort by creation date (newest first)
      ordersData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      setOrders(ordersData);
    } catch (error) {
      console.error("Failed to fetch orders:", error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await ordersAPI.updateStatus(orderId, newStatus);

      // Update local state
      setOrders(
        orders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order,
        ),
      );
    } catch (error) {
      console.error("Failed to update order status:", error);
      alert("Failed to update order status. Please try again.");
    } finally {
      setUpdatingOrder(null);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-amber-100 text-amber-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "completed":
      case "delivered":
        return "bg-emerald-100 text-emerald-800";
      case "cancelled":
      case "returned":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "processing":
        return <Package className="h-4 w-4" />;
      case "shipped":
        return <Package className="h-4 w-4" />;
      case "completed":
      case "delivered":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
      case "returned":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-950" />
      </div>
    );
  }

  if (!loading && stores.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f1e7] px-6 py-10 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] bg-emerald-950 p-8 text-center text-white shadow-[0_30px_100px_rgba(8,28,21,0.22)] md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em]">
              Create a store before managing orders.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
              Orders are tied to storefronts. Set up your first store, then
              orders will appear here.
            </p>
            <Link
              to="/my-stores"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
            >
              Create Your First Store
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const selectedStore =
    stores.find((store) => store.id === selectedStoreId) || stores.at(0);

  return (
    <div className="min-h-screen bg-[#f6f1e7]">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <ShoppingCart className="h-4 w-4" />
                Order Management
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Manage Your Orders
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                View and manage orders for the selected store.
              </p>
            </div>
          </div>
        </section>

        {/* Filters */}
        <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Viewing store
              </p>
              <h2 className="mt-1 text-2xl font-black text-emerald-950">
                {selectedStore?.name || "Select a store"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-emerald-950/60">
                Order list is scoped to this store.
              </p>
            </div>

            {stores.length > 1 ? (
              <select
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(e.target.value)}
                className="rounded-full border border-emerald-950/10 bg-[#f6f1e7] px-5 py-3 font-black text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rounded-full bg-[#f6f1e7] px-5 py-3 font-black text-emerald-950">
                {selectedStore?.name}
              </span>
            )}

            <div className="flex items-center gap-3">
              <label className="text-sm font-black text-emerald-950">
                Filter:
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="rounded-full border border-emerald-950/10 bg-[#f6f1e7] px-4 py-2 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
                <option value="returned">Returned</option>
              </select>
            </div>
          </div>
        </section>

        {/* Orders List */}
        {loading ? (
          <div className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-8 shadow-sm backdrop-blur">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-950" />
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="mt-8 rounded-[2.5rem] bg-emerald-950 p-8 text-center text-white shadow-[0_30px_100px_rgba(8,28,21,0.22)] md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Package className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-3xl font-black tracking-[-0.04em]">
              No orders for this store yet
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
              {statusFilter === "all"
                ? `No orders for ${selectedStore?.name || "this store"} yet.`
                : `No ${statusFilter} orders found.`}
            </p>
          </div>
        ) : (
          <div className="mt-8 space-y-5">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-[2rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-black text-emerald-950">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm font-semibold text-emerald-950/60">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() +
                        order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid gap-5 md:grid-cols-2 mb-6">
                  <div className="rounded-2xl bg-[#f6f1e7] p-5">
                    <h4 className="font-black text-emerald-950 mb-3">
                      Customer Information
                    </h4>
                    <div className="space-y-2 text-sm font-semibold text-emerald-950/70">
                      <p>
                        <span className="text-emerald-950">Name:</span>{" "}
                        {order.customerInfo.firstName}{" "}
                        {order.customerInfo.lastName}
                      </p>
                      <p>
                        <span className="text-emerald-950">Email:</span>{" "}
                        {order.customerInfo.email}
                      </p>
                      <p>
                        <span className="text-emerald-950">Phone:</span>{" "}
                        {order.customerInfo.phone}
                      </p>
                      <p>
                        <span className="text-emerald-950">Address:</span>{" "}
                        {order.customerInfo.address}, {order.customerInfo.city},{" "}
                        {order.customerInfo.postalCode}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-2xl bg-[#f6f1e7] p-5">
                    <h4 className="font-black text-emerald-950 mb-3">
                      Order Summary
                    </h4>
                    <div className="space-y-2 text-sm font-semibold text-emerald-950/70">
                      <p>
                        <span className="text-emerald-950">Items:</span>{" "}
                        {order.items.length}
                      </p>
                      <p>
                        <span className="text-emerald-950">Payment:</span>{" "}
                        {order.paymentMethod.toUpperCase()}
                      </p>
                      <p className="text-lg">
                        <span className="text-emerald-950">Total:</span>{" "}
                        <span className="text-emerald-950">৳{order.total}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-black text-emerald-950 mb-4">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-4 rounded-2xl bg-[#f6f1e7]"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-14 w-14 rounded-2xl object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-black text-emerald-950">
                            {item.name}
                          </p>
                          <p className="text-sm font-semibold text-emerald-950/60">
                            Quantity: {item.quantity} × ৳{item.price}
                          </p>
                        </div>
                        <p className="font-black text-emerald-950 text-lg">
                          ৳{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-5 border-t border-emerald-950/10">
                  <div className="text-sm font-semibold text-emerald-950/60">
                    <span className="text-emerald-950">Subtotal:</span> ৳
                    {order.subtotal} |{" "}
                    <span className="text-emerald-950">Shipping:</span> ৳
                    {order.shipping} |{" "}
                    <span className="text-emerald-950">Tax:</span> ৳{order.tax}
                  </div>
                  <div className="flex gap-3">
                    {order.status === "pending" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "processing")
                        }
                        disabled={updatingOrder === order.id}
                        className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-5 py-3 font-black text-white transition hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updatingOrder === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                        Process
                      </button>
                    )}
                    {order.status === "processing" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "shipped")}
                        disabled={updatingOrder === order.id}
                        className="inline-flex items-center gap-2 rounded-full bg-purple-600 px-5 py-3 font-black text-white transition hover:bg-purple-700 disabled:opacity-50"
                      >
                        {updatingOrder === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                        Ship
                      </button>
                    )}
                    {(order.status === "processing" ||
                      order.status === "shipped") && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        disabled={updatingOrder === order.id}
                        className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-5 py-3 font-black text-emerald-950 transition hover:bg-lime-200 disabled:opacity-50"
                      >
                        {updatingOrder === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Complete
                      </button>
                    )}
                    {order.status !== "completed" &&
                      order.status !== "cancelled" &&
                      order.status !== "delivered" &&
                      order.status !== "returned" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "cancelled")
                          }
                          disabled={updatingOrder === order.id}
                          className="inline-flex items-center gap-2 rounded-full bg-red-100 px-5 py-3 font-black text-red-700 transition hover:bg-red-200 disabled:opacity-50"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyOrders;
