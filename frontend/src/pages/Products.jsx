import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { productsAPI } from '../api/api';
import { Package, Loader2, GitCompare } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await productsAPI.getAll();
      setProducts(response.data);
    } catch (err) {
      setError('Failed to load products');
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
          <p className="text-slate-600 text-lg">Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Browse Products</h1>
          <p className="text-slate-600">Explore products from all vendors in our marketplace</p>
        </div>

        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 mb-6 shadow-sm">
            <p className="text-red-700 font-medium">{error}</p>
          </div>
        )}

        {products.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-md">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mx-auto mb-6">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">No Products Yet</h3>
            <p className="text-slate-600">Check back later for amazing products from our vendors!</p>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => (
              <div
                key={product.id}
                className="group rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-md transition-all duration-200 hover:border-slate-300 hover:shadow-lg"
              >
                {/* Product Image */}
                <div className="h-48 w-full bg-gradient-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img 
                      src={product.images[0]} 
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<svg class="h-20 w-20 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"></path></svg>';
                      }}
                    />
                  ) : (
                    <Package className="h-20 w-20 text-slate-400" />
                  )}
                </div>
                
                <div className="p-6">
                  <h3 className="text-xl font-bold text-slate-900 mb-3 line-clamp-2">
                    {product.name}
                  </h3>
                  
                  <div className="mb-4">
                    <p className="text-3xl font-bold text-blue-600">
                      ${parseFloat(product.price).toFixed(2)}
                    </p>
                  </div>

                  <p className="text-slate-600 text-sm mb-4 line-clamp-2 leading-relaxed">
                    {product.description || 'No description available'}
                  </p>

                  <div className="flex flex-wrap gap-2 mb-4">
                    {product.category && (
                      <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                        {product.category}
                      </span>
                    )}
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      product.stock > 10 
                        ? 'bg-green-50 text-green-700'
                        : product.stock > 0
                        ? 'bg-yellow-50 text-yellow-700'
                        : 'bg-red-50 text-red-700'
                    }`}>
                      {product.stock > 0 ? `${product.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>

                  {product.store && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-600 mb-3">
                        <span className="font-medium text-slate-900">Store:</span> {product.store.name}
                      </p>
                      <Link
                        to={`/compare/${product.id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 text-blue-700 font-medium hover:bg-blue-100 transition-colors duration-200"
                      >
                        <GitCompare className="h-4 w-4" />
                        Compare
                      </Link>
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

export default Products;
