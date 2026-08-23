"use client";

import useSWR from "swr";
import { useAuth } from "./useAuth";
import { supportApi } from "../services/supportApi";
import type { TicketFilters } from "../types/support";

/**
 * Fetch role-specific FAQ suggestions.
 */
export const useFaqs = () => {
  const { role } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    role ? [`support-faqs`, role] : null,
    ([, r]) => supportApi.getFaqs(r),
    { revalidateOnFocus: false }
  );

  return {
    faqs: data?.data?.faqs || [],
    roleName: data?.data?.role || "",
    isLoading,
    isError: error,
    mutate,
  };
};

/**
 * Fetch paginated ticket list with optional filters.
 */
export const useTickets = (filters: TicketFilters = {}) => {
  const { role } = useAuth();

  const key = role
    ? [`support-tickets`, role, JSON.stringify(filters)]
    : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    ([, r]) => supportApi.getTickets(r, filters),
    { revalidateOnFocus: false }
  );

  return {
    tickets: data?.data?.tickets || [],
    pagination: data?.data?.pagination || null,
    isLoading,
    isError: error,
    mutate,
  };
};

/**
 * Fetch a single ticket's detail including full message thread.
 */
export const useTicketDetail = (ticketId: string | null) => {
  const { role } = useAuth();

  const { data, error, isLoading, mutate } = useSWR(
    role && ticketId ? [`support-ticket`, role, ticketId] : null,
    ([, r, id]) => supportApi.getTicketById(r, id),
    { revalidateOnFocus: false }
  );

  return {
    ticket: data?.data || null,
    isLoading,
    isError: error,
    mutate,
  };
};
