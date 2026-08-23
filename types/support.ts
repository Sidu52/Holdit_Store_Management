// ─── Enums ───────────────────────────────────────────────

export type ChatType = "TICKET" | "BOT_CHAT" | "LIVE_CHAT";

export type TicketStatus =
  | "open"
  | "in_progress"
  | "pending"
  | "awaiting_user"
  | "awaiting_admin"
  | "resolved"
  | "closed";

export type TicketCategory =
  | "store"
  | "booking"
  | "payment"
  | "account"
  | "technical"
  | "earnings"
  | "other";

export type TicketPriority = "low" | "medium" | "high" | "urgent";

// ─── Models ──────────────────────────────────────────────

export interface FAQ {
  keyword: string;
  topic: string;
  fullAnswer: string;
}

export interface TicketMessage {
  _id: string;
  senderId: string;
  senderModel: "Store" | "StoreOwner" | "Bot" | "Admin";
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface Ticket {
  _id?: string;
  ticketId: string;
  ticketCode: string;
  subject?: string;
  chatType: ChatType;
  isEscalatedToLive: boolean;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  messages: TicketMessage[];
  createdAt: string;
}

export interface TicketListItem {
  _id: string;
  ticketCode: string;
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  status: TicketStatus;
  chatType: ChatType;
  isEscalatedToLive: boolean;
  unreadCount: number;
  lastMessageAt: string;
  lastMessageBy: string;
  createdAt: string;
}

export interface Pagination {
  currentPage: number;
  totalPages: number;
  totalRecords: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

// ─── API Request Payloads ────────────────────────────────

export interface CreateTicketPayload {
  subject: string;
  category: TicketCategory;
  priority: TicketPriority;
  chatType: ChatType;
  message: string;
  bookingId?: string;
}

export interface SendMessagePayload {
  message: string;
}

// ─── API Response Shapes ─────────────────────────────────

export interface FAQsResponse {
  role: string;
  faqs: FAQ[];
}

export interface CreateTicketResponse {
  ticketId: string;
  ticketCode: string;
  chatType: ChatType;
  isEscalatedToLive: boolean;
  status: TicketStatus;
  priority: TicketPriority;
  category: TicketCategory;
  messages: TicketMessage[];
  createdAt: string;
}

export interface TicketsListResponse {
  tickets: TicketListItem[];
  pagination: Pagination;
}

export interface SendMessageResponse {
  ticketId: string;
  status: TicketStatus;
  chatType: ChatType;
  isEscalatedToLive: boolean;
  message: TicketMessage;
  totalMessages: number;
}

export interface EscalateResponse {
  ticketId: string;
  chatType: ChatType;
  isEscalatedToLive: boolean;
  status: TicketStatus;
}

// ─── Ticket Filter Params ────────────────────────────────

export interface TicketFilters {
  page?: number;
  limit?: number;
  status?: TicketStatus | "";
  chatType?: ChatType | "";
}
