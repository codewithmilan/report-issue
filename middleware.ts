import { NextResponse, type NextRequest } from "next/server";

const AUTH_COOKIE_NAME = "civic_auth_token";

interface TokenPayload {
  id?: string;
  email?: string;
  role?: "admin" | "user";
  name?: string;
  exp?: number;
}

function parseJwt(token: string): TokenPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length < 2) return null;
    let base64 = parts[1].replace(/-/g, "+").replace(/_/g, "/");
    while (base64.length % 4) {
      base64 += "=";
    }
    const jsonStr = atob(base64);
    const payload = JSON.parse(jsonStr);
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Ignore static assets, images, icons, and API routes (APIs handle their own auth responses)
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.includes(".") ||
    pathname === "/favicon.ico"
  ) {
    return NextResponse.next();
  }

  const tokenCookie = request.cookies.get(AUTH_COOKIE_NAME)?.value;
  const user = tokenCookie ? parseJwt(tokenCookie) : null;

  const isAdminRoute = pathname.startsWith("/admin") && pathname !== "/admin/login";
  const isUserRoute =
    pathname.startsWith("/user") ||
    pathname === "/dashboard" ||
    pathname === "/report";
  const isAuthRoute =
    pathname === "/login" ||
    pathname === "/register" ||
    pathname.startsWith("/auth/login") ||
    pathname.startsWith("/auth/signup") ||
    pathname === "/admin/login";

  // 1. If trying to access protected routes without valid auth -> Redirect to Login
  if (!user && (isAdminRoute || isUserRoute)) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    const response = NextResponse.redirect(loginUrl);
    if (tokenCookie) {
      // Clear expired or corrupted cookie
      response.cookies.delete(AUTH_COOKIE_NAME);
    }
    return response;
  }

  // 2. If logged in and visiting auth pages (login/register) -> Redirect to appropriate dashboard
  if (user && isAuthRoute) {
    if (user.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    } else {
      return NextResponse.redirect(new URL("/user/dashboard", request.url));
    }
  }

  // 3. RBAC Enforcement: Normal user trying to access ANY admin route -> Redirect to User Dashboard
  if (user && isAdminRoute && user.role !== "admin") {
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  // 4. Convenience route alias: /dashboard -> /user/dashboard, /admin -> /admin/dashboard
  if (pathname === "/admin") {
    return NextResponse.redirect(new URL("/admin/dashboard", request.url));
  }
  if (pathname === "/dashboard") {
    if (user?.role === "admin") {
      return NextResponse.redirect(new URL("/admin/dashboard", request.url));
    }
    return NextResponse.redirect(new URL("/user/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
