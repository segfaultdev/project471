import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Heart, User } from "lucide-react";

const ShopNavbar = () => {
  const location = useLocation();

  const getCartCount = () => {
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  return (
    <nav className="border-b border-slate-100 bg-white">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/shoplinker.svg"
                alt="Shoplinker"
                className="h-8 w-auto"
              />
            </Link>
          </div>

          
          <div className="flex items-center gap-4">
            
            <Link
              to="/cart"
              className="relative inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <ShoppingCart className="h-4 w-4" />
              Cart
              {getCartCount() > 0 && (
                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-blue-600 text-xs font-bold text-white flex items-center justify-center">
                  {getCartCount()}
                </span>
              )}
            </Link>

            
            <Link
              to="/shop-wishlist"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Heart className="h-4 w-4" />
              Wishlist
            </Link>

            
            <Link
              to="/shop-login"
              state={{ from: location.pathname }}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <User className="h-4 w-4" />
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default ShopNavbar;
