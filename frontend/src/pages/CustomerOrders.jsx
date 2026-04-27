import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ordersAPI } from "../api/api";
import {
  Loader2,
  Package,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
  Truck,
  ShoppingBag,
  Store,
  ChevronDown,
  ChevronUp,
} from "lucide-react";

const formatCurrency = (amount) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const formatDate = (dateStr) => {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-BD", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const STATUS_CONFIG = {
  pending: {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-200",
    icon: Clock,
    description: "Your order has been received and is awaiting confirmation.",
  },
  completed: {
    label: "Completed",
    color: "bg-emerald-100 text-emerald-800 border-emerald-200",
    icon: CheckCircle,
    description: "Your order has been delivered successfully.",
  },
  cancelled: {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    description: "This order was cancelled.",
  },
  returned: {
    label: "Returned",
    color: "bg-red-100 text-red-800 border-red-200",
    icon: XCircle,
    description: "This order was returned.",
  },
};

const getStatus = (status) =>
  STATUS_CONFIG[status] || {
    label: status || "Unknown",
    color: "bg-neutral-100 text-neutral-700 border-neutral-200",
    icon: AlertCircle,
    description: "",
  };

const OrderCard = ({ order }) => {
  const [expanded, setExpanded] = useState(false);

  const items = Array.isArray(order.items) ? order.items : [];
  const statusCfg = getStatus(order.status);
  const StatusIcon = statusCfg.icon;

  const totalAmount = Number(order.totalAmount || 0);
  const storeName = order.store?.name || "Unknown Store";
  const storeSlug = order.store?.slug;

  return (
    <div className="overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm">
      {/* Header */}
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-neutral-950 text-white">
            <Package className="h-6 w-6" />
          </div>
          <div>
            <p className="font-bold text-neutral-950">
              Order #{(order.id || "").slice(0, 8).toUpperCase()}
            </p>
            <p className="mt-0.5 text-sm text-neutral-500">
              {formatDate(order.createdAt)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <span
            className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-bold ${statusCfg.color}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {statusCfg.label}
          </span>
          <span className="text-lg font-bold text-neutral-950">
            {formatCurrency(totalAmount)}
          </span>
        </div>
      </div>

      {/* Store + shipping row */}
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-neutral-100 bg-neutral-50 px-5 py-3 text-sm">
        <span className="flex items-center gap-1.5 font-semibold text-neutral-600">
          <Store className="h-4 w-4" />
          {storeSlug ? (
            <Link
              to={`/store/${storeSlug}`}
              className="text-neutral-950 underline-offset-2 hover:underline"
            >
              {storeName}
            </Link>
          ) : (
            storeName
          )}
        </span>

        {order.shippingCity && (
          <span className="flex items-center gap-1.5 text-neutral-500">
            <Truck className="h-4 w-4" />
            {order.shippingAddress}, {order.shippingCity}
          </span>
        )}
      </div>

      {/* Status message */}
      {statusCfg.description && (
        <div className="border-t border-neutral-100 px-5 py-3 text-sm font-semibold text-neutral-600">
          {statusCfg.description}
        </div>
      )}

      {/* Items toggle */}
      {items.length > 0 && (
        <>
          <button
            onClick={() => setExpanded((p) => !p)}
            className="flex w-full items-center justify-between border-t border-neutral-100 px-5 py-3 text-sm font-bold text-neutral-700 transition hover:bg-neutral-50"
          >
            <span>
              {items.length} item{items.length !== 1 ? "s" : ""}
            </span>
            {expanded ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>

          {expanded && (
            <div className="divide-y divide-neutral-100 border-t border-neutral-100">
              {items.map((item, i) => {
                const unitPrice = Number(item.unitPrice || item.price || 0);
                const qty = Number(item.quantity || 1);
                const productName =
                  item.name || item.product?.name || "Product";
                const image = item.image || item.product?.images?.[0];

                return (
                  <div
                    key={item.id || i}
                    className="flex items-center gap-4 px-5 py-4"
                  >
                    <div className="h-14 w-14 shrink-0 overflow-hidden rounded-2xl bg-neutral-100">
                      {image ? (
                        <img
                          src={image}
                          alt={productName}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-neutral-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold text-neutral-950">
                        {productName}
                      </p>
                      <p className="mt-0.5 text-sm text-neutral-500">
                        {qty} × {formatCurrency(unitPrice)}
                      </p>
                    </div>
                    <p className="shrink-0 font-bold text-neutral-950">
                      {formatCurrency(unitPrice * qty)}
                    </p>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

const CustomerOrders = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await ordersAPI.getMyCustomerOrders();
      const data = Array.isArray(res.data) ? res.data : res.data?.data || [];
      data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      setOrders(data);
    } catch (err) {
      console.error("Failed to load orders:", err);
      setError("Failed to load your orders. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const filtered =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const counts = orders.reduce((acc, o) => {
    acc[o.status] = (acc[o.status] || 0) + 1;
    return acc;
  }, {});

  return (
    <div className="min-h-screen bg-neutral-50 pb-16">
      <div className="mx-auto max-w-4xl px-5 pt-8 lg:px-8">
        {/* Page header */}
        <div className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
            Customer portal
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-neutral-950">
            My Orders
          </h1>
          <p className="mt-2 text-neutral-500">
            Track and review all your purchases.
          </p>
        </div>

        {/* Stats row */}
        {!loading && orders.length > 0 && (
          <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: "Total", value: orders.length, status: "all" },
              { label: "Pending", value: counts.pending || 0, status: "pending" },
              { label: "Completed", value: counts.completed || 0, status: "completed" },
              { label: "Cancelled", value: counts.cancelled || 0, status: "cancelled" },
            ].map((s) => (
              <button
                key={s.status}
                onClick={() => setFilter(s.status)}
                className={`rounded-2xl border p-4 text-left transition ${
                  filter === s.status
                    ? "border-neutral-950 bg-neutral-950 text-white"
                    : "border-neutral-200 bg-white text-neutral-950 hover:border-neutral-400"
                }`}
              >
                <p
                  className={`text-2xl font-bold ${filter === s.status ? "text-white" : "text-neutral-950"}`}
                >
                  {s.value}
                </p>
                <p
                  className={`mt-1 text-xs font-semibold ${filter === s.status ? "text-white/70" : "text-neutral-500"}`}
                >
                  {s.label}
                </p>
              </button>
            ))}
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <AlertCircle className="h-5 w-5 shrink-0" />
            <p className="font-semibold">{error}</p>
          </div>
        )}

        {/* Loading */}
        {loading ? (
          <div className="flex items-center justify-center py-24">
            <div className="text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-neutral-400" />
              <p className="mt-4 text-sm font-semibold text-neutral-500">
                Loading your orders...
              </p>
            </div>
          </div>
        ) : orders.length === 0 ? (
          /* Empty state */
          <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-16 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <ShoppingBag className="h-8 w-8" />
            </div>
            <h2 className="mt-6 text-2xl font-bold text-neutral-950">
              No orders yet
            </h2>
            <p className="mt-2 text-neutral-500">
              Once you place an order it will appear here.
            </p>
            <Link
              to="/stores"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <Store className="h-4 w-4" />
              Browse Stores
            </Link>
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white px-8 py-12 text-center shadow-sm">
            <p className="font-semibold text-neutral-500">
              No {filter} orders found.
            </p>
            <button
              onClick={() => setFilter("all")}
              className="mt-3 text-sm font-bold text-neutral-950 underline underline-offset-2"
            >
              Show all orders
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
