import { Link } from "react-router-dom";
import { CheckCircle, Package, ArrowRight } from "lucide-react";
import ShopNavbar from "../components/ShopNavbar";

const CheckoutSuccess = () => {
  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar />

      <div className="mx-auto max-w-2xl px-6 py-16 lg:px-8">
        <div className="text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-green-50 text-green-600 mx-auto mb-6">
            <CheckCircle className="h-12 w-12" />
          </div>

          <h1 className="text-3xl font-bold text-slate-900 mb-2">
            Order Placed Successfully!
          </h1>

          <p className="text-lg text-slate-600 mb-8">
            Thank you for your order. We've received your order and will process
            it shortly.
          </p>

          <div className="rounded-2xl bg-white p-6 border border-slate-200 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Package className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-900">
                What's Next?
              </h2>
            </div>

            <div className="space-y-3 text-left">
              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  1
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Order Confirmation
                  </p>
                  <p className="text-sm text-slate-600">
                    You'll receive an email confirmation shortly.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  2
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">
                    Processing
                  </p>
                  <p className="text-sm text-slate-600">
                    We'll prepare your order for shipping.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  3
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Shipping</p>
                  <p className="text-sm text-slate-600">
                    Your order will be delivered to your address.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-semibold">
                  4
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-900">Delivery</p>
                  <p className="text-sm text-slate-600">
                    Pay cash on delivery when your order arrives.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/stores"
              className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-6 py-3 font-semibold text-white transition hover:bg-blue-700"
            >
              Continue Shopping
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-6 py-3 font-semibold text-slate-700 transition hover:bg-slate-200"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccess;
