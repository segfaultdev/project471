import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { storesAPI, productsAPI } from '../api/api';
import { Loader2, ArrowLeft, Package, Store } from 'lucide-react';

const StoreDetail = () => {
  const { slug } = useParams();
  const [store, setStore] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
      const productsResponse = await productsAPI.getByStore(storeResponse.data.id);
      setProducts(productsResponse.data);
    } catch (err) {
      setError('Store not found');
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
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Store Not Found</h2>
          <p className="text-slate-600 mb-6">The store you're looking for doesn't exist.</p>
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
    <main className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-6 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/shoplinker.svg" alt="Shoplinker" className="h-10 w-auto" />
          </Link>
        </div>
      </header>

      {/* Banner Section */}
      <section className="w-full">
        <div className="h-64 w-full bg-gradient-to-br from-blue-100 to-slate-100 overflow-hidden flex items-center justify-center">
          {store.banner ? (
            <img 
              src={store.banner} 
              alt={`${store.name} banner`}
              className="h-full w-full object-cover"
              onError={(e) => {
                e.target.style.display = 'none';
                e.target.parentElement.innerHTML = '<svg class="h-24 w-24 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>';
              }}
            />
          ) : (
            <Store className="h-24 w-24 text-slate-400" />
          )}
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12 lg:px-8">
        {/* Store Info Card */}
        <div className="-mt-12 rounded-3xl bg-white p-6 border border-slate-200">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-col gap-6 md:flex-row md:items-center flex-1">
              <div className="h-24 w-24 rounded-2xl border-2 border-slate-200 bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-2xl overflow-hidden">
                {store.logo ? (
                  <img 
                    src={store.logo} 
                    alt={`${store.name} logo`}
                    className="h-full w-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.innerHTML = store.name.charAt(0).toUpperCase();
                    }}
                  />
                ) : (
                  store.name.charAt(0).toUpperCase()
                )}
              </div>

              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                  Store
                </p>
                <h1 className="mt-2 text-3xl font-bold text-slate-900">
                  {store.name}
                </h1>
                <p className="mt-3 max-w-2xl text-slate-600">
                  {store.description || 'Welcome to our store!'}
                </p>
                {store.slug && (
                  <p className="mt-2 text-sm text-slate-500">
                    {import.meta.env.VITE_APP_URL}/store/{store.slug}
                  </p>
                )}
              </div>
            </div>

            <div className="flex gap-3">
              <Link
                to="/stores"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                <ArrowLeft className="h-4 w-4" />
                All Stores
              </Link>
            </div>
          </div>

          {/* Contact Info */}
          {(store.address || store.phone || store.email) && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <div className="grid gap-4 sm:grid-cols-3">
                {store.address && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Address</p>
                    <p className="mt-1 text-slate-900">{store.address}</p>
                  </div>
                )}
                {store.phone && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Phone</p>
                    <p className="mt-1 text-slate-900">{store.phone}</p>
                  </div>
                )}
                {store.email && (
                  <div>
                    <p className="text-sm font-medium text-slate-500">Email</p>
                    <p className="mt-1 text-slate-900">{store.email}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Products Section */}
        <section className="mt-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-slate-900">Products</h2>
            <p className="text-sm text-slate-500">
              {products.length} {products.length === 1 ? 'product' : 'products'} available
            </p>
          </div>

          {products.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-6">
                <Package className="h-10 w-10" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products Yet</h3>
              <p className="text-slate-600">This store hasn't added any products yet.</p>
            </div>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {products.map((product) => (
                <div
                  key={product.id}
                  className="overflow-hidden rounded-3xl bg-white border border-slate-200 transition hover:border-slate-300"
                >
                  {/* Product Image */}
                  <div className="h-56 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
                    {product.images && product.images.length > 0 ? (
                      <img 
                        src={product.images[0]} 
                        alt={product.name}
                        className="h-full w-full object-cover"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<svg class="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                        }}
                      />
                    ) : (
                      <Package className="h-16 w-16 text-slate-400" />
                    )}
                  </div>

                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-slate-900 line-clamp-2">
                      {product.name}
                    </h3>
                    
                    {product.description && (
                      <p className="mt-2 text-sm text-slate-600 line-clamp-2">
                        {product.description}
                      </p>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <div>
                        <p className="text-2xl font-bold text-blue-600">৳{product.price}</p>
                        <p className="text-sm text-slate-500">Stock: {product.stock}</p>
                      </div>
                      {product.category && (
                        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-700">
                          {product.category?.name || 'Uncategorized'}
                        </span>
                      )}
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
