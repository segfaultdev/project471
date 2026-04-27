import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { productsAPI } from "../api/api";
import {
  ArrowLeft,
  ArrowRight,
  Heart,
  Loader2,
  Package,
  ShoppingCart,
  Trash2,
  X,
} from "lucide-react";

const formatCurrency = (amount) =>
  `Tk ${Number(amount || 0).toLocaleString("en-BD")}`;

const getStoredWishlist = () =>
  Array.from(new Set(JSON.parse(localStorage.getItem("wishlist") || "[]")));

const StoreWishlist = () => {
  const [searchParams] = useSearchParams();
  const storeSlug = searchParams.get("store");
  const [wishlistItems, setWishlistItems] = useState([]);
  const [missingProductIds, setMissingProductIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    loadWishlist();
  }, []);

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const loadWishlist = async () => {
    try {
      setLoading(true);
      setError("");

      const wishlist = getStoredWishlist();

      if (wishlist.length === 0) {
        setWishlistItems([]);
        setMissingProductIds([]);
        return;
      }

      const productResults = await Promise.all(
        wishlist.map(async (productId) => {
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
        localStorage.setItem(
          "wishlist",
          JSON.stringify(validProducts.map((product) => product.id)),
        );
      }
    } catch (err) {
      console.error("Failed to load wishlist:", err);
      setError("Failed to load wishlist. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const removeFromWishlist = (productId) => {
    const updatedItems = wishlistItems.filter((item) => item.id !== productId);
    setWishlistItems(updatedItems);

    const updatedWishlist = getStoredWishlist().filter((id) => id !== productId);
    localStorage.setItem("wishlist", JSON.stringify(updatedWishlist));
    showNotice("Removed from wishlist.");
  };

  const clearWishlist = () => {
    localStorage.setItem("wishlist", JSON.stringify([]));
    setWishlistItems([]);
    setMissingProductIds([]);
    showNotice("Wishlist cleared.");
  };

  const addToCart = (product) => {
    if (!product || Number(product.stock) <= 0) {
      setError("This product is currently out of stock.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.storeSlug = product.store?.slug || existingItem.storeSlug;
      existingItem.storeName = product.store?.name || existingItem.storeName;
    } else {
      cart.push({
        id: product.id,
        quantity: 1,
        storeSlug: product.store?.slug,
        storeName: product.store?.name,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showNotice(`${product.name} added to cart.`);
  };

  const firstStoreSlug =
    storeSlug ||
    wishlistItems.find((item) => item.store?.slug)?.store?.slug;
  const backToStorePath = firstStoreSlug ? `/store/${firstStoreSlug}` : "/stores";
  const backLabel = firstStoreSlug ? "Back to Store" : "Browse Stores";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-4 text-sm font-semibold text-neutral-600">
            Loading wishlist...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to={backToStorePath}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            {backLabel}
          </Link>

          <Link
            to="/cart"
            state={firstStoreSlug ? { fromStore: `/store/${firstStoreSlug}` } : undefined}
            className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Cart
          </Link>
        </div>
      </header>

      {(notice || error || missingProductIds.length > 0) && (
        <div className="fixed right-5 top-24 z-50 w-[calc(100%-2.5rem)] max-w-sm space-y-3">
          {notice && (
            <div className="flex items-start gap-3 rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
              <Heart className="mt-0.5 h-5 w-5 text-green-600" />
              <p className="text-sm font-semibold text-neutral-800">{notice}</p>
              <button
                type="button"
                onClick={() => setNotice("")}
                className="ml-auto rounded-full p-1 hover:bg-neutral-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {error && (
            <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700 shadow-xl">
              <Package className="mt-0.5 h-5 w-5" />
              <p className="text-sm font-semibold">{error}</p>
              <button
                type="button"
                onClick={() => setError("")}
                className="ml-auto rounded-full p-1 hover:bg-red-100"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

          {missingProductIds.length > 0 && (
            <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm font-semibold text-amber-800 shadow-xl">
              {missingProductIds.length} unavailable product
              {missingProductIds.length === 1 ? " was" : "s were"} removed.
            </div>
          )}
        </div>
      )}

      <section className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <div className="flex flex-col gap-5 border-b border-neutral-200 pb-8 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
              Saved products
            </p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">
              Your wishlist
            </h1>
            <p className="mt-2 text-neutral-600">
              Keep favorites from storefronts here and move them to cart when
              you are ready.
            </p>
          </div>

          {wishlistItems.length > 0 && (
            <button
              type="button"
              onClick={clearWishlist}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Clear Wishlist
            </button>
          )}
        </div>

        {wishlistItems.length === 0 ? (
          <section className="mt-8 rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100 text-neutral-400">
              <Heart className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Your wishlist is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">
              Save products from a store, then come back here to compare and
              add them to your cart.
            </p>
            <Link
              to={backToStorePath}
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-4 font-semibold text-white transition hover:bg-neutral-800"
            >
              {backLabel}
              <ArrowRight className="h-5 w-5" />
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {wishlistItems.map((item) => {
              const outOfStock = Number(item.stock) <= 0;
              const storePath = item.store?.slug
                ? `/store/${item.store.slug}`
                : backToStorePath;

              return (
                <article
                  key={item.id}
                  className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link
                    to={`/product/${item.id}`}
                    className="block aspect-square overflow-hidden bg-neutral-100"
                  >
                    {item.images && item.images.length > 0 ? (
                      <img
                        src={item.images[0]}
                        alt={item.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-400">
                        <Package className="h-16 w-16" />
                      </div>
                    )}
                  </Link>

                  <div className="p-5">
                    {item.store?.name && (
                      <Link
                        to={storePath}
                        className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 hover:text-neutral-950"
                      >
                        {item.store.name}
                      </Link>
                    )}

                    <Link to={`/product/${item.id}`} className="mt-2 block">
                      <h2 className="line-clamp-2 text-xl font-bold transition hover:text-neutral-600">
                        {item.name}
                      </h2>
                    </Link>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-2xl font-bold">
                        {formatCurrency(item.price)}
                      </p>
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-bold ${
                          outOfStock
                            ? "bg-red-50 text-red-700"
                            : Number(item.stock) <= 5
                              ? "bg-amber-50 text-amber-700"
                              : "bg-green-50 text-green-700"
                        }`}
                      >
                        {outOfStock ? "Out of stock" : `${item.stock} in stock`}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                      <button
                        type="button"
                        onClick={() => addToCart(item)}
                        disabled={outOfStock}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {outOfStock ? "Unavailable" : "Add to Cart"}
                      </button>
                      <button
                        type="button"
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
      </section>
    </main>
  );
};

export default StoreWishlist;
