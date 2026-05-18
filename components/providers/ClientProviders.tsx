"use client";

import { SocketProvider } from "./SocketProvider";
import { Toaster } from "react-hot-toast";

export function ClientProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SocketProvider>
        {children}
      </SocketProvider>
      <Toaster position="top-right" />
    </>
  );
}
