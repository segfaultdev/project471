import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  CreditCard,
  Heart,
  Menu,
  Package,
  Search,
  ShoppingBag,
  ShoppingCart,
  Sparkles,
  Star,
  Store,
  Users,
  X,
} from 'lucide-react';

const navLinks = [
  { label: 'Features', href: '#features' },
  { label: 'How It Works', href: '#how-it-works' },
  { label: 'Shop on Shoplinker', href: '#shop' },
  { label: 'FAQ', href: '#faq' },
];

const VENDOR_REGISTER_PATH = '/register?role=vendor';
const CUSTOMER_REGISTER_PATH = '/register?role=customer';
const VENDOR_STORE_PATH = '/my-stores';
const AUTHENTICATED_SHOP_PATH = '/stores';

const showcaseItems = [
  'Fashion stores',
  'Gadget sellers',
  'Beauty brands',
  'Home shops',
  'Food pages',
  'Local boutiques',
];

const sellerFeatures = [
  {
    icon: Store,
    title: 'Storefront builder',
    description: 'Create a polished store with logo, banner, category, contact details, and a shareable store URL.',
  },
  {
    icon: Package,
    title: 'Product uploads',
    description: 'Add products manually or import from Facebook and Instagram links, then edit price, stock, and description.',
  },
  {
    icon: Boxes,
    title: 'Inventory control',
    description: 'Track quantities, spot low stock early, and keep products updated before buyers place orders.',
  },
  {
    icon: ShoppingCart,
    title: 'Order workflow',
    description: 'Move orders through Pending, Confirmed, Shipped, Delivered, or Returned from one clean panel.',
  },
  {
    icon: CreditCard,
    title: 'Flexible payments',
    description: 'Support bKash, Nagad, SSLCOMMERZ, and Cash on Delivery for Bangladesh-first commerce.',
  },
  {
    icon: BarChart3,
    title: 'Seller analytics',
    description: 'See daily sales, best-selling products, return rate, and growth signals from your dashboard.',
  },
];

const buyerFeatures = [
  {
    icon: Search,
    title: 'Search stores and products',
    description: 'Customers can search by store name or product type, then discover sellers who match what they need.',
  },
  {
    icon: ShoppingBag,
    title: 'Shop from trusted stores',
    description: 'Browse storefronts, product details, prices, stock updates, and available payment options in one place.',
  },
  {
    icon: Star,
    title: 'Compare before buying',
    description: 'Compare similar products from multiple sellers using price, rating, and delivery estimate.',
  },
  {
    icon: Heart,
    title: 'Follow favorite stores',
    description: 'Customers can follow stores and see new products, offers, and updates in a centralized feed.',
  },
  {
    icon: Bell,
    title: 'Get useful notifications',
    description: 'Receive discount alerts, product stock updates, and other shopping notifications.',
  },
  {
    icon: Users,
    title: 'Verified reviews',
    description: 'Customers can leave ratings and reviews only after a confirmed purchase, keeping feedback more reliable.',
  },
];

const sellerSteps = [
  ['Create your store', 'Add your store name, logo, banner, category, or import a profile from Facebook/Instagram.'],
  ['Add products', 'Upload manually or paste a product post link, then edit price, stock, and description.'],
  ['Manage operations', 'Track inventory, update order status, create coupons, and monitor sales analytics.'],
  ['Get paid', 'Enable bKash, Nagad, COD, or SSLCOMMERZ and grow from one dashboard.'],
];

const buyerSteps = [
  ['Create account', 'Sign up as a customer to save carts, follow stores, and receive updates.'],
  ['Find products', 'Search by store name or product type and compare options from multiple sellers.'],
  ['Place order', 'Choose your item, select payment method, and track the shopping flow.'],
  ['Review purchase', 'After confirmed delivery, leave ratings and reviews to help other buyers.'],
];

const stats = [
  { value: '2', label: 'account types for sellers and customers' },
  { value: '5', label: 'order statuses for clearer operations' },
  { value: '4', label: 'payment choices for local buyers' },
  { value: '1', label: 'platform for selling and shopping' },
];

