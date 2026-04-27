import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login";
    }

    return Promise.reject(error);
  },
);

export const authAPI = {
  register: (userData) => api.post("/auth/register", userData),
  login: (credentials) => api.post("/auth/login", credentials),
  getProfile: () => api.get("/auth/profile"),
};

export const usersAPI = {
  getAll: () => api.get("/users"),
  getOne: (id) => api.get(`/users/${id}`),
  create: (userData) => api.post("/users", userData),
  update: (id, userData) => api.patch(`/users/${id}`, userData),
  delete: (id) => api.delete(`/users/${id}`),
};

export const storesAPI = {
  getAll: () => api.get("/stores"),
  getOne: (id) => api.get(`/stores/${id}`),
  getBySlug: (slug) => api.get(`/stores/slug/${slug}`),
  getMyStores: () => api.get("/stores/my-stores"),
  getMyFollowedStores: () => api.get("/stores/follows/my"),
  follow: (id) => api.post(`/stores/${id}/follow`),
  unfollow: (id) => api.delete(`/stores/${id}/follow`),
  getByOwner: (ownerId) => api.get(`/stores/owner/${ownerId}`),
  create: (storeData) => api.post("/stores", storeData),
  update: (id, storeData) => api.patch(`/stores/${id}`, storeData),
  delete: (id) => api.delete(`/stores/${id}`),
};

export const productsAPI = {
  getAll: () => api.get("/products"),
  getOne: (id) => api.get(`/products/${id}`),
  getByStore: (storeId) => api.get(`/products/store/${storeId}`),
  getByCategory: (category) => api.get(`/products/category/${category}`),
  getMyProducts: () => api.get("/products/my-products"),
  getSimilarProducts: (productId) => api.get(`/products/compare/${productId}`),
  create: (productData) => api.post("/products", productData),
  update: (id, productData) => api.patch(`/products/${id}`, productData),
  delete: (id) => api.delete(`/products/${id}`),
};

export const importAPI = {
  importSocialStore: (url) => api.post("/api/import/social-store", { url }),
  importSocialProduct: (url) => api.post("/api/import/social-product", { url }),
};

export const categoriesAPI = {
  getAll: () => api.get("/categories"),
  getOne: (id) => api.get(`/categories/${id}`),
  getByStore: (storeId) => api.get(`/categories/store/${storeId}`),
  getBySlug: (slug) => api.get(`/categories/slug/${slug}`),
  getMyCategories: () => api.get("/categories/my-categories"),
  create: (categoryData) => api.post("/categories", categoryData),
  update: (id, categoryData) => api.patch(`/categories/${id}`, categoryData),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const ordersAPI = {
  create: (orderData) => api.post("/stores/orders", orderData),
  getAll: () => api.get("/stores/orders"),
  getOne: (id) => api.get(`/stores/orders/${id}`),
  getByStore: (storeId) => api.get(`/stores/${storeId}/orders`),
  getMyOrders: (storeId) => api.get(`/stores/${storeId}/orders`),
  getMyCustomerOrders: () => api.get("/stores/orders/my-orders"),
  updateStatus: (id, statusOrPayload) => {
    const normalizedId = String(id || "").replace(/^\/?orders\//, "");
    const payload =
      typeof statusOrPayload === "string"
        ? { status: statusOrPayload }
        : statusOrPayload;
    return api.patch(`/stores/orders/${normalizedId}/status`, payload);
  },

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

export const couponsAPI = {
  getAll: () => api.get("/coupons"),
  getByStore: (storeId) => api.get(`/coupons/store/${storeId}`),
  getByStoreAndCode: (storeId, code) =>
    api.get(`/coupons/store/${storeId}/code/${encodeURIComponent(code)}`),
  create: (data) => api.post("/coupons", data),
  update: (id, data) => api.patch(`/coupons/${id}`, data),
  delete: (id) => api.delete(`/coupons/${id}`),
};

export const notificationsAPI = {
  getAll: () => api.get("/notifications"),
  getByBuyer: (buyerId) => api.get(`/notifications/buyer/${buyerId}`),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  delete: (id) => api.delete(`/notifications/${id}`),
};

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
