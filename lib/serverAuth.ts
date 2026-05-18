import { cookies } from "next/headers";

/**
 * Helper to retrieve the accessToken cookie value on the server.
 */
export async function getServerToken(): Promise<string | undefined> {
  try {
    const cookieStore = await cookies();
    return cookieStore.get("accessToken")?.value;
  } catch (error) {
    console.error("Error reading cookies on server:", error);
    return undefined;
  }
}

/**
 * Generic helper to perform authorized server-side API fetches from the backend.
 */
export async function fetchServerData<T = any>(endpoint: string, options: RequestInit = {}): Promise<T | null> {
  const token = await getServerToken();
  if (!token) return null;

  const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";
  const cleanEndpoint = endpoint.startsWith("/") ? endpoint : `/${endpoint}`;
  
  try {
    const res = await fetch(`${baseURL}${cleanEndpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
        ...options.headers,
      },
      next: { revalidate: 0, ...options.next }, // Disable static caching by default for dynamic SSR
    });

    if (!res.ok) {
      if (res.status === 401) {
        console.warn(`Unauthorized server fetch for endpoint: ${endpoint}`);
      }
      return null;
    }

    return await res.json();
  } catch (error) {
    console.error(`Error performing server-side fetch for ${endpoint}:`, error);
    return null;
  }
}

/**
 * Specific server helper to fetch the authenticated user profile.
 */
export async function getServerUser() {
  const res = await fetchServerData("/me");
  // The backend wraps data inside { success: true, data: user }
  return res?.data || null;
}
