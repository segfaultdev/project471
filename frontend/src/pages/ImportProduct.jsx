import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { productsAPI, storesAPI } from '../api/api';
import { Download, ArrowLeft, Loader2, ExternalLink } from 'lucide-react';
import { useEffect } from 'react';

const ImportProduct = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [stores, setStores] = useState([]);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  
  const [product, setProduct] = useState({
    name: '',
    description: '',
    price: '',
    stock: '',
    category: '',
    storeId: '',
    image: '',
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchStores();
  }, []);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getMyStores();
      setStores(response.data);
      if (response.data.length > 0) {
        setProduct(prev => ({ ...prev, storeId: response.data[0].id }));
      }
    } catch (err) {
      console.error('Failed to fetch stores:', err);
    }
  };

  const handleImport = async () => {
    if (!link.trim()) {
      setError('Please enter a valid link');
      return;
    }

    setImporting(true);
    setError('');

    // Simulate importing product data from link
    // In a real implementation, this would call a backend API to scrape the link
    setTimeout(() => {
      setProduct({
        name: 'Imported Product from Social Media',
        description: 'This product was imported using a Facebook or Instagram link. Edit the details as needed.',
        price: '1200',
        stock: '10',
        category: 'Fashion',
        storeId: product.storeId,
        image: '',
      });
      setImporting(false);
    }, 1500);
  };

  const handleChange = (e) => {
    setProduct({
      ...product,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setError('Please select a valid image file');
        return;
      }
      
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setProduct({
          ...product,
          image: base64String,
        });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const productData = {
        ...product,
        price: parseFloat(product.price),
        stock: parseInt(product.stock) || 0,
        images: product.image ? [product.image] : [],
      };
      
      // Remove the single image field as backend expects images array
      delete productData.image;

      await productsAPI.create(productData);
      navigate('/my-products');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create product');
      setSaving(false);
    }
  };

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-6">
        <div className="text-center max-w-md">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mx-auto mb-6">
            <Download className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Create a Store First</h2>
          <p className="text-slate-600 mb-6">You need to create a store before importing products.</p>
          <Link
            to="/my-stores"
            className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
          >
            Go to My Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
                Seller Panel
              </p>
              <h1 className="mt-2 text-3xl font-bold text-slate-900">
                Import Product
              </h1>
              <p className="mt-2 text-slate-600">
                Paste your Facebook or Instagram product link to import product information.
              </p>
            </div>
            <Link
              to="/my-products"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
            >
              <ArrowLeft className="h-4 w-4" />
              Back
            </Link>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {/* Import Section */}
        <div className="rounded-3xl bg-white border border-slate-200 p-8 mb-8">
          <div className="flex items-start gap-3 mb-6">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <ExternalLink className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-semibold text-slate-900">Step 1: Import from Link</h3>
              <p className="text-sm text-slate-600">Paste a product link from Facebook or Instagram</p>
            </div>
          </div>

          <div className="flex gap-3">
            <input
              type="text"
              placeholder="https://facebook.com/... or https://instagram.com/..."
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              disabled={importing}
            />
            <button
              onClick={handleImport}
              disabled={importing || !link.trim()}
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {importing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Import
                </>
              )}
            </button>
          </div>

          <p className="mt-4 text-xs text-slate-500">
            Note: This feature extracts public product information from social media posts. Make sure the link is publicly accessible.
          </p>
        </div>

        {/* Product Form */}
        {product.name && (
          <form onSubmit={handleSubmit} className="rounded-3xl bg-white border border-slate-200 p-8">
            <div className="flex items-start gap-3 mb-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-green-50 text-green-600">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">Step 2: Review & Edit Product Details</h3>
                <p className="text-sm text-slate-600">Verify the imported information and make any necessary changes</p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label htmlFor="name" className="block text-sm font-semibold text-slate-900 mb-2">
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-semibold text-slate-900 mb-2">
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label htmlFor="price" className="block text-sm font-semibold text-slate-900 mb-2">
                    Price (৳) *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={product.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="stock" className="block text-sm font-semibold text-slate-900 mb-2">
                    Stock Quantity *
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={product.stock}
                    onChange={handleChange}
                    required
                    min="0"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  />
                </div>

                <div>
                  <label htmlFor="category" className="block text-sm font-semibold text-slate-900 mb-2">
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={product.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="e.g., Fashion"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="storeId" className="block text-sm font-semibold text-slate-900 mb-2">
                  Store *
                </label>
                <select
                  id="storeId"
                  name="storeId"
                  value={product.storeId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Product Image Section */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">Product Image</h3>
                
                <div className="flex flex-col items-center">
                  {imagePreview && (
                    <div className="mb-4 relative group">
                      <img 
                        src={imagePreview} 
                        alt="Product preview" 
                        className="h-48 w-48 object-cover rounded-3xl border-2 border-slate-200"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setProduct({ ...product, image: '' });
                        }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                  <label className="w-full max-w-md cursor-pointer">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl p-10 hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <svg className="h-16 w-16 text-slate-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-base font-semibold text-slate-700 mb-1">Upload Product Image</span>
                      <span className="text-sm text-slate-500">PNG, JPG, GIF up to 5MB</span>
                      <span className="text-xs text-slate-400 mt-2">Recommended: 800x800px</span>
                    </div>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {saving ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5" />
                      Publish Product
                    </>
                  )}
                </button>

                <Link
                  to="/my-products"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                  Cancel
                </Link>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default ImportProduct;
