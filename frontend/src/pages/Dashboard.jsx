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
  Eye,
  ExternalLink,
  ArrowUpRight,
  Search,
  Heart,
  Star,
  Bell,
  CreditCard,
  Boxes,
  ClipboardList,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  Tag,
  Users,
} from "lucide-react";
import { storesAPI, productsAPI, ordersAPI } from "../api/api";

const StatCard = ({ icon: Icon, label, value, helper, href, accent = "lime" }) => {
  const accentClasses = {
    lime: "bg-lime-300 text-emerald-950",
    emerald: "bg-emerald-950 text-lime-300",
    white: "bg-white text-emerald-950",
    amber: "bg-amber-200 text-emerald-950",
  };

  return (
    <div className="rounded-[2rem] border border-emerald-950/10 bg-white/80 p-6 shadow-sm backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-xl">
      <div className="flex items-start justify-between gap-4">
        <div className={`flex h-12 w-12 items-center justify-center rounded-2xl ${accentClasses[accent] || accentClasses.lime}`}>
          <Icon className="h-6 w-6" />
        </div>
        {href && (
          <Link to={href} className="rounded-full bg-emerald-50 p-2 text-emerald-950 transition hover:bg-lime-200">
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">{label}</p>
      <p className="mt-2 text-4xl font-black tracking-[-0.05em] text-emerald-950">{value}</p>
      <p className="mt-3 text-sm font-semibold leading-6 text-emerald-950/60">{helper}</p>
    </div>
  );
};

const ActionCard = ({ icon: Icon, title, description, href, primary = false }) => (
  <Link
    to={href}
    className={`group rounded-[2rem] border p-6 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
      primary
        ? "border-lime-300 bg-lime-300 text-emerald-950"
        : "border-emerald-950/10 bg-white/80 text-emerald-950 hover:bg-white"
    }`}
  >
    <div className="flex items-start gap-4">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
        <Icon className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-lg font-black">{title}</h3>
          <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
        </div>
        <p className={`mt-2 text-sm font-semibold leading-6 ${primary ? "text-emerald-950/75" : "text-emerald-950/60"}`}>
          {description}
        </p>
      </div>
    </div>
  </Link>
);

const EmptyState = ({ icon: Icon, title, description, actionLabel, actionHref }) => (
  <div className="rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-8 text-center shadow-sm backdrop-blur">
    <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
      <Icon className="h-8 w-8" />
    </div>
    <h3 className="mt-6 text-2xl font-black tracking-tight text-emerald-950">{title}</h3>
    <p className="mx-auto mt-3 max-w-xl text-base font-semibold leading-7 text-emerald-950/60">{description}</p>
    {actionHref && (
      <Link
        to={actionHref}
        className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
      >
        {actionLabel}
        <ArrowRight className="h-5 w-5" />
      </Link>
    )}
  </div>
);

const emptyVendorStats = {
  totalProducts: 0,
  totalStock: 0,
  lowStockProducts: 0,
  totalOrders: 0,
  pendingOrders: 0,
  deliveredOrders: 0,
  returnedOrders: 0,
};

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
  const [stats, setStats] = useState(emptyVendorStats);

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      if (isVendor()) {
        await fetchVendorStores(isMounted);
      } else {
        await fetchCustomerData(isMounted);
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;

    if (isVendor() && selectedStoreId) {
      fetchSelectedStoreData(selectedStoreId, isMounted);
    }

    return () => {
      isMounted = false;
    };
  }, [selectedStoreId]);

  const fetchCustomerData = async (isMounted = true) => {
    try {
      setLoading(true);
      const response = await storesAPI.getAll();
      const storesData = response.data || response || [];
      if (!isMounted) return;
      setAllStores(storesData);
      setFilteredStores(storesData);
    } catch (error) {
      console.error("Failed to fetch stores:", error);
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  const handleStoreSearch = (e) => {
    const query = e.target.value.toLowerCase();
    setStoreSearchQuery(query);

    const filtered = allStores.filter((store) => {
      const name = store.name?.toLowerCase() || "";
      const description = store.description?.toLowerCase() || "";
      const category = store.category?.toLowerCase() || "";
      return name.includes(query) || description.includes(query) || category.includes(query);
    });

    setFilteredStores(filtered);
  };

  const fetchVendorStores = async (isMounted = true) => {
    try {
      setLoading(true);

      const storesResponse = await storesAPI.getMyStores();
      const storesData = storesResponse.data || storesResponse || [];

      if (!isMounted) return;

      setStores(storesData);

      if (storesData.length === 0) {
        setProducts([]);
        setOrders([]);
        setStats(emptyVendorStats);
        setSelectedStoreId("");
        setLoading(false);
        return;
      }

      setSelectedStoreId((currentSelectedStoreId) =>
        storesData.some((store) => store.id === currentSelectedStoreId)
          ? currentSelectedStoreId
          : storesData.at(0)?.id || "",
      );
    } catch (error) {
      console.error("Failed to fetch vendor stores:", error);
      if (isMounted) setLoading(false);
    }
  };

  const fetchSelectedStoreData = async (storeId, isMounted = true) => {
    try {
      setLoading(true);

      const [productsResponse, ordersResponse] = await Promise.all([
        productsAPI.getByStore(storeId),
        ordersAPI.getByStore(storeId),
      ]);

      const productsData = productsResponse.data || productsResponse || [];
      const ordersData = ordersResponse.data || ordersResponse || [];

      if (!isMounted) return;

      setProducts(productsData);
      setOrders(ordersData);

      const totalStock = productsData.reduce((sum, p) => sum + (Number(p.stock) || 0), 0);
      const lowStockProducts = productsData.filter((p) => p.stock != null && Number(p.stock) <= 5).length;

      const pendingOrders = ordersData.filter((o) => String(o.status).toLowerCase() === "pending").length;
      const deliveredOrders = ordersData.filter((o) => {
        const status = String(o.status).toLowerCase();
        return status === "delivered" || status === "completed";
      }).length;
      const returnedOrders = ordersData.filter((o) => String(o.status).toLowerCase() === "returned").length;

      setStats({
        totalProducts: productsData.length,
        totalStock,
        lowStockProducts,
        totalOrders: ordersData.length,
        pendingOrders,
        deliveredOrders,
        returnedOrders,
      });
    } catch (error) {
      console.error("Failed to fetch selected store data:", error);
      if (isMounted) {
        setProducts([]);
        setOrders([]);
        setStats(emptyVendorStats);
      }
    } finally {
      if (isMounted) setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-950" />
          <p className="mt-4 font-black text-emerald-950">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (isVendor()) {
    const hasStore = stores.length > 0;
    const selectedStore = stores.find((store) => store.id === selectedStoreId) || stores.at(0);

    if (!hasStore) {
      return (
        <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
          <section className="relative overflow-hidden px-6 py-10 lg:px-8">
            <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-lime-300/50 blur-3xl" />
            <div className="absolute bottom-0 right-[-8%] h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />

            <div className="relative mx-auto max-w-7xl">
              <div className="rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.22)] md:p-12">
                <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                  <Sparkles className="h-4 w-4" />
                  First step for vendors
                </div>

                <div className="mt-8 grid items-center gap-10 lg:grid-cols-[1fr_0.8fr]">
                  <div>
                    <h1 className="max-w-4xl text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl">
                      Welcome, {user?.firstName}! Create your first store to start selling.
                    </h1>
                    <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
                      Your vendor account is ready, but you need a storefront before adding products, managing orders, or seeing sales analytics.
                    </p>

                    <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                      <Link
                        to="/create-store"
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
                      >
                        Create Your First Store
                        <ArrowRight className="h-5 w-5" />
                      </Link>
                      <Link
                        to="/my-stores"
                        className="inline-flex items-center justify-center rounded-full border border-white/20 px-8 py-4 font-black text-white transition hover:bg-white/10"
                      >
                        Manage Stores
                      </Link>
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-white p-6 text-emerald-950">
                    <h2 className="text-2xl font-black">Setup checklist</h2>
                    <div className="mt-6 space-y-4">
                      {[
                        ["Create store profile", "Add name, category, logo, banner, and contact details.", Store],
                        ["Add products", "Upload manually or import using Facebook/Instagram links.", Package],
                        ["Enable payments", "Choose bKash, Nagad, SSLCOMMERZ, or COD.", CreditCard],
                        ["Start managing orders", "Track Pending, Confirmed, Shipped, Delivered, and Returned.", ClipboardList],
                      ].map(([title, text, Icon], index) => (
                        <div key={title} className="flex gap-4 rounded-2xl bg-[#f6f1e7] p-4">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-950 text-lime-300">
                            {index === 0 ? <Icon className="h-5 w-5" /> : <span className="text-sm font-black">{index + 1}</span>}
                          </div>
                          <div>
                            <p className="font-black">{title}</p>
                            <p className="mt-1 text-sm font-semibold leading-6 text-emerald-950/60">{text}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-8 grid gap-5 md:grid-cols-3">
                <ActionCard
                  title="Why create a store first?"
                  description="Products, payments, orders, and analytics need a store to connect to."
                  href="/create-store"
                  icon={Store}
                  primary
                />
                <ActionCard
                  title="Import from social pages"
                  description="After store setup, paste Facebook or Instagram links to speed up onboarding."
                  href="/create-store"
                  icon={FileSpreadsheet}
                />
                <ActionCard
                  title="Set up payments later"
                  description="You can enable bKash, Nagad, COD, or SSLCOMMERZ after your store exists."
                  href="/create-store"
                  icon={CreditCard}
                />
              </div>
            </div>
          </section>
        </main>
      );
    }

    return (
      <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
            <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
              <div>
                <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                  <Store className="h-4 w-4" />
                  Seller Dashboard
                </div>
                <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                  Welcome back, {user?.firstName}!
                </h1>
                <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                  Manage your stores, products, inventory, orders, payments, and sales performance.
                </p>
              </div>

              <div className="flex flex-wrap gap-3">
                <Link
                  to="/my-products"
                  className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-6 py-3.5 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
                >
                  <Plus className="h-5 w-5" />
                  Add Product
                </Link>
                <Link
                  to="/my-stores"
                  className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-black text-white transition hover:bg-white/10"
                >
                  <Settings className="h-5 w-5" />
                  Manage Stores
                </Link>
              </div>
            </div>
          </section>

          {selectedStore && (
            <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8">
              <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                    <Store className="h-7 w-7" />
                  </div>
                  <div>
                    <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">Viewing store</p>
                    <h2 className="text-2xl font-black text-emerald-950">{selectedStore.name}</h2>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
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
                      {selectedStore.name}
                    </span>
                  )}
                  {selectedStore.slug && (
                    <Link
                      to={`/store/${selectedStore.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-5 py-3 font-black text-emerald-950 transition hover:bg-lime-200"
                    >
                      View Store
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                  <Link
                    to="/my-stores"
                    className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-5 py-3 font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Edit Details
                    <Settings className="h-4 w-4" />
                  </Link>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <div className="rounded-2xl bg-[#f6f1e7] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-950/50">Store URL</p>
                  <p className="mt-2 truncate font-black">{selectedStore.slug ? `/store/${selectedStore.slug}` : "Not set"}</p>
                </div>
                <div className="rounded-2xl bg-[#f6f1e7] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-950/50">Contact</p>
                  <p className="mt-2 truncate font-black">{selectedStore.phone || "Not set"}</p>
                </div>
                <div className="rounded-2xl bg-[#f6f1e7] p-5">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-950/50">Status</p>
                  <span className="mt-2 inline-flex items-center gap-2 rounded-full bg-lime-300 px-3 py-1.5 text-sm font-black text-emerald-950">
                    <span className="h-2 w-2 rounded-full bg-emerald-950" />
                    Active
                  </span>
                </div>
              </div>
            </section>
          )}

          <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Package} label="Products" value={stats.totalProducts} helper={`Products in ${selectedStore?.name || "this store"}.`} href="/my-products" accent="emerald" />
            <StatCard icon={Boxes} label="Stock Units" value={stats.totalStock} helper={`Across ${stats.totalProducts} product${stats.totalProducts !== 1 ? "s" : ""}.`} href="/my-products" />
            <StatCard icon={AlertTriangle} label="Low Stock" value={stats.lowStockProducts} helper="Products with 5 or fewer units left." href="/my-products" accent="amber" />
            <StatCard icon={ShoppingBag} label="Orders" value={stats.totalOrders} helper={`Orders for ${selectedStore?.name || "this store"}.`} href="/my-orders" accent="white" />
          </section>

          <section className="mt-6 grid gap-5 sm:grid-cols-3">
            <StatCard icon={ClipboardList} label="Pending" value={stats.pendingOrders} helper="Orders waiting for confirmation." href="/my-orders" />
            <StatCard icon={CheckCircle2} label="Delivered" value={stats.deliveredOrders} helper="Completed delivery flow." href="/my-orders" accent="emerald" />
            <StatCard icon={ArrowRight} label="Returned" value={stats.returnedOrders} helper="Orders marked as returned." href="/my-orders" accent="amber" />
          </section>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-3xl font-black tracking-tight text-emerald-950">Next actions</h2>
              <p className="mt-1 font-semibold text-emerald-950/60">Seller tools only. Customer browsing is kept out of this dashboard.</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <ActionCard title="Add Product" description="Create a product with image, price, stock, and description." href="/my-products" icon={Plus} primary />
              <ActionCard title="Manage Inventory" description="Update quantities and fix low-stock products before buyers order." href="/my-products" icon={Boxes} />
              <ActionCard title="Manage Orders" description="Update order statuses from Pending to Delivered or Returned." href="/my-orders" icon={ClipboardList} />
              <ActionCard title="Coupons" description="Create store coupons that customers can apply from their cart." href="/coupons" icon={Tag} />
              <ActionCard title="Bulk Import" description="Import store/product data after your store is already set up." href="/bulk-import" icon={FileSpreadsheet} />
            </div>
          </section>

          <section className="mt-10 grid gap-8 xl:grid-cols-2">
            <div className="rounded-[2rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-emerald-950">Recent Products</h2>
                  <p className="mt-1 text-sm font-semibold text-emerald-950/60">Products in the selected store only.</p>
                </div>
                <Link to="/my-products" className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-900">
                  View all
                </Link>
              </div>

              {products.length === 0 ? (
                <EmptyState
                  icon={Package}
                  title="No products yet"
                  description="No products in this store yet."
                  actionLabel="Add Product"
                  actionHref="/my-products"
                />
              ) : (
                <div className="space-y-3">
                  {products.slice(0, 5).map((product) => (
                    <Link key={product.id} to="/my-products" className="flex items-center justify-between gap-4 rounded-2xl bg-[#f6f1e7] p-4 transition hover:bg-lime-100">
                      <div className="min-w-0">
                        <p className="truncate font-black text-emerald-950">{product.name}</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-950/60">{product.category?.name || product.category || "Uncategorized"}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-black">৳{product.price}</p>
                        <p className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-black ${
                          Number(product.stock) > 10
                            ? "bg-lime-300 text-emerald-950"
                            : Number(product.stock) > 0
                              ? "bg-amber-200 text-emerald-950"
                              : "bg-red-100 text-red-700"
                        }`}>
                          Stock {product.stock ?? 0}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className="rounded-[2rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-black text-emerald-950">Recent Orders</h2>
                  <p className="mt-1 text-sm font-semibold text-emerald-950/60">Orders for the selected store only.</p>
                </div>
                <Link to="/my-orders" className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-black text-white transition hover:bg-emerald-900">
                  View all
                </Link>
              </div>

              {orders.length === 0 ? (
                <EmptyState
                  icon={ShoppingBag}
                  title="No orders yet"
                  description="No orders for this store yet."
                  actionLabel="View Store"
                  actionHref={selectedStore?.slug ? `/store/${selectedStore.slug}` : "/my-stores"}
                />
              ) : (
                <div className="space-y-3">
                  {orders.slice(0, 5).map((order) => (
                    <Link key={order.id} to="/my-orders" className="flex items-center justify-between gap-4 rounded-2xl bg-[#f6f1e7] p-4 transition hover:bg-lime-100">
                      <div>
                        <p className="font-black text-emerald-950">#{order.orderNumber || order.id}</p>
                        <p className="mt-1 text-sm font-semibold text-emerald-950/60">
                          {order.customerInfo?.firstName || "Customer"} {order.customerInfo?.lastName || ""}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-black">৳{order.total}</p>
                        <p className="mt-1 inline-flex rounded-full bg-lime-300 px-2.5 py-1 text-xs font-black capitalize text-emerald-950">
                          {order.status}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <ShoppingBag className="h-4 w-4" />
                Customer Dashboard
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Welcome back, {user?.firstName}!
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                Discover stores, follow sellers, track orders, save favorites, and review purchases.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 text-emerald-950">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">Quick search</p>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-950/40" />
                <input
                  type="text"
                  placeholder="Search stores by name, category, or product type..."
                  value={storeSearchQuery}
                  onChange={handleStoreSearch}
                  className="block w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] py-4 pl-12 pr-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                />
              </div>
            </div>
          </div>
        </section>

        {storeSearchQuery && (
          <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8">
            <h2 className="text-2xl font-black">
              {filteredStores.length} store{filteredStores.length !== 1 ? "s" : ""} found
            </h2>

            {filteredStores.length > 0 ? (
              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredStores.map((store) => (
                  <Link
                    key={store.id}
                    to={`/store/${store.slug}`}
                    className="group rounded-[2rem] border border-emerald-950/10 bg-[#f6f1e7] p-5 transition hover:-translate-y-1 hover:bg-lime-100 hover:shadow-xl"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                        <Building2 className="h-6 w-6" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-black">{store.name}</h3>
                        <p className="truncate text-sm font-semibold text-emerald-950/60">
                          {store.description || store.category || "Shoplinker store"}
                        </p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="py-8 text-center font-semibold text-emerald-950/60">
                No stores found matching "{storeSearchQuery}"
              </p>
            )}
          </section>
        )}

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <ActionCard title="Browse Stores" description="Discover local sellers and visit their storefronts to shop products." href="/stores" icon={Building2} primary />
          <ActionCard title="Followed Stores" description="View the stores you follow and unfollow sellers when your list is full." href="/followed-stores" icon={Heart} />
          <ActionCard title="Wishlist" description="Save products from store pages that you want to buy later." href="/wishlist" icon={Heart} />
          <ActionCard title="My Orders" description="Track purchases, delivery status, and returns." href="/customer-orders" icon={ClipboardList} />
        </section>

        <section className="mt-10 grid gap-8 lg:grid-cols-2">
          <div className="rounded-[2rem] border border-emerald-950/10 bg-white/85 p-8 shadow-sm backdrop-blur">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950">
              <Search className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight">Find stores faster</h2>
            <p className="mt-3 font-semibold leading-7 text-emerald-950/60">
              Search stores by name, category, or seller, then visit storefronts to see their products.
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              {["T-shirts", "Beauty", "Gadgets", "Food", "Fashion"].map((item) => (
                <Link key={item} to="/stores" className="rounded-full bg-[#f6f1e7] px-4 py-2 text-sm font-black transition hover:bg-lime-200">
                  {item}
                </Link>
              ))}
            </div>
          </div>

          <div className="rounded-[2rem] border border-emerald-950/10 bg-white/85 p-8 shadow-sm backdrop-blur">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
              <Users className="h-7 w-7" />
            </div>
            <h2 className="mt-6 text-3xl font-black tracking-tight">Follow stores you love</h2>
            <p className="mt-3 font-semibold leading-7 text-emerald-950/60">
              Follow sellers, receive discount updates, get stock notifications, and leave reviews after confirmed purchases.
            </p>
            <div className="mt-6 grid gap-3 sm:grid-cols-3">
              {[
                ["Discounts", Tag],
                ["Updates", Bell],
                ["Reviews", Star],
              ].map(([label, Icon]) => (
                <div key={label} className="rounded-2xl bg-[#f6f1e7] p-4">
                  <Icon className="h-5 w-5" />
                  <p className="mt-2 font-black">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
};

export default Dashboard;
