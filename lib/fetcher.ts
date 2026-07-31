export const fetcher = async (url: string, options: RequestInit = {}) => {
  // On the client, always use the relative proxy path so cookies stay on the same domain.
  const baseURL =
    typeof window !== "undefined"
      ? "/api/v1"
      : process.env.NEXT_PUBLIC_API_URL || "/api/v1";

  // Clean url if it starts with a slash
  const endpoint = url.startsWith("/") ? url : `/${url}`;

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
    credentials: "include", // Needed for httpOnly cookies
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || "An error occurred while fetching the data.",
    );
  }

  const data = await response.json();

  // If the backend wraps data in a specific format like { success: true, data: [...] }
  if (data && typeof data === "object" && "data" in data) {
    return data.data;
  }

  return data;
};
