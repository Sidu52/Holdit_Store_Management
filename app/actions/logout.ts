"use server";

import { cookies } from "next/headers";

/**
 * Server Action to securely delete authentication cookies on the server
 * and notify the backend to invalidate the active Redis tokens.
 */
export async function serverLogout(role: string) {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value;
  
  if (token) {
    const backendOrigin = process.env.BACKEND_URL || "http://localhost:5000";
    const baseURL = process.env.NEXT_PUBLIC_API_URL || `${backendOrigin}/api/v1`;
    const logoutEndpoint = role === "store_owner" 
      ? "/store-owner/auth/logout" 
      : "/store/auth/logout";
      
    try {
      await fetch(`${baseURL}${logoutEndpoint}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
    } catch (err) {
      console.error("Failed to notify backend on logout:", err);
    }
  }

  // Delete cookies from the client browser
  cookieStore.delete("accessToken");
  cookieStore.delete("refreshToken");

  return { success: true };
}
