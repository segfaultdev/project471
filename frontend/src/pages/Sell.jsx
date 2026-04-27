import { Link } from 'react-router-dom';
import { Store, ShoppingBag, TrendingUp, Check } from 'lucide-react';

const Sell = () => {
  const features = [
    {
      title: 'Create your storefront',
      description: 'Set your shop name, upload logo and banner, choose a category, and get your own public store URL.',
      icon: Store,
    },
    {
      title: 'Import from Facebook or Instagram',
      description: 'Paste your page link to auto-fill public business info like page name, bio, and profile image.',
      icon: TrendingUp,
    },
    {
      title: 'Add products your way',
      description: 'Create products manually or paste product post links to speed up product publishing.',
      icon: ShoppingBag,
    },
  ];

  const steps = [
    'Create your seller account',
    'Set up your store information',
    'Upload logo, banner, and select category',
    'Publish store and add your first product',
  ];

  return (
    <main className="min-h-screen bg-white text-slate-900">
      
      <section className="bg-gradient-to-b from-blue-50 to-white">
        <div className="mx-auto max-w-7xl px-6 py-6 lg:px-8">
          
          <header className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <img src="/shoplinker.svg" alt="Shoplinker" className="h-10 w-auto" />
            </Link>

            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
              >
                Seller Login
              </Link>
              <Link
                to="/register"
                className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                Get Started
              </Link>
            </div>
          </header>

          
          <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <span className="inline-flex rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                Built for social-commerce sellers
              </span>
              <h1 className="mt-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
                Start selling with your own storefront.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Shoplinker helps sellers create a professional mini website from their
                existing Facebook or Instagram business presence.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                <Link
                  to="/register"
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
                >
                  Create Seller Account
                </Link>
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center rounded-2xl border border-slate-200 px-6 py-3 font-semibold text-slate-700 transition hover:border-blue-300 hover:text-blue-600"
                >
                  Already have an account?
                </Link>
              </div>
            </div>

            
            <div className="rounded-[32px] border border-slate-100 bg-white p-6 shadow-xl">
              <div className="rounded-[28px] bg-slate-50 p-6">
                <div className="rounded-3xl bg-white p-6 shadow-sm">
                  <h2 className="text-xl font-bold text-slate-900">How it works</h2>
                  <div className="mt-6 space-y-4">
                    {steps.map((step, index) => (
                      <div key={step} className="flex items-start gap-4 rounded-2xl bg-slate-50 p-4">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                          {index + 1}
                        </div>
                        <p className="font-medium text-slate-700 pt-1">{step}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      
      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">
            Why sellers use Shoplinker
          </p>
          <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Everything needed to launch your first store
          </h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-3xl border border-slate-100 bg-white p-6 shadow-sm hover:shadow-md transition"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      
      <section className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <div className="rounded-[32px] bg-white p-8 md:p-12 shadow-sm">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 text-center mb-8">
              Why choose Shoplinker?
            </h2>
            
            <div className="grid gap-6 md:grid-cols-2">
              {[
                'Easy store setup in minutes',
                'Custom store URL with your brand',
                'Manage products from one place',
                'Mobile-friendly storefront',
                'Free to get started',
                'Built for Facebook sellers',
              ].map((benefit) => (
                <div key={benefit} className="flex items-start gap-3">
                  <div className="mt-1 flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600">
                    <Check className="h-4 w-4" />
                  </div>
                  <p className="text-slate-700 font-medium">{benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      
      <section className="bg-white py-20">
        <div className="mx-auto max-w-5xl px-6 text-center lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Ready to open your first Shoplinker store?
          </h2>
          <p className="mt-4 text-lg text-slate-600">
            Create your seller account and start building your storefront today.
          </p>
          <Link
            to="/register"
            className="mt-8 inline-flex items-center justify-center rounded-2xl bg-blue-600 px-8 py-4 text-lg font-semibold text-white transition hover:bg-blue-700 shadow-lg hover:shadow-xl"
          >
            Start Now - It's Free
          </Link>
        </div>
      </section>

      
      <footer className="border-t border-slate-100 bg-slate-50 py-12">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <Link to="/" className="flex items-center gap-3">
              <img src="/shoplinker.svg" alt="Shoplinker" className="h-8 w-auto" />
            </Link>
            <p className="text-sm text-slate-600">
              © 2026 Shoplinker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </main>
  );
};

export default Sell;
