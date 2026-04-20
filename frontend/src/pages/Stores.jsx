import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storesAPI } from '../api/api';
import { Store, Loader2, MapPin, Phone, ShoppingBag, ArrowRight, Search, Package } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Stores = () => {
  const { isVendor } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getAll();
      setStores(response.data);
    } catch (err) {
      setError('Failed to load stores');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredStores = stores.filter(store =>
    store.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    store.description?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        {/* Header Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl font-bold text-slate-900 mb-2">Browse Stores</h1>
              <p className="text-lg text-slate-600">
                Discover amazing stores and products
              </p>
            </div>
            <Link
              to={isVendor() ? "/my-orders" : "/customer-orders"}
              className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-lg"
            >
              <Package className="h-5 w-5" />
              My Orders
            </Link>
          </div>

          {/* Search Bar */}
          <div className="relative max-w-2xl">
            <input
              type="text"
              placeholder="Search stores by name or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-xl border border-slate-300 px-5 py-3.5 text-slate-900 shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
            />
            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
          </div>
        </div>

        {/* Stats Bar */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-blue-100 p-2.5">
                <Store className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stores.length}</p>
                <p className="text-sm text-slate-600">Total Stores</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-green-100 p-2.5">
                <ShoppingBag className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{stores.filter(s => s.isActive).length}</p>
                <p className="text-sm text-slate-600">Active Stores</p>
              </div>
            </div>
          </div>
          
          <div className="rounded-xl bg-white p-5 border border-slate-200 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-purple-100 p-2.5">
                <Search className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-slate-900">{filteredStores.length}</p>
                <p className="text-sm text-slate-600">Search Results</p>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 mb-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {filteredStores.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
            <div className="flex h-16 w-16 items-center justify-center rounded-xl bg-slate-100 text-slate-400 mx-auto mb-4">
              <Store className="h-8 w-8" />
            </div>
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Stores Found</h3>
            <p className="text-slate-600">Try adjusting your search or check back later.</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <div
                key={store.id}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
              >
                {/* Banner/Cover Image */}
                <div className="relative h-40 w-full bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 overflow-hidden">
                  {store.banner ? (
                    <img 
                      src={store.banner} 
                      alt={`${store.name} banner`}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center">
                      <Store className="h-16 w-16 text-slate-300" />
                    </div>
                  )}
                  
                  {/* Status Badge */}
                  <div className="absolute top-3 right-3">
                    <span className={`rounded-full px-2.5 py-1 text-xs font-semibold shadow-md backdrop-blur-sm ${
                      store.isActive 
                        ? 'bg-green-500/90 text-white' 
                        : 'bg-slate-500/90 text-white'
                    }`}>
                      {store.isActive ? '● Active' : '○ Inactive'}
                    </span>
                  </div>
                </div>
                
                <div className="p-5">
                  {/* Store Logo & Name */}
                  <div className="flex items-start gap-3 mb-4">
                    <div className="h-14 w-14 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 border-3 border-white shadow-md overflow-hidden flex-shrink-0 flex items-center justify-center -mt-9">
                      {store.logo ? (
                        <img 
                          src={store.logo} 
                          alt={`${store.name} logo`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = `<span class="text-xl font-bold text-white">${store.name.charAt(0).toUpperCase()}</span>`;
                          }}
                        />
                      ) : (
                        <span className="text-xl font-bold text-white">{store.name.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0 pt-0.5">
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-1 mb-0.5">
                        {store.name}
                      </h3>
                      {store.slug && (
                        <p className="text-xs text-blue-600 font-medium">
                          @{store.slug}
                        </p>
                      )}
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-2 leading-relaxed text-sm">
                    {store.description || 'Discover amazing products from this store'}
                  </p>

                  {/* Contact Info */}
                  <div className="space-y-2 mb-4 text-sm">
                    {store.address && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="rounded-lg bg-slate-100 p-1.5">
                          <MapPin className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <span className="truncate">{store.address}</span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-2 text-slate-600">
                        <div className="rounded-lg bg-slate-100 p-1.5">
                          <Phone className="h-3.5 w-3.5 text-slate-500" />
                        </div>
                        <span>{store.phone}</span>
                      </div>
                    )}
                  </div>

                  {/* Visit Store Button */}
                  <Link
                    to={store.slug ? `/store/${store.slug}` : '#'}
                    className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 font-semibold text-white transition-all duration-200 hover:bg-blue-700 hover:shadow-md group"
                  >
                    <ShoppingBag className="h-4 w-4" />
                    Visit Store
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Link>

                  {store.owner && (
                    <div className="mt-3 pt-3 border-t border-slate-100">
                      <p className="text-xs text-slate-500">
                        <span className="font-medium text-slate-700">Vendor:</span> {store.owner.firstName} {store.owner.lastName}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;
