import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { Link } from "react-router-dom";
import {
  Store,
  Package,
  ShoppingBag,
  Building2,
  Plus,
  Settings,
  Loader2,
  FileSpreadsheet,
  TrendingUp,
  DollarSign,
  Eye,
  ExternalLink,
  BarChart3,
  ArrowUpRight,
  Search,
} from "lucide-react";
import { storesAPI, productsAPI, ordersAPI } from "../api/api";

const Dashboard = () => {
  const { user, isVendor } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [storeSearchQuery, setStoreSearchQuery] = useState("");
  const [allStores, setAllStores] = useState([]);
  const [filteredStores, setFilteredStores] = useState([]);
  const [stats, setStats] = useState({
    totalProducts: 0,
    publishedProducts: 0,
    draftProducts: 0,
    totalStock: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
  });

  useEffect(() => {
    if (isVendor()) {
      fetchVendorData();
    } else {
      fetchAllStores();
      setLoading(false);
    }
  }, []);

  const fetchAllStores = async () => {
    try {
      const response = await storesAPI.getAll();
      const storesData = response.data || response;
      setAllStores(storesData);
      setFilteredStores(storesData);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    }
  };

  const handleStoreSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setStoreSearchQuery(query);
    const filtered = allStores.filter((store) =>
      store.name.toLowerCase().includes(query),
    );
    setFilteredStores(filtered);
  };

  const fetchVendorData = async (storeId = "") => {
    try {
      setLoading(true);
      const storesResponse = await storesAPI.getMyStores();

      const storesData = storesResponse.data || storesResponse;
      const nextSelectedStoreId =
        storeId ||
        (storesData.some((store) => store.id === selectedStoreId)
          ? selectedStoreId
          : storesData.at(0)?.id || "");

      setStores(storesData);
      setSelectedStoreId(nextSelectedStoreId);

      let productsData = [];
      let ordersData = [];

      if (nextSelectedStoreId) {
        const productsResponse = await productsAPI.getByStore(nextSelectedStoreId);
        productsData = productsResponse.data || productsResponse;

        try {
          const ordersResponse = await ordersAPI.getByStore(nextSelectedStoreId);
          ordersData = ordersResponse.data || ordersResponse;
        } catch (error) {
          console.error("Failed to fetch orders:", error);
        }
      }

      setProducts(productsData);
      setOrders(ordersData);

      // Calculate stats
      const totalStock = productsData.reduce(
        (sum, p) => sum + (p.stock || 0),
        0,
      );
      const pendingOrders = ordersData.filter(
        (o) => o.status === "pending",
      ).length;
      const completedOrders = ordersData.filter(
        (o) => o.status === "completed",
      ).length;

      setStats({
        totalProducts: productsData.length,
        publishedProducts: productsData.length, // Backend doesn't have status field yet
        draftProducts: 0,
        totalStock: totalStock,
        totalOrders: ordersData.length,
        pendingOrders: pendingOrders,
        completedOrders: completedOrders,
      });
    } catch (error) {
      console.error("Failed to fetch vendor data:", error);
    } finally {
      setLoading(false);
    }
  };

  // Vendor Dashboard
  if (isVendor()) {
    if (loading) {
      return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
        </div>
      );
    }

    const selectedStore = stores.find((store) => store.id === selectedStoreId) || stores.at(0);

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
                    Seller Dashboard
                  </span>
                </div>
                <h1 className="text-4xl font-bold text-slate-900 mb-2">
                  Welcome back, {user?.firstName}! 👋
                </h1>
                <p className="text-slate-600 text-lg">
                  Manage your store, add products, and keep your storefront
                  updated.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/my-products"
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3.5 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  <Plus className="h-5 w-5" />
                  Add Product
                </Link>
                <Link
                  to="/my-stores"
                  className="inline-flex items-center gap-2 rounded-lg border-2 border-slate-200 bg-white px-6 py-3.5 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:bg-slate-50 hover:border-slate-300 hover:shadow-md"
                >
                  <Settings className="h-5 w-5" />
                  Manage Stores
                </Link>
              </div>
            </div>
          </div>

          {/* Store Info Section */}
          {selectedStore && (
            <section className="mb-8 rounded-2xl bg-white p-8 border border-slate-200 shadow-md">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-600 text-white">
                    <Store className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-900">
                      Viewing store: {selectedStore.name}
                    </h2>
                    <p className="text-sm text-slate-600">
                      Dashboard stats are scoped to this store
                    </p>
                  </div>
                </div>
                {stores.length > 1 && (
                  <select
                    value={selectedStoreId}
                    onChange={(e) => fetchVendorData(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-4 py-3 font-semibold text-slate-900"
                  >
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                )}
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <div className="rounded-xl p-5 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Store Name
                  </p>
                  <p className="text-lg font-semibold text-slate-900 truncate">
                    {selectedStore.name}
                  </p>
                </div>
                <div className="rounded-xl p-5 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Store URL
                  </p>
                  {selectedStore.slug ? (
                    <Link
                      to={`/store/${selectedStore.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1 transition"
                    >
                      <span className="truncate">/{selectedStore.slug}</span>
                      <ExternalLink className="h-3.5 w-3.5 flex-shrink-0" />
                    </Link>
                  ) : (
                    <p className="text-sm font-semibold text-slate-400">
                      Not set
                    </p>
                  )}
                </div>
                <div className="rounded-xl p-5 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Contact
                  </p>
                  <p className="text-sm font-semibold text-slate-900">
                    {selectedStore.phone || "Not set"}
                  </p>
                </div>
                <div className="rounded-xl p-5 border border-slate-200 shadow-sm transition-all duration-200 hover:shadow-md">
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
                    Status
                  </p>
                  <span className="inline-flex items-center gap-2 rounded-full bg-green-50 px-3 py-1.5 text-sm font-semibold text-green-700 border border-green-200">
                    <span className="h-1.5 w-1.5 rounded-full bg-green-600"></span>
                    Active
                  </span>
                </div>
              </div>
            </section>
          )}

          {/* Stats Section */}
          <section className="mb-8">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-4 mb-6">
              {/* Total Products Card */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <TrendingUp className="h-3 w-3" />
                    <span>Active</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Total Products
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-4">
                  {stats.totalProducts}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <Link
                    to="/my-products"
                    className="text-sm font-semibold text-blue-600 hover:text-blue-700 inline-flex items-center gap-1"
                  >
                    Manage <ArrowUpRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              {/* Published Products Card */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Eye className="h-3 w-3" />
                    <span>Live</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Published
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-4">
                  {stats.publishedProducts}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    {stats.totalProducts > 0
                      ? Math.round(
                          (stats.publishedProducts / stats.totalProducts) * 100,
                        )
                      : 0}
                    % of total
                  </p>
                </div>
              </div>

              {/* Draft Products Card */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-orange-50 text-orange-600">
                    <Store className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-orange-600 bg-orange-50 px-2 py-1 rounded-full">
                    <BarChart3 className="h-3 w-3" />
                    <span>Pending</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Draft Products
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-4">
                  {stats.draftProducts}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">Ready to publish</p>
                </div>
              </div>

              {/* Total Stock Card */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-50 text-purple-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded-full">
                    <DollarSign className="h-3 w-3" />
                    <span>Inventory</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Stock Units
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-4">
                  {stats.totalStock}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Across {stats.totalProducts} products
                  </p>
                </div>
              </div>
            </div>

            {/* Orders Stats Row */}
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {/* Total Orders Card */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
                    <BarChart3 className="h-3 w-3" />
                    <span>Orders</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Total Orders
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-4">
                  {stats.totalOrders}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">All time orders</p>
                </div>
              </div>

              {/* Pending Orders Card */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-yellow-50 text-yellow-600">
                    <Package className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-yellow-600 bg-yellow-50 px-2 py-1 rounded-full">
                    <BarChart3 className="h-3 w-3" />
                    <span>Pending</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Pending Orders
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-4">
                  {stats.pendingOrders}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">Awaiting fulfillment</p>
                </div>
              </div>

              {/* Completed Orders Card */}
              <div className="rounded-2xl bg-white p-6 border border-slate-200 shadow-md transition-all duration-200 hover:shadow-lg">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-50 text-green-600">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  <div className="flex items-center gap-1 text-xs font-semibold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                    <Eye className="h-3 w-3" />
                    <span>Completed</span>
                  </div>
                </div>
                <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  Completed Orders
                </p>
                <p className="text-4xl font-bold text-slate-900 mb-4">
                  {stats.completedOrders}
                </p>
                <div className="pt-4 border-t border-slate-200">
                  <p className="text-sm text-slate-600">
                    Successfully fulfilled
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions */}
          <section className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-slate-900">
                Quick Actions
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Choose an action to get started
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                {
                  title: "Add Product",
                  description:
                    "Create a new product with image, price, stock, and description.",
                  href: "/my-products",
                  icon: Plus,
                  bg: "bg-blue-50",
                  text: "text-blue-600",
                },
                {
                  title: "Bulk Import",
                  description:
                    "Import multiple stores and products from Excel file at once.",
                  href: "/bulk-import",
                  icon: FileSpreadsheet,
                  bg: "bg-green-50",
                  text: "text-green-600",
                },
                {
                  title: "Manage Products",
                  description:
                    "View, edit, publish, or remove products from your store.",
                  href: "/my-products",
                  icon: Package,
                  bg: "bg-purple-50",
                  text: "text-purple-600",
                },
                {
                  title: "Manage Stores",
                  description:
                    "Update store name, address, contact info, and store details.",
                  href: "/my-stores",
                  icon: Store,
                  bg: "bg-orange-50",
                  text: "text-orange-600",
                },
                {
                  title: "Browse All Products",
                  description:
                    "Explore products from all vendors on the platform.",
                  href: "/products",
                  icon: ShoppingBag,
                  bg: "bg-indigo-50",
                  text: "text-indigo-600",
                },
              ].map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.title}
                    to={action.href}
                    className="group rounded-3xl bg-white p-6 border border-slate-200 hover:border-slate-300 transition-colors"
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`flex h-12 w-12 items-center justify-center rounded-xl ${action.bg} ${action.text} flex-shrink-0`}
                      >
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-lg font-bold text-slate-900 mb-1">
                          {action.title}
                        </h3>
                        <p className="text-sm text-slate-600 leading-relaxed">
                          {action.description}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Recent Products */}
          {products.length > 0 && (
            <section className="mt-10 rounded-3xl bg-white p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Recent Products
                </h2>
                <Link
                  to="/my-products"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Product
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Price
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Stock
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Category
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.slice(0, 5).map((product) => (
                      <tr
                        key={product.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 font-semibold text-slate-900">
                          {product.name}
                        </td>
                        <td className="py-4 text-slate-700 font-medium">
                          ৳{product.price}
                        </td>
                        <td className="py-4 text-slate-700">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              product.stock > 10
                                ? "bg-green-100 text-green-800"
                                : product.stock > 0
                                  ? "bg-yellow-100 text-yellow-800"
                                  : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">
                          {product.category || "Uncategorized"}
                        </td>
                        <td className="py-4">
                          <Link
                            to="/my-products"
                            className="inline-flex items-center gap-1 text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                          >
                            Manage
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 5l7 7-7 7"
                              />
                            </svg>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Recent Orders */}
          {orders.length > 0 && (
            <section className="mt-10 rounded-3xl bg-white p-8 border border-slate-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  Recent Orders
                </h2>
                <Link
                  to="/my-orders"
                  className="text-sm font-semibold text-blue-600 hover:text-blue-700 transition-colors"
                >
                  View all →
                </Link>
              </div>

              <div className="overflow-x-auto">
                <table className="min-w-full">
                  <thead>
                    <tr className="border-b border-slate-200">
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Order #
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Customer
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Items
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Total
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Status
                      </th>
                      <th className="pb-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
                        Date
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.slice(0, 5).map((order) => (
                      <tr
                        key={order.id}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="py-4 font-semibold text-slate-900">
                          #{order.orderNumber}
                        </td>
                        <td className="py-4 text-slate-700">
                          {order.customerInfo.firstName}{" "}
                          {order.customerInfo.lastName}
                        </td>
                        <td className="py-4 text-slate-700">
                          {order.items.length} item
                          {order.items.length !== 1 ? "s" : ""}
                        </td>
                        <td className="py-4 text-slate-700 font-medium">
                          ৳{order.total}
                        </td>
                        <td className="py-4">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                              order.status === "completed"
                                ? "bg-green-100 text-green-800"
                                : order.status === "pending"
                                  ? "bg-yellow-100 text-yellow-800"
                                  : order.status === "processing"
                                    ? "bg-blue-100 text-blue-800"
                                    : "bg-red-100 text-red-800"
                            }`}
                          >
                            {order.status}
                          </span>
                        </td>
                        <td className="py-4 text-slate-600">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}
        </div>
      </div>
    );
  }

  // Customer Dashboard
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
        <div className="mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Welcome back, {user?.firstName}! 👋
          </h1>
          <p className="text-lg text-slate-600">
            Explore products and stores from all vendors
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8">
          <div className="relative max-w-xl">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Search stores by name..."
              value={storeSearchQuery}
              onChange={handleStoreSearch}
              className="block w-full pl-12 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm"
            />
          </div>
        </div>

        {/* Store Results */}
        {storeSearchQuery && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-slate-900 mb-4">
              {filteredStores.length} store
              {filteredStores.length !== 1 ? "s" : ""} found
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {filteredStores.map((store) => (
                <Link
                  key={store.id}
                  to={`/store/${store.slug}`}
                  className="group rounded-2xl border border-slate-200 bg-white p-6 hover:border-slate-300 hover:shadow-md transition-all"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-slate-900 truncate">
                        {store.name}
                      </h3>
                      {store.description && (
                        <p className="text-sm text-slate-600 truncate">
                          {store.description}
                        </p>
                      )}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
            {filteredStores.length === 0 && (
              <p className="text-slate-600 text-center py-8">
                No stores found matching "{storeSearchQuery}"
              </p>
            )}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-2 max-w-4xl">
          <Link
            to="/products"
            className="group rounded-3xl border border-slate-200 bg-white p-8 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <ShoppingBag className="h-6 w-6" />
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Browse
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Browse Products
            </h3>
            <p className="text-slate-600 leading-7">
              Explore products from all vendors
            </p>
          </Link>

          <Link
            to="/stores"
            className="group rounded-3xl border border-slate-200 bg-white p-8 hover:border-slate-300 transition-colors"
          >
            <div className="flex items-start justify-between mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
                <Building2 className="h-6 w-6" />
              </div>
              <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600">
                Discover
              </div>
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-3">
              Browse Stores
            </h3>
            <p className="text-slate-600 leading-7">
              Discover stores and vendors in our marketplace
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
