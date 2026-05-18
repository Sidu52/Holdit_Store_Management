"use client";

import React from "react";
import { SWRConfig } from "swr";

interface SWRProviderProps {
  children: React.ReactNode;
  fallback: Record<string, any>;
}

export function SWRProvider({ children, fallback }: SWRProviderProps) {
  return (
    <SWRConfig value={{ fallback }}>
      {children}
    </SWRConfig>
  );
}
