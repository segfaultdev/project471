import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { productsAPI, ordersAPI, paymentAPI } from "../api/api";
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
  Lock,
} from "lucide-react";
import ShopNavbar from "../components/ShopNavbar";

const Checkout = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    paymentMethod: "card", // card or cod
    cardNumber: "",
    cardHolderName: "",
    expiryDate: "",
    cvv: "",
  });

  useEffect(() => {
    // Auto-fill user data
    if (user) {
      setFormData(prev => ({
        ...prev,
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      }));
    }
    loadCart();
  }, [user]);

  const loadCart = async () => {
    try {
      setLoading(true);
      const cart = JSON.parse(localStorage.getItem("cart") || "[]");

      if (cart.length === 0) {
        navigate("/cart");
        return;
      }

      // Fetch product details for cart items
      const productPromises = cart.map(async (item) => {
        try {
          const response = await productsAPI.getOne(item.id);
          return { ...response.data, quantity: item.quantity };
        } catch (err) {
          console.error(`Failed to load product ${item.id}:`, err);
          return null;
        }
      });

      const products = await Promise.all(productPromises);
      const validProducts = products.filter((product) => product !== null);

      // Check if all products are from the same store
      const stores = [...new Set(validProducts.map((p) => p.store?.id))];
      if (stores.length > 1) {
        alert(
          "Your cart contains items from different stores. Please complete orders separately.",
        );
        navigate("/cart");
        return;
      }

      if (stores.length === 0 || !validProducts[0]?.store) {
        alert("Unable to process cart. Please try again.");
        navigate("/cart");
        return;
      }

      setCartItems(validProducts);
    } catch (err) {
      console.error("Failed to load cart:", err);
      navigate("/cart");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const getSubtotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0,
    );
  };

  const getShipping = () => {
    return getSubtotal() > 500 ? 0 : 50; // Free shipping over ৳500
  };

  const getTax = () => {
    return getSubtotal() * 0.15; // 15% tax
  };

  const getTotal = () => {
    return getSubtotal() + getShipping() + getTax();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate form
    const requiredFields = [
      "firstName",
      "lastName",
      "email",
      "phone",
      "address",
      "city",
      "postalCode",
    ];
    const missingFields = requiredFields.filter(
      (field) => !formData[field].trim(),
    );

    if (missingFields.length > 0) {
      alert(`Please fill in all required fields: ${missingFields.join(", ")}`);
      return;
    }

    // Validate card details if paying by card
    if (formData.paymentMethod === "card") {
      if (!formData.cardNumber || !formData.cardHolderName || !formData.expiryDate || !formData.cvv) {
        alert("Please fill in all card details");
        return;
      }
      if (!/^\d{16}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
        alert("Card number must be 16 digits");
        return;
      }
      if (!/^\d{3}$/.test(formData.cvv)) {
        alert("CVV must be 3 digits");
        return;
      }
      if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(formData.expiryDate)) {
        alert("Expiry date must be in MM/YY format");
        return;
      }
    }

    setProcessing(true);

    try {
      let paymentResult = null;

      // Process payment if card payment
      if (formData.paymentMethod === "card") {
        try {
          const paymentResponse = await paymentAPI.processPayment({
            amount: getTotal(),
            cardNumber: formData.cardNumber.replace(/\s/g, ''),
            cardHolderName: formData.cardHolderName,
            expiryDate: formData.expiryDate,
            cvv: formData.cvv,
          });

          if (!paymentResponse.data.success) {
            alert(`Payment failed: ${paymentResponse.data.message}`);
            setProcessing(false);
            return;
          }

          paymentResult = paymentResponse.data;
        } catch (error) {
          console.error("Payment failed:", error);
          alert("Payment processing failed. Please check your card details.");
          setProcessing(false);
          return;
        }
      }

      // Prepare order data
      const orderData = {
        storeId: cartItems[0].store.id,
        customerInfo: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          address: formData.address,
          city: formData.city,
          postalCode: formData.postalCode,
        },
        items: cartItems.map((item) => ({
          productId: item.id,
          name: item.name,
          price: parseFloat(item.price),
          quantity: item.quantity,
          image: item.images && item.images.length > 0 ? item.images[0] : undefined,
        })),
        subtotal: parseFloat(getSubtotal().toFixed(2)),
        shipping: parseFloat(getShipping().toFixed(2)),
        tax: parseFloat(getTax().toFixed(2)),
        total: parseFloat(getTotal().toFixed(2)),
        paymentMethod: formData.paymentMethod,
        notes: formData.paymentMethod === "card" && paymentResult 
          ? `Payment processed. Transaction ID: ${paymentResult.transactionId}` 
          : undefined,
      };

      // Create order via API
      await ordersAPI.create(orderData);

      // Clear cart
      localStorage.removeItem("cart");
      window.dispatchEvent(new Event("cartUpdated"));

      // Redirect to success page
      navigate("/checkout/success");
    } catch (error) {
      console.error("Checkout failed:", error);
      alert("Checkout failed. Please try again.");
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <ShopNavbar />
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-12 w-12 animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 text-lg">Loading checkout...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <ShopNavbar />

      <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">
        <div className="mb-8">
          <Link
            to="/cart"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-slate-900 mb-4"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Cart
          </Link>
          <h1 className="text-3xl font-bold text-slate-900">Checkout</h1>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-8 lg:grid-cols-2">
          {/* Customer Information */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </h2>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Phone Number *
                </label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Shipping Address */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Street Address *
                  </label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                    placeholder="123 Main Street"
                    required
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      name="postalCode"
                      value={formData.postalCode}
                      onChange={handleInputChange}
                      className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="rounded-2xl bg-white p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment Method
              </h2>

              <div className="space-y-4">
                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="card"
                    checked={formData.paymentMethod === "card"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700">
                    Credit/Debit Card
                  </span>
                </label>

                {formData.paymentMethod === "card" && (
                  <div className="ml-7 space-y-4 p-4 bg-slate-50 rounded-lg">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Card Number *
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={handleInputChange}
                        placeholder="1234 5678 9012 3456"
                        maxLength="19"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                      <p className="text-xs text-slate-500 mt-1">
                        Test: Use any 16 digits except starting with 0000
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">
                        Card Holder Name *
                      </label>
                      <input
                        type="text"
                        name="cardHolderName"
                        value={formData.cardHolderName}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                      />
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          Expiry Date *
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          maxLength="5"
                          className="w-full rounded-lg border border-slate-300 px-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">
                          CVV *
                        </label>
                        <div className="relative">
                          <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            name="cvv"
                            value={formData.cvv}
                            onChange={handleInputChange}
                            placeholder="123"
                            maxLength="3"
                            className="w-full rounded-lg border border-slate-300 pl-10 pr-3 py-2 text-slate-900 focus:border-blue-500 focus:outline-none"
                          />
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          Test: Use any 3 digits except 000
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <label className="flex items-center p-3 border-2 rounded-lg cursor-pointer hover:bg-slate-50 transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="cod"
                    checked={formData.paymentMethod === "cod"}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-3 text-sm font-medium text-slate-700">
                    Cash on Delivery
                  </span>
                </label>
                {formData.paymentMethod === "cod" && (
                  <p className="text-xs text-slate-500 ml-7">
                    Pay when your order is delivered to your door
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            <div className="rounded-2xl bg-white p-6 border border-slate-200">
              <h2 className="text-xl font-bold text-slate-900 mb-4">
                Order Summary
              </h2>

              <div className="space-y-3 mb-6">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-slate-100">
                      {item.images && item.images.length > 0 ? (
                        <img
                          src={item.images[0]}
                          alt={item.name}
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <div className="h-full w-full flex items-center justify-center text-slate-400 text-xs">
                          No Image
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-sm text-slate-600">
                        Qty: {item.quantity} × ৳{item.price}
                      </p>
                    </div>
                    <p className="text-sm font-semibold text-slate-900">
                      ৳{(item.price * item.quantity).toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>

              <div className="border-t border-slate-200 pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Subtotal</span>
                  <span className="text-slate-900 font-semibold">৳{getSubtotal().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Shipping</span>
                  <span className="text-slate-900 font-semibold">
                    {getShipping() === 0 ? "Free" : `৳${getShipping()}`}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-slate-600">Tax (15%)</span>
                  <span className="text-slate-900 font-semibold">৳{getTax().toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-lg font-bold border-t border-slate-200 pt-2 text-slate-900">
                  <span>Total</span>
                  <span>৳{getTotal().toFixed(2)}</span>
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={processing}
              className="w-full rounded-2xl bg-blue-600 px-6 py-4 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {processing ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Processing Order...
                </>
              ) : (
                <>
                  <Truck className="h-5 w-5" />
                  Place Order
                </>
              )}
            </button>

            <p className="text-xs text-slate-500 text-center">
              By placing your order, you agree to our terms of service and
              privacy policy.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Checkout;
