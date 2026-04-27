import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { couponsAPI, productsAPI, ordersAPI } from "../api/api";
import { useAuth } from "../context/AuthContext";
import {
  Loader2,
  ArrowLeft,
  CreditCard,
  Truck,
  MapPin,
  User,
  Phone,
  Mail,
  Package,
  AlertCircle,
  X,
  Lock,
} from "lucide-react";

const formatCurrency = (amount) => `৳${Number(amount || 0).toLocaleString("en-BD")}`;

const paymentOptions = [
  {
    value: "cod",
    label: "Cash on Delivery",
    helper: "Pay when your order is delivered.",
  },
  {
    value: "card",
    label: "Card / bKash / Nagad",
    helper: "Pay online via card or mobile banking.",
  },
  {
    value: "bank",
    label: "Bank Transfer",
    helper: "Direct bank transfer — details sent after order.",
  },
];

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [cartItems, setCartItems] = useState([]);
  const [store, setStore] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState(null);

  // firstName, lastName, email pre-filled from the logged-in user (read-only)
  // phone, address, city, postalCode entered manually
  const [formData, setFormData] = useState({
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "cod",
  });

  useEffect(() => {
    loadCart();
  }, []);

  const loadCart = async () => {
    try {
      setLoading(true);
      setError("");

      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (cart.length === 0) {
        navigate("/cart");
        return;
      }

      const productResults = await Promise.all(
        cart.map(async (item) => {
          try {
            const response = await productsAPI.getOne(item.id);
            const product = response.data || response;
            return {
              ...product,
              quantity: Math.min(Number(item.quantity) || 1, Number(product.stock) || 1),
            };
          } catch (err) {
            console.error(`Failed to load product ${item.id}:`, err);
            return null;
          }
        }),
      );

      const validProducts = productResults.filter(Boolean);

      if (validProducts.length === 0) {
        setError("Your cart products are no longer available.");
        localStorage.setItem("cart", JSON.stringify([]));
        navigate("/cart");
        return;
      }

      const storeIds = Array.from(
        new Set(validProducts.map((product) => product.store?.id).filter(Boolean)),
      );

      if (storeIds.length > 1) {
        setError("Your cart contains products from multiple stores. Please checkout one store at a time.");
        navigate("/cart");
        return;
      }

      if (storeIds.length === 0 || !validProducts[0]?.store) {
        setError("Unable to process cart because store information is missing.");
        navigate("/cart");
        return;
      }

      setStore(validProducts[0].store);
      setCartItems(validProducts);

      const storedCoupon = JSON.parse(localStorage.getItem("cartCoupon") || "null");
      if (storedCoupon?.storeId === validProducts[0].store.id) {
        try {
          const couponResponse = await couponsAPI.getByStoreAndCode(
            validProducts[0].store.id,
            storedCoupon.code,
          );
          const coupon = couponResponse.data || couponResponse;
          setAppliedCoupon({
            id: coupon.id,
            code: coupon.code,
            discountType: coupon.discountType,
            discountValue: Number(coupon.discountValue),
            storeId: coupon.storeId,
          });
        } catch {
          localStorage.removeItem("cartCoupon");
          setAppliedCoupon(null);
        }
      } else {
        localStorage.removeItem("cartCoupon");
      }
    } catch (err) {
      console.error("Failed to load cart:", err);
      setError("Failed to load checkout. Please try again.");
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFieldError("");
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSubtotal = () =>
    cartItems.reduce((total, item) => total + Number(item.price || 0) * Number(item.quantity || 1), 0);

  const getShipping = () => (getSubtotal() > 500 ? 0 : 50);

  const getTax = () => getSubtotal() * 0.15;

  const getDiscountAmount = () => {
    if (!appliedCoupon) return 0;

    const subtotal = getSubtotal();
    const value = Number(appliedCoupon.discountValue || 0);
    const discount =
      appliedCoupon.discountType === "percentage"
        ? subtotal * (value / 100)
        : value;

    return Math.min(subtotal, Math.max(0, discount));
  };

  const getTotal = () => getSubtotal() - getDiscountAmount() + getShipping() + getTax();

  const validateForm = () => {
    const requiredFields = [
      ["phone", "Phone"],
      ["address", "Address"],
      ["city", "City"],
      ["postalCode", "Postal code"],
    ];

    const missingFields = requiredFields
      .filter(([key]) => !formData[key].trim())
      .map(([, label]) => label);

    if (missingFields.length > 0) {
      setFieldError(`Please fill in: ${missingFields.join(", ")}.`);
      return false;
    }

    if (!user?.email || !user?.firstName || !user?.lastName) {
      setFieldError("Your account info is incomplete. Please update your profile.");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setFieldError("");

    if (!validateForm()) return;

    setProcessing(true);

    try {
      const orderData = {
        storeId: store.id,
        customerInfo: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: Number(item.price || 0),
          quantity: Number(item.quantity || 1),
          image: item.images?.[0] || item.image || "",
        })),
        subtotal: getSubtotal(),
        discount: getDiscountAmount(),
        couponCode: appliedCoupon?.code || null,
        shipping: getShipping(),
        tax: getTax(),
        total: getTotal(),
        paymentMethod: formData.paymentMethod,
      };

      await ordersAPI.create(orderData);

      localStorage.removeItem("cart");
      localStorage.removeItem("cartCoupon");
      navigate("/checkout/success");
    } catch (err) {
      console.error("Checkout failed:", err);
      const msg = err.response?.data?.message;
      setError(
        Array.isArray(msg) ? msg.join(" · ") : msg || "Checkout failed. Please try again.",
      );
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-neutral-50 text-neutral-950">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin" />
          <p className="mt-4 text-sm font-semibold text-neutral-600">Loading checkout...</p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-neutral-50 text-neutral-950">
      <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-4 lg:px-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-700 transition hover:border-neutral-950 hover:text-neutral-950"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>

          <Link
            to={store?.slug ? `/store/${store.slug}` : "/stores"}
            className="rounded-full border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold transition hover:border-neutral-950"
          >
            Back to Store
          </Link>
        </div>
      </header>

      <div className="mx-auto max-w-7xl px-5 py-10 lg:px-8">
        <section className="mb-8">
          <p className="text-sm font-bold uppercase tracking-[0.18em] text-neutral-500">Secure checkout</p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight">Complete your order</h1>
          {store && (
            <p className="mt-2 text-neutral-600">
              Ordering from <span className="font-semibold text-neutral-950">{store.name}</span>
            </p>
          )}
        </section>

        {(error || fieldError) && (
          <div className="mb-6 space-y-3">
            {error && (
              <div className="flex items-center justify-between rounded-2xl border border-red-200 bg-red-50 p-4 text-red-700">
                <p className="font-semibold">{error}</p>
                <button onClick={() => setError("")} className="rounded-full p-1 hover:bg-red-100">
                  <X className="h-4 w-4" />
                </button>
              </div>
            )}

            {fieldError && (
              <div className="flex gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 text-amber-800">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <p className="font-semibold">{fieldError}</p>
              </div>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-[1fr_420px]">
          <section className="space-y-6">
            {/* Customer info — auto-filled from account */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <User className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-xl font-bold">Customer information</h2>
                  <p className="mt-0.5 text-xs text-neutral-500">Name and email are taken from your account</p>
                </div>
              </div>

              {/* Read-only account fields */}
              <div className="mb-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">
                    First Name
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                      <Lock className="h-3 w-3" /> from account
                    </span>
                  </label>
                  <input
                    type="text"
                    value={user?.firstName || ""}
                    readOnly
                    className="w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-600 outline-none"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">
                    Last Name
                    <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                      <Lock className="h-3 w-3" /> from account
                    </span>
                  </label>
                  <input
                    type="text"
                    value={user?.lastName || ""}
                    readOnly
                    className="w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-100 px-4 py-3 text-neutral-600 outline-none"
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Email Address
                  <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-neutral-100 px-2 py-0.5 text-xs font-medium text-neutral-500">
                    <Lock className="h-3 w-3" /> from account
                  </span>
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full cursor-not-allowed rounded-2xl border border-neutral-200 bg-neutral-100 py-3 pl-11 pr-4 text-neutral-600 outline-none"
                  />
                </div>
              </div>

              {/* Manual field — phone */}
              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder="e.g. 01700000000"
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 py-3 pl-11 pr-4 outline-none transition focus:border-neutral-950 focus:bg-white"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping address */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <MapPin className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Shipping address</h2>
              </div>

              <div>
                <label className="mb-2 block text-sm font-semibold text-neutral-700">
                  Street Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-950 focus:bg-white"
                  placeholder="House, road, area"
                  required
                />
              </div>

              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">
                    City <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-950 focus:bg-white"
                    placeholder="e.g. Dhaka"
                    required
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm font-semibold text-neutral-700">
                    Postal Code <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="postalCode"
                    value={formData.postalCode}
                    onChange={handleInputChange}
                    className="w-full rounded-2xl border border-neutral-200 bg-neutral-50 px-4 py-3 outline-none transition focus:border-neutral-950 focus:bg-white"
                    placeholder="e.g. 1207"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment method */}
            <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-neutral-100">
                  <CreditCard className="h-5 w-5" />
                </div>
                <h2 className="text-xl font-bold">Payment method</h2>
              </div>

              <div className="grid gap-3 sm:grid-cols-3">
                {paymentOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`cursor-pointer rounded-2xl border p-4 transition ${
                      formData.paymentMethod === option.value
                        ? "border-neutral-950 bg-neutral-950 text-white"
                        : "border-neutral-200 bg-neutral-50 hover:border-neutral-400"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={option.value}
                        checked={formData.paymentMethod === option.value}
                        onChange={handleInputChange}
                        className="mt-1"
                      />
                      <div>
                        <p className="font-bold">{option.label}</p>
                        <p
                          className={`mt-1 text-sm leading-5 ${
                            formData.paymentMethod === option.value ? "text-white/70" : "text-neutral-500"
                          }`}
                        >
                          {option.helper}
                        </p>
                      </div>
                    </div>
                  </label>
                ))}
              </div>

              {formData.paymentMethod !== "cod" && (
                <p className="mt-4 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-800">
                  This payment option is shown for your project requirement. Connect the real payment gateway before production.
                </p>
              )}
            </div>
          </section>

          <aside>
            <div className="sticky top-24 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-xl font-bold">Order summary</h2>
                <Truck className="h-5 w-5 text-neutral-500" />
              </div>

              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <Link
                      to={`/product/${item.id}`}
                      className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-neutral-100"
                    >
                      {item.images && item.images.length > 0 ? (
                        <img src={item.images[0]} alt={item.name} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-neutral-400">
                          <Package className="h-6 w-6" />
                        </div>
                      )}
                    </Link>

                    <div className="min-w-0 flex-1">
                      <p className="truncate font-semibold">{item.name}</p>
                      <p className="mt-1 text-sm text-neutral-500">
                        Qty {item.quantity} × {formatCurrency(item.price)}
                      </p>
                    </div>

                    <p className="font-semibold">
                      {formatCurrency(Number(item.price || 0) * Number(item.quantity || 1))}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-6 space-y-3 border-t border-neutral-200 pt-5 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(getSubtotal())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Shipping</span>
                  <span className="font-semibold">{getShipping() === 0 ? "Free" : formatCurrency(getShipping())}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-600">Tax (15%)</span>
                  <span className="font-semibold">{formatCurrency(getTax())}</span>
                </div>
                {appliedCoupon && (
                  <div className="flex justify-between text-green-700">
                    <span>Coupon ({appliedCoupon.code})</span>
                    <span className="font-semibold">-{formatCurrency(getDiscountAmount())}</span>
                  </div>
                )}
                <div className="flex justify-between border-t border-neutral-200 pt-4 text-lg font-bold">
                  <span>Total</span>
                  <span>{formatCurrency(getTotal())}</span>
                </div>
              </div>

              <button
                type="submit"
                disabled={processing}
                className="mt-6 inline-flex w-full items-center justify-center gap-2 rounded-full bg-neutral-950 px-6 py-4 font-semibold text-white transition hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {processing ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Placing Order...
                  </>
                ) : (
                  <>
                    <Truck className="h-5 w-5" />
                    Place Order
                  </>
                )}
              </button>

              <p className="mt-4 text-center text-xs leading-5 text-neutral-500">
                Your order will be created as Pending. The seller will confirm and update delivery status.
              </p>
            </div>
          </aside>
        </form>
      </div>
    </main>
  );
};

export default Checkout;
