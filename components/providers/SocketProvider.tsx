"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useSWRConfig } from "swr";
import { socket, connectSocket, disconnectSocket } from "../../lib/socket";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";
import type {
  IncomingBookingPayload,
  StoreAssignedPayload,
  ArrivedAtStorePayload,
  BookingStoredPayload,
  ReturnRequestedPayload,
  BookingDeliveredPayload,
  BookingCancelledPayload,
  StoreCapacityWarningPayload,
  SupportNewMessagePayload,
  SupportStatusUpdatedPayload,
  SupportTicketEscalatedPayload,
} from "../../types/socket";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();
  const { mutate } = useSWRConfig();

  useEffect(() => {
    if (user) {
      connectSocket();
      
      const onConnect = () => {
        setIsConnected(true);
        console.log("[Socket] Connected to server");
      };

      const onDisconnect = () => {
        setIsConnected(false);
        console.log("[Socket] Disconnected from server");
      };

      socket.on("connect", onConnect);
      socket.on("disconnect", onDisconnect);

      // Helper to revalidate booking endpoints across the dashboard
      const revalidateBookings = () => {
        mutate("/store/bookings/incoming");
        mutate("/store/bookings/active");
        mutate("/store/dashboard");
        mutate("/store-owner/dashboard");
      };

      // ─── Operational Booking Event Listeners ─────────────────────
      const handleIncomingBooking = (data: IncomingBookingPayload) => {
        toast.info(`New Incoming Booking: #${data.bookingId?.slice(-6) || data.bookingId}`);
        revalidateBookings();
      };

      const handleStoreAssigned = (data: StoreAssignedPayload) => {
        toast.info(`Booking assigned to your store: #${data.bookingId?.slice(-6) || data.bookingId}`);
        revalidateBookings();
      };

      const handleArrivedAtStore = (data: ArrivedAtStorePayload) => {
        toast.success(`Driver arrived at store for booking #${data.bookingId?.slice(-6) || data.bookingId}`);
        revalidateBookings();
      };

      const handleBookingStored = (data: BookingStoredPayload) => {
        toast.success(`Luggage securely stored for booking #${data.bookingId?.slice(-6) || data.bookingId}`);
        revalidateBookings();
      };

      const handleReturnRequested = (data: ReturnRequestedPayload) => {
        toast.warning(`Return Requested for booking #${data.bookingId?.slice(-6) || data.bookingId}`);
        revalidateBookings();
      };

      const handleBookingDelivered = (data: BookingDeliveredPayload) => {
        toast.success(`Booking #${data.bookingId?.slice(-6) || data.bookingId} delivered to customer`);
        revalidateBookings();
      };

      const handleBookingCancelled = (data: BookingCancelledPayload) => {
        toast.error(`Booking #${data.bookingId?.slice(-6) || data.bookingId} was cancelled: ${data.reason || ""}`);
        revalidateBookings();
      };

      const handleCapacityWarning = (data: StoreCapacityWarningPayload) => {
        toast.warning(`Vault Capacity Warning: ${data.message || "Capacity threshold reached"}`);
      };

      // ─── Support & Live Chat Event Listeners ──────────────────────
      const handleSupportNewMessage = (data: SupportNewMessagePayload) => {
        if (typeof window !== "undefined" && !window.location.pathname.includes("/dashboard/support")) {
          toast.info(`New support message on ticket #${data.ticketId?.slice(-6) || ""}`);
        }
      };

      const handleSupportStatusUpdated = (data: SupportStatusUpdatedPayload) => {
        toast.info(`Support ticket #${data.ticketId?.slice(-6) || ""} status updated to ${data.status?.replace(/_/g, " ")}`);
      };

      const handleSupportTicketEscalated = (data: SupportTicketEscalatedPayload) => {
        toast.success(`Ticket #${data.ticketId?.slice(-6) || ""} escalated! Connected to Live Support Agent.`);
      };

      // Attach socket event listeners
      socket.on("store:booking:incoming", handleIncomingBooking);
      socket.on("booking:store_assigned", handleStoreAssigned);
      socket.on("booking:arrived_at_store", handleArrivedAtStore);
      socket.on("booking:stored", handleBookingStored);
      socket.on("booking:return_requested", handleReturnRequested);
      socket.on("booking:delivered", handleBookingDelivered);
      socket.on("booking:cancelled", handleBookingCancelled);
      socket.on("store:capacity:warning", handleCapacityWarning);

      socket.on("support:new_message", handleSupportNewMessage);
      socket.on("support:status_updated", handleSupportStatusUpdated);
      socket.on("support:ticket_escalated", handleSupportTicketEscalated);

      return () => {
        socket.off("connect", onConnect);
        socket.off("disconnect", onDisconnect);
        socket.off("store:booking:incoming", handleIncomingBooking);
        socket.off("booking:store_assigned", handleStoreAssigned);
        socket.off("booking:arrived_at_store", handleArrivedAtStore);
        socket.off("booking:stored", handleBookingStored);
        socket.off("booking:return_requested", handleReturnRequested);
        socket.off("booking:delivered", handleBookingDelivered);
        socket.off("booking:cancelled", handleBookingCancelled);
        socket.off("store:capacity:warning", handleCapacityWarning);
        socket.off("support:new_message", handleSupportNewMessage);
        socket.off("support:status_updated", handleSupportStatusUpdated);
        socket.off("support:ticket_escalated", handleSupportTicketEscalated);
        disconnectSocket();
      };
    }
  }, [user, toast, mutate]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
