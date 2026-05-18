import axios from "axios";

const API_BASE_URL = "http://localhost:5000/api/v1";

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Needed for safe httpOnly cookies
});

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
