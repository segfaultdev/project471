import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { storesAPI } from '../api/api';
import { Store, Loader2, MapPin, Phone, Mail } from 'lucide-react';

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Browse Stores</h1>
          <p className="text-slate-600">Discover amazing vendors and their stores in our marketplace</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {stores.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-md">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-6">
              <Store className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Stores Yet</h3>
            <p className="text-slate-600">Be the first to create a store and start selling!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <Link
                key={store.id}
                to={store.slug ? `/store/${store.slug}` : '#'}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md transition-all duration-200 hover:border-slate-300 hover:shadow-lg block"
              >
                {/* Banner/Cover Image */}
                <div className="h-32 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
                  {store.banner ? (
                    <img 
                      src={store.banner} 
                      alt={`${store.name} banner`}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<svg class="h-16 w-16 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>';
                      }}
                    />
                  ) : (
                    <Store className="h-16 w-16 text-slate-400" />
                  )}
                </div>
                
                <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="h-12 w-12 rounded-xl bg-slate-100 border border-slate-200 overflow-hidden flex-shrink-0 flex items-center justify-center">
                      {store.logo ? (
                        <img 
                          src={store.logo} 
                          alt={`${store.name} logo`}
                          className="h-full w-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.innerHTML = '<svg class="h-8 w-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>';
                          }}
                        />
                      ) : (
                        <Store className="h-8 w-8 text-slate-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-xl font-bold text-slate-900 line-clamp-2">
                        {store.name}
                      </h3>
                      {store.slug && (
                        <p className="text-sm text-blue-600 mt-1">
                          {import.meta.env.VITE_APP_URL}/store/{store.slug}
                        </p>
                      )}
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold flex-shrink-0 ${
                    store.isActive 
                      ? 'bg-green-50 text-green-700' 
                      : 'bg-slate-100 text-slate-700'
                  }`}>
                    {store.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">
                  {store.description || 'No description available'}
                </p>

                <div className="space-y-2 mb-4 text-sm">
                  {store.address && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <MapPin className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{store.address}</span>
                    </div>
                  )}
                  {store.phone && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Phone className="h-4 w-4 text-slate-400" />
                      <span>{store.phone}</span>
                    </div>
                  )}
                  {store.email && (
                    <div className="flex items-center gap-2 text-slate-600">
                      <Mail className="h-4 w-4 text-slate-400" />
                      <span className="truncate">{store.email}</span>
                    </div>
                  )}
                </div>

                {store.owner && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-sm text-slate-600">
                      <span className="font-medium text-slate-900">Owner:</span> {store.owner.firstName} {store.owner.lastName}
                    </p>
                  </div>
                )}
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Stores;
