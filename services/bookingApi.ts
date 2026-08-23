import { apiClient } from "./authApi";

export const bookingApi = {
  
  // GET INCOMING BOOKINGs
  getIncomingBookings: async () => {
    const res = await apiClient.get("/store/bookings/incoming");
    return res.data;
  },
  
  // GET ACTIVE BOOKING
  getActiveBookings: async () => {
    const res = await apiClient.get("/store/bookings/active");
    return res.data;
  },

  // GET RETURN BOOKING
  getReturnBookings: async (page = 1, limit = 10) => {
    const res = await apiClient.get(`/store/bookings/return_parcels?page=${page}&limit=${limit}`);
    return res.data;
  },
  
  // GET BOOKING HISTORY
  getBookingHistory: async (page = 1, limit = 10, params?: Record<string, any>) => {
    const query = new URLSearchParams({
      page: String(page),
      limit: String(limit),
      only_stored_cancelled: "true",
      ...(params || {})
    }).toString();
    const res = await apiClient.get(`/store/bookings/history?${query}`);
    return res.data;
  },
  
  // GET BOOKING BY ID
  getBookingDetail: async (bookingId: string) => {
    const res = await apiClient.get(`/store/bookings/${bookingId}`);
    return res.data;
  },

  // GET STORE OWNER ALL BOOKINGS
  getOwnerBookings: async (params?: Record<string, any>) => {
    try {
      const res = await apiClient.get("/store-owner/bookings", { 
        params: { 
          only_stored_cancelled: true,
          ...params 
        } 
      });
      return res.data;
    } catch {
      // Fallback
      const res = await apiClient.get("/store/bookings/history?only_stored_cancelled=true");
      return res.data;
    }
  },

  // GET STORE OWNER BOOKING DETAIL BY ID
  getOwnerBookingDetail: async (bookingId: string) => {
    try {
      const res = await apiClient.get(`/store-owner/bookings/${bookingId}`);
      return res.data;
    } catch {
      const res = await apiClient.get(`/store/bookings/${bookingId}`);
      return res.data;
    }
  },

  // STORE EARNING SETTLEMENT DATA
  getBookingSettlement: async (bookingId: string) => {
    const res = await apiClient.get(`/store/bookings/${bookingId}/settlement`);
    return res.data;
  },
  
  // GET BOOKING RECEIVED (1-click direct confirmation)
  confirmStored: async (bookingId: string, notes?: string) => {
    const res = await apiClient.post(`/store/bookings/${bookingId}/confirm-stored`, { notes });
    return res.data;
  },
  
  // VERIFY RETURN BOOKING OTP
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