const faqs = [
  {
    question: 'Can customers create a Shoplinker account?',
    answer: 'Yes. Customers can create an account to shop, follow stores, compare products, receive notifications, and leave reviews after confirmed purchases.',
  },
  {
    question: 'Can sellers create their own online store?',
    answer: 'Yes. Sellers can create a mini storefront with logo, banner, category, product listings, inventory, orders, payments, coupons, and analytics.',
  },
  {
    question: 'Can buyers search for products like t-shirts?',
    answer: 'Yes. Buyers can search by product type and see sellers who offer that kind of product.',
  },
  {
    question: 'What payment methods are supported?',
    answer: 'Shoplinker supports bKash, Nagad, SSLCOMMERZ, and Cash on Delivery.',
  },
  {
    question: 'Are reviews open to everyone?',
    answer: 'No. Buyers can leave ratings and reviews only after a confirmed purchase, which helps keep reviews trustworthy.',
  },
];

const footerGroups = [
  {
    title: 'Platform',
    links: [
      { label: 'Features', href: '#features' },
      { label: 'How It Works', href: '#how-it-works' },
      { label: 'Shop on Shoplinker', href: '#shop' },
      { label: 'FAQ', href: '#faq' },
    ],
  },
  {
    title: 'For sellers',
    links: [
      { label: 'Storefronts', href: '#features' },
      { label: 'Inventory', href: '#features' },
      { label: 'Orders', href: '#features' },
      { label: 'Payments', href: '#features' },
    ],
  },
  {
    title: 'For customers',
    links: [
      { label: 'Search products', href: '#shop' },
      { label: 'Compare sellers', href: '#shop' },
      { label: 'Follow stores', href: '#shop' },
      { label: 'Reviews', href: '#shop' },
    ],
  },
];

