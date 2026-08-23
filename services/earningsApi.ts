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

export interface PeriodicSettlement {
  periodId: string;
  periodLabel: string;
  totalGross: number;
  totalCommission: number;
  totalNetPayout: number;
  totalNetPayoutMinor: number;
  earningsCount: number;
  status: string;
  earnings: Array<{
    earningId: string;
    bookingId: string;
    bookingCode: string;
    startedAt: string | null;
    releasedAt: string | null;
    grossEarning: number;
    netEarning: number;
    netEarningMinor: number;
    status: string;
    paidAt: string;
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
      const response = await apiClient.get(`/store/bookings/${bookingId}/settlement/pdf`, {
        responseType: "text",
      });
      if (response.data) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(response.data);
          printWindow.document.close();
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
    const res = await apiClient.get("/store/bookings/settlements/periodic");
    return res.data;
  },

  // DOWNLOAD CONSOLIDATED PERIODIC PAYOUT STATEMENT PRINTABLE DOCUMENT
  downloadPeriodicSettlementPdf: async (periodId: string) => {
    try {
      const response = await apiClient.get(`/store/bookings/settlements/periodic/${periodId}/pdf`, {
        responseType: "text",
      });
      if (response.data) {
        const printWindow = window.open("", "_blank");
        if (printWindow) {
          printWindow.document.write(response.data);
          printWindow.document.close();
          return true;
        }
      }
      return false;
    } catch {
      return false;
    }
  },
};
