import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

import Homepage from "./pages/Homepage";
import Login from "./pages/Login";
import CustomerLogin from "./pages/CustomerLogin";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyStores from "./pages/MyStores";
import MyProducts from "./pages/MyProducts";
import Stores from "./pages/Stores";
import StoreDetail from "./pages/StoreDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import StoreWishlist from "./pages/StoreWishlist";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Sell from "./pages/Sell";
import ImportProduct from "./pages/ImportProduct";
import BulkImport from "./pages/BulkImport";
import MyOrders from "./pages/MyOrders";
import Coupons from "./pages/Coupons";
import Notifications from "./pages/Notifications";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>

          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/shop-login" element={<CustomerLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sell" element={<Sell />} />

          <Route path="/stores" element={<Stores />} />
          <Route path="/store/:slug" element={<StoreDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/cart" element={<Cart />} />
          <Route path="/shop-wishlist" element={<StoreWishlist />} />

          <Route path="/products" element={<Navigate to="/stores" replace />} />

          <Route
            path="/wishlist"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Wishlist />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout"
            element={
              <ProtectedRoute loginPath="/shop-login">
                <Checkout />
              </ProtectedRoute>
            }
          />

          <Route
            path="/checkout/success"
            element={
              <ProtectedRoute loginPath="/shop-login">
                <CheckoutSuccess />
              </ProtectedRoute>
            }
          />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Dashboard />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-stores"
            element={
              <ProtectedRoute requireVendor={true}>
                <div>
                  <Navbar />
                  <MyStores />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-products"
            element={
              <ProtectedRoute requireVendor={true}>
                <div>
                  <Navbar />
                  <MyProducts />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/coupons"
            element={
              <ProtectedRoute requireVendor={true}>
                <div>
                  <Navbar />
                  <Coupons />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/import-product"
            element={
              <ProtectedRoute requireVendor={true}>
                <div>
                  <Navbar />
                  <ImportProduct />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/bulk-import"
            element={
              <ProtectedRoute requireVendor={true}>
                <div>
                  <Navbar />
                  <BulkImport />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/my-orders"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <MyOrders />
                </div>
              </ProtectedRoute>
            }
          />

          <Route
            path="/notifications"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Notifications />
                </div>
              </ProtectedRoute>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />

        </Routes>
      </Router>
    </AuthProvider>
  );
}


export default App;
