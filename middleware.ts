import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths (accessible without login)
const publicPaths = ["/login", "/signup", "/complete-profile", "/verify-otp"];

// Regex routes
const loginVerificationRegex = /^\/login\/verification\/[^/]+$/;
const signupVerificationRegex = /^\/signup\/verify\/[^/]+$/;

// Redirect helper
const redirect = (url: string, request: NextRequest) =>
  NextResponse.redirect(new URL(url, request.url));

function decodeStoreJwt(token: string | undefined): { role?: string; exp?: number; auth_id?: string } | null {
  if (!token || typeof token !== "string") return null;
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    const payload = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    const json = atob(payload.padEnd(payload.length + ((4 - (payload.length % 4)) % 4), "="));
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function isValidStoreToken(token: string | undefined): boolean {
  const decoded = decodeStoreJwt(token);
  if (!decoded) return false;
  // Expired?
  if (decoded.exp && decoded.exp * 1000 <= Date.now()) {
    return false;
  }
  // Role must strictly be store or store_owner
  if (decoded.role !== "store" && decoded.role !== "store_owner") {
    return false;
  }
  return true;
}

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const rawToken =
    request.cookies.get("store_accessToken")?.value ||
    request.cookies.get("accessToken")?.value;
  const isAuth = isValidStoreToken(rawToken);

  const isPublicRoute =
    publicPaths.includes(path) ||
    loginVerificationRegex.test(path) ||
    signupVerificationRegex.test(path) ||
    (path === "/qr-code-generator" &&
      process.env.NEXT_PUBLIC_ENV_TYPE === "production");

  if (isAuth) {
    // Prevent access to login/signup/verify after authenticating as store/store_owner
    if (
      path === "/" ||
      path === "/login" ||
      path === "/signup" ||
      path === "/verify-otp" ||
      loginVerificationRegex.test(path) ||
      signupVerificationRegex.test(path)
    ) {
      return redirect("/dashboard", request);
    }
    return NextResponse.next();
  }

  // Not authenticated as store/store_owner
  if (path === "/" || !isPublicRoute) {
    const res = redirect("/login", request);
    if (rawToken && !isAuth) {
      res.cookies.delete("accessToken");
      res.cookies.delete("store_accessToken");
    }
    return res;
  }

  const response = NextResponse.next();
  if (rawToken && !isAuth) {
    response.cookies.delete("accessToken");
    response.cookies.delete("store_accessToken");
  }
  return response;
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/users", "/profile", "/login", "/signup", "/verify-otp", "/complete-profile"],
};

