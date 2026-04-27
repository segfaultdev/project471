import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Building2,
  ExternalLink,
  Heart,
  Loader2,
  MapPin,
  Store,
  X,
} from "lucide-react";
import { storesAPI } from "../api/api";

const FollowedStores = () => {
  const [stores, setStores] = useState([]);
  const [maxFollowedStores, setMaxFollowedStores] = useState(5);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [updatingStoreId, setUpdatingStoreId] = useState("");

  useEffect(() => {
    fetchFollowedStores();
  }, []);

  const fetchFollowedStores = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await storesAPI.getMyFollowedStores();
      const data = response.data || response || {};
      setStores(data.stores || []);
      setMaxFollowedStores(data.maxFollowedStores || 5);
    } catch (err) {
      console.error("Failed to load followed stores:", err);
      setError("Failed to load followed stores. Please refresh and try again.");
    } finally {
      setLoading(false);
    }
  };

  const unfollowStore = async (store) => {
    if (!store?.id || updatingStoreId) {
      return;
    }

    try {
      setUpdatingStoreId(store.id);
      setError("");
      const response = await storesAPI.unfollow(store.id);
      const data = response.data || response || {};
      setStores(data.stores || []);
      setMaxFollowedStores(data.maxFollowedStores || maxFollowedStores);
      setMessage(`Unfollowed ${store.name}.`);
      setTimeout(() => setMessage(""), 2500);
    } catch (err) {
      console.error("Failed to unfollow store:", err);
      setError(err.response?.data?.message || "Could not unfollow this store.");
    } finally {
      setUpdatingStoreId("");
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#f6f1e7] text-emerald-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-4 font-black">Loading followed stores...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <section className="relative overflow-hidden rounded-[2.5rem] bg-emerald-950 p-8 text-white shadow-[0_30px_100px_rgba(8,28,21,0.2)] md:p-10">
          <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <Link
                to="/dashboard"
                className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm font-black text-white transition hover:bg-white/10"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>

              <div className="inline-flex items-center gap-2 rounded-full bg-lime-300 px-4 py-2 text-sm font-black text-emerald-950">
                <Heart className="h-4 w-4 fill-current" />
                Followed Stores
              </div>

              <h1 className="mt-6 text-4xl font-black tracking-tight sm:text-5xl">
                Stores You Follow
              </h1>
              <p className="mt-3 max-w-2xl text-lg leading-8 text-white/70">
                Keep your favorite sellers close and jump back into their storefronts quickly.
              </p>
            </div>

            <div className="rounded-[2rem] bg-white p-5 text-emerald-950">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-950/50">
                Follow limit
              </p>
              <p className="mt-2 text-4xl font-black">
                {stores.length}/{maxFollowedStores}
              </p>
            </div>
          </div>
        </section>

        {(error || message) && (
          <div className="mt-6 space-y-3">
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="font-semibold">{error}</p>
                <button onClick={() => setError("")} className="rounded-full p-1 hover:bg-red-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {message && (
              <div className="flex items-center justify-between rounded-2xl border border-lime-300 bg-lime-100 p-4 text-emerald-950">
                <p className="font-black">{message}</p>
                <button onClick={() => setMessage("")} className="rounded-full p-1 hover:bg-lime-200">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
        )}

        {stores.length === 0 ? (
          <section className="mt-8 rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-12 text-center shadow-sm">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-lime-300 text-emerald-950">
              <Building2 className="h-10 w-10" />
            </div>
            <h2 className="mt-6 text-2xl font-black">No followed stores yet</h2>
            <p className="mx-auto mt-3 max-w-xl font-semibold leading-7 text-emerald-950/60">
              Open a store page and press Follow Store. You can follow up to {maxFollowedStores} stores.
            </p>
            <Link
              to="/stores"
              className="mt-7 inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-7 py-4 font-black text-white transition hover:-translate-y-1 hover:shadow-xl"
            >
              Browse Stores
              <ExternalLink className="h-5 w-5" />
            </Link>
          </section>
        ) : (
          <section className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {stores.map((store) => (
              <article
                key={store.id}
                className="overflow-hidden rounded-[2rem] border border-emerald-950/10 bg-white/85 shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <Link
                  to={store.slug ? `/store/${store.slug}` : `/stores`}
                  className="block aspect-[16/9] bg-[#f6f1e7]"
                >
                  {store.banner ? (
                    <img src={store.banner} alt={`${store.name} banner`} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center text-emerald-950/30">
                      <Store className="h-16 w-16" />
                    </div>
                  )}
                </Link>

                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-emerald-950 text-lime-300">
                      {store.logo ? (
                        <img src={store.logo} alt={`${store.name} logo`} className="h-full w-full object-cover" />
                      ) : (
                        <Store className="h-7 w-7" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <Link
                        to={store.slug ? `/store/${store.slug}` : `/stores`}
                        className="line-clamp-1 text-xl font-black transition hover:text-emerald-700"
                      >
                        {store.name}
                      </Link>
                      <p className="mt-1 line-clamp-2 text-sm font-semibold leading-6 text-emerald-950/60">
                        {store.description || store.category || "Shoplinker store"}
                      </p>
                    </div>
                  </div>

                  {store.address && (
                    <p className="mt-5 flex items-center gap-2 rounded-2xl bg-[#f6f1e7] px-4 py-3 text-sm font-semibold text-emerald-950/70">
                      <MapPin className="h-4 w-4 shrink-0" />
                      <span className="truncate">{store.address}</span>
                    </p>
                  )}

                  <div className="mt-5 grid grid-cols-[1fr_auto] gap-3">
                    <Link
                      to={store.slug ? `/store/${store.slug}` : `/stores`}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-emerald-950 px-5 py-3 font-black text-white transition hover:bg-emerald-900"
                    >
                      Visit Store
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                    <button
                      type="button"
                      onClick={() => unfollowStore(store)}
                      disabled={updatingStoreId === store.id}
                      className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-red-200 bg-red-50 text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-60"
                      aria-label={`Unfollow ${store.name}`}
                    >
                      {updatingStoreId === store.id ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                      ) : (
                        <Heart className="h-5 w-5 fill-current" />
                      )}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </section>
        )}
      </div>
    </main>
  );
};

export default FollowedStores;
