import { useState, useEffect, useRef } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Bell,
  LogOut,
  User,
  AlertTriangle,
  ChevronDown,
  CheckCircle2,
} from "lucide-react";
import { productsAPI } from "../api/api";

const Navbar = () => {
  const { user, logout, isAuthenticated, isVendor } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [productCount, setProductCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const prevLowStockCount = useRef(0);

  const handleLogout = () => {
    logout();
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
      const products = response.data || response;
      const lowStock = products.filter(
        (product) => product.stock != null && product.stock <= 5,
      );
      setProductCount(products.length);
      setLowStockProducts(lowStock);
    } catch (error) {
      console.error("Failed to load low stock products:", error);
    }
  };

  useEffect(() => {
    if (isAuthenticated && isVendor()) {
      fetchLowStockProducts();
    }
  }, [isAuthenticated, isVendor, location.pathname]);

  useEffect(() => {
    if (lowStockProducts.length > 0 && prevLowStockCount.current === 0) {
      playAlertSound();
    }
    prevLowStockCount.current = lowStockProducts.length;
  }, [lowStockProducts]);

  return (
    <nav className="sticky top-0 z-50 shadow-md bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link
            to={isAuthenticated ? "/dashboard" : "/"}
            className="flex items-center gap-3"
          >
            <img
              src="/shoplinker.svg"
              alt="Shoplinker"
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex items-center gap-8">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Dashboard
                </Link>
                <Link to="/products" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                  Products
                </Link>

                {/* ✅ ADDED THIS LINE */}
                <Link to="/notifications" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                  Notifications
                </Link>

                {isVendor() && (
                  <>
                    <Link
                      to="/my-stores"
                      className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200"
                    >
                      My Store
                    </Link>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowNotifications((prev) => !prev)}
                        className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-700 shadow-sm transition-all duration-200 hover:border-slate-300 hover:bg-slate-50"
                      >
                        <Bell className="h-5 w-5" />
                        {lowStockProducts.length > 0 && (
                          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-semibold text-white">
                            {lowStockProducts.length}
                          </span>
                        )}
                      </button>

                      {showNotifications && (
                        <div className="absolute right-0 z-50 mt-2 w-80 rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                          <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                              <AlertTriangle className="h-4 w-4 text-orange-600" />
                              Low Stock Alerts
                            </div>
                            <button
                              type="button"
                              onClick={() => setShowNotifications(false)}
                              className="text-slate-400 hover:text-slate-600"
                            >
                              <ChevronDown className="h-4 w-4" />
                            </button>
                          </div>

                          {productCount === 0 ? (
                            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                              <CheckCircle2 className="h-4 w-4 text-blue-600" />
                              You don't have any products yet.
                            </div>
                          ) : lowStockProducts.length === 0 ? (
                            <div className="flex items-center gap-2 rounded-2xl bg-slate-50 p-3 text-sm text-slate-600">
                              <CheckCircle2 className="h-4 w-4 text-green-600" />
                              All products have healthy stock.
                            </div>
                          ) : (
                            <div className="space-y-3">
                              {lowStockProducts.map((product) => (
                                <div
                                  key={product.id}
                                  className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                                >
                                  <div className="flex items-center justify-between gap-3">
                                    <div>
                                      <p className="font-semibold text-slate-900">
                                        {product.name}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        Stock: {product.stock}
                                      </p>
                                    </div>
                                    <span className="inline-flex rounded-full bg-orange-100 px-2 py-1 text-[11px] font-semibold uppercase tracking-wider text-orange-700">
                                      Low
                                    </span>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </>
                )}
                <div className="flex items-center gap-4 ml-4 pl-4 border-l border-slate-200">
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                      <User className="h-4 w-4" />
                    </div>
                    <span className="text-sm font-medium text-slate-900">
                      {user?.firstName}
                    </span>
                    <span className="text-xs font-medium text-slate-500 rounded-full bg-slate-100 px-2 py-1">
                      {user?.role}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-2 rounded-lg bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-100"
                  >
                    <LogOut className="h-4 w-4" />
                    Logout
                  </button>
                </div>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;