import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { storesAPI } from "../api/api";
import {
  ArrowRight,
  Building2,
  ExternalLink,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Store,
  Tag,
  X,
} from "lucide-react";

const getStoreUrl = (store) => {
  if (!store?.slug) return "#";
  const baseUrl = import.meta.env.VITE_APP_URL || window.location.origin;
  return `${baseUrl}/store/${store.slug}`;
};

const Stores = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    fetchStores();
  }, []);

  const normalizeArrayResponse = (response) => response?.data || response || [];

  const fetchStores = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await storesAPI.getAll();
      const storesData = normalizeArrayResponse(response);

      // Hide inactive stores if backend provides isActive.
      // If isActive is undefined, keep the store visible for compatibility.
      const visibleStores = storesData.filter((store) => store.isActive !== false);

      setStores(visibleStores);
    } catch (err) {
      setError("Failed to load stores. Please refresh and try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categories = useMemo(() => {
    const uniqueCategories = stores
      .map((store) => store.category)
      .filter(Boolean)
      .map((category) => category.trim())
      .filter(Boolean);

    return ["all", ...Array.from(new Set(uniqueCategories))];
  }, [stores]);

  const filteredStores = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return stores.filter((store) => {
      const matchesSearch =
        !query ||
        store.name?.toLowerCase().includes(query) ||
        store.description?.toLowerCase().includes(query) ||
        store.category?.toLowerCase().includes(query) ||
        store.address?.toLowerCase().includes(query);

      const matchesCategory =
        selectedCategory === "all" || store.category === selectedCategory;

      return matchesSearch && matchesCategory;
    });
  }, [stores, searchQuery, selectedCategory]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f6f1e7]">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-emerald-950" />
          <p className="mt-4 font-black text-emerald-950">Loading stores...</p>
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="absolute -right-16 -top-16 h-52 w-52 rounded-full bg-lime-300/20 blur-3xl" />
          <div className="relative grid gap-8 lg:grid-cols-[1fr_0.75fr] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <Sparkles className="h-4 w-4" />
                Shop on Shoplinker
              </div>
              <h1 className="mt-6 text-4xl font-black tracking-[-0.05em] sm:text-5xl lg:text-6xl">
                Discover stores you can trust.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-white/70">
                Search local sellers, browse categories, compare stores, and find products from trusted Shoplinker vendors.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 text-emerald-950">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Find a store
              </p>
              <div className="relative mt-4">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-emerald-950/40" />
                <input
                  type="text"
                  placeholder="Search by store name, category, or location..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="block w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7] py-4 pl-12 pr-12 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-emerald-950/50 transition hover:bg-emerald-50 hover:text-emerald-950"
                    aria-label="Clear search"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </section>

        {error && (
          <div className="mt-6 flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
            <p className="font-semibold">{error}</p>
            <button onClick={() => setError("")} className="rounded-full p-1 hover:bg-red-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <section className="mt-8 rounded-[2rem] border border-emerald-950/10 bg-white/85 p-5 shadow-sm backdrop-blur">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Marketplace
              </p>
              <h2 className="mt-1 text-2xl font-black">
                {filteredStores.length} store{filteredStores.length !== 1 ? "s" : ""} found
              </h2>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1">
              {categories.map((category) => (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`shrink-0 rounded-full px-4 py-2 text-sm font-black transition ${
                    selectedCategory === category
                      ? "bg-lime-300 text-emerald-950"
                      : "bg-[#f6f1e7] text-emerald-950/70 hover:bg-lime-100 hover:text-emerald-950"
                  }`}
                >
                  {category === "all" ? "All Categories" : category}
                </button>
              ))}
            </div>
          </div>
        </section>

        {stores.length === 0 ? (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Store className="h-10 w-10" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-emerald-950">
              No stores are available yet
            </h3>
            <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-emerald-950/60">
              Stores created by vendors will appear here for customers to browse and shop from.
            </p>
          </section>
        ) : filteredStores.length === 0 ? (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Search className="h-10 w-10" />
            </div>
            <h3 className="mt-6 text-2xl font-black text-emerald-950">
              No matching stores found
            </h3>
            <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-emerald-950/60">
              Try a different store name, category, product type, or location.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              className="mt-7 inline-flex items-center gap-2 rounded-full bg-emerald-950 px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
            >
              Clear Filters
              <ArrowRight className="h-5 w-5" />
            </button>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {filteredStores.map((store) => (
              <Link
                key={store.id}
                to={store.slug ? `/store/${store.slug}` : "#"}
                className="group block overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-2 hover:shadow-2xl"
              >
                <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-emerald-100 via-lime-100 to-amber-100">
                  {store.banner ? (
                    <img
                      src={store.banner}
                      alt={`${store.name} banner`}
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-950/35">
                      <Building2 className="h-20 w-20" />
                    </div>
                  )}

                  {store.category && (
                    <span className="absolute left-4 top-4 inline-flex items-center gap-1 rounded-full bg-lime-300 px-3 py-1 text-xs font-black text-emerald-950">
                      <Tag className="h-3.5 w-3.5" />
                      {store.category}
                    </span>
                  )}
                </div>

                <div className="p-6">
                  <div className="-mt-14 mb-4 flex items-end gap-4">
                    <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-[1.5rem] border-4 border-white bg-emerald-950 text-lime-300 shadow-lg">
                      {store.logo ? (
                        <img
                          src={store.logo}
                          alt={`${store.name} logo`}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <Store className="h-9 w-9" />
                      )}
                    </div>
                    <div className="min-w-0 pb-2">
                      <h3 className="line-clamp-2 text-2xl font-black leading-tight text-emerald-950">
                        {store.name}
                      </h3>
                    </div>
                  </div>

                  <p className="line-clamp-3 min-h-18 font-semibold leading-7 text-emerald-950/65">
                    {store.description || "No description added yet."}
                  </p>

                  {store.slug && (
                    <div className="mt-5 rounded-[1.5rem] bg-[#f6f1e7] p-4">
                      <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-950/50">
                        Store link
                      </p>
                      <p className="mt-2 flex items-center gap-2 truncate font-black text-emerald-950">
                        <span className="truncate">{getStoreUrl(store)}</span>
                        <ExternalLink className="h-4 w-4 shrink-0" />
                      </p>
                    </div>
                  )}

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

                  <div className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-emerald-950 px-5 py-3 font-black text-white transition group-hover:bg-lime-300 group-hover:text-emerald-950">
                    Visit Store
                    <ArrowRight className="h-5 w-5 transition group-hover:translate-x-1" />
                  </div>
                </div>
              </Link>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default Stores;
