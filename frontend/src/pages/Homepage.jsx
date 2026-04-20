import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle2,
  Facebook,
  Globe,
  Link2,
  Menu,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Store,
} from 'lucide-react';

const features = [
  {
    icon: Store,
    title: "Launch your store quickly",
    description:
      "Add your logo, shop name, banner, contact details, and business info to create a professional storefront without code.",
  },
  {
    icon: Facebook,
    title: "Import from Facebook",
    description:
      "Connect your Facebook page or paste product post links to bring your catalog into your site faster.",
  },
  {
    icon: Link2,
    title: "Manual or assisted product upload",
    description:
      "Add products manually, paste post links, and manage all listings from one simple dashboard.",
  },
  {
    icon: Globe,
    title: "Grow beyond Messenger",
    description:
      "Give customers a real website where they can browse products and trust your brand more easily.",
  },
  {
    icon: MessageCircle,
    title: "Built for social sellers",
    description:
      "Designed for businesses that already sell through Facebook posts, comments, and Messenger conversations.",
  },
  {
    icon: ShieldCheck,
    title: "More trust, better presence",
    description:
      "A branded website makes your business look more established and helps customers shop with confidence.",
  },
];

const steps = [
  "Add your shop name, logo, banner, and business details",
  "Connect your Facebook page or paste product post links",
  "Review imported products and edit pricing, images, and descriptions",
  "Publish your storefront and start receiving more organized orders",
];

const testimonials = [
  {
    name: "Nusrat Fashion House",
    quote:
      "We used to manage everything through Facebook inbox. With Shoplinker, customers can now browse our products properly before messaging us.",
  },
  {
    name: "Urban Gadget Point",
    quote:
      "The idea of turning our Facebook posts into a website is exactly what small sellers need. It saves time and looks much more professional.",
  },
  {
    name: "Daily Needs Mart",
    quote:
      "Shoplinker can help local sellers build trust faster because customers see a proper storefront instead of only social posts.",
  },
];

const pricing = [
  {
    name: "Starter",
    price: "Free",
    description: "Perfect for testing your first storefront.",
    features: [
      "Basic storefront setup",
      "Add logo, banner, and shop details",
      "Manual product upload",
      "Facebook page link display",
    ],
    cta: "Start free",
    highlighted: false,
  },
  {
    name: "Growth",
    price: "Coming soon",
    description: "For active businesses ready to scale online.",
    features: [
      "Everything in Starter",
      "Facebook product import tools",
      "Better storefront customization",
      "Product management dashboard",
    ],
    cta: "Join waitlist",
    highlighted: true,
  },
  {
    name: "Business",
    price: "Custom",
    description: "For larger sellers and managed onboarding.",
    features: [
      "Custom setup support",
      "Assisted catalog onboarding",
      "Priority support",
      "Advanced branding options",
    ],
    cta: "Contact sales",
    highlighted: false,
  },
];

const faqs = [
  {
    question: "Do I need a website already?",
    answer:
      "No. Shoplinker is for businesses that may only have a Facebook page and want to create a full storefront from that starting point.",
  },
  {
    question: "Can I add products manually?",
    answer:
      "Yes. You can manually upload products or paste product post links to speed up the process.",
  },
  {
    question: "Is this only for Bangladesh?",
    answer:
      "No. The idea is especially relevant in Bangladesh, but it also works for social-commerce businesses in many other countries.",
  },
  {
    question: "Can customers still contact us through Facebook?",
    answer:
      "Yes. Your storefront can still show your Facebook page and keep your existing social-selling workflow connected.",
  },
];

function SectionHeading({ eyebrow, title, description }) {
  return (
    <div className="max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
        {eyebrow}
      </p>
      <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
        {title}
      </h2>
      <p className="mt-4 text-lg leading-8 text-slate-600">{description}</p>
    </div>
  );
}

