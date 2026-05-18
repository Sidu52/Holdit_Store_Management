import { apiClient } from "./authApi";

export const bookingApi = {
  getIncomingBookings: async () => {
    const res = await apiClient.get("/store/bookings/incoming");
    return res.data;
  },
  
  getActiveBookings: async () => {
    const res = await apiClient.get("/store/bookings/active");
    return res.data;
  },
  
  getBookingHistory: async (page = 1, limit = 10) => {
    const res = await apiClient.get(`/store/bookings/history?page=${page}&limit=${limit}`);
    return res.data;
  },
  
  getBookingDetail: async (bookingId: string) => {
    const res = await apiClient.get(`/store/bookings/${bookingId}`);
    return res.data;
  },
  
  confirmStored: async (bookingId: string, otp: string) => {
    const res = await apiClient.post(`/store/bookings/${bookingId}/confirm-stored`, { otp });
    return res.data;
  },
  
  verifyReturnOtp: async (bookingId: string, otp: string) => {
    const res = await apiClient.post(`/store/bookings/${bookingId}/verify-return-otp`, { otp });
    return res.data;
  },
  
  getDashboardStats: async () => {
    const res = await apiClient.get("/store/dashboard");
    return res.data;
  },
  
  getOwnerDashboardStats: async () => {
    const res = await apiClient.get("/store-owner/dashboard");
    return res.data;
  },

  getStores: async () => {
    const res = await apiClient.get("/store-owner/stores");
    return res.data;
  },

  createStore: async (data: any) => {
    const res = await apiClient.post("/store-owner/stores", data);
    return res.data;
  },

  updateStore: async (id: string, data: any) => {
    const res = await apiClient.put(`/store-owner/stores/${id}`, data);
    return res.data;
  },

  deleteStore: async (id: string) => {
    const res = await apiClient.delete(`/store-owner/stores/${id}`);
    return res.data;
  },

  toggleStoreOnline: async (storeId: string, isOnline: boolean) => {
    const res = await apiClient.put(`/store-owner/stores/${storeId}/go-online`, { is_online: isOnline });
    return res.data;
  }
};
