import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Public paths (accessible without login)
const publicPaths = ["/login", "/signup", "/Complete Profile"];

// Regex routes
const loginVerificationRegex = /^\/login\/verification\/[^/]+$/;
const signupVerificationRegex = /^\/signup\/verify\/[^/]+$/;

// Redirect helper
const redirect = (url: string, request: NextRequest) =>
  NextResponse.redirect(new URL(url, request.url));

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const token = request.cookies.get("accessToken")?.value;
  const isPublicRoute =
    publicPaths.includes(path) ||
    loginVerificationRegex.test(path) ||
    signupVerificationRegex.test(path) ||
    (path === "/qr-code-generator" &&
      process.env.NEXT_PUBLIC_ENV_TYPE === "production");

  /**
   * ✅ USER IS AUTHENTICATED
   */
  if (token) {
    // Prevent access to login/signup after login
    if (
      path === "/login" ||
      path === "/signup" ||
      loginVerificationRegex.test(path) ||
      signupVerificationRegex.test(path)
    ) {
      return redirect("/dashboard", request);
    }

    return NextResponse.next();
  }

  if (!isPublicRoute) {
    return redirect("/login", request);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/", "/dashboard","/users","/profile", "/login"],
};
