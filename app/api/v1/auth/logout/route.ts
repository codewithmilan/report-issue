import { NextRequest, NextResponse } from "next/server";
import { AUTH_COOKIE_NAME, verifyJwt } from "@/lib/auth/jwt";
import { extractToken, logUserActivity } from "@/lib/auth/middleware";

export async function POST(req: NextRequest) {
  try {
    const token = extractToken(req);
    if (token) {
      const payload = verifyJwt(token);
      if (payload) {
        await logUserActivity(req, {
          userId: payload.id,
          userName: payload.name,
          userEmail: payload.email,
          action: "LOGOUT",
          description: `User logged out: ${payload.email}`,
        });
      }
    }

    const response = NextResponse.json({
      success: true,
      message: "Logged out successfully.",
    });

    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: "",
      httpOnly: true,
      maxAge: 0,
      path: "/",
    });

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Logout failed." },
      { status: 500 }
    );
  }
}

