import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  LogIn,
  ShoppingBag,
  Store,
  Users,
} from 'lucide-react';

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);

    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[#f6f1e7] text-emerald-950">
      <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-lime-300/50 blur-3xl" />
      <div className="absolute bottom-0 right-[-8%] h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />

      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#f6f1e7]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/shoplinker.svg" alt="Shoplinker" className="h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden rounded-full px-5 py-3 text-sm font-black transition hover:bg-white/70 sm:inline-flex"
            >
              Back home
            </Link>
            <Link
              to="/register"
              className="rounded-full bg-lime-400 px-5 py-3 text-sm font-black text-emerald-950 shadow-[0_12px_30px_rgba(132,204,22,0.35)] transition hover:-translate-y-0.5 hover:bg-lime-300"
            >
              Create account
            </Link>
          </div>
        </div>
      </header>

      <section className="relative mx-auto grid min-h-[calc(100vh-73px)] max-w-7xl items-center gap-12 px-5 py-14 lg:grid-cols-[0.95fr_1.05fr] lg:px-8 lg:py-20">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
            <LogIn className="h-4 w-4" />
            Sign in to Shoplinker
          </div>

          <h1 className="mt-8 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
            Welcome back to your commerce hub.
          </h1>

          <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-950/70 sm:text-xl">
            Sign in as a seller to manage your store, products, orders, and analytics — or as a customer to shop, follow stores, and track purchases.
          </p>

          <div className="mt-9 grid gap-4 sm:grid-cols-3">
            {[
              ['Sell smarter', 'Manage storefronts and inventory.', Store],
              ['Shop easier', 'Discover products and follow stores.', ShoppingBag],
              ['Stay connected', 'Track orders, reviews, and updates.', Users],
            ].map(([title, text, Icon]) => (
              <div
                key={title}
                className="rounded-[1.5rem] border border-emerald-950/10 bg-white/70 p-5 shadow-sm transition hover:-translate-y-1 hover:bg-white"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 font-black">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-emerald-950/65">{text}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="relative">
          <div className="absolute -right-6 -top-6 hidden h-32 w-32 rounded-full bg-lime-300/60 blur-2xl sm:block" />

          <div className="relative rounded-[2.5rem] border border-emerald-950/10 bg-white p-6 shadow-[0_30px_100px_rgba(8,28,21,0.18)] sm:p-8 md:p-10">
            <div className="mb-8 flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-black uppercase tracking-[0.18em] text-emerald-700">Account access</p>
                <h2 className="mt-3 text-3xl font-black tracking-[-0.04em] text-emerald-950">
                  Sign in
                </h2>
                <p className="mt-2 text-emerald-950/65">
                  Continue to your Shoplinker account.
                </p>
              </div>
              <div className="hidden rounded-2xl bg-lime-300 p-3 text-emerald-950 sm:block">
                <CheckCircle2 className="h-6 w-6" />
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {error && (
                <div className="rounded-2xl border border-red-200 bg-red-50 p-4 shadow-sm">
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              <div>
                <label htmlFor="email" className="mb-2 block text-sm font-black text-emerald-950">
                  Email address
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7]/70 px-5 py-4 font-semibold text-emerald-950 outline-none transition placeholder:text-emerald-950/35 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-300/35"
                  placeholder="you@example.com"
                />
              </div>

              <div>
                <label htmlFor="password" className="mb-2 block text-sm font-black text-emerald-950">
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-emerald-950/10 bg-[#f6f1e7]/70 px-5 py-4 pr-14 font-semibold text-emerald-950 outline-none transition placeholder:text-emerald-950/35 focus:border-lime-400 focus:bg-white focus:ring-4 focus:ring-lime-300/35"
                    placeholder="Enter your password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-2 text-emerald-950/55 transition hover:bg-white hover:text-emerald-950"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-400 px-8 py-4 font-black text-emerald-950 shadow-[0_18px_45px_rgba(132,204,22,0.35)] transition hover:-translate-y-1 hover:bg-lime-300 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
              >
                {loading ? (
                  <>
                    <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight className="h-5 w-5" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 border-t border-emerald-950/10 pt-6">
              <p className="text-center text-sm font-semibold text-emerald-950/65">
                New to Shoplinker?{' '}
                <Link to="/register" className="font-black text-emerald-950 underline decoration-lime-400 decoration-4 underline-offset-4 transition hover:text-emerald-700">
                  Create a seller or customer account
                </Link>
              </p>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Login;
