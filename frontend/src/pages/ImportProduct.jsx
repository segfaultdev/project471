import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { categoriesAPI, importAPI, productsAPI, storesAPI } from "../api/api";
import { Download, ArrowLeft, Loader2, ExternalLink } from "lucide-react";
import { useEffect } from "react";

const getApiErrorMessage = (err, fallbackMessage) => {
  const message = err.response?.data?.message || err.response?.data;
  return typeof message === "string" ? message : fallbackMessage;
};

const ImportProduct = () => {
  const navigate = useNavigate();
  const [link, setLink] = useState("");
  const [stores, setStores] = useState([]);
  const [selectedStoreId, setSelectedStoreId] = useState("");
  const [storesLoading, setStoresLoading] = useState(true);
  const [importing, setImporting] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [categories, setCategories] = useState([]);
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);

  const [product, setProduct] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    categoryId: "",
    customCategory: "",
    storeId: "",
    image: "",
    caption: "",
    socialLink: "",
  });
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    fetchStores();
    fetchCategories();
  }, []);

  useEffect(() => {
    if (selectedStoreId && product.storeId !== selectedStoreId) {
      setProduct((current) => ({
        ...current,
        storeId: selectedStoreId,
      }));
    }
  }, [selectedStoreId, product.storeId]);

  const fetchStores = async () => {
    try {
      const response = await storesAPI.getMyStores();
      const storesData = response.data || response || [];
      setStores(storesData);

      if (storesData.length > 0) {
        const defaultStoreId = storesData.at(0)?.id || "";
        setSelectedStoreId((currentSelectedStoreId) =>
          storesData.some((store) => store.id === currentSelectedStoreId)
            ? currentSelectedStoreId
            : defaultStoreId,
        );
        fetchCategoriesForStore(defaultStoreId);
      }
    } catch (err) {
      console.error("Failed to fetch stores:", err);
    } finally {
      setStoresLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await categoriesAPI.getAll();
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch categories:', err);
    }
  };

  const fetchCategoriesForStore = async (storeId) => {
    try {
      const response = await categoriesAPI.getByStore(storeId);
      setCategories(response.data || []);
    } catch (err) {
      console.error('Failed to fetch store categories:', err);
    }
  };

  const handleImport = async () => {
    if (!link.trim()) {
      setError("Please enter a valid link");
      return;
    }

    setImporting(true);
    setError("");
    setSuccess("");

    try {
      const response = await importAPI.importSocialProduct(link);
      const importedProduct = response.data;

      setProduct((current) => ({
        ...current,
        name: importedProduct.name || "",
        description:
          importedProduct.description || importedProduct.caption || "",
        price:
          importedProduct.price === undefined || importedProduct.price === null
            ? ""
            : importedProduct.price.toString(),
        stock:
          importedProduct.stock === undefined || importedProduct.stock === null
            ? ""
            : importedProduct.stock.toString(),
        categoryId: "",
        customCategory: importedProduct.category || "",
        storeId: selectedStoreId,
        image: importedProduct.image || "",
        caption: importedProduct.caption || "",
        socialLink: importedProduct.socialLink || link.trim(),
      }));
      setImagePreview(importedProduct.image || null);
      setSuccess(
        "Demo product info imported. Review and edit before publishing.",
      );
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to import demo product info. Please try a demo link.",
        ),
      );
    } finally {
      setImporting(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (e.target.name === "storeId") {
      setSelectedStoreId(e.target.value);
      fetchCategoriesForStore(e.target.value);
    }

    setProduct({
      ...product,
      [name]: value,
    });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
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
    setError("");
    setSuccess("");
    setSaving(true);

    try {
      let categoryId = product.categoryId;

      // If custom category is provided, create it first
      if (product.customCategory.trim() && !categoryId) {
        try {
          const newCategoryRes = await categoriesAPI.create({
            name: product.customCategory,
            storeId: product.storeId,
          });
          categoryId = newCategoryRes.data.id;
        } catch (err) {
          setError('Failed to create category');
          setSaving(false);
          return;
        }
      }

      const productData = {
        name: product.name,
        description: product.description,
        price: parseFloat(product.price),
        stock: parseInt(product.stock, 10) || 0,
        categoryId: categoryId || null,
        storeId: product.storeId,
        images: product.image ? [product.image] : [],
      };

      await productsAPI.create(productData);
      navigate("/my-products");
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to create product"));
      setSaving(false);
    }
  };

  if (storesLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-950" />
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="min-h-screen bg-[#f6f1e7] flex items-center justify-center px-6">
        <div className="mx-auto max-w-md rounded-[2.5rem] bg-emerald-950 p-8 text-center text-white shadow-[0_30px_100px_rgba(8,28,21,0.22)] md:p-12">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950 mx-auto mb-6">
            <Download className="h-10 w-10" />
          </div>
          <h2 className="text-3xl font-black tracking-[-0.04em] mb-2">
            Create a Store First
          </h2>
          <p className="text-lg text-white/70 mb-6">
            You need to create a store before importing products.
          </p>
          <Link
            to="/my-stores"
            className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
          >
            Go to My Stores
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f6f1e7]">
      <div className="mx-auto max-w-4xl px-6 py-10 lg:px-8">

        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <Download className="h-4 w-4" />
                Seller Panel
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Import Product
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                Paste your Facebook or Instagram product link to import product
                information.
              </p>
            </div>
            <Link
              to="/my-products"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 font-black text-white transition hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Products
            </Link>
          </div>
        </section>

        {error && (
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4">
            <p className="font-semibold text-red-700">{error}</p>
            <button
              onClick={() => setError("")}
              className="rounded-full p-1 hover:bg-red-100"
            >
              <svg
                className="h-4 w-4 text-red-700"
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

        {success && (
          <div className="mt-8 flex items-center justify-between rounded-2xl border border-lime-300 bg-lime-100 p-4">
            <p className="font-black text-emerald-950">{success}</p>
            <button
              onClick={() => setSuccess("")}
              className="rounded-full p-1 hover:bg-lime-200"
            >
              <svg
                className="h-4 w-4 text-emerald-950"
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


        <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-8 shadow-sm backdrop-blur">
          <div className="flex items-start gap-4 mb-6">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
              <ExternalLink className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-black text-emerald-950 text-xl">
                Step 1: Import from Link
              </h3>
              <p className="text-sm font-semibold text-emerald-950/60">
                Paste a Facebook or Instagram product post link
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row">
            <input
              type="text"
              placeholder="Paste Facebook or Instagram product post link"
              value={link}
              onChange={(e) => setLink(e.target.value)}
              className="flex-1 rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
              disabled={importing}
            />
            <button
              onClick={handleImport}
              disabled={importing || !link.trim()}
              className="inline-flex items-center gap-2 rounded-full bg-emerald-950 px-8 py-4 font-black text-white transition hover:bg-emerald-900 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
            >
              {importing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Importing...
                </>
              ) : (
                <>
                  <Download className="h-5 w-5" />
                  Import Product
                </>
              )}
            </button>
          </div>

          <p className="mt-5 text-xs font-semibold text-emerald-950/50">
            Demo note: this matches predefined public demo data in the backend
            only. It does not scrape Facebook/Instagram or call platform APIs.
          </p>
        </section>


        {product.name && (
          <form
            onSubmit={handleSubmit}
            className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-8 shadow-sm backdrop-blur"
          >
            <div className="flex items-start gap-4 mb-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                <Download className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-black text-emerald-950 text-xl">
                  Step 2: Review & Edit Product Details
                </h3>
                <p className="text-sm font-semibold text-emerald-950/60">
                  Verify the imported information and make any necessary changes
                </p>
              </div>
            </div>

            <div className="space-y-6">
              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-black text-emerald-950 mb-2"
                >
                  Product Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={product.name}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-black text-emerald-950 mb-2"
                >
                  Description / Caption
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={product.description}
                  onChange={handleChange}
                  rows={5}
                  className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                />
              </div>

              <div className="grid gap-6 md:grid-cols-3">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-black text-emerald-950 mb-2"
                  >
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
                    className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="stock"
                    className="block text-sm font-black text-emerald-950 mb-2"
                  >
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
                    className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                  />
                </div>

                <div>
                  <label
                    htmlFor="category"
                    className="block text-sm font-black text-emerald-950 mb-2"
                  >
                    Category
                  </label>
                  {!showNewCategoryInput ? (
                    <div className="space-y-2">
                      <select
                        id="category"
                        name="categoryId"
                        value={product.categoryId}
                        onChange={(e) => {
                          setProduct({
                            ...product,
                            categoryId: e.target.value,
                            customCategory: "",
                          });
                        }}
                        className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      >
                        <option value="">Select a category...</option>
                        {categories.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={() => setShowNewCategoryInput(true)}
                        className="w-full rounded-xl px-3 py-2 text-xs font-black text-emerald-950 transition hover:bg-lime-100"
                      >
                        Create New Category
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <input
                        type="text"
                        value={product.customCategory}
                        onChange={(e) => setProduct({
                          ...product,
                          customCategory: e.target.value,
                          categoryId: "",
                        })}
                        placeholder="Enter new category name..."
                        className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      />

                      <button
                        type="button"
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setProduct({
                            ...product,
                            customCategory: "",
                            categoryId: "",
                          });
                        }}
                        className="w-full rounded-xl px-3 py-2 text-xs font-black text-emerald-950/70 transition hover:bg-lime-100"
                      >
                        Back to Existing Categories
                      </button>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label
                  htmlFor="storeId"
                  className="block text-sm font-black text-emerald-950 mb-2"
                >
                  Store *
                </label>
                <select
                  id="storeId"
                  name="storeId"
                  value={product.storeId}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-5 py-4 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                >
                  {stores.map((store) => (
                    <option key={store.id} value={store.id}>
                      {store.name}
                    </option>
                  ))}
                </select>
              </div>


              <div className="border-t border-emerald-950/10 pt-6 mt-6">
                <h3 className="text-lg font-black text-emerald-950 mb-4">
                  Product Image
                </h3>

                <div className="flex flex-col items-center">
                  {imagePreview && (
                    <div className="mb-4 relative group">
                      <img
                        src={imagePreview}
                        alt="Product preview"
                        className="h-48 w-48 object-cover rounded-3xl border-2 border-emerald-950/10"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          setImagePreview(null);
                          setProduct({ ...product, image: "" });
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
                    <div className="flex flex-col items-center justify-center border-2 border-dashed border-emerald-950/20 rounded-3xl p-10 hover:border-lime-300 hover:bg-lime-50 transition-all">
                      <svg
                        className="h-16 w-16 text-emerald-950/40 mb-4"
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
                      <span className="text-base font-black text-emerald-950 mb-1">
                        Upload Product Image
                      </span>
                      <span className="text-sm font-semibold text-emerald-950/60">
                        PNG, JPG, GIF up to 5MB
                      </span>
                      <span className="text-xs font-semibold text-emerald-950/40 mt-2">
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

              <div className="flex flex-col gap-4 pt-6 sm:flex-row">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded-full border-2 border-emerald-950/20 px-8 py-4 font-black text-emerald-950 transition hover:bg-emerald-950/5"
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
