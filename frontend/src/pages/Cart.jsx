import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { productsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2,
  ShoppingCart,
  Minus,
  Plus,
  Trash2,
  ArrowLeft,
  Package,
  AlertCircle,
  X,
} from "lucide-react";

const formatCurrency = (amount) => `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const Cart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [missingItems, setMissingItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (cart.length === 0) {
        setCartItems([]);
        setMissingItems([]);
        return;
      }

      const productResults = await Promise.all(
        cart.map(async (item) => {
          try {
            const response = await productsAPI.getOne(item.id);
            const product = response.data || response;
            return {
              product: {
                ...product,
                quantity: Math.min(Number(item.quantity) || 1, Number(product.stock) || 1),
                storeSlug: item.storeSlug || product.store?.slug,
                storeName: item.storeName || product.store?.name,
              },
              id: item.id,
            };
          } catch (err) {
            console.error(`Failed to load product ${item.id}:`, err);
            return { product: null, id: item.id };
          }
        }),
      );

      const validProducts = productResults
        .map((result) => result.product)
        .filter(Boolean);

      const missingProductIds = productResults
        .filter((result) => !result.product)
        .map((result) => result.id);

      setCartItems(validProducts);
      setMissingItems(missingProductIds);

      if (missingProductIds.length > 0) {
        localStorage.setItem(
          "cart",
          JSON.stringify(
            validProducts.map((item) => ({
              id: item.id,
              quantity: item.quantity,
              storeSlug: item.storeSlug || item.store?.slug,
              storeName: item.storeName || item.store?.name,
            })),
          ),
        );
      }
    } catch (err) {
      setError("Failed to load cart. Please refresh and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const syncCartStorage = (items) => {
    localStorage.setItem(
      "cart",
      JSON.stringify(
        items.map((item) => ({
          id: item.id,
          quantity: item.quantity,
          storeSlug: item.storeSlug || item.store?.slug,
          storeName: item.storeName || item.store?.name,
        })),
      ),
    );
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
      return;
    }

    const updatedCart = cartItems.map((item) => {
      if (item.id !== productId) return item;
      const maxStock = Number(item.stock) || 0;
      return { ...item, quantity: Math.min(newQuantity, maxStock) };
    });

    setCartItems(updatedCart);
    syncCartStorage(updatedCart);
  };

  const removeFromCart = (productId) => {
    const updatedCart = cartItems.filter((item) => item.id !== productId);
    setCartItems(updatedCart);
    syncCartStorage(updatedCart);
  };

  const clearCart = () => {
    setCartItems([]);
    localStorage.setItem("cart", JSON.stringify([]));
  };

  const getSubtotal = () =>
    cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0);

  const getTotalItems = () =>
    cartItems.reduce((total, item) => total + Number(item.quantity || 1), 0);

  const getStoreIds = () =>
    Array.from(
      new Set(
        cartItems
          .map((item) => item.store?.id || item.storeSlug || item.store?.slug)
          .filter(Boolean),
      ),
    );

  const hasMixedStores = getStoreIds().length > 1;
  const hasMissingStore = cartItems.some((item) => !(item.store?.id || item.storeSlug || item.store?.slug));
  const canCheckout = cartItems.length > 0 && !hasMixedStores && !hasMissingStore;

  const handleCheckout = () => {
    if (!canCheckout) {
      setError(
        hasMixedStores
          ? "Your cart has products from multiple stores. Please checkout one store at a time."
          : "Some cart products are missing store information. Remove them before checkout.",
      );
      return;
    }

    if (!isAuthenticated || !user) {
      navigate("/shop-login", { state: { from: "/checkout" } });
      return;
    }

    navigate("/checkout");
  };

  const firstStoreSlug =
    cartItems.find((item) => item.storeSlug || item.store?.slug)?.storeSlug ||
    cartItems.find((item) => item.storeSlug || item.store?.slug)?.store?.slug;
  const backTo = location.state?.fromStore || (firstStoreSlug ? `/store/${firstStoreSlug}` : "/");
  const backToLabel = location.state?.fromStore || firstStoreSlug ? "Back to Store" : "Back Home";

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-4 text-sm font-semibold text-neutral-600">Loading cart...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to={backTo}
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            {backToLabel}
          </Link>

          <Link
            to="/shop-wishlist"
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-neutral-950"
          >
            Wishlist
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <section className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">Shopping cart</p>
            <h1 className="mt-2 text-4xl font-bold tracking-tight">Your cart</h1>
            <p className="mt-2 text-neutral-600">
              {getTotalItems()} {getTotalItems() === 1 ? "item" : "items"} ready for checkout
            </p>
          </div>

          {cartItems.length > 0 && (
            <button
              type="button"
              onClick={clearCart}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-red-200 bg-red-50 px-5 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
            >
              <Trash2 className="h-4 w-4" />
              Clear Cart
            </button>
          )}
        </section>

        {(error || missingItems.length > 0 || hasMixedStores || hasMissingStore) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="font-semibold">{error}</p>
                <button onClick={() => setError("")} className="rounded-full p-1 hover:bg-red-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {missingItems.length > 0 && (
              <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <p className="font-semibold">
                  {missingItems.length} unavailable product
                  {missingItems.length !== 1 ? "s were" : " was"} removed from your cart.
                </p>
              </div>
            )}

            {(hasMixedStores || hasMissingStore) && (
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <div>
                  <p className="font-bold">
                    {hasMixedStores ? "Checkout one store at a time" : "Store information missing"}
                  </p>
                  <p className="mt-1 text-sm leading-6">
                    {hasMixedStores
                      ? "Your cart contains products from different stores. Remove items so only one store remains, then checkout."
                      : "One or more products are missing store details. Remove them before checkout."}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {cartItems.length === 0 ? (
          <section className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-neutral-100 text-neutral-400">
              <ShoppingCart className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-bold">Your cart is empty</h2>
            <p className="mx-auto mt-2 max-w-md text-neutral-600">
              Visit a store, choose products you like, and add them to your cart.
            </p>
            <Link
              to={backTo}
              className="mt-7 inline-flex items-center justify-center rounded-full bg-neutral-950 px-7 py-4 font-semibold text-white transition hover:bg-neutral-800"
            >
              {backToLabel}
            </Link>
          </section>
        ) : (
          <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
            <section className="space-y-4">
              {cartItems.map((item) => {
                const maxStock = Number(item.stock) || 0;
                const lineTotal = Number(item.price || 0) * Number(item.quantity || 1);

                return (
                  <article
                    key={item.id}
                    className="rounded-3xl border border-neutral-200 bg-white p-4 shadow-sm sm:p-5"
                  >
                    <div className="flex flex-col gap-5 sm:flex-row">
                      <Link
                        to={`/product/${item.id}`}
                        className="h-32 w-full shrink-0 overflow-hidden rounded-2xl bg-neutral-100 sm:w-32"
                      >
                        {item.images && item.images.length > 0 ? (
                          <img
                            src={item.images[0]}
                            alt={item.name}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center text-neutral-400">
                            <Package className="h-10 w-10" />
                          </div>
                        )}
                      </Link>

                      <div className="min-w-0 flex-1">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            {(item.storeName || item.store?.name) && (
                              <Link
                                to={item.storeSlug || item.store?.slug ? `/store/${item.storeSlug || item.store?.slug}` : backTo}
                                className="text-xs font-bold uppercase tracking-[0.16em] text-neutral-500 hover:text-neutral-950"
                              >
                                {item.storeName || item.store?.name}
                              </Link>
                            )}
                            <Link to={`/product/${item.id}`} className="mt-1 block">
                              <h2 className="line-clamp-2 text-xl font-bold hover:text-neutral-600">{item.name}</h2>
                            </Link>
                            <p className="mt-2 text-sm text-neutral-500">
                              Stock: {item.stock}
                            </p>
                          </div>

                          <p className="rounded-full bg-neutral-950 px-4 py-2 text-sm font-bold text-white">
                            {formatCurrency(item.price)}
                          </p>
                        </div>

                        <div className="mt-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          <div className="flex w-fit items-center overflow-hidden rounded-full border border-neutral-200 bg-white">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity - 1)}
                              className="flex h-10 w-11 items-center justify-center transition hover:bg-neutral-100"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="h-4 w-4" />
                            </button>
                            <span className="w-12 border-x border-neutral-200 text-center text-sm font-bold">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, item.quantity + 1)}
                              disabled={item.quantity >= maxStock}
                              className="flex h-10 w-11 items-center justify-center transition hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-40"
                              aria-label="Increase quantity"
                            >
                              <Plus className="h-4 w-4" />
                            </button>
                          </div>

                          <div className="flex items-center justify-between gap-4 sm:justify-end">
                            <p className="font-bold">{formatCurrency(lineTotal)}</p>
                            <button
                              type="button"
                              onClick={() => removeFromCart(item.id)}
                              className="inline-flex items-center gap-1 rounded-full border border-red-200 bg-red-50 px-4 py-2 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                            >
                              <Trash2 className="h-4 w-4" />
                              Remove
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>

            <aside>
              <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
                <h2 className="text-xl font-bold">Order summary</h2>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-600">Subtotal ({getTotalItems()} items)</span>
                    <span className="font-semibold">{formatCurrency(getSubtotal())}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-600">Shipping</span>
                    <span className="font-semibold">Calculated at checkout</span>
                  </div>
                </div>

                <div className="mt-6 border-t border-neutral-200 pt-5">
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total</span>
                    <span>{formatCurrency(getSubtotal())}</span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-neutral-500">
                    Taxes and delivery fees are confirmed during checkout.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleCheckout}
                  disabled={!canCheckout}
                  className="mt-6 w-full rounded-full bg-neutral-950 px-6 py-4 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Proceed to Checkout
                </button>

                <Link
                  to={backTo}
                  className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-neutral-200 px-6 py-4 font-semibold text-neutral-700 transition hover:border-neutral-950"
                >
                  {backToLabel}
                </Link>
              </div>
            </aside>
          </div>
        )}
      </div>
    </main>
  );
};

export default Cart;
