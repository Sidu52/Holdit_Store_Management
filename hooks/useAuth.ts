import useSWR from "swr";
import { authApi } from "../services/authApi";

export const useAuth = () => {
  const { data, error, isLoading, mutate } = useSWR("/me", authApi.getMe, {
    shouldRetryOnError: false,
    revalidateOnFocus: false,
  });

  const user = data?.data;
  const role = user?.role; // "store_owner" | "store" | "user" | "driver"

  return {
    user,
    role,
    isLoading,
    isError: error,
    mutate,
  };
};
