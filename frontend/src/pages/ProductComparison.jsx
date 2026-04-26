import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { productsAPI } from '../api/api';
import { Loader2, ChevronLeft, Star, Truck, TrendingDown } from 'lucide-react';

const ProductComparison = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [mainProduct, setMainProduct] = useState(null);
  const [similarProducts, setSimilarProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortBy, setSortBy] = useState('price');
  
  // Filter states
  const [minPrice, setMinPrice] = useState(0);
  const [maxPrice, setMaxPrice] = useState(10000);
  const [minRating, setMinRating] = useState(0);
  const [maxDelivery, setMaxDelivery] = useState(30);

  useEffect(() => {
    fetchComparisonData();
  }, [productId]);

  const fetchComparisonData = async () => {
    try {
      console.log('Fetching product:', productId);
      const productRes = await productsAPI.getOne(productId);
      console.log('Main product:', productRes.data);
      setMainProduct(productRes.data);

      const similarRes = await productsAPI.getSimilarProducts(productId);
      console.log('Similar products:', similarRes.data);
      setSimilarProducts(similarRes.data || []);
    } catch (err) {
      console.error('Error fetching comparison data:', err);
      setError(err.response?.data?.message || 'Failed to load comparison data');
    } finally {
      setLoading(false);
    }
  };

  const getSortedAndFilteredProducts = () => {
    let filtered = similarProducts.filter((product) => {
      const price = parseFloat(product.price || 0);
      const rating = parseFloat(product.store?.rating || 0);
      const delivery = product.store?.deliveryDays || 0;

      return (
        price >= minPrice &&
        price <= maxPrice &&
        rating >= minRating &&
        delivery <= maxDelivery
      );
    });

    if (sortBy === 'price') {
      filtered.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => (b.store?.rating || 0) - (a.store?.rating || 0));
    } else if (sortBy === 'delivery') {
      filtered.sort((a, b) => (a.store?.deliveryDays || 0) - (b.store?.deliveryDays || 0));
    }

    return filtered;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-slate-600 text-lg">Loading comparison...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="rounded-lg border border-red-200 bg-red-50 p-6">
            <h2 className="text-red-900 font-bold mb-2">Error</h2>
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!mainProduct) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20">
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
          <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-6">
            <p className="text-yellow-700">Product not found</p>
          </div>
        </div>
      </div>
    );
  }

  const sortedProducts = getSortedAndFilteredProducts();

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-8">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <button
          onClick={() => navigate(-1)}
          className="mb-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors duration-200"
        >
          <ChevronLeft className="h-4 w-4" />
          Back
        </button>

        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 mb-2">Product Comparison</h1>
          <p className="text-slate-600">Comparing: {mainProduct.name}</p>
        </div>

        {similarProducts.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-md">
            <p className="text-slate-600 mb-2">No similar products found</p>
            <p className="text-sm text-slate-500">Try another product or check back later</p>
          </div>
        ) : (
          <>
            <div className="mb-8 rounded-lg bg-white border border-slate-200 p-6 shadow-sm">
              {/* Filters */}
              <div>
                <h3 className="text-sm font-bold text-slate-900 mb-4">Sort By</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Price Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Price Range</label>
                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-slate-600">Min Price</label>
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            value={minPrice}
                            onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value) || 0, maxPrice))}
                            className="w-24 px-2 py-1 rounded border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="0"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="10"
                          value={minPrice}
                          onChange={(e) => setMinPrice(Math.min(parseInt(e.target.value), maxPrice))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div>
                        <div className="flex justify-between items-center mb-1">
                          <label className="text-xs text-slate-600">Max Price</label>
                          <input
                            type="number"
                            min="0"
                            max="10000"
                            value={maxPrice}
                            onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value) || 10000, minPrice))}
                            className="w-24 px-2 py-1 rounded border border-slate-300 text-xs font-medium text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="10000"
                          />
                        </div>
                        <input
                          type="range"
                          min="0"
                          max="10000"
                          step="10"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Math.max(parseInt(e.target.value), minPrice))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Rating Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Minimum Rating</label>
                    <div className="space-y-2">
                      <select
                        value={minRating}
                        onChange={(e) => setMinRating(parseFloat(e.target.value))}
                        className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white text-slate-900 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      >
                        <option value={0}>All Ratings (0+)</option>
                        <option value={1}>1+ Stars</option>
                        <option value={2}>2+ Stars</option>
                        <option value={3}>3+ Stars</option>
                        <option value={4}>4+ Stars</option>
                        <option value={5}>5 Stars</option>
                      </select>
                      <div className="flex gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < minRating
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Delivery Filter */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-2">Max Delivery Time</label>
                    <div className="space-y-2">
                      <div>
                        <label className="text-xs text-slate-600">Max: {maxDelivery} days</label>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          step="1"
                          value={maxDelivery}
                          onChange={(e) => setMaxDelivery(parseInt(e.target.value))}
                          className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer"
                        />
                      </div>
                      <div className="text-xs text-slate-600 bg-slate-50 p-2 rounded">
                        Shows sellers delivering in {maxDelivery} days or less
                      </div>
                    </div>
                  </div>
                </div>

                {/* Filter Reset Button */}
                <button
                  onClick={() => {
                    setMinPrice(0);
                    setMaxPrice(10000);
                    setMinRating(0);
                    setMaxDelivery(30);
                  }}
                  className="mt-4 text-xs font-semibold text-blue-600 hover:text-blue-700 px-3 py-1 rounded hover:bg-blue-50"
                >
                  Reset Filters
                </button>
              </div>
            </div>

            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm text-slate-600">
                Showing <span className="font-bold text-slate-900">{sortedProducts.length}</span> of{' '}
                <span className="font-bold text-slate-900">{similarProducts.length}</span> similar products
              </p>
            </div>

            {sortedProducts.length === 0 ? (
              <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center shadow-md">
                <p className="text-slate-600 mb-2">No products match your filters</p>
                <p className="text-sm text-slate-500">Try adjusting your filters</p>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {/* Main Product Card */}
              <div className="rounded-xl border-2 border-blue-600 bg-blue-50 p-6 shadow-md">
                <div className="mb-2">
                  <span className="inline-block px-3 py-1 rounded-full text-xs font-bold bg-blue-600 text-white mb-2">
                    ORIGINAL
                  </span>
                </div>

                <div className="mb-4 h-40 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                  {mainProduct.images && mainProduct.images[0] ? (
                    <img src={mainProduct.images[0]} alt={mainProduct.name} className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                    </svg>
                  )}
                </div>

                <h3 className="font-bold text-slate-900 mb-3 text-lg">{mainProduct.name}</h3>

                <div className="space-y-3 pt-3 border-t border-slate-200">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Price</span>
                    <span className="text-2xl font-bold text-blue-600">${parseFloat(mainProduct.price || 0).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Store</span>
                    <span className="text-sm font-medium text-slate-900">{mainProduct.store?.name || 'N/A'}</span>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Rating</span>
                    <div className="flex items-center gap-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-4 w-4 ${
                            i < Math.round(mainProduct.store?.rating || 0)
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-slate-300'
                          }`}
                        />
                      ))}
                      <span className="text-xs font-bold ml-1 text-slate-900">{parseFloat(mainProduct.store?.rating || 0).toFixed(1)}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Delivery</span>
                    <div className="flex items-center gap-1">
                      <Truck className="h-4 w-4 text-slate-400" />
                      <span className="text-sm font-medium text-slate-900">{mainProduct.store?.deliveryDays || 3} days</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <span className="text-sm text-slate-600">Stock</span>
                    <span className={`text-sm font-bold ${mainProduct.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {mainProduct.stock > 0 ? `${mainProduct.stock} available` : 'Out of stock'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Similar Products */}
              {sortedProducts.map((product) => (
                <div key={product.id} className="rounded-xl border border-slate-200 bg-white p-6 shadow-md hover:shadow-lg transition-shadow">
                  <div className="mb-4 h-40 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden">
                    {product.images && product.images[0] ? (
                      <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                    ) : (
                      <svg className="h-16 w-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                      </svg>
                    )}
                  </div>

                  <h3 className="font-bold text-slate-900 mb-2 line-clamp-2 text-sm">{product.name}</h3>

                  <div className="mb-4">
                    <p className="text-2xl font-bold text-blue-600">${parseFloat(product.price || 0).toFixed(2)}</p>
                    {mainProduct.price && mainProduct.price !== product.price && (
                      <div className="flex items-center gap-1 mt-1">
                        <TrendingDown className="h-4 w-4 text-green-600" />
                        <span className="text-xs font-bold text-green-600">
                          Save {Math.round((1 - parseFloat(product.price) / parseFloat(mainProduct.price)) * 100)}%
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 text-sm border-t border-slate-200 pt-3">
                    <div className="flex justify-between">
                      <span className="text-slate-600">Store</span>
                      <span className="font-medium text-slate-900">{product.store?.name || 'N/A'}</span>
                    </div>

                    <div className="flex justify-between items-center">
                      <span className="text-slate-600">Rating</span>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.round(product.store?.rating || 0)
                                ? 'fill-yellow-400 text-yellow-400'
                                : 'text-slate-300'
                            }`}
                          />
                        ))}
                        <span className="text-xs font-bold ml-1 text-slate-900">{parseFloat(product.store?.rating || 0).toFixed(1)}</span>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Delivery</span>
                      <span className="font-medium text-slate-900">{product.store?.deliveryDays || 3} days</span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-slate-600">Stock</span>
                      <span className={`font-bold ${product.stock > 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {product.stock > 0 ? `${product.stock} available` : 'Out of stock'}
                      </span>
                    </div>
                  </div>

                  <button
                    className={`w-full mt-4 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
                      product.stock > 0
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}
                    disabled={product.stock === 0}
                  >
                    {product.stock > 0 ? 'View Details' : 'Out of Stock'}
                  </button>
                </div>
              ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default ProductComparison;
