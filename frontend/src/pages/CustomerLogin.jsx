import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  ArrowLeft,
  ArrowRight,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  ShieldCheck,
  ShoppingBag,
} from "lucide-react";

const CustomerLogin = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const redirectFrom = location.state?.from;
  const redirectTo = redirectFrom || "/stores";
  const isCheckoutFlow = redirectFrom === "/checkout";
  const isStoreFlow = redirectFrom?.startsWith("/store/");

  const pageCopy = isCheckoutFlow
    ? {
        badge: "Secure checkout",
        title: "Sign in to continue checkout",
        description:
          "Use your customer account to continue checkout, save delivery details, and track your order after purchase.",
        cardText: "Sign in to continue with your checkout.",
        button: "Continue to checkout",
      }
    : {
        badge: isStoreFlow ? "Storefront sign in" : "Customer sign in",
        title: "Sign in",
        description:
          "Use your customer account to save favorites, manage your cart, and track orders from stores you shop with.",
        cardText: "Sign in to continue shopping.",
        button: "Sign in",
      };

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      navigate(redirectTo, { replace: true });
      return;
    }

    setError(result.error);
  };

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to cart
          </Link>

          <Link to="/" className="flex items-center gap-2 font-bold">
            <ShoppingBag className="h-5 w-5" />
            Shoplinker
          </Link>
        </div>
      </header>

      <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl items-center gap-10 px-5 py-10 lg:grid-cols-[1fr_430px] lg:px-8">
        <div className="max-w-2xl">
          <div className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-bold text-neutral-700 shadow-sm ring-1 ring-neutral-200">
            <ShieldCheck className="h-4 w-4 text-green-600" />
            {pageCopy.badge}
          </div>

          <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl">
            {pageCopy.title}
          </h1>

          <p className="mt-4 text-lg leading-8 text-neutral-600">
            {pageCopy.description}
          </p>

          <div className="mt-8 grid gap-3 text-sm font-semibold text-neutral-700 sm:grid-cols-3">
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              {isCheckoutFlow ? "Faster checkout" : "Saved favorites"}
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              Order updates
            </div>
            <div className="rounded-2xl border border-neutral-200 bg-white p-4">
              {isCheckoutFlow ? "Saved shopping" : "Easy checkout"}
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">
              Buyer sign in
            </p>
            <h2 className="mt-3 text-2xl font-bold">Welcome back</h2>
            <p className="mt-2 text-sm leading-6 text-neutral-600">
              {pageCopy.cardText}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="mt-7 space-y-5">
            {error && (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">{error}</p>
              </div>
            )}

            <div>
              <label htmlFor="shop-email" className="mb-2 block text-sm font-bold">
                Email address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="shop-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 pl-11 pr-4 font-semibold outline-none transition focus:border-neutral-950 focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label htmlFor="shop-password" className="mb-2 block text-sm font-bold">
                Password
              </label>
              <div className="relative">
                <LockKeyhole className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                <input
                  id="shop-password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Enter your password"
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3.5 pl-11 pr-12 font-semibold outline-none transition focus:border-neutral-950 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 rounded-full p-2 text-neutral-500 transition -translate-y-1/2 hover:bg-neutral-100 hover:text-neutral-950"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 font-bold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? "Signing in..." : pageCopy.button}
              {!loading && <ArrowRight className="h-5 w-5" />}
            </button>
          </form>

          <p className="mt-6 text-center text-sm font-semibold text-neutral-600">
            New to Shoplinker?{" "}
            <Link
              to="/register"
              className="font-bold text-neutral-950 underline decoration-neutral-300 underline-offset-4 hover:decoration-neutral-950"
            >
              Create an account
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
};

export default CustomerLogin;
