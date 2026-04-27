import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { productsAPI } from "../api/api";
import {
  ArrowLeft,
  Heart,
  Loader2,
  Package,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

const formatCurrency = (amount) => `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const Wishlist = () => {
  const [wishlistItems, setWishlistItems] = useState([]);
  const [missingProductIds, setMissingProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
      const uniqueWishlist = Array.from(new Set(wishlist));

      if (uniqueWishlist.length === 0) {
        setWishlistItems([]);
        setMissingProductIds([]);
        setLoading(false);
        return;
      }

      const productResults = await Promise.all(
        uniqueWishlist.map(async (productId) => {
          try {
            const response = await productsAPI.getOne(productId);
            return { product: response.data || response, productId };
          } catch (err) {
            console.error(`Failed to load product ${productId}:`, err);
            return { product: null, productId };
          }
        }),
      );

      const validProducts = productResults
        .map((result) => result.product)
        .filter(Boolean);

      const missingIds = productResults
        .filter((result) => !result.product)
        .map((result) => result.productId);

      setWishlistItems(validProducts);
      setMissingProductIds(missingIds);

      if (missingIds.length > 0) {
        const validIds = validProducts.map((product) => product.id);
        localStorage.setItem("wishlist", JSON.stringify(validIds));
      }
    } catch (err) {
      setError("Failed to load wishlist. Please refresh and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedWishlistItems = wishlistItems.filter((item) => item.id !== productId);
    setWishlistItems(updatedWishlistItems);

    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");
    const updatedWishlistStorage = wishlist.filter((id) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlistStorage));

    setSuccess("Removed from wishlist.");
    setTimeout(() => setSuccess(""), 2500);
  };

  const clearWishlist = () => {
    localStorage.setItem("wishlist", JSON.stringify([]));
    setWishlistItems([]);
    setMissingProductIds([]);
    setSuccess("Wishlist cleared.");
    setTimeout(() => setSuccess(""), 2500);
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-950" />
          <p className="mt-4 font-black text-emerald-950">Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                to="/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <Sparkles className="h-4 w-4" />
                Saved Products
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                My Wishlist
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                Save products you like and open them later from their actual product pages.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 text-emerald-950">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Saved items
              </p>
              <p className="mt-2 text-4xl font-black">{wishlistItems.length}</p>
            </div>
          </div>
        </section>

        {(error || success || missingProductIds.length > 0) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="font-semibold">{error}</p>
                <button onClick={() => setError("")} className="rounded-full p-1 hover:bg-red-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {success && (
              <div className="flex items-center justify-between rounded-2xl border border-lime-300 bg-lime-100 p-4 text-emerald-950">
                <p className="font-black">{success}</p>
                <button onClick={() => setSuccess("")} className="rounded-full p-1 hover:bg-lime-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {missingProductIds.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <p className="font-semibold">
                  {missingProductIds.length} unavailable product
                  {missingProductIds.length !== 1 ? "s were" : " was"} removed from your wishlist.
                </p>
              </div>
            )}
          </div>
        )}

        {wishlistItems.length > 0 && (
          <section className="mt-8 flex flex-col gap-4 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-5 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Wishlist
              </p>
              <h2 className="mt-1 text-2xl font-black">
                {wishlistItems.length} product{wishlistItems.length !== 1 ? "s" : ""} saved
              </h2>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={clearWishlist}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 font-black text-red-700 transition hover:bg-red-100"
              >
                <Trash2 className="h-5 w-5" />
                Clear Wishlist
              </button>
            </div>
          </section>
        )}

        {wishlistItems.length === 0 ? (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Heart className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-black text-emerald-950">
              Your wishlist is empty
            </h2>
            <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-emerald-950/60">
              Save products you love from store pages so you can revisit their product pages later.
            </p>
            <div className="mt-7 flex justify-center">
              <Link
                to="/dashboard"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                <ArrowLeft className="h-5 w-5" />
                Back to Dashboard
              </Link>
            </div>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => {
              const outOfStock = Number(item.stock) <= 0;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <Link
                    to={`/product/${item.id}`}
                    className="block aspect-square w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-100 to-amber-100"
                  >
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-emerald-950/35">
                        <Package className="h-20 w-20" />
                      </div>
                    )}
                  </Link>

                  <div className="p-5">
                    <Link
                      to={`/product/${item.id}`}
                      className="line-clamp-2 text-xl font-black leading-tight text-emerald-950 transition hover:text-emerald-700"
                    >
                      {item.name}
                    </Link>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                        {formatCurrency(item.price)}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-black ${
                          outOfStock
                            ? "bg-red-100 text-red-700"
                            : Number(item.stock) <= 5
                              ? "bg-amber-200 text-emerald-950"
                              : "bg-emerald-50 text-emerald-950"
                        }`}
                      >
                        {outOfStock ? "Out of stock" : `Stock ${item.stock}`}
                      </span>
                    </div>

                    {item.category && (
                      <p className="mt-4 text-sm font-semibold text-emerald-950/55">
                        {item.category}
                      </p>
                    )}

                    <div className="mt-5 flex gap-2">
                      <Link
                        to={`/product/${item.id}`}
                        className="flex-1 inline-flex items-center justify-center rounded-full bg-emerald-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-900"
                      >
                        View Product
                      </Link>
                      <button
                        onClick={() => removeFromWishlist(item.id)}
                        className="inline-flex items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 py-3 text-red-700 transition hover:bg-red-100"
                        aria-label={`Remove ${item.name} from wishlist`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default Wishlist;
