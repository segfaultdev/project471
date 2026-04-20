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
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import MyStores from "./pages/MyStores";
import MyProducts from "./pages/MyProducts";
import Products from "./pages/Products";
import Stores from "./pages/Stores";
import StoreDetail from "./pages/StoreDetail";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import Wishlist from "./pages/Wishlist";
import Checkout from "./pages/Checkout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import Sell from "./pages/Sell";
import ImportProduct from "./pages/ImportProduct";
import BulkImport from "./pages/BulkImport";
import MyOrders from "./pages/MyOrders";
import CustomerOrders from "./pages/CustomerOrders";
import SalesAnalytics from './pages/SalesAnalytics';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Homepage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sell" element={<Sell />} />
          <Route path="/store/:slug" element={<StoreDetail />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/checkout/success" element={<CheckoutSuccess />} />

          {/* Protected Routes with Navbar */}
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
            path="/products"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Products />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/stores"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Stores />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/cart"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <Cart />
                </div>
              </ProtectedRoute>
            }
          />
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

          {/* Vendor-Only Routes */}
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
              <ProtectedRoute requireVendor={true}>
                <div>
                  <Navbar />
                  <MyOrders />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/customer-orders"
            element={
              <ProtectedRoute>
                <div>
                  <Navbar />
                  <CustomerOrders />
                </div>
              </ProtectedRoute>
            }
          />
          <Route
            path="/sales-analytics"
            element={
              <ProtectedRoute requireVendor={true}>
                <div>
                  <Navbar />
                  <SalesAnalytics />
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
