import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { storesAPI, productsAPI } from "../api/api";
import {
  Loader2,
  ArrowLeft,
  Package,
  Store,
  ShoppingCart,
  Heart,
} from "lucide-react";
import ShopNavbar from "../components/ShopNavbar";

const StoreDetail = () => {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (slug) {
      fetchStoreData();
    }
  }, [slug]);

  const fetchStoreData = async () => {
    try {
      setLoading(true);
      const storeResponse = await storesAPI.getBySlug(slug);
      setStore(storeResponse.data);

      // Fetch products for this store
      const productsResponse = await productsAPI.getByStore(
        storeResponse.data.id,
      );
      setProducts(productsResponse.data);
    } catch (err) {
      setError("Store not found");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading store...</p>
        </div>
      </div>
    );
  }

  if (error || !store) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-red-50 text-red-600 mx-auto mb-6">
            <Package className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Store Not Found
          </h2>
          <p className="text-slate-600 mb-6">
            The store you're looking for doesn't exist.
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-50">
      <ShopNavbar />

      {/* Hero Banner Section */}
      <section className="relative w-full h-80 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600">
          {store.banner ? (
            <img
              src={store.banner}
              alt={`${store.name} banner`}
              className="h-full w-full object-cover opacity-80"
              onError={(e) => {
                e.target.style.display = "none";
              }}
            />
          ) : null}
        </div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
        {/* Store Logo & Name Overlay */}
        <div className="absolute bottom-0 left-0 right-0">
          <div className="mx-auto max-w-7xl px-6 pb-8 lg:px-8">
            <div className="flex items-end gap-6">
              {/* Store Logo */}
              <div className="h-32 w-32 rounded-3xl bg-white border-4 border-white shadow-2xl overflow-hidden flex items-center justify-center flex-shrink-0">
                {store.logo ? (
                  <img
                    src={store.logo}
                    alt={`${store.name} logo`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = "none";
                      e.target.parentElement.innerHTML = `<span class="text-4xl font-bold text-blue-600">${store.name.charAt(0).toUpperCase()}</span>`;
                    }}
                  />
                ) : (
                  <span className="text-4xl font-bold text-blue-600">
                    {store.name.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>

              {/* Store Info */}
              <div className="flex-1 pb-2">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-4xl font-bold text-white drop-shadow-lg">
                    {store.name}
                  </h1>
                  <span className="rounded-full bg-green-500 px-4 py-1.5 text-sm font-bold text-white shadow-lg">
                    ● Active
                  </span>
                </div>
                {store.slug && (
                  <p className="text-blue-100 font-medium">
                    @{store.slug}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Store Description & Contact */}
        <div className="mb-8 rounded-3xl bg-white p-8 border border-slate-200 shadow-lg">
          <div className="grid gap-8 lg:grid-cols-3">
            {/* Description */}
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-bold text-slate-900 mb-4">About This Store</h2>
              <p className="text-slate-600 leading-relaxed text-lg">
                {store.description || "Welcome to our store! Browse our collection of amazing products."}
              </p>
            </div>

            {/* Contact Info */}
            <div className="rounded-2xl bg-slate-50 p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">Contact Information</h3>
              <div className="space-y-3">
                {store.address && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-blue-100 p-2">
                      <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Address</p>
                      <p className="text-slate-900 font-medium">{store.address}</p>
                    </div>
                  </div>
                )}
                {store.phone && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-green-100 p-2">
                      <svg className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Phone</p>
                      <p className="text-slate-900 font-medium">{store.phone}</p>
                    </div>
                  </div>
                )}
                {store.email && (
                  <div className="flex items-start gap-3">
                    <div className="rounded-lg bg-purple-100 p-2">
                      <svg className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-500 uppercase">Email</p>
                      <p className="text-slate-900 font-medium">{store.email}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Products Section */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Our Products</h2>
              <p className="text-slate-600 mt-1">
                {products.length} {products.length === 1 ? "product" : "products"} available
              </p>
            </div>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-16 text-center shadow-lg">
              <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-slate-100 text-slate-400 mx-auto mb-6">
                <Package className="h-12 w-12" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">
                No Products Yet
              </h3>
              <p className="text-slate-600 text-lg">
                This store hasn't added any products yet. Check back soon!
              </p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="group overflow-hidden rounded-3xl bg-white border border-slate-200 shadow-lg transition-all duration-300 hover:shadow-2xl hover:-translate-y-1"
                >
                  {/* Product Image */}
                  <Link to={`/product/${product.id}`} className="block">
                    <div className="h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center relative">
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
                          onError={(e) => {
                            e.target.style.display = "none";
                            e.target.parentElement.innerHTML =
                              '<svg class="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                          }}
                        />
                      ) : (
                        <Package className="h-16 w-16 text-slate-400" />
                      )}
                      
                      {/* Stock Badge */}
                      <div className="absolute top-3 right-3">
                        <span className={`rounded-full px-3 py-1.5 text-xs font-bold shadow-lg backdrop-blur-sm ${
                          product.stock > 10
                            ? 'bg-green-500/90 text-white'
                            : product.stock > 0
                            ? 'bg-yellow-500/90 text-white'
                            : 'bg-red-500/90 text-white'
                        }`}>
                          {product.stock > 0 ? `${product.stock} left` : 'Out of stock'}
                        </span>
                      </div>
                    </div>
                  </Link>

                  <div className="p-6">
                    <Link to={`/product/${product.id}`}>
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-2 mb-3 hover:text-blue-600 transition">
                        {product.name}
                      </h3>
                    </Link>

                    {product.description && (
                      <p className="text-sm text-slate-600 line-clamp-2 mb-4 leading-relaxed">
                        {product.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="text-3xl font-bold text-blue-600">
                          ৳{product.price}
                        </p>
                      </div>
                      {product.category && (
                        <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                          {product.category}
                        </span>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const cart = JSON.parse(
                            localStorage.getItem("cart") || "[]",
                          );
                          const existingItem = cart.find(
                            (item) => item.id === product.id,
                          );
                          if (existingItem) {
                            existingItem.quantity += 1;
                          } else {
                            cart.push({ id: product.id, quantity: 1 });
                          }
                          localStorage.setItem("cart", JSON.stringify(cart));
                          window.dispatchEvent(new Event('cartUpdated'));
                          alert("Added to cart!");
                          window.dispatchEvent(new Event('storage'));
                        }}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 px-4 py-3 text-sm font-semibold text-white transition-all hover:from-blue-700 hover:to-blue-800 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={product.stock === 0}
                      >
                        <ShoppingCart className="h-4 w-4" />
                        {product.stock === 0 ? "Out of Stock" : "Add to Cart"}
                      </button>
                      <button
                        onClick={() => {
                          const wishlist = JSON.parse(
                            localStorage.getItem("wishlist") || "[]",
                          );
                          if (!wishlist.includes(product.id)) {
                            wishlist.push(product.id);
                            localStorage.setItem(
                              "wishlist",
                              JSON.stringify(wishlist),
                            );
                            window.dispatchEvent(new Event("wishlistUpdated"));
                            alert("Added to wishlist!");
                          } else {
                            alert("Already in wishlist!");
                          }
                        }}
                        className="inline-flex items-center justify-center rounded-xl border-2 border-slate-200 bg-white px-4 py-3 text-sm font-semibold text-slate-700 transition-all hover:border-red-500 hover:bg-red-50 hover:text-red-600"
                      >
                        <Heart className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </section>
    </main>
  );
};

export default StoreDetail;