function SectionLabel({ children, dark = false }) {
  return (
    <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold ${dark ? 'bg-lime-300 text-emerald-950' : 'bg-emerald-100 text-emerald-900'}`}>
      <Sparkles className="h-4 w-4" />
      {children}
    </div>
  );
}

function MockProductCard({ title, price, tag, className = '' }) {
  return (
    <div className={`rounded-[2rem] border border-black/10 bg-white p-4 shadow-[0_20px_60px_rgba(8,28,21,0.12)] transition duration-500 hover:-translate-y-2 ${className}`}>
      <div className="h-44 rounded-[1.5rem] bg-gradient-to-br from-emerald-100 via-lime-100 to-amber-100" />
      <div className="mt-5 flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">{tag}</p>
          <h3 className="mt-2 text-xl font-black text-emerald-950">{title}</h3>
        </div>
        <p className="rounded-full bg-emerald-950 px-4 py-2 text-sm font-black text-lime-200">{price}</p>
      </div>
    </div>
  );
}

function DashboardMockup() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -left-10 top-14 hidden rotate-[-7deg] md:block">
        <MockProductCard title="Linen Shirt" price="৳850" tag="Trending" className="w-64" />
      </div>
      <div className="absolute -right-8 bottom-8 hidden rotate-[7deg] lg:block">
        <MockProductCard title="Smart Watch" price="৳2,400" tag="Popular" className="w-64" />
      </div>

      <div className="relative overflow-hidden rounded-[2.5rem] border border-emerald-900/10 bg-white p-4 shadow-[0_30px_100px_rgba(8,28,21,0.22)]">
        <div className="rounded-[2rem] bg-emerald-950 p-4 text-white sm:p-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-5">
            <div>
              <p className="text-sm font-bold text-lime-200">Shoplinker platform</p>
              <h3 className="mt-1 text-2xl font-black">Sell, shop, and manage</h3>
            </div>
            <div className="rounded-full bg-lime-300 px-5 py-2 text-sm font-black text-emerald-950">Live marketplace</div>
          </div>

          <div className="grid gap-4 py-6 sm:grid-cols-3">
            {[
              ['৳42.5k', 'Daily sales'],
              ['128', 'Orders'],
              ['4.8★', 'Store rating'],
            ].map(([value, label]) => (
              <div key={label} className="rounded-[1.5rem] bg-white/10 p-5 backdrop-blur">
                <p className="text-3xl font-black text-lime-200">{value}</p>
                <p className="mt-2 text-sm text-white/70">{label}</p>
              </div>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-[1.75rem] bg-white p-5 text-emerald-950">
              <div className="flex items-center justify-between">
                <h4 className="font-black">Customer journey</h4>
                <Search className="h-5 w-5 text-emerald-700" />
              </div>
              <div className="mt-5 space-y-3">
                {['Search product', 'Compare sellers', 'Place order', 'Review purchase'].map((status, index) => (
                  <div key={status} className="flex items-center gap-3 rounded-2xl bg-emerald-50 p-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-950 text-xs font-black text-lime-200">{index + 1}</div>
                    <span className="font-bold">{status}</span>
                    <div className="ml-auto h-2 w-20 rounded-full bg-lime-300" />
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] bg-lime-300 p-5 text-emerald-950">
              <p className="text-sm font-black uppercase tracking-[0.18em]">Featured store</p>
              <div className="mt-5 h-28 rounded-[1.5rem] bg-white/60" />
              <h4 className="mt-5 text-2xl font-black">Nusrat Fashion</h4>
              <p className="mt-2 text-sm font-semibold text-emerald-900/70">Follow store for new offers</p>
              <div className="mt-5 flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((item) => (
                  <Star key={item} className="h-4 w-4 fill-emerald-950 text-emerald-950" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function FeatureCard({ feature, index }) {
  const Icon = feature.icon;
  return (
    <div className={`group rounded-[2rem] border border-emerald-950/10 p-7 shadow-sm transition duration-500 hover:-translate-y-2 hover:shadow-2xl ${index % 2 === 0 ? 'bg-white' : 'bg-lime-100'}`}>
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300 transition group-hover:rotate-6 group-hover:scale-110">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="mt-8 text-2xl font-black tracking-tight">{feature.title}</h3>
      <p className="mt-4 leading-7 text-emerald-950/70">{feature.description}</p>
    </div>
  );
}

export default function Homepage() {
  const { isAuthenticated, isVendor } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeNotice, setStoreNotice] = useState('');

  const customerShopPath = isAuthenticated ? AUTHENTICATED_SHOP_PATH : CUSTOMER_REGISTER_PATH;

  const showCustomerStoreNotice = () => {
    setStoreNotice('Your current account is a customer account. Vendor store creation needs a vendor account, so sign in with a vendor account to open your Shoplinker store.');
  };

  const renderCreateStoreAction = (className, children, onClick) => {
    if (isAuthenticated && isVendor()) {
      return (
        <Link to={VENDOR_STORE_PATH} onClick={onClick} className={className}>
          {children}
        </Link>
      );
    }

    if (isAuthenticated) {
      return (
        <button
          type="button"
          onClick={() => {
            showCustomerStoreNotice();
            onClick?.();
          }}
          className={className}
        >
          {children}
        </button>
      );
    }

    return (
      <Link to={VENDOR_REGISTER_PATH} onClick={onClick} className={className}>
        {children}
      </Link>
    );
  };

  return (
    <main className="min-h-screen scroll-smooth bg-[#f6f1e7] text-emerald-950">
      <header className="sticky top-0 z-50 border-b border-emerald-950/10 bg-[#f6f1e7]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <img src="/shoplinker.svg" alt="Shoplinker" className="h-9 w-auto" />
          </Link>

          <nav className="hidden items-center gap-2 lg:flex">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href} className="rounded-full px-4 py-2 text-sm font-bold transition hover:bg-white/70">
                {link.label}
              </a>
            ))}
          </nav>

          <div className="hidden items-center gap-3 md:flex">
            {isAuthenticated ? (
              <>
                <Link to="/dashboard" className="rounded-full px-5 py-3 text-sm font-black transition hover:bg-white/70">
                  Dashboard
                </Link>
                {renderCreateStoreAction(
                  'rounded-full bg-lime-400 px-6 py-3 text-sm font-black text-emerald-950 shadow-[0_12px_30px_rgba(132,204,22,0.35)] transition hover:-translate-y-0.5 hover:bg-lime-300',
                  'Create Store'
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="rounded-full px-5 py-3 text-sm font-black transition hover:bg-white/70">
                  Sign in
                </Link>
                {renderCreateStoreAction(
                  'rounded-full bg-lime-400 px-6 py-3 text-sm font-black text-emerald-950 shadow-[0_12px_30px_rgba(132,204,22,0.35)] transition hover:-translate-y-0.5 hover:bg-lime-300',
                  'Create Store'
                )}
              </>
            )}
          </div>

          <button onClick={() => setMobileOpen((prev) => !prev)} className="rounded-full bg-white p-3 shadow-sm md:hidden" aria-label="Toggle menu">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {mobileOpen && (
          <div className="border-t border-emerald-950/10 bg-[#f6f1e7] px-5 py-5 md:hidden">
            <div className="flex flex-col gap-3">
              {navLinks.map((link) => (
                <a key={link.label} href={link.href} onClick={() => setMobileOpen(false)} className="rounded-2xl bg-white/70 px-4 py-3 font-bold">
                  {link.label}
                </a>
              ))}
              {isAuthenticated ? (
                <>
                  <Link to="/dashboard" onClick={() => setMobileOpen(false)} className="rounded-full bg-emerald-950 px-5 py-3 text-center font-black text-white">Dashboard</Link>
                  {renderCreateStoreAction(
                    'rounded-full bg-lime-400 px-5 py-3 text-center font-black text-emerald-950',
                    'Create Store',
                    () => setMobileOpen(false)
                  )}
                </>
              ) : (
                <>
                  <Link to="/login" className="rounded-full bg-white px-5 py-3 text-center font-black">Sign in</Link>
                  {renderCreateStoreAction(
                    'rounded-full bg-lime-400 px-5 py-3 text-center font-black text-emerald-950',
                    'Create Store',
                    () => setMobileOpen(false)
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </header>

      {storeNotice && (
        <div className="border-b border-emerald-950/10 bg-lime-200 px-5 py-3 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-3 text-sm font-bold text-emerald-950 sm:flex-row sm:items-center sm:justify-between">
            <p>{storeNotice}</p>
            <button
              type="button"
              onClick={() => setStoreNotice('')}
              className="self-start rounded-full bg-emerald-950 px-4 py-2 text-xs font-black text-white transition hover:bg-emerald-900 sm:self-auto"
            >
              Got it
            </button>
          </div>
        </div>
      )}

      <section className="relative overflow-hidden px-5 py-16 sm:py-20 lg:px-8 lg:py-24">
        <div className="absolute left-[-10%] top-20 h-72 w-72 rounded-full bg-lime-300/50 blur-3xl" />
        <div className="absolute bottom-0 right-[-8%] h-96 w-96 rounded-full bg-emerald-300/30 blur-3xl" />

        <div className="relative mx-auto max-w-7xl">
          <div className="grid items-center gap-12 lg:grid-cols-[0.92fr_1.08fr]">
            <div>
              <SectionLabel>Commerce for sellers and customers</SectionLabel>
              <h1 className="mt-8 max-w-5xl text-[3.8rem] font-black leading-[0.9] tracking-[-0.07em] text-emerald-950 sm:text-[5.6rem] lg:text-[6.4rem]">
                Create stores. Discover products. Shop smarter.
              </h1>
              <p className="mt-8 max-w-2xl text-xl leading-8 text-emerald-950/70">
                Shoplinker helps sellers run online stores and helps customers find trusted stores, compare products, follow sellers, and shop with confidence.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                {renderCreateStoreAction(
                  'inline-flex items-center justify-center gap-2 rounded-full bg-lime-400 px-8 py-4 text-base font-black text-emerald-950 shadow-[0_18px_45px_rgba(132,204,22,0.35)] transition hover:-translate-y-1 hover:bg-lime-300',
                  <>Create Store <ArrowRight className="h-5 w-5" /></>
                )}
                <Link to={customerShopPath} className="inline-flex items-center justify-center rounded-full border-2 border-emerald-950 px-8 py-4 text-base font-black transition hover:-translate-y-1 hover:bg-emerald-950 hover:text-white">
                  Shop on Shoplinker
                </Link>
              </div>
            </div>

            <div className="animate-[fadeIn_0.9s_ease-out]">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-16 lg:px-8">
        <div className="mx-auto max-w-7xl rounded-[2rem] border border-emerald-950/10 bg-white/70 p-6 shadow-sm">
          <p className="text-center text-sm font-black uppercase tracking-[0.22em] text-emerald-900/60">Shop local stores across categories</p>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-6">
            {showcaseItems.map((item) => (
              <div key={item} className="rounded-2xl bg-[#f6f1e7] px-4 py-5 text-center font-black transition hover:-translate-y-1 hover:bg-lime-200">
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <SectionLabel>Seller features</SectionLabel>
            <h2 className="mt-6 text-5xl font-black leading-none tracking-[-0.05em] sm:text-6xl">
              Everything sellers need to run the business.
            </h2>
          </div>

          <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {sellerFeatures.map((feature, index) => (
              <FeatureCard key={feature.title} feature={feature} index={index} />
            ))}
          </div>
        </div>
      </section>

      <section id="shop" className="bg-emerald-950 px-5 py-20 text-white lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-start">
            <div>
              <SectionLabel dark>Shop on Shoplinker</SectionLabel>
              <h2 className="mt-6 text-5xl font-black leading-none tracking-[-0.05em] sm:text-6xl">
                A better way for customers to discover and buy.
              </h2>
              <p className="mt-6 text-lg leading-8 text-white/70">
                Customers are not just visitors. They can create Shoplinker accounts, search stores, compare products, follow sellers, receive updates, and review confirmed purchases.
              </p>
              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link to={customerShopPath} className="inline-flex items-center justify-center rounded-full bg-lime-300 px-7 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200">
                  {isAuthenticated ? 'Browse Stores' : 'Create Customer Account'}
                </Link>
                <Link to={customerShopPath} className="inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-4 font-black text-white transition hover:bg-white/10">
                  Browse Stores
                </Link>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {buyerFeatures.map((feature) => {
                const Icon = feature.icon;
                return (
                  <div key={feature.title} className="rounded-[2rem] border border-white/10 bg-white/[0.08] p-7 backdrop-blur transition duration-500 hover:-translate-y-2 hover:bg-white/[0.12]">
                    <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-lime-300 text-emerald-950">
                      <Icon className="h-7 w-7" />
                    </div>
                    <h3 className="mt-7 text-2xl font-black">{feature.title}</h3>
                    <p className="mt-3 leading-7 text-white/70">{feature.description}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-4xl">
            <SectionLabel>How It Works</SectionLabel>
            <h2 className="mt-6 text-5xl font-black leading-none tracking-[-0.05em] sm:text-6xl">
              Two simple flows: sell or shop.
            </h2>
          </div>

          <div className="mt-14 grid gap-6 lg:grid-cols-2">
            <div className="rounded-[2.5rem] bg-white p-8 shadow-[0_20px_70px_rgba(8,28,21,0.10)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-black">For sellers</h3>
              </div>
              <div className="mt-8 space-y-4">
                {sellerSteps.map(([title, description], index) => (
                  <div key={title} className="flex gap-4 rounded-2xl bg-[#f6f1e7] p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-lime-300 text-sm font-black text-emerald-950">{index + 1}</div>
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="mt-1 leading-7 text-emerald-950/70">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[2.5rem] bg-lime-300 p-8 shadow-[0_20px_70px_rgba(8,28,21,0.10)]">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-950 text-lime-300">
                  <ShoppingBag className="h-6 w-6" />
                </div>
                <h3 className="text-3xl font-black">For customers</h3>
              </div>
              <div className="mt-8 space-y-4">
                {buyerSteps.map(([title, description], index) => (
                  <div key={title} className="flex gap-4 rounded-2xl bg-white/70 p-5">
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-950 text-sm font-black text-lime-200">{index + 1}</div>
                    <div>
                      <p className="font-black">{title}</p>
                      <p className="mt-1 leading-7 text-emerald-950/70">{description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-5 pb-20 lg:px-8 lg:pb-28">
        <div className="mx-auto max-w-7xl rounded-[2.5rem] bg-lime-300 p-8 text-emerald-950 md:p-12 lg:p-16">
          <div className="grid gap-8 md:grid-cols-4">
            {stats.map((stat) => (
              <div key={stat.label}>
                <p className="text-6xl font-black tracking-[-0.06em] lg:text-7xl">{stat.value}</p>
                <p className="mt-3 max-w-48 text-base font-bold leading-6 text-emerald-950/70">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-[#efe5d2] px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <SectionLabel>FAQ</SectionLabel>
            <h2 className="mt-6 text-5xl font-black leading-none tracking-[-0.05em] sm:text-6xl">
              Questions sellers and customers ask.
            </h2>
          </div>

          <div className="mt-12 space-y-4">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-[2rem] bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
                <h3 className="text-xl font-black">{item.question}</h3>
                <p className="mt-3 leading-7 text-emerald-950/70">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-5 py-20 lg:px-8 lg:py-28">
        <div className="mx-auto max-w-7xl overflow-hidden rounded-[3rem] bg-emerald-950 p-8 text-white shadow-[0_30px_90px_rgba(8,28,21,0.28)] md:p-14 lg:p-20">
          <div className="max-w-4xl">
            <h2 className="text-5xl font-black leading-none tracking-[-0.06em] sm:text-7xl">
              Ready to sell or shop smarter?
            </h2>
            <p className="mt-6 max-w-2xl text-xl leading-8 text-white/70">
              Create a store as a seller, or create a customer account to discover stores, compare products, follow sellers, and shop with confidence.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              {renderCreateStoreAction(
                'inline-flex items-center justify-center gap-2 rounded-full bg-lime-300 px-8 py-4 font-black text-emerald-950 transition hover:-translate-y-1 hover:bg-lime-200',
                <>Create Store <ArrowRight className="h-5 w-5" /></>
              )}
              <Link to={customerShopPath} className="inline-flex items-center justify-center rounded-full border border-white/30 px-8 py-4 font-black text-white transition hover:bg-white/10">
                Shop on Shoplinker
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-emerald-950/10 bg-[#f6f1e7] px-5 py-14 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-10 lg:grid-cols-[1.2fr_2fr]">
          <div>
            <img src="/shoplinker.svg" alt="Shoplinker" className="h-10 w-auto" />
            <p className="mt-5 max-w-sm text-lg leading-8 text-emerald-950/70">
              A modern commerce platform for sellers, customers, local brands, and growing online stores.
            </p>
          </div>

          <div className="grid gap-8 sm:grid-cols-3">
            {footerGroups.map((group) => (
              <div key={group.title}>
                <h3 className="font-black">{group.title}</h3>
                <div className="mt-4 space-y-3">
                  {group.links.map((link) => (
                    <a key={link.label} href={link.href} className="block font-semibold text-emerald-950/60 transition hover:text-emerald-950">
                      {link.label}
                    </a>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="mx-auto mt-12 flex max-w-7xl flex-col justify-between gap-4 border-t border-emerald-950/10 pt-6 text-sm font-semibold text-emerald-950/60 sm:flex-row">
          <p>© {new Date().getFullYear()} Shoplinker. All rights reserved.</p>
          <p>Built for modern small-business commerce.</p>
        </div>
      </footer>
    </main>
  );
}
