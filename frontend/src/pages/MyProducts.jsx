import { useState, useEffect } from "react";
import { productsAPI, storesAPI } from "../api/api";
import { Link } from "react-router-dom";

const MyProducts = () => {
  const LOW_STOCK_THRESHOLD = 5;
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [stockChanges, setStockChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category: "",
    storeId: "",
    weight: "",
    image: "",
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, storesRes] = await Promise.all([
        productsAPI.getMyProducts(),
        storesAPI.getMyStores(),
      ]);
      setProducts(productsRes.data);
      setStores(storesRes.data);
      setStockChanges(getInitialStockChanges(productsRes.data));
    } catch (err) {
      setError("Failed to load data");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitialStockChanges = (productsList) => {
    return productsList.reduce((acc, product) => {
      acc[product.id] = product.stock ?? 0;
      return acc;
    }, {});
  };

  const handleStockChange = (productId, value) => {
    setStockChanges((prev) => ({
      ...prev,
      [productId]: Math.max(0, Number(value)),
    }));
  };

  const handleStockUpdate = async (product) => {
    const updatedStock = stockChanges[product.id] ?? product.stock ?? 0;
    if (updatedStock === product.stock) {
      setSuccess("Stock is already up to date.");
      setTimeout(() => setSuccess(""), 2000);
      return;
    }

    try {
      await productsAPI.update(product.id, { stock: updatedStock });
      setSuccess(`Stock updated for ${product.name}.`);
      setError("");
      fetchData();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update stock");
      setSuccess("");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result;
        setFormData({
          ...formData,
          image: base64String,
        });
        setImagePreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Convert string numbers to numbers and image to images array
    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock) || 0,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      images: formData.image ? [formData.image] : [],
    };

    // Remove the single image field as backend expects images array
    delete productData.image;

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
      } else {
        await productsAPI.create(productData);
      }

      setShowForm(false);
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category: "",
        storeId: "",
        weight: "",
        image: "",
      });
      setImagePreview(null);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price.toString(),
      stock: product.stock.toString(),
      category: product.category || "",
      storeId: product.storeId,
      weight: product.weight?.toString() || "",
      image: product.images?.[0] || "",
    });
    setImagePreview(product.images?.[0] || null);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this product?"))
      return;

    try {
      await productsAPI.delete(id);
      fetchData();
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product");
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData({
      name: "",
      description: "",
      price: "",
      stock: "",
      category: "",
      storeId: "",
      weight: "",
      image: "",
    });
    setImagePreview(null);
    setError("");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading your products...</p>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-4xl font-bold text-slate-900 mb-8">
            My Products
          </h1>
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <div className="text-6xl mb-4">🏪</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No Stores Yet
            </h3>
            <p className="text-slate-600 mb-6">
              You need to create a store first before adding products.
            </p>
            <a
              href="/my-stores"
              className="rounded-2xl bg-blue-600 px-8 py-3 font-semibold text-white transition hover:bg-blue-700 inline-block"
            >
              Create Store
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between lg:items-end mb-8">
          <div>
            <h1 className="text-4xl font-bold text-slate-900">My Products</h1>
            <p className="text-slate-600 mt-2">
              Manage your product inventory and pricing.
            </p>
          </div>
          {!showForm && (
            <div className="flex gap-3">
              <Link
                to="/import-product"
                className="inline-flex items-center gap-2 rounded-2xl border-2 border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
                Import Product
              </Link>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Product
              </button>
            </div>
          )}
        </div>
        {products.length > 0 && (
          <div className="grid gap-4 md:grid-cols-3 mb-8">
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Total Products
              </p>
              <p className="text-4xl font-bold text-slate-900">
                {products.length}
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Low Stock
              </p>
              <p className="text-4xl font-bold text-orange-600">
                {
                  products.filter(
                    (product) =>
                      product.stock != null &&
                      product.stock <= LOW_STOCK_THRESHOLD,
                  ).length
                }
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Items at or below {LOW_STOCK_THRESHOLD} units
              </p>
            </div>
            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-500 mb-3">
                Out of Stock
              </p>
              <p className="text-4xl font-bold text-red-600">
                {
                  products.filter(
                    (product) => !product.stock || product.stock <= 0,
                  ).length
                }
              </p>
              <p className="text-sm text-slate-500 mt-2">
                Products needing restock
              </p>
            </div>
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}
        {success && (
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 mb-6">
            <p className="text-emerald-700">{success}</p>
          </div>
        )}

        {showForm && (
          <div className="rounded-3xl border border-slate-200 bg-white p-8 mb-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {editingProduct ? "Edit Product" : "Add New Product"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="name"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Product Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="Enter product name"
                  />
                </div>

                <div>
                  <label
                    htmlFor="storeId"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Store *
                  </label>
                  <select
                    id="storeId"
                    name="storeId"
                    value={formData.storeId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 bg-white"
                  >
                    <option value="">Select a store</option>
                    {stores.map((store) => (
                      <option key={store.id} value={store.id}>
                        {store.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  Description
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="4"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 resize-none"
                  placeholder="Product description"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Price *
                  </label>
                  <input
                    type="number"
                    id="price"
                    name="price"
                    value={formData.price}
                    onChange={handleChange}
                    required
                    min="0"
                    step="0.01"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Stock
                  </label>
                  <input
                    type="number"
                    id="stock"
                    name="stock"
                    value={formData.stock}
                    onChange={handleChange}
                    min="0"
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-5">
                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-semibold text-slate-900 mb-2"
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="e.g., Electronics"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="weight"
                  className="block text-sm font-semibold text-slate-900 mb-2"
                >
                  Weight (kg)
                </label>
                <input
                  type="number"
                  id="weight"
                  name="weight"
                  value={formData.weight}
                  onChange={handleChange}
                  min="0"
                  step="0.01"
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="0.00"
                />
              </div>

              {/* Product Image Section */}
              <div className="border-t border-slate-100 pt-6 mt-6">
                <h3 className="text-lg font-bold text-slate-900 mb-4">
                  Product Image
                </h3>

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
                          setFormData({ ...formData, image: "" });
                        }}
                        className="absolute -top-3 -right-3 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                      >
                        <svg
                          className="h-5 w-5"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  )}
                  <label className="w-full max-w-md cursor-pointer">
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-3xl p-10 hover:border-blue-500 hover:bg-blue-50 transition-all">
                      <svg
                        className="h-16 w-16 text-slate-400 mb-4"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      <span className="text-base font-semibold text-slate-700 mb-1">
                        Upload Product Image
                      </span>
                      <span className="text-sm text-slate-500">
                        PNG, JPG, GIF up to 5MB
                      </span>
                      <span className="text-xs text-slate-400 mt-2">
                        Recommended: 800x800px
                      </span>
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

              {/* Form Actions */}
              <div className="flex flex-col sm:flex-row gap-4 pt-6">
                <button
                  type="submit"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {editingProduct ? "Update Product" : "Add Product"}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-2xl border-2 border-slate-200 px-8 py-4 font-semibold text-slate-700 transition hover:bg-slate-50 hover:border-slate-300"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {products.length === 0 ? (
          <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">
              No Products Yet
            </h3>
            <p className="text-slate-600 mb-6">
              Add your first product to start selling!
            </p>
            {!showForm && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-8 py-4 font-semibold text-white transition hover:bg-blue-700"
              >
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Add Your First Product
              </button>
            )}
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div
                key={product.id}
                className="rounded-3xl border border-slate-200 bg-white overflow-hidden transition hover:border-slate-300"
              >
                {/* Product Image */}
                <div className="h-48 w-full bg-linear-to-br from-slate-100 to-slate-200 overflow-hidden flex items-center justify-center">
                  {product.images && product.images.length > 0 ? (
                    <img
                      src={product.images[0]}
                      alt={product.name}
                      className="h-full w-full object-cover"
                      onError={(e) => {
                        e.target.style.display = "none";
                        e.target.parentElement.innerHTML =
                          '<svg class="h-20 w-20 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>';
                      }}
                    />
                  ) : (
                    <svg
                      className="h-20 w-20 text-slate-400"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"
                      />
                    </svg>
                  )}
                </div>

                <div className="p-6">
                  <div className="mb-4">
                    <h3 className="text-xl font-bold text-slate-900 mb-2">
                      {product.name}
                    </h3>
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-3xl font-bold text-blue-600">
                        ${parseFloat(product.price).toFixed(2)}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          product.stock > 10
                            ? "bg-green-50 text-green-700"
                            : product.stock > 0
                              ? "bg-yellow-50 text-yellow-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {product.stock > 0
                          ? `${product.stock} in stock`
                          : "Out of stock"}
                      </span>
                    </div>
                  </div>

                  <p className="text-slate-600 mb-4 line-clamp-2 min-h-12">
                    {product.description || "No description"}
                  </p>

                  <div className="rounded-3xl bg-slate-50 p-4 mb-4 border border-slate-200">
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Update Quantity
                        </p>
                        <p className="text-xs text-slate-500">
                          Adjust stock directly from the inventory panel.
                        </p>
                      </div>
                      <div className="inline-flex items-center rounded-full border border-slate-200 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            handleStockChange(
                              product.id,
                              ((stockChanges[product.id] ?? product.stock) ||
                                0) - 1,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={stockChanges[product.id] ?? product.stock ?? 0}
                          onChange={(e) =>
                            handleStockChange(product.id, e.target.value)
                          }
                          className="w-20 text-center border-x border-slate-200 bg-white py-2 text-sm text-slate-900 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleStockChange(
                              product.id,
                              ((stockChanges[product.id] ?? product.stock) ||
                                0) + 1,
                            )
                          }
                          className="inline-flex h-9 w-9 items-center justify-center text-slate-600 hover:bg-slate-100"
                        >
                          +
                        </button>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleStockUpdate(product)}
                      className="mt-4 w-full rounded-2xl bg-blue-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Save Quantity
                    </button>
                  </div>

                  <div className="space-y-2 mb-4 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Category:</span>
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded-md text-xs font-medium">
                        {product.category || "Uncategorized"}
                      </span>
                    </div>
                    {product.weight && (
                      <div className="flex items-center justify-between text-slate-600">
                        <span className="text-slate-500">Weight:</span>
                        <span>{product.weight} kg</span>
                      </div>
                    )}
                    {product.store && (
                      <div className="flex items-center text-slate-600 pt-2 border-t border-slate-100">
                        <span className="mr-2">🏪</span>
                        <span className="truncate font-medium">
                          {product.store.name}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex space-x-3">
                    <button
                      onClick={() => handleEdit(product)}
                      className="flex-1 rounded-2xl bg-blue-50 text-blue-600 py-2 px-4 font-semibold hover:bg-blue-100 transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(product.id)}
                      className="flex-1 rounded-2xl bg-red-50 text-red-600 py-2 px-4 font-semibold hover:bg-red-100 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyProducts;
