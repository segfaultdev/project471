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
                    <Link to="/my-products" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                      My Products
                    </Link>
                    <Link to="/coupons" className="text-sm font-semibold text-slate-700 hover:text-blue-600 transition-colors duration-200">
                      Coupons
                    </Link>
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