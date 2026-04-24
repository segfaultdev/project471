import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  UserPlus,
  Store,
  ShoppingBag,
  Eye,
  EyeOff,
  Home,
  CheckCircle2,
} from 'lucide-react';

const ROLE_MESSAGES = {
  vendor: 'Create a vendor account first to open your Shoplinker store.',
  customer: 'Create a customer account to shop, follow stores, and track orders.',
};

const VENDOR_AFTER_REGISTER_PATH = '/my-stores';
const CUSTOMER_AFTER_REGISTER_PATH = '/stores';

const getRoleFromQuery = (searchParams) => (
  searchParams.get('role') === 'vendor' ? 'vendor' : 'customer'
);

const Register = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { register } = useAuth();
  const queryRole = getRoleFromQuery(searchParams);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: queryRole,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [activeQueryRole, setActiveQueryRole] = useState(queryRole);

  if (activeQueryRole !== queryRole) {
    setActiveQueryRole(queryRole);
    setFormData((current) => ({
      ...current,
      role: queryRole,
    }));
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleRoleSelect = (role) => {
    setFormData({
      ...formData,
      role,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(formData);

    setLoading(false);

    if (result.success) {
      navigate(formData.role === 'vendor' ? VENDOR_AFTER_REGISTER_PATH : CUSTOMER_AFTER_REGISTER_PATH, { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <main className="min-h-screen bg-[#f6f1e7] text-emerald-950">
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#f6f1e7]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/shoplinker.svg" alt="Shoplinker" className="h-9 w-auto" />
          </Link>

          <div className="flex items-center gap-3">
            <Link
              to="/"
              className="hidden items-center gap-2 rounded-full px-5 py-3 text-sm font-black transition hover:bg-white/70 sm:inline-flex"
            >
              <Home className="h-4 w-4" />
              Back home
            </Link>
            <Link
              to="/login"
              className="rounded-full bg-emerald-950 px-5 py-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:shadow-xl"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      <section className="relative overflow-hidden px-5 py-12 lg:px-8 lg:py-16">
        <div className="absolute left-[-10%] top-24 h-72 w-72 rounded-full bg-lime-300/50 blur-3xl" />
        <div className="absolute bottom-0 right-[-8%] h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-2 text-sm font-black text-emerald-900">
              <UserPlus className="h-4 w-4" />
              Join Shoplinker
            </div>

            <h1 className="mt-7 max-w-3xl text-5xl font-black leading-[0.95] tracking-[-0.06em] sm:text-6xl lg:text-7xl">
              Create your account. Start your journey.
            </h1>

            <p className="mt-7 max-w-2xl text-lg leading-8 text-emerald-950/70 sm:text-xl">
              Sign up as a customer to discover trusted stores, or register as a vendor to launch and manage your own online store.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <button
                type="button"
                onClick={() => handleRoleSelect('customer')}
                className={`rounded-[2rem] border p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  formData.role === 'customer'
                    ? 'border-lime-400 bg-lime-300'
                    : 'border-emerald-950/10 bg-white/75 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                    <ShoppingBag className="h-6 w-6" />
                  </div>
                  {formData.role === 'customer' && <CheckCircle2 className="h-6 w-6 text-emerald-950" />}
                </div>
                <h2 className="mt-5 text-xl font-black">Customer</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-emerald-950/70">
                  Browse products, follow stores, compare items, and shop from trusted sellers.
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleRoleSelect('vendor')}
                className={`rounded-[2rem] border p-6 text-left shadow-sm transition duration-300 hover:-translate-y-1 hover:shadow-xl ${
                  formData.role === 'vendor'
                    ? 'border-lime-400 bg-lime-300'
                    : 'border-emerald-950/10 bg-white/75 hover:bg-white'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex h-13 w-13 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                    <Store className="h-6 w-6" />
                  </div>
                  {formData.role === 'vendor' && <CheckCircle2 className="h-6 w-6 text-emerald-950" />}
                </div>
                <h2 className="mt-5 text-xl font-black">Vendor</h2>
                <p className="mt-2 text-sm font-semibold leading-6 text-emerald-950/70">
                  Create a storefront, add products, manage orders, track stock, and grow online.
                </p>
              </button>
            </div>
          </div>

          <div className="rounded-[2.5rem] border border-emerald-950/10 bg-white/85 p-5 shadow-[0_30px_100px_rgba(8,28,21,0.18)] backdrop-blur sm:p-7 lg:p-8">
            <div className="rounded-[2rem] bg-emerald-950 p-6 text-white sm:p-8">
              <p className="text-sm font-black uppercase tracking-[0.2em] text-lime-300">
                Create account
              </p>
              <h2 className="mt-3 text-3xl font-black tracking-tight">Start with Shoplinker</h2>
              <p className="mt-3 leading-7 text-white/70">
                {ROLE_MESSAGES[formData.role]}
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error && (
                  <div className="rounded-2xl border border-red-300/30 bg-red-500/10 p-4">
                    <p className="text-sm font-semibold text-red-100">{error}</p>
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label htmlFor="firstName" className="mb-2 block text-sm font-black text-white">
                      First Name
                    </label>
                    <input
                      type="text"
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="John"
                    />
                  </div>

                  <div>
                    <label htmlFor="lastName" className="mb-2 block text-sm font-black text-white">
                      Last Name
                    </label>
                    <input
                      type="text"
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="Doe"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-sm font-black text-white">
                    Email Address
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                    placeholder="you@example.com"
                  />
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-sm font-black text-white">
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
                      minLength="6"
                      className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 pr-12 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                      placeholder="Minimum 6 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full p-2 text-emerald-950/60 transition hover:bg-emerald-50 hover:text-emerald-950"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label htmlFor="role" className="mb-2 block text-sm font-black text-white">
                    Register as
                  </label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white px-4 py-3 font-semibold text-emerald-950 outline-none transition focus:border-lime-300 focus:ring-4 focus:ring-lime-300/30"
                  >
                    <option value="customer">Customer - Browse and shop</option>
                    <option value="vendor">Vendor - Sell products</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 shadow-[0_18px_45px_rgba(132,204,22,0.28)] transition hover:-translate-y-1 hover:bg-lime-200 disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0"
                >
                  {loading ? (
                    <>
                      <svg className="h-5 w-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="h-5 w-5" />
                      Create Account
                      <ArrowRight className="h-5 w-5" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-8 border-t border-white/10 pt-6">
                <p className="text-center text-sm text-white/70">
                  Already have an account?{' '}
                  <Link to="/login" className="font-black text-lime-300 transition hover:text-lime-200">
                    Sign in instead
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Register;
