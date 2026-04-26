import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { importAPI, storesAPI } from "../api/api";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  ExternalLink,
  ImagePlus,
  Instagram,
  Link2,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Sparkles,
  Store,
  Trash2,
  UploadCloud,
  X,
} from "lucide-react";

const MAX_IMAGE_FILE_SIZE = 5 * 1024 * 1024;

const IMAGE_DIMENSION_LIMITS = {
  logo: { label: "Logo", maxWidth: 512, maxHeight: 512 },
  banner: { label: "Banner", maxWidth: 1200, maxHeight: 400 },
};

const emptyStoreForm = {
  name: "",
  description: "",
  category: "",
  address: "",
  phone: "",
  email: "",
  socialLink: "",
  logo: "",
  banner: "",
};

const getApiErrorMessage = (err, fallbackMessage) => {
  const message = err.response?.data?.message || err.response?.data;
  return typeof message === "string" ? message : fallbackMessage;
};

const resizeImageToLimit = (file, limit) =>
  new Promise((resolve, reject) => {
    const image = new Image();
    const objectUrl = URL.createObjectURL(file);

    image.onload = () => {
      URL.revokeObjectURL(objectUrl);

      const scale = Math.min(
        limit.maxWidth / image.naturalWidth,
        limit.maxHeight / image.naturalHeight,
        1,
      );
      const width = Math.max(1, Math.round(image.naturalWidth * scale));
      const height = Math.max(1, Math.round(image.naturalHeight * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;

      const context = canvas.getContext("2d");

      if (!context) {
        reject(new Error("Unable to process image."));
        return;
      }

      context.drawImage(image, 0, 0, width, height);

      const outputType = file.type === "image/png" ? "image/png" : "image/jpeg";
      const dataUrl =
        outputType === "image/jpeg"
          ? canvas.toDataURL(outputType, 0.86)
          : canvas.toDataURL(outputType);

      resolve(dataUrl);
    };

    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("Unable to read image."));
    };

    image.src = objectUrl;
  });

