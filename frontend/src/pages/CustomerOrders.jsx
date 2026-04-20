import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { ordersAPI } from "../api/api";
import {
  Package,
  CheckCircle,
  XCircle,
  Clock,
  Loader2,
  AlertCircle,
  ShoppingBag,
  MapPin,
  CreditCard,
} from "lucide-react";

const CustomerOrders = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchOrders();
  }, [statusFilter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const response = await ordersAPI.getMyOrders();
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

  const getStatusColor = (status) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "confirmed":
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
      case "confirmed":
        return <CheckCircle className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  if (loading) {
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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">
            My Orders
          </h1>
          <p className="text-lg text-slate-600">
            Track and view all your orders
          </p>
        </div>

        {/* Filter */}
        <div className="rounded-xl bg-white border border-slate-200 p-6 mb-8 shadow-sm">
          <div className="max-w-xs">
            <label className="block text-sm font-semibold text-slate-700 mb-2">
              Filter by Status
            </label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Orders</option>
              <option value="pending">Pending</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
        </div>

        {/* Orders List */}
        {orders.length === 0 ? (
          <div className="rounded-xl bg-white border border-slate-200 p-8 shadow-sm">
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 text-slate-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-900 mb-2">
                No orders found
              </h3>
              <p className="text-slate-600 mb-6">
                {statusFilter === "all"
                  ? "You haven't placed any orders yet."
                  : `No ${statusFilter} orders found.`}
              </p>
              <a
                href="/stores"
                className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700"
              >
                <ShoppingBag className="h-5 w-5" />
                Start Shopping
              </a>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            {orders.map((order) => (
              <div
                key={order.id}
                className="rounded-xl bg-white border border-slate-200 p-6 shadow-sm"
              >
                {/* Order Header */}
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Package className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-slate-900">
                        Order #{order.orderNumber}
                      </h3>
                      <p className="text-sm text-slate-600">
                        Placed on {new Date(order.createdAt).toLocaleDateString()} at{" "}
                        {new Date(order.createdAt).toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-sm font-semibold ${getStatusColor(order.status)}`}
                    >
                      {getStatusIcon(order.status)}
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </span>
                  </div>
                </div>

                {/* Store Info */}
                {order.store && (
                  <div className="mb-6 rounded-lg bg-slate-50 p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
                        <ShoppingBag className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm text-slate-600">Ordered from</p>
                        <p className="font-semibold text-slate-900">{order.store.name}</p>
                      </div>
                    </div>
                  </div>
                )}

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
                            className="h-16 w-16 rounded-lg object-cover"
                          />
                        )}
                        <div className="flex-1">
                          <p className="font-medium text-slate-900">
                            {item.name}
                          </p>
                          <p className="text-sm text-slate-600">
                            Quantity: {item.quantity} × ৳{item.price}
                          </p>
                        </div>
                        <p className="font-semibold text-slate-900">
                          ৳{item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Summary */}
                <div className="grid gap-4 md:grid-cols-2 mb-6">
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Delivery Address
                    </h4>
                    <div className="space-y-1 text-sm text-slate-600">
                      <p className="font-medium text-slate-900">
                        {order.customerInfo.firstName} {order.customerInfo.lastName}
                      </p>
                      <p>{order.customerInfo.address}</p>
                      <p>
                        {order.customerInfo.city}, {order.customerInfo.postalCode}
                      </p>
                      <p className="pt-2">
                        <strong>Phone:</strong> {order.customerInfo.phone}
                      </p>
                    </div>
                  </div>
                  <div className="rounded-lg bg-slate-50 p-4">
                    <h4 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Payment Details
                    </h4>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Subtotal:</span>
                        <span className="font-medium text-slate-900">৳{order.subtotal}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Shipping:</span>
                        <span className="font-medium text-slate-900">৳{order.shipping}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Tax:</span>
                        <span className="font-medium text-slate-900">৳{order.tax}</span>
                      </div>
                      <div className="flex justify-between pt-2 border-t border-slate-200">
                        <span className="font-semibold text-slate-900">Total:</span>
                        <span className="font-bold text-blue-600 text-lg">৳{order.total}</span>
                      </div>
                      <div className="pt-2">
                        <span className="inline-flex items-center gap-1 text-xs font-medium text-slate-700">
                          Payment Method: <span className="uppercase font-semibold">{order.paymentMethod}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Order Status Message */}
                <div className="rounded-lg bg-blue-50 border border-blue-200 p-4">
                  <p className="text-sm text-blue-900">
                    {order.status === "pending" && "Your order has been received and is awaiting confirmation from the vendor."}
                    {order.status === "confirmed" && "Your order has been confirmed and will be delivered soon!"}
                    {order.status === "cancelled" && "This order has been cancelled."}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CustomerOrders;
