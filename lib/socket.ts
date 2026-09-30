import { io, Socket } from "socket.io-client";
import type {
  AcknowledgeBookingPayload,
  JoinSupportRoomPayload,
  LeaveSupportRoomPayload,
  SupportTypingPayload,
} from "../types/socket";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000";

export const socket: Socket = io(SOCKET_URL, {
  autoConnect: false,
  withCredentials: true,
  transports: ["websocket"],
  auth: (cb) => {
    // Read accessToken from cookies for server-side auth
    const cookiesList = typeof document !== "undefined" ? document.cookie.split("; ") : [];
    const storeToken = cookiesList.find((c) => c.startsWith("store_accessToken="))?.split("=")[1];
    const defaultToken = cookiesList.find((c) => c.startsWith("accessToken="))?.split("=")[1];
    const token = storeToken || defaultToken || "";
    cb({ token: token ? `Bearer ${token}` : "" });
  },
});

export const connectSocket = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

export const disconnectSocket = () => {
  if (socket.connected) {
    socket.disconnect();
  }
};

// ─── Client ➔ Server Socket Emitter Helpers ──────────────────────────

/**
 * Acknowledges an incoming booking request.
 */
export const acknowledgeBooking = (bookingId: string) => {
  if (socket.connected) {
    const payload: AcknowledgeBookingPayload = { bookingId };
    socket.emit("store:booking:acknowledge", payload);
  }
};

/**
 * Joins a support chat room for live messages.
 */
export const joinSupportRoom = (ticketId: string) => {
  if (socket.connected) {
    const payload: JoinSupportRoomPayload = { ticketId };
    socket.emit("support:join_room", payload);
  }
};

/**
 * Leaves a support chat room.
 */
export const leaveSupportRoom = (ticketId: string) => {
  if (socket.connected) {
    const payload: LeaveSupportRoomPayload = { ticketId };
    socket.emit("support:leave_room", payload);
  }
};

/**
 * Sends typing status indicator to server.
 */
export const sendSupportTyping = (ticketId: string, isTyping: boolean) => {
  if (socket.connected) {
    const payload: SupportTypingPayload = { ticketId, isTyping };
    socket.emit("support:typing", payload);
  }
};

