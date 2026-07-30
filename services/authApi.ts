import axios from "axios";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Needed for safe httpOnly cookies
});

// Response interceptor to handle token refresh on 401 responses
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (error: any = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Check if error is 401 and request hasn't been retried yet
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/refresh")
    ) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then(() => apiClient(originalRequest))
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Call backend POST /refresh to issue new tokens (cookies stored automatically)
        await apiClient.post("/refresh");
        processQueue(null);
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export const authApi = {
  // --- STORE MANAGER ---
  storeLogin: async (phone: string) => {
    const res = await apiClient.post("/store/auth/login", { phone });
    return res.data;
  },
  storeRegister: async (phone: string) => {
    const res = await apiClient.post("/store/auth/register", { phone });
    return res.data;
  },
  storeVerifyOTP: async (phone: string, otp: string) => {
    const res = await apiClient.post("/store/auth/verify", { phone, otp });
    return res.data;
  },
  storeResendOTP: async (phone: string) => {
    const res = await apiClient.post("/store/auth/resend", { phone });
    return res.data;
  },

  // --- STORE OWNER ---
  ownerLogin: async (phone: string) => {
    const res = await apiClient.post("/store-owner/auth/login", { phone });
    return res.data;
  },
  ownerRegister: async (phone: string) => {
    const res = await apiClient.post("/store-owner/auth/register", { phone });
    return res.data;
  },
  ownerVerifyOTP: async (phone: string, otp: string) => {
    const res = await apiClient.post("/store-owner/auth/verify", { phone, otp });
    return res.data;
  },
  ownerResendOTP: async (phone: string) => {
    const res = await apiClient.post("/store-owner/auth/resend", { phone });
    return res.data;
  },

  // --- COMMON GET ME (To test auth status) ---
  getMe: async () => {
    const res = await apiClient.get("/me");
    return res.data;
  }
};

