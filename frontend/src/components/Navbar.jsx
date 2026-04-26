import { useState, useEffect, useRef, useCallback } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  LogOut,
  User,
  AlertTriangle,
  CheckCircle2,
  Menu,
  X,
  Store,
  Package,
  Building2,
  Heart,
  ClipboardList,
  LayoutDashboard,
} from "lucide-react";
import { productsAPI, notificationsAPI } from "../api/api";

const baseLink =
  "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-black transition hover:bg-white/70";

const activeLink =
  "bg-white text-emerald-950 shadow-sm";

const inactiveLink =
  "text-emerald-950/70 hover:text-emerald-950";

const getNavClass = ({ isActive }) =>
  `${baseLink} ${isActive ? activeLink : inactiveLink}`;

const Navbar = () => {
  const { user, logout, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const prevLowStockCount = useRef(0);

  const vendor = isAuthenticated && isVendor();

  const handleLogout = () => {
    logout();
    setMobileOpen(false);
    navigate("/login");
  };

  const playAlertSound = () => {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;

      const audioCtx = new AudioContext();
      const oscillator = audioCtx.createOscillator();
      const gain = audioCtx.createGain();

      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(880, audioCtx.currentTime);
      gain.gain.setValueAtTime(0.03, audioCtx.currentTime);

      oscillator.connect(gain);
      gain.connect(audioCtx.destination);
      oscillator.start();
      oscillator.stop(audioCtx.currentTime + 0.12);
      oscillator.onended = () => audioCtx.close();
    } catch (error) {
      console.warn("Low stock alert sound blocked or unavailable", error);
    }
  };

  const fetchLowStockProducts = async () => {
    try {
      const response = await productsAPI.getMyProducts();
      const products = response.data || response || [];
      const lowStock = products.filter(
        (product) => product.stock != null && Number(product.stock) <= 5,
      );

      setProductCount(products.length);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("Failed to load low stock products:", error);
    }
  };

  const fetchUnreadNotifications = useCallback(async () => {
    if (!isAuthenticated || !user?.id || vendor) {
      setUnreadNotificationsCount(0);
      return;
    }

    try {
      const response = await notificationsAPI.getByBuyer(user.id);
      const items = response.data || response || [];
      const unreadCount = items.filter((item) => !item.isRead).length;
      setUnreadNotificationsCount(unreadCount);
    } catch (error) {
      console.error("Failed to load notifications:", error);
    }
  }, [isAuthenticated, user?.id, vendor]);

  useEffect(() => {
    setShowNotifications(false);
    setMobileOpen(false);

    if (vendor) {
      fetchLowStockProducts();
    } else {
      setLowStockProducts([]);
      setProductCount(0);
    }
  }, [vendor, location.pathname]);

  useEffect(() => {
    if (!vendor) return;

    fetchLowStockProducts();

    const intervalId = window.setInterval(fetchLowStockProducts, 5000);

    const handleFocus = () => fetchLowStockProducts();
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        fetchLowStockProducts();
      }
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [vendor]);

  useEffect(() => {
    if (!isAuthenticated || vendor || !user?.id) {
      setUnreadNotificationsCount(0);
      return;
    }

    fetchUnreadNotifications();
    const intervalId = window.setInterval(fetchUnreadNotifications, 10000);

    const handleRefresh = () => fetchUnreadNotifications();
    const handleFocus = () => fetchUnreadNotifications();

    window.addEventListener("notifications:updated", handleRefresh);
    window.addEventListener("focus", handleFocus);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("notifications:updated", handleRefresh);
      window.removeEventListener("focus", handleFocus);
    };
  }, [isAuthenticated, vendor, user?.id, fetchUnreadNotifications]);

  useEffect(() => {
    if (lowStockProducts.length > 0 && prevLowStockCount.current === 0) {
      playAlertSound();
    }

    prevLowStockCount.current = lowStockProducts.length;
  }, [lowStockProducts]);

  const guestLinks = [
    { label: "Browse Stores", to: "/stores", icon: Building2 },
  ];

  const customerLinks = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "Browse Stores", to: "/stores", icon: Building2 },
    { label: "Notifications", to: "/notifications", icon: Bell },
    { label: "Wishlist", to: "/wishlist", icon: Heart },
    { label: "Orders", to: "/my-orders", icon: ClipboardList },
  ];

  const vendorLinks = [
    { label: "Dashboard", to: "/dashboard", icon: LayoutDashboard },
    { label: "My Stores", to: "/my-stores", icon: Store },
    { label: "Products", to: "/my-products", icon: Package },
    { label: "Orders", to: "/my-orders", icon: ClipboardList },
  ];

  const navLinks = !isAuthenticated ? guestLinks : vendor ? vendorLinks : customerLinks;

  const logoTarget = isAuthenticated ? "/dashboard" : "/";

  const renderLinks = (mobile = false) =>
    navLinks.map((link) => {
      const Icon = link.icon;

      return (
        <NavLink
          key={link.to}
          to={link.to}
          onClick={() => mobile && setMobileOpen(false)}
          className={({ isActive }) =>
            mobile
              ? `flex items-center gap-3 rounded-2xl px-4 py-3 font-black transition ${
                  isActive
                    ? "bg-lime-300 text-emerald-950"
                    : "bg-white/70 text-emerald-950/75 hover:bg-white hover:text-emerald-950"
                }`
              : getNavClass({ isActive })
          }
        >
          <Icon className="h-4 w-4" />
          {link.label}
        </NavLink>
      );
    });

  return (
    <nav className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#f6f1e7]/90 backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 lg:px-8">
        <Link to={logoTarget} className="flex items-center gap-3">
          <img src="/shoplinker.svg" alt="Shoplinker" className="h-9 w-auto" />
        </Link>

        <div className="hidden items-center gap-2 lg:flex">{renderLinks()}</div>

        <div className="hidden items-center gap-3 lg:flex">
          {isAuthenticated ? (
            <>
              {vendor && (
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowNotifications((prev) => !prev)}
                    className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-950 shadow-sm ring-1 ring-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-lime-100"
                    aria-label="Low stock notifications"
                  >
                    <Bell className="h-5 w-5" />
                    {lowStockProducts.length > 0 && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-300 px-1 text-[11px] font-black text-emerald-950 ring-2 ring-[#f6f1e7]">
                        {lowStockProducts.length}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 z-50 mt-3 w-84 rounded-[2rem] border border-emerald-950/10 bg-white p-4 shadow-[0_24px_70px_rgba(8,28,21,0.18)]">
                      <div className="mb-3 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2 text-sm font-black text-emerald-950">
                          <AlertTriangle className="h-4 w-4 text-amber-600" />
                          Low Stock Alerts
                        </div>
                        <button
                          type="button"
                          onClick={() => setShowNotifications(false)}
                          className="rounded-full p-1 text-emerald-950/50 transition hover:bg-emerald-50 hover:text-emerald-950"
                          aria-label="Close notifications"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>

                      {productCount === 0 ? (
                        <div className="flex items-center gap-2 rounded-2xl bg-[#f6f1e7] p-3 text-sm font-semibold text-emerald-950/70">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          You do not have any products yet.
                        </div>
                      ) : lowStockProducts.length === 0 ? (
                        <div className="flex items-center gap-2 rounded-2xl bg-[#f6f1e7] p-3 text-sm font-semibold text-emerald-950/70">
                          <CheckCircle2 className="h-4 w-4 text-emerald-700" />
                          All products have healthy stock.
                        </div>
                      ) : (
                        <div className="max-h-80 space-y-3 overflow-y-auto pr-1">
                          {lowStockProducts.map((product) => (
                            <Link
                              key={product.id}
                              to="/my-products"
                              onClick={() => setShowNotifications(false)}
                              className="block rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] p-3 transition hover:bg-lime-100"
                            >
                              <div className="flex items-center justify-between gap-3">
                                <div className="min-w-0">
                                  <p className="truncate font-black text-emerald-950">
                                    {product.name}
                                  </p>
                                  <p className="text-xs font-semibold text-emerald-950/60">
                                    Stock: {product.stock}
                                  </p>
                                </div>
                                <span className="rounded-full bg-amber-200 px-2 py-1 text-[11px] font-black uppercase tracking-wider text-emerald-950">
                                  Low
                                </span>
                              </div>
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {!vendor && (
                <Link
                  to="/notifications"
                  className="relative inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-emerald-950 shadow-sm ring-1 ring-emerald-950/10 transition hover:-translate-y-0.5 hover:bg-lime-100"
                  aria-label="Notifications"
                >
                  <Bell className="h-5 w-5" />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-lime-300 px-1 text-[11px] font-black text-emerald-950 ring-2 ring-[#f6f1e7]">
                      {unreadNotificationsCount}
                    </span>
                  )}
                </Link>
              )}

              <div className="flex items-center gap-3 rounded-full bg-white px-3 py-2 shadow-sm ring-1 ring-emerald-950/10">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-950 text-lime-300">
                  <User className="h-4 w-4" />
                </div>
                <div className="hidden leading-tight xl:block">
                  <p className="text-sm font-black text-emerald-950">
                    {user?.firstName || "User"}
                  </p>
                  <p className="text-xs font-bold capitalize text-emerald-950/55">
                    {user?.role}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="rounded-full px-5 py-3 text-sm font-black text-emerald-950 transition hover:bg-white/70"
              >
                Sign in
              </Link>
              <Link
                to="/register?role=vendor"
                className="rounded-full bg-lime-300 px-6 py-3 text-sm font-black text-emerald-950 shadow-[0_12px_30px_rgba(132,204,22,0.28)] transition hover:-translate-y-0.5 hover:bg-lime-200"
              >
                Create Store
              </Link>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="rounded-full bg-white p-3 text-emerald-950 shadow-sm ring-1 ring-emerald-950/10 lg:hidden"
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-emerald-950/10 bg-[#f6f1e7] px-5 py-5 shadow-lg lg:hidden">
          <div className="flex flex-col gap-3">
            {renderLinks(true)}

            <div className="mt-2 border-t border-emerald-950/10 pt-4">
              {isAuthenticated ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 rounded-2xl bg-white/70 p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-950 text-lime-300">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-black text-emerald-950">
                        {user?.firstName || "User"}
                      </p>
                      <p className="text-sm font-bold capitalize text-emerald-950/55">
                        {user?.role}
                      </p>
                    </div>
                  </div>

                  {vendor && (
                    <Link
                      to="/my-products"
                      onClick={() => setMobileOpen(false)}
                      className="flex items-center justify-between rounded-2xl bg-white/70 px-4 py-3 font-black text-emerald-950"
                    >
                      <span className="inline-flex items-center gap-3">
                        <Bell className="h-5 w-5" />
                        Low stock alerts
                      </span>
                      {lowStockProducts.length > 0 && (
                        <span className="rounded-full bg-lime-300 px-2 py-1 text-xs font-black">
                          {lowStockProducts.length}
                        </span>
                      )}
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center justify-center gap-2 rounded-full bg-emerald-950 px-5 py-3 font-black text-white"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/login"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-white px-5 py-3 text-center font-black text-emerald-950"
                  >
                    Sign in
                  </Link>
                  <Link
                    to="/register?role=vendor"
                    onClick={() => setMobileOpen(false)}
                    className="rounded-full bg-lime-300 px-5 py-3 text-center font-black text-emerald-950"
                  >
                    Create Store
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;