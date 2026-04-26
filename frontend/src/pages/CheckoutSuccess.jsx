import { Link } from "react-router-dom";
import {
  CheckCircle,
  Package,
  ArrowRight,
  ClipboardList,
  Truck,
  Home,
} from "lucide-react";

const statusSteps = [
  {
    title: "Pending",
    description: "Your order has been placed and is waiting for seller confirmation.",
    icon: ClipboardList,
  },
  {
    title: "Confirmed",
    description: "The seller confirms your order and prepares the products.",
    icon: CheckCircle,
  },
  {
    title: "Shipped",
    description: "Your order is on the way to your delivery address.",
    icon: Truck,
  },
  {
    title: "Delivered",
    description: "After delivery, you can leave a verified review.",
    icon: Package,
  },
];

const CheckoutSuccess = () => {
  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link to="/stores" className="flex items-center gap-3">
            <img src="/shoplinker.svg" alt="Shoplinker" className="h-9 w-auto" />
          </Link>

          <Link
            to="/stores"
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-neutral-950"
          >
            Continue Shopping
          </Link>
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center lg:px-8">
        <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-green-50 text-green-600">
          <CheckCircle className="h-12 w-12" />
        </div>

        <h1 className="mt-8 text-4xl font-bold tracking-tight">
          Order placed successfully
        </h1>

        <p className="mx-auto mt-4 max-w-xl text-lg leading-8 text-neutral-600">
          Your order is now pending. The seller will review it, confirm it, and update the delivery status.
        </p>

        <div className="mt-10 rounded-[2rem] border border-neutral-200 bg-white p-6 text-left shadow-sm">
          <h2 className="text-xl font-bold">What happens next?</h2>

          <div className="mt-6 space-y-4">
            {statusSteps.map((step, index) => {
              const Icon = step.icon;

              return (
                <div key={step.title} className="flex gap-4 rounded-2xl bg-neutral-50 p-4">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-neutral-950 text-white">
                    {index === 0 ? <Icon className="h-5 w-5" /> : <span className="text-sm font-bold">{index + 1}</span>}
                  </div>
                  <div>
                    <p className="font-bold">{step.title}</p>
                    <p className="mt-1 text-sm leading-6 text-neutral-600">{step.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/stores"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-neutral-950 px-7 py-4 font-semibold text-white transition hover:bg-neutral-800"
          >
            Continue Shopping
            <ArrowRight className="h-5 w-5" />
          </Link>

          <Link
            to="/dashboard"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-neutral-200 bg-white px-7 py-4 font-semibold text-neutral-800 transition hover:border-neutral-950"
          >
            <Home className="h-5 w-5" />
            Go to Dashboard
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CheckoutSuccess;
