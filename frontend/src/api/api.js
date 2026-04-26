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

// Demo social import API calls
export const importAPI = {
  importSocialStore: (url) => api.post("/api/import/social-store", { url }),
  importSocialProduct: (url) => api.post("/api/import/social-product", { url }),
};

// Orders API calls
export const ordersAPI = {
  create: (orderData) => api.post("/stores/orders", orderData),
  getAll: () => api.get("/stores/orders"),
  getOne: (id) => api.get(`/stores/orders/${id}`),
  getByStore: (storeId) => api.get(`/stores/${storeId}/orders`),
  getMyOrders: (storeId) => api.get(`/stores/${storeId}/orders`),
  updateStatus: (id, statusOrPayload) => {
    const payload =
      typeof statusOrPayload === "string"
        ? { status: statusOrPayload }
        : statusOrPayload;
    return api.patch(`/stores/orders/${id}/status`, payload);
  },

  // Sales Analytics
  getDailySales: (storeId, date) =>
    api.get(`/stores/${storeId}/orders/stats/daily?date=${date}`),
  getBestSellers: (storeId) =>
    api.get(`/stores/${storeId}/orders/stats/best-sellers`),
  getReturnRate: (storeId) =>
    api.get(`/stores/${storeId}/orders/stats/return-rate`),
  getStoreStats: (storeId) =>
    api.get(`/stores/${storeId}/orders/stats/store`),
  getOrdersByLocation: (storeId) =>
    api.get(`/stores/${storeId}/orders/stats/location`),
};

// Coupons API
export const couponsAPI = {
  getAll: () => api.get("/coupons"),
  getByStore: (storeId) => api.get(`/coupons/store/${storeId}`),
  create: (data) => api.post("/coupons", data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  getByBuyer: (buyerId) => api.get(`/notifications/buyer/${buyerId}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Reviews API calls
export const reviewsAPI = {
  create: (reviewData) => api.post("/reviews", reviewData),
  getByProduct: (productId) => api.get(`/reviews/product/${productId}`),
  getAverageRating: (productId) =>
    api.get(`/reviews/product/${productId}/rating`),
  getReviewStatus: (productId) =>
    api.get(`/reviews/user/product/${productId}/status`),
  getUserReview: (productId) => api.get(`/reviews/user/product/${productId}`),
  update: (id, reviewData) => api.patch(`/reviews/${id}`, reviewData),
  delete: (id) => api.delete(`/reviews/${id}`),
};

export default api;
