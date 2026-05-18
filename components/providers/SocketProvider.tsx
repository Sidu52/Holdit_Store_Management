"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { socket, connectSocket, disconnectSocket } from "../../lib/socket";
import { useAuth } from "../../hooks/useAuth";
import { useToast } from "../../hooks/useToast";

interface SocketContextType {
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: React.ReactNode }) => {
  const { user, role } = useAuth();
  const [isConnected, setIsConnected] = useState(false);
  const toast = useToast();

  useEffect(() => {
    if (user) {
      connectSocket();
      
      socket.on("connect", () => {
        setIsConnected(true);
        console.log("[Socket] Connected to server");
      });

      socket.on("disconnect", () => {
        setIsConnected(false);
        console.log("[Socket] Disconnected from server");
      });

      // Global Operational Listeners
      socket.on("store:booking:incoming", (data) => {
        toast.info(`New Incoming Booking: ${data.bookingId}`);
      });

      socket.on("booking:driver_arrived", (data) => {
        toast.success(`Driver has arrived at store for booking ${data.bookingId}`);
      });

      socket.on("booking:return_requested", (data) => {
        toast.warning(`Return Requested for booking ${data.bookingId}`);
      });

      return () => {
        socket.off("connect");
        socket.off("disconnect");
        socket.off("store:booking:incoming");
        socket.off("booking:driver_arrived");
        socket.off("booking:return_requested");
        disconnectSocket();
      };
    }
  }, [user, toast]);

  return (
    <SocketContext.Provider value={{ isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
