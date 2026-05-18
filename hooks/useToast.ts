"use client";

import { toast } from "react-hot-toast";

export const useToast = () => {
  return {
    success: (message: string) => {
      toast.success(message);
    },
    error: (message: string) => {
      toast.error(message);
    },
    info: (message: string) => {
      toast(message, {
        icon: 'ℹ️',
      });
    },
    warning: (message: string) => {
      toast(message, {
        icon: '⚠️',
      });
    }
  };
};
