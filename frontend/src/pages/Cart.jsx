import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsAPI } from "../api/api";
import {
  Loader2,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
} from "lucide-react";
import ShopNavbar from "../components/ShopNavbar";

const Cart = () => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (cart.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Fetch product details for cart items
      const productPromises = cart.map(async (item) => {
        try {
          const response = await productsAPI.getOne(item.id);
          return { ...response.data, quantity: item.quantity };
        } catch (err) {
          console.error(`Failed to load product ${item.id}:`, err);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      setCartItems(products.filter((product) => product !== null));
    } catch (err) {
      setError("Failed to load cart");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item,
    );
    setCartItems(updatedCart);

    // Update localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCartStorage = cart.map((item) =>
      item.id === productId ? { ...item, quantity: newQuantity } : item,
    );
    localStorage.setItem("cart", JSON.stringify(updatedCartStorage));
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);

    // Update localStorage
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const updatedCartStorage = cart.filter((item) => item.id !== productId);
    localStorage.setItem("cart", JSON.stringify(updatedCartStorage));
  };

  const getTotalPrice = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ShopNavbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Loading cart...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <Link
            to="/stores"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Continue Shopping
          </Link>
          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Shopping Cart
          </h1>
          <p className="text-slate-600">
            {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} in your
            cart
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {cartItems.length === 0 ? (
          <div className="text-center py-12">
            <ShoppingCart className="h-24 w-24 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Your cart is empty
            </h2>
            <p className="text-slate-600 mb-6">
              Add some products to get started!
            </p>
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Stores
            </Link>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-4">
              {cartItems.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-4 rounded-2xl bg-white p-6 border border-slate-200"
                >
                  {/* Product Image */}
                  <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl bg-slate-100">
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.parentElement.innerHTML =
                            '<div class="h-full w-full flex items-center justify-center text-slate-400">No Image</div>';
                        }}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        No Image
                      </div>
                    )}
                  </div>

                  {/* Product Details */}
                  <div className="flex-1 min-w-0">
                    <Link
                      to={`/product/${item.id}`}
                      className="text-lg font-semibold text-slate-900 hover:text-blue-600 line-clamp-2"
                    >
                      {item.name}
                    </Link>
                    <p className="text-2xl font-bold text-blue-600 mt-1">
                      ৳{item.price}
                    </p>
                    <p className="text-sm text-slate-500 mt-1">
                      Stock: {item.stock}
                    </p>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex flex-col items-end gap-2">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity - 1)
                        }
                        className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-semibold">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() =>
                          updateQuantity(item.id, item.quantity + 1)
                        }
                        disabled={item.quantity >= item.stock}
                        className="h-8 w-8 rounded-lg border border-slate-200 flex items-center justify-center hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.id)}
                      className="text-red-600 hover:text-red-700 text-sm font-medium flex items-center gap-1"
                    >
                      <Trash2 className="h-4 w-4" />
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="rounded-2xl bg-white p-6 border border-slate-200 sticky top-6">
                <h2 className="text-xl font-bold text-slate-900 mb-4">
                  Order Summary
                </h2>

                <div className="space-y-3 mb-6">
                  <div className="flex justify-between">
                    <span className="text-slate-600">
                      Subtotal ({getTotalItems()} items)
                    </span>
                    <span className="font-semibold">৳{getTotalPrice()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Shipping</span>
                    <span className="font-semibold">৳50</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax</span>
                    <span className="font-semibold">
                      ৳{(getTotalPrice() * 0.15).toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="border-t border-slate-200 pt-4 mb-6">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>
                      ৳
                      {(getTotalPrice() + 50 + getTotalPrice() * 0.15).toFixed(
                        2,
                      )}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/checkout")}
                  className="w-full rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
