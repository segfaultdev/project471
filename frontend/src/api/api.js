import axios from "axios";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: "http://localhost:3000", // Your NestJS backend URL
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor - Attach JWT token to every request
api.interceptors.request.use(
  (config) => {
    // Get token from localStorage
    const token = localStorage.getItem("token");

    // If token exists, add to Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// Response interceptor - Handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // If 401 Unauthorized, clear token and redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

// Auth API calls
export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

// Users API calls
export const usersAPI = {
  getAll: () => api.get("/users"),
  getOne: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.patch(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

// Stores API calls
export const storesAPI = {
  getAll: () => api.get("/stores"),
  getOne: (id) => api.get(`/stores/${id}`),
  getBySlug: (slug) => api.get(`/stores/slug/${slug}`),
  getMyStores: () => api.get("/stores/my-stores"),
  getByOwner: (ownerId) => api.get(`/stores/owner/${ownerId}`),
  create: (storeData) => api.post("/stores", storeData),
  update: (id, storeData) => api.patch(`/stores/${id}`, storeData),
  delete: (id) => api.delete(`/stores/${id}`),
};

// Products API calls
export const productsAPI = {
  getAll: () => api.get("/products"),
  getOne: (id) => api.get(`/products/${id}`),
  getByStore: (storeId) => api.get(`/products/store/${storeId}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  getMyProducts: () => api.get("/products/my-products"),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.patch(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

// Orders API calls
export const ordersAPI = {
  create: (orderData) => api.post("/orders", orderData),
  getAll: () => api.get("/orders"),
  getByStore: (storeId) => api.get(`/orders/store/${storeId}`),
  getMyOrders: () => api.get("/orders/my-orders"),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, status) => api.patch(`/orders/${id}/status`, { status }),
};

// Cart API calls
export const cartAPI = {
  addToCart: (productId, quantity) => api.post("/cart", { productId, quantity }),
  getCart: () => api.get("/cart"),
  getCartTotal: () => api.get("/cart/total"),
  updateCartItem: (itemId, quantity) => api.patch(`/cart/${itemId}`, { quantity }),
  removeFromCart: (itemId) => api.delete(`/cart/${itemId}`),
  clearCart: () => api.delete("/cart"),
};

// Categories API calls
export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getTopLevel: () => api.get("/categories/top-level"),
  getOne: (id) => api.get(`/categories/${id}`),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  create: (categoryData) => api.post("/categories", categoryData),
  update: (id, categoryData) => api.patch(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

// Payment API calls
export const paymentAPI = {
  processPayment: (paymentData) => api.post("/payment/process", paymentData),
  verifyPayment: (transactionId) => api.get(`/payment/verify/${transactionId}`),
  refundPayment: (transactionId, amount) => api.post(`/payment/refund/${transactionId}`, { amount }),
};

export default api;
