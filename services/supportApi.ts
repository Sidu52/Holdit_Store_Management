import { apiClient } from "./authApi";
import type {
  CreateTicketPayload,
  SendMessagePayload,
  TicketFilters,
} from "../types/support";

/**
 * Returns the correct API base path depending on the user's role.
 * "store_owner" → /store-owner/support
 * everything else (store staff) → /store/support
 */
const getBasePath = (role: string): string => {
  return role === "store_owner"
    ? "/store-owner/support"
    : "/store/support";
};

export const supportApi = {
  // ── FAQs ────────────────────────────────────────────────
  getFaqs: async (role: string) => {
    const res = await apiClient.get(`${getBasePath(role)}/faqs`);
    return res.data;
  },

  // ── Create Ticket / Start Chat ──────────────────────────
  createTicket: async (role: string, payload: CreateTicketPayload) => {
    const res = await apiClient.post(`${getBasePath(role)}/ticket`, payload);
    return res.data;
  },

  // ── List Tickets ────────────────────────────────────────
  getTickets: async (role: string, filters: TicketFilters = {}) => {
    const params = new URLSearchParams();
    if (filters.page) params.append("page", String(filters.page));
    if (filters.limit) params.append("limit", String(filters.limit));
    if (filters.status) params.append("status", filters.status);
    if (filters.chatType) params.append("chatType", filters.chatType);

    const query = params.toString();
    const res = await apiClient.get(
      `${getBasePath(role)}/tickets${query ? `?${query}` : ""}`
    );
    return res.data;
  },

  // ── Ticket Detail & Thread ──────────────────────────────
  getTicketById: async (role: string, ticketId: string) => {
    const res = await apiClient.get(`${getBasePath(role)}/tickets/${ticketId}`);
    return res.data;
  },

  // ── Send Message / Reply ────────────────────────────────
  sendMessage: async (
    role: string,
    ticketId: string,
    payload: SendMessagePayload
  ) => {
    const res = await apiClient.post(
      `${getBasePath(role)}/tickets/${ticketId}/message`,
      payload
    );
    return res.data;
  },

  // ── Escalate to Live Agent ──────────────────────────────
  escalateTicket: async (role: string, ticketId: string) => {
    const res = await apiClient.post(
      `${getBasePath(role)}/tickets/${ticketId}/escalate`
    );
    return res.data;
  },
};
