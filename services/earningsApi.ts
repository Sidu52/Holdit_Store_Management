import { apiClient } from "./authApi";

export interface SettlementData {
  documentType: string;
  settlementId: string;
  bookingCode: string;
  bookingId: string;
  store: {
    id: string;
    name: string;
    gstin?: string;
  };
  storagePeriod: {
    startedAt: string | null;
    releasedAt: string | null;
    expectedDurationHours: number;
    billableHours: number;
  };
  rates: {
    storeStorageHourlyRateMinor: number;
    storeStorageHourlyRate: number;
  };
  financials: {
    grossStoreAmount: number;
    grossEarningMinor: number;
    commissionDeduction: number;
    commissionAmountMinor: number;
    taxDeduction: number;
    taxDeductionMinor: number;
    netStorePayout: number;
    netEarningMinor: number;
  };
  payoutStatus: "PENDING" | "ELIGIBLE" | "PAYABLE" | "PAID";
  earningStatus: "PENDING" | "ELIGIBLE" | "PAYABLE" | "PAID";
  statementClassification: "IN_PROGRESS" | "PROVISIONAL" | "SETTLED";
  isDownloadable: boolean;
  settlementDate: string;
  payoutReference: string | null;
  payout?: {
    payoutId: string;
    providerTransferId: string;
    completedAt: string;
  } | null;
}

export interface MonthlyEarningSummary {
  monthKey: string;
  monthLabel: string;
  grossEarning: number;
  netEarning: number;
  bookingsCount: number;
  status: "UPCOMING" | "IN_PROGRESS" | "SETTLED" | string;
}

export interface PeriodicSettlement {
  periodId: string;
  periodLabel: string;
  totalGross?: number;
  totalCommission?: number;
  totalNetPayout: number;
  totalNetPayoutMinor?: number;
  earningsCount: number;
  status: "UPCOMING" | "IN_PROGRESS" | "SETTLED" | "FAILED" | string;
  cycleStart?: string;
  cycleEnd?: string;
  transferRef?: string | null;
  settledAt?: string | null;
  earnings: Array<{
    earningId: string;
    bookingId?: string;
    bookingCode: string;
    startedAt: string | null;
    releasedAt: string | null;
    grossEarning: number;
    netEarning: number;
    netEarningMinor?: number;
    status: string;
    paidAt?: string;
  }>;
}

export const earningsApi = {
  // GET PER-ORDER STORE EARNING STATEMENT
  getBookingSettlement: async (bookingId: string) => {
    try {
      const res = await apiClient.get(`/store/bookings/${bookingId}/settlement`);
      return res.data;
    } catch {
      // Fallback endpoint for store owner
      const res = await apiClient.get(`/store-owner/bookings/${bookingId}/settlement`);
      return res.data;
    }
  },

  // OPEN/DOWNLOAD STORE EARNING STATEMENT PRINTABLE DOCUMENT
  downloadEarningStatementPdf: async (bookingId: string) => {
    try {
      let htmlContent = "";
      try {
        const response = await apiClient.get(`/store/bookings/${bookingId}/settlement/pdf`, {
          responseType: "text",
        });
        htmlContent = response.data;
      } catch {
        // Fallback endpoint for store owner
        const response = await apiClient.get(`/store-owner/bookings/${bookingId}/settlement/pdf`, {
          responseType: "text",
        });
        htmlContent = response.data;
      }

      if (htmlContent) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          return true;
        } else {
          const blob = new Blob([htmlContent], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.download = `statement_${bookingId}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  // GET PERIODIC SETTLEMENT STATEMENTS (WEEKLY/MONTHLY ROLLUPS)
  getPeriodicSettlements: async () => {
    try {
      const res = await apiClient.get("/store-owner/settlements");
      if (res.data?.data?.settlements || res.data?.settlements) {
        return res.data;
      }
      const fallback = await apiClient.get("/store/bookings/settlements/periodic");
      return fallback.data;
    } catch {
      const res = await apiClient.get("/store/bookings/settlements/periodic");
      return res.data;
    }
  },

  // DOWNLOAD CONSOLIDATED PERIODIC PAYOUT STATEMENT PRINTABLE DOCUMENT
  downloadPeriodicSettlementPdf: async (periodId: string) => {
    try {
      let htmlContent = "";
      try {
        const response = await apiClient.get(`/store/bookings/settlements/periodic/${periodId}/pdf`, {
          responseType: "text",
        });
        htmlContent = response.data;
      } catch {
        // Fallback for store owner
        const response = await apiClient.get(`/store-owner/settlements/${periodId}/statement`, {
          responseType: "text",
        });
        htmlContent = response.data;
      }

      if (htmlContent) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(htmlContent);
          printWindow.document.close();
          return true;
        } else {
          const blob = new Blob([htmlContent], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.download = `periodic_settlement_${periodId}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },

  // GET STORE COMPLETED BOOKING EARNINGS
  getStoreEarnings: async (storeId?: string) => {
    const endpoint = storeId ? `/store/${storeId}/earnings` : "/store/bookings/earnings";
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  // GET STORE OWNER MULTI-STORE CONSOLIDATED SETTLEMENT
  getStoreOwnerSettlement: async (ownerId?: string) => {
    const endpoint = ownerId ? `/store-owner/${ownerId}/settlements` : "/store-owner/settlements";
    const res = await apiClient.get(endpoint);
    return res.data;
  },

  // DOWNLOAD STORE OWNER MULTI-STORE SETTLEMENT STATEMENT PDF/HTML
  downloadStoreOwnerSettlementPdf: async (cycleId: string = "current") => {
    try {
      const response = await apiClient.get(`/store-owner/settlements/${cycleId}/statement`, {
        responseType: "text",
      });
      if (response.data) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.open();
          printWindow.document.write(response.data);
          printWindow.document.close();
          return true;
        } else {
          const blob = new Blob([response.data], { type: "text/html" });
          const url = URL.createObjectURL(blob);
          const link = document.createElement("a");
          link.href = url;
          link.target = "_blank";
          link.download = `store_owner_statement_${cycleId}.html`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          setTimeout(() => URL.revokeObjectURL(url), 1000);
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },
};
