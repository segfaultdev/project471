import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  AlertTriangle,
  ArrowRight,
  Boxes,
  CheckCircle2,
  ImagePlus,
  Loader2,
  Package,
  Plus,
  Store,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";
import { productsAPI, storesAPI } from "../api/api";
import ConfirmModal from "../components/ConfirmModal";

const LOW_STOCK_THRESHOLD = 5;

const emptyProductForm = {
  name: "",
  description: "",
  price: "",
  stock: "",
  category: "",
  storeId: "",
  weight: "",
  image: "",
};

const formatCurrency = (amount) =>
  `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const MyProducts = () => {
  const [products, setProducts] = useState([]);
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [stockChanges, setStockChanges] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [deleteProductTarget, setDeleteProductTarget] = useState(null);
  const [deleteProductLoading, setDeleteProductLoading] = useState(false);
  const [formData, setFormData] = useState(emptyProductForm);
  const [imagePreview, setImagePreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    fetchStores();
  }, []);

  useEffect(() => {
    if (selectedStoreId) {
      fetchProducts(selectedStoreId);
    }
  }, [selectedStoreId]);

  useEffect(() => {
    if (
      !editingProduct &&
      selectedStoreId &&
      formData.storeId !== selectedStoreId
    ) {
      setFormData((current) => ({
        ...current,
        storeId: selectedStoreId,
      }));
    }
  }, [selectedStoreId, editingProduct, formData.storeId]);

  const normalizeArrayResponse = (response) => response?.data || response || [];

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const storesRes = await storesAPI.getMyStores();
      const storesData = normalizeArrayResponse(storesRes);

      setStores(storesData);

      if (storesData.length === 0) {
        setProducts([]);
        setStockChanges({});
        setSelectedStoreId("");
        setLoading(false);
        return;
      }

      setSelectedStoreId((currentSelectedStoreId) =>
        storesData.some((store) => store.id === currentSelectedStoreId)
          ? currentSelectedStoreId
          : storesData.at(0)?.id || "",
      );
    } catch (err) {
      setError("Failed to load products. Please refresh and try again.");
      console.error(err);
      setLoading(false);
    }
  };

  const fetchProducts = async (storeId = selectedStoreId) => {
    if (!storeId) return;

    try {
      setLoading(true);
      setError("");

      const productsRes = await productsAPI.getByStore(storeId);
      const productsData = normalizeArrayResponse(productsRes);

      setProducts(productsData);
      setStockChanges(getInitialStockChanges(productsData));
    } catch (err) {
      setError(
        "Failed to load products for this store. Please refresh and try again.",
      );
      setProducts([]);
      setStockChanges({});
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getInitialStockChanges = (productsList) =>
    productsList.reduce((acc, product) => {
      acc[product.id] = product.stock ?? 0;
      return acc;
    }, {});

  const resetForm = () => {
    setShowForm(false);
    setEditingProduct(null);
    setFormData(
      selectedStoreId
        ? { ...emptyProductForm, storeId: selectedStoreId }
        : emptyProductForm,
    );
    setImagePreview(null);
    setError("");
  };

  const openCreateForm = () => {
    setEditingProduct(null);
    setFormData(
      selectedStoreId
        ? { ...emptyProductForm, storeId: selectedStoreId }
        : emptyProductForm,
    );
    setImagePreview(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleStockChange = (productId, value) => {
    setStockChanges((prev) => ({
      ...prev,
      [productId]: Math.max(0, Number(value) || 0),
    }));
  };

  const handleStockUpdate = async (product) => {
    const updatedStock = stockChanges[product.id] ?? product.stock ?? 0;

    if (Number(updatedStock) === Number(product.stock ?? 0)) {
      setSuccess("Stock is already up to date.");
      setTimeout(() => setSuccess(""), 2200);
      return;
    }

    try {
      await productsAPI.update(product.id, { stock: updatedStock });
      setSuccess(`Stock updated for ${product.name}.`);
      setError("");
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update stock.");
      setSuccess("");
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSelectedStoreChange = (storeId) => {
    setSelectedStoreId(storeId);

    if (!editingProduct) {
      setFormData((current) => ({
        ...current,
        storeId,
      }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError("Image size should be less than 5MB.");
      e.target.value = "";
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setFormData((current) => ({
        ...current,
        image: base64String,
      }));
      setImagePreview(base64String);
      setError("");
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.storeId) {
      setError("Please select a store before saving the product.");
      return;
    }

    const productData = {
      ...formData,
      price: parseFloat(formData.price),
      stock: parseInt(formData.stock, 10) || 0,
      weight: formData.weight ? parseFloat(formData.weight) : undefined,
      images: formData.image ? [formData.image] : [],
    };

    delete productData.image;

    try {
      if (editingProduct) {
        await productsAPI.update(editingProduct.id, productData);
        setSuccess("Product updated successfully.");
      } else {
        await productsAPI.create(productData);
        setSuccess("Product added successfully.");
      }

      resetForm();
      await fetchProducts(selectedStoreId);
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save product.");
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || "",
      description: product.description || "",
      price: product.price?.toString() || "",
      stock: product.stock?.toString() || "0",
      category: product.category || "",
      storeId: product.storeId || product.store?.id || "",
      weight: product.weight?.toString() || "",
      image: product.images?.[0] || "",
    });
    setImagePreview(product.images?.[0] || null);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (product) => {
    setError("");
    setSuccess("");
    setDeleteProductTarget(product);
  };

  const confirmDeleteProduct = async () => {
    if (!deleteProductTarget || deleteProductLoading) return;

    try {
      setDeleteProductLoading(true);
      await productsAPI.delete(deleteProductTarget.id);
      setSuccess("Product deleted successfully.");
      setDeleteProductTarget(null);
      await fetchProducts();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete product.");
    } finally {
      setDeleteProductLoading(false);
    }
  };

  const totalStock = products.reduce(
    (sum, product) => sum + (Number(product.stock) || 0),
    0,
  );
  const lowStockCount = products.filter(
    (product) =>
      product.stock != null &&
      Number(product.stock) <= LOW_STOCK_THRESHOLD &&
      Number(product.stock) > 0,
  ).length;
  const outOfStockCount = products.filter(
    (product) => !product.stock || Number(product.stock) <= 0,
  ).length;
  const selectedStore =
    stores.find((store) => store.id === selectedStoreId) || stores.at(0);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-950" />
          <p className="mt-4 font-black text-emerald-950">
            Loading your products...
          </p>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <main className="min-h-screen bg-[#f6f1e7] px-6 py-10 text-emerald-950 lg:px-8">
        <div className="mx-auto max-w-5xl">
          <div className="rounded-[2.5rem] bg-emerald-950 p-8 text-center text-white shadow-[0_30px_100px_rgba(8,28,21,0.22)] md:p-12">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Store className="h-8 w-8" />
            </div>
            <h1 className="mt-6 text-4xl font-black tracking-[-0.04em]">
              Create a store before adding products.
            </h1>
            <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-white/70">
              Products need to belong to a storefront. Set up your first store,
              then come back to add products, stock, categories, and images.
            </p>
            <Link
              to="/my-stores"
              className="mt-8 inline-flex items-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
            >
              Create Your First Store
              <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <ConfirmModal
        isOpen={Boolean(deleteProductTarget)}
        title="Delete product?"
        message={
          deleteProductTarget
            ? `Delete "${deleteProductTarget.name}"? This cannot be undone.`
            : ""
        }
        onConfirm={confirmDeleteProduct}
        onCancel={() => !deleteProductLoading && setDeleteProductTarget(null)}
        isLoading={deleteProductLoading}
      />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <Package className="h-4 w-4" />
                Product Inventory
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Manage your products
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                Add products, update stock, manage pricing, and keep your
                storefront ready for buyers.
              </p>
            </div>

            {!showForm && (
              <div className="flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/import-product"
                  className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 px-6 py-3.5 font-black text-white transition hover:bg-white/10"
                >
                  <UploadCloud className="h-5 w-5" />
                  Import Product
                </Link>
                <button
                  onClick={openCreateForm}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-300 px-6 py-3.5 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
                >
                  <Plus className="h-5 w-5" />
                  Add Product
                </button>
              </div>
            )}
          </div>
        </section>

        {(error || success) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="font-semibold">{error}</p>
                <button
                  onClick={() => setError("")}
                  className="rounded-full p-1 hover:bg-red-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-between rounded-2xl border border-lime-300 bg-lime-100 p-4 text-emerald-950">
                <p className="font-black">{success}</p>
                <button
                  onClick={() => setSuccess("")}
                  className="rounded-full p-1 hover:bg-lime-200"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Viewing store
              </p>
              <h2 className="mt-1 text-2xl font-black text-emerald-950">
                {selectedStore?.name || "Select a store"}
              </h2>
              <p className="mt-1 text-sm font-semibold text-emerald-950/60">
                Product list, stock stats, and new products are scoped to this
                store.
              </p>
            </div>

            {stores.length > 1 ? (
              <select
                value={selectedStoreId}
                onChange={(e) => handleSelectedStoreChange(e.target.value)}
                className="rounded-full border border-emerald-950/10 bg-[#f6f1e7] px-5 py-3 font-black text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
              >
                {stores.map((store) => (
                  <option key={store.id} value={store.id}>
                    {store.name}
                  </option>
                ))}
              </select>
            ) : (
              <span className="rounded-full bg-[#f6f1e7] px-5 py-3 font-black text-emerald-950">
                {selectedStore?.name}
              </span>
            )}
          </div>
        </section>

        <section className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[2rem] border border-emerald-950/10 bg-white/80 p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
              <Package className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
              Products
            </p>
            <p className="mt-2 text-4xl font-black">{products.length}</p>
          </div>

          <div className="rounded-[2rem] border border-emerald-950/10 bg-white/80 p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950">
              <Boxes className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
              Stock Units
            </p>
            <p className="mt-2 text-4xl font-black">{totalStock}</p>
          </div>

          <div className="rounded-[2rem] border border-emerald-950/10 bg-white/80 p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-200 text-emerald-950">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
              Low Stock
            </p>
            <p className="mt-2 text-4xl font-black">{lowStockCount}</p>
            <p className="mt-2 text-sm font-semibold text-emerald-950/60">
              At or below {LOW_STOCK_THRESHOLD}
            </p>
          </div>

          <div className="rounded-[2rem] border border-emerald-950/10 bg-white/80 p-6 shadow-sm">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-red-100 text-red-700">
              <AlertTriangle className="h-6 w-6" />
            </div>
            <p className="mt-6 text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
              Out of Stock
            </p>
            <p className="mt-2 text-4xl font-black">{outOfStockCount}</p>
          </div>
        </section>

        {showForm && (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                  {editingProduct ? "Edit product" : "New product"}
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950">
                  {editingProduct
                    ? "Update product details"
                    : "Add a product to your store"}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center gap-2 rounded-full border border-emerald-950/10 px-5 py-3 font-black text-emerald-950 transition hover:bg-[#f6f1e7]"
              >
                <X className="h-5 w-5" />
                Close
              </button>
            </div>

            <form
              onSubmit={handleSubmit}
              className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]"
            >
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label
                      htmlFor="name"
                      className="mb-2 block text-sm font-black text-emerald-950"
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
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="Cotton T-shirt"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="storeId"
                      className="mb-2 block text-sm font-black text-emerald-950"
                    >
                      Store *
                    </label>
                    <select
                      id="storeId"
                      name="storeId"
                      value={formData.storeId}
                      onChange={(e) => {
                        handleChange(e);
                        if (!editingProduct) {
                          handleSelectedStoreChange(e.target.value);
                        }
                      }}
                      required
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
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
                    className="mb-2 block text-sm font-black text-emerald-950"
                  >
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full resize-none rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                    placeholder="Describe the product, material, size, color, and key details..."
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-3">
                  <div>
                    <label
                      htmlFor="price"
                      className="mb-2 block text-sm font-black text-emerald-950"
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
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="৳0"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="stock"
                      className="mb-2 block text-sm font-black text-emerald-950"
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
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="weight"
                      className="mb-2 block text-sm font-black text-emerald-950"
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
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="mb-2 block text-sm font-black text-emerald-950"
                  >
                    Category
                  </label>
                  <input
                    type="text"
                    id="category"
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                    placeholder="Fashion, Gadgets, Beauty..."
                  />
                </div>
              </div>

              <div className="rounded-[2rem] bg-[#f6f1e7] p-5">
                <h3 className="text-lg font-black text-emerald-950">
                  Product Image
                </h3>
                <p className="mt-1 text-sm font-semibold text-emerald-950/60">
                  Upload one clear image. Recommended: square product photo.
                </p>

                {imagePreview ? (
                  <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white">
                    <img
                      src={imagePreview}
                      alt="Product preview"
                      className="h-72 w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        setImagePreview(null);
                        setFormData({ ...formData, image: "" });
                      }}
                      className="absolute right-4 top-4 rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:bg-red-600"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ) : (
                  <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-emerald-950/20 bg-white/70 p-10 text-center transition hover:border-lime-300 hover:bg-white">
                    <ImagePlus className="h-14 w-14 text-emerald-950/40" />
                    <span className="mt-4 text-base font-black text-emerald-950">
                      Upload Product Image
                    </span>
                    <span className="mt-1 text-sm font-semibold text-emerald-950/50">
                      PNG, JPG, GIF up to 5MB
                    </span>
                    <input
                      type="file"
                      id="image"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                  </label>
                )}

                <div className="mt-6 flex flex-col gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-8 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {editingProduct ? "Update Product" : "Add Product"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center rounded-full border border-emerald-950/10 px-8 py-4 font-black text-emerald-950 transition hover:bg-white"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </form>
          </section>
        )}

        {products.length === 0 ? (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Package className="h-10 w-10" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-emerald-950">
              No products in this store yet
            </h3>
            <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-emerald-950/60">
              Add your first product manually or import a product post link for{" "}
              {selectedStore?.name || "this store"}.
            </p>
            {!showForm && (
              <button
                onClick={openCreateForm}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-950 px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                Add Your First Product
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </section>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {products.map((product) => {
              const currentStock = Number(
                stockChanges[product.id] ?? product.stock ?? 0,
              );
              const productStock = Number(product.stock ?? 0);

              return (
                <article
                  key={product.id}
                  className="overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
                >
                  <div className="h-52 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-100 to-amber-100">
                    {product.images && product.images.length > 0 ? (
                      <img
                        src={product.images[0]}
                        alt={product.name}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-emerald-950/35">
                        <Package className="h-20 w-20" />
                      </div>
                    )}
                  </div>

                  <div className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <h3 className="truncate text-2xl font-black text-emerald-950">
                          {product.name}
                        </h3>
                        <p className="mt-2 text-sm font-bold text-emerald-950/55">
                          {product.category || "Uncategorized"}
                        </p>
                      </div>
                      <p className="rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                        {formatCurrency(product.price)}
                      </p>
                    </div>

                    <p className="mt-4 line-clamp-2 min-h-12 font-semibold leading-6 text-emerald-950/60">
                      {product.description || "No description added yet."}
                    </p>

                    <div className="mt-5 rounded-[1.5rem] bg-[#f6f1e7] p-4">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <p className="font-black text-emerald-950">
                            Inventory
                          </p>
                          <p className="text-xs font-semibold text-emerald-950/55">
                            Current stock: {productStock}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-black ${
                            productStock > LOW_STOCK_THRESHOLD
                              ? "bg-lime-300 text-emerald-950"
                              : productStock > 0
                                ? "bg-amber-200 text-emerald-950"
                                : "bg-red-100 text-red-700"
                          }`}
                        >
                          {productStock > 0
                            ? `${productStock} left`
                            : "Out of stock"}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center overflow-hidden rounded-full border border-emerald-950/10 bg-white">
                        <button
                          type="button"
                          onClick={() =>
                            handleStockChange(product.id, currentStock - 1)
                          }
                          className="flex h-11 w-12 items-center justify-center font-black text-emerald-950 transition hover:bg-lime-100"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          min="0"
                          value={currentStock}
                          onChange={(e) =>
                            handleStockChange(product.id, e.target.value)
                          }
                          className="w-full border-x border-emerald-950/10 py-2 text-center font-black text-emerald-950 outline-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            handleStockChange(product.id, currentStock + 1)
                          }
                          className="flex h-11 w-12 items-center justify-center font-black text-emerald-950 transition hover:bg-lime-100"
                        >
                          +
                        </button>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleStockUpdate(product)}
                        className="mt-3 w-full rounded-full bg-emerald-950 px-4 py-3 text-sm font-black text-white transition hover:bg-emerald-900"
                      >
                        Save Quantity
                      </button>
                    </div>

                    <div className="mt-5 flex gap-3">
                      <button
                        onClick={() => handleEdit(product)}
                        className="flex-1 rounded-full bg-lime-300 px-4 py-3 font-black text-emerald-950 transition hover:bg-lime-200"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(product)}
                        className="flex-1 rounded-full bg-red-100 px-4 py-3 font-black text-red-700 transition hover:bg-red-200"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                </article>
              );
            })}
          </section>
        )}
      </div>
    </main>
  );
};

export default MyProducts;
