import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ordersAPI, storesAPI } from "../api/api";
import {
  Package,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
} from "lucide-react";

const MyOrders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStore, setSelectedStore] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [updatingOrder, setUpdatingOrder] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (stores.length > 0) {
      if (!selectedStore) {
        setSelectedStore(stores[0].id);
      }
      fetchOrders();
    }
  }, [stores, selectedStore, statusFilter]);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getMyStores();
      const storesData = response.data || response;
      setStores(storesData);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  };

  const fetchOrders = async () => {
    if (!selectedStore) return;

    try {
      setLoading(true);
      const response = await ordersAPI.getByStore(selectedStore);
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
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      setUpdatingOrder(orderId);
      await ordersAPI.updateStatus(orderId, { status: newStatus });

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
        return "bg-yellow-100 text-yellow-800";
      case "processing":
        return "bg-blue-100 text-blue-800";
      case "shipped":
        return "bg-purple-100 text-purple-800";
      case "completed":
        return "bg-green-100 text-green-800";
      case "cancelled":
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
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading && stores.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header */}
        <div className="rounded-2xl bg-white border border-slate-200 p-8 mb-8 shadow-md">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex-1">
              <div className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 mb-4">
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <span className="text-sm font-semibold text-blue-700 uppercase tracking-wider">
                  Order Management
                </span>
              </div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">
                Manage Your Orders
              </h1>
              <p className="text-slate-600 text-lg">
                View and manage all orders for your stores.
              </p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="rounded-2xl bg-white border border-slate-200 p-6 mb-8 shadow-md">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Select Store
              </label>
              <select
                value={selectedStore}
                onChange={(e) => setSelectedStore(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Filter by Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full md:w-64 px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">All Orders</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        </div>

        {/* Orders List */}
        {loading ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-md">
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="rounded-2xl bg-white border border-slate-200 p-8 shadow-md">
            <div className="text-center py-12">
              <Package className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No orders found
              </h3>
              <p className="text-slate-600">
                {statusFilter === "all"
                  ? "You haven't received any orders yet."
                  : `No ${statusFilter} orders found.`}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-2xl bg-white border border-slate-200 p-6 shadow-md"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-slate-600">
                        {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status}
                    </span>
                  </div>
                </div>

                {/* Customer Info */}
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <div className="rounded-xl bg-slate-50 p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Customer Information
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        <strong>Name:</strong> {order.customerInfo.firstName}{" "}
                        {order.customerInfo.lastName}
                      </p>
                      <p>
                        <strong>Email:</strong> {order.customerInfo.email}
                      </p>
                      <p>
                        <strong>Phone:</strong> {order.customerInfo.phone}
                      </p>
                      <p>
                        <strong>Address:</strong> {order.customerInfo.address},{" "}
                        {order.customerInfo.city},{" "}
                        {order.customerInfo.postalCode}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">
                      Order Summary
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p>
                        <strong>Items:</strong> {order.items.length}
                      </p>
                      <p>
                        <strong>Payment:</strong>{" "}
                        {order.paymentMethod.toUpperCase()}
                      </p>
                      <p>
                        <strong>Total:</strong> ৳{order.total}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div className="mb-6">
                  <h4 className="font-semibold text-slate-900 mb-3">
                    Order Items
                  </h4>
                  <div className="space-y-3">
                    {order.items.map((item, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-4 p-3 rounded-lg bg-slate-50"
                      >
                        {item.image && (
                          <img
                            src={item.image}
                            alt={item.name}
                            className="h-12 w-12 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            Quantity: {item.quantity}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          ৳{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                  <div className="text-sm text-slate-600">
                    <strong>Subtotal:</strong> ৳{order.subtotal} |{" "}
                    <strong>Shipping:</strong> ৳{order.shipping} |{" "}
                    <strong>Tax:</strong> ৳{order.tax}
                  </div>
                  <div className="flex gap-2">
                    {order.status === "pending" && (
                      <button
                        onClick={() =>
                          updateOrderStatus(order.id, "processing")
                        }
                        disabled={updatingOrder === order.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50"
                      >
                        {updatingOrder === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                        Process Order
                      </button>
                    )}
                    {order.status === "processing" && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "shipped")}
                        disabled={updatingOrder === order.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600 text-white text-sm font-semibold rounded-lg hover:bg-purple-700 disabled:opacity-50"
                      >
                        {updatingOrder === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Package className="h-4 w-4" />
                        )}
                        Mark as Shipped
                      </button>
                    )}
                    {(order.status === "processing" ||
                      order.status === "shipped") && (
                      <button
                        onClick={() => updateOrderStatus(order.id, "completed")}
                        disabled={updatingOrder === order.id}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white text-sm font-semibold rounded-lg hover:bg-green-700 disabled:opacity-50"
                      >
                        {updatingOrder === order.id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        Mark as Completed
                      </button>
                    )}
                    {order.status !== "completed" &&
                      order.status !== "cancelled" && (
                        <button
                          onClick={() =>
                            updateOrderStatus(order.id, "cancelled")
                          }
                          disabled={updatingOrder === order.id}
                          className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white text-sm font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50"
                        >
                          {updatingOrder === order.id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <XCircle className="h-4 w-4" />
                          )}
                          Cancel Order
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
