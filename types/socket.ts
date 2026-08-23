import type { TicketMessage, TicketStatus, ChatType } from "./support";

// ----------------------------------------------------------------------
// 1. Client ➔ Server Socket Events (Events emitted by Store / StoreOwner)
// ----------------------------------------------------------------------

export interface AcknowledgeBookingPayload {
  bookingId: string;
}

export interface JoinSupportRoomPayload {
  ticketId: string;
}

export interface LeaveSupportRoomPayload {
  ticketId: string;
}

export interface SupportTypingPayload {
  ticketId: string;
  isTyping: boolean;
}

// ----------------------------------------------------------------------
// 2. Server ➔ Client Socket Events (Events Store / StoreOwner listens to)
// ----------------------------------------------------------------------

// A. Operational Booking Events
export interface IncomingBookingPayload {
  bookingId: string;
  summary?: {
    bookingCode?: string;
    guestName?: string;
    luggageCount?: number;
  };
}

export interface StoreAssignedPayload {
  bookingId: string;
  store?: {
    _id: string;
    name: string;
  };
}

export interface ArrivedAtStorePayload {
  bookingId: string;
  driverId?: string;
  arrivedAt?: string;
  otpSent?: boolean;
}

export interface BookingStoredPayload {
  bookingId: string;
  storedAt?: string;
  store?: {
    _id: string;
    name: string;
  };
}

export interface ReturnRequestedPayload {
  bookingId: string;
  userId?: string;
  returnLocation?: {
    address?: string;
    latitude?: number;
    longitude?: number;
  };
  returnScheduledAt?: string;
}

export interface BookingDeliveredPayload {
  bookingId: string;
  deliveredAt?: string;
  driver?: {
    _id: string;
    name?: string;
  };
}

export interface BookingCancelledPayload {
  bookingId: string;
  cancelledBy?: string;
  reason?: string;
  cancelledAt?: string;
}

export interface StoreCapacityWarningPayload {
  message: string;
}

// B. Support & Live Chat Events
export interface SupportNewMessagePayload {
  ticketId: string;
  message: TicketMessage;
  status?: TicketStatus;
}

export interface SupportTypingReceivePayload {
  ticketId: string;
  isTyping: boolean;
  role?: string;
}

export interface SupportStatusUpdatedPayload {
  ticketId: string;
  status: TicketStatus;
  chatType?: ChatType;
}

export interface SupportTicketEscalatedPayload {
  ticketId: string;
  chatType?: ChatType;
  isEscalatedToLive?: boolean;
}
