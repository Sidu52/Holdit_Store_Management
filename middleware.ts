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

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("accessToken")?.value;
  const hasSession = request.cookies.get("hasSession")?.value;
  const isAuthenticated = token || hasSession;

  const isPublicRoute =
    publicPaths.includes(path) ||
    loginVerificationRegex.test(path) ||
    signupVerificationRegex.test(path) ||
    (path === "/qr-code-generator" &&
      process.env.NEXT_PUBLIC_ENV_TYPE === "production");

  if (isAuthenticated) {
    // Prevent access to login/signup/verify after login
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

  if (path === "/") {
    return redirect("/login", request);
  }

  if (!isPublicRoute) {
    return redirect("/login", request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard/:path*", "/users", "/profile", "/login", "/signup", "/verify-otp", "/complete-profile"],
};