const getStoreUrl = (store) => {
  if (!store?.slug) return "Not generated yet";
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/store/${store.slug}`;
};

const MyStores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingStore, setEditingStore] = useState(null);
  const [formData, setFormData] = useState(emptyStoreForm);
  const [logoPreview, setLogoPreview] = useState(null);
  const [bannerPreview, setBannerPreview] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [storeImporting, setStoreImporting] = useState(false);

  useEffect(() => {
    fetchMyStores();
  }, []);

  const normalizeArrayResponse = (response) => response?.data || response || [];

  const fetchMyStores = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await storesAPI.getMyStores();
      setStores(normalizeArrayResponse(response));
    } catch (err) {
      setError("Failed to load stores.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setShowForm(false);
    setEditingStore(null);
    setFormData(emptyStoreForm);
    setLogoPreview(null);
    setBannerPreview(null);
    setError("");
    setStoreImporting(false);
  };

  const openCreateForm = () => {
    setEditingStore(null);
    setFormData(emptyStoreForm);
    setLogoPreview(null);
    setBannerPreview(null);
    setShowForm(true);
    setError("");
    setSuccess("");
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleFileChange = async (e, fieldName) => {
    const file = e.target.files[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file.");
      e.target.value = "";
      return;
    }

    if (file.size > MAX_IMAGE_FILE_SIZE) {
      setError("Image size should be less than 5MB.");
      e.target.value = "";
      return;
    }

    try {
      const limit = IMAGE_DIMENSION_LIMITS[fieldName];
      const base64String = limit
        ? await resizeImageToLimit(file, limit)
        : await new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onloadend = () => resolve(reader.result);
            reader.onerror = () => reject(new Error("Unable to read image."));
            reader.readAsDataURL(file);
          });

      setError("");
      setFormData((currentFormData) => ({
        ...currentFormData,
        [fieldName]: base64String,
      }));

      if (fieldName === "logo") {
        setLogoPreview(base64String);
      }

      if (fieldName === "banner") {
        setBannerPreview(base64String);
      }
    } catch (err) {
      setError(err.message);
      e.target.value = "";
    }
  };

  const handleSocialImport = async () => {
    if (!formData.socialLink.trim()) {
      setError("Paste a Facebook or Instagram page link first.");
      return;
    }

    try {
      setStoreImporting(true);
      setError("");
      setSuccess("");

      const response = await importAPI.importSocialStore(formData.socialLink);
      const importedStore = response.data;

      setFormData((current) => ({
        ...current,
        name: importedStore.name || "",
        description: importedStore.description || "",
        category: importedStore.category || "",
        logo: importedStore.logo || "",
        banner: importedStore.banner || "",
        phone: importedStore.phone || "",
        email: importedStore.email || "",
        address: importedStore.address || "",
        socialLink: importedStore.socialLink || current.socialLink,
      }));
      setLogoPreview(importedStore.logo || null);
      setBannerPreview(importedStore.banner || null);
      setSuccess("Demo store info imported. Review and edit before saving.");
      setTimeout(() => setSuccess(""), 3500);
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          "Unable to import demo store info. Please try a demo link.",
        ),
      );
    } finally {
      setStoreImporting(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const payload = {
        ...formData,
        // Keep socialLink in payload only if your backend supports it.
        // It is harmless for many APIs, but remove it in api.js if your backend rejects unknown fields.
      };

      if (editingStore) {
        await storesAPI.update(editingStore.id, payload);
        setSuccess("Store updated successfully.");
      } else {
        await storesAPI.create(payload);
        setSuccess("Store created successfully. You can now add products.");
      }

      resetForm();
      await fetchMyStores();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(getApiErrorMessage(err, "Failed to save store."));
    }
  };

  const handleEdit = (store) => {
    setEditingStore(store);
    setFormData({
      name: store.name || "",
      description: store.description || "",
      category: store.category || "",
      address: store.address || "",
      phone: store.phone || "",
      email: store.email || "",
      socialLink: store.socialLink || "",
      logo: store.logo || "",
      banner: store.banner || "",
    });
    setLogoPreview(store.logo || null);
    setBannerPreview(store.banner || null);
    setShowForm(true);
    setError("");
    setSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      await storesAPI.delete(deleteTarget.id);
      setDeleteTarget(null);
      setSuccess("Store deleted successfully.");
      await fetchMyStores();
      setTimeout(() => setSuccess(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete store.");
      setDeleteTarget(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-950" />
          <p className="mt-4 font-black text-emerald-950">Loading your stores...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <Sparkles className="h-4 w-4" />
                Store Management
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                My Stores
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                Create storefronts, add branding, choose categories, and manage your public store links.
              </p>
            </div>

            {!showForm && (
              <button
                onClick={openCreateForm}
                className="inline-flex items-center justify-center gap-2 rounded-full bg-lime-300 px-6 py-3.5 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200"
              >
                <Store className="h-5 w-5" />
                Create Store
              </button>
            )}
          </div>
        </section>

        {(error || success) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="font-semibold">{error}</p>
                <button onClick={() => setError("")} className="rounded-full p-1 hover:bg-red-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
            {success && (
              <div className="flex items-center justify-between rounded-2xl border border-lime-300 bg-lime-100 p-4 text-emerald-950">
                <p className="font-black">{success}</p>
                <button onClick={() => setSuccess("")} className="rounded-full p-1 hover:bg-lime-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {showForm && (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-6 shadow-sm backdrop-blur md:p-8">
            <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                  {editingStore ? "Edit store" : "New storefront"}
                </p>
                <h2 className="mt-2 text-3xl font-black tracking-tight text-emerald-950">
                  {editingStore ? "Update store details" : "Create your Shoplinker store"}
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

            <div className="mb-8 rounded-[2rem] bg-[#f6f1e7] p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
                <div className="flex-1">
                  <label htmlFor="socialLink" className="mb-2 block text-sm font-black text-emerald-950">
                    Import business profile from Facebook/Instagram
                  </label>
                  <div className="relative">
                    <Link2 className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-950/45" />
                    <input
                      type="url"
                      id="socialLink"
                      name="socialLink"
                      value={formData.socialLink}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-emerald-950/10 bg-white px-12 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="Paste Facebook or Instagram page link"
                    />
                  </div>
                  <p className="mt-2 text-sm font-semibold text-emerald-950/55">
                    Imports public demo info from predefined backend data only. No live social scraping or platform APIs.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleSocialImport}
                  disabled={storeImporting}
                  className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-6 py-3.5 font-black text-white transition hover:-translate-y-1 hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {storeImporting ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Importing...
                    </>
                  ) : (
                    <>
                      <Instagram className="h-5 w-5" />
                      Import Store Info
                    </>
                  )}
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr]">
              <div className="space-y-5">
                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="name" className="mb-2 block text-sm font-black text-emerald-950">
                      Store Name *
                    </label>
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="Nusrat Fashion House"
                    />
                  </div>

                  <div>
                    <label htmlFor="category" className="mb-2 block text-sm font-black text-emerald-950">
                      Store Category *
                    </label>
                    <input
                      type="text"
                      id="category"
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="Fashion, Gadgets, Beauty..."
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="description" className="mb-2 block text-sm font-black text-emerald-950">
                    Bio / Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows="5"
                    className="w-full resize-none rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                    placeholder="Tell buyers what your store sells..."
                  />
                </div>

                <div>
                  <label htmlFor="address" className="mb-2 block text-sm font-black text-emerald-950">
                    Address
                  </label>
                  <input
                    type="text"
                    id="address"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                    placeholder="Store address"
                  />
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div>
                    <label htmlFor="phone" className="mb-2 block text-sm font-black text-emerald-950">
                      Phone
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="+880..."
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="mb-2 block text-sm font-black text-emerald-950">
                      Email
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="store@example.com"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <div className="rounded-[2rem] bg-[#f6f1e7] p-5">
                  <h3 className="font-black text-emerald-950">Store Logo</h3>
                  <p className="mt-1 text-sm font-semibold text-emerald-950/55">
                    Square logo, max 512px after resize.
                  </p>

                  {logoPreview ? (
                    <div className="relative mx-auto mt-5 h-36 w-36 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white">
                      <img src={logoPreview} alt="Logo preview" className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoPreview(null);
                          setFormData({ ...formData, logo: "" });
                        }}
                        className="absolute right-2 top-2 rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-emerald-950/20 bg-white/70 p-8 text-center transition hover:border-lime-300 hover:bg-white">
                      <ImagePlus className="h-12 w-12 text-emerald-950/40" />
                      <span className="mt-3 font-black text-emerald-950">Upload Logo</span>
                      <span className="text-sm font-semibold text-emerald-950/50">PNG/JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "logo")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="rounded-[2rem] bg-[#f6f1e7] p-5">
                  <h3 className="font-black text-emerald-950">Store Banner</h3>
                  <p className="mt-1 text-sm font-semibold text-emerald-950/55">
                    Wide banner, max 1200x400 after resize.
                  </p>

                  {bannerPreview ? (
                    <div className="relative mt-5 overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white">
                      <img src={bannerPreview} alt="Banner preview" className="h-40 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          setBannerPreview(null);
                          setFormData({ ...formData, banner: "" });
                        }}
                        className="absolute right-3 top-3 rounded-full bg-red-500 p-2 text-white shadow-lg transition hover:bg-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ) : (
                    <label className="mt-5 flex cursor-pointer flex-col items-center justify-center rounded-[2rem] border-2 border-dashed border-emerald-950/20 bg-white/70 p-8 text-center transition hover:border-lime-300 hover:bg-white">
                      <UploadCloud className="h-12 w-12 text-emerald-950/40" />
                      <span className="mt-3 font-black text-emerald-950">Upload Banner</span>
                      <span className="text-sm font-semibold text-emerald-950/50">PNG/JPG up to 5MB</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileChange(e, "banner")}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>

                <div className="flex flex-col gap-3">
                  <button
                    type="submit"
                    className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-8 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
                  >
                    <CheckCircle2 className="h-5 w-5" />
                    {editingStore ? "Update Store" : "Create Store"}
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

        {stores.length === 0 ? (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Store className="h-10 w-10" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-emerald-950">
              No stores yet
            </h3>
            <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-emerald-950/60">
              Create your first storefront with a store name, category, logo, banner, and contact details.
            </p>
            {!showForm && (
              <button
                onClick={openCreateForm}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-950 px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
              >
                Create Your First Store
                <ArrowRight className="h-5 w-5" />
              </button>
            )}
          </section>
        ) : (
          <section className="mt-8 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {stores.map((store) => (
              <article
                key={store.id}
                className="overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-40 overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-100 to-amber-100">
                  {store.banner ? (
                    <img
                      src={store.banner}
                      alt={`${store.name} banner`}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-950/35">
                      <Building2 className="h-20 w-20" />
                    </div>
                  )}

                  <span className={`absolute right-4 top-4 rounded-full px-3 py-1 text-xs font-black ${
                    store.isActive ? "bg-lime-300 text-emerald-950" : "bg-white text-emerald-950"
                  }`}>
                    {store.isActive ? "Active" : "Inactive"}
                  </span>
                </div>

                <div className="p-6">
                  <div className="-mt-14 mb-4 flex items-end gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border-4 border-white bg-emerald-950 text-lime-300 shadow-lg">
                      {store.logo ? (
                        <img src={store.logo} alt={`${store.name} logo`} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-9 w-9" />
                      )}
                    </div>
                    <div className="min-w-0 pb-2">
                      <h3 className="truncate text-2xl font-black text-emerald-950">{store.name}</h3>
                      <p className="mt-1 text-sm font-bold text-emerald-950/55">
                        {store.category || "Uncategorized"}
                      </p>
                    </div>
                  </div>

                  <p className="line-clamp-3 min-h-18 font-semibold leading-7 text-emerald-950/65">
                    {store.description || "No description added yet."}
                  </p>

                  <div className="mt-5 rounded-[1.5rem] bg-[#f6f1e7] p-4">
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-950/50">
                      Store URL
                    </p>
                    {store.slug ? (
                      <Link
                        to={`/store/${store.slug}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-2 inline-flex max-w-full items-center gap-2 truncate font-black text-emerald-950 transition hover:text-emerald-700"
                      >
                        <span className="truncate">{getStoreUrl(store)}</span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </Link>
                    ) : (
                      <p className="mt-2 font-black text-emerald-950/50">Not generated yet</p>
                    )}
                  </div>

                  <div className="mt-5 space-y-2 text-sm font-semibold text-emerald-950/65">
                    {store.address && (
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-emerald-950" />
                        <span className="truncate">{store.address}</span>
                      </div>
                    )}
                    {store.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="h-4 w-4 text-emerald-950" />
                        <span>{store.phone}</span>
                      </div>
                    )}
                    {store.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4 text-emerald-950" />
                        <span className="truncate">{store.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => handleEdit(store)}
                      className="flex-1 rounded-full bg-lime-300 px-4 py-3 font-black text-emerald-950 transition hover:bg-lime-200"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeleteTarget(store)}
                      className="flex-1 rounded-full bg-red-100 px-4 py-3 font-black text-red-700 transition hover:bg-red-200"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}

        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/50 px-5 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-[2rem] bg-white p-6 shadow-2xl">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-100 text-red-700">
                <Trash2 className="h-7 w-7" />
              </div>
              <h2 className="mt-5 text-2xl font-black text-emerald-950">
                Delete this store?
              </h2>
              <p className="mt-3 font-semibold leading-7 text-emerald-950/60">
                You are about to delete <strong>{deleteTarget.name}</strong>. This can affect products and orders connected to this store.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="rounded-full border border-emerald-950/10 px-5 py-3 font-black text-emerald-950 transition hover:bg-[#f6f1e7]"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmDelete}
                  className="rounded-full bg-red-600 px-5 py-3 font-black text-white transition hover:bg-red-700"
                >
                  Delete Store
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
};

export default MyStores;