export default function Homepage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  // Redirect authenticated users to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard');
    }
  }, [isAuthenticated, navigate]);
  
  return (
    <main className="min-h-screen bg-white text-slate-900">
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-blue-50 via-white to-white" />
        <div className="absolute left-0 top-0 h-72 w-72 rounded-full bg-blue-100/70 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-cyan-100/70 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-6 py-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="relative h-16 w-48 shrink-0">
              <img
                src="/shoplinker.svg"
                alt="Shoplinker logo"
                className="h-full w-full object-contain object-left"
              />
            </div>

            <header className="flex flex-1 flex-wrap items-center justify-between gap-4 rounded-full border border-white/60 bg-white/80 px-6 py-4 shadow-md backdrop-blur md:px-8">
              <nav className="hidden items-center gap-8 text-sm font-medium md:flex">
                <a href="#features" className="transition hover:text-blue-600">
                  Features
                </a>
                <a href="#how-it-works" className="transition hover:text-blue-600">
                  How it works
                </a>
                <a href="#pricing" className="transition hover:text-blue-600">
                  Pricing
                </a>
                <Link to="/sell" className="transition hover:text-blue-600">
                  Sell on Shoplinker
                </Link>
                <a href="#faq" className="transition hover:text-blue-600">
                  FAQ
                </a>
              </nav>

              <div className="hidden items-center gap-4 md:flex">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg">
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link to="/login" className="rounded-lg border border-slate-200 px-5 py-2 text-sm font-semibold transition-all duration-200 hover:border-blue-400 hover:text-blue-600">
                      Sign in
                    </Link>
                    <Link to="/register" className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg">
                      Get started
                    </Link>
                  </>
                )}
              </div>

              <button className="rounded-full border border-slate-200 p-2 md:hidden">
                <Menu className="h-5 w-5" />
              </button>
            </header>
          </div>

          <div className="grid items-center gap-12 py-16 lg:grid-cols-2 lg:py-24">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <Sparkles className="h-4 w-4" />
                Built for Facebook-first businesses
              </div>
              <h1 className="mt-6 text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">
                Turn your Facebook shop into a branded ecommerce website.
              </h1>
              <p className="mt-6 max-w-2xl text-lg leading-8 text-slate-600">
                Shoplinker helps sellers in Bangladesh and beyond launch a professional storefront using their logo, banner, shop details, and Facebook content without starting from scratch.
              </p>

              <div className="mt-8 flex flex-col gap-4 sm:flex-row">
                {isAuthenticated ? (
                  <Link to="/dashboard" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                ) : (
                  <>
                    <Link to="/register" className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg transition-all duration-200 hover:bg-blue-700 hover:shadow-xl">
                      Create your store
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                    <button className="rounded-xl border border-slate-300 px-6 py-3 font-semibold text-slate-700 shadow-sm transition-all duration-200 hover:border-blue-400 hover:text-blue-600 hover:shadow-md">
                      See how it works
                    </button>
                  </>
                )}
              </div>

              <div className="mt-10 grid gap-4 sm:grid-cols-3">
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg hover:border-blue-200">
                  <p className="text-2xl font-bold text-slate-900">Fast</p>
                  <p className="mt-1 text-sm text-slate-600">Launch in minutes</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg hover:border-blue-200">
                  <p className="text-2xl font-bold text-slate-900">Simple</p>
                  <p className="mt-1 text-sm text-slate-600">No coding required</p>
                </div>
                <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg hover:border-blue-200">
                  <p className="text-2xl font-bold text-slate-900">Trusted</p>
                  <p className="mt-1 text-sm text-slate-600">Professional brand presence</p>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-2xl border border-slate-200 bg-white p-4 shadow-xl">
                <div className="rounded-[28px] bg-slate-50 p-5">
                  <div className="rounded-3xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-lg font-bold text-white">
                        S
                      </div>
                      <div>
                        <h3 className="text-lg font-bold">Your Shop Website</h3>
                        <p className="text-sm text-slate-500">From Facebook page to storefront</p>
                      </div>
                    </div>

                    <div className="mt-6 overflow-hidden rounded-3xl border border-slate-100">
                      <div className="h-36 bg-gradient-to-r from-blue-500 to-cyan-400" />
                      <div className="p-5">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <p className="text-lg font-bold">Nusrat Fashion House</p>
                            <p className="text-sm text-slate-500">Modern clothing and lifestyle products</p>
                          </div>
                          <div className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                            Live store
                          </div>
                        </div>

                        <div className="mt-5 grid grid-cols-2 gap-4">
                          {[1, 2, 3, 4].map((item) => (
                            <div key={item} className="rounded-2xl bg-slate-50 p-3">
                              <div className="h-20 rounded-xl bg-slate-200" />
                              <p className="mt-3 text-sm font-semibold text-slate-900">Product Item</p>
                              <p className="text-xs text-slate-500">Imported from Facebook</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="border-y border-slate-100 bg-slate-50/70">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 py-8 text-sm text-slate-600 sm:grid-cols-2 lg:grid-cols-4 lg:px-8">
          <div className="rounded-xl bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg">Made for Facebook page sellers</div>
          <div className="rounded-xl bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg">Supports manual and link-based product uploads</div>
          <div className="rounded-xl bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg">Professional branding with logo and banner</div>
          <div className="rounded-xl bg-white p-4 shadow-md transition-all duration-200 hover:shadow-lg">Ideal for Bangladesh and global social commerce</div>
        </div>
      </section>

      <section id="features" className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Features"
          title="Everything social-commerce sellers need"
          description="Built for businesses that already sell through Facebook and want a better, more organized online presence."
        />

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-xl font-semibold">{feature.title}</h3>
                <p className="mt-3 leading-7 text-slate-600">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section id="how-it-works" className="bg-slate-50 py-20">
        <div className="mx-auto grid max-w-7xl gap-12 px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="How it works"
              title="A simple workflow from Facebook page to online store"
              description="Shoplinker fits how many small businesses already work, then upgrades that workflow into a real website experience."
            />
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step}
                className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5 shadow-md transition-all duration-200 hover:shadow-lg"
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
                  {index + 1}
                </div>
                <div>
                  <p className="text-lg font-semibold text-slate-900">{step}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-2xl bg-slate-900 p-8 text-white shadow-lg md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-300">
              Why Shoplinker
            </p>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Social selling works. Shoplinker makes it more professional.
            </h2>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              Many businesses already succeed on Facebook, but customers still expect a clean website experience. Shoplinker bridges that gap without forcing sellers to abandon the tools they already use.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-2">
              {[
                "Professional online presence",
                "Branded identity with your own visuals",
                "Easier product browsing for customers",
                "Keeps Facebook workflow connected",
              ].map((item) => (
                <div key={item} className="flex items-start gap-3 rounded-2xl bg-white/5 p-4">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-300" />
                  <span className="text-slate-200">{item}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white p-8 shadow-md md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-600">
              Starter form
            </p>
            <h3 className="mt-3 text-2xl font-bold text-slate-900">
              See how onboarding could begin
            </h3>
            <p className="mt-4 leading-7 text-slate-600">
              Collect a few details and help sellers create their storefront quickly.
            </p>

            <div className="mt-8 space-y-3">
              <input
                type="text"
                placeholder="Your shop name"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-md"
              />
              <input
                type="text"
                placeholder="Facebook page link"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-md"
              />
              <input
                type="text"
                placeholder="Business phone or WhatsApp"
                className="w-full rounded-lg border border-slate-200 px-4 py-3 outline-none transition-all duration-200 focus:border-blue-500 focus:shadow-md"
              />
              <button className="w-full rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white shadow-md transition-all duration-200 hover:bg-blue-700 hover:shadow-lg">
                Start building
              </button>
            </div>
          </div>
        </div>
      </section>

      <section id="pricing" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="Pricing"
            title="Simple pricing for different stages of growth"
            description="You can replace these placeholders later with your final pricing model."
          />

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {pricing.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl border p-8 shadow-md transition-all duration-200 ${
                  plan.highlighted
                    ? "border-blue-600 bg-white ring-4 ring-blue-100 hover:shadow-xl"
                    : "border-slate-100 bg-white hover:shadow-lg"
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-bold text-slate-900">{plan.name}</h3>
                  {plan.highlighted && (
                    <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                      Popular
                    </span>
                  )}
                </div>
                <p className="mt-4 text-3xl font-bold text-slate-900">{plan.price}</p>
                <p className="mt-3 leading-7 text-slate-600">{plan.description}</p>
                <div className="mt-6 space-y-3">
                  {plan.features.map((item) => (
                    <div key={item} className="flex items-start gap-3">
                      <CheckCircle2 className="mt-0.5 h-5 w-5 text-blue-600" />
                      <span className="text-slate-600">{item}</span>
                    </div>
                  ))}
                </div>
                <button
                  className={`mt-8 w-full rounded-lg px-5 py-3 font-semibold shadow-sm transition-all duration-200 ${
                    plan.highlighted
                      ? "bg-blue-600 text-white hover:bg-blue-700 hover:shadow-lg"
                      : "border border-slate-200 text-slate-900 hover:border-blue-400 hover:text-blue-600 hover:shadow-md"
                  }`}
                >
                  {plan.cta}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <SectionHeading
          eyebrow="Testimonials"
          title="What sellers might love about Shoplinker"
          description="Sample testimonial content for your landing page design."
        />

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {testimonials.map((item) => (
            <div key={item.name} className="rounded-2xl border border-slate-100 bg-white p-8 shadow-md transition-all duration-200 hover:shadow-lg">
              <p className="text-lg leading-8 text-slate-600">"{item.quote}"</p>
              <div className="mt-6">
                <p className="font-semibold text-slate-900">{item.name}</p>
                <p className="text-sm text-slate-500">Early seller perspective</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="bg-slate-50 py-20">
        <div className="mx-auto max-w-5xl px-6 lg:px-8">
          <SectionHeading
            eyebrow="FAQ"
            title="Common questions"
            description="Helpful answers for sellers who are thinking about moving beyond Facebook-only selling."
          />

          <div className="mt-12 space-y-4">
            {faqs.map((item) => (
              <div key={item.question} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-md transition-all duration-200 hover:shadow-lg">
                <h3 className="text-lg font-semibold text-slate-900">{item.question}</h3>
                <p className="mt-3 leading-7 text-slate-600">{item.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
        <div className="rounded-2xl bg-blue-600 px-8 py-12 text-white shadow-2xl md:px-12 md:py-16">
          <div className="grid items-center gap-8 lg:grid-cols-[1.2fr_0.8fr]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-blue-100">
                Start now
              </p>
              <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
                Build a modern storefront for your Facebook business.
              </h2>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-blue-50">
                Create a stronger online identity, organize your products better, and help customers shop more easily with Shoplinker.
              </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row lg:justify-end">
              <Link to="/register" className="rounded-lg bg-white px-6 py-3 font-semibold text-blue-700 transition-all duration-200 hover:bg-blue-50 hover:shadow-md text-center">
                Get started free
              </Link>
              <button className="rounded-lg border border-white/30 px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-white/10 hover:border-white">
                Book a demo
              </button>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-slate-100 bg-white">
        <div className="mx-auto grid max-w-7xl gap-10 px-6 py-12 text-sm text-slate-600 md:grid-cols-4 lg:px-8">
          <div>
            <div className="relative h-12 w-40">
              <img
                src="/shoplinker.svg"
                alt="Shoplinker logo"
                className="h-full w-full object-contain object-left"
              />
            </div>
            <p className="mt-4 leading-7">
              Helping Facebook-based businesses create real ecommerce storefronts.
            </p>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Product</p>
            <div className="mt-4 space-y-3">
              <a href="#features" className="block hover:text-blue-600">
                Features
              </a>
              <a href="#pricing" className="block hover:text-blue-600">
                Pricing
              </a>
              <a href="#faq" className="block hover:text-blue-600">
                FAQ
              </a>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Company</p>
            <div className="mt-4 space-y-3">
              <a href="#" className="block hover:text-blue-600">
                About
              </a>
              <a href="#" className="block hover:text-blue-600">
                Contact
              </a>
              <a href="#" className="block hover:text-blue-600">
                Support
              </a>
            </div>
          </div>

          <div>
            <p className="font-semibold text-slate-900">Legal</p>
            <div className="mt-4 space-y-3">
              <a href="#" className="block hover:text-blue-600">
                Privacy Policy
              </a>
              <a href="#" className="block hover:text-blue-600">
                Terms of Service
              </a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}
