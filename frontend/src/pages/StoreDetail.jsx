import { useState, useEffect } from "react";
import { useParams, Link, useLocation } from "react-router-dom";
import { storesAPI, productsAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2,
  Package,
  Store,
  ShoppingCart,
  Heart,
  MapPin,
  Phone,
  Mail,
  CheckCircle2,
  X,
  Search,
  User,
} from "lucide-react";

const formatCurrency = (amount) => `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const StoreDetail = () => {
  const { slug } = useParams();
  const location = useLocation();
  const { user } = useAuth();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  useEffect(() => {
    const query = searchQuery.trim().toLowerCase();

    if (!query) {
      setFilteredProducts(products);
      return;
    }

    setFilteredProducts(
      products.filter((product) => {
        const name = product.name?.toLowerCase() || "";
        const description = product.description?.toLowerCase() || "";
        const category =
          (typeof product.category === "string"
            ? product.category
            : product.category?.name
          )?.toLowerCase() || "";
        return name.includes(query) || description.includes(query) || category.includes(query);
      }),
    );
  }, [searchQuery, products]);

  const normalizeArrayResponse = (response) => response?.data || response || [];

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      setError("");

      const storeResponse = await storesAPI.getBySlug(slug);
      const storeData = storeResponse.data || storeResponse;
      setStore(storeData);

      const productsResponse = await productsAPI.getByStore(storeData.id);
      const productsData = normalizeArrayResponse(productsResponse);
      setProducts(productsData);
      setFilteredProducts(productsData);
    } catch (err) {
      setError("Store not found.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const showNotice = (message) => {
    setNotice(message);
    setTimeout(() => setNotice(""), 2500);
  };

  const addToCart = (product) => {
    if (!product || Number(product.stock) <= 0) {
      showNotice("This product is currently out of stock.");
      return;
    }

    const cart = JSON.parse(localStorage.getItem("cart") || "[]");
    const existingItem = cart.find((item) => item.id === product.id);

    if (existingItem) {
      existingItem.quantity += 1;
      existingItem.storeSlug = store.slug;
      existingItem.storeName = store.name;
    } else {
      cart.push({
        id: product.id,
        quantity: 1,
        storeSlug: store.slug,
        storeName: store.name,
      });
    }

    localStorage.setItem("cart", JSON.stringify(cart));
    showNotice(`${product.name} added to cart.`);
  };

  const addToWishlist = (product) => {
    const wishlist = JSON.parse(localStorage.getItem("wishlist") || "[]");

    if (!wishlist.includes(product.id)) {
      wishlist.push(product.id);
      localStorage.setItem("wishlist", JSON.stringify(wishlist));
      showNotice(`${product.name} saved to wishlist.`);
    } else {
      showNotice("This product is already in your wishlist.");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] text-neutral-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-4 text-sm font-semibold text-neutral-600">Loading store...</p>
        </div>
      </main>
    );
  }

  if (error || !store) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#faf8f3] px-6 text-neutral-950">
        <div className="max-w-md rounded-3xl bg-white p-8 text-center shadow-sm ring-1 ring-neutral-200">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-red-600">
            <Package className="h-8 w-8" />
          </div>
          <h1 className="mt-6 text-2xl font-bold">Store not found</h1>
          <p className="mt-2 text-neutral-600">The store you are looking for does not exist or is no longer available.</p>
          <Link
            to="/"
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-neutral-950 px-5 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
          >
            Back Home
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#faf8f3] text-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <a href="#home" className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-neutral-950 text-sm font-bold text-white">
              {store.logo ? (
                <img src={store.logo} alt={`${store.name} logo`} className="h-full w-full object-cover" />
              ) : (
                store.name?.charAt(0)?.toUpperCase() || <Store className="h-5 w-5" />
              )}
            </div>
            <span className="max-w-[150px] truncate text-sm font-bold sm:max-w-xs">
              {store.name}
            </span>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              to={`/shop-wishlist?store=${store.slug}`}
              className="hidden rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-neutral-950 sm:inline-flex"
            >
              Wishlist
            </Link>
            <Link
              to="/cart"
              state={{ fromStore: `/store/${store.slug}` }}
              className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-neutral-950"
            >
              Cart
            </Link>
            <Link
              to={user ? "/dashboard" : "/shop-login"}
              state={!user ? { from: location.pathname } : undefined}
              className="inline-flex items-center gap-2 rounded-full bg-neutral-950 px-4 py-2 text-sm font-semibold text-white transition hover:bg-neutral-800"
            >
              <User className="h-4 w-4" />
              <span className="hidden sm:inline">{user ? "Profile" : "Sign in"}</span>
            </Link>
          </div>
        </div>
      </header>

      {notice && (
        <div className="fixed right-5 top-24 z-50 max-w-sm rounded-2xl border border-neutral-200 bg-white p-4 shadow-xl">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 text-green-600" />
            <p className="text-sm font-semibold text-neutral-800">{notice}</p>
            <button onClick={() => setNotice("")} className="ml-auto rounded-full p-1 hover:bg-neutral-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <section id="home" className="bg-white">
        <div className="mx-auto max-w-7xl px-5 py-6 lg:px-8">
          <div className="overflow-hidden rounded-[2rem] border border-neutral-200 bg-neutral-100 shadow-sm">
            <div className="h-56 w-full md:h-72 lg:h-80">
              {store.banner ? (
                <img
                  src={store.banner}
                  alt={`${store.name} banner`}
                  className="h-full w-full object-cover"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-neutral-100 to-neutral-200 text-neutral-400">
                  <Store className="h-24 w-24" />
                </div>
              )}
            </div>
          </div>

          <div className="py-10">
            <div className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-start">
              <div className="flex flex-col gap-6 sm:flex-row sm:items-start">
                <div className="flex h-28 w-28 shrink-0 items-center justify-center overflow-hidden rounded-3xl border border-neutral-200 bg-neutral-950 text-4xl font-bold text-white shadow-sm">
                  {store.logo ? (
                    <img src={store.logo} alt={`${store.name} logo`} className="h-full w-full object-cover" />
                  ) : (
                    store.name?.charAt(0)?.toUpperCase() || <Store className="h-10 w-10" />
                  )}
                </div>

                <div>
                  {store.category && (
                    <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                      {store.category}
                    </p>
                  )}
                  <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-6xl">{store.name}</h1>
                  <p className="mt-5 max-w-3xl text-lg leading-8 text-neutral-600">
                    {store.description || "Welcome to our store. Browse our available products below."}
                  </p>

                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="#products"
                      className="rounded-full bg-neutral-950 px-6 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800"
                    >
                      Shop Products
                    </a>
                    <Link
                      to="/cart"
                      state={{ fromStore: `/store/${store.slug}` }}
                      className="rounded-full border border-neutral-200 bg-white px-6 py-3 text-sm font-semibold text-neutral-800 transition hover:border-neutral-950"
                    >
                      View Cart
                    </Link>
                  </div>
                </div>
              </div>

              <aside className="rounded-3xl border border-neutral-200 bg-[#faf8f3] p-5">
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
                  Store Info
                </p>

                <div className="mt-4 space-y-3 text-sm text-neutral-700">
                  {store.address && (
                    <div className="flex gap-3 rounded-2xl bg-white p-3">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex gap-3 rounded-2xl bg-white p-3">
                      <Phone className="mt-0.5 h-4 w-4 shrink-0" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex gap-3 rounded-2xl bg-white p-3">
                      <Mail className="mt-0.5 h-4 w-4 shrink-0" />
                      <span className="break-all">{store.email}</span>
                    </div>
                  )}

                  {!store.address && !store.phone && !store.email && (
                    <p className="rounded-2xl bg-white p-3 text-neutral-500">
                      Contact details will appear here when the seller adds them.
                    </p>
                  )}
                </div>
              </aside>
            </div>
          </div>
        </div>
      </section>

      <section id="products" className="mx-auto max-w-7xl px-5 py-14 lg:px-8">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">Products</p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight md:text-4xl">Shop from {store.name}</h2>
          </div>

          <div className="relative w-full lg:max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
            <input
              type="text"
              placeholder="Search this store..."
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-neutral-200 bg-white py-3 pl-11 pr-4 text-sm font-semibold outline-none transition focus:border-neutral-950"
            />
          </div>
        </div>

        {products.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-neutral-100 text-neutral-400">
              <Package className="h-8 w-8" />
            </div>
            <h3 className="mt-6 text-2xl font-bold">No products yet</h3>
            <p className="mt-2 text-neutral-600">This store has not added any products yet.</p>
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="rounded-3xl border border-neutral-200 bg-white p-12 text-center shadow-sm">
            <Search className="mx-auto h-10 w-10 text-neutral-400" />
            <h3 className="mt-5 text-2xl font-bold">No matching products</h3>
            <p className="mt-2 text-neutral-600">Try a different search inside this store.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredProducts.map((product) => {
              const outOfStock = Number(product.stock) <= 0;

              return (
                <article
                  key={product.id}
                  className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <Link to={`/product/${product.id}`} className="block h-72 overflow-hidden bg-neutral-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-neutral-400">
                        <Package className="h-16 w-16" />
                      </div>
                    )}
                  </Link>

                  <div className="p-5">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="line-clamp-2 text-xl font-bold transition hover:text-neutral-600">
                        {product.name}
                      </h3>
                    </Link>

                    {(product.category?.name || product.category) && (
                      <span className="mt-3 inline-flex rounded-full bg-neutral-100 px-3 py-1 text-xs font-semibold text-neutral-700">
                        {product.category?.name || product.category}
                      </span>
                    )}

                    {product.description && (
                      <p className="mt-3 line-clamp-2 text-sm leading-6 text-neutral-600">{product.description}</p>
                    )}

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <p className="text-2xl font-bold">{formatCurrency(product.price)}</p>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${
                        outOfStock
                          ? "bg-red-50 text-red-700"
                          : Number(product.stock) <= 5
                            ? "bg-amber-50 text-amber-700"
                            : "bg-green-50 text-green-700"
                      }`}>
                        {outOfStock ? "Out of stock" : `${product.stock} in stock`}
                      </span>
                    </div>

                    <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                      <button
                        onClick={() => addToCart(product)}
                        disabled={outOfStock}
                        className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {outOfStock ? "Unavailable" : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => addToWishlist(product)}
                        className="inline-flex items-center justify-center rounded-full border border-neutral-200 px-4 py-3 text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
                        aria-label={`Save ${product.name} to wishlist`}
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default StoreDetail;
