import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../api/api";
import { Loader2, Heart, ShoppingCart, Trash2, ArrowLeft } from "lucide-react";
import ShopNavbar from "../components/ShopNavbar";

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

      if (wishlist.length === 0) {
        setWishlistItems([]);
        setLoading(false);
        return;
      }

      // Fetch product details for wishlist items
      const productPromises = wishlist.map(async (productId) => {
        try {
          const response = await productsAPI.getOne(productId);
          return response.data;
        } catch (err) {
          console.error(`Failed to load product ${productId}:`, err);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      setWishlistItems(products.filter((product) => product !== null));
    } catch (err) {
      setError("Failed to load wishlist");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlist = wishlistItems.filter(
      (item) => item.id !== productId,
    );
    setWishlistItems(updatedWishlist);

    // Update localStorage
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updatedWishlistStorage = wishlist.filter((id) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlistStorage));
  };

  const addToCart = (product) => {
    // Add to cart logic
    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
    } else {
      cart.push({ id: product.id, quantity: 1 });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    alert("Added to cart!");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ShopNavbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Loading wishlist...</p>
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
            My Wishlist
          </h1>
          <p className="text-slate-600">
            {wishlistItems.length}{" "}
            {wishlistItems.length === 1 ? "item" : "items"} in your wishlist
          </p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {wishlistItems.length === 0 ? (
          <div className="text-center py-12">
            <Heart className="h-24 w-24 text-slate-300 mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Your wishlist is empty
            </h2>
            <p className="text-slate-600 mb-6">
              Save items you love for later!
            </p>
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Browse Stores
            </Link>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => (
              <div
                key={item.id}
                className="group overflow-hidden rounded-2xl bg-white border border-slate-200 transition hover:border-slate-300"
              >
                {/* Product Image */}
                <div className="aspect-square w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
                  {item.images && item.images.length > 0 ? (
                    <img
                      src={item.images[0]}
                      alt={item.name}
                      className="h-full w-full object-cover transition group-hover:scale-105"
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

                {/* Product Info */}
                <div className="p-4">
                  <Link
                    to={`/product/${item.id}`}
                    className="text-lg font-semibold text-slate-900 hover:text-blue-600 line-clamp-2 mb-2 block"
                  >
                    {item.name}
                  </Link>

                  <p className="text-xl font-bold text-blue-600 mb-2">
                    ৳{item.price}
                  </p>

                  <p className="text-sm text-slate-500 mb-4">
                    Stock: {item.stock}
                  </p>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => addToCart(item)}
                      disabled={item.stock === 0}
                      className="flex-1 inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50"
                    >
                      <ShoppingCart className="h-4 w-4" />
                      {item.stock === 0 ? "Out of Stock" : "Add to Cart"}
                    </button>
                    <button
                      onClick={() => removeFromWishlist(item.id)}
                      className="inline-flex items-center justify-center gap-1 rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
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

export default Wishlist;
