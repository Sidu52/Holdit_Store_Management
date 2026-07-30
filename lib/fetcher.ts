export const fetcher = async (url: string, options: RequestInit = {}) => {
  const baseURL = process.env.NEXT_PUBLIC_API_URL;

  // Clean url if it starts with a slash
  const endpoint = url.startsWith("/") ? url : `/${url}`;

  const response = await fetch(`${baseURL}${endpoint}`, {
    ...options,
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
