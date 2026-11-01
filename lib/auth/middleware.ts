import { NextRequest, NextResponse } from "next/server";
import { verifyJwt, AUTH_COOKIE_NAME, JWTPayload } from "./jwt";
import { UserRepo, ActivityRepo } from "@/lib/db";
import { IUser } from "@/lib/db/schemas";

export interface AuthResult {
  user?: IUser;
  error?: string;
  status?: number;
}

export function getClientInfo(req: Request | NextRequest) {
  const forwarded = req.headers.get("x-forwarded-for");
  const ip = forwarded ? forwarded.split(",")[0].trim() : "127.0.0.1";
  const userAgent = req.headers.get("user-agent") || "Unknown Device";
  return { ip, userAgent };
}

export function extractToken(req: Request | NextRequest): string | null {
  // 1. Check Authorization Bearer header
  const authHeader = req.headers.get("authorization");
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7).trim();
  }

  // 2. Check Cookie header
  const cookieHeader = req.headers.get("cookie");
  if (cookieHeader) {
    const cookies = cookieHeader.split(";").map((c) => c.trim());
    for (const c of cookies) {
      const [name, ...val] = c.split("=");
      if (name.trim() === AUTH_COOKIE_NAME) {
        return decodeURIComponent(val.join("="));
      }
    }
  }

  return null;
}

/**
 * Authenticates user from JWT token in header or cookie.
 * Validates against database, checks for account suspension.
 */
export async function authenticateUser(req: Request | NextRequest): Promise<AuthResult> {
  const token = extractToken(req);

  if (!token) {
    return {
      error: "Authentication required. Please log in to continue.",
      status: 401,
    };
  }

  const payload = verifyJwt(token);
  if (!payload || !payload.id) {
    return {
      error: "Invalid or expired authentication session. Please log in again.",
      status: 401,
    };
  }

  const user = await UserRepo.findById(payload.id);
  if (!user) {
    return {
      error: "User account no longer exists.",
      status: 401,
    };
  }

  // Check account suspension (Rule 12: Suspended user attempting login/API -> Access denied)
  if (user.status === "suspended") {
    return {
      error: "Access Denied: Your account has been suspended by an administrator.",
      status: 403,
    };
  }

  if (user.status === "inactive") {
    return {
      error: "Access Denied: Your account is currently inactive. Contact support.",
      status: 403,
    };
  }

  return { user };
}

/**
 * Ensures authenticated user has one of the specified roles.
 */
export function authorizeRoles(user: IUser, ...allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

/**
 * Authenticates request and verifies admin role.
 */
export async function verifyAdmin(req: Request | NextRequest): Promise<AuthResult> {
  const auth = await authenticateUser(req);
  if (auth.error || !auth.user) {
    return auth;
  }

  if (auth.user.role !== "admin") {
    return {
      error: "Forbidden: Administrator privileges are required to access this resource.",
      status: 403,
    };
  }

  return auth;
}

/**
 * Authenticates request and ensures user is admin OR the owner of the resource.
 */
export async function verifyUserOwnership(
  req: Request | NextRequest,
  targetUserId: string
): Promise<AuthResult> {
  const auth = await authenticateUser(req);
  if (auth.error || !auth.user) {
    return auth;
  }

  const isOwner = String(auth.user._id) === String(targetUserId);
  const isAdmin = auth.user.role === "admin";

  if (!isOwner && !isAdmin) {
    return {
      error: "Forbidden: You are not authorized to view or modify this user's data.",
      status: 403,
    };
  }

  return auth;
}

/**
 * Helper to log an activity with auto-extracted IP and User-Agent
 */
export async function logUserActivity(
  req: Request | NextRequest,
  data: {
    userId?: string;
    userName?: string;
    userEmail?: string;
    action: string;
    description: string;
  }
) {
  const { ip, userAgent } = getClientInfo(req);
  return await ActivityRepo.log({
    ...data,
    ipAddress: ip,
    userAgent,
  });
}

